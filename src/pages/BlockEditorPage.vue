<template>
  <q-page v-if="project.doc && block" class="editor column no-wrap" :style-fn="fill">
    <div
      class="row items-center no-wrap q-px-sm bar"
      :class="{ reverse: appSettings.settings.sidesSwapped }"
    >
      <q-tabs v-model="editor.blockMode" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab
          v-if="!anyBlock?.colorVariant && !libraryView"
          name="draw"
          icon="draw"
          label="Draw"
        />
        <q-tab v-if="!libraryView" name="color" icon="palette" label="Color" />
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
    <!-- A library block opens read-only (spec 008): change it through your own copy or variant. -->
    <q-banner v-if="libraryView && !project.readOnly" dense class="lib-banner">
      <template #avatar><q-icon name="lock" /></template>
      {{ anyBlock!.notecard.name }} is a library block, so it opens read-only.
      <template #action>
        <q-btn
          flat
          dense
          no-caps
          icon="palette"
          label="Create a coloration variant"
          @click="colorVariant(block)"
        />
        <q-btn
          flat
          dense
          no-caps
          icon="content_copy"
          label="Edit (make a copy)"
          @click="editLibrary(block)"
        />
      </template>
    </q-banner>

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
            :disable="ro && !['pan', 'select', 'eyedropper'].includes(t.id)"
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
        :doc="viewDoc"
        :target="printTarget"
      />
      <div v-else class="col relative-position">
        <BlockCanvas
          v-model:view="view"
          v-model:selection="selection"
          :doc="viewDoc"
          :block="block"
          :coloring-id="coloringId"
          :settings="settings"
          :unconnected="unconnected"
          :readonly="ro"
          @drawing="applyDrawing"
          @patch="onPatch"
          @numeral="(p, n) => numeralPatch(p, n)"
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
          :doc="viewDoc"
          :coloring-id="coloringId"
          @target="(t) => (printTarget = t)"
        />
        <DetailsPanel
          v-else-if="editor.blockMode === 'details'"
          kind="block"
          :id="block.id"
          :doc="viewDoc"
        />
        <DataVariants
          v-if="
            (stored?.data?.kind === 'month' || stored?.data?.kind === 'week') &&
            (editor.blockMode === 'draw' || editor.blockMode === 'color')
          "
          :block="stored!"
          :readonly="ro"
          class="q-mb-md"
        />
        <BlockInspector
          v-if="editor.blockMode === 'draw'"
          :block="block"
          :settings="settings"
          :selection="selection"
          :tool="editor.blockTool"
          :units="units"
          :readonly="ro"
          @rename="rename"
          @resize="resize"
          @settings="saveSettings"
          @op="onOp"
        />
        <div v-else-if="editor.blockMode === 'color'" class="column">
          <q-expansion-item
            :model-value="open('Colorings')"
            dense
            label="Colorings"
            header-class="text-subtitle2"
            @update:model-value="(v) => setOpen('Colorings', v)"
          >
            <div class="column q-pb-md" style="gap: 8px">
              <template v-for="g in coloringGroups" :key="g.label">
                <div v-if="g.label" class="text-caption text-grey-7">
                  {{ g.label }}
                  <div v-if="'note' in g" class="text-italic">{{ g.note }}</div>
                </div>
                <div class="row" style="gap: 8px">
                  <div v-for="{ c, i } in g.items" :key="c.id" class="column items-center">
                    <button
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
                    <!-- Each coloring's own Rename and Delete (a library's colorings have neither). -->
                    <div v-if="!ro && !isLibraryColoring(c.id)" class="row no-wrap">
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="edit"
                        :aria-label="`Rename ${c.name ?? `Coloring ${i + 1}`}`"
                        @click="renameColoringPrompt(c.id)"
                      >
                        <q-tooltip>Rename</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="delete"
                        color="negative"
                        :disable="block.colorings.length < 2"
                        :aria-label="`Delete ${c.name ?? `Coloring ${i + 1}`}`"
                        @click="removeColoring(c.id)"
                      >
                        <q-tooltip>Delete</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </template>
              <div v-if="!ro" class="row" style="gap: 6px">
                <q-btn
                  dense
                  outline
                  no-caps
                  icon="add"
                  label="Save as new coloring"
                  @click="saveAsNew"
                />
              </div>
            </div>
          </q-expansion-item>
          <q-expansion-item
            v-if="stored?.data"
            :model-value="open('Day numerals')"
            dense
            label="Day numerals"
            header-class="text-subtitle2"
            @update:model-value="(v) => setOpen('Day numerals', v)"
          >
            <DataNumerals
              :fills="shownFills"
              :patches="block.patches.map((p) => p.id)"
              :count="numeralCount"
              :readonly="ro"
              @clear="clearAllNumerals"
            />
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
import { castDraft, produce } from 'immer';
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
import { clearNumerals, putNumeral } from '@/model/data-paint';
import DataNumerals from '@/components/DataNumerals.vue';
import DataVariants from '@/components/DataVariants.vue';
import { KIND_DAYS } from '@/model/data-quilt';
import { fillFor, paintOf } from '@/editor/paint';
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
import { isLibraryItem, projectColorings, toUnits } from '@/model/library-items';
import { useLibraryBlockActions } from '@/composables/library-block-actions';
import type { Pt } from '@/model/geometry/path';
import type { Block, Drawing } from '@/model/schema/block';
import type { RrqDoc } from '@/model/schema/project';
import type { View } from '@/render/draw';
import { blockThumbnail } from '@/render/thumbnail';
import { useEditorStore, type BlockTool } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
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
const library = useLibraryStore();
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

