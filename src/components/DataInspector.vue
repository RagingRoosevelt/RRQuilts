<template>
  <!-- A data quilt's Data tab (spec 025): period (the plan is in the Layout tab), what the quilt shows, value slots and
       their scales (in a colorway other than the primary: what each scale color becomes), yardage,
       places without data. Numbers and block pools are in the Blocks tab (DataBlocks). -->
  <div v-if="plan" class="column no-wrap" style="gap: 12px">
    <FieldGroup label="Period" heading collapsible>
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
    </FieldGroup>
    <FieldGroup label="Data" heading collapsible>
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
      <div class="row items-center no-wrap" style="gap: 6px">
        <q-select
          :model-value="plan.sim.source"
          :options="[
            { value: 'builtin', label: 'Built-in sample year' },
            ...(csvSample ? [{ value: 'csv', label: csvSample.name }] : []),
          ]"
          emit-value
          map-options
          dense
          outlined
          class="col"
          style="min-width: 0"
          label="Sample data"
          :readonly="readonly"
          @update:model-value="setSampleSource"
        />
        <q-btn
          flat
          dense
          no-caps
          icon="upload_file"
          label="CSV…"
          :disable="readonly"
          aria-label="Sample data from a CSV"
          @click="csv?.show(true)"
        />
      </div>
      <div class="column" style="gap: 4px">
        <div class="text-caption">
          Real data: {{ enteredCount }} of {{ days }} days entered<template v-if="missingCount">
            , {{ missingCount }} missing up to today</template
          >.
        </div>
        <div class="row" style="gap: 6px">
          <q-btn
            dense
            outline
            no-caps
            size="sm"
            icon="today"
            label="Today’s entry"
            @click="todayEntry"
          />
          <q-btn
            dense
            outline
            no-caps
            size="sm"
            icon="table_rows"
            label="Table"
            @click="entriesDlg?.show()"
          />
          <q-btn
            v-if="missingCount"
            dense
            outline
            no-caps
            size="sm"
            icon="error_outline"
            label="Missing"
            @click="entriesDlg?.show(undefined, true)"
          />
          <q-btn
            dense
            outline
            no-caps
            size="sm"
            icon="upload_file"
            label="Import"
            :disable="readonly"
            @click="csv?.show(false)"
          />
        </div>
      </div>
    </FieldGroup>
    <FieldGroup label="Values" heading collapsible>
      <template v-if="colorway">
        <div class="text-caption text-grey-7">
          {{ colorway.name }}: pick what each color of {{ primaryName }} becomes. Show
          {{ primaryName }} to change the values and their colors.
        </div>
        <div v-for="(s, i) in plan.slots" :key="i" class="slot column no-wrap" style="gap: 6px">
          <div class="text-caption text-weight-medium">{{ SLOT_NAMES[i] }}: {{ s.label }}</div>
          <!-- The sample is the quilt's, shared by every colorway. -->
          <q-select
            v-if="plan.sim.source === 'builtin'"
            :model-value="plan.sim.series[i] ?? null"
            :options="seriesOptions(s.preset)"
            emit-value
            map-options
            dense
            outlined
            label="Sample"
            :readonly="readonly"
            @update:model-value="(v: string | null) => setSeries(i, v)"
          />
          <!-- The sample's days per range or category (the current bins), at the top of its value. -->
          <div class="column" style="gap: 2px">
            <div class="text-caption text-grey-7">Days in the sample</div>
            <div class="histogram row no-wrap items-end" role="img" :aria-label="histLabel(i)">
              <div
                v-for="(e, j) in scaleEntries(s)"
                :key="j"
                class="bar col"
                :style="{ ...swatch(e.fill), height: `${barHeight(i, j)}%` }"
              >
                <q-tooltip>{{ e.text }}: {{ counts[i]?.[j] ?? 0 }} days</q-tooltip>
              </div>
            </div>
          </div>
          <div v-for="(e, j) in scaleEntries(s)" :key="j" class="column" style="gap: 2px">
            <span class="text-caption">{{ e.text }}</span>
            <PaintMapRow
              :from="paintOpt(paintOf(e.fill)!)"
              :model-value="paintOf(swap(e.fill))"
              :options="fillOptions"
              :readonly="readonly"
              stacked
              @update:model-value="(to) => mapTo(e.fill, to)"
            />
          </div>
        </div>
      </template>
      <div
        v-for="(s, i) in colorway ? [] : plan.slots"
        :key="i"
        class="slot column no-wrap"
        style="gap: 6px"
      >
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
            :options="seriesOptions(s.preset)"
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
        <!-- The sample's days per range or category (the current bins), right above them. -->
        <div class="column" style="gap: 2px">
          <div class="text-caption text-grey-7">Days in the sample</div>
          <div class="histogram row no-wrap items-end" role="img" :aria-label="histLabel(i)">
            <div
              v-for="(e, j) in scaleEntries(s)"
              :key="j"
              class="bar col"
              :style="{ ...swatch(e.fill), height: `${barHeight(i, j)}%` }"
            >
              <q-tooltip>{{ e.text }}: {{ counts[i]?.[j] ?? 0 }} days</q-tooltip>
            </div>
          </div>
        </div>
        <template v-if="s.kind === 'number'">
          <div
            v-for="(r, j) in s.ranges"
            :key="j"
            class="row items-center no-wrap"
            style="gap: 4px"
          >
            <!-- Always three cells (from, "to", to), so the inputs line up row to row: the first range
               takes everything under its end, the last everything from its start. -->
            <span v-if="j === 0" class="num text-caption text-right q-pr-xs">{{
              s.ranges.length > 1 ? 'under' : 'all'
            }}</span>
            <q-input
              v-else
              :model-value="r.from"
              type="number"
              dense
              outlined
              class="num"
              :aria-label="`Range ${j + 1} from`"
              :readonly="readonly"
              @update:model-value="(v) => (typed = { i, j, side: 'from', v })"
              @blur="commitTyped"
              @keyup.enter="commitTyped"
            />
            <span class="join text-caption text-center">{{
              j > 0 && j < s.ranges.length - 1 ? 'to' : ''
            }}</span>
            <q-input
              v-if="j < s.ranges.length - 1"
              :model-value="r.to"
              type="number"
              dense
              outlined
              class="num"
              :aria-label="`Range ${j + 1} to`"
              :readonly="readonly"
              @update:model-value="(v) => (typed = { i, j, side: 'to', v })"
              @blur="commitTyped"
              @keyup.enter="commitTyped"
            />
            <span v-else class="num text-caption q-pl-xs">{{ j > 0 ? 'and up' : '' }}</span>
            <PaintMapRow
              class="col"
              :model-value="paintOf(r.fill)"
              :options="fillOptions"
              :label="scaleEntries(s)[j]?.text ?? ''"
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
              @update:model-value="
                (v) => setCategory(i, j, { name: String(v ?? '') }, `c${i}.${j}`)
              "
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
        v-if="plan.slots.length < 4 && !readonly && !colorway"
        dense
        outline
        no-caps
        icon="add"
        label="Add a value"
        class="self-start"
        @click="addSlot"
      />
    </FieldGroup>
    <FieldGroup label="Yardage" heading collapsible>
      <q-expansion-item dense label="Most days expected" header-class="q-px-none">
        <div class="text-caption text-grey-7 q-mb-sm">
          Printed yardage counts this many days for each range or category, each in the largest
          piece of its value. Empty: its days in the sample.
        </div>
        <div v-for="(s, i) in plan.slots" :key="i" class="column q-mb-sm" style="gap: 4px">
          <div class="text-caption text-weight-medium">{{ s.label }}</div>
          <div
            v-for="(e, j) in scaleEntries(s)"
            :key="j"
            class="row items-center no-wrap"
            style="gap: 6px"
          >
            <span class="swatch" :style="swatch(e.fill)" />
            <span class="col ellipsis text-caption">{{ e.text }}</span>
            <q-input
              :model-value="e.most ?? ''"
              type="number"
              dense
              outlined
              class="num"
              :placeholder="String(counts[i]?.[j] ?? 0)"
              :aria-label="`Most days for ${e.text}`"
              :readonly="readonly"
              @update:model-value="(v) => setMost(i, j, v)"
            />
          </div>
        </div>
      </q-expansion-item>
    </FieldGroup>
    <FieldGroup label="Places without data" heading collapsible>
      <SlidePicker
        :model-value="plan.unused"
        :options="[
          { value: 'filler', label: 'Filler' },
          { value: 'designed', label: 'As designed' },
        ]"
        label="Places past a number’s days"
        :class="{ 'no-pointer': readonly }"
        @update:model-value="(v) => edit((p) => ({ ...p, unused: v as DataPlan['unused'] }))"
      />
      <div class="text-caption text-grey-7 q-mt-n-sm">
        Day 31 of a 31-place block showing a 30-day month, say.
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

      <DataCsvDialog
        ref="csv"
        :slots="plan.slots"
        @sample="setCsvSample"
        @entries="importEntries"
      />
      <DataEntriesDialog ref="entriesDlg" :plan="plan" :readonly="readonly" @set="setEntry" />
    </FieldGroup>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { castDraft } from 'immer';
