<template>
  <!-- Single choice among a few options: labels sit in the track, the picked one rides on a thumb
       that slides between positions. Arrow keys move the choice. -->
  <div
    class="slide-picker"
    role="radiogroup"
    :aria-label="label"
    tabindex="0"
    @keydown.left.prevent="step(-1)"
    @keydown.right.prevent="step(1)"
  >
    <div
      class="thumb"
      :style="{
        width: `calc((100% - 6px) / ${options.length})`,
        transform: `translateX(${index * 100}%)`,
      }"
    />
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      role="radio"
      tabindex="-1"
      class="option"
      :class="{ on: o.value === modelValue }"
      :aria-checked="o.value === modelValue"
      @click="emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  options: { label: string; value: string }[];
  label?: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const index = computed(() =>
  Math.max(
    0,
    props.options.findIndex((o) => o.value === props.modelValue),
  ),
);
function step(d: number) {
  const o = props.options[index.value + d];
  if (o) emit('update:modelValue', o.value);
}
</script>

<style scoped>
.slide-picker {
  position: relative;
  display: flex;
  padding: 3px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.18);
  outline: none;
}
.slide-picker:focus-visible {
  box-shadow: 0 0 0 2px var(--q-primary);
}
.thumb {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  border-radius: 999px;
  background: var(--q-primary);
  transition: transform 0.2s ease;
}
.option {
  position: relative;
  flex: 1;
  border: 0;
  background: none;
  padding: 6px 4px;
  font: inherit;
  font-size: 13px;
  color: inherit;
  opacity: 0.75;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}
.option.on {
  color: white;
  opacity: 1;
  font-weight: 500;
}
</style>
