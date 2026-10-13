<template>
  <q-page v-if="project.doc && block" class="editor column no-wrap" :style-fn="fill">
    <div
      class="row items-center no-wrap q-px-sm bar"
      :class="{ reverse: appSettings.settings.sidesSwapped }"
    >
      <q-tabs v-model="editor.blockMode" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab v-if="!anyBlock?.colorVariant" name="draw" icon="draw" label="Draw" />
        <q-tab name="color" icon="palette" label="Color" />
        <q-tab name="print" icon="print" label="Print" />
      </q-tabs>
      <HelpLink v-bind="BLOCK_HELP[editor.blockMode] ?? BLOCK_HELP.draw!" />
      <q-btn
        flat
        round
        dense
        icon="menu"
        :aria-label="sidebarLabel"
        @click="editor.sidebar = !editor.sidebar"
      >
        <q-tooltip>{{ sidebarLabel }}</q-tooltip>
      </q-btn>
    </div>

    <div
      class="row col no-wrap"
      :class="{ reverse: appSettings.settings.sidesSwapped }"
      style="min-height: 0; position: relative"
    >
      <!-- Toolbar: undo, and (Draw/Color) tools -->
      <div class="rail column no-wrap q-pa-xs" style="gap: 4px">
        <q-btn
          flat
          dense
          icon="undo"
          aria-label="Undo"
          :disable="!project.canUndo"
          @click="project.undo()"
        >
          <q-tooltip anchor="center right" self="center left">Undo (Ctrl+Z)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          icon="redo"
          aria-label="Redo"
          :disable="!project.canRedo"
          @click="project.redo()"
        >
          <q-tooltip anchor="center right" self="center left">Redo (Ctrl+Shift+Z)</q-tooltip>
        </q-btn>
        <template v-if="editor.blockMode === 'print'">
          <q-separator />
          <PrintZoom />
        </template>
        <template v-if="editor.blockMode === 'draw' || editor.blockMode === 'color'">
          <q-separator />
          <q-btn
            v-for="t in tools"
            :key="t.id"
            :flat="editor.blockTool !== t.id"
            :unelevated="editor.blockTool === t.id"
            :color="editor.blockTool === t.id ? 'primary' : undefined"
            dense
            :icon="t.icon"
            :aria-label="t.label"
            :disable="project.readOnly && !['pan', 'select', 'eyedropper'].includes(t.id)"
            @click="editor.blockTool = t.id"
          >
            <q-tooltip anchor="center right" self="center left">{{ t.label }}</q-tooltip>
          </q-btn>
        </template>
      </div>

      <PrintPreview
        v-if="editor.blockMode === 'print'"
        kind="block"
        :id="block.id"
        :target="printTarget"
      />
      <div v-else class="col relative-position">
        <BlockCanvas
          v-model:view="view"
          v-model:selection="selection"
          :doc="project.doc"
          :block="block"
          :coloring-id="coloringId"
          :settings="settings"
          :unconnected="unconnected"
          :readonly="project.readOnly"
          @drawing="applyDrawing"
          @patch="onPatch"
          @pointer="(i) => (pointer = i)"
        />
        <div class="readout q-pa-xs text-caption">
          {{ fmt(block.size[0]) }} × {{ fmt(block.size[1]) }} {{ units }}
          <span v-if="pointer"> · {{ fmt(pointer.p[0]) }}, {{ fmt(pointer.p[1]) }}</span>
          <span v-if="pointer?.length"> · length {{ fmt(pointer.length) }}</span>
        </div>
      </div>

      <div v-show="editor.sidebar" class="inspector q-pa-md scroll">
        <PrintOptions
          v-if="editor.blockMode === 'print'"
          kind="block"
          :id="block.id"
          :coloring-id="coloringId"
          @target="(t) => (printTarget = t)"
        />
        <DetailsPanel v-else-if="editor.blockMode === 'details'" kind="block" :id="block.id" />
        <BlockInspector
          v-else-if="editor.blockMode === 'draw'"
          :block="block"
          :settings="settings"
          :selection="selection"
          :tool="editor.blockTool"
          :units="units"
          :readonly="project.readOnly"
          @rename="rename"
          @resize="resize"
          @settings="saveSettings"
          @op="onOp"
        />
        <div v-else class="column">
          <q-expansion-item
            :model-value="open('Colorings')"
            dense
            label="Colorings"
            header-class="text-subtitle2"
            @update:model-value="(v) => setOpen('Colorings', v)"
          >
            <div class="column q-pb-md" style="gap: 8px">
              <div class="row" style="gap: 8px">
                <button
                  v-for="(c, i) in block.colorings"
                  :key="c.id"
                  class="coloring"
                  :class="{ active: c.id === coloringId }"
                  @click="pickColoring(c.id)"
                >
                  <img
                    :src="blockThumbnail(project.doc, block, 72, $q.dark.isActive, c.id)"
                    :alt="c.name ?? `Coloring ${i + 1}`"
                  />
                  <div class="text-caption ellipsis">{{ c.name ?? `Coloring ${i + 1}` }}</div>
                </button>
              </div>
              <div v-if="!project.readOnly" class="row" style="gap: 6px">
                <q-btn
                  dense
                  outline
                  no-caps
                  icon="add"
                  label="Save as new coloring"
                  @click="saveAsNew"
                />
                <q-btn
                  dense
                  flat
                  no-caps
                  icon="edit"
                  label="Rename"
                  @click="renameColoringPrompt"
                />
                <q-btn
                  dense
                  flat
                  no-caps
                  color="negative"
                  icon="delete"
                  label="Delete"
                  :disable="block.colorings.length < 2"
                  @click="removeColoring"
                />
              </div>
            </div>
          </q-expansion-item>
          <q-expansion-item
            :model-value="open('Colors')"
            dense
            label="Colors"
            header-class="text-subtitle2"
            @update:model-value="(v) => setOpen('Colors', v)"
          >
            <PaletteTray colors-only sidebar />
          </q-expansion-item>
          <div class="text-caption text-grey-7">
            Paint taps a patch; Spray recolors every patch of the same color; Eyedropper picks one
            up.
          </div>
        </div>
      </div>
    </div>
  </q-page>
  <q-page v-else-if="project.doc && notSeam" padding class="text-grey-7"
    >This kind of block can't be edited yet.</q-page
  >
