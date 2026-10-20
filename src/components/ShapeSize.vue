<template>
  <!-- A shaped block's size (spec 026): type the leg, width or height; the other two follow. -->
  <div class="column" style="gap: 4px">
    <q-option-group
      v-model="by"
      :options="OPTIONS"
      inline
      dense
      :disable="readonly"
      aria-label="Size by"
    />
    <LengthInput
      :model-value="values[by]"
      :label="LABEL[by]"
      :units="units"
      :min="0.5"
      :readonly="readonly"
      @update:model-value="(v) => emit('change', shapeSize(shape, by, v))"
    />
    <div class="text-caption text-grey-7">
      <span v-for="k in others" :key="k" class="q-mr-md" title="Calculated from the typed value">
        {{ LABEL[k] }} {{ fmtLen(values[k], lu) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import { legOf, shapeSize, type BlockShape } from '@/model/blocks/shape';
import { fmtLen } from '@/model/print/format';

type By = 'leg' | 'width' | 'height';
const props = defineProps<{
  shape: BlockShape;
  size: readonly [number, number];
  units: string;
  readonly?: boolean;
}>();
const emit = defineEmits<{ change: [size: [number, number]] }>();

const OPTIONS = [
  { label: 'Leg', value: 'leg' },
  { label: 'Width', value: 'width' },
  { label: 'Height', value: 'height' },
];
const LABEL: Record<By, string> = { leg: 'Leg (side)', width: 'Width', height: 'Height' };
const by = ref<By>('leg');
const lu = computed(() => (props.units === 'cm' ? 'cm' : 'in'));
const values = computed<Record<By, number>>(() => ({
  leg: legOf(props.shape, props.size),
  width: props.size[0],
  height: props.size[1],
}));
const others = computed(() => (['leg', 'width', 'height'] as By[]).filter((k) => k !== by.value));
</script>
