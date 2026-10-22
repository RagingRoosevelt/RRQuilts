<template>
  <!-- One color (or fabric) and what it becomes: the palette swap dialog's rows and a colorway's
       mapping. The replacement is picked from a grid of swatches in sections, as the palette tray. -->
  <div ref="rowEl" class="row items-center no-wrap" style="gap: 8px">
    <!-- `stacked` (narrow places, the Design sidebar): the swatch above its name. No `from`: just
         the picker (a data quilt's scale, spec 025). -->
    <template v-if="from">
      <div v-if="stacked" class="column items-center ps-from">
        <div class="ps-swatch big" :style="optStyle(from)" />
        <div class="ellipsis text-caption" style="max-width: 100%">{{ from.notecard.name }}</div>
      </div>
      <template v-else>
        <div class="ps-swatch big" :style="optStyle(from)" />
        <div class="ellipsis" style="width: 110px">{{ from.notecard.name }}</div>
      </template>
      <q-icon name="arrow_forward" />
    </template>
    <button
      type="button"
      class="ps-field col row items-center no-wrap"
      :disabled="readonly"
      :aria-label="
        from
          ? `${from.notecard.name} becomes ${current?.notecard.name ?? 'nothing'}`
          : `${label ?? 'Color'}: ${current?.notecard.name ?? 'none'}`
      "
      @click="open = !open"
    >
      <div class="ps-swatch field" :style="optStyle(current)" />
      <div class="col ellipsis text-left">{{ current?.notecard.name }}</div>
      <q-icon name="arrow_drop_down" size="20px" />
    </button>
    <!-- As wide as the whole row (so it stays inside the sidebar), under it; at least 300 px, so a
         narrow row (a data quilt's range) still shows readable swatches. -->
    <q-menu
      v-if="!readonly && rowEl"
      v-model="open"
      :target="rowEl"
      no-parent-event
      :style="{ width: `${Math.max(rowEl.offsetWidth, 300)}px`, maxWidth: '95vw' }"
      anchor="bottom left"
      self="top left"
      class="ps-menu"
      @before-show="foldAll"
    >
      <div class="q-pa-sm">
        <template v-for="g in groups" :key="g.top">
          <button v-if="g.top" type="button" class="ps-head ps-top" @click="toggle(g.top)">
            <q-icon name="expand_more" size="18px" :class="{ shut: shut.has(g.top) }" />
            {{ g.top }}
          </button>
          <template v-if="!shut.has(g.top)">
            <template v-for="s in g.subs" :key="s.key">
              <button v-if="s.sub" type="button" class="ps-head ps-sub" @click="toggle(s.key)">
                <q-icon name="expand_more" size="16px" :class="{ shut: shut.has(s.key) }" />
                {{ s.sub }}
              </button>
              <div v-if="!shut.has(s.key)" class="ps-grid">
                <button
                  v-for="o in s.items"
                  :key="o.id"
                  type="button"
                  class="ps-swatch option"
                  :class="{ active: o.id === modelValue }"
                  :style="optStyle(o)"
                  :title="o.notecard.name"
                  @click="pick(o.id)"
                />
              </div>
            </template>
          </template>
        </template>
      </div>
    </q-menu>
  </div>
</template>

<script lang="ts">
import { reactive as r } from 'vue';
// ponytail: module state, so folds last until reload; localStorage if they should outlive it.
const folds = r(new Set<string>());
let folded = false;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { optStyle, type Opt } from '@/composables/swap-options';

const props = defineProps<{
  from?: Opt | undefined;
  /** Without `from`: what the picker is for (its accessible name). */
  label?: string;
  modelValue: string | undefined;
  options: Opt[];
  readonly?: boolean;
  stacked?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [id: string] }>();

const rowEl = ref<HTMLElement>();
const open = ref(false);
const current = computed(() => props.options.find((o) => o.id === props.modelValue));
/** The options in sections, as the palette tray: each library (or Project palettes, In use) and
 *  its palettes, in the order they first come. */
const groups = computed(() => {
  const out: { top: string; subs: { key: string; sub?: string; items: Opt[] }[] }[] = [];
  for (const o of props.options) {
    const [top = '', sub] = o.section ?? [];
    const key = `${top}\u0000${sub ?? ''}`;
    let g = out.at(-1);
    if (g?.top !== top) out.push((g = { top, subs: [] }));
    let s = g.subs.find((x) => x.key === key);
    if (!s) g.subs.push((s = { key, ...(sub ? { sub } : {}), items: [] }));
    s.items.push(o);
  }
  return out;
});
function pick(id: string) {
  open.value = false;
  emit('update:modelValue', id);
}
/** Folded sections and palettes (by top name or key), shared by every swap menu and kept between
 *  openings (this session). */
const shut = folds;
const toggle = (k: string) => {
  folded = true;
  return shut.has(k) ? shut.delete(k) : shut.add(k);
};
/** First opening: In use and wherever the current pick is stay open; with more than a couple of
 *  palettes the rest start folded, so the list is short. Later openings keep what was folded. */
function foldAll() {
  if (folded) return;
  folded = true;
  shut.clear();
  const subs = groups.value.flatMap((g) => g.subs.map((s) => ({ g, s })));
  if (subs.length <= 2) return;
  for (const { g, s } of subs) {
    const keep = g.top === 'In use' || s.items.some((o) => o.id === props.modelValue);
    if (!keep) shut.add(s.sub ? s.key : g.top);
  }
  // A library none of whose palettes is open folds as a whole.
  for (const g of groups.value)
    if (g.top !== 'In use' && g.subs.every((s) => !s.sub || shut.has(s.key))) shut.add(g.top);
}
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
  max-width: 90vw;
}
.ps-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 2px 4px 6px;
}
/* Section headers fold their swatches. */
.ps-head {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.ps-head .q-icon {
  transition: transform 0.15s;
}
.ps-head .q-icon.shut {
  transform: rotate(-90deg);
}
.ps-top {
  padding: 8px 0 2px;
  font-weight: 500;
}
.ps-sub {
  padding: 2px 4px 4px 8px;
  font-size: 12px;
  opacity: 0.7;
}
</style>
