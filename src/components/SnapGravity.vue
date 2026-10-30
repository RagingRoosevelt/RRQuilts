<template>
  <!-- Block editor snapping (spec 031): how hard each target pulls, the quilter's own setting. -->
  <div id="snap-gravity" class="column" style="gap: 12px">
    <div class="text-caption text-grey-8">
      How close the pointer must come before it jumps onto each kind of point while drawing a block.
      Hold Alt (Option on a Mac) to draw without snapping.
    </div>
    <div v-for="t in TARGETS" :key="t.target" class="row items-center" style="gap: 12px">
      <div class="col">
        <div>{{ t.label }}</div>
        <div class="text-caption text-grey-7">{{ t.caption }}</div>
      </div>
      <!-- The pull's size, as on screen with a mouse. -->
      <div class="pull" aria-hidden="true">
        <span class="ring" :style="ring(t.target)" />
        <span class="dot" />
      </div>
      <q-btn-toggle
        :model-value="step(t.target)"
        dense
        no-caps
        unelevated
        toggle-color="primary"
        :options="STEPS"
        :aria-label="t.label"
        @update:model-value="(v) => setStep(t.target, v)"
      />
    </div>
    <div class="row items-center" style="gap: 12px">
      <div class="col">
        <div>Touch gravity</div>
        <div class="text-caption text-grey-7">A fingertip covers more than a mouse pointer.</div>
      </div>
      <q-btn-toggle
        v-model="store.settings.snapTouch"
        dense
        no-caps
        unelevated
        toggle-color="primary"
        :options="[
          { value: 1, label: 'Same as mouse' },
          { value: 2, label: 'Double' },
          { value: 3, label: 'Triple' },
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GRAVITY_PX, type Gravity, type SnapTarget } from '@/editor/snap';
import { useSettingsStore } from '@/stores/settings';

const store = useSettingsStore();

const TARGETS: { target: SnapTarget; label: string; caption: string }[] = [
  { target: 'nodes', label: 'Nodes', caption: 'Nodes already drawn and the block’s corners.' },
  {
    target: 'seams',
    label: 'Seams',
    caption: 'Any point on a seam. The block’s edges pull at this step even when Off.',
  },
  {
    target: 'align',
    label: 'Aligned to nearest neighbors',
    caption: 'In line with a nearby node, along the grid’s directions.',
  },
  { target: 'grid', label: 'Grid points', caption: 'The snap grid.' },
];
const STEPS = [
  { value: 'off', label: 'Off' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'normal', label: 'Normal' },
  { value: 'strong', label: 'Strong' },
];

const step = (t: SnapTarget) =>
  store.settings.snapOff.includes(t) ? 'off' : store.settings.snapGravity[t];
function setStep(t: SnapTarget, v: Gravity | 'off') {
  const rest = store.settings.snapOff.filter((x) => x !== t);
  if (v === 'off') store.settings.snapOff = [...rest, t];
  else {
    store.settings.snapOff = rest;
    store.settings.snapGravity = { ...store.settings.snapGravity, [t]: v };
  }
}
function ring(t: SnapTarget) {
  const s = step(t);
  const d = s === 'off' ? 0 : 2 * GRAVITY_PX[s];
  return { width: `${d}px`, height: `${d}px`, opacity: d ? 1 : 0 };
}
</script>

<style scoped>
.pull {
  position: relative;
  width: 36px;
  height: 36px;
  flex: none;
}
.ring,
.dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.ring {
  border: 1.5px solid var(--q-primary);
  transition:
    width 150ms,
    height 150ms;
}
.dot {
  width: 6px;
  height: 6px;
  background: #43a047;
}
</style>
