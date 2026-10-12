<template>
  <div class="column" style="gap: 14px">
    <!-- Block -->
    <div class="column" style="gap: 8px">
      <q-input
        :model-value="block.notecard.name"
        dense
        outlined
        label="Block name"
        :readonly="readonly"
        @update:model-value="(v) => emit('rename', String(v ?? ''))"
        @blur="(e: Event) => emit('rename', (e.target as HTMLInputElement).value.trim())"
      />
      <div class="row no-wrap" style="gap: 8px">
        <LengthInput
          class="col"
          :model-value="block.size[0]"
          label="Width"
          :units="units"
          :min="0.5"
          :readonly="readonly"
          @update:model-value="(v) => emit('resize', [v, block.size[1]])"
        />
        <LengthInput
          class="col"
          :model-value="block.size[1]"
          label="Height"
          :units="units"
          :min="0.5"
          :readonly="readonly"
          @update:model-value="(v) => emit('resize', [block.size[0], v])"
        />
      </div>
      <div v-if="credit" class="text-caption text-grey-7">{{ credit }}</div>
      <q-banner v-if="unconnected" dense rounded class="bg-red-1 text-red-9">
        {{ unconnected }} seam{{ unconnected > 1 ? 's aren’t' : ' isn’t' }} connected at both ends
        (shown in red).
      </q-banner>
    </div>

    <!-- Tool options -->
    <div v-if="tool === 'arc'" class="row items-center" style="gap: 8px">
      <q-btn
        dense
        outline
        no-caps
        icon="swap_vert"
        label="Flip arc direction"
        @click="editor.arcSign = editor.arcSign === 1 ? -1 : 1"
      />
      <span class="text-caption text-grey-7">or press Space while drawing</span>
    </div>
    <div v-if="tool === 'grid'" class="row no-wrap" style="gap: 8px">
      <q-input
        v-model.number="editor.grid[0]"
        class="col"
        dense
        outlined
        type="number"
        min="1"
        max="24"
        label="Columns"
      />
      <q-input
        v-model.number="editor.grid[1]"
        class="col"
        dense
        outlined
        type="number"
        min="1"
        max="24"
        label="Rows"
      />
    </div>

    <!-- Selection -->
    <div v-if="tool === 'select' && selection.size && !readonly" class="column" style="gap: 8px">
      <q-expansion-item
        :model-value="open('Selection')"
        @update:model-value="(v) => setOpen('Selection', v)"
        dense
        label="Selection"
        :caption="`${selection.size} seam${selection.size > 1 ? 's' : ''} selected`"
        class="op-section"
        header-class="text-subtitle2"
      >
        <div class="column q-pa-sm" style="gap: 8px">
          <div class="row" style="gap: 6px">
            <q-btn
              dense
              outline
              no-caps
              icon="delete"
              label="Delete"
              @click="emit('op', { kind: 'delete' })"
            />
            <q-btn
              dense
              outline
              no-caps
              icon="content_copy"
              label="Clone"
              @click="emit('op', { kind: 'clone' })"
            />
            <q-btn
              dense
              outline
              no-caps
              icon="timeline"
              label="To guides"
              @click="emit('op', { kind: 'guides' })"
            />
          </div>
          <div class="text-caption text-grey-7">Rotate, flip, and scale around</div>
          <q-btn-toggle
            v-model="about"
            dense
            no-caps
            spread
            :options="[
              { label: 'Block center', value: 'block' },
              { label: 'Selection center', value: 'selection' },
            ]"
          />
        </div>
      </q-expansion-item>
      <q-expansion-item
        :model-value="open('Rotate')"
        @update:model-value="(v) => setOpen('Rotate', v)"
        dense
        label="Rotate"
        class="op-section"
        header-class="text-subtitle2"
      >
        <div class="column q-pa-sm" style="gap: 8px">
          <div class="row items-center" style="gap: 6px">
            <q-btn
              v-for="a in [90, 180, 270]"
              :key="a"
              dense
              outline
              no-caps
              :label="`${a}°`"
              icon="rotate_right"
              @click="emit('op', { kind: 'rotate', deg: a, about })"
            />
            <q-input
              v-model.number="angle"
              dense
              outlined
              type="number"
              label="Angle"
              suffix="°"
              style="width: 170px"
              @keyup.enter="emit('op', { kind: 'rotate', deg: angle, about })"
            >
              <template #append>
                <q-btn
                  dense
                  outline
                  no-caps
                  class="inline-op"
                  icon="rotate_right"
                  label="Rotate"
                  @click="emit('op', { kind: 'rotate', deg: angle, about })"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-expansion-item>
      <q-expansion-item
        :model-value="open('Flip')"
        @update:model-value="(v) => setOpen('Flip', v)"
        dense
        label="Flip"
        class="op-section"
        header-class="text-subtitle2"
      >
        <div class="column q-pa-sm" style="gap: 8px">
          <div class="row" style="gap: 6px">
            <q-btn
              v-for="f in flips"
              :key="f.axis"
              dense
              outline
              no-caps
              :label="f.label"
              @click="emit('op', { kind: 'flip', axis: f.axis, about })"
            />
          </div>
        </div>
      </q-expansion-item>
      <q-expansion-item
        :model-value="open('Scale')"
        @update:model-value="(v) => setOpen('Scale', v)"
        dense
        label="Scale"
        class="op-section"
        header-class="text-subtitle2"
      >
        <div class="column q-pa-sm" style="gap: 8px">
          <q-input
            v-model.number="pct"
            dense
            outlined
            type="number"
            label="Percent"
            suffix="%"
            style="width: 170px"
            @keyup.enter="emit('op', { kind: 'resize', pct, about })"
          >
            <template #append>
              <q-btn
                dense
                outline
                no-caps
                class="inline-op"
                icon="open_in_full"
                label="Resize"
                @click="emit('op', { kind: 'resize', pct, about })"
              />
            </template>
          </q-input>
        </div>
      </q-expansion-item>
      <q-expansion-item
        :model-value="open('Add nodes')"
        @update:model-value="(v) => setOpen('Add nodes', v)"
        dense
        label="Add nodes"
        class="op-section"
        header-class="text-subtitle2"
      >
        <div class="column q-pa-sm" style="gap: 8px">
          <div class="row items-center" style="gap: 6px">
            <q-btn
              dense
              outline
              no-caps
              label="Midpoint"
              @click="emit('op', { kind: 'nodes', mode: { kind: 'mid' } })"
            />
            <q-btn
              dense
              outline
              no-caps
              label="Thirds"
              @click="emit('op', { kind: 'nodes', mode: { kind: 'thirds' } })"
            />
            <q-input
              v-model.number="parts"
              dense
              outlined
              type="number"
              min="2"
              max="24"
              label="Equal parts"
              style="width: 160px"
              @keyup.enter="emit('op', { kind: 'nodes', mode: { kind: 'parts', n: parts } })"
            >
              <template #append>
                <q-btn
                  dense
                  outline
                  no-caps
                  class="inline-op"
                  label="Split"
                  @click="emit('op', { kind: 'nodes', mode: { kind: 'parts', n: parts } })"
                />
              </template>
            </q-input>
            <q-btn
              dense
              outline
              no-caps
              label="At crossings"
              @click="emit('op', { kind: 'nodes', mode: { kind: 'crossings' } })"
            />
          </div>
        </div>
      </q-expansion-item>
    </div>
    <div v-else-if="tool === 'select'" class="text-caption text-grey-7">
      Tap a seam to select it (Shift adds), drag a box around seams, Ctrl+A selects all.
    </div>
    <div v-if="tool === 'node'" class="text-caption text-grey-7">
      Drag a node to move it — connected seams follow. Double-tap a seam to add a node there.
    </div>

    <!-- Snapping & aids -->
    <q-expansion-item
      :model-value="open('Snapping & graph paper')"
      @update:model-value="(v) => setOpen('Snapping & graph paper', v)"
      dense
      label="Snapping & graph paper"
      class="op-section"
      header-class="text-subtitle2"
    >
      <div class="column q-pa-sm" style="gap: 8px">
        <q-btn-toggle
          :model-value="settings.snap.mode"
          dense
          no-caps
          spread
          :options="[
            { label: 'Step', value: 'step' },
            { label: 'Divisions', value: 'divisions' },
          ]"
          @update:model-value="(m) => setSnap({ mode: m })"
        />
        <LengthInput
          v-if="settings.snap.mode === 'step'"
          :model-value="settings.snap.step"
          label="Snap every"
          :units="units"
          :min="0.0625"
          @update:model-value="(v) => setSnap({ step: v })"
        />
        <div v-else class="row no-wrap" style="gap: 8px">
          <q-input
            :model-value="settings.snap.divisions[0]"
            class="col"
            dense
            outlined
            type="number"
            min="1"
            label="Across"
            @update:model-value="
              (v) => setSnap({ divisions: [clampInt(v), settings.snap.divisions[1]] })
            "
          />
          <q-input
            :model-value="settings.snap.divisions[1]"
            class="col"
            dense
            outlined
            type="number"
            min="1"
            label="Down"
            @update:model-value="
              (v) => setSnap({ divisions: [settings.snap.divisions[0], clampInt(v)] })
            "
          />
        </div>
        <q-toggle
          :model-value="settings.snap.grid"
          dense
          label="Snap to grid points"
          @update:model-value="(v) => setSnap({ grid: v })"
        />
        <q-toggle
          :model-value="settings.snap.nodes"
          dense
          label="Snap to nodes"
          @update:model-value="(v) => setSnap({ nodes: v })"
        />
        <q-toggle
          :model-value="settings.snap.seams"
          dense
          label="Snap to seams"
          @update:model-value="(v) => setSnap({ seams: v })"
        />
        <q-toggle
          :model-value="settings.graph.show"
          dense
          label="Graph paper"
          @update:model-value="(v) => emit('settings', { graph: { ...settings.graph, show: v } })"
        />
        <LengthInput
          v-if="settings.graph.show"
          :model-value="settings.graph.step"
          label="Graph paper spacing"
          :units="units"
          :min="0.125"
          @update:model-value="(v) => emit('settings', { graph: { ...settings.graph, step: v } })"
        />
        <q-btn
          v-if="settings.guides.length"
          dense
          flat
          no-caps
          icon="layers_clear"
          :label="`Clear ${settings.guides.length} guide(s)`"
          @click="emit('settings', { guides: [] })"
        />
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LengthInput from '@/components/LengthInput.vue';
import { attribution, type BlockEditorSettings, type SelectionOp } from '@/editor/block-ops';
import type { SnapSettings } from '@/editor/snap';
import type { SeamBlock } from '@/model/schema/block';
import { useEditorStore, type BlockTool } from '@/stores/editor';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  block: SeamBlock;
  settings: BlockEditorSettings;
  selection: Set<string>;
  tool: BlockTool;
  units: string;
  readonly: boolean;
}>();
const emit = defineEmits<{
  rename: [name: string];
  resize: [size: [number, number]];
  settings: [patch: Partial<BlockEditorSettings>];
  op: [op: SelectionOp];
}>();