import { computed, ref } from 'vue';
import DataCsvDialog from '@/components/DataCsvDialog.vue';
import DataEntriesDialog from '@/components/DataEntriesDialog.vue';
import FieldGroup from '@/components/FieldGroup.vue';
import PaintMapRow from '@/components/PaintMapRow.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { optStyle, useSwapOptions } from '@/composables/swap-options';
import { fillFor, paintOf } from '@/editor/paint';
import { plainFill } from '@/model/coloring';
import { fillKey } from '@/model/coloring';
import { colorwayList, setSwap, shownColorway, swapper } from '@/model/colorways';
import { SLOT_NAMES } from '@/model/data-paint';
import {
  dayDate,
  fitOrder,
  moveBound,
  periodLength,
  presetSeries,
  presetSlot,
  sampleCounts,
  scaleEntries,
} from '@/model/data-quilt';
import { sampleSeries } from '@/model/data-samples';
import { newId } from '@/model/ids';
import type { PlainFill } from '@/model/schema/coloring';
import type { DataPlan, DataPreset, DayValues, ValueSlot } from '@/model/schema/data-quilt';
import type { Quilt } from '@/model/schema/quilt';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const $q = useQuasar();
const project = useProjectStore();
const { swapOptions, paintOpt } = useSwapOptions();

