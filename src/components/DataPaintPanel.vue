<template>
  <!-- Data places (spec 025): number pieces where a data quilt puts each day's value. -->
  <div class="column q-pb-md" style="gap: 8px">
    <q-toggle
      v-model="editor.data.on"
      dense
      label="Number pieces"
      :disable="readonly"
      aria-label="Number pieces"
    />
    <SlidePicker
      v-model="editor.data.set"
      :options="[
        { value: '31', label: '1 to 31' },
        { value: '7', label: '1 to 7' },
      ]"
      label="Numbers"
    />
    <div class="row items-center no-wrap" style="gap: 8px">
      <span class="text-caption">Value</span>
      <q-btn-toggle
        :model-value="editor.data.slot"
        :options="SLOT_NAMES.map((n, i) => ({ label: n, value: i }))"
        dense
        no-caps
        unelevated
        toggle-color="primary"
        aria-label="Value slot"
        @update:model-value="(v: number) => (editor.data.slot = v)"
      />
    </div>
    <div class="text-caption" aria-live="polite">
      <template v-if="next !== undefined">Next: {{ label }}</template>
      <template v-else>Every number of this set is placed.</template>
    </div>
    <SlidePicker
      v-model="editor.data.order"
      :options="[
        { value: 'rows', label: 'Rows' },
        { value: 'columns', label: 'Columns' },
        { value: 'snake', label: 'Snake' },
      ]"
      label="Spray order"
    />
    <q-toggle v-model="editor.data.numbers" dense label="Show numbers" />
    <q-toggle
      v-model="editor.data.line"
      dense
      label="Show order line"
      :disable="!editor.data.numbers"
    />
    <div class="text-caption text-grey-7">
      With Number pieces on, Paint gives a piece the next number (tap a numbered piece to take its
      number back) and Spray numbers every piece of the tapped piece's color, in the order picked.
      Value B, C and D are for days that record more than one value.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SlidePicker from '@/components/SlidePicker.vue';
import { nextNumber, paintLabel, SLOT_NAMES } from '@/model/data-paint';
import type { Fill } from '@/model/schema/coloring';
import { useEditorStore } from '@/stores/editor';

const props = defineProps<{ fills: Readonly<Record<string, Fill>>; readonly?: boolean }>();
const editor = useEditorStore();
const next = computed(() => nextNumber(props.fills, editor.data.set, editor.data.slot));
const label = computed(() =>
  next.value === undefined
    ? ''
    : paintLabel({ n: next.value, ...(editor.data.slot ? { slot: editor.data.slot } : {}) }),
);
</script>
