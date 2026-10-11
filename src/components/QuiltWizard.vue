<template>
  <q-dialog v-model="open">
    <q-card style="width: 420px; max-width: 95vw">
      <q-stepper v-model="step" flat animated header-nav>
        <q-step :name="1" title="Blocks" icon="grid_on">
          <div class="row q-col-gutter-sm">
            <q-input
              v-model.number="cols"
              class="col-6"
              dense
              outlined
              type="number"
              min="1"
              max="100"
              label="Columns"
            />
            <q-input
              v-model.number="rows"
              class="col-6"
              dense
              outlined
              type="number"
              min="1"
              max="100"
              label="Rows"
            />
            <LengthInput
              v-model="blockSize"
              class="col-12"
              label="Finished block size"
              :units="units"
              :min="0.5"
            />
          </div>
        </q-step>
        <q-step :name="2" title="Sashing" icon="view_comfy">
          <LengthInput v-model="sash" label="Sashing width (0 for none)" :units="units" />
          <q-toggle
            v-model="sashBorder"
            class="q-mt-sm"
            label="Sashing around the outside"
            :disable="!sash"
          />
        </q-step>
        <q-step :name="3" title="Borders" icon="crop_square">
          <q-input
            v-model.number="borderCount"
            dense
            outlined
            type="number"
            min="0"
            max="5"
            label="Number of borders"
          />
          <LengthInput
            v-if="borderCount > 0"
            v-model="borderWidth"
            class="q-mt-sm"
            label="Width of each"
            :units="units"
            :min="0.25"
          />
        </q-step>
      </q-stepper>
      <q-card-actions align="right">
        <div class="col text-caption q-pl-sm">{{ summary }}</div>
        <q-btn flat no-caps label="Cancel" @click="open = false" />
        <q-btn v-if="step < 3" flat no-caps label="Next" @click="step++" />
        <q-btn unelevated no-caps color="primary" label="Create quilt" @click="create" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import type { Border, HorizontalLayout } from '@/model/schema/quilt';

const props = defineProps<{ units: 'in' | 'cm' }>();
const emit = defineEmits<{ create: [layout: HorizontalLayout, borders: Border[]] }>();

const open = ref(false);
const step = ref(1);
const cols = ref(5);
const rows = ref(5);
const blockSize = ref(10);
const sash = ref(0);
const sashBorder = ref(false);
const borderCount = ref(1);
const borderWidth = ref(2);

const clampCount = (n: number) => Math.min(100, Math.max(1, Math.round(n || 1)));
const layout = computed<HorizontalLayout>(() => ({
  style: 'horizontal',
  cols: clampCount(cols.value),
  rows: clampCount(rows.value),
  block: [blockSize.value, blockSize.value],
  sash: [sash.value, sash.value],
  sashBorder: sash.value > 0 && sashBorder.value,
}));
const borders = computed<Border[]>(() =>
  Array.from({ length: Math.max(0, Math.min(5, Math.round(borderCount.value || 0))) }, () => ({
    style: 'long-horizontal',
    sides: [borderWidth.value, borderWidth.value, borderWidth.value, borderWidth.value],
  })),
);
const summary = computed(() => {
  const l = layout.value;
  const w = l.cols * l.block[0] + (l.cols - 1 + (l.sashBorder ? 2 : 0)) * l.sash[0];
  const h = l.rows * l.block[1] + (l.rows - 1 + (l.sashBorder ? 2 : 0)) * l.sash[1];
  const b = borders.value.length * borderWidth.value * 2;
  return `Finished ${+(w + b).toFixed(2)} × ${+(h + b).toFixed(2)} ${props.units}`;
});

function create() {
  open.value = false;
  emit('create', layout.value, borders.value);
}

/** Open with the defaults for the project's units (FR-001). */
function show() {
  const cm = props.units === 'cm';
  step.value = 1;
  cols.value = rows.value = 5;
  blockSize.value = cm ? 25 : 10;
  sash.value = 0;
  sashBorder.value = false;
  borderCount.value = 1;
  borderWidth.value = cm ? 5 : 2;
  open.value = true;
}
defineExpose({ show });
</script>
