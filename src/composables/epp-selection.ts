// EPP multi-select (spec 051; owner, 2026-11-12), shared by the rosette editor and an EPP quilt's
// Design tab: the Select tool picks and unpicks pieces by tapping and by a box dragged from empty
// space, and a drag from a piece moves them all (snapping by their outside edges). The rail's own
// buttons, the sidebar's Scale and Duplicate act on the selection through `turn`, `flip`, `remove`,
// `scaleTo` and `duplicate`.
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { Decor } from '@/components/EppCanvas.vue';
import type { SessionRestore } from '@/editor/undo';
import { bbox, type Edge, type Poly } from '@/model/epp/geometry';
import {
  boxPick,
  centre,
  DUPLICATE_ID,
  middle,
  moveGroup,
  movePose,
  scaleOf,
  scaleTo as scaleFactor,
  snapGroup,
  type Clip,
  type Placed,
} from '@/model/epp/selection';
import { landsOver, nextTurn, snap, staticEdges } from '@/model/epp/snap';
import type { Pt } from '@/model/geometry/path';
import { useEppEditorStore } from '@/stores/epp-editor';

export type ItemsFn = <T extends Placed>(items: readonly T[]) => T[];

export interface SelectionHost {
  items: () => readonly Placed[];
  /** Drawn polygons in order, each with the item it belongs to. */
  leaves: () => readonly { item: string; poly: Poly }[];
  /** One undo step per call (or per `coalesce` key, for drags). */
  update: (fn: ItemsFn, coalesce?: string) => void;
  /** CSS pixels → units. */
  px: (n: number) => number;
  /** Corners of an item's shape: a free turn is 360° / that. */
  sides: (id: string) => number;
  gridStep: () => number;
  /** The Design view is showing and editable. */
  active: () => boolean;
  remove: (ids: ReadonlySet<string>) => void;
  copy: (ids: ReadonlySet<string>, centre: Pt) => Clip;
  /** After Duplicate: the page goes to placing it. */
  duplicated: () => void;
}

const RAD = Math.PI / 180;
const SNAP_SHARE = 0.5;
const DRAG_TURN = Math.PI / 6;

type Drag =
  | {
      kind: 'move';
      grab: Pt;
      key: string;
      from: Map<string, Placed>;
      moving: Poly[];
      statics: Poly[];
      others: ReturnType<typeof staticEdges>;
    }
  | { kind: 'box'; a: Pt; b: Pt; touched: boolean; base: ReadonlySet<string> };

