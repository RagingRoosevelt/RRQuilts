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
const display = computed(() => Number(props.modelValue.toFixed(4)));
const clamp = (v: number) => Math.max(props.min, Math.round(v * 10000) / 10000);
function set(v: string | number | null) {
  const n = Number(v);
  if (Number.isFinite(n) && v !== '' && v !== null) emit('update:modelValue', clamp(n));
}
</script>
