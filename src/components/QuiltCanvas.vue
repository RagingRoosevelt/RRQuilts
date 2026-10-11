<template>
  <div ref="host" class="quilt-canvas" :class="cursor">
    <canvas
      ref="canvas"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="cancel"
      @pointerleave="emit('hover', null)"
      @wheel.prevent="wheel"
      @contextmenu.prevent
    />
    <div class="zoom column q-gutter-xs">
      <q-btn round dense size="sm" icon="add" aria-label="Zoom in" @click="zoomBy(1.25)" />
      <q-btn round dense size="sm" icon="remove" aria-label="Zoom out" @click="zoomBy(0.8)" />
      <q-btn round dense size="sm" icon="fit_screen" aria-label="Fit" @click="fit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Generated } from '@/model/layout/slots';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { drawQuilt, fitView, type View } from '@/render/draw';
import { hitTest, type Hit } from '@/render/hit';

const props = defineProps<{
  doc: RrqDoc;
  quilt: Quilt;
  generated: Generated;
  view: View | undefined;
  hover: string | null;
  outlines: boolean;
  panOnly: boolean;
}>();
const emit = defineEmits<{
  tap: [hit: Hit];
  hover: [hit: Hit | null];
  'update:view': [view: View];
}>();

const $q = useQuasar();
const host = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const size = ref({ w: 0, h: 0 });
let frame = 0;

const blocks = computed(() => new Map(props.doc.project.blocks.map((b) => [b.id, b])));
const cursor = computed(() => (props.panOnly ? 'cursor-grab' : 'cursor-pointer'));

function currentView(): View {
  return props.view ?? fitView(props.generated.bounds, size.value.w, size.value.h);
}

function draw() {
  frame = 0;
  const c = canvas.value;
  const ctx = c?.getContext('2d');
  if (!c || !ctx || !size.value.w) return;
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = $q.dark.isActive ? '#3c3c3c' : '#9e9e9e'; // neutral gray (FR-015 of spec 004)
  ctx.fillRect(0, 0, c.width, c.height);
  drawQuilt(ctx, props.doc, props.quilt, props.generated, {
    dpr,
    view: currentView(),
    outlines: props.outlines,
    hover: props.hover,
    dark: $q.dark.isActive,
  });
}
const schedule = () => {
  frame ||= requestAnimationFrame(draw);
};
watch(
  () => [
    props.doc,
    props.quilt,
    props.generated,
    props.view,
    props.hover,
    props.outlines,
    $q.dark.isActive,
  ],
  schedule,
);

let observer: ResizeObserver | undefined;
onMounted(() => {
  observer = new ResizeObserver(([e]) => {
    if (!e || !canvas.value) return;
    const dpr = window.devicePixelRatio || 1;
    size.value = { w: e.contentRect.width, h: e.contentRect.height };
    canvas.value.width = Math.round(e.contentRect.width * dpr);
    canvas.value.height = Math.round(e.contentRect.height * dpr);
    canvas.value.style.width = `${e.contentRect.width}px`;
    canvas.value.style.height = `${e.contentRect.height}px`;
    schedule();
  });
  observer.observe(host.value!);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  if (frame) cancelAnimationFrame(frame);
});

// --- pointer handling: tap, drag-pan, pinch-zoom ---
const pointers = new Map<number, { x: number; y: number }>();
let start: { x: number; y: number; moved: boolean } | null = null;
let pinch: { dist: number; view: View; mid: { x: number; y: number } } | null = null;

const local = (e: PointerEvent | WheelEvent) => {
  const r = canvas.value!.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};
const toQuilt = (p: { x: number; y: number }): [number, number] => {
  const v = currentView();
  return [(p.x - v.tx) / v.scale, (p.y - v.ty) / v.scale];
};
const hitAt = (p: { x: number; y: number }) =>
  hitTest(blocks.value, props.quilt, props.generated, toQuilt(p));

function zoomAt(factor: number, at: { x: number; y: number }, from = currentView()) {
  const scale = Math.min(200, Math.max(0.05, from.scale * factor));
  const k = scale / from.scale;
  emit('update:view', { scale, tx: at.x - (at.x - from.tx) * k, ty: at.y - (at.y - from.ty) * k });
}
const zoomBy = (f: number) => zoomAt(f, { x: size.value.w / 2, y: size.value.h / 2 });
const fit = () => emit('update:view', fitView(props.generated.bounds, size.value.w, size.value.h));
defineExpose({ fit });

function down(e: PointerEvent) {
  canvas.value!.setPointerCapture(e.pointerId);
  const p = local(e);
  pointers.set(e.pointerId, p);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
    pinch = {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      view: currentView(),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
    start = null;
  } else {
    start = { ...p, moved: false };
  }
}

function move(e: PointerEvent) {
  const p = local(e);
  if (!pointers.has(e.pointerId)) {
    if (e.pointerType === 'mouse') emit('hover', hitAt(p));
    return;
  }
  const prev = pointers.get(e.pointerId)!;
  pointers.set(e.pointerId, p);
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
    zoomAt(Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist, pinch.mid, pinch.view);
    return;
  }
  if (!start) return;
  const dragging = start.moved || Math.hypot(p.x - start.x, p.y - start.y) > 6;
  // Drag pans with the Pan tool, right/middle mouse, or touch; taps paint/set.
  if (dragging && (props.panOnly || e.pointerType === 'touch' || e.buttons !== 1)) {
    start.moved = true;
    const v = currentView();
    emit('update:view', { ...v, tx: v.tx + p.x - prev.x, ty: v.ty + p.y - prev.y });
  } else if (dragging) {
    start.moved = true;
  }
}

function up(e: PointerEvent) {
  const p = local(e);
  const wasTap = start && !start.moved && pointers.size === 1 && e.button === 0;
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (wasTap && !props.panOnly) {
    const hit = hitAt(p);
    if (hit) emit('tap', hit);
  }
  start = null;
}

function cancel(e: PointerEvent) {
  pointers.delete(e.pointerId);
  pinch = null;
  start = null;
}

function wheel(e: WheelEvent) {
  zoomAt(Math.exp(-e.deltaY * 0.0015), local(e));
}
</script>

<style scoped>
.quilt-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
}
.zoom {
  position: absolute;
  right: 12px;
  bottom: 12px;
}
</style>