export function useEppSelection(h: SelectionHost) {
  const epp = useEppEditorStore();
  const $q = useQuasar();

  const set = (next: Iterable<string>) => (epp.selection = new Set(next));
  const has = (id: string) => epp.selection.has(id);
  const clear = () => set([]);
  const toggle = (id: string) => {
    const s = new Set(epp.selection);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    set(s);
  };

  // Each editor starts with nothing picked; pieces that go (deleted, undone) leave the selection.
  set([]);
  onBeforeUnmount(() => set([]));
  watch(h.items, (items) => {
    const live = new Set(items.map((p) => p.id));
    if ([...epp.selection].some((i) => !live.has(i)))
      set([...epp.selection].filter((i) => live.has(i)));
  });

  /** For an edit's undo step: undo brings back the selection from before it, redo the one after. */
  function session(): SessionRestore {
    const before = epp.selection;
    let after = before;
    return {
      undo: () => {
        after = epp.selection;
        epp.selection = before;
      },
      redo: () => void (epp.selection = after),
    };
  }

  const polysOf = (inSel: boolean) =>
    h
      .leaves()
      .filter((l) => has(l.item) === inSel)
      .map((l) => l.poly);
  const pivot = () => middle(polysOf(true));

  /** A tap with the Select tool: a piece joins or leaves; empty space clears. */
  const pick = (item: string | null) => (item ? toggle(item) : clear());
  const all = () => set(h.items().map((p) => p.id));

  // --- Acting on the selection, one undo step each ---
  function turn() {
    const sel = epp.selection;
    if (!sel.size) return;
    // Snapped: to the next edge that fits the same neighbor, as one piece turns.
    const along = nextTurn(polysOf(true), staticEdges(polysOf(false)));
    if (along) return h.update((xs) => snapGroup(xs, sel, along));
    const c = pivot();
    const step = 360 / h.sides([...sel][0]!);
    h.update((xs) => moveGroup(xs, sel, { pivot: c, turn: step }));
  }
  function flip(axis: 'x' | 'y') {
    const sel = epp.selection;
    if (!sel.size) return;
    const c = pivot();
    h.update((xs) => moveGroup(xs, sel, { pivot: c, flip: axis }));
  }
  /** The sidebar's Scale with a selection: the smallest piece's scale. */
  const size = computed(() => scaleOf(h.items(), epp.selection));
  function scaleTo(v: number) {
    const sel = epp.selection;
    const k = scaleFactor(h.items(), sel, v);
    if (k === null)
      return void $q.notify({
        message: 'The selected pieces can’t all take that size (sizes are whole, 1 to 4).',
        timeout: 2000,
      });
    if (k === 1) return;
    const c = pivot();
    h.update((xs) => moveGroup(xs, sel, { pivot: c, scale: k }), 'epp-selection-scale');
  }
  function nudge(dx: number, dy: number) {
    const sel = epp.selection;
    h.update((xs) => moveGroup(xs, sel, { move: [dx, dy] }));
  }
  function remove() {
    h.remove(epp.selection);
    clear();
  }
  /** The selection as the picker's temporary rosette (replacing the last one), picked to place. */
  function duplicate() {
    if (!epp.selection.size) return;
    epp.clip = h.copy(epp.selection, centre(polysOf(true)));
    epp.picked = DUPLICATE_ID;
    h.duplicated();
  }

  // --- Drags with the Select tool: from a piece the selection moves, from empty space a box ---
  const drag = shallowRef<Drag | null>(null);
  const snapTarget = ref<Edge | null>(null);
  function startMove(p: Pt, item: string) {
    if (!has(item)) toggle(item);
    const sel = epp.selection;
    const statics = polysOf(false);
    drag.value = {
      kind: 'move',
      grab: p,
      key: `epp-group-${Date.now()}`,
      from: new Map(h.items().flatMap((x) => (sel.has(x.id) ? [[x.id, x]] : []))),
      moving: polysOf(true),
      statics,
      others: staticEdges(statics),
    };
  }
  /** The box adds what it picks (Alt: every piece it touches, not only those wholly inside). */
  function startBox(p: Pt, e: { altKey?: boolean }) {
    drag.value = { kind: 'box', a: p, b: p, touched: !!e.altKey, base: epp.selection };
  }
  function boxPicks(d: Extract<Drag, { kind: 'box' }>) {
    const leaves = h.leaves();
    const box: [number, number, number, number] = [
      Math.min(d.a[0], d.b[0]),
      Math.min(d.a[1], d.b[1]),
      Math.max(d.a[0], d.b[0]),
      Math.max(d.a[1], d.b[1]),
    ];
    const hit = new Set(
      boxPick(
        leaves.map((l) => l.poly),
        box,
        d.touched,
      ),
    );
    // A placed rosette is one piece: wholly inside means all its pieces, touched means any.
    const verdict = new Map<string, boolean>();
    leaves.forEach((l, i) => {
      const was = verdict.get(l.item);
      const now = hit.has(i);
      verdict.set(l.item, was === undefined ? now : d.touched ? was || now : was && now);
    });
    set([...d.base, ...[...verdict].flatMap(([id, ok]) => (ok ? [id] : []))]);
  }
  /** True when the drag was the selection's. */
  function onDrag(p: Pt): boolean {
    const d = drag.value;
    if (!d) return false;
    if (d.kind === 'box') {
      drag.value = { ...d, b: p };
      boxPicks(drag.value);
      return true;
    }
    const dm: Pt = [p[0] - d.grab[0], p[1] - d.grab[1]];
    const moved = d.moving.map((poly) => poly.map(([x, y]): Pt => [x + dm[0], y + dm[1]]));
    // As a rosette: by its outside edges, never landing over the other pieces.
    const s = snap(moved, d.others, h.px(16), DRAG_TURN, SNAP_SHARE, landsOver(moved, d.statics));
    snapTarget.value = s?.target ?? null;
    h.update(
      (xs) =>
        xs.map((x) => {
          const f = d.from.get(x.id) as typeof x | undefined;
          if (!f) return x;
          const t = movePose(f, { move: dm });
          return s ? movePose(t, { turn: s.rot / RAD, move: s.move }) : t;
        }),
      d.key,
    );
    return true;
  }
  function onDragEnd(): boolean {
    const was = drag.value;
    drag.value = null;
    snapTarget.value = null;
    return !!was;
  }

  /** The box being dragged, the outline round the selection, the edge it snaps to. */
  function decorate({ ctx, px }: Decor) {
    const d = drag.value;
    ctx.save();
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = px(1.5);
    ctx.setLineDash([px(6), px(4)]);
    if (d?.kind === 'box') {
      const [x, y] = [Math.min(d.a[0], d.b[0]), Math.min(d.a[1], d.b[1])];
      const [w, hh] = [Math.abs(d.b[0] - d.a[0]), Math.abs(d.b[1] - d.a[1])];
      ctx.fillStyle = 'rgba(25, 118, 210, 0.08)';
      ctx.fillRect(x, y, w, hh);
      ctx.strokeRect(x, y, w, hh);
    }
    const sel = polysOf(true);
    if (sel.length > 1) {
      const [x0, y0, x1, y1] = bbox(sel);
      const pad = px(6);
      ctx.strokeRect(x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad);
    }
    ctx.restore();
    const e = snapTarget.value;
    if (e) {
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = px(4);
      ctx.beginPath();
      ctx.moveTo(e[0][0], e[0][1]);
      ctx.lineTo(e[1][0], e[1][1]);
      ctx.stroke();
    }
  }

  // --- Keys ---
  const ARROWS: Record<string, Pt> = {
    arrowleft: [-1, 0],
    arrowright: [1, 0],
    arrowup: [0, -1],
    arrowdown: [0, 1],
  };
  function onKey(e: KeyboardEvent) {
    if (!h.active()) return;
    if ((e.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]'))
      return;
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      if (drag.value?.kind === 'box') drag.value = null;
      return clear();
    }
    if (mod && k === 'a') return void (e.preventDefault(), all());
    if (!epp.selection.size) return;
    if (mod && k === 'd') return void (e.preventDefault(), duplicate());
    if (k === 'delete' || k === 'backspace') return void (e.preventDefault(), remove());
    const a = ARROWS[k];
    if (a && !mod) {
      e.preventDefault();
      const s = e.shiftKey ? h.gridStep() : 1;
      nudge(a[0] * s, a[1] * s);
    }
  }
  onMounted(() => window.addEventListener('keydown', onKey));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

  return {
    session,
    has,
    pick,
    clear,
    turn,
    flip,
    size,
    scaleTo,
    remove,
    duplicate,
    startMove,
    startBox,
    onDrag,
    onDragEnd,
    decorate,
  };
}
