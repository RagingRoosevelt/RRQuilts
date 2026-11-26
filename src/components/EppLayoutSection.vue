<template>
  <div class="column" style="gap: 12px">
    <!-- 3D EPP (spec 027 User Story 7; owner, 2026-11-23): either way, as in the new-quilt wizard. -->
    <div>
      <q-toggle
        :model-value="!!layout.threeD"
        dense
        label="3D EPP"
        :disable="readonly"
        @update:model-value="setThreeD"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        {{
          layout.threeD
            ? 'Sewn into an object: it has a 3D assembly tab, and a 3D badge among the project’s quilts. Turned off, its seams wait unused until it is 3D again.'
            : 'Sew the pieces into an object instead. A 3D design has no edge or borders, so turning this on removes them (Undo brings them back).'
        }}
      </div>
    </div>
    <!-- The design's stuffing setting, also in the 3D assembly tab (owner, 2026-11-23). -->
    <div v-if="layout.threeD">
      <q-toggle
        :model-value="!!layout.stuffed"
        dense
        label="Stuffed design"
        :disable="readonly"
        @update:model-value="(on: boolean) => change((q) => setStuffedDesign(q, on))"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        Filled with stuffing once sewn. The 3D assembly tab simulates the stuffing, and its Enable
        simulation view switch turns that off in the tab only.
      </div>
    </div>
    <LengthInput
      :model-value="layout.unit"
      label="1U length"
      :units="units"
      :min="units === 'cm' ? 0.5 : 0.25"
      :readonly="readonly"
      @update:model-value="(v: number) => set({ unit: v }, 'epp-unit')"
    />
    <div>
      <LengthInput
        :model-value="seams.epp"
        label="Seam allowance"
        :units="units"
        :min="0"
        :step="seamStep(units)"
        :readonly="readonly"
        @update:model-value="(v: number) => setSeam('epp', v)"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        The project’s EPP seam allowance, for every EPP quilt and rosette in it.
      </div>
    </div>
    <!-- A 3D EPP quilt folds into an object: no edge, borders or binding. -->
    <div v-if="!layout.threeD">
      <div class="text-subtitle2">Edge</div>
      <SlidePicker
        :model-value="layout.edge.kind"
        :options="[
          { value: 'none', label: 'No trimming' },
          { value: 'cut', label: 'Cut to size' },
          { value: 'close', label: 'Auto-close' },
        ]"
        :disable="readonly"
        @update:model-value="setEdgeKind"
      />
      <div class="text-caption text-grey-7 q-mt-xs">{{ EDGE_HINTS[layout.edge.kind] }}</div>
    </div>
    <template v-if="layout.edge.kind === 'cut'">
      <!-- Largest rectangle follows the pieces; Manual is sized on the picture (0.9.3 roadmap). -->
      <div>
        <SlidePicker
          :model-value="layout.edge.manual ? 'manual' : 'largest'"
          :options="[
            { value: 'largest', label: 'Largest rectangle' },
            { value: 'manual', label: 'Manual' },
          ]"
          :disable="readonly"
          @update:model-value="(v: string) => setManual(v === 'manual')"
        />
        <div class="text-caption text-grey-7 q-mt-xs">
          {{
            layout.edge.manual
              ? 'Drag the cut’s sides or corners on the picture, or its middle to move it. The pieces it cuts away show faded.'
              : 'The largest rectangle the pieces fill with no gaps, found again as you edit. Type a size or pick Manual to set your own.'
          }}
        </div>
      </div>
      <div class="row no-wrap" style="gap: 8px">
        <LengthInput
          class="col"
          :model-value="cutSize[0]"
          label="Width"
          :units="units"
          :min="layout.unit"
          :readonly="readonly"
          @update:model-value="(v: number) => resize(v, null)"
        />
        <LengthInput
          class="col"
          :model-value="cutSize[1]"
          label="Height"
          :units="units"
          :min="layout.unit"
          :readonly="readonly"
          @update:model-value="(v: number) => resize(null, v)"
        />
      </div>
      <template v-if="layout.edge.manual">
        <q-select
          :model-value="ratioKey"
          dense
          outlined
          options-dense
          emit-value
          map-options
          label="Aspect ratio"
          :options="RATIOS"
          :disable="readonly"
          @update:model-value="setRatio"
        />
        <div class="column">
          <q-toggle
            :model-value="app.settings.eppCutSnap.vertex"
            dense
            label="Snap to vertex"
            @update:model-value="(v: boolean) => setSnap('vertex', v)"
          />
          <q-toggle
            :model-value="app.settings.eppCutSnap.edge"
            dense
            label="Snap to edge"
            class="q-mt-sm"
            @update:model-value="(v: boolean) => setSnap('edge', v)"
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            While dragging, the cut’s sides snap to piece corners and along upright or level piece
            edges near them.
          </div>
        </div>
      </template>
    </template>
    <template v-if="layout.edge.kind === 'close'">
      <div class="row items-center" style="gap: 8px">
        <span class="text-body2">Closing pieces</span>
        <span class="swatch" :style="{ background: closeCss ?? 'transparent' }" />
        <q-btn
          outline
          dense
          no-caps
          label="Use the picked color or fabric"
          class="q-px-sm"
          :disable="readonly || !editor.color"
          @click="setCloseFill(true)"
        />
        <q-btn flat dense no-caps label="None" :disable="readonly" @click="setCloseFill(false)" />
      </div>
      <div class="text-caption text-grey-7">
        {{ quilt.epp?.closing?.length ?? 0 }} closing pieces. Pick a color in the Design tab’s
        palette, then use it here.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// An EPP quilt's Layout tab (spec 027 FR-001, FR-001a): the length of 1U, the project's EPP seam
