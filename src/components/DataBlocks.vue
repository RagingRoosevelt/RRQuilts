<template>
  <!-- A data quilt's Blocks tab (spec 025): the numbered list placed on block spaces with one brush,
       and the block pools each number draws its block from. -->
  <div v-if="plan" class="column no-wrap" style="gap: 10px">
    <div class="row items-center no-wrap" style="gap: 8px">
      <q-btn
        :unelevated="editor.tool === 'number'"
        :outline="editor.tool !== 'number'"
        color="primary"
        dense
        no-caps
        icon="brush"
        label="Place numbers"
        :disable="readonly"
        @click="editor.tool = 'number'"
      />
      <div class="col text-caption" aria-live="polite">
        <template v-if="next">Next: {{ numberLabel(next) }} {{ numberName(plan, next) }}</template>
        <template v-else>Every number is placed.</template>
      </div>
    </div>
    <div class="text-caption text-grey-7">
      Tap block spaces to place the highlighted number. It moves on to the next one not placed. Tap
      a number below to place from there. Tap a placed space to take its number back. Drag placed
      numbers, or use their arrows, to reorder them. A number's place in the list is its label.
    </div>
    <div class="row items-center" style="gap: 6px">
      <span class="text-caption">Fill empty numbers</span>
      <q-btn
        v-for="o in ORDERS"
        :key="o.value"
        dense
        outline
        no-caps
        size="sm"
        :label="o.label"
        :disable="readonly"
        @click="fillAll(o.value)"
      />
      <q-btn
        dense
        flat
        no-caps
        size="sm"
        icon="clear"
        label="Clear"
        :disable="readonly || !plan.order.some(Boolean)"
        @click="edit((p) => ({ ...p, order: p.order.map(() => null) }))"
      />
    </div>

    <q-virtual-scroll
      :items="rows"
      class="numbers"
      style="max-height: 40vh"
      :virtual-scroll-item-size="32"
    >
      <template #default="{ item: r }">
        <div
          :key="r.k"
          class="number row items-center no-wrap q-px-xs"
          :class="{ current: r.k === next, drop: r.k === dropAt }"
          :draggable="!readonly && !!r.space"
          role="button"
          :aria-label="`${numberLabel(r.k)} ${r.name}${r.space ? ', placed' : ''}`"
          @click="pick(r.k)"
          @dragstart="(e: DragEvent) => dragStart(e, r.k)"
          @dragover.prevent="dropAt = r.k"
          @dragleave="dropAt === r.k && (dropAt = null)"
          @drop.prevent="drop(r.k)"
        >
          <span class="label">{{ numberLabel(r.k) }}</span>
          <span class="col ellipsis text-caption">{{ r.name }}</span>
          <q-icon v-if="r.space" name="check" size="16px" color="positive">
            <q-tooltip>Placed</q-tooltip>
          </q-icon>
          <span v-if="r.space && !readonly" class="moves">
            <q-btn
              flat
              round
              dense
              size="xs"
              icon="arrow_upward"
              aria-label="Move up"
              :disable="r.k === 1"
              @click.stop="move(r.k, r.k - 1)"
            />
            <q-btn
              flat
              round
              dense
              size="xs"
              icon="arrow_downward"
              aria-label="Move down"
              :disable="r.k === rows.length"
              @click.stop="move(r.k, r.k + 1)"
            />
          </span>
        </div>
      </template>
    </q-virtual-scroll>

    <q-separator />
    <div class="row items-center">
      <div class="text-subtitle2 col">Block pools</div>
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
      Each number shows a block from the pool for its days, picked at random when a pool has
      several. A pool takes blocks with at least that many day places.
    </div>
    <q-select
      v-for="pool in pools"
      :key="pool"
      :model-value="plan.picks[pool] ?? []"
      :options="optionsFor(pool)"
      option-value="id"
      option-label="label"
      emit-value
      map-options
      multiple
      use-chips
      dense
      outlined
      :label="POOL_LABEL[pool]"
      :readonly="readonly"
      @update:model-value="(ids: string[]) => setPicks(pool, ids)"
    />

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
import { computed, ref, watch } from 'vue';
import { takesBlock } from '@/editor/scope';
import { readingOrder, type DataOrder } from '@/model/data-paint';
import {
  dataReport,
  fillNumbers,
  fitOrder,
  moveNumber,
  nextFree,
  numberCount,
  numberLabel,
  numberName,
  placesIn,
  POOL_DAYS,
  poolsOf,
} from '@/model/data-quilt';
import { generateFor } from '@/model/layout/slots';
import type { DataPlan, Pool } from '@/model/schema/data-quilt';
import type { Quilt } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