</template>

<script setup lang="ts">
import { produce } from 'immer';
import HelpLink from '@/components/HelpLink.vue';
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BlockCanvas from '@/components/BlockCanvas.vue';
import BlockInspector from '@/components/BlockInspector.vue';
import DetailsPanel from '@/components/DetailsPanel.vue';
import PaletteTray from '@/components/PaletteTray.vue';
import PrintOptions from '@/components/PrintOptions.vue';
import PrintPreview from '@/components/PrintPreview.vue';
import PrintZoom from '@/components/PrintZoom.vue';
import type { PrintTarget } from '@/model/print/prefs';
import {
  deleteColoring,
  editorSettings,
  markDerived,
  renameColoring,
  saveColoringAs,
  type BlockEditorSettings,
  type SelectionOp,
} from '@/editor/block-ops';
import { detachColoring, fillKey } from '@/model/coloring';
import {
  addNodes,
  cloneSegments,
  deleteSegments,
  segGeom,
  toGuides,
  transformSegments,
  transforms,
} from '@/editor/draw-ops';
import { applySeamEdit } from '@/model/blocks/edit';
import { usePaletteOffer } from '@/composables/palette-offer';
import { isLibraryItem } from '@/model/library-items';
import type { Pt } from '@/model/geometry/path';
import type { Block, Drawing } from '@/model/schema/block';
import type { RrqDoc } from '@/model/schema/project';
import type { View } from '@/render/draw';
import { blockThumbnail } from '@/render/thumbnail';
import { useEditorStore, type BlockTool } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const $q = useQuasar();
const appSettings = useSettingsStore();
// Color tab sections: open/closed remembered app-wide.
const open = (label: string) => !appSettings.settings.collapsedSections.includes(`color:${label}`);
function setOpen(label: string, value: boolean) {
  const key = `color:${label}`;
  const rest = appSettings.settings.collapsedSections.filter((l) => l !== key);
  appSettings.settings.collapsedSections = value ? rest : [...rest, key];
}
const printTarget = ref<PrintTarget>({});
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const editor = useEditorStore();
// Sidebar opens with each editor (hiding it isn't remembered).
// Open on arrival, except on phones/portrait tablets, where it slides over the canvas.
editor.sidebar = !$q.screen.lt.md;
// Details lives in the sidebar, so it opens whenever that tab is shown.
watch(
  () => editor.blockMode,
  (m) => m === 'details' && (editor.sidebar = true),
  { immediate: true },
);
const fill = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });

