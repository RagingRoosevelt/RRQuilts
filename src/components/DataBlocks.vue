<template>
  <!-- A data quilt's Blocks tab (spec 025, 046): the data block to place and the values it reads,
       and the numbered list, placed on block spaces with one brush. -->
  <div v-if="plan" ref="root" class="column no-wrap" style="gap: 10px">
    <FieldGroup label="Data blocks" heading collapsible>
      <div class="text-caption text-grey-7">
        Pick a block, then tap block spaces to place the highlighted number with it. A placed space
        shows the block's variant for its number's days.
      </div>
      <template v-for="kind in kinds" :key="kind">
        <div class="text-caption text-weight-medium">{{ KIND_LABEL[kind] }}</div>
        <div v-if="ofKind(kind).length" class="types row" style="gap: 6px">
          <button
            v-for="b in ofKind(kind)"
            :key="b.id"
            type="button"
            class="type column items-center"
            :class="{ active: isPicked(b, kind) }"
            :aria-pressed="isPicked(b, kind)"
            :title="b.notecard.name"
            @click="pickType(b, kind)"
          >
            <img :src="typeThumb(b, kind)" alt="" />
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
          <template v-if="rows[next - 1]">Next: {{ rows[next - 1]!.text }}</template>
        </div>
      </div>
      <!-- The quilt value each of the picked block's own values shows (spec 046 US2), picked as
           in the block editor's Value. -->
      <template v-if="picked">
        <div v-for="l in letters" :key="l" class="row items-center no-wrap" style="gap: 8px">
          <span class="text-caption">{{
            letters.length > 1 ? `Block ${SLOT_NAMES[l]} shows` : 'Value'
          }}</span>
          <q-btn-toggle
            :model-value="editor.dataSeries[l] ?? l"
            :options="valueOptions"
            dense
            no-caps
            unelevated
            toggle-color="primary"
            :aria-label="
              letters.length > 1 ? `Quilt value for block value ${SLOT_NAMES[l]}` : 'Value'
            "
            @update:model-value="(v: number) => setSeries(l, v)"
          />
        </div>
        <div v-if="letters.length > plan.slots.length" class="text-caption text-warning">
          {{ picked.block.notecard.name }} has {{ letters.length }} values and this quilt
          {{ plan.slots.length }}: add more in the Data tab to place it.
        </div>
      </template>
      <div class="text-caption text-grey-7">
        Tap block spaces to place the highlighted number. It moves on to the next number. Tap a
        number below to place from there, or to place it again. Tap a placed space to take it off,
        or, with another number or block picked, to change it to those.
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
          :disable="readonly || !plan.places.length"
          @click="edit((p) => ({ ...p, places: [] }))"
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
          <div
            :key="r.k"
            class="number row items-center no-wrap"
            :class="{ current: r.k === next }"
            role="button"
            :aria-label="`${r.text}, ${r.places.length ? `${r.places.length} placed` : 'not placed'}`"
            @click="pick(r.k)"
          >
            <div class="label column">
              <span>{{ r.label }}</span>
              <span v-if="r.name !== r.label" class="text-caption ellipsis">{{ r.name }}</span>
            </div>
            <div class="col row items-center no-wrap places">
              <div
                v-for="pl in r.places"
                :key="pl.space"
                class="card placed row items-center no-wrap"
                @mouseenter="editor.dataHot = pl.space"
                @mouseleave="editor.dataHot = null"
                @click="editor.dataSel = pl.space"
              >
                <!-- The block its space shows, uncolored, and the values it shows. -->
                <img v-if="thumb(pl)" :src="thumb(pl)" class="thumb" alt="" />
                <span class="text-caption">{{ seriesLabel(pl, blockOf(pl.block)) }}</span>
              </div>
              <span v-if="!r.places.length" class="text-caption text-grey-6">Not placed</span>
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
import { readingOrder, SLOT_NAMES, type DataOrder } from '@/model/data-paint';
import {
  blockLetters,
  dataNumbers,
  KIND_DAYS,
  variantBlock,
  dataReport,
  fillNumbers,
  numberCount,
  seriesLabel,
} from '@/model/data-quilt';
import { useDataTypes } from '@/composables/data-types';
import type { Block, DataKind } from '@/model/schema/block';
import { generateFor } from '@/model/layout/slots';
import { isWholeBlockSpace } from '@/render/data-overlay';
import { blockThumbnail } from '@/render/thumbnail';
import { useQuasar } from 'quasar';
import type { DataPlace, DataPlan } from '@/model/schema/data-quilt';
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
const { ofKind, typeFor, block: blockOf, picked, pick: pickBlock } = useDataTypes();
const plan = computed(() => props.quilt.data);
/** The kinds the plan's numbers take, in list order. */
const kinds = computed((): DataKind[] => {
  const p = plan.value;
  if (!p) return [];
  const order: DataKind[] = ['month', 'week', 'day'];
  const have = new Set(dataNumbers(p).map((x) => x.kind));
  // A Weeks plan whose single day can move to the start takes a day block there too.
  if (p.plan === 'weeks') have.add('day');
  return order.filter((k) => have.has(k));
});
const rows = computed(() => {
  const p = plan.value;
  if (!p) return [];
  const by = new Map<number, DataPlace[]>();
  for (const x of p.places) by.set(x.n, [...(by.get(x.n) ?? []), x]);
  return dataNumbers(p).map((num, i) => {
    const k = i + 1;
    const name = num.label;
    return { k, name, label: name, text: name, places: by.get(k) ?? [] };
  });
});
/** The highlighted number. */
const next = computed(() =>
  plan.value ? Math.min(Math.max(1, editor.dataNext), numberCount(plan.value)) : 1,
);
const $q = useQuasar();
/** The sidebar that scrolls the number list. */
const root = ref<HTMLElement>();
const scroller = ref<Element | null>(null);
watch(root, (el) => (scroller.value = el?.closest('.scroll') ?? null), { flush: 'post' });
/** An uncolored picture of the block a placement's space shows (else its block's). */
function thumb(pl: DataPlace) {
  const doc = project.doc;
  if (!doc) return undefined;
  const id = props.quilt.layers[0].slots[pl.space]?.block ?? pl.block;
  const b = doc.project.blocks.find((x) => x.id === id) ?? blockOf(id);
  return b ? blockThumbnail(doc, b, 80, $q.dark.isActive, null) : undefined;
}
const report = computed(() => dataReport(props.quilt, project.doc?.project.blocks ?? []));