const plan = computed(() => props.quilt.data);
const days = computed(() => (plan.value ? periodLength(plan.value.start) : 0));
const end = computed(() => (plan.value ? dayDate(plan.value.start, days.value) : ''));
const PRESETS: { value: DataPreset; label: string }[] = [
  { value: 'temperature', label: 'Temperature' },
  { value: 'mood', label: 'Mood' },
  { value: 'daylight', label: 'Hours of daylight' },
  { value: 'rainfall', label: 'Rainfall' },
  { value: 'custom', label: 'Custom' },
];
/** The made-up series that fit a value's kind (temperature: highs and lows); Custom takes any. */
const seriesOptions = (preset: DataPreset | undefined) => [
  { value: null, label: 'None' },
  ...sampleSeries()
    .filter((x) => !preset || preset === 'custom' || x.kind === preset)
    .map((x) => ({ value: x.id, label: x.label })),
];
const fillOptions = computed(() => swapOptions());
const plain = (id: string): PlainFill => plainFill(fillFor(id))!;

/** A colorway other than the primary, shown: the scales show what their colors become. */
const colorway = computed(() => shownColorway(props.quilt));
const primaryName = computed(() => colorwayList(props.quilt)[0]!.name);
const swap = computed(() => swapper(colorway.value));
function mapTo(from: PlainFill, to: string) {
  const id = colorway.value?.id;
  if (!id || props.readonly) return;
  project.change((d) => {
    const i = d.project.quilts.findIndex((x) => x.id === props.quilt.id);
    if (i >= 0)
      d.project.quilts[i] = castDraft(setSwap(props.quilt, id, fillKey(from), fillFor(to)));
  });
}

/** Each slot's days per scale entry in the sample (the yardage default). */
const counts = computed(() =>
  plan.value ? plan.value.slots.map((_, i) => sampleCounts(plan.value!, i)) : [],
);
const swatch = (f: PlainFill) => optStyle(paintOpt(paintOf(f)!));
/** A bar's height against the slot's tallest (an empty bin keeps a sliver, so its color shows). */
function barHeight(i: number, j: number) {
  const c = counts.value[i] ?? [];
  const max = Math.max(1, ...c);
  return Math.max(4, ((c[j] ?? 0) / max) * 100);
}
const histLabel = (i: number) => {
  const s = plan.value!.slots[i]!;
  return scaleEntries(s)
    .map((e, j) => `${e.text}: ${counts.value[i]?.[j] ?? 0} days`)
    .join(', ');
};
function setMost(i: number, j: number, v: string | number | null) {
  const n = v === '' || v === null ? undefined : Math.max(0, Math.min(366, Math.round(Number(v))));
  if (n !== undefined && !Number.isFinite(n)) return;
  const s = plan.value!.slots[i]!;
  const put = <T extends { most?: number }>(x: T): T => {
    const { most: _m, ...rest } = x;
    void _m;
    return (n === undefined ? rest : { ...rest, most: n }) as T;
  };
  if (s.kind === 'number')
    setSlot(i, { ranges: s.ranges.map((r, k) => (k === j ? put(r) : r)) }, `most${i}.${j}`);
  else
    setSlot(i, { categories: s.categories.map((c, k) => (k === j ? put(c) : c)) }, `most${i}.${j}`);
}