const anyBlock = computed(() => project.doc?.project.blocks.find((b) => b.id === route.params.id));
const block = computed(() => (anyBlock.value?.kind === 'seam' ? anyBlock.value : undefined));
const notSeam = computed(() => !!anyBlock.value && !block.value);
watch(
  anyBlock,
  (b) => {
    if (project.doc && !b) void router.replace('/project');
    // Library blocks are read-only (spec 008): "Edit" in the sketchbook makes your copy.
    if (b && isLibraryItem(b)) {
      $q.notify({
        message: 'Library blocks are read-only. Use Edit in the sketchbook to make your copy.',
      });
      void router.replace('/project');
    }
  },
  { immediate: true },
);

// Color variants keep their library block's drawing.
watchEffect(() => {
  if (anyBlock.value?.colorVariant && editor.blockMode === 'draw') editor.blockMode = 'color';
});
const offerPalette = usePaletteOffer();
/** The Help topic for each editor tab. */
const BLOCK_HELP: Record<string, { topic: string; label: string }> = {
  details: { topic: 'guides/drawing-blocks', label: 'Drawing blocks' },
  draw: { topic: 'guides/drawing-blocks', label: 'Drawing blocks' },
  color: { topic: 'guides/block-colorings', label: 'Block colorings' },
  print: { topic: 'guides/printing', label: 'Printing' },
};
function pickColoring(id: string) {
  editor.coloringOf.set(block.value!.id, id);
  offerPalette(block.value!, id);
}
const units = computed(() => project.doc?.units ?? 'in');
const settings = computed(() => editorSettings(block.value!, units.value));
const unconnected = computed(() => new Set(block.value?.unconnected ?? []));
const selection = ref(new Set<string>());
const pointer = ref<{ p: Pt; length: number | null } | null>(null);
const coloringId = computed(() => {
  const b = block.value;
  const chosen = b && editor.coloringOf.get(b.id);
  return b?.colorings.some((c) => c.id === chosen) ? chosen! : b?.colorings[0]?.id;
});
const view = computed<View | undefined>({
  get: () => (block.value ? editor.views.get(`block:${block.value.id}`) : undefined),
  set: (v) => {
    if (block.value && v) editor.views.set(`block:${block.value.id}`, v);
  },
});

const DRAW_TOOLS: { id: BlockTool; icon: string; label: string }[] = [
  { id: 'select', icon: 'near_me', label: 'Select seams' },
  { id: 'node', icon: 'scatter_plot', label: 'Edit nodes' },
  { id: 'line', icon: 'horizontal_rule', label: 'Line' },
  { id: 'arc', icon: 'architecture', label: 'Arc' },
  { id: 'grid', icon: 'grid_4x4', label: 'Grid' },
  { id: 'pan', icon: 'pan_tool', label: 'Pan' },
];
const COLOR_TOOLS: { id: BlockTool; icon: string; label: string }[] = [
  { id: 'paint', icon: 'brush', label: 'Paint' },
  { id: 'spray', icon: 'format_color_fill', label: 'Spray (same color)' },
  { id: 'eyedropper', icon: 'colorize', label: 'Eyedropper' },
  { id: 'pan', icon: 'pan_tool', label: 'Pan' },
];
const tools = computed(() => (editor.blockMode === 'color' ? COLOR_TOOLS : DRAW_TOOLS));
watch(
  () => editor.blockMode,
  (m) => {
    const ids = (m === 'color' ? COLOR_TOOLS : DRAW_TOOLS).map((t) => t.id);
    if (!ids.includes(editor.blockTool)) editor.blockTool = m === 'color' ? 'paint' : 'line';
  },
  { immediate: true },
);

