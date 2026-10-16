<template>
  <!-- A target size to aim the quilt at (spec 006 FR-001a); used by the wizard and the Layout tab. -->
  <div class="column" style="gap: 8px">
    <q-btn-toggle
      :model-value="modelValue.region"
      spread
      no-caps
      unelevated
      toggle-color="primary"
      :readonly="readonly"
      :options="[
        { label: 'US sizes', value: 'us' },
        { label: 'European sizes', value: 'eu' },
      ]"
      @update:model-value="setRegion"
    />
    <q-select
      :model-value="modelValue.choice"
      dense
      outlined
      label="Target size"
      :options="options"
      emit-value
      map-options
      :readonly="readonly"
      :hint="hint"
      @update:model-value="choose"
    >
      <template #option="scope">
        <div v-if="scope.opt.header" class="target-header">{{ scope.opt.label }}</div>
        <q-item v-else v-bind="scope.itemProps">
          <q-item-section>{{ scope.opt.name ?? scope.opt.label }}</q-item-section>
          <q-item-section v-if="scope.opt.size" side>{{ scope.opt.size }}</q-item-section>
        </q-item>
      </template>
    </q-select>

    <div v-if="garment" class="q-mt-md column" style="gap: 8px">
      <!-- Fit and piece side by side where there's room, else the piece on its own line. -->
      <div class="row" style="gap: 8px">
        <q-btn-toggle
          :model-value="modelValue.fit ?? 'women'"
          no-caps
          unelevated
          toggle-color="primary"
          :readonly="readonly"
          :options="[
            { label: 'Women\'s', value: 'women' },
            { label: 'Men\'s', value: 'men' },
          ]"
          @update:model-value="setFit"
        />
        <q-btn-toggle
          :model-value="modelValue.piece ?? 'front'"
          style="flex: 1 1 210px"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          :readonly="readonly"
          :options="pieces"
          @update:model-value="(piece) => set({ piece })"
        />
      </div>
      <div class="row items-center no-wrap" style="gap: 8px">
        <q-select
          :model-value="row.us"
          class="col"
          dense
          outlined
          :label="garment === 'pants' && modelValue.fit === 'men' ? 'Waist size' : 'Size'"
          :options="sizeOptions"
          emit-value
          map-options
          :readonly="readonly"
          @update:model-value="setSize"
        />
        <SizeChart
          :garment="garment"
          :fit="modelValue.fit ?? 'women'"
          :region="modelValue.region"
          :units="units"
        />
      </div>
      <LengthInput
        v-if="garment === 'top' && modelValue.piece === 'sleeve'"
        :model-value="modelValue.sleeveLength ?? 0"
        label="Sleeve length, shoulder to hem"
        :units="units"
        :min="1"
        :readonly="readonly"
        @update:model-value="(v) => set({ sleeveLength: v })"
      />
      <LengthInput
        v-if="garment === 'pants'"
        :model-value="modelValue.inseam ?? 0"
        label="Inseam"
        :units="units"
        :min="1"
        :readonly="readonly"
        @update:model-value="(v) => set({ inseam: v })"
      />
    </div>

    <div v-if="modelValue.choice === 'custom'" class="row q-col-gutter-sm q-mt-md">
      <LengthInput
        v-for="(name, i) in ['Target width', 'Target height']"
        :key="name"
        class="col-6"
        :model-value="modelValue.custom?.[i] ?? 1"
        :label="name"
        :units="units"
        :min="1"
        :readonly="readonly"
        @update:model-value="(v) => setCustom(i, v)"
      />
    </div>

    <template v-if="bed">
      <LengthInput
        class="q-mt-md"
        :model-value="modelValue.drop ?? 0"
        label="Drop over the sides and foot"
        :units="units"
        :min="0"
        :readonly="readonly"
        @update:model-value="(v) => set({ drop: v })"
      />
      <q-checkbox
        v-if="bed.tall"
        :model-value="!!modelValue.tall"
        :label="`Tall (XL), ${fromRegion(bed.size[0], modelValue.region, units)} × ${fromRegion(bed.tall, modelValue.region, units)} ${units}`"
        :disable="readonly"
        @update:model-value="(v) => set({ tall: v })"
      />
      <q-checkbox
        :model-value="(modelValue.tuck ?? 0) > 0"
        label="Pillow tuck"
        :disable="readonly"
        @update:model-value="(v) => set({ tuck: v ? (units === 'cm' ? 30 : 12) : 0 })"
      />
      <LengthInput
        v-if="(modelValue.tuck ?? 0) > 0"
        :model-value="modelValue.tuck ?? 0"
        label="Pillow tuck at the head"
        :units="units"
        :min="0"
        :readonly="readonly"
        @update:model-value="(v) => set({ tuck: v })"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import SizeChart from '@/components/SizeChart.vue';