const editor = useEditorStore();
const app = useSettingsStore();
// Collapsed sections are remembered app-wide (by label).
const open = (label: string) => !app.settings.collapsedSections.includes(label);
function setOpen(label: string, value: boolean) {
  const rest = app.settings.collapsedSections.filter((l) => l !== label);
  app.settings.collapsedSections = value ? rest : [...rest, label];
}
const about = ref<'block' | 'selection'>('block');
const angle = ref(45);
const pct = ref(50);
const parts = ref(4);
const flips = [
  { axis: 'h', label: 'Left↔right' },
  { axis: 'v', label: 'Top↕bottom' },
  { axis: 'd1', label: 'Diagonal ╲' },
  { axis: 'd2', label: 'Diagonal ╱' },
] as const;

const credit = computed(() => attribution(props.block));
const unconnected = computed(() => props.block.unconnected?.length ?? 0);
const clampInt = (v: string | number | null) =>
  Math.max(1, Math.min(96, Math.round(Number(v) || 1)));
const setSnap = (patch: Partial<SnapSettings>) =>
  emit('settings', { snap: { ...props.settings.snap, ...patch } });
</script>

<style scoped>
.op-section {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}
.inline-op {
  color: #000; /* same as the other op buttons, not the field's muted adornment color */
}
:global(.body--dark) .inline-op {
  color: #fff;
}
</style>
