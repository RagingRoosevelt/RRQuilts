<template>
  <!-- A CSV or pasted columns into a data quilt (spec 025): as sample data, or as real entries. -->
  <q-dialog v-model="open">
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 col">{{ asSample ? 'Sample data from a CSV' : 'Import entries' }}</div>
        <DialogClose />
      </q-card-section>
      <q-card-section class="column" style="gap: 10px">
        <div class="row items-center" style="gap: 8px">
          <q-btn outline no-caps icon="upload_file" label="Open a CSV file…" @click="pickFile" />
          <span class="text-caption text-grey-7">or paste rows below (date, then values).</span>
        </div>
        <q-input
          v-model="text"
          type="textarea"
          outlined
          dense
          autogrow
          :input-style="{ maxHeight: '160px', fontFamily: 'monospace', fontSize: '12px' }"
          label="Rows"
          aria-label="Rows to import"
        />
        <template v-if="rows.length">
          <q-select
            v-model="dateCol"
            :options="columnOptions"
            emit-value
            map-options
            dense
            outlined
            label="Date column"
          />
          <q-select
            v-for="(s, i) in slots"
            :key="i"
            :model-value="cols[i] ?? null"
            :options="[{ value: null, label: 'None' }, ...columnOptions]"
            emit-value
            map-options
            dense
            outlined
            :label="`${SLOT_NAMES[i]}: ${s.label}`"
            @update:model-value="(v: number | null) => (cols[i] = v)"
          />
          <div class="text-caption" aria-live="polite">
            {{ result.read }} day{{ result.read === 1 ? '' : 's' }} read<template
              v-if="result.skipped"
              >; {{ result.skipped }} row{{ result.skipped === 1 ? '' : 's' }} without a date
              skipped</template
            >.
            <template v-if="!asSample">Days already entered take the new values.</template>
          </div>
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="open = false" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          :label="asSample ? 'Use as sample data' : 'Import'"
          :disable="!result.read"
          @click="done"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import DialogClose from '@/components/DialogClose.vue';
import { csvValues, guessDateColumn, hasHeader, parseCsv } from '@/model/data-csv';
import { SLOT_NAMES } from '@/model/data-paint';
import type { DayValues, ValueSlot } from '@/model/schema/data-quilt';

const props = defineProps<{ slots: readonly ValueSlot[] }>();
const emit = defineEmits<{
  sample: [name: string, values: DayValues];
  entries: [values: DayValues];
}>();

const $q = useQuasar();
const open = ref(false);
const asSample = ref(true);
const text = ref('');
const name = ref('Pasted');
const dateCol = ref(0);
const cols = ref<(number | null)[]>([]);

const rows = computed(() => parseCsv(text.value));
const header = computed(() => (hasHeader(rows.value, dateCol.value) ? rows.value[0] : undefined));
const columnOptions = computed(() => {
  const n = Math.max(0, ...rows.value.slice(0, 20).map((r) => r.length));
  return Array.from({ length: n }, (_, c) => ({
    value: c,
    label: header.value?.[c] ? `${c + 1}: ${header.value[c]}` : `Column ${c + 1}`,
  }));
});
const result = computed(() => csvValues(rows.value, dateCol.value, cols.value));

// New rows: guess the date column, then the slots by their labels (else the next columns).
watch(rows, (r) => {
  dateCol.value = guessDateColumn(r);
  const h = hasHeader(r, dateCol.value) ? r[0]! : [];
  const free = columnOptions.value.map((o) => o.value).filter((c) => c !== dateCol.value);
  cols.value = props.slots.map((s, i) => {
    const byName = h.findIndex((x) => x.toLowerCase() === s.label.toLowerCase());
    return byName >= 0 ? byName : (free[i] ?? null);
  });
});

function show(sample: boolean) {
  asSample.value = sample;
  text.value = '';
  name.value = 'Pasted';
  open.value = true;
}
function pickFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.tsv,.txt,text/csv,text/plain';
  input.onchange = async () => {
    const f = input.files?.[0];
    if (!f) return;
    // A year of daily rows is a few kilobytes.
    if (f.size > 2_000_000)
      return void $q.notify({
        type: 'negative',
        message: 'That file is too big for a year of data.',
      });
    text.value = await f.text();
    name.value = f.name.slice(0, 200);
  };
  input.click();
}
function done() {
  if (asSample.value) emit('sample', name.value, result.value.values);
  else emit('entries', result.value.values);
  open.value = false;
}
defineExpose({ show });
</script>
