<template>
  <!-- A data quilt's real entries (spec 025 User Story 5): every day of the period with a value per
       slot; missing days marked; All or only the missing days up to today. -->
  <q-dialog v-model="open" @show="scrollToFocus">
    <q-card style="width: 620px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none" style="gap: 8px">
        <div class="text-h6 col">Entries</div>
        <SlidePicker
          v-model="filter"
          :options="[
            { value: 'all', label: 'All days' },
            { value: 'missing', label: `Missing (${missing.length})` },
          ]"
          label="Show"
          style="width: 240px"
        />
        <DialogClose />
      </q-card-section>
      <q-card-section class="text-caption text-grey-7 q-py-xs">
        {{ entered }} of {{ dates.length }} days entered. Missing counts days up to today.
      </q-card-section>
      <q-virtual-scroll
        ref="scroller"
        :items="shown"
        style="max-height: 60vh"
        :virtual-scroll-item-size="48"
      >
        <template #default="{ item: d }">
          <div
            :key="d"
            class="row items-center no-wrap q-px-md entry"
            :class="{ focus: d === focus }"
            style="gap: 8px; height: 48px"
          >
            <div class="date">
              {{ label(d) }}
              <q-icon v-if="isMissing(d)" name="error_outline" color="warning" size="14px">
                <q-tooltip>No entry yet</q-tooltip>
              </q-icon>
            </div>
            <template v-for="(s, i) in slots" :key="i">
              <q-select
                v-if="s.kind === 'category'"
                :model-value="value(d, i)"
                :options="s.categories.map((c) => ({ value: c.id, label: c.name }))"
                emit-value
                map-options
                clearable
                dense
                outlined
                class="col"
                :label="s.label"
                :readonly="readonly"
                @update:model-value="(v: string | null) => emit('set', d, i, v ?? null)"
              />
              <q-input
                v-else
                :model-value="value(d, i) ?? ''"
                type="number"
                dense
                outlined
                class="col"
                :label="s.unit ? `${s.label} (${s.unit})` : s.label"
                :readonly="readonly"
                @update:model-value="
                  (v) => emit('set', d, i, v === '' || v === null ? null : Number(v))
                "
              />
            </template>
          </div>
        </template>
      </q-virtual-scroll>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QVirtualScroll } from 'quasar';
import { computed, nextTick, ref } from 'vue';
import DialogClose from '@/components/DialogClose.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { dayDate, periodLength } from '@/model/data-quilt';
import type { DataPlan } from '@/model/schema/data-quilt';

const props = defineProps<{ plan: DataPlan; readonly?: boolean }>();
const emit = defineEmits<{ set: [date: string, slot: number, value: number | string | null] }>();

const open = ref(false);
const filter = ref<'all' | 'missing'>('all');
const focus = ref<string | null>(null);
const scroller = ref<QVirtualScroll>();

const slots = computed(() => props.plan.slots);
const dates = computed(() =>
  Array.from({ length: periodLength(props.plan.start) }, (_, i) =>
    dayDate(props.plan.start, i + 1),
  ),
);
const today = () => new Date().toISOString().slice(0, 10);
const value = (d: string, i: number) => props.plan.entries[d]?.[i] ?? null;
const isMissing = (d: string) =>
  d <= today() && props.plan.slots.some((_, i) => value(d, i) === null);
const missing = computed(() => dates.value.filter(isMissing));
const entered = computed(
  () => dates.value.filter((d) => props.plan.slots.some((_, i) => value(d, i) !== null)).length,
);
const shown = computed(() => (filter.value === 'missing' ? missing.value : dates.value));
const label = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** Open on a date (its row scrolled to and marked), or on the missing days. */
function show(at?: string, onlyMissing = false) {
  filter.value = onlyMissing ? 'missing' : 'all';
  focus.value = at ?? null;
  if (open.value) void nextTick(scrollToFocus);
  open.value = true;
}
/** Once open (or when asked again while open): the focused row in the middle. */
function scrollToFocus() {
  const i = focus.value ? shown.value.indexOf(focus.value) : -1;
  if (i >= 0) scroller.value?.scrollTo(i, 'center-force');
}
defineExpose({ show });
</script>

<style scoped>
.date {
  width: 110px;
  flex: none;
}
.entry.focus {
  background: rgba(25, 118, 210, 0.12);
}
.entry :deep(.col) {
  min-width: 0;
}
</style>
