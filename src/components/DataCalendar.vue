<template>
  <!-- A data quilt's year as a calendar (spec 041): a dot per value in its range color once
       entered, Cut and Assembled badges, the picked days highlighted. -->
  <div ref="root" class="data-calendar">
    <div v-for="m in months" :key="m.key" class="month" :data-month="m.key">
      <div class="text-weight-medium q-mb-xs">{{ m.title }}</div>
      <div class="grid">
        <div v-for="w in WEEKDAYS" :key="w" class="weekday">{{ w }}</div>
        <div v-for="i in m.pad" :key="`p${i}`" />
        <button
          v-for="c in m.days"
          :key="c.date"
          type="button"
          class="day"
          :class="{
            picked: selected.includes(c.date),
            focus: c.date === focus,
            today: c.date === today,
            out: !c.inPeriod,
          }"
          :disabled="!c.inPeriod"
          :aria-label="ariaOf(c.date)"
          @click="(e) => emit('pick', c.date, e.shiftKey)"
        >
          <span class="num">{{ c.day }}</span>
          <span class="dots">
            <span
              v-for="(css, i) in dots(c.date)"
              :key="i"
              class="dot"
              :class="{ empty: !css }"
              :style="css ? { background: css } : undefined"
            />
          </span>
          <span v-if="made(c.date)" class="badges">
            <q-icon v-if="made(c.date)?.cut" name="content_cut" size="11px" />
            <q-icon v-if="made(c.date)?.assembled" name="done_all" size="11px" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { dayColor, dayDate, periodLength } from '@/model/data-quilt';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup } from '@/render/draw';
import { useLibraryStore } from '@/stores/library';
import { todayKey } from '@/stores/data-quilts';

const props = defineProps<{
  doc: RrqDoc;
  quilt: Quilt;
  selected: readonly string[];
  focus: string | null;
}>();
const emit = defineEmits<{ pick: [date: string, extend: boolean] }>();

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const library = useLibraryStore();
const root = ref<HTMLElement>();
const today = todayKey();
const plan = computed(() => props.quilt.data!);

/** The period's months, each with every day of the month (days outside the period dimmed). */
const months = computed(() => {
  const start = plan.value.start;
  const first = start;
  const last = dayDate(start, periodLength(start));
  const out: {
    key: string;
    title: string;
    pad: number;
    days: { date: string; day: number; inPeriod: boolean }[];
  }[] = [];
  let y = Number(start.slice(0, 4));
  let m = Number(start.slice(5, 7)) - 1;
  for (;;) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    if (`${key}-01` > last) break;
    const len = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const days = Array.from({ length: len }, (_, i) => {
      const date = `${key}-${String(i + 1).padStart(2, '0')}`;
      return { date, day: i + 1, inPeriod: date >= first && date <= last };
    });
    out.push({
      key,
      title: new Date(Date.UTC(y, m, 1)).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      pad: new Date(Date.UTC(y, m, 1)).getUTCDay(),
      days,
    });
    m++;
    if (m === 12) [y, m] = [y + 1, 0];
  }
  return out;
});

const css = computed(() => colorLookup(props.doc, library.items.colors));
/** One dot per value: its range color when entered, else empty. */
const dots = (date: string) =>
  plan.value.slots.map((_, i) => {
    const f = dayColor(props.quilt, i, date);
    const c = f && css.value(f);
    return typeof c === 'string' ? c : null;
  });
const made = (date: string) => plan.value.made?.[date];
function ariaOf(date: string) {
  const n = dots(date).filter(Boolean).length;
  const m = made(date);
  return [
    date,
    n ? `${n} of ${plan.value.slots.length} entered` : 'no entry',
    m?.cut ? 'cut' : '',
    m?.assembled ? 'assembled' : '',
  ]
    .filter(Boolean)
    .join(', ');
}

/** Bring a day's month into view. */
function reveal(date: string, smooth = true) {
  const el = root.value?.querySelector(`[data-month="${date.slice(0, 7)}"]`);
  el?.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
}
onMounted(() => nextTick(() => props.focus && reveal(props.focus, false)));
watch(
  () => props.focus,
  (d) => d && reveal(d),
);
defineExpose({ reveal });
</script>

<style scoped>
.data-calendar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
  gap: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.weekday {
  text-align: center;
  font-size: 0.7rem;
  opacity: 0.6;
}
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-height: 40px;
  padding: 2px 0;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.day:hover {
  background: rgba(128, 128, 128, 0.12);
}
.day.out {
  opacity: 0.25;
  cursor: default;
}
.day.today .num {
  font-weight: 700;
  text-decoration: underline;
}
.day.picked {
  background: rgba(25, 118, 210, 0.16);
}
.day.focus {
  border-color: var(--q-primary);
}
.num {
  font-size: 0.8rem;
  line-height: 1;
}
.dots {
  display: flex;
  gap: 2px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.35);
}
.dot.empty {
  background: transparent;
  border-color: rgba(128, 128, 128, 0.5);
}
.badges {
  display: flex;
  gap: 1px;
  line-height: 1;
}
</style>