const csv = ref<InstanceType<typeof DataCsvDialog>>();
const entriesDlg = ref<InstanceType<typeof DataEntriesDialog>>();
/** The loaded CSV sample (kept while the built-in one is shown). */
const keptCsv = ref<{ name: string; values: DayValues } | null>(null);
const csvSample = computed(() =>
  plan.value?.sim.source === 'csv' ? plan.value.sim : keptCsv.value,
);
const today = () => new Date().toISOString().slice(0, 10);
const allDates = computed(() =>
  Array.from({ length: days.value }, (_, i) => dayDate(plan.value!.start, i + 1)),
);
const hasAll = (d: string) =>
  plan.value!.slots.every((_, i) => (plan.value!.entries[d]?.[i] ?? null) !== null);
const enteredCount = computed(
  () => allDates.value.filter((d) => plan.value!.entries[d]?.some((v) => v !== null)).length,
);
const missingCount = computed(
  () => allDates.value.filter((d) => d <= today() && !hasAll(d)).length,
);

function setSampleSource(v: 'builtin' | 'csv') {
  const p = plan.value!;
  if (v === p.sim.source) return;
  if (v === 'csv' && keptCsv.value) return setCsvSample(keptCsv.value.name, keptCsv.value.values);
  if (p.sim.source === 'csv') keptCsv.value = { name: p.sim.name, values: p.sim.values };
  edit((x) => ({
    ...x,
    sim: {
      source: 'builtin',
      set: 'sample',
      series: x.slots.map((s, i) =>
        presetSeries(s.preset, x.slots.slice(0, i).filter((y) => y.preset === s.preset).length),
      ),
    },
  }));
}
function setCsvSample(name: string, values: DayValues) {
  edit((p) => ({ ...p, sim: { source: 'csv', name, values } }));
}
/** Imported days take the new values (a slot left empty keeps what was there). */
function importEntries(values: DayValues) {
  edit((p) => {
    const entries = { ...p.entries };
    for (const [d, v] of Object.entries(values)) {
      const was = entries[d] ?? [];
      entries[d] = p.slots.map((_, i) => v[i] ?? was[i] ?? null);
    }
    return { ...p, entries };
  });
}
function setEntry(date: string, slot: number, value: number | string | null) {
  edit((p) => {
    const row = p.slots.map((_, i) => (i === slot ? value : (p.entries[date]?.[i] ?? null)));
    const entries = { ...p.entries };
    if (row.every((v) => v === null)) delete entries[date];
    else entries[date] = row;
    return { ...p, entries };
  }, `entry:${date}:${slot}`);
}
function todayEntry() {
  const d = today();
  if (!allDates.value.includes(d))
    return void $q.notify({ message: 'Today isn’t in this quilt’s period.', timeout: 1500 });
  entriesDlg.value?.show(d);
}
/** Open the table on a day (tapping a day's piece on the quilt). */
const openDay = (d: string) => entriesDlg.value?.show(d);
defineExpose({ openDay });

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
function setStart(v: string | number | null) {
  const s = String(v ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return;
  edit((p) => fitOrder({ ...p, start: p.plan === 'months' ? `${s.slice(0, 8)}01` : s }));
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
/** A range number being typed: applied on Enter or leaving the field, so half-typed numbers
 *  don't push the other ranges around. */
const typed = ref<{ i: number; j: number; side: 'from' | 'to'; v: string | number | null } | null>(
  null,
);
function commitTyped() {
  const t = typed.value;
  typed.value = null;
  if (t && t.v !== null && t.v !== '') setRange(t.i, t.j, { [t.side]: Number(t.v) });
}
function setRange(i: number, j: number, patch: Partial<ValueSlot['ranges'][number]>, c?: string) {
  if (Object.values(patch).some((v) => typeof v === 'number' && !Number.isFinite(v))) return;
  const s = plan.value!.slots[i]!;
  // Ranges stay joined, each at least 1 wide: a big move pushes the neighbours along.
  const side = patch.from !== undefined ? 'from' : patch.to !== undefined ? 'to' : null;
  const ranges = side
    ? moveBound(s.ranges, j, side, patch[side]!)
    : s.ranges.map((r, k) => (k === j ? { ...r, ...patch } : r));
  setSlot(i, { ranges }, c);
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
.join {
  width: 16px;
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
.swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex: none;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.slot {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 6px;
  padding: 8px;
}
.histogram {
  height: 40px;
  gap: 2px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.5);
}
.bar {
  min-width: 0;
  border-radius: 2px 2px 0 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
}
.no-pointer {
  pointer-events: none;
}
</style>
