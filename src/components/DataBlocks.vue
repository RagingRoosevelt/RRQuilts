<template>
  <!-- A data quilt's Blocks tab (spec 025): the numbered list placed on block spaces with one brush,
       and the block pools each number draws its block from. -->
  <div v-if="plan" class="column no-wrap" style="gap: 10px">
    <FieldGroup label="Numbers" heading />
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
        <template v-if="next">Next: {{ rows[next - 1]?.text }}</template>
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
      :virtual-scroll-item-size="56"
    >
      <template #default="{ item: r }">
        <!-- A fixed label (the month, week or day) and, beside it, the card of the block space
             holding it: only the card moves when dragged. -->
        <div
          :key="r.k"
          class="number row items-center no-wrap"
          :class="{ current: r.k === next, drop: r.k === dropAt }"
          role="button"
          :aria-label="`${r.text}${r.space ? `, block ${spaceNo.get(r.space)}` : ', not placed'}`"
          @click="pick(r.k)"
          @dragover.prevent="dropAt = r.k"
          @dragleave="dropAt === r.k && (dropAt = null)"
          @drop.prevent="drop(r.k)"
        >
          <div class="label column">
            <span>{{ r.label }}</span>
            <span v-if="r.name !== r.label" class="text-caption ellipsis">{{ r.name }}</span>
          </div>
          <div
            class="card col row items-center no-wrap"
            :class="{ placed: !!r.space }"
            :draggable="!readonly && !!r.space"
            @dragstart="(e: DragEvent) => dragStart(e, r.k)"
            @dragend="editor.dataHot = null"
            @mouseenter="r.space && !dragFrom && (editor.dataHot = r.space)"
            @mouseleave="!dragFrom && (editor.dataHot = null)"
            @click="editor.dataSel = r.space"
          >
            <!-- The block its space shows (or, not placed yet, one from its pool), uncolored. -->
            <img v-if="thumb(r.k, r.space)" :src="thumb(r.k, r.space)" class="thumb" alt="" />
            <span v-else class="thumb" />
            <!-- Which block space: counted left to right, top to bottom, whatever the order. -->
            <span class="col ellipsis text-caption" :class="{ 'text-grey-6': !r.space }">{{
              r.space ? `Block ${spaceNo.get(r.space)}` : 'Not placed'
            }}</span>
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
        </div>
      </template>
    </q-virtual-scroll>

    <FieldGroup label="Block pools" heading>
      <template #aside>
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
      </template>
    </FieldGroup>
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
import FieldGroup from '@/components/FieldGroup.vue';
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
  numberInfo,
  numberName,
  placesIn,
  POOL_DAYS,
  poolsOf,
} from '@/model/data-quilt';
import { generateFor } from '@/model/layout/slots';
import { blockSpaceNumbers } from '@/render/data-overlay';
import { blockThumbnail } from '@/render/thumbnail';
import { useQuasar } from 'quasar';
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
  return Array.from({ length: numberCount(p) }, (_, i) => {
    const name = numberName(p, i + 1);
    const label = numberLabel(p, i + 1);
    return {
      k: i + 1,
      name,
      label,
      text: name === label ? label : `${label} ${name}`,
      space: p.order[i] ?? null,
    };
  });
});
/** The highlighted number: the brush's next, moved on past placed ones. */
const next = computed(() => (plan.value ? nextFree(plan.value, editor.dataNext) : undefined));
const $q = useQuasar();
/** An uncolored picture of the block number `k` shows: its space's block, else its pool's first. */
function thumb(k: number, space: string | null) {
  const doc = project.doc;
  const p = plan.value;
  if (!doc || !p) return undefined;
  let id = space ? props.quilt.layers[0].slots[space]?.block : undefined;
  if (!id) {
    const info = numberInfo(p, k);
    id =
      info && (p.picks[info.pool] ?? []).find((x) => optionsFor(info.pool).some((o) => o.id === x));
  }
  const b =
    id &&
    (doc.project.blocks.find((x) => x.id === id) ?? library.items.blocks.find((x) => x.id === id));
  return b ? blockThumbnail(doc, b, 80, $q.dark.isActive, null) : undefined;
}
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
  editor.dataHot = plan.value?.order[k - 1] ?? null;
  e.dataTransfer?.setData('text/plain', String(k));
}
function drop(k: number) {
  const from = dragFrom.value;
  dragFrom.value = dropAt.value = editor.dataHot = null;
  if (from && from !== k) move(from, k);
}
/** Block spaces' centers, as fractions of the quilt. */
const generated = computed(() => generateFor(props.quilt));
const spots = computed(() => {
  const g = generated.value;
  const [x0, y0, x1, y1] = g.bounds;
  return new Map(
    g.slots
      .filter((s) => s.kind === 'block' && takesBlock(s))
      .map((s): [string, [number, number]] => {
        const [a, b, c, d, e, f] = s.transform;
        return [s.id, [((a + c) / 2 + e - x0) / (x1 - x0), ((b + d) / 2 + f - y0) / (y1 - y0)]];
      }),
  );
});
/** Each block space's number, left to right and top to bottom (as on the quilt). */
const spaceNo = computed(() => blockSpaceNumbers(generated.value));
function fillAll(order: DataOrder) {
  edit((p) => fillNumbers(p, readingOrder(spots.value, [...spots.value.keys()], order)));
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
  height: 56px;
  gap: 8px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 6px;
}
.number.current {
  background: rgba(25, 118, 210, 0.16);
  font-weight: 600;
}
.number.drop .card {
  box-shadow: 0 0 0 2px #1976d2;
}
.label {
  width: 64px;
  flex: none;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.card {
  height: 50px;
  gap: 8px;
  padding: 0 6px;
  border-radius: 6px;
  border: 1px dashed rgba(128, 128, 128, 0.45);
}
.card.placed {
  border-style: solid;
  cursor: grab;
  background: var(--q-card-bg, #fff);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
:global(.body--dark .card.placed) {
  background: #2a2a2a;
}
.thumb {
  width: 40px;
  height: 40px;
  flex: none;
  object-fit: contain;
}
.card:not(.placed) .thumb {
  opacity: 0.4;
}
.moves {
  opacity: 0;
}
.card:hover .moves,
.card:focus-within .moves {
  opacity: 1;
}
@media (hover: none) {
  .moves {
    opacity: 1;
  }
}
.numbers :deep(.q-virtual-scroll__content) {
  display: block;
}
</style>