/** A library block that isn't in the project (opened from the sketchbook's or Libraries' library
 *  blocks): shown read-only, in the project's units, as if it were. */
const libBlock = computed(() => {
  const doc = project.doc;
  if (!doc || doc.project.blocks.some((b) => b.id === route.params.id)) return undefined;
  const b = library.allViews.flatMap((v) => v.blocks).find((x) => x.id === route.params.id);
  return b && toUnits(b, doc.units);
});
const anyBlock = computed(
  () => project.doc?.project.blocks.find((b) => b.id === route.params.id) ?? libBlock.value,
);
/** The project, with the library block in it when it isn't (never saved: views only). */
const viewDoc = computed(() => {
  const doc = project.doc!;
  const b = libBlock.value;
  return b ? { ...doc, project: { ...doc.project, blocks: [...doc.project.blocks, b] } } : doc;
});
const libraryView = computed(() => !!anyBlock.value && isLibraryItem(anyBlock.value));
const ro = computed(() => project.readOnly || libraryView.value);
const { editLibrary, colorVariant } = useLibraryBlockActions();
const stored = computed(() => (anyBlock.value?.kind === 'seam' ? anyBlock.value : undefined));
/** A month data block's picked variant (spec 025), when it has it. */
const variantDays = computed(() =>
  stored.value?.data?.variants?.some((v) => v.days === editor.blockVariant)
    ? editor.blockVariant!
    : undefined,
);
/** The block as shown and edited: a variant's drawing in place of its own when one is picked. */
const block = computed(() => {
  const b = stored.value;
  const v = b && b.data?.variants?.find((x) => x.days === variantDays.value);
  if (!b || !v) return b;
  const { unconnected: _u, ...rest } = b;
  void _u;
  return {
    ...rest,
    drawing: v.drawing,
    patches: v.patches,
    ...(v.unconnected ? { unconnected: v.unconnected } : {}),
  };
});
/** Numerals the shown drawing takes: its variant's days, else its kind's. */
const numeralCount = computed(
  () => variantDays.value ?? KIND_DAYS[stored.value?.data?.kind ?? 'month'],
);
watch(
  () => stored.value?.id,
  () => (editor.blockVariant = null),
);
const notSeam = computed(() => !!anyBlock.value && !stored.value);
watch(
  anyBlock,
  (b) => {
    if (project.doc && !b) void router.replace('/project');
  },
  { immediate: true },
);

// Color variants keep their library block's drawing; a library block's isn't drawn here either.
watchEffect(() => {
  // A library block: Details and Print only (the banner's buttons make one you can change).
  if (libraryView.value && (editor.blockMode === 'draw' || editor.blockMode === 'color'))
    editor.blockMode = 'details';
  else if (anyBlock.value?.colorVariant && editor.blockMode === 'draw') editor.blockMode = 'color';
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
/** A color variant's colorings: the project's own (new or changed) above the ones still as the
 *  library block has them. */
const coloringGroups = computed(() => {
  const b = block.value;
  if (!b) return [];
  const items = b.colorings.map((c, i) => ({ c, i }));
  const v = projectColorings(b, library.lookup);
  if (!v) return [{ label: '', items }];
  const own = (x: (typeof items)[number]) => v.own.includes(x.c);
  const name = v.origin.notecard.name;
  return [
    { label: `Project colorings of ${name}`, items: items.filter(own) },
    {
      label: `Library colorings of ${name}`,
      note: 'Read-only: painting one starts a project copy.',
      items: items.filter((x) => !own(x)),
    },
  ].filter((g) => g.items.length);
});
/** The selected coloring is a color variant's untouched library coloring (read-only). */
/** A color variant's colorings from its library block: read-only (spec 008 US7). */
const isLibraryColoring = (id: string) => {
  const v = block.value && projectColorings(block.value, library.lookup);
  return !!v && !v.own.some((c) => c.id === id);
};
const coloringId = computed(() => {
  const b = block.value;
  const chosen = b && editor.coloringOf.get(b.id);
  if (!b) return undefined;
  if (b.colorings.some((c) => c.id === chosen)) return chosen!;
  // A color variant opens on its first project coloring, as its card shows it.
  return projectColorings(b, library.lookup)?.own[0]?.id ?? b.colorings[0]?.id;
});
/** The shown coloring's fills (for the Data places panel's next number). */
const shownFills = computed(
  () => block.value?.colorings.find((c) => c.id === coloringId.value)?.fills ?? {},
);
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
    const r = applySeamEdit(project.doc!, id, drawing, variantDays.value);
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
      // Every drawing of a data block (its own and its variants) re-derives at the new size.
      let out = applySeamEdit(sized, id, stored.value!.drawing).doc;
      for (const v of stored.value!.data?.variants ?? [])
        out = applySeamEdit(out, id, v.drawing, v.days).doc;
      return out;
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
    if (current && 'data' in current) {
      // A numeral: pick it up with its value.
      Object.assign(editor.data, {
        on: true,
        numeral: current.data.n,
        slot: current.data.slot ?? 0,
      });
      return;
    }
    const paint = paintOf(current);
    if (paint) editor.useColor(paint);
    return;
  }
  if (editor.data.on && stored.value?.data) return numeralPatch(patchId, editor.data.numeral, true);
  if (!editor.color) {
    $q.notify({ message: 'Pick a color in the tray first.', timeout: 1500 });
    return;
  }
  const fill = fillFor(editor.color);
  // A library coloring is read-only: painting it starts a project copy (same undo step).
  const { base, target } = editable();
  project.change(() =>
    withBlock(project.doc!, () =>
      produce(base, (x) => {
        const c = x.colorings.find((k) => k.id === target)!;
        if (editor.blockTool === 'paint') c.fills[patchId] = fill;
        else {
          const key = fillKey(current);
          for (const p of b.patches.map((y) => y.id))
            if (fillKey(c.fills[p]) === key) c.fills[p] = fill;
        }
      }),
    ),
  );
  editor.coloringOf.set(b.id, target);
}

