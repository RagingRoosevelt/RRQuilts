<template>
  <!-- One color (or fabric) and what it becomes: the palette swap dialog's rows and a colorway's
       mapping. The replacement is picked from a grid of swatches in sections, as the palette tray. -->
  <div ref="rowEl" class="row items-center no-wrap" style="gap: 8px">
    <!-- `stacked` (narrow places, the Design sidebar): the swatch above its name. No `from`: just
         the picker (a data quilt's scale, spec 025). -->
    <template v-if="from">
      <!-- `spot` (a colorway's map): tapping the color lights its patches on the quilt. -->
      <button
        v-if="stacked && spot !== undefined"
        type="button"
        class="column items-center ps-from ps-spot"
        :class="{ lit: spot }"
        :aria-pressed="spot"
        :title="`Show where ${from.notecard.name} is`"
        @click="emit('spot')"
      >
        <div class="ps-swatch big" :style="optStyle(from)" />
        <div class="ellipsis text-caption" style="max-width: 100%">{{ from.notecard.name }}</div>
      </button>
      <div v-else-if="stacked" class="column items-center ps-from">
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
      <div class="col ps-name text-left">{{ current?.notecard.name }}</div>
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
      @before-show="onShow"
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
                  v-for="o in cut(s).items"
                  :key="o.id"
                  type="button"
                  class="ps-swatch option"
                  :class="{ active: o.id === modelValue }"
                  :style="optStyle(o)"
                  :title="o.notecard.name"
                  @click="pick(o.id)"
                />
                <button
                  v-if="cut(s).more"
                  type="button"
                  class="ps-more"
                  :aria-label="`Show ${cut(s).more} more`"
                  @click="whole.add(s.key)"
                >
                  +{{ cut(s).more }} more
                </button>
                <button
                  v-else-if="cut(s).long"
                  type="button"
                  class="ps-more"
                  @click="whole.delete(s.key)"
                >
                  Show fewer
                </button>
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
/** Palettes shown whole (by key), likewise. */
const wholes = r(new Set<string>());
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
  /** Stacked: the color is a button that lights its patches (true while lit). */
  spot?: boolean | undefined;
}>();
const emit = defineEmits<{ 'update:modelValue': [id: string]; spot: [] }>();

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
/** A long palette shows its first three rows, the last two places of the third a button for the
 *  rest (owner, 2026-11-25); `whole` shows them all. Rows: the menu's width (as set below, less its
 *  padding) in 36 px swatches with 6 px gaps. */
const ROWS = 3;
const whole = wholes;
function cut(s: { key: string; items: Opt[] }) {
  const w = Math.min(Math.max(rowEl.value?.offsetWidth ?? 300, 300), window.innerWidth * 0.9);
  const n = ROWS * Math.max(3, Math.floor((w - 24 + 6) / 42));
  const long = s.items.length > n;
  if (!long || whole.has(s.key)) return { items: s.items, more: 0, long };
  return { items: s.items.slice(0, n - 2), more: s.items.length - (n - 2), long };
}
/** Opening: fold as below, and show the current pick even when it's past the first rows. */
function onShow() {
  foldAll();
  for (const g of groups.value)
    for (const s of g.subs)
      if (cut(s).items.length < s.items.length && s.items.some((o) => o.id === props.modelValue))
        whole.add(s.key);
}
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
.ps-spot {
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.ps-spot.lit {
  border-color: var(--q-primary);
}
/* Looks like an outlined dense field. */
.ps-field {
  min-width: 0;
  min-height: 40px;
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
/* A long name takes two lines, then ends in … (never widens the sidebar). */
.ps-name {
  min-width: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
  line-height: 1.2;
  padding: 2px 0;
}
/* "+N more" / "Show fewer": two swatches wide. */
.ps-more {
  width: 78px;
  height: 36px;
  padding: 0 4px;
  border: 1px dashed rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 12px;
  line-height: 1.1;
  cursor: pointer;
}
.body--dark .ps-more {
  border-color: rgba(255, 255, 255, 0.35);
}
.ps-more:hover {
  border-color: currentColor;
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
