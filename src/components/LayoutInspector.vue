<template>
  <div class="q-gutter-md">
    <div class="text-subtitle2">Layout</div>
    <q-select
      :model-value="layout.style"
      dense
      outlined
      label="Style"
      :options="[
        { label: 'Straight Set', value: 'straight-set' },
        { label: 'On-Point', value: 'on-point' },
        { label: 'Horizontal Strip', value: 'horizontal-strip' },
        { label: 'Vertical Strip', value: 'vertical-strip' },
        ...soon,
      ]"
      emit-value
      map-options
      option-disable="disable"
      :readonly="readonly"
      @update:model-value="(v) => emit('change', convertLayout(layout, v, lu), '')"
    />
    <StripsInspector
      v-if="layout.style === 'horizontal-strip' || layout.style === 'vertical-strip'"
      :layout="layout"
      :units="units"
      :readonly="readonly"
      :hint="hint"
      @change="(l, k) => emit('change', l, k)"
    />
    <template v-else-if="layout.style === 'on-point'">
      <div class="row q-col-gutter-sm">
        <q-input
          class="col-6"
          :model-value="layout.cols"
          dense
          outlined
          type="number"
          label="Blocks across"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('cols', v)"
        />
        <q-input
          class="col-6"
          :model-value="layout.rows"
          dense
          outlined
          type="number"
          label="Blocks down"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('rows', v)"
        />
      </div>
      <div>
        <LengthInput
          :model-value="layout.block"
          label="Finished block size"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => op({ block: v }, 'block')"
        />
        <div class="text-caption text-grey-7">
          Width on point: {{ fmtLen(layout.block * Math.SQRT2, lu) }}
        </div>
      </div>
      <LengthInput
        :model-value="layout.sash"
        label="Sashing width (0 for none)"
        :units="units"
        :readonly="readonly"
        @update:model-value="(v) => op({ sash: v }, 'sash')"
      />
      <q-btn-toggle
        :model-value="layout.corner"
        dense
        no-caps
        spread
        :options="[
          { label: 'Corner triangle', value: 'triangle' },
          { label: 'Seam', value: 'seam' },
        ]"
        :disable="readonly"
        @update:model-value="(v) => op({ corner: v }, '')"
      />
      <q-select
        :model-value="layout.edge.finish"
        dense
        outlined
        label="Edge"
        :options="edgeOptions"
        emit-value
        map-options
        :readonly="readonly"
        @update:model-value="(v) => edge({ finish: v }, '')"
      >
        <template #option="{ opt, itemProps }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label>{{ opt.label }}</q-item-label>
              <q-item-label caption>{{ opt.hint }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <LengthInput
        v-if="layout.edge.finish === 'float'"
        :model-value="layout.edge.float"
        label="Float"
        :units="units"
        :min="0"
        :readonly="readonly"
        @update:model-value="(v) => edge({ float: v }, 'float')"
      />
      <div v-if="layout.edge.finish === 'none' && hasBorders" class="text-caption text-grey-8">
        Borders are set aside while the edge is unfilled. They come back with another edge.
      </div>
    </template>
    <template v-else-if="layout.style === 'straight-set'">
      <div class="row q-col-gutter-sm">
        <q-input
          class="col-6"
          :model-value="layout.cols"
          dense
          outlined
          type="number"
          label="Columns"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('cols', v)"
        />
        <q-input
          class="col-6"
          :model-value="layout.rows"
          dense
          outlined
          type="number"
          label="Rows"
          min="1"
          max="100"
          :readonly="readonly"
          @update:model-value="(v) => setCount('rows', v)"
        />
      </div>
      <div class="text-caption">Finished block size</div>
      <q-toggle
        v-model="squareBlock"
        dense
        label="Keep width and height equal"
        :disable="readonly"
      />
      <div class="row q-col-gutter-sm">
        <LengthInput
          class="col-6"
          :model-value="layout.block[0]"
          label="Width"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => setPair('block', 0, v, squareBlock)"
        />
        <LengthInput
          class="col-6"
          :model-value="layout.block[1]"
          label="Height"
          :units="units"
          :min="0.25"
          :readonly="readonly"
          @update:model-value="(v) => setPair('block', 1, v, squareBlock)"
        />
      </div>
      <div class="text-caption">Sashing (0 for none)</div>
      <q-toggle
        v-model="squareSash"
        dense
        label="Keep width and height equal"
        :disable="readonly"
      />
      <div class="row q-col-gutter-sm">
        <LengthInput
          class="col-6"
          :model-value="layout.sash[0]"
          label="Width"
          :units="units"
          :readonly="readonly"
          @update:model-value="(v) => setPair('sash', 0, v, squareSash)"
        />
        <LengthInput
          class="col-6"
          :model-value="layout.sash[1]"
          label="Height"
          :units="units"
          :readonly="readonly"
          @update:model-value="(v) => setPair('sash', 1, v, squareSash)"
        />
      </div>
      <q-toggle
        :model-value="layout.sashBorder"
        dense
        label="Sashing around the outside"
        :disable="readonly"
        @update:model-value="(v) => hz({ sashBorder: v })"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import StripsInspector from '@/components/StripsInspector.vue';
import { convertLayout } from '@/model/layout/slots';
import { fmtLen } from '@/model/print/format';
import type { HorizontalLayout, Layout, OnPointLayout } from '@/model/schema/quilt';

const props = defineProps<{
  layout: Layout;
  units: string;
  readonly: boolean;
  hasBorders?: boolean;
  hint?: string | undefined;
}>();
const emit = defineEmits<{ change: [layout: Layout, coalesce: string] }>();
const op = (patch: Partial<OnPointLayout>, k = '') =>
  emit('change', { ...(props.layout as OnPointLayout), ...patch }, k);
const edge = (patch: Partial<OnPointLayout['edge']>, k = '') => {
  const l = props.layout as OnPointLayout;
  op({ edge: { ...l.edge, ...patch } }, k);
};
const hz = (patch: Partial<HorizontalLayout>, k = '') =>
  emit('change', { ...(props.layout as HorizontalLayout), ...patch }, k);
const lu = computed(() => (props.units === 'cm' ? 'cm' : 'in'));
const edgeOptions = [
  { label: 'Exact', value: 'exact', hint: 'Block points meet the edge' },
  { label: 'Floating', value: 'float', hint: 'Blocks float, trim after' },
  { label: 'Trimmed blocks', value: 'trim', hint: 'Partial blocks, trim after' },
  { label: 'No fill', value: 'none', hint: 'Bind the uneven edge' },
];

const soon = ['Variable Point', 'Baby Blocks', 'Variable Blocks', 'One Patch', 'Custom Set'].map(
  (label) => ({ label: `${label} (coming soon)`, value: label, disable: true }),
);
const pair = (k: 'block' | 'sash') => {
  const v = (props.layout as HorizontalLayout)[k];
  return Array.isArray(v) && v[0] === v[1];
};
const squareBlock = ref(props.layout.style !== 'straight-set' || pair('block'));
const squareSash = ref(props.layout.style !== 'straight-set' || pair('sash'));

function setCount(key: 'cols' | 'rows', v: string | number | null) {
  const n = Math.round(Number(v));
  if (n >= 1 && n <= 100) emit('change', { ...props.layout, [key]: n }, key);
}

function setPair(key: 'block' | 'sash', i: 0 | 1, v: number, locked: boolean) {
  const l = props.layout as HorizontalLayout;
  const p: [number, number] = [...l[key]];
  p[i] = v;
  if (locked) p[1 - i] = v;
  emit('change', { ...l, [key]: p }, `${key}`);
}
</script>
