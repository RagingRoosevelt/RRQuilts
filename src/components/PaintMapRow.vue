<template>
  <!-- One color (or fabric) and what it becomes: the palette swap dialog's rows and a colorway's
       mapping. -->
  <div class="row items-center no-wrap" style="gap: 8px">
    <div class="ps-swatch big" :style="optStyle(from)" />
    <div class="ellipsis" style="width: 110px">{{ from.notecard.name }}</div>
    <q-icon name="arrow_forward" />
    <q-select
      :model-value="modelValue"
      :options="options"
      option-value="id"
      :option-label="(o) => o.notecard.name"
      emit-value
      map-options
      dense
      outlined
      :readonly="readonly"
      class="col"
      @update:model-value="(v) => emit('update:modelValue', v)"
    >
      <template #prepend>
        <div class="ps-swatch" :style="optStyle(options.find((o) => o.id === modelValue))" />
      </template>
      <template #option="{ itemProps, opt }">
        <q-item v-bind="itemProps" dense>
          <q-item-section side>
            <div class="ps-swatch" :style="optStyle(opt)" />
          </q-item-section>
          <q-item-section>
            {{ opt.notecard.name }}
            <span class="text-caption text-grey-7">{{ opt.from }}</span>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { optStyle, type Opt } from '@/composables/swap-options';

defineProps<{ from: Opt; modelValue: string | undefined; options: Opt[]; readonly?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [id: string] }>();
</script>

<style>
/* Swatches (also in the select's menu, rendered in <body>, so not scoped). */
.ps-swatch {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex: none;
}
.ps-swatch.big {
  width: 28px;
  height: 28px;
}
</style>
