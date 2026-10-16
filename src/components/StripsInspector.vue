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
    <!-- A line with a + in every gap inserts a blank strip there (on hover; always on touch).
         Drag a strip by its grip; the line where it will land lights up. -->
    <div ref="listEl" class="list">
      <template v-for="(s, i) in layout.strips" :key="s.id">
        <div v-if="!readonly" class="gap" :class="{ drop: drag?.to === i }">
          <button
            type="button"
            class="add"
            :aria-label="`Insert a strip before strip ${i + 1}`"
            @click="insertAt(i)"
          >
            <q-icon name="add" size="14px" />
          </button>
          <hr />
        </div>
        <div class="strip-row" :class="{ on: s.id === current?.id, dragging: drag?.id === s.id }">
          <button
            v-if="!readonly && layout.strips.length > 1"
            type="button"
            class="grip"
            :aria-label="`Move strip ${i + 1} (drag, or arrow keys)`"
            @pointerdown="startDrag($event, s.id, i)"
            @pointermove="moveDrag"
            @pointerup="endDrag"
            @pointercancel="drag = null"
            @keydown.up.prevent="moveBy(s.id, i, -1)"
            @keydown.down.prevent="moveBy(s.id, i, 1)"
          >
            <q-icon name="drag_indicator" size="18px" />
          </button>
          <button type="button" class="row-btn" @click="editor.selectedStrip = s.id">
            <span>{{ i + 1 }}. {{ labelOf(s.style) }}</span>
            <span>{{ fmtLen(stripWidth(layout, s), lu) }}</span>
          </button>
          <button
            v-if="!readonly && layout.strips.length > 1"
            type="button"
            class="del"
            :aria-label="`Delete strip ${i + 1}`"
            @click="del(s.id)"
          >
            <q-icon name="close" size="14px" />
          </button>
        </div>
      </template>
      <div v-if="!readonly" class="gap" :class="{ drop: drag?.to === layout.strips.length }">
        <button
          type="button"
          class="add"
          aria-label="Add a strip at the end"
          @click="insertAt(layout.strips.length)"
        >
          <q-icon name="add" size="14px" />
        </button>
        <hr />
      </div>
    </div>

    <template v-if="current">
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
      <template v-if="isBlocks">
        <q-btn-toggle
          :model-value="current.square !== false"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          :disable="readonly"
          :options="[
            { label: 'Block strip', value: true },
            { label: 'Pieced strip', value: false },
          ]"
          @update:model-value="(v) => patch({ square: v, width: stripWidth(layout, current!) }, '')"
        />
        <div class="text-caption text-grey-7">
          {{
            current.square !== false
              ? 'Holds blocks. The width follows the length and the units along, so blocks stay square.'
              : 'Rectangles you color with fabric. Set any width.'
          }}
        </div>
      </template>
      <LengthInput
        :model-value="stripWidth(layout, current)"
        label="Strip width"
        :units="units"
        :min="0.25"
        :readonly="readonly || squareBlocks(current)"
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
        {{ fmtLen(stripWidth(layout, current), lu) }}
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
  moveStrip,
  squareBlocks,
  stripWidth,
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
const labelOf = (v: string) => STRIP_STYLES.find((s) => s.value === v)?.label ?? v;

const current = computed(
  () => props.layout.strips.find((s) => s.id === editor.selectedStrip) ?? props.layout.strips[0],
);
const isBlocks = computed(
  () => current.value?.style === 'blocks' || current.value?.style === 'half-drop-blocks',
);
const fixes = computed(() => (current.value ? squareFixes(props.layout, current.value) : null));

// Dragging a strip: `to` is the gap it would land in (0 = before the first).
const listEl = ref<HTMLElement>();
const drag = ref<{ id: string; to: number } | null>(null);
function startDrag(e: PointerEvent, id: string, i: number) {
  (e.currentTarget as Element).setPointerCapture(e.pointerId);
  drag.value = { id, to: i };
}
function moveDrag(e: PointerEvent) {
  if (!drag.value || !listEl.value) return;
  const rows = [...listEl.value.querySelectorAll('.strip-row')];
  drag.value.to = rows.filter((r) => {
    const b = r.getBoundingClientRect();
    return b.top + b.height / 2 < e.clientY;
  }).length;
}
function endDrag() {
  const d = drag.value;
  drag.value = null;
  if (d) move(d.id, d.to);
}
function move(id: string, to: number) {
  const next = moveStrip(props.layout, id, to);
  if (next !== props.layout) emit('change', next, '');
}
/** Keyboard: one place up or down. */
const moveBy = (id: string, i: number, d: -1 | 1) => move(id, d < 0 ? i - 1 : i + 2);
/** A blank (plain) strip before strip `i`, or at the end. */
function insertAt(i: number) {
  const u = lu.value;
  const before = props.layout.strips[i];
  const r = before ? insertStrip(props.layout, before.id, u) : addStrip(props.layout, u);
  editor.selectedStrip = r.id;
  emit('change', r.layout, '');
}
function del(id: string) {
  const i = props.layout.strips.findIndex((s) => s.id === id);
  const next = deleteStrip(props.layout, id);
  if (editor.selectedStrip === id || !editor.selectedStrip)
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
}
.strip-row {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: 4px;
}
.strip-row.on {
  border-color: var(--q-primary);
  background: rgba(25, 118, 210, 0.12);
}
.strip-row .row-btn {
  flex: 1;
}
.strip-row.dragging {
  opacity: 0.5;
}
.grip {
  display: grid;
  place-items: center;
  padding: 0 0 0 2px;
  border: none;
  background: none;
  color: inherit;
  opacity: 0.6;
  cursor: grab;
  touch-action: none;
}
.grip:active {
  cursor: grabbing;
}
/* Chip-like delete at the end of each row. */
.del {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-right: 4px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.2);
  color: inherit;
  cursor: pointer;
}
.del:hover {
  background: rgba(198, 40, 40, 0.25);
}
/* Insert gaps: a rule with a + badge at its end. */
.gap {
  position: relative;
  height: 12px;
  display: flex;
  align-items: center;
}
.gap hr {
  flex: 1;
  margin: 0 0 0 4px;
  border: none;
  border-top: 2px solid var(--q-primary);
}
.add {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--q-primary);
  color: #fff;
  cursor: pointer;
}
.gap hr,
.gap .add {
  opacity: 0;
  transition: opacity 0.1s;
}
.gap.drop hr,
.gap.drop .add,
.gap:hover hr,
.gap:hover .add,
.gap:focus-within hr,
.gap:focus-within .add {
  opacity: 1;
}
@media (hover: none) {
  .gap hr,
  .gap .add {
    opacity: 1;
  }
  .gap hr {
    opacity: 0.35;
  }
}
.row-btn {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.row-btn:hover {
  background: rgba(128, 128, 128, 0.12);
}
</style>
