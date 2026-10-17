<template>
  <!-- One color (or fabric) and what it becomes: the palette swap dialog's rows and a colorway's
       mapping. The replacement is picked from a grid of swatches in sections, as the palette tray. -->
  <div class="row items-center no-wrap" style="gap: 8px">
    <!-- `stacked` (narrow places, the Design sidebar): the swatch above its name. -->
    <div v-if="stacked" class="column items-center ps-from">
      <div class="ps-swatch big" :style="optStyle(from)" />
      <div class="ellipsis text-caption" style="max-width: 100%">{{ from.notecard.name }}</div>
    </div>
    <template v-else>
      <div class="ps-swatch big" :style="optStyle(from)" />
      <div class="ellipsis" style="width: 110px">{{ from.notecard.name }}</div>
    </template>
    <q-icon name="arrow_forward" />
    <button
      type="button"
      class="ps-field col row items-center no-wrap"
      :disabled="readonly"
      :aria-label="`${from.notecard.name} becomes ${current?.notecard.name ?? 'nothing'}`"
    >
      <div class="ps-swatch field" :style="optStyle(current)" />
      <div class="col ellipsis text-left">{{ current?.notecard.name }}</div>
      <q-icon name="arrow_drop_down" size="20px" />
      <q-menu v-if="!readonly" anchor="bottom left" self="top left" class="ps-menu">
        <div class="q-pa-sm">
          <template v-for="s in sections" :key="s.key">
            <div v-if="s.top" class="ps-top">{{ s.top }}</div>
            <div v-if="s.sub" class="ps-sub">{{ s.sub }}</div>
            <div class="ps-grid">
              <button
                v-for="o in s.items"
                :key="o.id"
                v-close-popup
                type="button"
                class="ps-swatch option"
                :class="{ active: o.id === modelValue }"
                :style="optStyle(o)"
                :title="o.notecard.name"
                @click="emit('update:modelValue', o.id)"
              />
            </div>
          </template>
        </div>
      </q-menu>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { optStyle, type Opt } from '@/composables/swap-options';

const props = defineProps<{
  from: Opt;
  modelValue: string | undefined;
  options: Opt[];
  readonly?: boolean;
  stacked?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [id: string] }>();

const current = computed(() => props.options.find((o) => o.id === props.modelValue));
/** The options in sections, as the palette tray: each library (or Project palettes) and its
 *  palettes, in the order they first come (a library's name shown once). */
const sections = computed(() => {
  const key = (o: Opt) => o.section?.join('\u0000') ?? '';
  let top: string | undefined;
  return [...new Set(props.options.map(key))].map((k) => {
    const items = props.options.filter((o) => key(o) === k);
    const [t, sub] = items[0]!.section ?? [];
    const s = { key: k, top: t !== top ? t : undefined, sub, items };
    top = t;
    return s;
  });
});
</script>

<style>
/* Swatches and the menu (rendered in <body>, so not scoped). */
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
.ps-swatch.field {
  width: 24px;
  height: 24px;
}
.ps-swatch.option {
  width: 36px;
  height: 36px;
  padding: 0;
  cursor: pointer;
}
.ps-swatch.option.active {
  outline: 2px solid var(--q-primary);
  outline-offset: 1px;
}
.ps-from {
  width: 64px;
  flex: none;
}
/* Looks like an outlined dense field. */
.ps-field {
  min-width: 0;
  height: 40px;
  gap: 8px;
  padding: 0 4px 0 8px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.body--dark .ps-field {
  border-color: rgba(255, 255, 255, 0.28);
}
.ps-field:hover:not([disabled]) {
  border-color: currentColor;
}
.ps-field[disabled] {
  cursor: default;
}
.ps-menu {
  width: 300px;
  max-width: 90vw;
}
.ps-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 2px 4px 6px;
}
.ps-top {
  padding: 8px 4px 2px;
  font-weight: 500;
}
.ps-sub {
  padding: 2px 4px 4px 12px;
  font-size: 12px;
  opacity: 0.7;
}
</style>