/** A data block's numeral on a patch (spec 025): on over its color, or off when it's there; a tap
 *  moves on to the next numeral when asked. */
function numeralPatch(patchId: string, n: number, tap = false) {
  if (ro.value) return;
  const b = stored.value!;
  const { base, target } = editable();
  const slot = editor.data.slot;
  const was = base.colorings.find((k) => k.id === target)?.fills[patchId];
  const taking = !!was && 'data' in was && was.data.n === n && (was.data.slot ?? 0) === slot;
  // Undo puts the picked numeral back too, so the next tap places the undone one again.
  const before = editor.data.numeral;
  const after = tap && !taking && editor.data.advance && n < numeralCount.value ? n + 1 : before;
  project.change(
    () =>
      withBlock(project.doc!, () =>
        produce(base, (x) => {
          const c = x.colorings.find((k) => k.id === target)!;
          c.fills = castDraft(putNumeral(c.fills, patchId, n, slot));
        }),
      ),
    {
      session: {
        undo: () => (editor.data.numeral = before),
        redo: () => (editor.data.numeral = after),
      },
    },
  );
  editor.coloringOf.set(b.id, target);
  editor.data.numeral = after;
}

/** Clear all numerals: every day label (all values) off the shown drawing, in this coloring. */
function clearAllNumerals() {
  if (ro.value) return;
  const { base, target } = editable();
  const ids = block.value!.patches.map((p) => p.id);
  project.change(() =>
    withBlock(project.doc!, () =>
      produce(base, (x) => {
        const c = x.colorings.find((k) => k.id === target)!;
        c.fills = castDraft(clearNumerals(c.fills, ids));
      }),
    ),
  );
  editor.coloringOf.set(base.id, target);
}

/** The coloring to change: a library coloring is read-only, so a project copy of it. */
function editable(): { base: Block; target: string } {
  const b = stored.value!;
  const cid = coloringId.value!;
  if (!isLibraryColoring(cid)) return { base: b, target: cid };
  const r = saveColoringAs(b, cid);
  const name = b.colorings.find((c) => c.id === cid)?.name;
  return { base: renameColoring(r.block, r.id, `${name ?? 'Coloring'} (project)`), target: r.id };
}

function saveAsNew() {
  const r = saveColoringAs(stored.value!, coloringId.value!);
  project.change(() => withBlock(project.doc!, () => r.block));
  editor.coloringOf.set(block.value!.id, r.id);
}
function renameColoringPrompt(id: string) {
  const c = block.value!.colorings.find((x) => x.id === id);
  $q.dialog({
    title: 'Rename coloring',
    prompt: { model: c?.name ?? '', type: 'text' },
    cancel: true,
  }).onOk((name: string) => {
    if (name.trim())
      project.change(() => withBlock(project.doc!, (b) => renameColoring(b, id, name.trim())));
  });
}
function removeColoring(id: string) {
  const blockId = block.value!.id;
  // Quilts following this coloring keep its colors as their own.
  project.change(() =>
    withBlock(detachColoring(project.doc!, blockId, id), (b) => deleteColoring(b, id)),
  );
  if (coloringId.value === id) editor.coloringOf.delete(block.value!.id);
}

// --- Keyboard ---
function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement | null)?.closest('input, textarea')) return;
  if (!block.value || ro.value || editor.blockMode !== 'draw') return;
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
.lib-banner {
  background: rgba(128, 128, 128, 0.12);
}
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
  :global(.body--dark .inspector) {
    background: var(--q-dark-page);
  }
}
/* Phones: nearly the whole width, so its menus fit. */
@media (max-width: 599px) {
  .inspector {
    width: 95%;
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
