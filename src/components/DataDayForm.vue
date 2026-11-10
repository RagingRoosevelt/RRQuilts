<template>
  <!-- One day of a data quilt (spec 041): a value per series, and whether its pieces are cut and
       assembled; its block's Block assembled mark. -->
  <div class="column" style="gap: 8px" @keydown.enter="onEnter">
    <div class="row items-center" style="gap: 8px">
      <div class="text-subtitle1 col">{{ title }}</div>
      <q-btn
        flat
        dense
        round
        icon="chevron_left"
        aria-label="Day before"
        @click="emit('move', -1)"
      />
      <q-btn
        flat
        dense
        round
        icon="chevron_right"
        aria-label="Day after"
        @click="emit('move', 1)"
      />
    </div>
    <div class="row" style="gap: 8px">
      <template v-for="(s, i) in plan.slots" :key="i">
        <q-select
          v-if="s.kind === 'category'"
          :model-value="value(i)"
          :options="s.categories.map((c) => ({ value: c.id, label: c.name }))"
          emit-value
          map-options
          clearable
          dense
          outlined
          class="col"
          :label="s.label"
          @update:model-value="(v: string | null) => emit('set', date, i, v ?? null)"
        />
        <q-input
          v-else
          :model-value="value(i) ?? ''"
          type="number"
          dense
          outlined
          class="col"
          :label="s.unit ? `${s.label} (${s.unit})` : s.label"
          :autofocus="i === 0 && !$q.platform.has.touch"
          debounce="300"
          @update:model-value="
            (v) => emit('set', date, i, v === '' || v === null ? null : Number(v))
          "
        />
      </template>
    </div>
    <div class="row items-center" style="gap: 4px 16px">
      <q-toggle
        :model-value="!!made?.cut"
        dense
        label="Cut"
        @update:model-value="(on: boolean) => emit('mark', date, 'cut', on)"
      />
      <q-toggle
        :model-value="!!made?.assembled"
        dense
        label="Assembled"
        @update:model-value="(on: boolean) => emit('mark', date, 'assembled', on)"
      />
      <q-toggle
        v-if="number"
        :model-value="!!plan.blocksMade?.[number]"
        dense
        :label="`Block assembled (${blockLabel})`"
        @update:model-value="(on: boolean) => emit('block', number!, on)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { numberLabel, numberOfDate } from '@/model/data-quilt';
import type { DataPlan, DayMade } from '@/model/schema/data-quilt';

const props = defineProps<{ plan: DataPlan; date: string }>();
const emit = defineEmits<{
  set: [date: string, slot: number, value: number | string | null];
  mark: [date: string, part: keyof DayMade, on: boolean];
  block: [n: number, on: boolean];
  move: [by: number];
}>();

const title = computed(() =>
  new Date(`${props.date}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }),
);
const value = (i: number) => props.plan.entries[props.date]?.[i] ?? null;
const made = computed(() => props.plan.made?.[props.date]);
/** The plan's number holding this day (1-based), if it has a place. */
const number = computed(() => numberOfDate(props.plan, props.date)?.k);
const blockLabel = computed(() => (number.value ? numberLabel(props.plan, number.value) : ''));
function onEnter(e: KeyboardEvent) {
  if ((e.target as HTMLElement).tagName === 'INPUT') emit('move', 1);
}
</script>