const sidebarLabel = computed(() => (editor.sidebar ? 'Hide sidebar' : 'Show sidebar'));
const fmt = (n: number) => `${Number(n.toFixed(3))}`;

/** Replace this block in a document copy. */
const withBlock = (doc: RrqDoc, fn: (b: Block) => Block): RrqDoc =>
  produce(doc, (d) => {
    const i = d.project.blocks.findIndex((b) => b.id === block.value!.id);
    d.project.blocks[i] = fn(d.project.blocks[i] as Block);
  });

/** A drawing change: re-derive patches (stable ids, inherited fills) and mark library items derived. */
function applyDrawing(drawing: Drawing, editorPatch?: Partial<BlockEditorSettings>) {
  const id = block.value!.id;
  const nextEditor = editorPatch && { ...settings.value, ...editorPatch };
  project.change(() => {
    const r = applySeamEdit(project.doc!, id, drawing);
    return withBlock(r.doc, (b) =>
      markDerived(
        nextEditor ? { ...b, editor: nextEditor } : b,
        appSettings.settings.author,
        project.doc!.project.license,
      ),
    );
  });
  const live = new Set(drawing.segments.map((s) => s.id));
  selection.value = new Set([...selection.value].filter((s) => live.has(s)));
}

function rename(name: string) {
  if (name.trim())
    project.change(
      (d) => void (d.project.blocks.find((b) => b.id === block.value!.id)!.notecard.name = name),
      { coalesce: 'block-name' },
    );
}

function resize(size: [number, number]) {
  const id = block.value!.id;
  const curved = block.value!.drawing.segments.some((s) => s.kind !== 'line');
  const before = block.value!.size;
  project.change(
    () => {
      const sized = produce(project.doc!, (d) => {
        const b = d.project.blocks.find((x) => x.id === id)!;
        b.size = size;
      });
      return applySeamEdit(sized, id, block.value!.drawing).doc;
    },
    { coalesce: 'block-size' },
  );
  if (curved && before[0] / before[1] !== size[0] / size[1]) {
    $q.notify({
      message: 'Curved seams change shape when the block’s proportions change.',
      timeout: 2500,
    });
  }
}

function saveSettings(patch: Partial<BlockEditorSettings>) {
  const id = block.value!.id;
  const next = { ...settings.value, ...patch };
  project.change(
    (d) => {
      const b = d.project.blocks.find((x) => x.id === id)!;
      b.editor = next;
    },
    { coalesce: 'block-settings' },
  );
}

function onOp(op: SelectionOp) {
  const d = block.value!.drawing;
  const size = block.value!.size;
  const ids = selection.value;
  const center = (): Pt => {
    if (('about' in op && op.about === 'block') || !ids.size) return [size[0] / 2, size[1] / 2];
    const pts = d.segments
      .filter((s) => ids.has(s.id))
      .flatMap((s) => {
        const g = segGeom(d, s, size);
        return [g.a, g.b];
      });
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  };
  if (op.kind === 'delete') applyDrawing(deleteSegments(d, ids));
  else if (op.kind === 'clone') {
    const step =
      settings.value.snap.mode === 'step'
        ? settings.value.snap.step
        : size[0] / settings.value.snap.divisions[0];
    const r = cloneSegments(d, ids, step / size[0], step / size[1]);
    applyDrawing(r.drawing);
    selection.value = r.ids;
  } else if (op.kind === 'guides') {
    const r = toGuides(d, ids);
    // One undo step for both the seams removed and the guides added.
    applyDrawing(r.drawing, { guides: [...settings.value.guides, ...r.guides] });
  } else if (op.kind === 'rotate')
    applyDrawing(transformSegments(d, ids, transforms.rotate(op.deg, center()), size));
  else if (op.kind === 'flip')
    applyDrawing(transformSegments(d, ids, transforms.flip(op.axis, center()), size));
  else if (op.kind === 'resize') {
    const k = op.pct / 100;
    applyDrawing(transformSegments(d, ids, transforms.scale(k, k, center()), size));
  } else if (op.kind === 'nodes') applyDrawing(addNodes(d, ids, op.mode, size));
}

