<template>
  <div
    class="epp3d-view column items-center justify-center"
    :style="{ width: size, height: size }"
    @pointerleave="leave"
  >
    <canvas v-if="live" ref="cv" class="live" />
    <template v-else>
      <img
        v-if="url"
        :src="url"
        alt="The folded object"
        :class="{ turnable: interactive }"
        @click="start"
      />
      <div v-else class="text-caption text-grey-7">Drawing the 3D view…</div>
      <div v-if="interactive && url" class="hint text-caption">Click to turn it</div>
    </template>
  </div>
</template>

<script setup lang="ts">
// The printout's 3D view (owner, 2026-11-23): the folded object's picture; a click swaps in a live
// view to turn by dragging, and the mouse leaving or 15 seconds untouched swap the picture back,
// seen from where it was left (`update:view`, saved with the quilt).
import { nextTick, onBeforeUnmount, ref } from 'vue';
import { orbit, type View3d } from '@/render/epp3d-picture';

const props = defineProps<{
  url: string | null;
  /** The shape's key (render/epp3d-picture.ts). */
  shape: string;
  view: View3d;
  /** CSS size of the square. */
  size: string;
  /** On screen and editable (not the printed copy, not read-only). */
  interactive: boolean;
}>();
const emit = defineEmits<{ 'update:view': [v: View3d] }>();

const IDLE_MS = 15_000;
const live = ref(false);
const cv = ref<HTMLCanvasElement>();
let stop: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let turned: View3d | null = null;

function touch() {
  clearTimeout(timer);
  timer = setTimeout(end, IDLE_MS);
}
async function start() {
  if (!props.interactive || live.value) return;
  live.value = true;
  turned = null;
  await nextTick();
  const off = cv.value
    ? await orbit(cv.value, props.shape, props.view, (v) => (turned = v), touch)
    : null;
  if (!off) return void (live.value = false);
  if (!live.value) return off(); // left while it was starting
  stop = off;
  touch();
}
function end() {
  clearTimeout(timer);
  stop?.();
  stop = null;
  if (!live.value) return;
  live.value = false;
  if (turned) emit('update:view', turned);
}
/** A mouse leaving ends it (a finger lifting doesn't: the 15 seconds do). */
const leave = (e: PointerEvent) => e.pointerType === 'mouse' && end();
onBeforeUnmount(end);
</script>

<style scoped>
.epp3d-view {
  position: relative;
}
.epp3d-view img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.turnable {
  cursor: grab;
}
.live {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
}
.hint {
  position: absolute;
  bottom: 0;
  opacity: 0.6;
  pointer-events: none;
}
@media print {
  .hint {
    display: none;
  }
}
</style>
