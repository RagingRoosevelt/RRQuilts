<template>
  <div class="q-gutter-md">
    <div class="text-subtitle2">Layout</div>
    <q-select
      :model-value="'horizontal'"
      dense
      outlined
      label="Style"
      :options="[{ label: 'Horizontal', value: 'horizontal' }, ...soon]"
      emit-value
      map-options
      option-disable="disable"
      :readonly="readonly"
    />
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
    <q-toggle v-model="squareBlock" dense label="Keep width and height equal" :disable="readonly" />
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
    <q-toggle v-model="squareSash" dense label="Keep width and height equal" :disable="readonly" />
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
      @update:model-value="(v) => emit('change', { ...layout, sashBorder: v }, '')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import type { HorizontalLayout } from '@/model/schema/quilt';

const props = defineProps<{ layout: HorizontalLayout; units: string; readonly: boolean }>();
const emit = defineEmits<{ change: [layout: HorizontalLayout, coalesce: string] }>();

const soon = [
  'On-Point',
  'Variable Point',
  'Baby Blocks',
  'Variable Blocks',
  'Strips',
  'One Patch',
  'Custom Set',
].map((label) => ({ label: `${label} (coming soon)`, value: label, disable: true }));
const squareBlock = ref(props.layout.block[0] === props.layout.block[1]);
const squareSash = ref(props.layout.sash[0] === props.layout.sash[1]);

function setCount(key: 'cols' | 'rows', v: string | number | null) {
  const n = Math.round(Number(v));
  if (n >= 1 && n <= 100) emit('change', { ...props.layout, [key]: n }, key);
}

function setPair(key: 'block' | 'sash', i: 0 | 1, v: number, locked: boolean) {
  const pair: [number, number] = [...props.layout[key]];
  pair[i] = v;
  if (locked) pair[1 - i] = v;
  emit('change', { ...props.layout, [key]: pair }, `${key}`);
}
</script>
