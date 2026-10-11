<template>
  <q-page v-if="project.doc && quilt" class="editor column no-wrap" :style-fn="fill">
    <!-- Mode tabs + undo -->
    <div class="row items-center no-wrap q-px-sm bar">
      <q-tabs v-model="editor.mode" dense no-caps inline-label class="col">
        <q-tab name="layout" icon="grid_on" label="Layout" />
        <q-tab name="borders" icon="crop_square" label="Borders" />
        <q-tab name="design" icon="palette" label="Design" />
        <q-tab name="print" icon="print" label="Print" />
      </q-tabs>
      <q-btn
        flat
        round
        dense
        icon="undo"
        aria-label="Undo"
        :disable="!project.canUndo"
        @click="project.undo()"
      >
        <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="redo"
        aria-label="Redo"
        :disable="!project.canRedo"
        @click="project.redo()"
      >
        <q-tooltip>Redo (Ctrl+Shift+Z)</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        :icon="editor.outlines ? 'border_all' : 'border_clear'"
        :aria-label="outlinesLabel"
        @click="editor.outlines = !editor.outlines"
      >
        <q-tooltip>{{ outlinesLabel }}</q-tooltip>
      </q-btn>
    </div>

    <div class="row col no-wrap" style="min-height: 0">
      <!-- Tool rail (Design) -->
      <div v-if="editor.mode === 'design'" class="rail column no-wrap q-pa-xs" style="gap: 4px">
        <q-btn
          v-for="t in tools"
          :key="t.id"
          :flat="editor.tool !== t.id"
          :unelevated="editor.tool === t.id"
          :color="editor.tool === t.id ? 'primary' : undefined"
          dense
          :icon="t.icon"
          :aria-label="t.label"
          :disable="project.readOnly && t.id !== 'pan' && t.id !== 'find' && t.id !== 'eyedropper'"
          @click="editor.tool = t.id"
        >
          <q-tooltip anchor="center right" self="center left">{{ t.label }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Canvas -->
      <div class="col relative-position">
        <QuiltCanvas
          ref="canvas"
          v-model:view="view"
          :doc="project.doc"
          :quilt="quilt"
          :generated="generated"
          :hover="hover?.slotId ?? null"
          :outlines="editor.outlines"
          :pan-only="editor.mode !== 'design' || editor.tool === 'pan'"
          @tap="onTap"
          @hover="(h) => (hover = h)"
        />
        <div class="sizes q-pa-xs text-caption">
          Finished {{ dims(generated.bounds) }} · Center {{ dims(generated.center) }}
          <span v-if="hoverSize"> · {{ hoverSize }}</span>
        </div>
      </div>

      <!-- Inspector -->
      <div v-if="editor.mode !== 'design'" class="inspector q-pa-md scroll">
        <LayoutInspector
          v-if="editor.mode === 'layout' && quilt.layout.style === 'horizontal'"
          :key="quilt.id"
          :layout="quilt.layout"
          :units="units"
          :readonly="project.readOnly"
          @change="(l, k) => changeLayout(l, quilt!.borders, k)"
        />
        <BordersInspector
          v-else-if="editor.mode === 'borders'"
          v-model:selected="border"
          :borders="quilt.borders"
          :units="units"
          :readonly="project.readOnly"
          @change="(b, k) => changeLayout(quilt!.layout, b, k)"
        />
        <div v-else-if="editor.mode === 'print'" class="text-grey-7">
          Printing patterns, templates, and yardage is coming in a later version.
        </div>
      </div>
    </div>

    <!-- Bottom bar (Design) -->
    <div v-if="editor.mode === 'design'" class="bar column">
      <div class="row items-center no-wrap q-px-sm" style="gap: 8px">
        <span class="text-caption">Apply to</span>
        <q-btn-toggle
          v-model="editor.scope"
          dense
          no-caps
          :options="[
            { label: 'This', value: 'this' },
            { label: 'All', value: 'all' },
            { label: 'Alternate', value: 'alternate' },
          ]"
        />
        <span class="text-caption text-grey-7 gt-sm">{{ toolHint }}</span>
      </div>
      <PaletteTray />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BordersInspector from '@/components/BordersInspector.vue';
import LayoutInspector from '@/components/LayoutInspector.vue';
import PaletteTray from '@/components/PaletteTray.vue';
import QuiltCanvas from '@/components/QuiltCanvas.vue';
import { applyTool } from '@/editor/actions';
import { applyLayout, generateSlots, reconcile } from '@/model/layout/slots';
import { slotGroup } from '@/model/plain';
import type { Border, Layout } from '@/model/schema/quilt';
import type { View } from '@/render/draw';
import type { Hit } from '@/render/hit';
import { useEditorStore, type Tool } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
// Fill exactly the space under the header (which grows with the read-only banner): no page scroll.
const fill = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const editor = useEditorStore();

