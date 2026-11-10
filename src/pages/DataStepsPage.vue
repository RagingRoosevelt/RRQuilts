<template>
  <!-- Print instructions for a data quilt (spec 041): picked days' pieces, fabrics and templates,
       or block by block (every day of each block). Opened from Data Quilts or the data entry
       dialog. The options sit where the editors' sidebar does (Settings: toolbar left or right). -->
  <q-page v-if="input && plan" class="column no-wrap" :style-fn="fill">
    <div
      class="row items-center no-wrap q-px-sm bar"
      :class="{ reverse: app.settings.sidesSwapped }"
      style="gap: 8px"
    >
      <q-btn flat dense round icon="arrow_back" to="/data" aria-label="Back to Data Quilts">
        <q-tooltip>Back to Data Quilts</q-tooltip>
      </q-btn>
      <div
        class="col q-py-xs"
        style="min-width: 0; overflow-wrap: anywhere"
        :class="{ 'text-right': app.settings.sidesSwapped }"
      >
        <span class="text-subtitle1">{{ quilt?.notecard.name }}</span>
        <span class="text-caption text-grey-7 q-ml-sm">{{ input.doc.project.name }}</span>
      </div>
      <PrintZoom />
      <q-btn flat round dense icon="menu" :aria-label="sidebarLabel" @click="sidebar = !sidebar">
        <q-tooltip>{{ sidebarLabel }}</q-tooltip>
      </q-btn>
    </div>
    <div
      class="row col no-wrap"
      :class="{ reverse: app.settings.sidesSwapped }"
      style="min-height: 0; position: relative"
    >
      <PrintPreview
        kind="steps"
        :id="input.quiltId"
        :doc="input.doc"
        :days="mode === 'days' ? days : undefined"
        :numbers="mode === 'blocks' ? numbers : undefined"
      />
      <div v-show="sidebar" class="options q-pa-md column no-wrap scroll" style="gap: 12px">
        <SlidePicker
          :model-value="mode"
          :options="[
            { value: 'days', label: 'Days' },
            { value: 'blocks', label: 'Block by block' },
          ]"
          @update:model-value="setMode"
        />
        <template v-if="mode === 'days'">
          <div class="column" style="gap: 8px">
            <q-input
              :model-value="from"
              type="date"
              dense
              outlined
              stack-label
              label="From"
              :min="plan.start"
              :max="last"
              @update:model-value="(v) => setRange(String(v ?? ''), to)"
            />
            <q-input
              :model-value="to"
              type="date"
              dense
              outlined
              stack-label
              label="To"
              :min="plan.start"
              :max="last"
              @update:model-value="(v) => setRange(from, String(v ?? ''))"
            />
          </div>
          <q-btn outline no-caps dense icon="content_cut" label="Not cut yet" @click="notCut">
            <q-tooltip>The days entered and not marked Cut</q-tooltip>
          </q-btn>
          <div class="text-body2">{{ daysNote }}</div>
        </template>
        <template v-else>
          <div class="row no-wrap" style="gap: 8px">
            <q-select
              :model-value="numbers[0]"
              :options="blockOptions"
              emit-value
              map-options
              dense
              outlined
              label="From"
              class="col"
              @update:model-value="(k: number) => setBlocks(k, Math.max(k, numbers.at(-1)!))"
            />
            <q-select
              :model-value="numbers.at(-1)"
              :options="blockOptions"
              emit-value
              map-options
              dense
              outlined
              label="To"
              class="col"
              @update:model-value="(k: number) => setBlocks(Math.min(k, numbers[0]!), k)"
            />
          </div>
          <div class="row no-wrap" style="gap: 8px">
            <q-btn
              outline
              no-caps
              dense
              icon="chevron_left"
              label="Previous"
              class="col"
              :disable="numbers[0]! <= 1"
              @click="shift(-1)"
            />
            <q-btn
              outline
              no-caps
              dense
              icon-right="chevron_right"
              label="Next"
              class="col"
              :disable="numbers.at(-1)! >= blockOptions.length"
              @click="shift(1)"
            />
          </div>
        </template>
        <q-separator />
        <q-toggle
          :model-value="prefs.tint"
          dense
          label="Tint by fabric"
          @update:model-value="(v: boolean) => set('tint', v)"
        >
          <q-tooltip
            >A template for each piece and fabric, tinted and labeled with its days; off: one per
            shape</q-tooltip
          >
        </q-toggle>
        <q-toggle
          v-if="quilt?.notecard.notes"
          :model-value="prefs.stepsNotes"
          dense
          label="Quilt notes"
          @update:model-value="(v: boolean) => set('stepsNotes', v)"
        >
          <q-tooltip>Print the quilt's notes after the instructions</q-tooltip>
        </q-toggle>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PrintPreview from '@/components/PrintPreview.vue';
