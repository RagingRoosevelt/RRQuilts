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

const filter = ref<'all' | 'shapes' | 'rosettes'>('all');
function card(id: string, name: string, polys: { poly: Poly; fill?: Fill | undefined }[]) {
  return { id, name, polys: polys.map((p) => ({ poly: p.poly, fill: props.paint(p.fill) })) };
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
        ...(filter.value === 'shapes' ? [] : g.rosettes).map((r) =>
          card(r.id, r.notecard.name, rosetteLocal(r, props.lookup)),
        ),
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
.card.misfit {
  opacity: 0.4;
}
</style>
