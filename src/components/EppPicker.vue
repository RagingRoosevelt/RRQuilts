<template>
  <div class="column" style="gap: 8px">
    <q-toggle
      v-if="showUngrouped"
      :model-value="ungrouped"
      dense
      label="Place rosettes ungrouped"
      @update:model-value="(v: boolean) => emit('update:ungrouped', v)"
    >
      <q-tooltip>Place a rosette as its loose patches instead of one linked rosette</q-tooltip>
    </q-toggle>
    <div>
      <div class="text-caption text-grey-8">Scale {{ scale }}</div>
      <q-slider
        :model-value="scale"
        :min="1"
        :max="4"
        :step="1"
        markers
        snap
        dense
        label
        @update:model-value="(v: number | null) => emit('update:scale', v ?? 1)"
      />
    </div>
    <q-separator />
    <div class="text-subtitle2">Shapes and rosettes</div>
    <SlidePicker
      v-model="filter"
      :options="[
        { value: 'all', label: 'All' },
        { value: 'shapes', label: 'Shapes' },
        { value: 'rosettes', label: 'Rosettes' },
      ]"
    />
    <div v-for="g in groups" :key="g.label" class="column" style="gap: 4px">
      <div class="text-caption text-grey-7">{{ g.label }}</div>
      <div class="cards">
        <button
          v-for="c in g.cards"
          :key="c.id"
          type="button"
          class="card"
          :class="{
            on: c.id === picked,
            fits: fit?.(c.id) === true,
            misfit: fit?.(c.id) === false,
          }"
          :title="c.name"
          @click="emit('update:picked', c.id === picked ? null : c.id)"
        >
          <EppThumb :polys="c.polys" />
          <div class="text-caption ellipsis full-width">{{ c.name }}</div>
          <!-- A rosette with several colorings: choose which one shows and is placed. -->
          <span
            v-if="c.colorings.length > 1"
            class="count"
            role="button"
            title="Choose coloring"
            @click.stop
            >{{ c.colorings.length }}
            <q-menu>
              <div class="row q-pa-sm" style="gap: 6px; max-width: 320px">
                <button
                  v-for="k in c.colorings"
                  :key="k.id"
                  v-close-popup
                  type="button"
                  class="pick-coloring"
                  :class="{ active: k.id === c.coloring }"
                  :title="k.name"
                  @click="pickColoring(c.id, k.id)"
                >
                  <EppThumb :polys="k.polys" />
                </button>
              </div>
            </q-menu>
          </span>
        </button>
      </div>
    </div>
    <div v-if="!groups.length" class="text-caption text-grey-7">Nothing to place yet.</div>
  </div>
</template>

<script setup lang="ts">
// The EPP picker (specs 027, 050): shapes and rosettes to place, at the Scale picked above them.
// In Grow mode, while an edge is hovered, cards show whether they fit it (`fit`).
import { computed, ref } from 'vue';
import EppThumb from '@/components/EppThumb.vue';
import { useEppEditorStore } from '@/stores/epp-editor';
import SlidePicker from '@/components/SlidePicker.vue';
import { rosetteLocal, type EppLookup } from '@/model/epp/expand';
import { place, type Poly } from '@/model/epp/geometry';
import type { EppShape, Rosette } from '@/model/schema/epp';
import type { Fill } from '@/model/schema/coloring';

export interface PickerGroup {
  label: string;
  shapes: EppShape[];
  rosettes: Rosette[];
}

const props = defineProps<{
  groups: PickerGroup[];
  lookup: EppLookup;
  picked: string | null;
  scale: number;
  ungrouped?: boolean;
  showUngrouped?: boolean;
  /** A fill as a CSS color (thumbnails). */
  paint: (f: Fill | undefined) => string | undefined;
  fit?: ((id: string) => boolean | undefined) | undefined;
}>();
const emit = defineEmits<{
  'update:picked': [id: string | null];
  'update:scale': [n: number];
  'update:ungrouped': [v: boolean];
}>();

const epp = useEppEditorStore();
const filter = ref<'all' | 'shapes' | 'rosettes'>('all');
const css = (polys: { poly: Poly; fill?: Fill | undefined }[]) =>
  polys.map((p) => ({ poly: p.poly, fill: props.paint(p.fill) }));
interface Card {
  id: string;
  name: string;
  polys: { poly: Poly; fill?: string | undefined }[];
  coloring?: string | undefined;
  colorings: { id: string; name: string; polys: { poly: Poly; fill?: string | undefined }[] }[];
}
function card(id: string, name: string, polys: { poly: Poly; fill?: Fill | undefined }[]): Card {
  return { id, name, polys: css(polys), colorings: [] };
}
function rosetteCard(r: Rosette): Card {
  const chosen = epp.coloringOf.get(r.id);
  const coloring = r.colorings.some((c) => c.id === chosen) ? chosen : r.colorings[0]?.id;
  return {
    id: r.id,
    name: r.notecard.name,
    polys: css(rosetteLocal(r, props.lookup, coloring)),
    coloring,
    colorings:
      r.colorings.length > 1
        ? r.colorings.map((c, i) => ({
            id: c.id,
            name: c.name ?? `Coloring ${i + 1}`,
            polys: css(rosetteLocal(r, props.lookup, c.id)),
          }))
        : [],
  };
}
/** Choosing a coloring also picks the rosette, ready to place. */
function pickColoring(id: string, coloring: string) {
  epp.coloringOf.set(id, coloring);
  emit('update:picked', id);
}

const groups = computed(() =>
  props.groups
    .map((g) => ({
      label: g.label,
      cards: [
        ...(filter.value === 'rosettes' ? [] : g.shapes).map((s) =>
          card(s.id, s.notecard.name, [
            { poly: place(s.outline, { at: [0, 0], turn: 0, scale: 1 }), fill: s.fill },
          ]),
        ),
        ...(filter.value === 'shapes' ? [] : g.rosettes).map(rosetteCard),
      ],
    }))
    .filter((g) => g.cards.length),
);
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  grid-auto-rows: max-content;
  align-content: start;
  gap: 6px;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  min-width: 0;
}
.card.on {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 1px var(--q-primary);
}
.card.fits {
  background: rgba(46, 125, 50, 0.18);
}
.card {
  position: relative;
}
.count {
  position: absolute;
  right: 2px;
  top: 2px;
  min-width: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: white;
  background: var(--q-primary);
  cursor: pointer;
}
.pick-coloring {
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  cursor: pointer;
}
.pick-coloring.active {
  border-color: var(--q-primary);
}
.card.misfit {
  opacity: 0.4;
}
</style>