const props = defineProps<{ quilt: Quilt; readonly?: boolean }>();
const project = useProjectStore();
const editor = useEditorStore();
const library = useLibraryStore();

const ORDERS: { value: DataOrder; label: string }[] = [
  { value: 'rows', label: 'Rows' },
  { value: 'columns', label: 'Columns' },
  { value: 'snake', label: 'Snake' },
];
const POOL_LABEL: Record<Pool, string> = {
  '31': '31-day months',
  '30': '30-day months',
  '29': '29-day months',
  '28': '28-day months',
  '7': 'Weeks',
  '1': 'Days',
};

const plan = computed(() => props.quilt.data);
const pools = computed(() => (plan.value ? poolsOf(plan.value) : []));
const rows = computed(() => {
  const p = plan.value;
  if (!p) return [];
  return Array.from({ length: numberCount(p) }, (_, i) => ({
    k: i + 1,
    name: numberName(p, i + 1),
    space: p.order[i] ?? null,
  }));
});
/** The highlighted number: the brush's next, moved on past placed ones. */
const next = computed(() => (plan.value ? nextFree(plan.value, editor.dataNext) : undefined));
const report = computed(() => dataReport(props.quilt, project.doc?.project.blocks ?? []));

/** Blocks with enough day places for a pool (own and in libraries). */
const candidates = computed(() => {
  const seen = new Set<string>();
  return [...(project.doc?.project.blocks ?? []), ...library.items.blocks].flatMap((b) => {
    if (seen.has(b.id)) return [];
    seen.add(b.id);
    const n = placesIn(b);
    return n ? [{ id: b.id, label: `${b.notecard.name} (${n})`, n }] : [];
  });
});
const optionsFor = (pool: Pool) => candidates.value.filter((c) => c.n >= POOL_DAYS[pool]);

/** Change the plan (one undo step). */
function edit(fn: (p: DataPlan) => DataPlan) {
  if (props.readonly || !plan.value) return;
  const out = fn(plan.value);
  project.change((d) => {
    const q = d.project.quilts.find((x) => x.id === props.quilt.id);
    if (q) q.data = JSON.parse(JSON.stringify(out)) as DataPlan;
  });
}
function setPicks(pool: Pool, ids: string[]) {
  edit((p) => {
    const picks = { ...p.picks };
    if (ids.length) picks[pool] = ids;
    else delete picks[pool];
    return { ...p, picks };
  });
}
function pick(k: number) {
  editor.dataNext = k;
  if (!props.readonly) editor.tool = 'number';
}
function move(from: number, to: number) {
  edit((p) => moveNumber(p, from, to));
}
const dragFrom = ref<number | null>(null);
const dropAt = ref<number | null>(null);
function dragStart(e: DragEvent, k: number) {
  dragFrom.value = k;
  e.dataTransfer?.setData('text/plain', String(k));
}
function drop(k: number) {
  const from = dragFrom.value;
  dragFrom.value = dropAt.value = null;
  if (from && from !== k) move(from, k);
}
function fillAll(order: DataOrder) {
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
  edit((p) => fillNumbers(p, readingOrder(spots, [...spots.keys()], order)));
}
// A list sized for another plan or period (switched in the Data tab) is fitted on the next edit;
// the highlight starts at the first number not placed.
watch(
  () => plan.value && fitOrder(plan.value).order.length,
  () => (editor.dataNext = 1),
);
</script>

<style scoped>
.number {
  height: 32px;
  gap: 6px;
  cursor: pointer;
  border-radius: 4px;
}
.number.current {
  background: rgba(25, 118, 210, 0.16);
  font-weight: 600;
}
.number.drop {
  box-shadow: inset 0 2px 0 #1976d2;
}
.moves {
  opacity: 0;
}
.number:hover .moves,
.number:focus-within .moves {
  opacity: 1;
}
@media (hover: none) {
  .moves {
    opacity: 1;
  }
}
.label {
  font-variant-numeric: tabular-nums;
  width: 34px;
  flex: none;
}
.numbers :deep(.q-virtual-scroll__content) {
  display: block;
}
</style>
