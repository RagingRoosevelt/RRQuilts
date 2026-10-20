<template>
  <!-- Flow angle (spec 026): how far the grid of triangles, diamonds or hexagons is turned. -->
  <div class="column">
    <div class="row items-center justify-between">
      <span class="text-caption">Flow angle</span>
      <span class="text-caption">{{ modelValue ?? 0 }}°</span>
    </div>
    <q-slider
      :model-value="modelValue ?? 0"
      :min="0"
      :max="360"
      :step="1"
      :disable="readonly"
      label
      :label-value="`${modelValue ?? 0}°`"
      aria-label="Flow angle"
      @update:model-value="(v) => emit('update:modelValue', settle(v ?? 0))"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: number | undefined; readonly?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [v: number] }>();

/** Within 3° of a multiple of 15°, settle on it (easy to hit 0, 30, 45, 60, 90…). */
const settle = (v: number) => {
  const near = Math.round(v / 15) * 15;
  return Math.abs(v - near) <= 3 ? near : v;
};
</script>
