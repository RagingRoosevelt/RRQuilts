<template>
  <!-- The reference overlay's tint: a swatch that opens Quasar's color picker (not the browser's). -->
  <button
    type="button"
    class="tint"
    :style="{ background: modelValue }"
    :disabled="disable"
    aria-label="Overlay tint"
    title="Overlay tint (shared by Layout and print)"
  >
    <q-menu v-if="!disable" anchor="bottom left" self="top left">
      <q-color
        :model-value="modelValue"
        no-header-tabs
        default-view="palette"
        format-model="hex"
        :palette="PALETTE"
        style="width: 240px"
        @change="(v: string | null) => v && emit('update:modelValue', v)"
      />
    </q-menu>
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; disable?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [tint: string] }>();

/** Colors that read well over quilts; any other from the picker's Spectrum tab. */
const PALETTE = [
  '#1976d2',
  '#d32f2f',
  '#2e7d32',
  '#f57c00',
  '#7b1fa2',
  '#00838f',
  '#c2185b',
  '#5d4037',
  '#212121',
  '#757575',
];
</script>

<style scoped>
.tint {
  width: 48px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(128, 128, 128, 0.5);
  border-radius: 4px;
  cursor: pointer;
}
.tint:disabled {
  cursor: default;
}
</style>
