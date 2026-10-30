// Reordering cards in a wrapping grid by drag (spec 037): mouse and pen after a small move, touch
// after a long press (a swipe still scrolls). The card stays in place faded; a solid copy of its
// picture follows the pointer; the facing edges of the cards either side of the landing place glow,
// and letting go anywhere lands it there. Built on pointer events: the browser's drag image can't be
// styled and doesn't work for touch.
import { nextTick, onBeforeUnmount, ref } from 'vue';

export interface CardDragOptions {
  /** Cards carry `data-drag="<list>"` and `data-drag-index="<i>"` on the element to measure. */
  list: string;
  enabled: () => boolean;
  /** Put card `from` into gap `gap` (0 = before the first, count = after the last). */
  move: (from: number, gap: number) => void;
}

const LONG_PRESS = 350;
const SLOP = 8;
const EDGE = 64;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** The gap the point is over: before or after the nearest card; past the last card or below the
 *  list = the end. */
export function gapAt(rects: (DOMRect | null)[], x: number, y: number): number | null {
  let best = -1;
  let bestD = Infinity;
  let bottom = -Infinity;
  rects.forEach((r, i) => {
    if (!r || !r.width) return;
    bottom = Math.max(bottom, r.bottom);
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    const d = dy * 1e6 + dx; // the row first (the nearest one), then the nearest card in it
    if (d < bestD) [best, bestD] = [i, d];
  });
  if (best < 0) return null;
  if (y > bottom) return rects.length;
  const r = rects[best]!;
  return x < r.left + r.width / 2 ? best : best + 1;
}