// allowance and the edge (not for 3D). Custom trim waits for spec 055 (owner, 2026-11-10).
import { computed } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { fillFor } from '@/editor/paint';
import { fitRatio } from '@/model/epp/edge';
import { lookupEpp } from '@/model/epp/expand';
import { refresh, setEdge, setStuffedDesign } from '@/model/epp/quilt-ops';
import { useProjectSeams } from '@/composables/seams';
import { seamStep } from '@/model/seams';
import type { EppEdge, EppLayout } from '@/model/schema/epp';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup } from '@/render/draw';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{ quilt: Quilt; units: string; readonly: boolean }>();
const project = useProjectStore();
const library = useLibraryStore();
const editor = useEditorStore();
const app = useSettingsStore();
const { seams: seamsRef, set: setSeam } = useProjectSeams();
const seams = computed(() => seamsRef.value);

const EDGE_HINTS: Record<EppEdge['kind'], string> = {
  none: 'The edge follows the outer pieces. No borders or binding.',
  cut: 'A rectangle cuts across the outer pieces after piecing. Templates stay whole.',
  close: 'Closing pieces fill the notches up to a straight edge: nothing is cut.',
  custom: '',
};
const layout = computed(() => props.quilt.layout as EppLayout);
const lookup = computed(() =>
  lookupEpp(project.doc!.project, props.quilt.epp?.shapes ?? [], library.lookup),
);

function change(fn: (q: Quilt) => Quilt, coalesce?: string) {
  if (props.readonly) return;
  project.change(
    (d) => {
      const k = d.project.quilts.findIndex((q) => q.id === props.quilt.id);
      if (k >= 0) d.project.quilts[k] = refresh(fn(d.project.quilts[k] as Quilt), lookup.value);
    },
    coalesce ? { coalesce } : {},
  );
}
const set = (patch: Partial<EppLayout>, key: string) =>
  change((q) => ({ ...q, layout: { ...(q.layout as EppLayout), ...patch } }), key);

/** 3D folds into an object: no edge, no borders (the Borders tab goes too). */
function setThreeD(on: boolean) {
  change((q) => {
    const l = { ...(q.layout as EppLayout) };
    if (!on) {
      delete l.threeD;
      return { ...q, layout: l };
    }
    return { ...q, layout: { ...l, threeD: true, edge: { kind: 'none' } }, borders: [] };
  });
}

