<template>
  <!-- Data entry for one data quilt (spec 041), from Data Quilts or Home: the year as a calendar,
       the tapped day's form, the quilt so far; Next steps prints the picked days' steps. -->
  <q-dialog v-model="open" :maximized="$q.screen.lt.md">
    <q-card
      v-if="card && quilt && doc"
      class="column no-wrap"
      style="width: 1100px; max-width: 100vw"
    >
      <q-card-section class="row items-center no-wrap q-pb-sm" style="gap: 8px">
        <div class="col" style="min-width: 0">
          <div class="text-h6 ellipsis">{{ quilt.notecard.name }}</div>
          <div class="text-caption text-grey-7 ellipsis">
            {{ card.projectName }}<template v-if="whereNote"> · {{ whereNote }}</template>
          </div>
        </div>
        <DialogClose />
      </q-card-section>
      <q-separator />
      <div class="col row no-wrap body" :class="{ column: $q.screen.lt.md }">
        <div class="preview q-pa-md column items-center" style="gap: 8px">
          <img :src="picture" alt="The quilt so far" class="picture" />
          <div class="text-caption text-grey-7">{{ entered }} of {{ days }} days entered</div>
        </div>
        <div class="col column no-wrap" style="min-width: 0">
          <div class="col scroll q-pa-md calendar">
            <DataCalendar
              :doc="doc"
              :quilt="quilt"
              :selected="selected"
              :focus="focus"
              @pick="pick"
            />
          </div>
          <q-separator />
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
        </div>
      </div>
      <q-separator />
      <q-card-actions align="right">
        <div class="text-caption text-grey-7 q-mr-auto q-pl-sm">
          Shift-click a second day to pick the days between.
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="checklist"
          no-caps
          :label="`Next steps (${stepDays.length} ${stepDays.length === 1 ? 'day' : 'days'})`"
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
import { quiltThumbnail } from '@/render/thumbnail';
import { todayKey, useDataQuiltsStore, type DataCard } from '@/stores/data-quilts';

const $q = useQuasar();
const router = useRouter();
const store = useDataQuiltsStore();

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
/** The quilt with real entries only, as it stands. */
const picture = computed(() =>
  doc.value && quilt.value?.data
    ? quiltThumbnail(
        doc.value,
        { ...quilt.value, data: { ...quilt.value.data, show: 'real' } },
        360,
        $q.dark.isActive,
      )
    : '',
);
const stepDays = computed(() =>
  selected.value.length > 1 ? selected.value : plan.value ? nextDays(plan.value) : [],
);

const inPeriod = (d: string) => !!plan.value && d >= plan.value.start && d <= last.value;

/** Tap a day: it opens in the form; with Shift, the days from the open one to it are picked. */
function pick(date: string, extend: boolean) {
  if (extend && focus.value) {
    const [a, b] = [focus.value, date].sort() as [string, string];
    const out: string[] = [];
    for (let t = Date.parse(`${a}T00:00:00Z`); ; t += 86_400_000) {
      const k = new Date(t).toISOString().slice(0, 10);
      if (k > b) break;
      out.push(k);
    }
    selected.value = out;
    return;
  }
  focus.value = date;
  selected.value = [date];
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
.body {
  min-height: 0;
  max-height: calc(100vh - 160px);
}
.preview {
  width: 340px;
  flex: none;
}
.body.column .preview {
  width: auto;
}
.picture {
  max-width: 100%;
  max-height: 50vh;
}
.calendar {
  min-height: 200px;
}
</style>
