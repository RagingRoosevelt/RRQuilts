<template>
  <div class="column" style="gap: 12px">
    <LengthInput
      :model-value="layout.length"
      label="Strip length (all strips)"
      :units="units"
      :min="0.25"
      :readonly="readonly"
      @update:model-value="(v) => emit('change', { ...layout, length: v }, 'length')"
    />
    <div class="text-caption">
      Strips, {{ layout.style === 'vertical-strip' ? 'left to right' : 'top to bottom' }}
    </div>
    <div class="list">
      <button
        v-for="(s, i) in layout.strips"
        :key="s.id"
        type="button"
        class="row-btn"
        :class="{ on: s.id === current?.id }"
        @click="editor.selectedStrip = s.id"
      >
        <span>{{ i + 1 }}. {{ labelOf(s.style) }}</span>
        <span>{{ fmtLen(s.width, lu) }}</span>
      </button>
    </div>
    <div class="row items-center" style="gap: 4px">
      <q-btn flat dense icon="chevron_left" aria-label="Previous strip" @click="step(-1)" />
      <q-btn flat dense icon="chevron_right" aria-label="Next strip" @click="step(1)" />
      <q-space />
      <q-btn dense no-caps flat label="Add" :disable="readonly" @click="add(false)" />
      <q-btn dense no-caps flat label="Insert" :disable="readonly" @click="add(true)" />
      <q-btn
        dense
        no-caps
        flat
        label="Delete"
        :disable="readonly || layout.strips.length < 2"
        @click="del"
      />
    </div>
    <q-toggle v-model="clone" dense label="Clone the selected strip" :disable="readonly" />

    <template v-if="current">
      <div class="text-subtitle2">
        Strip {{ layout.strips.findIndex((s) => s.id === current!.id) + 1 }}
      </div>
      <q-select
        :model-value="current.style"
        dense
        outlined
        label="Style"
        :options="STRIP_STYLES"
        emit-value
        map-options
        :readonly="readonly"
        @update:model-value="(v) => patch({ style: v }, '')"
      />
      <LengthInput
        :model-value="current.width"
        label="Strip width"
        :units="units"
        :min="0.25"
        :readonly="readonly"
        @update:model-value="(v) => patch({ width: v }, 'width')"
      />
      <q-input
        v-if="current.style !== 'plain'"
        :model-value="current.along"
        dense
        outlined
        type="number"
        label="Units along"
        min="1"
        max="100"
        :readonly="readonly"
        @update:model-value="(v) => count('along', v)"
      />
      <q-input
        v-if="current.style === 'checker-board'"
        :model-value="current.across"
        dense
        outlined
        type="number"
        label="Units across"
        min="1"
        max="100"
        :readonly="readonly"
        @update:model-value="(v) => count('across', v)"
      />
      <div v-if="current.style !== 'plain'" class="text-caption text-grey-7">
        Unit size: {{ fmtLen(layout.length / current.along, lu) }} ×
        {{ fmtLen(current.width, lu) }}
      </div>
      <template v-if="fixes">
        <q-btn
          v-if="fixes.along"
          dense
          no-caps
          outline
          :label="`Make square: ${fixes.along} along`"
          :disable="readonly"
          @click="patch({ along: fixes.along! }, '')"
        />
        <q-btn
          v-if="fixes.length"
          dense
          no-caps
          outline
          :label="`Make square: length ${fmtLen(fixes.length, lu)}`"
          :disable="readonly"
          @click="emit('change', { ...layout, length: fixes.length! }, '')"
        />
      </template>
    </template>
    <div v-if="hint" class="text-caption text-primary">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import {
  STRIP_STYLES,
  addStrip,
  deleteStrip,
  insertStrip,
  setStrip,
  squareFixes,
} from '@/model/layout/strips';
import { fmtLen } from '@/model/print/format';
import type { Layout, Strip, StripLayout } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';

const props = defineProps<{
  layout: StripLayout;
  units: string;
  readonly: boolean;
  hint?: string | undefined;
}>();
const emit = defineEmits<{ change: [layout: Layout, coalesce: string] }>();
const editor = useEditorStore();
const lu = computed(() => (props.units === 'cm' ? 'cm' : 'in'));
const clone = ref(false);
const labelOf = (v: string) => STRIP_STYLES.find((s) => s.value === v)?.label ?? v;

const current = computed(
  () => props.layout.strips.find((s) => s.id === editor.selectedStrip) ?? props.layout.strips[0],
);
const fixes = computed(() => (current.value ? squareFixes(props.layout, current.value) : null));

function step(d: number) {
  const n = props.layout.strips.length;
  const i = props.layout.strips.findIndex((s) => s.id === current.value?.id);
  editor.selectedStrip = props.layout.strips[(i + d + n) % n]!.id;
}
function add(before: boolean) {
  const like = clone.value ? current.value : undefined;
  const u = lu.value;
  const r =
    before && current.value
      ? insertStrip(props.layout, current.value.id, u, like)
      : addStrip(props.layout, u, like);
  editor.selectedStrip = r.id;
  emit('change', r.layout, '');
}
function del() {
  if (!current.value) return;
  const i = props.layout.strips.findIndex((s) => s.id === current.value!.id);
  const next = deleteStrip(props.layout, current.value.id);
  editor.selectedStrip = next.strips[Math.min(i, next.strips.length - 1)]!.id;
  emit('change', next, '');
}
function patch(p: Partial<Omit<Strip, 'id'>>, k: string) {
  if (current.value) emit('change', setStrip(props.layout, current.value.id, p), k);
}
function count(key: 'along' | 'across', v: string | number | null) {
  const n = Math.round(Number(v));
  if (n >= 1 && n <= 100) patch({ [key]: n }, key);
}
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;
  overflow-y: auto;
}
.row-btn {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.row-btn:hover {
  background: rgba(128, 128, 128, 0.12);
}
.row-btn.on {
  border-color: var(--q-primary);
  background: rgba(25, 118, 210, 0.12);
}
</style>
