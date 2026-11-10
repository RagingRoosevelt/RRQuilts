<template>
  <div class="column" style="gap: 12px">
    <LengthInput
      :model-value="layout.unit"
      label="1U length"
      :units="units"
      :min="units === 'cm' ? 0.5 : 0.25"
      :readonly="readonly"
      @update:model-value="(v: number) => set({ unit: v }, 'epp-unit')"
    />
    <LengthInput
      :model-value="layout.seam"
      label="Seam allowance"
      :units="units"
      :readonly="readonly"
      @update:model-value="(v: number) => set({ seam: v }, 'epp-seam')"
    />
    <div>
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
      <div class="row no-wrap" style="gap: 8px">
        <LengthInput
          class="col"
          :model-value="cutSize[0]"
          label="Width"
          :units="units"
          :min="layout.unit"
          :readonly="readonly"
          @update:model-value="(v: number) => resize(v, cutSize[1])"
        />
        <LengthInput
          class="col"
          :model-value="cutSize[1]"
          label="Height"
          :units="units"
          :min="layout.unit"
          :readonly="readonly"
          @update:model-value="(v: number) => resize(cutSize[0], v)"
        />
      </div>
      <q-btn
        outline
        dense
        no-caps
        icon="crop_free"
        label="Largest rectangle the pieces fill"
        class="self-start q-px-sm"
        :disable="readonly"
        @click="setEdgeKind('cut', true)"
      />
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
// An EPP quilt's Layout tab (spec 027 FR-001, FR-001a): the length of 1U, the seam allowance and
// the edge. Custom trim waits for spec 055 (owner, 2026-11-10).
import { computed } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { fillFor } from '@/editor/paint';
import { lookupEpp } from '@/model/epp/expand';
import { refresh, setEdge } from '@/model/epp/quilt-ops';
import type { EppEdge, EppLayout } from '@/model/schema/epp';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup } from '@/render/draw';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; units: string; readonly: boolean }>();
const project = useProjectStore();
const library = useLibraryStore();
const editor = useEditorStore();

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

function setEdgeKind(kind: string, fresh = false) {
  const e: EppEdge =
    kind === 'cut'
      ? {
          kind: 'cut',
          rect: fresh || layout.value.edge.kind !== 'cut' ? [0, 0, 0, 0] : layout.value.edge.rect,
        }
      : kind === 'close'
        ? { kind: 'close' }
        : { kind: 'none' };
  change((q) => setEdge(q, e, lookup.value));
}

/** The cut's size in project units; typing a size keeps the cut's middle. */
const cutSize = computed<[number, number]>(() => {
  const e = layout.value.edge;
  if (e.kind !== 'cut') return [0, 0];
  const u = layout.value.unit;
  return [(e.rect[2] - e.rect[0]) * u, (e.rect[3] - e.rect[1]) * u];
});
function resize(w: number, h: number) {
  const e = layout.value.edge;
  if (e.kind !== 'cut') return;
  const u = layout.value.unit;
  const [cx, cy] = [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2];
  const [hw, hh] = [w / u / 2, h / u / 2];
  change(
    (q) => setEdge(q, { kind: 'cut', rect: [cx - hw, cy - hh, cx + hw, cy + hh] }, lookup.value),
    'epp-cut',
  );
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
