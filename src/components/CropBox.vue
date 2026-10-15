<template>
  <!-- An image with a crop rectangle: drag inside it to move, drag a corner to resize. The
       rectangle is in fractions of the image (0…1); `square` keeps it square in pixels. -->
  <div ref="box" class="crop-box" :style="{ width: `${dw}px`, height: `${dh}px` }">
    <img :src="src" alt="" draggable="false" />
    <div class="shade" :style="shade" />
    <div class="rect" :style="rectStyle" @pointerdown.prevent="start($event, 'move')">
      <span
        v-for="c in CORNERS"
        :key="c"
        class="handle"
        :class="c"
        @pointerdown.stop.prevent="start($event, c)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
const props = defineProps<{
  src: string;
  /** The image's size in pixels. */
  width: number;
  height: number;
  modelValue: Rect;
  square: boolean;
  /** Longest side shown, in CSS pixels. */
  size?: number;
}>();
const emit = defineEmits<{ 'update:modelValue': [r: Rect] }>();

const CORNERS = ['nw', 'ne', 'sw', 'se'] as const;
type Mode = 'move' | (typeof CORNERS)[number];
const k = computed(() => (props.size ?? 360) / Math.max(props.width, props.height));
const dw = computed(() => Math.round(props.width * k.value));
const dh = computed(() => Math.round(props.height * k.value));
const box = ref<HTMLElement>();
const pct = (n: number) => `${n * 100}%`;
const rectStyle = computed(() => ({
  left: pct(props.modelValue.x),
  top: pct(props.modelValue.y),
  width: pct(props.modelValue.w),
  height: pct(props.modelValue.h),
}));
/** Darken outside the rectangle (a huge shadow around a cut-out). */
const shade = computed(() => ({
  ...rectStyle.value,
  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
}));

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const MIN = 0.05;

function start(e: PointerEvent, mode: Mode) {
  const el = box.value!;
  const r0 = { ...props.modelValue };
  const x0 = e.clientX;
  const y0 = e.clientY;
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  const aspect = props.width / props.height; // fraction-of-height per fraction-of-width
  const move = (ev: PointerEvent) => {
    const dx = (ev.clientX - x0) / el.clientWidth;
    const dy = (ev.clientY - y0) / el.clientHeight;
    let r: Rect;
    if (mode === 'move')
      r = { ...r0, x: clamp(r0.x + dx, 0, 1 - r0.w), y: clamp(r0.y + dy, 0, 1 - r0.h) };
    else {
      // The corner opposite the one dragged stays put.
      const ax = mode.includes('w') ? r0.x + r0.w : r0.x;
      const ay = mode.includes('n') ? r0.y + r0.h : r0.y;
      let w = mode.includes('w') ? r0.w - dx : r0.w + dx;
      let h = mode.includes('n') ? r0.h - dy : r0.h + dy;
      w = clamp(w, MIN, mode.includes('w') ? ax : 1 - ax);
      h = clamp(h, MIN, mode.includes('n') ? ay : 1 - ay);
      if (props.square) {
        // Square in pixels: w × width = h × height.
        const side = Math.min(w * aspect, h);
        w = side / aspect;
        h = side;
      }
      r = { x: mode.includes('w') ? ax - w : ax, y: mode.includes('n') ? ay - h : ay, w, h };
    }
    emit('update:modelValue', r);
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}
</script>

<style scoped>
.crop-box {
  position: relative;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}
.crop-box img {
  width: 100%;
  height: 100%;
  display: block;
}
.shade {
  position: absolute;
  pointer-events: none;
}
.rect {
  position: absolute;
  border: 2px solid #fff;
  outline: 1px solid rgba(0, 0, 0, 0.5);
  cursor: move;
}
.handle {
  position: absolute;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 50%;
}
.nw {
  left: -9px;
  top: -9px;
  cursor: nwse-resize;
}
.ne {
  right: -9px;
  top: -9px;
  cursor: nesw-resize;
}
.sw {
  left: -9px;
  bottom: -9px;
  cursor: nesw-resize;
}
.se {
  right: -9px;
  bottom: -9px;
  cursor: nwse-resize;
}
</style>
