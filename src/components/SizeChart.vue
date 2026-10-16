<template>
  <!-- "?" with the size chart (body measurements) for a garment's size list. -->
  <q-icon name="help_outline" size="sm" class="text-grey-7" tabindex="0" aria-label="Size chart">
    <q-tooltip class="text-body2">
      <table class="size-chart">
        <thead>
          <tr>
            <th>Size</th>
            <th v-for="h in head" :key="h">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.size">
            <td>{{ r.size }}</td>
            <td v-for="(c, k) in r.cols" :key="k">{{ c }}</td>
          </tr>
        </tbody>
      </table>
      <div class="text-caption">Body measurements, {{ units }}</div>
    </q-tooltip>
  </q-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sizeRows, type Fit } from '@/model/garments';

const props = defineProps<{
  garment: 'top' | 'pants';
  fit: Fit;
  region: 'us' | 'eu';
  units: string;
}>();

/** Tops by bust or chest, waist, hip; pants by waist, hip, rise. Project units (cm whole). */
const head = computed(() =>
  props.garment === 'pants'
    ? ['Waist', 'Hip', 'Rise']
    : [props.fit === 'men' ? 'Chest' : 'Bust', 'Waist', 'Hip'],
);
const rows = computed(() =>
  sizeRows(props.garment, props.fit).map((r) => {
    const u = (v: number) => (props.units === 'cm' ? Math.round(v * 2.54) : +v.toFixed(2));
    const { m } = r;
    const cols = props.garment === 'pants' ? [m.waist, m.hip, m.rise] : [m.bust, m.waist, m.hip];
    return { size: props.region === 'eu' ? `${r.eu} (US ${r.us})` : r.us, cols: cols.map(u) };
  }),
);
</script>

<style scoped>
.size-chart {
  border-collapse: collapse;
}
.size-chart th,
.size-chart td {
  padding: 1px 8px;
  text-align: right;
}
</style>
