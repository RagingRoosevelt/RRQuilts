<template>
  <!-- Data entry for one data quilt (spec 041), from Data Quilts or Home: the year as a calendar,
       the tapped day's form, the quilt so far; Print instructions shows the picked days' cutting and sewing instructions to print. -->
  <q-dialog v-model="open" :maximized="$q.screen.lt.md">
    <q-card
      v-if="card && quilt && doc"
      class="column no-wrap entry-card"
      :class="{ phone: $q.screen.lt.md }"
    >
      <q-card-section class="row items-center no-wrap q-pb-sm" style="gap: 8px">
        <div class="col" style="min-width: 0">
          <div class="text-h6 title" :title="quilt.notecard.name">{{ quilt.notecard.name }}</div>
          <div class="text-caption text-grey-7 ellipsis">
            {{ card.projectName }}<template v-if="whereNote"> · {{ whereNote }}</template>
          </div>
        </div>
        <q-select
          :model-value="year"
          :options="years"
          dense
          outlined
          options-dense
          label="Year"
          style="width: 96px; margin-right: 28px"
          @update:model-value="pickYear"
        >
          <q-tooltip>The year this quilt records. Entries of other years are kept.</q-tooltip>
        </q-select>
        <DialogClose />
      </q-card-section>
      <q-separator />
      <!-- Phones: one scrolling column (picture, day form, calendar) between fixed header and
           footer. Wider: the picture beside the form, with the calendar scrolling under it. -->
      <div class="col body" :class="$q.screen.lt.md ? 'scroll' : 'row no-wrap'">
        <div class="preview q-pa-md column items-center" style="gap: 8px">
          <div class="picture-wrap">
            <img :src="picture" alt="The quilt so far" class="picture" />
            <!-- The open or picked days' patches, outlined (the picture fits the quilt exactly). -->
            <svg
              v-if="box"
              class="hot"
              :viewBox="box"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path v-for="(d, i) in hot" :key="`w${i}`" :d="d" class="halo" />
              <path v-for="(d, i) in hot" :key="`k${i}`" :d="d" class="line" />
            </svg>
          </div>
          <div class="text-caption text-grey-7">{{ entered }} of {{ days }} days entered</div>
        </div>
        <div class="col column no-wrap" style="min-width: 0">
          <div class="q-pa-md">
            <DataDayForm
              v-if="focus"
              :key="focus"
              :plan="quilt.data!"
              :date="focus"
              @set="(d, i, v) => store.setEntry(card!, d, i, v)"
              @mark="(d, part, on) => store.setMark(card!, d, part, on)"
              @block="(n, on) => store.setBlockMark(card!, n, on)"
              @move="move"
            />
            <div v-else class="text-grey-7">Tap a day to enter its values.</div>
          </div>
          <q-separator />
          <div class="q-pa-md calendar" :class="{ 'col scroll': !$q.screen.lt.md }">
            <DataCalendar
              :doc="doc"
              :quilt="quilt"
              :selected="selected"
              :focus="focus"
              @pick="pick"
              @range="range"
            />
          </div>
        </div>
      </div>
      <q-separator />
      <q-card-actions align="right">
        <div class="text-caption text-grey-7 q-mr-auto q-pl-sm hint">
          {{
            $q.platform.has.touch
              ? 'Hold a day, then drag to pick days.'
              : 'Drag across days, or Shift-click a second day, to pick days.'
          }}
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="print"
          no-caps
          :label="`Print instructions (${stepDays.length} ${stepDays.length === 1 ? 'day' : 'days'})`"
          :disable="!stepDays.length"
          @click="nextSteps"
        >
          <q-tooltip>
            {{ selected.length > 1 ? 'The picked days' : 'Days entered and not yet cut' }}
          </q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DataCalendar from '@/components/DataCalendar.vue';
import DataDayForm from '@/components/DataDayForm.vue';
import DialogClose from '@/components/DialogClose.vue';
import { dayDate, nextDays, periodLength } from '@/model/data-quilt';
import { generateFor } from '@/model/layout/slots';
import { dayPatches } from '@/model/print/data-steps';
import { quiltThumbnail } from '@/render/thumbnail';
import { useDataTab } from '@/composables/data-tab';
import { todayKey, useDataQuiltsStore, type DataCard } from '@/stores/data-quilts';

const $q = useQuasar();
const router = useRouter();
const store = useDataQuiltsStore();
const dataTab = useDataTab();

const open = ref(false);
const card = ref<DataCard>();
const focus = ref<string | null>(null);
const selected = ref<string[]>([]);