export function useCardDrag(o: CardDragOptions) {
  /** The card being dragged, and the gap it would land in (null: its own place, no move). */
  const from = ref<number | null>(null);
  const gap = ref<number | null>(null);

  let pending: {
    id: number;
    x: number;
    y: number;
    el: HTMLElement;
    i: number;
    timer?: number;
  } | null = null;
  let ghost: HTMLElement | null = null;
  let grab = { dx: 0, dy: 0 };
  let pos = { x: 0, y: 0 };
  let tilt = 0;
  let vx = 0;
  let raf = 0;
  let suppressClick = false;

  const cards = () =>
    [...document.querySelectorAll<HTMLElement>(`[data-drag="${o.list}"]`)].sort(
      (a, b) => Number(a.dataset.dragIndex) - Number(b.dataset.dragIndex),
    );

  function onDown(e: PointerEvent, i: number) {
    if (!o.enabled() || e.button !== 0 || from.value !== null) return;
    const el = e.currentTarget as HTMLElement;
    pending = { id: e.pointerId, x: e.clientX, y: e.clientY, el, i };
    if (e.pointerType === 'touch')
      pending.timer = window.setTimeout(() => {
        if (pending) {
          navigator.vibrate?.(10);
          start(pending.x, pending.y);
        }
      }, LONG_PRESS);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', cancel);
  }

  function start(x: number, y: number) {
    const p = pending!;
    clearTimeout(p.timer);
    from.value = p.i;
    gap.value = null;
    const img = p.el.querySelector('img');
    const r = (img ?? p.el).getBoundingClientRect();
    grab = { dx: p.x - r.left, dy: p.y - r.top };
    const copy = document.createElement('img');
    copy.src = img?.src ?? '';
    copy.alt = '';
    ghost = copy;
    Object.assign(copy.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: `${r.width}px`,
      height: `${r.height}px`,
      zIndex: '9000',
      pointerEvents: 'none',
      borderRadius: '4px',
      boxShadow: '0 14px 28px rgba(0,0,0,0.35), 0 6px 10px rgba(0,0,0,0.25)',
      willChange: 'transform',
    });
    document.body.appendChild(copy);
    document.body.classList.add('card-dragging');
    window.addEventListener('keydown', onKey);
    document.addEventListener('touchmove', blockScroll, { passive: false });
    document.addEventListener('contextmenu', blockMenu);
    pos = { x, y };
    vx = 0;
    tilt = 0;
    place();
    raf = requestAnimationFrame(frame);
  }

  function place() {
    if (!ghost) return;
    const rot = reducedMotion() ? 0 : tilt;
    ghost.style.transform = `translate(${pos.x - grab.dx}px, ${pos.y - grab.dy}px) rotate(${rot}deg) scale(1.05)`;
  }

  /** Each frame: tilt toward the movement and settle straight, scroll near an edge. */
  function frame() {
    vx *= 0.8;
    tilt += (Math.max(-8, Math.min(8, vx * 0.6)) - tilt) * 0.25;
    autoScroll();
    place();
    raf = requestAnimationFrame(frame);
  }

  function scroller(): Element {
    for (let el = cards()[0]?.parentElement; el; el = el.parentElement) {
      const s = getComputedStyle(el).overflowY;
      if ((s === 'auto' || s === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    }
    return document.scrollingElement ?? document.documentElement;
  }

  function autoScroll() {
    const s = scroller();
    const isPage = s === document.scrollingElement;
    const r = isPage ? { top: 0, bottom: window.innerHeight } : s.getBoundingClientRect();
    const up = pos.y - r.top < EDGE;
    const down = r.bottom - pos.y < EDGE;
    if (!up && !down) return;
    const depth = up ? EDGE - (pos.y - r.top) : EDGE - (r.bottom - pos.y);
    const step = Math.min(24, Math.max(4, depth / 3)) * (up ? -1 : 1);
    const before = s.scrollTop;
    s.scrollTop += step;
    if (s.scrollTop !== before) track();
  }

  function track() {
    const g = gapAt(
      cards().map((c) => c.getBoundingClientRect()),
      pos.x,
      pos.y,
    );
    const f = from.value!;
    gap.value = g === null || g === f || g === f + 1 ? null : g;
  }

  function onMove(e: PointerEvent) {
    if (!pending || e.pointerId !== pending.id) return;
    if (from.value === null) {
      const far = Math.hypot(e.clientX - pending.x, e.clientY - pending.y) > SLOP;
      if (!far) return;
      // Touch: moving before the long press is a scroll. Mouse and pen: a drag.
      if (e.pointerType === 'touch') return cancel();
      start(e.clientX, e.clientY);
    }
    vx = vx * 0.5 + (e.clientX - pos.x) * 0.5;
    pos = { x: e.clientX, y: e.clientY };
    track();
  }

  function onUp(e: PointerEvent) {
    if (!pending || e.pointerId !== pending.id) return;
    if (from.value === null) return cancel();
    // A drag isn't a tap: the card's own click (open) is skipped once.
    suppressClick = true;
    window.addEventListener('click', eatClick, { capture: true, once: true });
    setTimeout(() => (suppressClick = false), 0);
    const [f, g] = [from.value, gap.value];
    if (g === null) return finish(f, () => cards()[f]);
    o.move(f, g);
    void nextTick(() => finish(null, () => cards()[g > f ? g - 1 : g]));
  }

  function eatClick(e: Event) {
    if (!suppressClick) return;
    e.stopPropagation();
    e.preventDefault();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    const f = from.value;
    if (f !== null) finish(f, () => cards()[f]);
  }

  const blockScroll = (e: TouchEvent) => e.cancelable && e.preventDefault();
  const blockMenu = (e: Event) => e.preventDefault();

  /** The copy slides to `to` (its landing place, or back to the card), then everything resets. */
  function finish(keepFaded: number | null, to: () => Element | null | undefined) {
    const g = ghost;
    stop();
    from.value = keepFaded;
    gap.value = null;
    const target = (to()?.querySelector('img') ?? to())?.getBoundingClientRect();
    if (!g) return;
    if (!target || reducedMotion()) {
      g.remove();
      from.value = null;
      return;
    }
    g.style.transition = 'transform 180ms ease-out';
    g.style.transform = `translate(${target.left}px, ${target.top}px) rotate(0deg) scale(1)`;
    setTimeout(() => {
      g.remove();
      from.value = null;
    }, 190);
  }

  function stop() {
    if (pending) clearTimeout(pending.timer);
    pending = null;
    ghost = null;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('touchmove', blockScroll);
    document.removeEventListener('contextmenu', blockMenu);
    document.body.classList.remove('card-dragging');
  }

  function cancel() {
    const f = from.value;
    if (f !== null && ghost) return finish(f, () => cards()[f]);
    stop();
    from.value = gap.value = null;
  }

  onBeforeUnmount(() => {
    ghost?.remove();
    stop();
  });

  /** The glow: the card left of the landing gap glows on its right edge, the one right of it on its left. */
  const glow = (i: number) =>
    gap.value === null
      ? null
      : i === gap.value - 1
        ? 'glow-right'
        : i === gap.value
          ? 'glow-left'
          : null;

  return { from, gap, onDown, glow };
}