function setEdgeKind(kind: string) {
  const was = layout.value.edge;
  const e: EppEdge =
    kind === 'cut'
      ? was.kind === 'cut'
        ? was
        : { kind: 'cut', rect: [0, 0, 0, 0] }
      : kind === 'close'
        ? { kind: 'close' }
        : { kind: 'none' };
  change((q) => setEdge(q, e, lookup.value));
}

/** Largest rectangle (found again after every edit) or Manual (kept as sized, from where it is). */
function setManual(on: boolean) {
  const e = layout.value.edge;
  if (e.kind !== 'cut') return;
  const { manual: _m, ratio: _r, ...rest } = e;
  void _m;
  void _r;
  change((q) => setEdge(q, on ? { ...rest, manual: true } : rest, lookup.value));
}

/** Common shapes, width : height; Freeform keeps none. */
const RATIOS = [
  { value: '', label: 'Freeform' },
  { value: '1:1', label: 'Square (1:1)' },
  ...['5:4', '4:3', '3:2', '16:9', '2:1'].map((v) => ({ value: v, label: `Wide (${v})` })),
  ...['4:5', '3:4', '2:3', '9:16', '1:2'].map((v) => ({ value: v, label: `Tall (${v})` })),
];
const ratioKey = computed(() => {
  const e = layout.value.edge;
  return e.kind === 'cut' && e.ratio ? `${e.ratio[0]}:${e.ratio[1]}` : '';
});
/** A ratio reshapes the cut to the largest of that shape inside it, about its middle. */
function setRatio(v: string) {
  const e = layout.value.edge;
  if (e.kind !== 'cut') return;
  const [w, h] = v.split(':').map(Number);
  const { ratio: _r, ...rest } = e;
  void _r;
  change((q) =>
    setEdge(
      q,
      w && h ? { ...rest, ratio: [w, h], rect: fitRatio(e.rect, [w, h]) } : rest,
      lookup.value,
    ),
  );
}
const setSnap = (k: 'vertex' | 'edge', v: boolean) =>
  (app.settings.eppCutSnap = { ...app.settings.eppCutSnap, [k]: v });

/** The cut's size in project units; typing a size keeps the cut's middle. */
const cutSize = computed<[number, number]>(() => {
  const e = layout.value.edge;
  if (e.kind !== 'cut') return [0, 0];
  const u = layout.value.unit;
  return [(e.rect[2] - e.rect[0]) * u, (e.rect[3] - e.rect[1]) * u];
});
/** A typed width or height (the other kept, or following an aspect ratio): Manual from then on. */
function resize(width: number | null, height: number | null) {
  const e = layout.value.edge;
  if (e.kind !== 'cut') return;
  const u = layout.value.unit;
  const r = e.ratio ? e.ratio[0] / e.ratio[1] : null;
  let [w, h] = cutSize.value;
  if (width !== null) [w, h] = [width, r ? width / r : h];
  if (height !== null) [w, h] = [r ? height * r : w, height];
  const [cx, cy] = [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2];
  const [hw, hh] = [w / u / 2, h / u / 2];
  const rect: [number, number, number, number] = [cx - hw, cy - hh, cx + hw, cy + hh];
  change((q) => setEdge(q, { ...e, manual: true, rect }, lookup.value), 'epp-cut');
}

const closeCss = computed(() => {
  const e = layout.value.edge;
  const v =
    e.kind === 'close' ? colorLookup(project.doc!, library.items.colors)(e.fill) : undefined;
  return typeof v === 'string' ? v : undefined;
});
function setCloseFill(on: boolean) {
  const fill = on && editor.color ? fillFor(editor.color) : undefined;
  change((q) => setEdge(q, fill ? { kind: 'close', fill } : { kind: 'close' }, lookup.value));
}
</script>

<style scoped>
.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(128, 128, 128, 0.5);
}
</style>