const doc = computed(() => card.value && store.docOf(card.value.projectId));
const quilt = computed(() => card.value && store.quiltOf(card.value));
const plan = computed(() => quilt.value?.data);
const days = computed(() => (plan.value ? periodLength(plan.value.start) : 0));
const last = computed(() => (plan.value ? dayDate(plan.value.start, days.value) : ''));
const entered = computed(
  () =>
    Object.values(plan.value?.entries ?? {}).filter((r) => r.some((v) => v !== null && v !== ''))
      .length,
);
const whereNote = computed(() => {
  const w = card.value && store.whereOf(card.value.projectId);
  return w === 'draft'
    ? 'saved with the project’s unsaved changes'
    : w === 'pending'
      ? 'kept on this device until you next open the project'
      : '';
});
/** The quilt with real entries only, as it stands, drawn to fit its bounds exactly. */
const picture = computed(() =>
  doc.value && quilt.value?.data
    ? quiltThumbnail(
        doc.value,
        { ...quilt.value, data: { ...quilt.value.data, show: 'real' } },
        480,
        $q.dark.isActive,
        false,
        true,
      )
    : '',
);
const box = computed(() => {
  if (!quilt.value) return '';
  const [x0, y0, x1, y1] = generateFor(quilt.value).bounds;
  return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
});
/** Outlines of the picked days' patches (the open day when one is picked). */
const hot = computed(() =>
  doc.value && quilt.value
    ? dayPatches(doc.value, quilt.value, selected.value).map(
        (x) => `M${(x.piece.shown ?? x.piece.poly).map((p) => p.join(' ')).join('L')}Z`,
      )
    : [],
);
const stepDays = computed(() =>
  selected.value.length > 1 ? selected.value : plan.value ? nextDays(plan.value) : [],
);

/** The period's year, and years to pick from (around this year and the quilt's). */
const year = computed(() => (plan.value ? Number(plan.value.start.slice(0, 4)) : 0));
const years = computed(() => {
  const now = new Date().getFullYear();
  const [a, b] = [Math.min(year.value, now - 1), Math.max(year.value, now + 2)];
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
});
async function pickYear(y: number) {
  if (!card.value || y === year.value) return;
  await store.setStart(card.value, y);
  // Same day in the new year.
  const move = (d: string) => `${y}${d.slice(4)}`;
  focus.value = focus.value && inPeriod(move(focus.value)) ? move(focus.value) : plan.value!.start;
  selected.value = [focus.value];
}

const inPeriod = (d: string) => !!plan.value && d >= plan.value.start && d <= last.value;

/** The days from `a` to `b` (either order), in the period. */
function between(a: string, b: string) {
  const [x, y] = [a, b].sort() as [string, string];
  const out: string[] = [];
  for (let t = Date.parse(`${x}T00:00:00Z`); ; t += 86_400_000) {
    const k = new Date(t).toISOString().slice(0, 10);
    if (k > y) break;
    if (inPeriod(k)) out.push(k);
  }
  return out;
}

/** Tap a day: it opens in the form; with Shift, the days from the open one to it are picked. */
function pick(date: string, extend: boolean) {
  if (extend && focus.value) return void (selected.value = between(focus.value, date));
  focus.value = date;
  selected.value = [date];
}

/** Dragged across days: those are picked, the first opens in the form. */
function range(from: string, to: string) {
  focus.value = from;
  selected.value = between(from, to);
}

function move(by: number) {
  if (!focus.value) return;
  const k = new Date(Date.parse(`${focus.value}T00:00:00Z`) + by * 86_400_000)
    .toISOString()
    .slice(0, 10);
  if (inPeriod(k)) pick(k, false);
}

function nextSteps() {
  if (!doc.value || !card.value) return;
  store.stepsInput = { doc: doc.value, quiltId: card.value.quiltId, days: [...stepDays.value] };
  open.value = false;
  void router.push('/data/steps');
}

/** Open on a quilt: on today, or the period's first day before it starts. */
function show(c: DataCard) {
  dataTab.seen();
  card.value = c;
  const p = store.quiltOf(c)?.data;
  const t = todayKey();
  const end = p ? dayDate(p.start, periodLength(p.start)) : t;
  focus.value = !p ? null : t < p.start ? p.start : t > end ? end : t;
  selected.value = focus.value ? [focus.value] : [];
  open.value = true;
}
defineExpose({ show });
</script>

<style scoped>
.title {
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.entry-card {
  width: 1100px;
  max-width: 100vw;
  height: min(900px, 92vh);
}
.entry-card.phone {
  height: 100%;
}
.body {
  min-height: 0;
}
.preview {
  width: 340px;
  flex: none;
}
.phone .preview {
  width: auto;
}
.picture-wrap {
  position: relative;
  line-height: 0;
}
.picture {
  max-width: 100%;
  max-height: 50vh;
}
.hot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.hot path {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
}
.hot .halo {
  stroke: #fff;
  stroke-width: 5px;
}
.hot .line {
  stroke: #000;
  stroke-width: 2.5px;
}
.phone .picture {
  max-height: 30vh;
}
.calendar {
  min-height: 200px;
}
.hint {
  min-width: 0;
}
</style>
