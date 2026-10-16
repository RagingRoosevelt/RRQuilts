<template>
  <!-- Settings › Quilt and block design › Reference overlay: size lists and the quilter's own top,
       pants, and bed, where those targets start. Each stays unset until given here or first used
       in the new quilt wizard. -->
  <div class="column" style="gap: 28px">
    <FieldGroup label="Size lists">
      <q-btn-toggle
        v-model="settings.bedSizes"
        no-caps
        unelevated
        toggle-color="primary"
        :options="[
          { label: 'Auto (by units)', value: 'auto' },
          { label: 'US', value: 'us' },
          { label: 'European', value: 'eu' },
        ]"
      />
    </FieldGroup>

    <FieldGroup v-for="g in GARMENTS" :key="g.key" :label="g.label">
      <div class="column" style="gap: 8px">
        <template v-if="mine[g.key]">
          <div class="row no-wrap" style="gap: 8px">
            <q-btn-toggle
              :model-value="mine[g.key]!.fit"
              no-caps
              unelevated
              toggle-color="primary"
              :options="[
                { label: 'Women\'s', value: 'women' },
                { label: 'Men\'s', value: 'men' },
              ]"
              @update:model-value="(fit) => setGarment(g.key, { fit, size: middle(g.key, fit) })"
            />
            <q-select
              :model-value="mine[g.key]!.size"
              class="col"
              dense
              outlined
              :label="g.key === 'pants' && mine.pants?.fit === 'men' ? 'Waist size' : 'Size'"
              :options="sizeOptions(g.key)"
              emit-value
              map-options
              @update:model-value="(size) => setGarment(g.key, { size })"
            />
            <SizeChart
              class="self-center"
              :garment="g.key"
              :fit="mine[g.key]!.fit"
              :region="region"
              :units="units"
            />
          </div>
          <LengthInput
            :model-value="shown(g.key === 'top' ? mine.top?.sleeveLength : mine.pants?.inseam, g)"
            :label="g.length"
            :units="units"
            :min="1"
            @update:model-value="(v) => setGarment(g.key, { [g.lengthKey]: inch(v) })"
          />
          <q-btn class="self-end" flat dense no-caps label="Clear" @click="clear(g.key)" />
        </template>
        <div v-else class="row items-center" style="gap: 8px">
          <div class="text-caption text-grey-8 col">
            Not set. Your first {{ g.noun }} in the new quilt wizard sets it.
          </div>
          <q-btn flat dense no-caps label="Set now" @click="start(g.key)" />
        </div>
      </div>
    </FieldGroup>

    <FieldGroup label="Your bed">
      <div class="column" style="gap: 8px">
        <template v-if="mine.bed">
          <div v-if="mine.bed.region !== region" class="text-caption text-grey-8">
            Your bed, {{ mine.bed.name }}, is from the
            {{ mine.bed.region === 'us' ? 'US' : 'European' }} sizes. Pick one from these to use the
            {{ region === 'us' ? 'US' : 'European' }} sizes.
          </div>
          <q-select
            :model-value="mine.bed.region === region ? mine.bed.name : null"
            dense
            outlined
            label="Bed (mattress size)"
            :options="beds"
            emit-value
            map-options
            @update:model-value="(name) => setBed({ name, region, tall: false })"
          />
          <LengthInput
            :model-value="shown(mine.bed.drop)"
            label="Drop over the sides and foot"
            :units="units"
            :min="0"
            @update:model-value="(v) => setBed({ drop: inch(v) })"
          />
          <q-checkbox
            v-if="bedTarget?.tall"
            :model-value="!!mine.bed.tall"
            label="Tall (XL)"
            @update:model-value="(tall) => setBed({ tall })"
          />
          <q-checkbox
            :model-value="(mine.bed.tuck ?? 0) > 0"
            label="Pillow tuck"
            @update:model-value="(on) => setBed({ tuck: on ? 12 : 0 })"
          />
          <LengthInput
            v-if="(mine.bed.tuck ?? 0) > 0"
            :model-value="shown(mine.bed.tuck)"
            label="Pillow tuck at the head"
            :units="units"
            :min="0"
            @update:model-value="(v) => setBed({ tuck: inch(v) })"
          />
          <q-btn class="self-end" flat dense no-caps label="Clear" @click="clear('bed')" />
        </template>
        <div v-else class="row items-center" style="gap: 8px">
          <div class="text-caption text-grey-8 col">
            Not set. Your first bed in the new quilt wizard sets it.
          </div>
          <q-btn flat dense no-caps label="Set now" @click="startBed" />
        </div>
      </div>
    </FieldGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FieldGroup from '@/components/FieldGroup.vue';
