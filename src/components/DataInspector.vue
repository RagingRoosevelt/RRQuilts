<template>
  <!-- A data quilt's plan (spec 025): plan and period, what the quilt shows, numbering spaces and
       year days, month or week blocks, value slots and their scales, places without data. -->
  <div v-if="plan" class="column no-wrap" style="gap: 12px">
    <SlidePicker
      :model-value="plan.plan"
      :options="[
        { value: 'months', label: 'Months' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'days', label: 'Days' },
      ]"
      label="Plan"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="setPlan"
    />
    <div class="text-caption text-grey-7">{{ planHint }}</div>
    <q-input
      :model-value="plan.start"
      type="date"
      dense
      outlined
      label="Period starts"
      :readonly="readonly"
      @update:model-value="setStart"
    />
    <div class="text-caption text-grey-7 q-mt-n-sm">Ends {{ end }}, {{ days }} days.</div>
    <SlidePicker
      :model-value="plan.show"
      :options="[
        { value: 'simulation', label: 'Sample data' },
        { value: 'real', label: 'Real data' },
      ]"
      label="Show"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="(v) => edit((p) => ({ ...p, show: v as DataPlan['show'] }))"
    />

    <q-separator />
    <div class="text-subtitle2">Where the days go</div>
    <SlidePicker
      v-model="editor.dataTap"
      :options="tapOptions"
      label="Tap the quilt to"
      :class="{ 'no-pointer': readonly }"
    />
    <template v-if="editor.dataTap === 'units'">
      <div class="text-caption" aria-live="polite">
        Next: {{ next ? unitLabel(plan, next) : 'every number is placed' }}. Tap a numbered space to
        take its number back.
      </div>
      <div class="row items-center" style="gap: 6px">
        <span class="text-caption">Number every block space</span>
        <q-btn
          v-for="o in ORDERS"
          :key="o.value"
          dense
          outline
          no-caps
          size="sm"
          :label="o.label"
          :disable="readonly"
          @click="numberAll(o.value)"
        />
        <q-btn
          dense
          flat
          no-caps
          size="sm"
          icon="clear"
          label="Clear"
          :disable="readonly || !Object.keys(plan.units).length"
          @click="edit((p) => ({ ...p, units: {} }))"
        />
      </div>
    </template>
    <template v-else-if="editor.dataTap === 'days'">
      <div class="row items-center no-wrap" style="gap: 8px">
        <span class="text-caption">Value</span>
        <q-btn-toggle
          :model-value="editor.data.slot"
          :options="slotOptions"
          dense
          no-caps
          unelevated
          toggle-color="primary"
          aria-label="Value slot"
          @update:model-value="(v: number) => (editor.data.slot = v)"
        />
      </div>
      <div class="text-caption">
        Tap pieces to give them the next day of the period ({{ nextYearLabel }}); tap one again to
        take it back. Year days go on any piece: the days a plan's blocks don't reach, or every day
        in a Days plan.
      </div>
    </template>

    <template v-if="plan.plan !== 'days'">
      <q-separator />
      <div class="row items-center">
        <div class="text-subtitle2 col">
          {{ plan.plan === 'months' ? 'Month blocks' : 'Week blocks' }}
        </div>
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="shuffle"
          label="Shuffle"
          :disable="readonly"
          @click="edit((p) => ({ ...p, seed: p.seed + 1 }))"
        />
      </div>
      <div class="text-caption text-grey-7">
        Numbered spaces show a block for their
        {{ plan.plan === 'months' ? "month's length" : 'week' }}; with several, each space gets one
        at random. Blocks with day places are listed.
      </div>
      <q-select
        v-for="len in lengths"
        :key="len"
        :model-value="plan.picks[len] ?? []"
        :options="blockOptions"
        option-value="id"
        option-label="label"
        emit-value
        map-options
        multiple
        use-chips
        dense
        outlined
        :label="len === '7' ? 'Week blocks' : `${len}-day months`"
        :readonly="readonly"
        @update:model-value="(ids: string[]) => setPicks(len, ids)"
      />
    </template>

    <q-separator />
    <div class="text-subtitle2">Values</div>
    <div v-for="(s, i) in plan.slots" :key="i" class="slot column no-wrap" style="gap: 6px">
      <div class="row items-center no-wrap" style="gap: 6px">
        <q-badge color="primary" :label="SLOT_NAMES[i]" />
        <q-input
          :model-value="s.label"
          dense
          outlined
          class="col"
          label="Label"
          maxlength="40"
          :readonly="readonly"
          @update:model-value="(v) => setSlot(i, { label: String(v ?? '') }, `label${i}`)"
        />
        <q-btn
          v-if="plan.slots.length > 1 && i === plan.slots.length - 1 && !readonly"
          flat
          round
          dense
          size="sm"
          icon="delete"
          :aria-label="`Remove value ${SLOT_NAMES[i]}`"
          @click="removeSlot(i)"
        />
      </div>
      <div class="row no-wrap" style="gap: 6px">
        <q-select
          :model-value="s.preset ?? 'custom'"
          :options="PRESETS"
          emit-value
          map-options
          dense
          outlined
          class="col"
          label="Kind"
          :readonly="readonly"
          @update:model-value="(v: DataPreset) => setPreset(i, v)"
        />
        <q-select
          v-if="plan.sim.source === 'builtin'"
          :model-value="plan.sim.series[i] ?? null"
          :options="seriesOptions"
          emit-value
          map-options
          dense
          outlined
          class="col"
          label="Sample"
          :readonly="readonly"
          @update:model-value="(v: string | null) => setSeries(i, v)"
        />
      </div>
      <template v-if="s.kind === 'number'">
        <div v-for="(r, j) in s.ranges" :key="j" class="row items-center no-wrap" style="gap: 4px">
          <q-input
            :model-value="r.from"
            type="number"
            dense
            outlined
            class="num"
            :aria-label="`Range ${j + 1} from`"
            :readonly="readonly"
            @update:model-value="(v) => setRange(i, j, { from: Number(v) }, `r${i}.${j}`)"
          />
          <span class="text-caption">to</span>
          <q-input
            :model-value="r.to"
            type="number"
            dense
            outlined
            class="num"
            :aria-label="`Range ${j + 1} to`"
            :readonly="readonly"
            @update:model-value="(v) => setRange(i, j, { to: Number(v) }, `r${i}.${j}`)"
          />
          <PaintMapRow
            class="col"
            :model-value="paintOf(r.fill)"
            :options="fillOptions"
            :label="`${r.from} to ${r.to}`"
            :readonly="readonly"
            @update:model-value="(id) => setRange(i, j, { fill: plain(id) })"
          />
          <q-btn
            v-if="!readonly"
            flat
            round
            dense
            size="sm"
            icon="close"
            :aria-label="`Remove range ${j + 1}`"
            @click="setScale(i, { ranges: s.ranges.filter((_, k) => k !== j) })"
          />
        </div>
        <div class="row items-center" style="gap: 6px">
          <q-btn
            v-if="!readonly"
            dense
            flat
            no-caps
            size="sm"
            icon="add"
            label="Add range"
            @click="addRange(i)"
          />
          <span v-if="s.unit" class="text-caption text-grey-7">Values in {{ s.unit }}.</span>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(c, j) in s.categories"
          :key="c.id"
          class="row items-center no-wrap"
          style="gap: 4px"
        >
          <q-input
            :model-value="c.name"
            dense
            outlined
            class="col-5"
            maxlength="60"
            :aria-label="`Category ${j + 1}`"
            :readonly="readonly"
            @update:model-value="(v) => setCategory(i, j, { name: String(v ?? '') }, `c${i}.${j}`)"
          />
          <PaintMapRow
            class="col"
            :model-value="paintOf(c.fill)"
            :options="fillOptions"
            :label="c.name"
            :readonly="readonly"
            @update:model-value="(id) => setCategory(i, j, { fill: plain(id) })"
          />
          <q-btn
            v-if="!readonly"
            flat
            round
            dense
            size="sm"
            icon="close"
            :aria-label="`Remove ${c.name}`"
            @click="setScale(i, { categories: s.categories.filter((_, k) => k !== j) })"
          />
        </div>
        <q-btn
          v-if="!readonly"
          dense
          flat
          no-caps
          size="sm"
          icon="add"
          label="Add category"
          class="self-start"
          @click="addCategory(i)"
        />
      </template>
    </div>
    <q-btn
      v-if="plan.slots.length < 4 && !readonly"
      dense
      outline
      no-caps
      icon="add"
      label="Add a value"
      class="self-start"
      @click="addSlot"
    />

    <q-separator />
    <div class="text-subtitle2">Places without data</div>
    <SlidePicker
      v-if="plan.plan !== 'days'"
      :model-value="plan.unused"
      :options="[
        { value: 'filler', label: 'Filler' },
        { value: 'designed', label: 'As designed' },
      ]"
      :label="plan.plan === 'months' ? 'Days a month doesn’t reach' : 'Places past the week'"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="(v) => edit((p) => ({ ...p, unused: v as DataPlan['unused'] }))"
    />
    <div class="text-caption text-grey-7 q-mt-n-sm">
      {{ plan.plan === 'months' ? 'Day 31 in a 30-day month, say.' : '' }}
    </div>
    <SlidePicker
      :model-value="plan.waiting"
      :options="[
        { value: 'designed', label: 'As designed' },
        { value: 'simulation', label: 'Sample' },
        { value: 'filler', label: 'Filler' },
      ]"
      label="Days without an entry"
      :class="{ 'no-pointer': readonly }"
      @update:model-value="(v) => edit((p) => ({ ...p, waiting: v as DataPlan['waiting'] }))"
    />
    <div class="text-caption text-grey-7 q-mt-n-sm">
      Real data only. As designed shows the color painted under the day’s number.
    </div>
    <PaintMapRow
      :model-value="plan.filler ? paintOf(plan.filler) : undefined"
      :options="fillOptions"
      label="Filler"
      :readonly="readonly"
      @update:model-value="(id) => edit((p) => ({ ...p, filler: plain(id) }))"
    />
    <div class="text-caption text-grey-7 q-mt-n-sm">Filler color or fabric.</div>

    <template v-if="report.length">
      <q-separator />
      <div
        v-for="r in report"
        :key="r"
        class="row no-wrap items-start text-caption"
        style="gap: 6px"
      >
        <q-icon name="warning" color="warning" size="16px" />
        <span>{{ r }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PaintMapRow from '@/components/PaintMapRow.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { useSwapOptions } from '@/composables/swap-options';
import { fillFor, paintOf } from '@/editor/paint';
import { plainFill } from '@/model/coloring';
import { readingOrder, SLOT_NAMES, type DataOrder } from '@/model/data-paint';
import {
  dataReport,
  dayDate,
  nextUnit,
  nextYearDay,
  numberUnits,
  periodLength,
  presetSeries,
  presetSlot,
  unitLabel,
} from '@/model/data-quilt';
import { sampleSeries } from '@/model/data-samples';
import { newId } from '@/model/ids';
import { generateFor } from '@/model/layout/slots';
import type { PlainFill } from '@/model/schema/coloring';
import type { DataPlan, DataPreset, ValueSlot } from '@/model/schema/data-quilt';
import type { Quilt } from '@/model/schema/quilt';
import { takesBlock } from '@/editor/scope';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const project = useProjectStore();
const editor = useEditorStore();
const library = useLibraryStore();
const { swapOptions } = useSwapOptions();

const plan = computed(() => props.quilt.data);
const days = computed(() => (plan.value ? periodLength(plan.value.start) : 0));
const end = computed(() => (plan.value ? dayDate(plan.value.start, days.value) : ''));
const next = computed(() => (plan.value ? nextUnit(plan.value) : undefined));
const planHint = computed(
  () =>
    ({
      months: '12 month blocks, each with places for days 1 to 31.',
      weeks:
        '52 week blocks of 7 days from the period start; days 365 and 366 go on pieces you number as year days.',
      days: 'A place for each day of the period, numbered as year days on pieces.',
    })[plan.value?.plan ?? 'months'],
);
const tapOptions = computed(() => [
  { value: 'none', label: 'Off' },
  ...(plan.value?.plan !== 'days'
    ? [{ value: 'units', label: plan.value?.plan === 'weeks' ? 'Weeks' : 'Months' }]
    : []),
  { value: 'days', label: 'Year days' },
]);
const ORDERS: { value: DataOrder; label: string }[] = [
  { value: 'rows', label: 'Rows' },
  { value: 'columns', label: 'Columns' },
  { value: 'snake', label: 'Snake' },
];
const PRESETS: { value: DataPreset; label: string }[] = [
  { value: 'temperature', label: 'Temperature' },
  { value: 'mood', label: 'Mood' },
  { value: 'daylight', label: 'Hours of daylight' },
  { value: 'rainfall', label: 'Rainfall' },
  { value: 'custom', label: 'Custom' },
];
const seriesOptions = computed(() => [
  { value: null, label: 'None' },
  ...sampleSeries().map((s) => ({ value: s.id, label: s.label })),
]);
const lengths = computed((): ('28' | '29' | '30' | '31' | '7')[] =>
  plan.value?.plan === 'weeks' ? ['7'] : ['31', '30', '29', '28'],
);
const fillOptions = computed(() => swapOptions());
const slotOptions = computed(() =>
  (plan.value?.slots ?? []).map((_, i) => ({ label: SLOT_NAMES[i] ?? '', value: i })),
);
const plain = (id: string): PlainFill => plainFill(fillFor(id))!;

/** Blocks with day places (own and in libraries), each with how many places it has. */
const blockOptions = computed(() => {
  const seen = new Set<string>();
  const doc = project.doc;
  return [...(doc?.project.blocks ?? []), ...library.items.blocks].flatMap((b) => {
    if (seen.has(b.id)) return [];
    seen.add(b.id);
    const fills = b.colorings[0]?.fills ?? {};
    const n = Object.values(fills).filter((f) => 'data' in f && !f.data.year).length;
    return n ? [{ id: b.id, label: `${b.notecard.name} (${n})` }] : [];
  });
});

const nextYear = computed(() =>
  nextYearDay(props.quilt, project.doc?.project.blocks ?? [], editor.data.slot),
);
const nextYearLabel = computed(() =>
  nextYear.value && plan.value
    ? `next: day ${nextYear.value}, ${dayDate(plan.value.start, nextYear.value)}`
    : 'every day is placed',
);
const report = computed(() => dataReport(props.quilt, project.doc?.project.blocks ?? []));

/** Change the plan (one undo step; `coalesce` merges typing into one). */
function edit(fn: (p: DataPlan) => DataPlan, coalesce?: string) {
  if (props.readonly || !plan.value) return;
  const next = fn(plan.value);
  project.change(
    (d) => {
      const q = d.project.quilts.find((x) => x.id === props.quilt.id);
      if (q) q.data = JSON.parse(JSON.stringify(next)) as DataPlan;
    },
    coalesce ? { coalesce: `data:${props.quilt.id}:${coalesce}` } : {},
  );
}
function setPlan(v: string) {
  edit((p) => {
    const plan = v as DataPlan['plan'];
    const max = plan === 'months' ? 12 : plan === 'weeks' ? 52 : 0;
    const units = Object.fromEntries(Object.entries(p.units).filter(([, u]) => u <= max));
    const start = plan === 'months' ? `${p.start.slice(0, 8)}01` : p.start;
    return { ...p, plan, units, start };
  });
  if (v === 'days' && editor.dataTap === 'units') editor.dataTap = 'days';
}
function setStart(v: string | number | null) {
  const s = String(v ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return;
  edit((p) => ({ ...p, start: p.plan === 'months' ? `${s.slice(0, 8)}01` : s }));
}
function setPicks(len: '28' | '29' | '30' | '31' | '7', ids: string[]) {
  edit((p) => {
    const picks = { ...p.picks };
    if (ids.length) picks[len] = ids;
    else delete picks[len];
    return { ...p, picks };
  });
}
function numberAll(order: DataOrder) {
  const g = generateFor(props.quilt);
  const [x0, y0, x1, y1] = g.bounds;
  const spots = new Map(
    g.slots
      .filter((s) => s.kind === 'block' && takesBlock(s))
      .map((s): [string, [number, number]] => {
        const [a, b, c, d, e, f] = s.transform;
        return [s.id, [((a + c) / 2 + e - x0) / (x1 - x0), ((b + d) / 2 + f - y0) / (y1 - y0)]];
      }),
  );
  edit((p) => numberUnits(p, readingOrder(spots, [...spots.keys()], order)));
}
const slots = (p: DataPlan, i: number, patch: Partial<ValueSlot>) =>
  p.slots.map((s, k) => (k === i ? { ...s, ...patch } : s));
function setSlot(i: number, patch: Partial<ValueSlot>, coalesce?: string) {
  edit((p) => ({ ...p, slots: slots(p, i, patch) }), coalesce);
}
/** Ranges stay in order of where they start. ponytail: overlaps aren't refused; the first range
 *  holding a value wins. */
function setScale(i: number, patch: Partial<ValueSlot>) {
  if (patch.ranges) patch = { ...patch, ranges: [...patch.ranges].sort((a, b) => a.from - b.from) };
  setSlot(i, patch);
}
function setRange(i: number, j: number, patch: Partial<ValueSlot['ranges'][number]>, c?: string) {
  if (Object.values(patch).some((v) => typeof v === 'number' && !Number.isFinite(v))) return;
  const s = plan.value!.slots[i]!;
  setSlot(i, { ranges: s.ranges.map((r, k) => (k === j ? { ...r, ...patch } : r)) }, c);
}
function setCategory(
  i: number,
  j: number,
  patch: Partial<ValueSlot['categories'][number]>,
  c?: string,
) {
  const s = plan.value!.slots[i]!;
  setSlot(i, { categories: s.categories.map((x, k) => (k === j ? { ...x, ...patch } : x)) }, c);
}
function addRange(i: number) {
  const s = plan.value!.slots[i]!;
  const last = s.ranges.at(-1);
  const from = last?.to ?? 0;
  const step = last ? last.to - last.from || 10 : 10;
  setScale(i, {
    ranges: [...s.ranges, { from, to: from + step, fill: last?.fill ?? plain('rrquilts.gray') }],
  });
}
function addCategory(i: number) {
  const s = plan.value!.slots[i]!;
  setSlot(i, {
    categories: [
      ...s.categories,
      { id: newId(), name: `Category ${s.categories.length + 1}`, fill: plain('rrquilts.gray') },
    ],
  });
}
function setPreset(i: number, preset: DataPreset) {
  const units = project.doc?.units ?? 'in';
  edit((p) => {
    const nth = p.slots.slice(0, i).filter((s) => s.preset === preset).length;
    const label = preset === 'temperature' && nth ? 'Low' : undefined;
    const sim =
      p.sim.source === 'builtin'
        ? {
            ...p.sim,
            series: p.slots.map((_, k) =>
              k === i
                ? presetSeries(preset, nth)
                : p.sim.source === 'builtin'
                  ? (p.sim.series[k] ?? null)
                  : null,
            ),
          }
        : p.sim;
    return { ...p, slots: slots(p, i, presetSlot(preset, units, label)), sim };
  });
}
function setSeries(i: number, v: string | null) {
  edit((p) =>
    p.sim.source === 'builtin'
      ? {
          ...p,
          sim: {
            ...p.sim,
            series: p.slots.map((_, k) =>
              k === i ? v : p.sim.source === 'builtin' ? (p.sim.series[k] ?? null) : null,
            ),
          },
        }
      : p,
  );
}
function addSlot() {
  const units = project.doc?.units ?? 'in';
  edit((p) => {
    const temps = p.slots.filter((s) => s.preset === 'temperature').length;
    const slot =
      temps === 1 ? presetSlot('temperature', units, 'Low') : presetSlot('custom', units);
    const series = temps === 1 ? 'low' : null;
    return {
      ...p,
      slots: [...p.slots, slot],
      ...(p.sim.source === 'builtin'
        ? { sim: { ...p.sim, series: [...p.sim.series, series] } }
        : {}),
    };
  });
}
/** Removing the last value (pieces numbered for it show as places until it's added back). */
function removeSlot(i: number) {
  edit((p) => ({
    ...p,
    slots: p.slots.filter((_, k) => k !== i),
    ...(p.sim.source === 'builtin'
      ? { sim: { ...p.sim, series: p.sim.series.filter((_, k) => k !== i) } }
      : {}),
    entries: Object.fromEntries(
      Object.entries(p.entries).map(([d, v]) => [d, v.filter((_, k) => k !== i)]),
    ),
  }));
}
</script>

<style scoped>
.num {
  width: 52px;
  flex: none;
}
.num :deep(input) {
  -moz-appearance: textfield;
  appearance: textfield;
}
.num :deep(input::-webkit-inner-spin-button) {
  display: none;
}
.slot :deep(.col),
.slot :deep(.col-5) {
  min-width: 0;
}
.slot {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  padding: 8px;
}
.no-pointer {
  pointer-events: none;
}
</style>