// --- Color mode ---
function onPatch(patchId: string) {
  const b = block.value!;
  const cid = coloringId.value!;
  const current = b.colorings.find((c) => c.id === cid)?.fills[patchId];
  if (editor.blockTool === 'eyedropper') {
    if (current && 'color' in current) editor.useColor(current.color);
    return;
  }
  if (!editor.color) {
    $q.notify({ message: 'Pick a color in the tray first.', timeout: 1500 });
    return;
  }
  const fill = { color: editor.color };
  project.change((d) => {
    const c = d.project.blocks.find((x) => x.id === b.id)!.colorings.find((x) => x.id === cid)!;
    if (editor.blockTool === 'paint') c.fills[patchId] = fill;
    else {
      const key = fillKey(current);
      for (const p of b.patches.map((x) => x.id))
        if (fillKey(c.fills[p]) === key) c.fills[p] = fill;
    }
  });
}

function saveAsNew() {
  const r = saveColoringAs(block.value!, coloringId.value!);
  project.change(() => withBlock(project.doc!, () => r.block));
  editor.coloringOf.set(block.value!.id, r.id);
}
function renameColoringPrompt() {
  const c = block.value!.colorings.find((x) => x.id === coloringId.value);
  $q.dialog({
    title: 'Rename coloring',
    prompt: { model: c?.name ?? '', type: 'text' },
    cancel: true,
  }).onOk((name: string) => {
    if (name.trim())
      project.change(() =>
        withBlock(project.doc!, (b) => renameColoring(b, coloringId.value!, name.trim())),
      );
  });
}
function removeColoring() {
  const id = coloringId.value!;
  const blockId = block.value!.id;
  // Quilts following this coloring keep its colors as their own.
  project.change(() =>
    withBlock(detachColoring(project.doc!, blockId, id), (b) => deleteColoring(b, id)),
  );
  editor.coloringOf.delete(block.value!.id);
}

// --- Keyboard ---
function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement | null)?.closest('input, textarea')) return;
  if (!block.value || project.readOnly || editor.blockMode !== 'draw') return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && selection.value.size) {
    e.preventDefault();
    onOp({ kind: 'delete' });
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    editor.blockTool = 'select';
    selection.value = new Set(block.value.drawing.segments.map((s) => s.id));
  } else if (e.key === 'Escape') selection.value = new Set();
  else if (e.key === ' ' && editor.blockTool === 'arc') {
    e.preventDefault();
    editor.arcSign = editor.arcSign === 1 ? -1 : 1;
  }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.editor {
  overflow: hidden;
  min-width: 0;
}
.bar {
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
  min-width: 0;
}
.rail {
  overflow-y: auto;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
.inspector {
  width: 340px;
  flex: none;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
}
.reverse > .rail {
  border-right: none;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
}
.reverse > .inspector {
  border-left: none;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
/* Phones and portrait tablets: the sidebar slides over the canvas (opening it keeps the view). */
@media (max-width: 1023px) {
  .inspector {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: min(320px, 85vw);
    z-index: 5;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.25);
  }
  .reverse > .inspector {
    right: auto;
    left: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  }
  :global(.body--dark) .inspector {
    background: var(--q-dark-page);
  }
}
.readout {
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: rgba(255, 255, 255, 0.85);
  color: #222;
  border-radius: 4px;
}
.coloring {
  width: 80px;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
}
.coloring img {
  display: block;
  width: 72px;
  height: 72px;
}
.coloring.active {
  border-color: var(--q-primary);
}
</style>
