<template>
  <!-- A data quilt's Blocks tab (spec 025): the numbered list placed on block spaces with one brush,
       and the data block types it places. -->
  <div v-if="plan" ref="root" class="column no-wrap" style="gap: 10px">
    <FieldGroup label="Block types" heading collapsible>
      <div class="text-caption text-grey-7">
        Pick a type, then place numbers with it. A placed space keeps its type and shows the variant
        for its month's days. Tap a placed space with another type picked to change its type.
      </div>
      <template v-for="kind in kinds" :key="kind">
        <div class="text-caption text-weight-medium">{{ KIND_LABEL[kind] }}</div>
        <div v-if="ofKind(kind).length" class="types row" style="gap: 6px">
          <button
            v-for="b in ofKind(kind)"
            :key="b.id"
            type="button"
            class="type column items-center"
            :class="{ active: typeFor(kind) === b.id }"
            :aria-pressed="typeFor(kind) === b.id"
            :title="b.notecard.name"
            @click="pickType(kind, b.id)"
          >
            <img :src="typeThumb(b)" alt="" />
            <span class="text-caption ellipsis">{{ b.notecard.name }}</span>
          </button>
        </div>
        <div v-else class="text-caption text-grey-7">
          No {{ kind }} data blocks yet: turn on Data block in a block’s Details tab.
        </div>
      </template>
    </FieldGroup>
    <FieldGroup label="Numbers" heading collapsible>
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
        Tap block spaces to place the highlighted number. It moves on to the next one not placed.
        Tap a number below to place from there. Tap a placed space to take its number back. Drag
        placed numbers, or use their arrows, to reorder them. A number's place in the list is its
        label.
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

      <!-- Scrolls with the sidebar (no box of its own); only the rows in view are drawn. -->
      <q-virtual-scroll
        v-if="scroller"
        :items="rows"
        class="numbers"
        :scroll-target="scroller"
        :virtual-scroll-item-size="44"
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
              :class="{
                placed: !!r.space,
                'glow-bottom': gap !== null && r.k === gap,
                'glow-top': gap !== null && r.k === gap + 1,
              }"
              :draggable="!readonly && !!r.space"
              @dragstart="(e: DragEvent) => dragStart(e, r.k)"
              @dragend="endDrag"
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
    </FieldGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import FieldGroup from '@/components/FieldGroup.vue';
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
} from '@/model/data-quilt';
import { useDataTypes } from '@/composables/data-types';
import type { Block, DataKind } from '@/model/schema/block';
import { generateFor } from '@/model/layout/slots';
import { blockSpaceNumbers, isWholeBlockSpace } from '@/render/data-overlay';
import { blockThumbnail } from '@/render/thumbnail';
import { useQuasar } from 'quasar';
import type { DataPlan } from '@/model/schema/data-quilt';
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
const KIND_LABEL: Record<DataKind, string> = {
  month: 'Month blocks',
  week: 'Week blocks',
  day: 'Day blocks',
};
const { ofKind, typeFor, block: typeBlock } = useDataTypes();
const plan = computed(() => props.quilt.data);
/** The kinds the plan's numbers take (Weeks: and day blocks for the days left over). */
const kinds = computed((): DataKind[] => {
  const p = plan.value;
  if (!p) return [];
  return p.plan === 'months'
    ? ['month']
    : p.plan === 'days'
      ? ['day']
      : numberCount(p) > 52
        ? ['week', 'day']
        : ['week'];
});
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
/** The sidebar that scrolls the number list. */
const root = ref<HTMLElement>();
const scroller = ref<Element | null>(null);
watch(root, (el) => (scroller.value = el?.closest('.scroll') ?? null), { flush: 'post' });
/** An uncolored picture of the block number `k` shows: its space's block, else the picked type's. */
function thumb(k: number, space: string | null) {
  const doc = project.doc;
  const p = plan.value;
  if (!doc || !p) return undefined;
  let id = space ? props.quilt.layers[0].slots[space]?.block : undefined;
  if (!id) {
    const kind = numberInfo(p, k)?.kind;
    id = kind && typeFor(kind);
  }
  const b = id && (doc.project.blocks.find((x) => x.id === id) ?? typeBlock(id));
  return b ? blockThumbnail(doc, b, 80, $q.dark.isActive, null) : undefined;
}
const report = computed(() => dataReport(props.quilt, project.doc?.project.blocks ?? []));

/** A type's picture, in its colors. */
const typeThumb = (b: Block) =>
  project.doc
    ? blockThumbnail(project.doc, b, 96, $q.dark.isActive, undefined, library.items.colors)
    : '';
function pickType(kind: DataKind, id: string) {
  editor.dataType[kind] = id;
  if (!props.readonly) editor.tool = 'number';
}

/** Change the plan (one undo step). */
function edit(fn: (p: DataPlan) => DataPlan) {
  if (props.readonly || !plan.value) return;
  const out = fn(plan.value);
  project.change((d) => {
    const q = d.project.quilts.find((x) => x.id === props.quilt.id);
    if (q) q.data = JSON.parse(JSON.stringify(out)) as DataPlan;
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
/** The gap a drop lands in, as the number above it (0: before the first). Dragged down, the card
 *  goes after the one it's over; dragged up, before it. */
const gap = computed(() => {
  const [from, at] = [dragFrom.value, dropAt.value];
  if (!from || !at || from === at) return null;
  return from < at ? at : at - 1;
});
function dragStart(e: DragEvent, k: number) {
  dragFrom.value = k;
  editor.dataHot = plan.value?.order[k - 1] ?? null;
  e.dataTransfer?.setData('text/plain', String(k));
}
/** A drag let go anywhere (a drop on the list has already moved the card). */
function endDrag() {
  dragFrom.value = dropAt.value = editor.dataHot = null;
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
    g.slots.filter(isWholeBlockSpace).map((s): [string, [number, number]] => {
      const [a, b, c, d, e, f] = s.transform;
      return [s.id, [((a + c) / 2 + e - x0) / (x1 - x0), ((b + d) / 2 + f - y0) / (y1 - y0)]];
    }),
  );
});
/** Each block space's number, left to right and top to bottom (as on the quilt). */
const spaceNo = computed(() => blockSpaceNumbers(generated.value));
function fillAll(order: DataOrder) {
  edit((p) => fillNumbers(p, readingOrder(spots.value, [...spots.value.keys()], order), typeFor));
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
  height: 44px;
  gap: 8px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 6px;
}
.number.current {
  background: rgba(25, 118, 210, 0.16);
  font-weight: 600;
}
/* Where a dragged card will land: the edges either side of that gap glow. */
.card.glow-bottom {
  border-bottom: 2px solid #1976d2;
  box-shadow: 0 7px 12px -2px rgba(25, 118, 210, 0.9);
}
.card.glow-top {
  border-top: 2px solid #1976d2;
  box-shadow: 0 -7px 12px -2px rgba(25, 118, 210, 0.9);
}
.types .type {
  width: 84px;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.35);
  background: none;
  color: inherit;
  cursor: pointer;
}
.types .type.active {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px var(--q-primary);
}
.types .type img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
.types .type span {
  max-width: 100%;
}
.label {
  width: 64px;
  flex: none;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.card {
  height: 40px;
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
  width: 32px;
  height: 32px;
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
