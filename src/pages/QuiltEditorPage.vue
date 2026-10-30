<template>
  <q-page v-if="project.doc && quilt" class="editor column no-wrap" :style-fn="fill">
    <!-- Mode tabs + undo -->
    <div
      class="row items-center no-wrap q-px-sm bar"
      :class="{ reverse: appSettings.settings.sidesSwapped }"
    >
      <q-tabs v-model="editor.mode" dense no-caps inline-label class="col">
        <q-tab name="details" icon="info" label="Details" />
        <q-tab name="layout" icon="grid_on" label="Layout" />
        <q-tab name="borders" icon="crop_square" label="Borders" />
        <q-tab name="design" icon="palette" label="Design" />
        <q-tab name="print" icon="print" label="Print" />
      </q-tabs>
      <HelpLink v-bind="help" />
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
      <!-- Toolbar: undo, view toggles, and (Design) tools -->
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
        <template v-if="editor.mode === 'print'">
          <q-separator />
          <PrintZoom />
        </template>
        <template v-if="editor.mode !== 'print'">
          <q-btn
            flat
            dense
            :icon="editor.outlines ? 'border_all' : 'border_clear'"
            :aria-label="outlinesLabel"
            @click="editor.outlines = !editor.outlines"
          >
            <q-tooltip anchor="center right" self="center left">{{ outlinesLabel }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            :icon="editor.labels ? 'label' : 'label_off'"
            :aria-label="labelsLabel"
            @click="editor.labels = !editor.labels"
          >
            <q-tooltip anchor="center right" self="center left">{{ labelsLabel }}</q-tooltip>
          </q-btn>
        </template>
        <template v-if="editor.mode === 'layout' && strips">
          <q-separator />
          <q-btn
            :flat="editor.layoutTool !== 'swap-strips'"
            :unelevated="editor.layoutTool === 'swap-strips'"
            :color="editor.layoutTool === 'swap-strips' ? 'primary' : undefined"
            dense
            :icon="strips.style === 'vertical-strip' ? 'swap_horiz' : 'swap_vert'"
            aria-label="Swap strips"
            :disable="project.readOnly"
            @click="toggleLayoutTool('swap-strips')"
          >
            <q-tooltip anchor="center right" self="center left">Swap strips</q-tooltip>
          </q-btn>
          <q-btn
            :flat="editor.layoutTool !== 'strip-style'"
            :unelevated="editor.layoutTool === 'strip-style'"
            :color="editor.layoutTool === 'strip-style' ? 'primary' : undefined"
            dense
            icon="view_stream"
            :aria-label="`Strip style: ${styleLabel}`"
            :disable="project.readOnly"
          >
            <q-tooltip anchor="center right" self="center left">
              Strip style: {{ styleLabel }}
            </q-tooltip>
            <q-icon name="arrow_right" size="14px" class="menu-mark" />
            <q-menu anchor="top right" self="top left">
              <q-list dense style="min-width: 180px">
                <q-item
                  v-for="x in STRIP_STYLES"
                  :key="x.value"
                  v-close-popup
                  clickable
                  :active="editor.layoutTool === 'strip-style' && editor.stripStyle === x.value"
                  @click="pickStripStyle(x.value)"
                >
                  <q-item-section>{{ x.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <div v-if="editor.layoutTool === 'strip-style'" class="caption text-caption">
            {{ styleLabel }}
          </div>
        </template>
        <template v-if="editor.mode === 'design'">
          <q-separator />
          <q-btn
            v-for="t in shownTools"
            :key="t.id"
            :flat="editor.tool !== t.id"
            :unelevated="editor.tool === t.id"
            :color="editor.tool === t.id ? 'primary' : undefined"
            dense
            :icon="t.icon"
            :class="{ 'flip-v': t.id === 'flip' && editor.flipAxis === 'v' }"
            :aria-label="labelOf(t)"
            :disable="
              project.readOnly && t.id !== 'pan' && t.id !== 'find' && t.id !== 'eyedropper'
            "
            @click="selectTool(t.id)"
          >
            <q-tooltip anchor="center right" self="center left">{{ labelOf(t) }}</q-tooltip>
          </q-btn>
        </template>
      </div>

      <PrintPreview v-if="editor.mode === 'print'" kind="quilt" :id="quilt.id" />
      <!-- Canvas -->
      <div v-else class="col relative-position">
        <QuiltCanvas
          ref="canvas"
          v-model:view="view"
          :doc="project.doc"
          :quilt="quilt"
          :generated="generated"
          :hover="highlight"
          :outlines="editor.outlines"
          :labels="editor.labels"
          :selected="found"
          :soft="flashSoft"
          :pan-only="panOnly"
          :data-marks="dataMarks"
          :day-paths="dayPaths"
          :class="{ gray: gray }"
          @tap="onTap"
          @pick="onPick"
          @hover="(h) => (hover = h)"
        />
        <div class="sizes q-pa-xs text-caption">
          Finished {{ dims(generated.bounds) }} · Center {{ dims(generated.center) }}
          <span v-if="hoverSize"> · {{ hoverSize }}</span>
        </div>
      </div>

      <!-- Inspector -->
      <div v-show="editor.sidebar" class="inspector q-pa-md scroll">
        <template v-if="editor.mode === 'design'">
          <q-toggle v-model="gray" dense label="View grayscale" class="q-mb-sm" />
          <QuiltColorways
            :quilt="quilt"
            mode="panel"
            :readonly="project.readOnly"
            class="q-mb-sm"
          />
          <div
            v-if="editor.tool !== 'number' && editor.tool !== 'entry'"
            class="row items-center q-mb-xs"
            style="gap: 8px"
          >
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
          </div>
          <div class="text-caption text-grey-7 q-mb-sm">{{ toolHint }}</div>
          <PaletteTray
            sidebar
            :no-blocks="!hasBlockSpaces"
            :fits-quilt="fitsQuilt"
            :data="!!quilt.data?.on"
          >
            <!-- A colorway other than the primary: its mapping instead of the palettes. -->
            <template v-if="quilt.shownColorway" #colors>
              <ColorwayMapping :quilt="quilt" :readonly="project.readOnly" />
            </template>
            <template #blocks>
              <DataBlocks :quilt="quilt" :readonly="project.readOnly" />
            </template>
            <template #data>
              <DataInspector ref="dataInspector" :quilt="quilt" :readonly="project.readOnly" />
            </template>
          </PaletteTray>
        </template>
        <template v-else-if="editor.mode === 'layout' && quilt.layout.style !== 'custom-set'">
          <DataSpaceCount
            v-if="quilt.data?.on"
            :generated="generated"
            :plan="quilt.data.plan"
            :need="numberCount(quilt.data)"
            class="q-mb-md"
          />
          <LayoutInspector
            :key="quilt.id"
            :layout="quilt.layout"
            :units="units"
            :readonly="project.readOnly"
            :has-borders="quilt.borders.length > 0"
            :hint="layoutHint"
            @change="(l, k) => changeLayout(l, quilt!.borders, k)"
          />
          <TargetSection
            :target="quilt.target"
            :units="units"
            :readonly="project.readOnly"
            @change="changeTarget"
          />
        </template>
        <BordersInspector
          v-else-if="editor.mode === 'borders'"
          v-model:selected="border"
          :borders="quilt.borders"
          :units="units"
          :readonly="project.readOnly || bordersSetAside"
          :set-aside="bordersSetAside"
          :inner="borderInner"
          @change="(b, k) => changeLayout(quilt!.layout, b, k)"
        />
        <DetailsPanel v-else-if="editor.mode === 'details'" kind="quilt" :id="quilt.id" />
        <PrintOptions v-else-if="editor.mode === 'print'" kind="quilt" :id="quilt.id" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { Block } from '@/model/schema/block';
import QuiltColorways from '@/components/QuiltColorways.vue';
import ColorwayMapping from '@/components/ColorwayMapping.vue';
import { useQuasar } from 'quasar';
import HelpLink from '@/components/HelpLink.vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BordersInspector from '@/components/BordersInspector.vue';
import DataBlocks from '@/components/DataBlocks.vue';
import DataSpaceCount from '@/components/DataSpaceCount.vue';
import { useDataTypes } from '@/composables/data-types';
import DataInspector from '@/components/DataInspector.vue';
import { castDraft, produce } from 'immer';
import type { RrqDoc } from '@/model/schema/project';
import { resolveColoring } from '@/model/coloring';
import {
  blockLetters,
  dataTap,
  dayOf,
  numberCount,
  numberInfo,
  numberOf,
  placeDate,
  placeOf,
  seriesOf,
  takeBack,
} from '@/model/data-quilt';
import { blockSpaceNumbers, quiltDataMarks, quiltDayPaths } from '@/render/data-overlay';
import { PLAIN_PATCH } from '@/model/plain';
import TargetSection from '@/components/TargetSection.vue';
import DetailsPanel from '@/components/DetailsPanel.vue';
import LayoutInspector from '@/components/LayoutInspector.vue';
import PaletteTray from '@/components/PaletteTray.vue';
import PrintOptions from '@/components/PrintOptions.vue';
import PrintPreview from '@/components/PrintPreview.vue';
import PrintZoom from '@/components/PrintZoom.vue';
import QuiltCanvas from '@/components/QuiltCanvas.vue';
import { applyTool } from '@/editor/actions';
import { takesBlock } from '@/editor/scope';
import { STRIP_STYLES, stripOf, swapStrips, setStrip } from '@/model/layout/strips';
import { applyLayout, generateFor, reconcile, type Bounds } from '@/model/layout/slots';
import { PLAIN_BLOCK, slotGroup } from '@/model/plain';
import type { Border, Layout, QuiltTarget, StripLayout, StripStyle } from '@/model/schema/quilt';
import type { View } from '@/render/draw';
import type { Hit } from '@/render/hit';
import { useEditorStore, type Tool } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const $q = useQuasar();
// Fill exactly the space under the header (which grows with the read-only banner): no page scroll.
const fill = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });
const route = useRoute();
const router = useRouter();
const project = useProjectStore();
const editor = useEditorStore();
/** View grayscale (values only): off each time the editor opens, never remembered. */
const gray = ref(false);
// Sidebar opens with each editor (hiding it isn't remembered).
// Open on arrival, except on phones/portrait tablets, where it slides over the canvas.
editor.sidebar = !$q.screen.lt.md;
// Details lives in the sidebar, so it opens whenever that tab is shown.
watch(
  () => editor.mode,
  (m) => m === 'details' && (editor.sidebar = true),
  { immediate: true },
);
const library = useLibraryStore();
const dataTypes = useDataTypes();
const appSettings = useSettingsStore();

const quilt = computed(() => project.doc?.project.quilts.find((q) => q.id === route.params.id));
watch(
  quilt,
  (q) => {
    if (project.doc && !q) void router.replace('/project');
  },
  { immediate: true },
);
const generated = computed(() => generateFor(quilt.value!));
const units = computed(() => project.doc?.units ?? 'in');
const border = ref(0);
const hover = ref<Hit | null>(null);

const view = computed<View | undefined>({
  get: () => (quilt.value ? editor.views.get(quilt.value.id) : undefined),
  set: (v) => {
    if (quilt.value && v) editor.views.set(quilt.value.id, v);
  },
});

// Eraser glyph ("ink_eraser", Material Symbols, Apache 2.0) — the bundled icon font has none.
const ERASER =
  'M690-240h190v80H610l80-80Zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z|0 -960 960 960';

const tools: { id: Tool; icon: string; label: string }[] = [
  { id: 'set', icon: 'add_box', label: 'Set block' },
  { id: 'rotate', icon: 'rotate_right', label: 'Rotate' },
  { id: 'flip', icon: 'flip', label: 'Flip' },
  { id: 'erase', icon: ERASER, label: 'Erase block' },
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
  flip: 'Tap a block to mirror it. Tap the Flip tool again to switch left↔right / top↕bottom.',
  erase: 'Tap a block to remove it.',
  find: 'Tap a block to select it in the tray.',
  number: 'Tap a block space to place the highlighted number.',
  entry: 'Tap a day’s piece to open its entry.',
  paint: 'Tap a patch to color it.',
  spray: 'Tap a patch to recolor every patch of the same color.',
  swap: 'Tap a patch to replace that color everywhere in the quilt.',
  eyedropper: 'Tap a patch to pick up its color.',
  pan: 'Drag to move around.',
};
const toolHint = computed(() => HINTS[editor.tool]);
/** The Help topic for each editor tab. */
const QUILT_HELP: Record<string, { topic: string; label: string }> = {
  details: { topic: 'guides/designing-a-quilt', label: 'Designing a quilt' },
  layout: { topic: 'guides/designing-a-quilt', label: 'Designing a quilt' },
  borders: { topic: 'math/borders', label: 'Borders' },
  design: { topic: 'guides/designing-a-quilt', label: 'Designing a quilt' },
  print: { topic: 'guides/printing', label: 'Printing' },
};
const help = computed(() =>
  editor.mode === 'design' && quilt.value?.data?.on
    ? { topic: 'guides/data-quilts', label: 'Data quilts' }
    : (QUILT_HELP[editor.mode] ?? QUILT_HELP.design!),
);
/** A data quilt places its blocks by number (spec 025): no Set, Erase or Find. */
const shownTools = computed(() =>
  // A data quilt sets blocks with its numbering brush (Other blocks: Set from the tray).
  quilt.value?.data?.on ? tools.filter((t) => t.id !== 'set') : tools,
);
const labelOf = (t: { id: Tool; label: string }) =>
  t.id === 'flip' ? (editor.flipAxis === 'v' ? 'Flip top↕bottom' : 'Flip left↔right') : t.label;
/** Choosing Flip while it's already active switches its direction. */
function selectTool(id: Tool) {
  if (id === 'flip' && editor.tool === 'flip')
    editor.flipAxis = editor.flipAxis === 'h' ? 'v' : 'h';
  editor.tool = id;
}
/** The layout when it is a strip layout (spec 017). */
const strips = computed<StripLayout | null>(() => {
  const l = quilt.value?.layout;
  return l && (l.style === 'horizontal-strip' || l.style === 'vertical-strip') ? l : null;
});
const panOnly = computed(
  () =>
    !(editor.mode === 'layout' && strips.value) &&
    (editor.mode !== 'design' || editor.tool === 'pan'),
);
const dataInspector = ref<InstanceType<typeof DataInspector>>();
/** The space outlined on the quilt: a hovered placement's, else the one under the pointer
 *  (any part of the quilt; its color says which kind), else the clicked card's. */
const highlight = computed(() => {
  if (editor.dataHot) return editor.dataHot;
  return hover.value?.slotId ?? (quilt.value?.data?.on ? editor.dataSel : null);
});
/** A data quilt's numbers on their block spaces, joined in order (spec 025). */
const dataMarks = computed(() =>
  editor.mode === 'design' && quilt.value?.data?.on
    ? quiltDataMarks(project.doc!, quilt.value, generated.value)
    : null,
);
/** Each placed data block's days in order (light arrows under the month trace). */
const dayPaths = computed(() =>
  editor.mode === 'design' && quilt.value?.data?.on && project.doc
    ? quiltDayPaths(project.doc, quilt.value, generated.value)
    : null,
);
// Off a data quilt: off its tools.
watch(
  () => !!quilt.value?.data?.on,
  (on) => {
    if (!on && (editor.tool === 'number' || editor.tool === 'entry')) editor.tool = 'set';
    if (on && editor.tool === 'set') editor.tool = 'number';
  },
);
/** Data quilt taps: the brush places the highlighted number (or takes a space's back); in the
 *  Data tab a day's piece opens its entry. */
function onDataTap(hit: Hit) {
  const q = quilt.value;
  const plan = q?.data;
  if (!q || !plan || !project.doc) return;
  const say = (message: string) => $q.notify({ message, timeout: 1500 });
  if (editor.tool === 'entry') {
    const content = q.layers[0].slots[hit.slotId];
    const block = content && project.doc.project.blocks.find((b) => b.id === content.block);
    const f = content
      ? resolveColoring(q.colorings[content.coloring], block)?.fills[hit.patchId ?? PLAIN_PATCH]
      : undefined;
    const day = f && 'data' in f ? dayOf(plan, numberOf(plan, hit.slotId), f.data) : null;
    if (typeof day === 'number') dataInspector.value?.openDay(placeDate(plan, day));
    return;
  }
  if (project.readOnly) return;
  if (!blockSpaceNumbers(generated.value).has(hit.slotId))
    return say('Numbers go on whole block spaces, not ones cut down at the edge.');
  const pick = dataTypes.picked.value;
  if (!pick) return say('Pick a data block in the Blocks tab first.');
  const r = dataTap(plan, hit.slotId, {
    n: editor.dataNext,
    block: pick.block,
    kind: pick.kind,
    series: editor.dataSeries,
  });
  if ('error' in r) return say(r.error);
  const apply = () => {
    // Undo and redo walk the highlighted number back and forth with the placement.
    const before = editor.dataNext;
    editor.dataNext = r.next;
    project.change(
      (d) => {
        d.project.quilts.find((x) => x.id === q.id)!.data = castDraft(r.plan);
      },
      {
        session: {
          undo: () => (editor.dataNext = before),
          redo: () => (editor.dataNext = r.next),
        },
      },
    );
  };
  if (!r.ask) return apply();
  $q.dialog({
    title: 'Move the single day?',
    message: r.ask,
    cancel: { flat: true, noCaps: true, label: 'Cancel' },
    ok: { unelevated: true, noCaps: true, label: 'Move it' },
    persistent: true,
  }).onOk(apply);
}
const styleLabel = computed(
  () => STRIP_STYLES.find((x) => x.value === editor.stripStyle)?.label ?? '',
);
function toggleLayoutTool(t: 'swap-strips' | 'strip-style') {
  editor.swapFirst = null;
  editor.layoutTool = editor.layoutTool === t ? null : t;
}
/** Choosing a style from the menu turns the tool on with it. */
function pickStripStyle(v: StripStyle) {
  editor.swapFirst = null;
  editor.stripStyle = v;
  editor.layoutTool = 'strip-style';
}
const layoutHint = computed(() =>
  editor.layoutTool === 'swap-strips'
    ? editor.swapFirst
      ? 'Tap the second strip (the same strip or Escape cancels).'
      : 'Tap a strip to swap.'
    : editor.layoutTool === 'strip-style'
      ? `Tap strips to make them ${styleLabel.value}.`
      : '',
);
// Tools belong to the Layout tab of one strip quilt.
watch(
  () => `${editor.mode}:${quilt.value?.id}`,
  () => {
    editor.layoutTool = null;
    editor.swapFirst = null;
  },
);
const onKey = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  if (e.key === 'Escape' && !t?.closest('input, textarea, select, [contenteditable]')) {
    if (editor.swapFirst) editor.swapFirst = null;
    else editor.layoutTool = null;
  }
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
const outlinesLabel = computed(() => (editor.outlines ? 'Hide seam lines' : 'Show seam lines'));
/** Find tool: outline every placement of the selected block. */
/** A flash's spaces matching only part of what's picked (a slight glow). */
const flashSoft = computed(() =>
  editor.flash.on && editor.flash.soft.length ? new Set(editor.flash.soft) : undefined,
);
const found = computed(() => {
  if (editor.flash.on && (editor.flash.ids.length || editor.flash.soft.length))
    return new Set(editor.flash.ids);
  if (editor.mode === 'layout' && strips.value) {
    const id = editor.swapFirst ?? editor.selectedStrip;
    return id
      ? new Set(generated.value.slots.map((x) => x.id).filter((x) => stripOf(x) === id))
      : undefined;
  }
  if (editor.tool !== 'find' || !editor.block || !quilt.value) return undefined;
  const slots = quilt.value.layers[0].slots;
  // A data block: every space it's placed on, whichever variant shows there.
  const placed = (quilt.value.data?.places ?? [])
    .filter((p) => p.block === editor.block)
    .map((p) => p.space);
  return new Set([
    ...Object.keys(slots).filter((id) => slots[id]!.block === editor.block),
    ...placed,
  ]);
});
const sidebarLabel = computed(() => (editor.sidebar ? 'Hide sidebar' : 'Show sidebar'));
const labelsLabel = computed(() => (editor.labels ? 'Hide block names' : 'Show block names'));

const setsBordersAside = (l: Layout) =>
  l.style === 'on-point' || l.style === 'variable-point' || l.style === 'diamond-point'
    ? l.edge.finish === 'none'
    : l.style === 'one-patch' ||
        l.style === 'shaped-blocks' ||
        l.style === 'baby-blocks' ||
        l.style === 'variable-blocks'
      ? l.edge === 'none'
      : false;
/** The selected border's inside edge: the quilt center grown by the borders within it. */
const borderInner = computed((): Bounds => {
  const [x0, y0, x1, y1] = generated.value.center;
  const within = quilt.value!.borders.slice(0, border.value);
  const sum = (i: number) => within.reduce((a, b) => a + b.sides[i]!, 0);
  return [x0 - sum(0), y0 - sum(1), x1 + sum(2), y1 + sum(3)];
});
/** Whether some space of this quilt takes the block (its shape: spec 026). */
const fitsQuilt = (b: Block) => generated.value.slots.some((s) => takesBlock(s, b.shape ?? null));
/** Some space takes a block (patch layouts and pieced strips take only colors and fabrics). */
const hasBlockSpaces = computed(() => generated.value.slots.some((s) => takesBlock(s)));
const bordersSetAside = computed(
  () => !!quilt.value && setsBordersAside(quilt.value.layout) && quilt.value.borders.length > 0,
);
const fmt = (n: number) => `${Number(n.toFixed(3))}`;
const dims = (b: [number, number, number, number]) =>
  `${fmt(b[2] - b[0])} × ${fmt(b[3] - b[1])} ${units.value}`;
const hoverSize = computed(() => {
  const s = hover.value && generated.value.slots.find((x) => x.id === hover.value!.slotId);
  if (!s) return '';
  const t = s.transform;
  const kind =
    { block: 'Block', sash: 'Sash', cs: 'Cornerstone', other: 'Space', set: 'Setting piece' }[
      slotGroup(s.id) as string
    ] ?? 'Border';
  if (s.kind === 'set') return 'Setting piece';
  if (s.kind === 'patch') return 'Patch';
  if (s.kind === 'strip') return 'Strip piece';
  // Pattern pieces (pieced borders and the like) have no width × height to speak of.
  if (s.shape === 'piece' && s.kind !== 'border') return kind;
  if (s.kind === 'border' && /:(?:[a-z]+\d|corner:[a-z]+:)/.test(s.id)) return 'Border piece';
  const [w, h] = s.kind === 'block' ? s.size : [Math.hypot(t[0], t[1]), Math.hypot(t[2], t[3])];
  return `${kind} ${fmt(w)} × ${fmt(h)} ${units.value}`;
});

function onStripTap(hit: Hit, l: StripLayout) {
  const id = stripOf(hit.slotId);
  if (!id) return;
  const b = quilt.value!.borders;
  if (editor.layoutTool === 'swap-strips') {
    if (!editor.swapFirst) editor.swapFirst = id;
    else {
      const first = editor.swapFirst;
      editor.swapFirst = null;
      if (first !== id) changeLayout(swapStrips(l, first, id), b, '');
    }
  } else if (editor.layoutTool === 'strip-style') {
    editor.selectedStrip = id;
    changeLayout(setStrip(l, id, { style: editor.stripStyle }), b, '');
  } else editor.selectedStrip = id;
}

function onTap(hit: Hit) {
  if (!project.doc || !quilt.value) return;
  if (editor.mode === 'layout') return strips.value ? onStripTap(hit, strips.value) : undefined;
  if (editor.tool === 'number' || editor.tool === 'entry') return onDataTap(hit);
  const r = applyTool(project.doc, quilt.value.id, generated.value.slots, hit, {
    ...editor.$state,
    library: library.lookup,
  });
  // Find on a data block: the block itself, not the variant its space shows.
  const place = quilt.value.data?.on ? placeOf(quilt.value.data, hit.slotId) : undefined;
  if (r.selectBlock) editor.block = editor.tool === 'find' && place ? place.block : r.selectBlock;
  // …and picked in the Data blocks list, for the kind of number it shows there.
  const kind = place && numberInfo(quilt.value.data!, place.n)?.kind;
  const data = place && dataTypes.block(place.block);
  if (editor.tool === 'find' && data && kind) dataTypes.pick(data, kind);
  // A data quilt's tray shows the list the found block is in.
  if (editor.tool === 'find' && quilt.value.data?.on && r.selectBlock) editor.dataOther = !place;
  if (editor.tool === 'find' && r.selectBlock) editor.reveal();
  if (r.selectColor) editor.useColor(r.selectColor);
  if (r.message) $q.notify({ message: r.message, timeout: 1500 });
  if (r.doc && !project.readOnly) {
    const next = dropNumbers(quilt.value.id, project.doc, r.doc);
    project.change(() => next);
  }
}

/**
 * A middle click picks up what's there: a data block its block, values and number (the numbering
 * brush); any other block its block and the clicked patch's color or fabric; a patch its color or
 * fabric.
 */
function onPick(hit: Hit) {
  const q = quilt.value;
  const doc = project.doc;
  if (!q || !doc || editor.mode !== 'design') return;
  const plan = q.data?.on ? q.data : undefined;
  const place = plan && placeOf(plan, hit.slotId);
  const kind = place && numberInfo(plan, place.n)?.kind;
  const data = place && dataTypes.block(place.block);
  if (place && kind && data) {
    editor.dataPick = { id: data.id, kind };
    const series: (number | null)[] = [null, null, null, null];
    for (const l of blockLetters(data)) series[l] = seriesOf(place, l);
    editor.dataSeries = series;
    editor.dataNext = place.n;
    editor.tool = 'number';
    editor.reveal();
    return;
  }
  const content = q.layers[0].slots[hit.slotId];
  const block = content && doc.project.blocks.find((b) => b.id === content.block);
  const r = applyTool(doc, q.id, generated.value.slots, hit, {
    ...editor.$state,
    tool: 'eyedropper',
    library: library.lookup,
  });
  if (block && block.id !== PLAIN_BLOCK && !block.data) {
    editor.block = block.id;
    if (['number', 'entry'].includes(editor.tool)) editor.tool = 'set';
  } else if (r.selectColor && ['set', 'number', 'entry', 'find'].includes(editor.tool))
    editor.tool = 'paint';
  if (r.selectColor) editor.useColor(r.selectColor);
  editor.reveal();
}

/** A data quilt's numbered spaces given an ordinary block (Other blocks) give their numbers back. */
function dropNumbers(id: string, before: RrqDoc, after: RrqDoc): RrqDoc {
  const was = before.project.quilts.find((q) => q.id === id);
  const now = after.project.quilts.find((q) => q.id === id);
  const plan = now?.data;
  if (!was || !now || !plan?.on) return after;
  const blocks = new Map(after.project.blocks.map((b) => [b.id, b]));
  const lost = plan.places
    .map((p) => p.space)
    .filter((sid) => {
      const b = now.layers[0].slots[sid]?.block;
      return b !== was.layers[0].slots[sid]?.block && !blocks.get(b ?? '')?.data;
    });
  if (!lost.length) return after;
  return produce(after, (d) => {
    const q = d.project.quilts.find((x) => x.id === id)!;
    q.data = castDraft(lost.reduce((p, sid) => takeBack(p, sid), plan));
  });
}

/** Set or remove the quilt's target size outline. */
function changeTarget(target: QuiltTarget | undefined, coalesce: string) {
  const q = quilt.value;
  if (!q || project.readOnly) return;
  // Switching to a garment piece: it likely needs no borders, so offer to take them off.
  const garment = (t?: QuiltTarget) => t?.input.choice === 'top' || t?.input.choice === 'pants';
  if (garment(target) && !garment(q.target) && q.borders.length)
    $q.dialog({
      title: 'Remove the borders?',
      message: "Garment pieces usually don't have borders. Remove this quilt's borders?",
      ok: { label: 'Remove', flat: true, noCaps: true },
      cancel: { label: 'Keep them', flat: true, noCaps: true },
    }).onOk(() => changeLayout(q.layout, [], ''));
  project.change(
    (d) => {
      const dq = d.project.quilts.find((x) => x.id === q.id)!;
      if (target) dq.target = JSON.parse(JSON.stringify(target)) as QuiltTarget;
      else delete dq.target;
    },
    coalesce ? { coalesce } : {},
  );
}

function changeLayout(layout: Layout, borders: Border[], coalesce: string) {
  const q = quilt.value;
  if (!q || project.readOnly) return;
  // Placed blocks only (plain fills of sashes and setting pieces just go).
  const lost = reconcile(q, layout, borders).dropped.filter(
    (id) => q.layers[0].slots[id]?.block !== PLAIN_BLOCK,
  );
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
.flip-v :deep(.q-icon) {
  transform: rotate(90deg);
}
.rail :deep(.q-btn) {
  position: relative;
}
.menu-mark {
  position: absolute;
  right: -2px;
  bottom: -2px;
}
.caption {
  max-width: 44px;
  text-align: center;
  line-height: 1.1;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rail {
  overflow-y: auto;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
.inspector {
  width: 320px;
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
.sizes {
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: rgba(255, 255, 255, 0.85);
  color: #222;
  border-radius: 4px;
}
</style>
