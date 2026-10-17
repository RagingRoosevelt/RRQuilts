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
    <div v-if="setAside" class="text-caption text-grey-8">
      Borders are set aside while the edge is unfilled. They come back with another edge.
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
      <template v-if="hasCounts">
        <div v-if="ALIGNED.has(current.style)" class="text-caption text-grey-8">
          Units line up with the blocks inside: one per column along the top and bottom, one per row
          down the sides.
        </div>
        <div v-else class="row" style="gap: 8px">
          <q-input
            class="col"
            :model-value="current.blocks?.[0] ?? defaultCount(0)"
            dense
            outlined
            type="number"
            min="1"
            max="100"
            label="Units along top and bottom"
            :readonly="readonly"
            @update:model-value="(v) => setCount(0, v)"
          />
          <q-input
            class="col"
            :model-value="current.blocks?.[1] ?? defaultCount(1)"
            dense
            outlined
            type="number"
            min="1"
            max="100"
            label="Units down the sides"
            :readonly="readonly"
            @update:model-value="(v) => setCount(1, v)"
          />
        </div>
        <div class="text-caption text-grey-8">Pieced borders take colors and fabrics.</div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import { borderCounts } from '@/model/layout/borders';
import type { Bounds } from '@/model/layout/slots';
import type { Border } from '@/model/schema/quilt';
import { roundLen } from '@/model/units';

const props = defineProps<{
  borders: Border[];
  selected: number;
  units: string;
  readonly: boolean;
  setAside?: boolean;
  /** The selected border's inside edge (the quilt plus the borders within it), for default counts. */
  inner?: Bounds;
}>();
const emit = defineEmits<{
  change: [borders: Border[], coalesce: string];
  'update:selected': [i: number];
}>();

const STYLES: Record<Border['style'], string> = {
  'long-horizontal': 'Long horizontal',
  'long-vertical': 'Long vertical',
  mitered: 'Mitered',
  'corner-blocks': 'Corner blocks',
  blocks: 'Blocks',
  'half-drop-blocks': 'Half drop blocks',
  'blocks-aligned-inside': 'Blocks aligned inside',
  'half-drop-aligned': 'Half drop aligned',
  'spaced-squares': 'Spaced squares',
  'tile-squares': 'Tile squares',
  'tile-on-point': 'Tile on point',
  'tile-on-point-corners': 'Tile on point corners',
  diamonds: 'Diamonds',
  'half-drop-diamonds': 'Half drop diamonds',
  'double-diamonds': 'Double diamonds',
  'half-drop-double-diamonds': 'Half drop double diamonds',
  'big-little-diamonds': 'Big & little diamonds',
  'half-drop-big-little-diamonds': 'Half drop big & little diamonds',
  'points-out': 'Points out',
  'points-in': 'Points in',
  'big-little-points-out': 'Big & little points out',
  'big-little-points-in': 'Big & little points in',
};
const styleLabel = (s: string) => STYLES[s as Border['style']] ?? s;
const styleOptions = Object.entries(STYLES).map(([value, label]) => ({ value, label }));
/** Styles with units along the sides (counts); aligned ones follow the layout's columns and rows. */
const PLAIN = new Set(['long-horizontal', 'long-vertical', 'mitered', 'corner-blocks']);
const ALIGNED = new Set(['blocks-aligned-inside', 'half-drop-aligned']);
const hasCounts = computed(() => !!current.value && !PLAIN.has(current.value.style));
const defaultCount = (i: 0 | 1) =>
  current.value && props.inner
    ? borderCounts({ style: current.value.style, sides: current.value.sides }, props.inner)[i]
    : 1;
function setCount(i: 0 | 1, v: string | number | null) {
  const n = Math.round(Number(v));
  if (!current.value || !(n >= 1 && n <= 100)) return;
  const blocks: [number, number] = [
    ...(current.value.blocks ?? [defaultCount(0), defaultCount(1)]),
  ];
  blocks[i] = n;
  update({ ...current.value, blocks }, `count${i}`);
}

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
