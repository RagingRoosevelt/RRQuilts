<template>
  <div ref="host" class="block-canvas" :class="cursor">
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
import { useQuasar } from 'quasar';
import { computed, ref, shallowRef, watch } from 'vue';
import type { BlockEditorSettings } from '@/editor/block-ops';
import {
  addArc,
  addGrid,
  addLine,
  arcMidpoint,
  moveNode,
  withoutNode,
  segGeom,
  splitSegments,
  sweepFromHandle,
  transformSegments,
  transforms,
  type Endpoint,
} from '@/editor/draw-ops';
import { snap, type Snapped } from '@/editor/snap';
import { useViewport, type World } from '@/composables/viewport';
import { project as projectOnto } from '@/model/geometry/intersect';
import { dist, pointInPolygon, type Pt, type Seg } from '@/model/geometry/path';
import type { Drawing, SeamBlock } from '@/model/schema/block';
import type { RrqDoc } from '@/model/schema/project';
import type { View } from '@/render/draw';
import { drawBlockEditor } from '@/render/draw-block';
import { blockPolygons } from '@/render/hit';
import { useEditorStore } from '@/stores/editor';

const props = defineProps<{
  doc: RrqDoc;
  block: SeamBlock;
  coloringId: string | undefined;
  view: View | undefined;
  settings: BlockEditorSettings;
  selection: Set<string>;
  unconnected: Set<string>;
  readonly: boolean;
}>();
const emit = defineEmits<{
  'update:view': [v: View];
  'update:selection': [ids: Set<string>];
  drawing: [d: Drawing];
  patch: [patchId: string];
  pointer: [info: { p: Pt; length: number | null } | null];
}>();

const $q = useQuasar();
const editor = useEditorStore();
const host = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const size = computed(() => props.block.size);
const drawing = computed(() => props.block.drawing);

// Transient interaction state (never stored in the document).
const preview = shallowRef<Seg | null>(null);
const previewRect = shallowRef<[Pt, Pt] | null>(null);
const marquee = shallowRef<[Pt, Pt] | null>(null);
const snapPoint = shallowRef<Pt | null>(null);
const liveDrawing = shallowRef<Drawing | null>(null);
let gesture:
  | { kind: 'seam'; start: Snapped }
  | { kind: 'grid'; start: Snapped }
  | { kind: 'marquee'; start: Pt }
  | { kind: 'move'; grab: Snapped; ids: Set<string> }
  | { kind: 'node'; id: string }
  | { kind: 'bulge'; seg: string }
  | null = null;

const cursor = computed(() =>
  editor.blockTool === 'pan'
    ? 'cursor-grab'
    : ['line', 'arc', 'grid'].includes(editor.blockTool)
      ? 'cursor-crosshair'
      : 'cursor-pointer',
);
const radius = () => 8 * vp.worldPerPx();
const snapAt = (p: World, d: Drawing = drawing.value) =>
  snap(p, d, size.value, props.settings.snap, radius());
const norm = (p: Pt): Endpoint => ({ x: p[0] / size.value[0], y: p[1] / size.value[1] });

/** Selected single arc → its bulge handle position (design units). */
const bulge = computed<Pt | null>(() => {
  if (props.selection.size !== 1 || editor.blockMode !== 'draw') return null;
  const [id] = props.selection;
  const s = drawing.value.segments.find((x) => x.id === id);
  if (s?.kind !== 'arc') return null;
  const g = segGeom(drawing.value, s, size.value);
  return arcMidpoint(g.a, g.b, s.sweep);
});

function seamAt(p: Pt): string | null {
  let best: { id: string; d: number } | null = null;
  for (const s of drawing.value.segments) {
    const d = projectOnto(segGeom(drawing.value, s, size.value), p).d;
    if (d <= 6 * vp.worldPerPx() && (!best || d < best.d)) best = { id: s.id, d };
  }
  return best?.id ?? null;
}
function nodeAt(p: Pt): string | null {
  const [w, h] = size.value;
  let best: { id: string; d: number } | null = null;
  for (const n of drawing.value.nodes) {
    const d = dist(p, [n.x * w, n.y * h]);
    if (d <= radius() && (!best || d < best.d)) best = { id: n.id, d };
  }
  return best?.id ?? null;
}
function patchAt(p: Pt): string | null {
  const n: Pt = [p[0] / size.value[0], p[1] / size.value[1]];
  let hit: string | null = null;
  for (const x of blockPolygons(props.block)) if (pointInPolygon(n, x.poly)) hit = x.id;
  return hit;
}

