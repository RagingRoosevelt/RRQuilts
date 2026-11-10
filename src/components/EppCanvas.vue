<template>
  <div ref="host" class="epp-canvas">
    <canvas
      ref="canvas"
      @pointerdown="vp.handlers.pointerdown"
      @pointermove="vp.handlers.pointermove"
      @pointerup="vp.handlers.pointerup"
      @pointercancel="vp.handlers.pointercancel"
      @pointerleave="vp.handlers.pointerleave"
      @wheel.prevent="vp.handlers.wheel"
      @contextmenu.prevent
    />
    <div class="zoom column" style="gap: 4px">
      <q-btn round dense size="sm" icon="add" aria-label="Zoom in" @click="vp.zoomBy(1.25)" />
      <q-btn round dense size="sm" icon="remove" aria-label="Zoom out" @click="vp.zoomBy(0.8)" />
      <q-btn round dense size="sm" icon="fit_screen" aria-label="Fit" @click="vp.fit()" />
    </div>
  </div>
</template>

<script setup lang="ts">
// The EPP canvas (specs 027, 050): one drawing surface for the shape editor, the rosette editor and
// EPP quilts. It draws polygons in units with their fills, a unit grid, and whatever the page adds
// through `decorate`; pointer input comes back in units.
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useViewport, type World } from '@/composables/viewport';
import { bbox, type Poly } from '@/model/epp/geometry';
import type { Fill } from '@/model/schema/coloring';
import type { RrqDoc } from '@/model/schema/project';
import { colorLookup, type View } from '@/render/draw';
import { imagesTick } from '@/render/fabric-images';

export interface CanvasPoly {
  poly: Poly;
  fill?: Fill | undefined;
  /** Drawn highlighted (selected), red (failing a check), tinted (overlapping). */
  selected?: boolean;
  failing?: boolean;
  overlap?: boolean;
}
export type Grid =
  { kind: 'none' } | { kind: 'square' | 'triangle'; origin?: [number, number]; step?: number };
export interface Decor {
  ctx: CanvasRenderingContext2D;
  view: View;
  dpr: number;
  /** CSS pixels → units. */
  px: (n: number) => number;
}

const props = withDefaults(
  defineProps<{
    doc: RrqDoc;
    polys: CanvasPoly[];
    view: View | undefined;
    grid?: Grid;
    /** Project units per 1U, for fabric prints at true scale (rosettes: 1 inch). */
    unitLength?: number;
    /** Bounds to fit when nothing is placed. */
    empty?: [number, number, number, number];
    decorate?: (d: Decor) => void;
    claim?: (p: World, e: PointerEvent) => boolean;
    pan?: boolean;
    /** Redraw when this changes (hover, ghosts…). */
    tick?: unknown;
  }>(),
  { grid: () => ({ kind: 'square' }), unitLength: 1, empty: () => [-3, -3, 3, 3], pan: false },
);
const emit = defineEmits<{
  'update:view': [v: View];
  tap: [p: World, e: PointerEvent];
  hover: [p: World | null, e: PointerEvent | null];
  drag: [p: World, e: PointerEvent];
  'drag-end': [p: World, e: PointerEvent];
}>();

const $q = useQuasar();
const host = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();

function bounds(): [number, number, number, number] {
  if (!props.polys.length) return props.empty;
  const [x0, y0, x1, y1] = bbox(props.polys.map((p) => p.poly));
  return [x0 - 1, y0 - 1, x1 + 1, y1 + 1];
}

function drawGrid(ctx: CanvasRenderingContext2D, view: View, w: number, h: number) {
  if (props.grid.kind === 'none') return;
  const [ox, oy] = props.grid.origin ?? [0, 0];
  const k = props.grid.step ?? 1;
  if (view.scale * k < 4) return; // too dense to help
  // Drawn in grid steps: scale the world so one step is one.
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(k, k);
  const x0 = (-view.tx / view.scale - ox) / k;
  const y0 = (-view.ty / view.scale - oy) / k;
  const x1 = x0 + w / view.scale / k;
  const y1 = y0 + h / view.scale / k;
  ctx.strokeStyle = $q.dark.isActive ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1 / view.scale / k;
  ctx.beginPath();
  const seg = (ax: number, ay: number, bx: number, by: number) => {
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  };
  if (props.grid.kind === 'square') {
    for (let x = Math.floor(x0); x <= x1; x++) seg(x, y0, x, y1);
    for (let y = Math.floor(y0); y <= y1; y++) seg(x0, y, x1, y);
  } else {
    // Triangle grid: horizontal lines √3/2 apart, plus lines at ±60° through whole units.
    const r = Math.sqrt(3) / 2;
    for (let y = Math.floor(y0 / r) * r; y <= y1; y += r) seg(x0, y, x1, y);
    const dy = y0 / Math.sqrt(3);
    const dx = y1 / Math.sqrt(3);
    const span = Math.abs(dx) + Math.abs(dy) + 1;
    for (let x = Math.floor(x0 - span); x <= x1 + span; x++) {
      seg(x + dy, y0, x + dx, y1);
      seg(x - dy, y0, x - dx, y1);
    }
  }
  ctx.stroke();
  ctx.restore();
}

const vp = useViewport({
  host,
  canvas,
  getView: () => props.view,
  setView: (v) => emit('update:view', v),
  bounds,
  panOnly: () => props.pan,
  draw(ctx, view, dpr) {
    const c = canvas.value!;
    const dark = $q.dark.isActive;
    ctx.fillStyle = dark ? '#2b2b2b' : '#f0f0f0';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.tx, dpr * view.ty);
    drawGrid(ctx, view, c.width / dpr, c.height / dpr);
    const paint = colorLookup(props.doc, [], {
      ctx,
      devicePerUnit: (dpr * view.scale) / props.unitLength,
    });
    const line = 1 / view.scale;
    for (const p of props.polys) {
      ctx.beginPath();
      p.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = paint(p.fill) ?? (dark ? '#555' : '#ffffff');
      ctx.fill();
      if (p.overlap) {
        ctx.fillStyle = 'rgba(211,47,47,0.25)';
        ctx.fill();
      }
      ctx.lineWidth = (p.selected || p.failing ? 2.5 : 1) * line;
      ctx.strokeStyle = p.failing
        ? '#d32f2f'
        : p.selected
          ? '#1976d2'
          : dark
            ? 'rgba(255,255,255,0.7)'
            : 'rgba(0,0,0,0.75)';
      ctx.stroke();
    }
    props.decorate?.({ ctx, view, dpr, px: (n) => n / view.scale });
  },
  onTap: (p, e) => emit('tap', p, e),
  onHover: (p, e) => emit('hover', p, e),
  onDragStart: (p, e) => props.claim?.(p, e) ?? false,
  onDrag: (p, e) => emit('drag', p, e),
  onDragEnd: (p, e) => emit('drag-end', p, e),
});

watch(
  () => [props.polys, props.view, props.grid, props.tick, imagesTick.value, $q.dark.isActive],
  () => vp.schedule(),
  { deep: false },
);

defineExpose({ fit: () => vp.fit(), worldPerPx: () => vp.worldPerPx() });
</script>

<style scoped>
.epp-canvas {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
}
.epp-canvas canvas {
  display: block;
}
.zoom {
  position: absolute;
  right: 8px;
  bottom: 8px;
}
</style>
