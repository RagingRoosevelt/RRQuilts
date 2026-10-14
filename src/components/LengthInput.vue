<template>
  <q-input
    :model-value="display"
    dense
    outlined
    type="number"
    :step="step"
    :min="min"
    :label="label"
    :suffix="units"
    :readonly="readonly"
    @update:model-value="set"
  >
    <template v-if="!readonly" #append>
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="remove"
        @click="emit('update:modelValue', clamp(modelValue - step))"
      />
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="add"
        @click="emit('update:modelValue', clamp(modelValue + step))"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { roundLen } from '@/model/units';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    label: string;
    units: string;
    min?: number;
    readonly?: boolean;
  }>(),
  { min: 0, readonly: false },
);
const emit = defineEmits<{ 'update:modelValue': [v: number] }>();

const step = computed(() => (props.units === 'cm' ? 0.5 : 0.25));
const u = computed(() => (props.units === 'cm' ? 'cm' : 'in'));
// Shown and stored rounded, which also cleans up float noise in older values.
const display = computed(() => roundLen(props.modelValue, u.value));
const clamp = (v: number) => Math.max(props.min, roundLen(v, u.value));
function set(v: string | number | null) {
  const n = Number(v);
  if (Number.isFinite(n) && v !== '' && v !== null) emit('update:modelValue', clamp(n));
}
</script>

<style scoped>
/* The −/+ buttons replace the browser's number spinner. */
.q-field :deep(input) {
  -moz-appearance: textfield;
  appearance: textfield;
}
.q-field :deep(input::-webkit-inner-spin-button),
.q-field :deep(input::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
