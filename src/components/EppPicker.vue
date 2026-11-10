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
          <svg :viewBox="c.box" class="pic">
            <path
              v-for="(p, i) in c.paths"
              :key="i"
              :d="p.d"
              :fill="p.fill"
              stroke="currentColor"
              :stroke-width="c.stroke"
            />
          </svg>
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
import SlidePicker from '@/components/SlidePicker.vue';
import { rosetteLocal, type EppLookup } from '@/model/epp/expand';
import { bbox, place, type Poly } from '@/model/epp/geometry';
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
const d = (poly: Poly) =>
  'M' + poly.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join('L') + 'Z';

function card(id: string, name: string, polys: { poly: Poly; fill?: Fill | undefined }[]) {
  const [x0, y0, x1, y1] = bbox(polys.map((p) => p.poly));
  const pad = Math.max(x1 - x0, y1 - y0) * 0.08 + 0.05;
  return {
    id,
    name,
    box: `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`,
    stroke: Math.max(x1 - x0, y1 - y0) / 60,
    paths: polys.map((p) => ({
      d: d(p.poly),
      fill: props.paint(p.fill) ?? 'rgba(128,128,128,0.15)',
    })),
  };
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
.pic {
  width: 56px;
  height: 56px;
}
</style>