function previewSeg(a: Pt, b: Pt): Seg {
  return editor.blockTool === 'arc'
    ? { kind: 'arc', a, b, sweep: 90 * editor.arcSign }
    : { kind: 'line', a, b };
}

let lastTap: { at: number; seam: string | null } = { at: 0, seam: null };

const vp = useViewport({
  host,
  canvas,
  getView: () => props.view,
  setView: (v) => emit('update:view', v),
  bounds: () => [0, 0, size.value[0], size.value[1]],
  panOnly: () => editor.blockTool === 'pan',
  draw(ctx, view, dpr) {
    const c = canvas.value!;
    ctx.fillStyle = $q.dark.isActive ? '#3c3c3c' : '#9e9e9e';
    ctx.fillRect(0, 0, c.width, c.height);
    drawBlockEditor(ctx, props.doc, props.block, {
      dpr,
      view,
      dark: $q.dark.isActive,
      mode: editor.blockMode === 'color' ? 'color' : 'draw',
      coloring:
        props.block.colorings.find((x) => x.id === props.coloringId) ?? props.block.colorings[0],
      snap: props.settings.snap,
      graph: props.settings.graph,
      guides: props.settings.guides,
      selection: props.selection,
      unconnected: props.unconnected,
      showNodes: editor.blockTool === 'node' || editor.blockTool === 'select',
      preview: preview.value,
      previewRect: previewRect.value,
      marquee: marquee.value,
      snapPoint: snapPoint.value,
      bulge: liveDrawing.value ? null : bulge.value,
      liveDrawing: liveDrawing.value,
    });
  },

  onHover(p) {
    if (!p) {
      snapPoint.value = null;
      emit('pointer', null);
      return;
    }
    const drawingTool =
      ['line', 'arc', 'grid', 'node'].includes(editor.blockTool) && editor.blockMode === 'draw';
    const s = drawingTool ? snapAt(p) : null;
    snapPoint.value = s && s.kind !== 'free' ? s.p : null;
    if (!gesture) emit('pointer', { p: s?.p ?? p, length: null });
  },

  onTap(p, e) {
    if (editor.blockMode === 'details' || (props.readonly && editor.blockMode === 'draw')) return;
    if (editor.blockMode === 'color') {
      const patch = patchAt(p);
      if (patch) emit('patch', patch);
      return;
    }
    if (editor.blockTool === 'select' || editor.blockTool === 'node') {
      const seam = seamAt(p);
      const now = Date.now();
      // Node tool: double-tap a seam to add a node there.
      if (editor.blockTool === 'node' && seam && lastTap.seam === seam && now - lastTap.at < 400) {
        const s = drawing.value.segments.find((x) => x.id === seam)!;
        const t = projectOnto(segGeom(drawing.value, s, size.value), p).t;
        emit('drawing', splitSegments(drawing.value, new Map([[seam, [t]]]), size.value));
        lastTap = { at: 0, seam: null };
        return;
      }
      lastTap = { at: now, seam };
      if (editor.blockTool === 'select') {
        const next = new Set(e.shiftKey ? props.selection : []);
        if (seam) {
          if (e.shiftKey && next.has(seam)) next.delete(seam);
          else next.add(seam);
        }
        emit('update:selection', next);
      }
    }
  },

  onDragStart(p) {
    if (props.readonly || editor.blockMode !== 'draw') return false;
    const t = editor.blockTool;
    if (t === 'line' || t === 'arc') gesture = { kind: 'seam', start: snapAt(p) };
    else if (t === 'grid') gesture = { kind: 'grid', start: snapAt(p) };
    else if (t === 'node') {
      const id = nodeAt(p);
      if (!id) return false;
      gesture = { kind: 'node', id };
    } else if (t === 'select') {
      const seam = seamAt(p);
      if (bulge.value && dist(p, bulge.value) <= radius())
        gesture = { kind: 'bulge', seg: [...props.selection][0]! };
      else if (seam && props.selection.has(seam))
        gesture = { kind: 'move', grab: snapAt(p), ids: props.selection };
      else gesture = { kind: 'marquee', start: p };
    } else return false;
    return true;
  },

  onDrag(p) {
    const g = gesture;
    if (!g) return;
    if (g.kind === 'seam') {
      const s = snapAt(p);
      snapPoint.value = s.kind !== 'free' ? s.p : null;
      preview.value = previewSeg(g.start.p, s.p);
      emit('pointer', { p: s.p, length: dist(g.start.p, s.p) });
    } else if (g.kind === 'grid') {
      previewRect.value = [g.start.p, snapAt(p).p];
    } else if (g.kind === 'marquee') {
      marquee.value = [g.start, p];
    } else if (g.kind === 'node') {
      const others = withoutNode(drawing.value, g.id);
      const s = snapAt(p, others);
      snapPoint.value = s.p;
      liveDrawing.value = moveNode(
        drawing.value,
        g.id,
        s.p[0] / size.value[0],
        s.p[1] / size.value[1],
      );
    } else if (g.kind === 'move') {
      const s = snapAt(p);
      const [dx, dy] = [s.p[0] - g.grab.p[0], s.p[1] - g.grab.p[1]];
      liveDrawing.value = transformSegments(
        drawing.value,
        g.ids,
        transforms.translate(dx, dy),
        size.value,
      );
    } else if (g.kind === 'bulge') {
      const seg = drawing.value.segments.find((x) => x.id === g.seg);
      if (seg?.kind !== 'arc') return;
      const geo = segGeom(drawing.value, seg, size.value);
      const sweep = clampSweep(sweepFromHandle(geo.a, geo.b, p));
      liveDrawing.value = {
        ...drawing.value,
        segments: drawing.value.segments.map((x) => (x.id === g.seg ? { ...seg, sweep } : x)),
      };
    }
    vp.schedule();
  },

  onDragEnd(p) {
    const g = gesture;
    gesture = null;
    preview.value = previewRect.value = marquee.value = liveDrawing.value = null;
    if (!g) return;
    const d = drawing.value;
    if (g.kind === 'seam') {
      const end = snapAt(p);
      if (dist(g.start.p, end.p) > radius() / 2) {
        emit(
          'drawing',
          editor.blockTool === 'arc'
            ? addArc(d, g.start.endpoint, end.endpoint, 90 * editor.arcSign)
            : addLine(d, g.start.endpoint, end.endpoint),
        );
      }
    } else if (g.kind === 'grid') {
      const end = snapAt(p).p;
      const a = norm(g.start.p) as { x: number; y: number };
      const b = norm(end) as { x: number; y: number };
      emit('drawing', addGrid(d, [a.x, a.y], [b.x, b.y], editor.grid[0], editor.grid[1]));
    } else if (g.kind === 'marquee') {
      const [x0, x1] = [Math.min(g.start[0], p[0]), Math.max(g.start[0], p[0])];
      const [y0, y1] = [Math.min(g.start[1], p[1]), Math.max(g.start[1], p[1])];
      const inside = (q: Pt) => q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1;
      const ids = d.segments.filter((s) => {
        const geo = segGeom(d, s, size.value);
        return inside(geo.a) && inside(geo.b);
      });
      emit('update:selection', new Set(ids.map((s) => s.id)));
    } else if (g.kind === 'node') {
      const others = withoutNode(d, g.id);
      const s = snapAt(p, others);
      emit('drawing', moveNode(d, g.id, s.p[0] / size.value[0], s.p[1] / size.value[1]));
    } else if (g.kind === 'move') {
      const s = snapAt(p);
      const [dx, dy] = [s.p[0] - g.grab.p[0], s.p[1] - g.grab.p[1]];
      if (dx || dy)
        emit('drawing', transformSegments(d, g.ids, transforms.translate(dx, dy), size.value));
    } else if (g.kind === 'bulge') {
      const seg = d.segments.find((x) => x.id === g.seg);
      if (seg?.kind !== 'arc') return;
      const geo = segGeom(d, seg, size.value);
      const sweep = clampSweep(sweepFromHandle(geo.a, geo.b, p));
      emit('drawing', {
        ...d,
        segments: d.segments.map((s) => (s.id === g.seg ? { ...seg, sweep } : s)),
      });
    }
    emit('pointer', null);
  },
});

const clampSweep = (s: number) => Math.sign(s || 1) * Math.min(359, Math.max(1, Math.abs(s)));

watch(
  () => [
    props.doc,
    props.block,
    props.view,
    props.selection,
    props.settings,
    props.coloringId,
    editor.blockMode,
    editor.blockTool,
    $q.dark.isActive,
  ],
  vp.schedule,
);
watch([preview, previewRect, marquee, snapPoint, liveDrawing], vp.schedule);
defineExpose({ fit: vp.fit });
</script>

<style scoped>
.block-canvas {
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