const quilt = computed(() => project.doc?.project.quilts.find((q) => q.id === route.params.id));
watch(
  quilt,
  (q) => {
    if (project.doc && !q) void router.replace('/project');
  },
  { immediate: true },
);
const generated = computed(() => generateSlots(quilt.value!.layout, quilt.value!.borders));
const slotIds = computed(() => generated.value.slots.map((s) => s.id));
const units = computed(() => project.doc?.units ?? 'in');
const border = ref(0);
const hover = ref<Hit | null>(null);

const view = computed<View | undefined>({
  get: () => (quilt.value ? editor.views.get(quilt.value.id) : undefined),
  set: (v) => {
    if (quilt.value && v) editor.views.set(quilt.value.id, v);
  },
});

const tools: { id: Tool; icon: string; label: string }[] = [
  { id: 'set', icon: 'add_box', label: 'Set block' },
  { id: 'rotate', icon: 'rotate_right', label: 'Rotate' },
  { id: 'flip', icon: 'flip', label: 'Flip' },
  { id: 'erase', icon: 'backspace', label: 'Erase block' },
  { id: 'find', icon: 'search', label: 'Find block' },
  { id: 'paint', icon: 'brush', label: 'Paint' },
  { id: 'spray', icon: 'format_color_fill', label: 'Spray (same color)' },
  { id: 'swap', icon: 'swap_horiz', label: 'Swap color everywhere' },
  { id: 'eyedropper', icon: 'colorize', label: 'Eyedropper' },
  { id: 'pan', icon: 'pan_tool', label: 'Pan' },
];
const HINTS: Record<Tool, string> = {
  set: 'Tap a space to set the selected block.',
  rotate: 'Tap a block to turn it 90°.',
  flip: 'Tap a block to mirror it left↔right; tap again for top↕bottom, again to restore.',
  erase: 'Tap a block to remove it.',
  find: 'Tap a block to select it in the tray.',
  paint: 'Tap a patch to color it.',
  spray: 'Tap a patch to recolor every patch of the same color.',
  swap: 'Tap a patch to replace that color everywhere in the quilt.',
  eyedropper: 'Tap a patch to pick up its color.',
  pan: 'Drag to move around.',
};
const toolHint = computed(() => HINTS[editor.tool]);
const outlinesLabel = computed(() => (editor.outlines ? 'Hide seam lines' : 'Show seam lines'));

const fmt = (n: number) => `${Number(n.toFixed(3))}`;
const dims = (b: [number, number, number, number]) =>
  `${fmt(b[2] - b[0])} × ${fmt(b[3] - b[1])} ${units.value}`;
const hoverSize = computed(() => {
  const s = hover.value && generated.value.slots.find((x) => x.id === hover.value!.slotId);
  if (!s) return '';
  const t = s.transform;
  const kind =
    { block: 'Block', sash: 'Sash', cs: 'Cornerstone', other: 'Space' }[
      slotGroup(s.id) as string
    ] ?? 'Border';
  return `${kind} ${fmt(Math.hypot(t[0], t[1]))} × ${fmt(Math.hypot(t[2], t[3]))} ${units.value}`;
});

function onTap(hit: Hit) {
  if (!project.doc || !quilt.value) return;
  // Repeated Flip taps on the same space cycle ↔ → ↕ → original; anything else starts over.
  const last = editor.lastFlip;
  const flipStep =
    last && last.slotId === hit.slotId && last.scope === editor.scope
      ? (((last.step % 3) + 1) as 1 | 2 | 3)
      : 1;
  const r = applyTool(project.doc, quilt.value.id, slotIds.value, hit, {
    ...editor.$state,
    flipStep,
  });
  editor.lastFlip =
    editor.tool === 'flip' && r.doc
      ? { slotId: hit.slotId, scope: editor.scope, step: flipStep }
      : null;
  if (r.selectBlock) editor.block = r.selectBlock;
  if (r.selectColor) editor.useColor(r.selectColor);
  if (r.message) $q.notify({ message: r.message, timeout: 1500 });
  if (r.doc && !project.readOnly) {
    const next = r.doc;
    project.change(() => next);
  }
}

function changeLayout(layout: Layout, borders: Border[], coalesce: string) {
  const q = quilt.value;
  if (!q || project.readOnly) return;
  const lost = reconcile(q, layout, borders).dropped.filter((id) => slotGroup(id) === 'block');
  const go = () =>
    project.change(
      (d) => {
        const i = d.project.quilts.findIndex((x) => x.id === q.id);
        d.project.quilts[i] = applyLayout(q, layout, borders);
      },
      coalesce ? { coalesce } : {},
    );
  if (!lost.length) return go();
  $q.dialog({
    title: 'Remove placed blocks?',
    message: `This change removes ${lost.length} placed block${lost.length > 1 ? 's' : ''}.`,
    cancel: true,
    ok: { label: 'Remove', color: 'negative', flat: true },
  }).onOk(go);
}
</script>

<style scoped>
.editor {
  overflow: hidden;
  min-width: 0;
}
.editor > * {
  min-width: 0;
}
.bar {
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
}
.rail {
  overflow-y: auto;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
.inspector {
  width: 320px;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
}
.sizes {
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: rgba(255, 255, 255, 0.85);
  color: #222;
  border-radius: 4px;
}
</style>
