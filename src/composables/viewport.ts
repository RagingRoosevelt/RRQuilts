// Shared canvas viewport: device-pixel sizing, redraw scheduling, zoom (wheel, pinch, buttons),
// pan, and turning pointer input into taps / drags in world coordinates.
// Drags go to the tool first (onDragStart returns true to claim); otherwise they pan when the
// Pan tool is on, with touch, or with the right/middle mouse button. Two fingers always pinch/pan.
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { fitView, type View } from '@/render/draw';

export type World = [number, number];

export interface ViewportOptions {
  host: Ref<HTMLElement | undefined>;
  canvas: Ref<HTMLCanvasElement | undefined>;
  getView: () => View | undefined;
  setView: (v: View) => void;
  bounds: () => [number, number, number, number];
  draw: (ctx: CanvasRenderingContext2D, view: View, dpr: number) => void;
  panOnly: () => boolean;
  onTap?: (p: World, e: PointerEvent) => void;
  onHover?: (p: World | null, e: PointerEvent | null) => void;
  onDragStart?: (p: World, e: PointerEvent) => boolean;
  onDrag?: (p: World, e: PointerEvent) => void;
  onDragEnd?: (p: World, e: PointerEvent) => void;
}

export function useViewport(o: ViewportOptions) {
  const size = ref({ w: 0, h: 0 });
  let frame = 0;

  const view = (): View => o.getView() ?? fitView(o.bounds(), size.value.w, size.value.h);

  function redraw() {
    frame = 0;
    const c = o.canvas.value;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || !size.value.w) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    o.draw(ctx, view(), window.devicePixelRatio || 1);
  }
  const schedule = () => {
    frame ||= requestAnimationFrame(redraw);
  };

  let observer: ResizeObserver | undefined;
  onMounted(() => {
    observer = new ResizeObserver(([e]) => {
      const c = o.canvas.value;
      if (!e || !c) return;
      const dpr = window.devicePixelRatio || 1;
      size.value = { w: e.contentRect.width, h: e.contentRect.height };
      c.width = Math.round(e.contentRect.width * dpr);
      c.height = Math.round(e.contentRect.height * dpr);
      c.style.width = `${e.contentRect.width}px`;
      c.style.height = `${e.contentRect.height}px`;
      schedule();
    });
    observer.observe(o.host.value!);
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });

  type P = { x: number; y: number };
  const local = (e: { clientX: number; clientY: number }): P => {
    const r = o.canvas.value!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const toWorld = (p: P): World => {
    const v = view();
    return [(p.x - v.tx) / v.scale, (p.y - v.ty) / v.scale];
  };

  function zoomAt(factor: number, at: P, from = view()) {
    const scale = Math.min(400, Math.max(0.02, from.scale * factor));
    const k = scale / from.scale;
    o.setView({ scale, tx: at.x - (at.x - from.tx) * k, ty: at.y - (at.y - from.ty) * k });
  }
  const zoomBy = (f: number) => zoomAt(f, { x: size.value.w / 2, y: size.value.h / 2 });
  const fit = () => o.setView(fitView(o.bounds(), size.value.w, size.value.h));

  const pointers = new Map<number, P>();
  let start: (P & { mode: 'pending' | 'pan' | 'drag' | 'none' }) | null = null;
  let pinch: { dist: number; view: View; mid: P } | null = null;
  const two = () => [...pointers.values()] as [P, P];

  function down(e: PointerEvent) {
    o.canvas.value!.setPointerCapture(e.pointerId);
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      if (start?.mode === 'drag') o.onDragEnd?.(toWorld(p), e); // second finger cancels a drag
      const [a, b] = two();
      pinch = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        view: view(),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
      start = null;
    } else {
      start = { ...p, mode: 'pending' };
    }
  }

  function move(e: PointerEvent) {
    const p = local(e);
    if (!pointers.has(e.pointerId)) {
      if (e.pointerType === 'mouse') o.onHover?.(toWorld(p), e);
      return;
    }
    const prev = pointers.get(e.pointerId)!;
    pointers.set(e.pointerId, p);
    if (pinch && pointers.size === 2) {
      const [a, b] = two();
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      zoomAt(Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist, pinch.mid, {
        ...pinch.view,
        tx: pinch.view.tx + mid.x - pinch.mid.x,
        ty: pinch.view.ty + mid.y - pinch.mid.y,
      });
      return;
    }
    if (!start) return;
    if (start.mode === 'pending' && Math.hypot(p.x - start.x, p.y - start.y) > 6) {
      const wantsPan = o.panOnly() || e.buttons !== 1;
      if (!wantsPan && o.onDragStart?.(toWorld(start), e)) start.mode = 'drag';
      else start.mode = wantsPan || e.pointerType === 'touch' ? 'pan' : 'none';
    }
    if (start.mode === 'pan') {
      const v = view();
      o.setView({ ...v, tx: v.tx + p.x - prev.x, ty: v.ty + p.y - prev.y });
    } else if (start.mode === 'drag') {
      o.onDrag?.(toWorld(p), e);
    }
    if (e.pointerType === 'mouse') o.onHover?.(toWorld(p), e);
  }

  function up(e: PointerEvent) {
    const p = local(e);
    const s = start;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (s?.mode === 'drag') o.onDragEnd?.(toWorld(p), e);
    else if (s?.mode === 'pending' && e.button === 0 && !o.panOnly()) o.onTap?.(toWorld(p), e);
    start = null;
  }

  function cancel(e: PointerEvent) {
    pointers.delete(e.pointerId);
    pinch = null;
    if (start?.mode === 'drag') o.onDragEnd?.(toWorld(local(e)), e);
    start = null;
  }

  const wheel = (e: WheelEvent) => zoomAt(Math.exp(-e.deltaY * 0.0015), local(e));
  const leave = (e: PointerEvent) => {
    if (!pointers.size) o.onHover?.(null, e);
  };

  return {
    size,
    schedule,
    fit,
    zoomBy,
    view,
    /** World units per CSS pixel (for snap radius, line widths). */
    worldPerPx: () => 1 / view().scale,
    handlers: {
      pointerdown: down,
      pointermove: move,
      pointerup: up,
      pointercancel: cancel,
      pointerleave: leave,
      wheel,
    },
  };
}
