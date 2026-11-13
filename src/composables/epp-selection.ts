// EPP multi-select (spec 051), shared by the rosette editor and an EPP quilt's Design tab: picking
// (tap, Shift/Ctrl tap, box, press and hold then taps, Select all, Select same), the selection moved,
// turned, mirrored, scaled and nudged as one (snapping by its outside edges), the outline round it,
// and the keys. The page supplies its pieces and the edits that need its own model.
import { useQuasar } from 'quasar';
import type { SessionRestore } from '@/editor/undo';
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { Decor } from '@/components/EppCanvas.vue';
import { bbox, type Edge, type Poly } from '@/model/epp/geometry';
import {
  boxPick,
  middle,
  moveGroup,
  movePose,
  scaleStep,
  snapGroup,
  toBack,
  toFront,
  type Clip,
  type Placed,
} from '@/model/epp/selection';
import { landsOver, nextTurn, snap, staticEdges } from '@/model/epp/snap';
import type { Pt } from '@/model/geometry/path';
import type { Fill } from '@/model/schema/coloring';
import { useEppEditorStore } from '@/stores/epp-editor';

export type ItemsFn = <T extends Placed>(items: readonly T[]) => T[];

export interface SelectionHost {
  items: () => readonly Placed[];
  /** Drawn polygons in order, each with the item it belongs to and its fill. */
  leaves: () => readonly { item: string; poly: Poly; fill?: Fill | undefined }[];
  /** One undo step per call (or per `coalesce` key, for drags). */
  update: (fn: ItemsFn, coalesce?: string) => void;
  /** CSS pixels → units. */
  px: (n: number) => number;
  /** What an item is (its shape or rosette), for Select same. */
  kindOf: (id: string) => string | undefined;
  /** Corners of an item's shape: a free turn is 360° / that. */
  sides: (id: string) => number;
  gridStep: () => number;
  /** The Design view is showing and editable. */
  active: () => boolean;
  hover: () => Pt | null;
  remove: (ids: ReadonlySet<string>) => void;
  copy: (ids: ReadonlySet<string>, mid: Pt) => Clip;
  /** Pastes and returns the new pieces' ids (selected next). */
  paste: (clip: Clip, at: Pt) => string[];
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

type Mods = { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean };

export function useEppSelection(h: SelectionHost) {
  const epp = useEppEditorStore();
  const $q = useQuasar();
  /** Touch: after press and hold, taps add or remove pieces until Done. */
  const adding = ref(false);
  /** The piece picked last (Select same goes by it). */
  let last: string | null = null;

  const set = (next: Iterable<string>) => (epp.selection = new Set(next));
  const has = (id: string) => epp.selection.has(id);
  const clear = () => {
    set([]);
    adding.value = false;
  };
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

  const polysOf = (inSel: boolean) =>
    h
      .leaves()
      .filter((l) => has(l.item) === inSel)
      .map((l) => l.poly);
  const pivot = () => middle(polysOf(true));

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

  // --- Picking ---
  function pick(item: string | null, e?: Mods) {
    const more = adding.value || e?.shiftKey || e?.ctrlKey || e?.metaKey;
    if (!item) return void (more || clear());
    last = item;
    if (more) toggle(item);
    else set([item]);
  }
  /** Press and hold on a piece: multi-select starts with it. */
  function hold(item: string | null) {
    if (!item) return;
    adding.value = true;
    last = item;
    if (!has(item)) toggle(item);
  }
  const all = () => set(h.items().map((p) => p.id));
  function same(by: 'shape' | 'fill') {
    const anchor = last && has(last) ? last : [...epp.selection][0];
    if (!anchor) return;
    if (by === 'shape') {
      const k = h.kindOf(anchor);
      return set(h.items().flatMap((p) => (h.kindOf(p.id) === k ? [p.id] : [])));
    }
    const key = (f: Fill | undefined) => JSON.stringify(f ?? null);
    const want = key(h.leaves().find((l) => l.item === anchor)?.fill);
    set(new Set(h.leaves().flatMap((l) => (key(l.fill) === want ? [l.item] : []))));
  }

  // --- Actions, one undo step each ---
  function turn() {
    const sel = epp.selection;
    if (!sel.size) return;
    // Snapped: to the next edge that fits the same neighbor, as one piece turns.
    const along = nextTurn(polysOf(true), staticEdges(polysOf(false)));
    if (along) return h.update((xs) => snapGroup(xs, sel, along));
    const c = pivot();
    const step = 360 / h.sides(last && sel.has(last) ? last : [...sel][0]!);
    h.update((xs) => moveGroup(xs, sel, { pivot: c, turn: step }));
  }
  function flip(axis: 'x' | 'y') {
    const sel = epp.selection;
    if (!sel.size) return;
    const c = pivot();
    h.update((xs) => moveGroup(xs, sel, { pivot: c, flip: axis }));
  }
  function resize(dir: 1 | -1) {
    const sel = epp.selection;
    const k = scaleStep(h.items(), sel, dir);
    if (k === null)
      return void $q.notify({
        message: `The pieces can’t all go a size ${dir > 0 ? 'bigger' : 'smaller'} (sizes are whole, 1 to 4).`,
        timeout: 2000,
      });
    const c = pivot();
    h.update((xs) => moveGroup(xs, sel, { pivot: c, scale: k }));
  }
  function nudge(dx: number, dy: number) {
    const sel = epp.selection;
    h.update((xs) => moveGroup(xs, sel, { move: [dx, dy] }));
  }
  const front = () => h.update((xs) => toFront(xs, epp.selection));
  const back = () => h.update((xs) => toBack(xs, epp.selection));
  function remove() {
    h.remove(epp.selection);
    clear();
  }
  function copy() {
    const n = epp.selection.size;
    if (!n) return;
    epp.clip = h.copy(epp.selection, pivot());
    $q.notify({ message: `Copied ${n} ${n === 1 ? 'piece' : 'pieces'}.`, timeout: 1000 });
  }
  function paste() {
    const clip = epp.clip;
    if (!clip) return;
    const at = h.hover() ?? [clip.middle[0] + 1, clip.middle[1] + 1];
    set(h.paste(clip, at));
  }
  /** A copy beside the selection, selected (the clipboard keeps what it had). */
  function duplicate() {
    if (!epp.selection.size) return;
    const c = pivot();
    set(h.paste(h.copy(epp.selection, c), [c[0] + 1, c[1] + 1]));
  }

  // --- Drags: the selection moved, or a box drawn ---
  const drag = shallowRef<Drag | null>(null);
  const snapTarget = ref<Edge | null>(null);
  /** A drag from a piece moves the selection (the piece first joins it, or replaces it). */
  function startMove(p: Pt, item: string, e: Mods) {
    if (!has(item)) pick(item, e);
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
  function startBox(p: Pt, e: Mods & { altKey?: boolean }) {
    const more = adding.value || e.shiftKey || e.ctrlKey || e.metaKey;
    drag.value = {
      kind: 'box',
      a: p,
      b: p,
      touched: !!e.altKey,
      base: more ? epp.selection : new Set(),
    };
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
    if (mod && k === 'v' && epp.clip) return void (e.preventDefault(), paste());
    if (!epp.selection.size) return;
    if (mod && k === 'c') return void (e.preventDefault(), copy());
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
    adding,
    has,
    pick,
    hold,
    all,
    clear,
    same,
    turn,
    flip,
    resize,
    front,
    back,
    remove,
    copy,
    paste,
    duplicate,
    startMove,
    startBox,
    onDrag,
    onDragEnd,
    decorate,
    dragging: () => !!drag.value,
  };
}