import LengthInput from '@/components/LengthInput.vue';
import SizeChart from '@/components/SizeChart.vue';
import { sizeRows, type Fit } from '@/model/garments';
import { TARGETS, defaultRegion, fromRegion, type OverlayDefaults } from '@/model/targets';
import { useSettingsStore } from '@/stores/settings';

const store = useSettingsStore();
const settings = store.settings;
const mine = computed(() => settings.overlayDefaults);
const units = computed(() => settings.units);
const k = computed(() => (units.value === 'cm' ? 2.54 : 1));
/** Stored in inches, shown in the units preference. */
const inch = (v: number) => +(v / k.value).toFixed(3);
const shown = (v: number | undefined, g?: { key: 'top' | 'pants' }) => {
  const fallback = g ? (g.key === 'top' ? sizeRow(g.key)?.m.arm : 30.5) : 0;
  const x = (v ?? fallback ?? 0) * k.value;
  return units.value === 'cm' ? Math.round(x * 2) / 2 : x;
};

const GARMENTS = [
  {
    key: 'top',
    label: 'Your top',
    noun: 'top',
    length: 'Sleeve length, shoulder to hem',
    lengthKey: 'sleeveLength',
  },
  {
    key: 'pants',
    label: 'Your pants',
    noun: 'pair of pants',
    length: 'Inseam',
    lengthKey: 'inseam',
  },
] as const;

const set = (next: OverlayDefaults) => (settings.overlayDefaults = next);
function clear(key: keyof OverlayDefaults) {
  const next = { ...mine.value };
  delete next[key];
  set(next);
}

const rowsOf = (key: 'top' | 'pants', fit: Fit) => sizeRows(key, fit);
const middle = (key: 'top' | 'pants', fit: Fit) =>
  rowsOf(key, fit)[key === 'pants' && fit === 'women' ? 4 : 2]!.us;
const sizeRow = (key: 'top' | 'pants') => {
  const m = mine.value[key];
  return m ? rowsOf(key, m.fit).find((r) => r.us === m.size) : undefined;
};
const region = computed(() => defaultRegion(settings.bedSizes, units.value));
const sizeOptions = (key: 'top' | 'pants') => {
  const m = mine.value[key];
  if (!m) return [];
  return rowsOf(key, m.fit).map((r) => ({
    label: region.value === 'eu' ? `${r.eu} (US ${r.us})` : r.us,
    value: r.us,
  }));
};
function setGarment(key: 'top' | 'pants', patch: Record<string, unknown>) {
  set({ ...mine.value, [key]: { ...mine.value[key]!, ...patch } });
}
function start(key: 'top' | 'pants') {
  set({ ...mine.value, [key]: { fit: 'women', size: middle(key, 'women') } });
}

// Bed: from the list for the size lists in use (its region is kept with it).
// The beds of the size lists in use (Auto follows the units).
const beds = computed(() =>
  TARGETS[region.value]
    .filter((t) => t.drop !== undefined)
    .map((t) => {
      const [w, h] = t.size.map((v) => fromRegion(v, region.value, units.value));
      return { label: `${t.name}, ${w} × ${h} ${units.value}`, value: t.name };
    }),
);
const bedTarget = computed(() =>
  TARGETS[mine.value.bed?.region ?? 'us'].find((t) => t.name === mine.value.bed?.name),
);
function setBed(patch: Partial<NonNullable<OverlayDefaults['bed']>>) {
  set({ ...mine.value, bed: { ...mine.value.bed!, ...patch } });
}
function startBed() {
  const r = region.value;
  const t = TARGETS[r].find((x) => x.name === (r === 'us' ? 'Queen' : 'Standard double / Queen'))!;
  set({
    ...mine.value,
    bed: { region: r, name: t.name, drop: +fromRegion(t.drop!, r, 'in').toFixed(3), tuck: 0 },
  });
}
</script>