import {
  TARGETS,
  fromRegion,
  garmentRow,
  garmentSizes,
  named,
  startChoice,
  type NamedTarget,
  type Region,
  type TargetInput,
} from '@/model/targets';
import type { Fit } from '@/model/garments';
import { useSettingsStore } from '@/stores/settings';

const props = withDefaults(
  defineProps<{
    modelValue: TargetInput;
    units: 'in' | 'cm';
    readonly?: boolean;
    hint?: string;
  }>(),
  { readonly: false, hint: '' },
);
const emit = defineEmits<{ 'update:modelValue': [value: TargetInput] }>();

const set = (patch: Partial<TargetInput>) =>
  emit('update:modelValue', { ...props.modelValue, ...patch });

/** US or European lists; the choice is remembered as a setting for new targets. */
function setRegion(region: Region) {
  useSettingsStore().settings.bedSizes = region;
  const m = props.modelValue;
  // Custom, garments, and sizes both lists share (placemat…) stay picked.
  const keep =
    m.choice === null ||
    ['custom', 'top', 'pants'].includes(m.choice) ||
    TARGETS[region].some((t) => t.name === m.choice);
  emit(
    'update:modelValue',
    keep ? { ...m, region } : startChoice(null, { ...m, region }, props.units, mine()),
  );
}

/** The quilter's own sizes and bed (Settings), where a new choice starts. */
const mine = () => useSettingsStore().settings.overlayDefaults;
/** A new choice: garments start from the quilter's own fit and size, beds from their bed. */
function choose(c: string | null) {
  const prev = { ...props.modelValue };
  delete prev.fit;
  delete prev.size;
  emit('update:modelValue', startChoice(c, prev, props.units, mine()));
}

/** Women's or men's: the size list changes, so the size and lengths start over. */
function setFit(fit: Fit) {
  const rest = { ...props.modelValue, fit };
  delete rest.size;
  emit('update:modelValue', startChoice(rest.choice, rest, props.units, mine()));
}

function setCustom(i: number, v: number) {
  const c: [number, number] = [...(props.modelValue.custom ?? [1, 1])];
  c[i] = v;
  set({ custom: c });
}

const garment = computed(() =>
  props.modelValue.choice === 'top' || props.modelValue.choice === 'pants'
    ? props.modelValue.choice
    : null,
);
const bed = computed(() => {
  const t = named(props.modelValue);
  return t?.drop !== undefined ? t : null;
});
const pieces = computed(() => [
  { label: 'Front', value: 'front' },
  { label: 'Back', value: 'back' },
  ...(garment.value === 'top' ? [{ label: 'Sleeve', value: 'sleeve' }] : []),
]);

const options = computed(() => {
  const r = props.modelValue.region;
  const item = (t: NamedTarget) => {
    const size = `${fromRegion(t.size[0], r, props.units)} × ${fromRegion(t.size[1], r, props.units)} ${props.units}`;
    return { label: `${t.name}, ${size}`, value: t.name, name: t.name, size };
  };
  const header = (label: string) => ({ label, value: `#${label}`, header: true, disable: true });
  const all = TARGETS[r];
  return [
    { label: 'None', value: null },
    { label: 'Custom', value: 'custom' },
    header('Table, wall, and lap'),
    ...all.filter((t) => t.drop === undefined).map(item),
    header('Garments'),
    { label: 'Top', value: 'top' },
    { label: 'Pants', value: 'pants' },
    header('Beds (mattress size)'),
    ...all.filter((t) => t.drop !== undefined).map(item),
  ];
});

// Garment sizes.
const k = computed(() => (props.units === 'cm' ? 2.54 : 1));
const len = (v: number) => (props.units === 'cm' ? Math.round(v * k.value) : v);
const rows = computed(() => garmentSizes(props.modelValue));
const row = computed(() => garmentRow(props.modelValue));
const sizeLabel = (r: { us: string; eu: number }) =>
  props.modelValue.region === 'eu' ? `${r.eu} (US ${r.us})` : r.us;
const sizeOptions = computed(() => rows.value.map((r) => ({ label: sizeLabel(r), value: r.us })));
/** A new size starts the sleeve at its arm length. */
function setSize(us: string) {
  const r = rows.value.find((x) => x.us === us);
  set({ size: us, ...(r ? { sleeveLength: len(r.m.arm) } : {}) });
}
</script>

<style scoped>
/* A group label set into its divider line. */
.target-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 2px;
  font-size: 0.75rem;
  opacity: 0.7;
}
.target-header::before,
.target-header::after {
  content: '';
  flex: 1;
  border-top: 1px solid currentColor;
  opacity: 0.4;
}
.target-header::before {
  flex: 0 0 12px;
}
</style>
