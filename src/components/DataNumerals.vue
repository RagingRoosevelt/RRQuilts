<template>
  <!-- A data block's numeral palette (spec 025): day numerals 1 to N to drag onto patches, or pick
       one and tap patches; a numeral may go on several patches. -->
  <!-- A grid, not a flex column: in a flex column the numerals' auto-fill grid is sized as if it
       were one numeral wide, leaving a tall empty box under the buttons. -->
  <div class="panel q-pb-md">
    <div class="row items-center no-wrap" style="gap: 8px">
      <span class="text-caption">Value</span>
      <q-btn-toggle
        :model-value="editor.data.slot"
        :options="SLOT_NAMES.map((n, i) => ({ label: n, value: i }))"
        dense
        no-caps
        unelevated
        toggle-color="primary"
        aria-label="Value"
        @update:model-value="(v: number) => (editor.data.slot = v)"
      />
    </div>
    <div class="numerals" role="listbox" aria-label="Day numerals">
      <button
        v-for="n in count"
        :key="n"
        type="button"
        role="option"
        class="numeral"
        :class="{ active: editor.data.on && editor.data.numeral === n, unused: !counts.get(n) }"
        :aria-selected="editor.data.on && editor.data.numeral === n"
        :draggable="!readonly"
        :disabled="readonly"
        @click="pick(n)"
        @dragstart="(e: DragEvent) => drag(e, n)"
      >
        {{ label(n) }}
        <span v-if="(counts.get(n) ?? 0) > 1" class="times">×{{ counts.get(n) }}</span>
      </button>
    </div>
    <div class="text-caption text-grey-7">
      Drag a numeral onto a patch, or pick one and tap patches. Tap a patch with that numeral to
      take it off. A numeral can go on several patches. Faded numerals aren't on any patch yet.
    </div>
    <q-btn
      v-if="!readonly"
      dense
      flat
      no-caps
      size="sm"
      icon="clear"
      label="Clear all numerals"
      class="start"
      :disable="!anyNumeral"
      @click="emit('clear')"
    />
    <q-toggle v-model="editor.data.advance" dense label="Next numeral after each tap" />
    <q-toggle v-model="editor.data.numbers" dense label="Show numerals" />
    <q-toggle
      v-model="editor.data.line"
      dense
      label="Show order line"
      :disable="!editor.data.numbers"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { numeralCounts, paintLabel, SLOT_NAMES } from '@/model/data-paint';
import type { Fill } from '@/model/schema/coloring';
import { useEditorStore } from '@/stores/editor';

const props = defineProps<{
  fills: Readonly<Record<string, Fill>>;
  /** The shown drawing's patches (a variant's, when one is picked). */
  patches: readonly string[];
  /** Numerals: the kind's days, or the variant's. */
  count: number;
  readonly?: boolean;
}>();
const emit = defineEmits<{ clear: [] }>();
const editor = useEditorStore();
/** Any numeral of any value on the shown drawing. */
const anyNumeral = computed(() =>
  props.patches.some((id) => {
    const f = props.fills[id];
    return !!f && 'data' in f;
  }),
);
const counts = computed(() => numeralCounts(props.fills, props.patches, editor.data.slot));
const label = (n: number) =>
  paintLabel({ n, ...(editor.data.slot ? { slot: editor.data.slot } : {}) });

function pick(n: number) {
  editor.data.numeral = n;
  editor.data.on = true;
  editor.blockTool = 'paint';
}
function drag(e: DragEvent, n: number) {
  e.dataTransfer?.setData('application/x-rrq-numeral', String(n));
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
}
</script>

<style scoped>
.panel {
  display: grid;
  gap: 8px;
  align-content: start;
}
.start {
  justify-self: start;
}
.numerals {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
  grid-auto-rows: 32px;
  gap: 4px;
}
.numeral {
  position: relative;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.45);
  background: none;
  color: inherit;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: grab;
}
.numeral.unused {
  opacity: 0.45;
  border-style: dashed;
}
.numeral.active {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px var(--q-primary);
  opacity: 1;
}
.times {
  position: absolute;
  right: 2px;
  top: 0;
  font-size: 9px;
  font-weight: 400;
  opacity: 0.8;
}
</style>