import PrintZoom from '@/components/PrintZoom.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import {
  dataNumbers,
  dayDate,
  nextDays,
  numberLabel,
  numberOfDate,
  periodLength,
} from '@/model/data-quilt';
import { printPrefs, type PrintPrefs } from '@/model/print/prefs';
import { useDataQuiltsStore } from '@/stores/data-quilts';
import { useSettingsStore } from '@/stores/settings';

const store = useDataQuiltsStore();
const app = useSettingsStore();
const router = useRouter();
const $q = useQuasar();
const fill = (offset: number) => ({ height: `calc(100vh - ${offset}px)` });
// As the editors: open beside the preview on wide screens, slid over it on phones and tablets.
const sidebar = ref(!$q.screen.lt.md);
const sidebarLabel = computed(() => (sidebar.value ? 'Hide sidebar' : 'Show sidebar'));
const input = computed(() => store.stepsInput);
const quilt = computed(() =>
  input.value?.doc.project.quilts.find((q) => q.id === input.value!.quiltId),
);
const plan = computed(() => quilt.value?.data);
const last = computed(() =>
  plan.value ? dayDate(plan.value.start, periodLength(plan.value.start)) : '',
);
const prefs = computed(() => printPrefs(app.settings.print));
function set<K extends keyof PrintPrefs>(key: K, value: PrintPrefs[K]) {
  app.settings.print = { ...app.settings.print, [key]: value };
}

const mode = computed(() => (input.value?.numbers?.length ? 'blocks' : 'days'));
const days = computed(() => [...(input.value?.days ?? [])].sort());
const from = computed(() => days.value[0] ?? '');
const to = computed(() => days.value.at(-1) ?? '');
const numbers = computed(() => input.value?.numbers ?? []);
const blockOptions = computed(() =>
  plan.value
    ? dataNumbers(plan.value).map((_, i) => ({
        value: i + 1,
        label: numberLabel(plan.value!, i + 1),
      }))
    : [],
);
const daysNote = computed(() => {
  const n = days.value.length;
  return n ? `${n} ${n === 1 ? 'day' : 'days'}` : 'No days picked';
});

/** The days or the blocks to print (one or the other). */
function patch(x: { days: string[] } | { numbers: number[] }) {
  if (!input.value) return;
  const { doc, quiltId } = input.value;
  store.stepsInput = { doc, quiltId, ...x };
}
/** Every day from `a` to `b`, inside the period. */
function setRange(a: string, b: string) {
  if (!plan.value || !a || !b) return;
  const [x, y] = [a, b].sort() as [string, string];
  const out: string[] = [];
  for (let t = Date.parse(`${x}T00:00:00Z`); ; t += 86_400_000) {
    const k = new Date(t).toISOString().slice(0, 10);
    if (k > y) break;
    if (k >= plan.value.start && k <= last.value) out.push(k);
  }
  patch({ days: out });
}
function notCut() {
  if (plan.value) patch({ days: nextDays(plan.value) });
}
const setBlocks = (a: number, b: number) =>
  patch({ numbers: Array.from({ length: b - a + 1 }, (_, i) => a + i) });
/** The same number of blocks before or after. */
function shift(by: number) {
  const n = numbers.value.length;
  const a = Math.min(Math.max(1, numbers.value[0]! + by * n), blockOptions.value.length - n + 1);
  setBlocks(a, a + n - 1);
}
/** Switching keeps the place: days become their blocks, blocks the days not cut yet. */
function setMode(m: string) {
  if (!plan.value || m === mode.value) return;
  if (m === 'blocks') {
    const k = (from.value && numberOfDate(plan.value, from.value)?.k) || 1;
    const k2 = (to.value && numberOfDate(plan.value, to.value)?.k) || k;
    setBlocks(k, Math.max(k, k2));
  } else {
    const all = nextDays(plan.value);
    patch({ days: all.length ? all : [plan.value.start] });
  }
}
// Opened directly (a reload): nothing to print, back to the list.
onMounted(() => !input.value && void router.replace('/data'));
</script>

<style scoped>
.bar {
  border-bottom: 1px solid rgba(128, 128, 128, 0.25);
}
.options {
  width: 280px;
  flex: none;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
}
.reverse > .options {
  border-left: none;
  border-right: 1px solid rgba(128, 128, 128, 0.25);
}
/* Phones and portrait tablets: the sidebar slides over the preview. */
@media (max-width: 1023px) {
  .options {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: min(320px, 85vw);
    z-index: 5;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.25);
  }
  .reverse > .options {
    right: auto;
    left: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  }
  :global(.body--dark .options) {
    background: var(--q-dark-page);
  }
}
@media (max-width: 599px) {
  .options {
    width: 95%;
  }
}
</style>