/** The drawing a block shows for a kind: a week or month block listed with the day blocks shows
 *  its 1-day variant (kept, so its picture is cached). */
const variants = new WeakMap<Block, Map<number, Block>>();
function shownFor(b: Block, kind: DataKind): Block {
  const len = KIND_DAYS[kind];
  const v = b.data?.variants?.filter((x) => x.days >= len).sort((x, y) => x.days - y.days)[0];
  if (!v || len >= KIND_DAYS[b.data!.kind]) return b;
  let m = variants.get(b);
  if (!m) variants.set(b, (m = new Map()));
  let out = m.get(v.days);
  if (!out) m.set(v.days, (out = variantBlock(b, v) ?? b));
  return out;
}
/** A block's picture for a kind, in its colors. */
const typeThumb = (b: Block, kind: DataKind) =>
  project.doc
    ? blockThumbnail(
        project.doc,
        shownFor(b, kind),
        96,
        $q.dark.isActive,
        undefined,
        library.items.colors,
      )
    : '';
const isPicked = (b: Block, kind: DataKind) =>
  picked.value?.block.id === b.id && picked.value.kind === kind;
function pickType(b: Block, kind: DataKind) {
  pickBlock(b, kind);
  if (!props.readonly) editor.tool = 'number';
}
/** The picked block's own values (A, B…). */
const letters = computed(() => (picked.value ? blockLetters(picked.value.block) : []));
const valueOptions = computed(() =>
  // All four, as the block editor's Value; ones the quilt doesn't have yet are off.
  SLOT_NAMES.map((n, i) => {
    const s = plan.value?.slots[i];
    return {
      label: `q${n}`,
      value: i,
      disable: !s,
      attrs: { title: s ? s.label : 'Add this value in the Data tab' },
    };
  }),
);
function setSeries(letter: number, v: number) {
  const out = [...editor.dataSeries];
  while (out.length < 4) out.push(null);
  out[letter] = v;
  editor.dataSeries = out;
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
function fillAll(order: DataOrder) {
  edit((p) => fillNumbers(p, readingOrder(spots.value, [...spots.value.keys()], order), typeFor));
}
// Another plan or period (switched in the Data tab): the highlight starts at the first number.
watch(
  () => plan.value && numberCount(plan.value),
  () => (editor.dataNext = 1),
);
// Nothing picked yet: the first block of the first kind.
watch(
  kinds,
  (ks) => {
    if (picked.value) return;
    const k = ks.find((x) => ofKind(x).length);
    if (k) pickBlock(ofKind(k)[0]!, k);
  },
  { immediate: true },
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
.places {
  gap: 6px;
  overflow-x: auto;
}
.card {
  flex: none;
}
.numbers :deep(.q-virtual-scroll__content) {
  display: block;
}
</style>
