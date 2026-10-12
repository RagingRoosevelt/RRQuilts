<template>
  <div class="q-gutter-md">
    <div class="text-subtitle2">
      Borders <span class="text-caption text-grey-7">(1 = innermost)</span>
    </div>
    <q-list bordered separator dense class="rounded-borders">
      <q-item
        v-for="(b, i) in borders"
        :key="i"
        clickable
        :active="i === selected"
        active-class="bg-blue-1 text-primary"
        @click="emit('update:selected', i)"
      >
        <q-item-section>{{ i + 1 }}. {{ styleLabel(b.style) }}</q-item-section>
        <q-item-section side>{{ fmt(b.sides) }}</q-item-section>
      </q-item>
      <q-item v-if="!borders.length"
        ><q-item-section class="text-grey-7">No borders</q-item-section></q-item
      >
    </q-list>
    <div v-if="!readonly" class="row q-gutter-xs">
      <q-btn dense no-caps outline icon="add" label="Add outside" @click="add(borders.length)" />
      <q-btn
        dense
        no-caps
        outline
        label="Insert inside"
        :disable="current === undefined"
        @click="add(selected)"
      />
      <q-btn
        dense
        no-caps
        outline
        icon="content_copy"
        label="Clone"
        :disable="current === undefined"
        @click="clone"
      />
      <q-btn
        dense
        flat
        icon="arrow_upward"
        aria-label="Move inward"
        :disable="selected <= 0"
        @click="move(-1)"
      />
      <q-btn
        dense
        flat
        icon="arrow_downward"
        aria-label="Move outward"
        :disable="selected >= borders.length - 1"
        @click="move(1)"
      />
      <q-btn
        dense
        flat
        color="negative"
        icon="delete"
        aria-label="Delete"
        :disable="current === undefined"
        @click="remove"
      />
    </div>

    <template v-if="current">
      <q-select
        :model-value="current.style"
        dense
        outlined
        label="Style"
        :options="styleOptions"
        emit-value
        map-options
        option-disable="disable"
        :readonly="readonly"
        @update:model-value="(s) => update({ ...current!, style: s }, '')"
      />
      <q-btn-toggle
        v-model="lock"
        dense
        no-caps
        spread
        :options="[
          { label: 'All sides', value: 'all' },
          { label: 'L+R / T+B', value: 'pairs' },
          { label: 'Each', value: 'each' },
        ]"
      />
      <div class="row q-col-gutter-sm">
        <LengthInput
          v-for="(name, i) in ['Left', 'Top', 'Right', 'Bottom']"
          :key="name"
          class="col-6"
          :model-value="current.sides[i]!"
          :label="name"
          :units="units"
          :readonly="readonly"
          @update:model-value="(v) => setSide(i, v)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import type { Border } from '@/model/schema/quilt';
import { roundLen } from '@/model/units';

const props = defineProps<{
  borders: Border[];
  selected: number;
  units: string;
  readonly: boolean;
}>();
const emit = defineEmits<{
  change: [borders: Border[], coalesce: string];
  'update:selected': [i: number];
}>();

const GENERATED = {
  'long-horizontal': 'Long horizontal',
  'long-vertical': 'Long vertical',
  mitered: 'Mitered',
} as const;
const styleLabel = (s: string) => GENERATED[s as keyof typeof GENERATED] ?? `${s} (coming soon)`;
const styleOptions = [
  ...Object.entries(GENERATED).map(([value, label]) => ({ value, label })),
  { value: 'pieced', label: 'Pieced styles (coming soon)', disable: true },
];

const lock = ref<'all' | 'pairs' | 'each'>('all');
const current = computed(() => props.borders[props.selected]);
const fmt = (sides: number[]) => {
  const s = sides.map((v) => roundLen(v, props.units === 'cm' ? 'cm' : 'in'));
  return new Set(s).size === 1 ? `${s[0]} ${props.units}` : s.join(' / ');
};

function update(b: Border, coalesce: string) {
  emit(
    'change',
    props.borders.map((x, i) => (i === props.selected ? b : x)),
    coalesce,
  );
}
function setSide(i: number, v: number) {
  const sides = [...current.value!.sides] as Border['sides'];
  if (lock.value === 'all') sides.fill(v);
  else if (lock.value === 'pairs') sides[i] = sides[(i + 2) % 4] = v;
  else sides[i] = v;
  update({ ...current.value!, sides }, `border-${props.selected}-sides`);
}
function add(at: number) {
  const w = props.units === 'cm' ? 2.5 : 1;
  const next = [...props.borders];
  next.splice(at, 0, { style: 'long-horizontal', sides: [w, w, w, w] });
  emit('change', next, '');
  emit('update:selected', at);
}
function clone() {
  const next = [...props.borders];
  next.splice(props.selected + 1, 0, structuredClone(current.value!));
  emit('change', next, '');
  emit('update:selected', props.selected + 1);
}
function move(d: -1 | 1) {
  const next = [...props.borders];
  const [b] = next.splice(props.selected, 1);
  next.splice(props.selected + d, 0, b!);
  emit('change', next, '');
  emit('update:selected', props.selected + d);
}
function remove() {
  emit(
    'change',
    props.borders.filter((_, i) => i !== props.selected),
    '',
  );
  emit('update:selected', Math.max(0, props.selected - 1));
}
</script>
