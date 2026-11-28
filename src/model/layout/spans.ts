// Spanning blocks (spec 057): one block set over a group of neighboring block spaces that is the
// space's own shape scaled up k times (k × k squares or rectangles, a triangle of k² triangles,
// a diamond of k × k diamonds). Stored on the group's first space, the one in the corner it grows
// from (`SlotContent.span = k`); the layout then shows that space grown and the rest gone, with
// any sashing and cornerstones inside it.
import type { SlotContent } from '../schema/quilt';
import { apply, invert, type M } from '../geometry/affine';
import { pointInPolygon, signedArea, type Pt } from '../geometry/path';
import { SHAPE_AREA, SHAPE_OUTLINE } from '../blocks/shape';
import { clipPolygon, toPath } from './clip';
import type { Bounds, Slot } from './slots';

/** The largest span offered (8U). */
export const MAX_SPAN = 8;

export interface Span {
  /** The space it's stored on (in the corner it grows from). */
  at: string;
  k: number;
  /** The grown space, under the first space's id. */
  slot: Slot;
  /** Every space it covers, `at` included, and the sashing and cornerstones inside it. */
  covers: string[];
  /** The block spaces it covers (k² of them). */
  cells: string[];
}

const SPANNING: Record<string, number> = {
  rect: 1,
  triangle: SHAPE_AREA.triangle,
  diamond60: SHAPE_AREA.diamond60,
};
/** Each shape's whole outline in the space's unit square. */
const UNIT: Record<string, Pt[]> = {
  rect: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  triangle: SHAPE_OUTLINE.triangle,
  diamond60: SHAPE_OUTLINE.diamond60,
};
/** The corner a span grows from, in the space's unit square. */
const PIVOT: Record<string, Pt> = { rect: [0, 0], triangle: [0.5, 0], diamond60: [0.5, 0] };

const corners = (s: Slot): Pt[] | null => {
  const pts: Pt[] = [];
  for (const c of s.outline) {
    if (c[0] === 'M' || c[0] === 'L') pts.push([c[1], c[2]]);
    else if (c[0] !== 'Z') return null;
  }
  return pts.length >= 3 ? pts : null;
};
const area = (p: Pt[]) => Math.abs(signedArea(p));
const mid = (p: Pt[]): Pt => [
  p.reduce((s, q) => s + q[0], 0) / p.length,
  p.reduce((s, q) => s + q[1], 0) / p.length,
];
const det = (t: M) => Math.abs(t[0] * t[3] - t[1] * t[2]);
const sameAxes = (a: M, b: M) =>
  a.slice(0, 4).every((v, i) => Math.abs(v - b[i]!) < 1e-6 * det(a) ** 0.5);

/** Same axes, or the same turned half a turn (the same diamond). */
const alongside = (a: M, b: M) =>
  sameAxes(a, b) || sameAxes(a, [-b[0], -b[1], -b[2], -b[3], b[4], b[5]]);

/** A block space of a shape that can span, whole or trimmed at the quilt's edge (owner,
 *  2026-11-28: a span's first space may be a trimmed one). */
export function spannable(s: Slot): boolean {
  const share = SPANNING[s.shape];
  const pts = share !== undefined && s.kind === 'block' ? corners(s) : null;
  return (
    !!pts &&
    area(pts) > 1e-6 * det(s.transform) &&
    area(pts) <= det(s.transform) * share! * (1 + 1e-6)
  );
}

/** Facts about one layout's spaces, worked out once: centers, and the step between rectangles
 *  (a block's width plus the sashing beside it), per space. */
export interface SpanIndex {
  slots: readonly Slot[];
  mids: Map<string, Pt>;
  areas: Map<string, number>;
  byId: Map<string, Slot>;
  /** The quilt's center (without borders), where block spaces are trimmed: a span is cut to it. */
  clip?: Bounds;
}

const indexes = new WeakMap<readonly Slot[], SpanIndex>();
export function spanIndex(slots: readonly Slot[], clip?: Bounds): SpanIndex {
  let ix = indexes.get(slots);
  if (ix) {
    if (clip && !ix.clip) ix.clip = clip;
    return ix;
  }
  const mids = new Map<string, Pt>();
  const areas = new Map<string, number>();
  for (const s of slots) {
    const pts = corners(s);
    if (!pts) continue;
    mids.set(s.id, mid(pts));
    areas.set(s.id, area(pts));
  }
  ix = {
    slots,
    mids,
    areas,
    byId: new Map(slots.map((s) => [s.id, s])),
    ...(clip ? { clip } : {}),
  };
  indexes.set(slots, ix);
  return ix;
}

/** How far the next space along each of a rectangle's axes starts, in its own widths (1 with no
 *  sashing, (width + sash) / width with it). Shaped spaces have no sashing: 1. */
function steps(ix: SpanIndex, at: Slot): [number, number] {
  if (at.shape !== 'rect') return [1, 1];
  const inv = invert(at.transform);
  let su = Infinity;
  let sv = Infinity;
  for (const s of ix.slots) {
    if (s === at || s.kind !== 'block' || !sameAxes(s.transform, at.transform)) continue;
    const [u, v] = apply(inv, [s.transform[4], s.transform[5]]);
    if (Math.abs(v) < 1e-6 && u > 1 - 1e-6) su = Math.min(su, u);
    if (Math.abs(u) < 1e-6 && v > 1 - 1e-6) sv = Math.min(sv, v);
  }
  return [Number.isFinite(su) ? su : 1, Number.isFinite(sv) ? sv : 1];
}

/** The kU span stored on space `at`, if the spaces there make one: k² spaces of its shape, plus
 *  sashing and cornerstones, tiling it with nothing else inside. Where the quilt's edge trims its
 *  spaces it is cut to the edge too, like a trimmed space. */
export function spanOf(ix: SpanIndex, at: Slot, k: number): Span | null {
  if (!Number.isInteger(k) || k < 2 || k > MAX_SPAN || !spannable(at)) return null;
  const [su, sv] = steps(ix, at);
  const [a, b, c, d] = at.transform;
  const ku = (k - 1) * su + 1;
  const kv = (k - 1) * sv + 1;
  // Grown from one of its own corners (a rectangle's first, a triangle's or diamond's tip), so the
  // first space stays in that corner of the span.
  const [px, py] = apply(at.transform, PIVOT[at.shape]!);
  const t: M = [
    a * ku,
    b * ku,
    c * kv,
    d * kv,
    px - (px - at.transform[4]) * ku,
    py - (py - at.transform[5]) * kv,
  ];
  const poly = UNIT[at.shape]!.map((p) => apply(t, p));
  const vis = ix.clip ? clipPolygon(poly, ix.clip) : poly;
  if (vis.length < 3) return null;
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const covers: string[] = [];
  const cells: string[] = [];
  let sum = 0;
  for (const s of ix.slots) {
    const m = ix.mids.get(s.id);
    if (!m || m[0] < x0 || m[0] > x1 || m[1] < y0 || m[1] > y1 || !pointInPolygon(m, poly))
      continue;
    if (s.kind === 'block') {
      if (s.shape !== at.shape || !spannable(s)) return null;
      // A big diamond is made of diamonds lying its way (Baby Blocks' cube faces turn three ways:
      // owner, 2026-11-28). Triangles mix up and down ones, as a big triangle does.
      if (at.shape === 'diamond60' && !alongside(s.transform, at.transform)) return null;
      cells.push(s.id);
    } else if (s.kind !== 'sash' && s.kind !== 'cs') return null;
    covers.push(s.id);
    sum += ix.areas.get(s.id)!;
  }
  const whole = area(poly);
  const seen = area(vis);
  // All k² spaces, some of them trimmed where the quilt's edge cuts it.
  if (cells.length !== k * k || !cells.includes(at.id) || Math.abs(sum - seen) > 1e-6 * whole)
    return null;
  const slot: Slot = {
    ...at,
    outline: toPath(vis),
    transform: t,
    size: [at.size[0] * ku, at.size[1] * kv],
  };
  return { at: at.id, k, slot, covers, cells };
}

/** The spans set on a quilt that still fit its layout, first placed first; a span overlapping an
 *  earlier one is left out. */
export function spansIn(
  slots: readonly Slot[],
  content: Record<string, SlotContent>,
  clip?: Bounds,
): Span[] {
  const ix = spanIndex(slots, clip);
  const taken = new Set<string>();
  const out: Span[] = [];
  for (const [id, c] of Object.entries(content)) {
    if (!c.span || c.span < 2) continue;
    const at = ix.byId.get(id);
    const sp = at && spanOf(ix, at, c.span);
    if (!sp || sp.covers.some((x) => taken.has(x))) continue;
    for (const x of sp.covers) taken.add(x);
    out.push(sp);
  }
  return out;
}

/** The quilt's spaces with its spans merged in: each span's first space grown, the rest gone. */
export function withSpans(slots: Slot[], spans: readonly Span[]): Slot[] {
  if (!spans.length) return slots;
  const grown = new Map(spans.map((s) => [s.at, s.slot]));
  const gone = new Set(spans.flatMap((s) => s.covers));
  return slots.flatMap((s) => (grown.has(s.id) ? [grown.get(s.id)!] : gone.has(s.id) ? [] : [s]));
}

/** The largest k with a span anywhere in these spaces (1 when none can span). */
export function maxSpan(slots: readonly Slot[]): number {
  const ix = spanIndex(slots);
  const firsts = slots.filter(spannable);
  let k = 1;
  while (k < MAX_SPAN && firsts.some((s) => spanOf(ix, s, k + 1))) k++;
  return k;
}

/** Every kU span covering block space `cell` (k = 1: the space itself). */
export function spansOver(ix: SpanIndex, cell: string, k: number): Span[] {
  const s = ix.byId.get(cell);
  if (!s) return [];
  if (k === 1) return [{ at: cell, k: 1, slot: s, covers: [cell], cells: [cell] }];
  const m = ix.mids.get(cell);
  if (!m) return [];
  // Only spaces near enough to be its first space: within k space-widths.
  const reach = k * Math.sqrt(det(s.transform)) * 2;
  const out: Span[] = [];
  for (const at of ix.slots) {
    const am = ix.mids.get(at.id);
    if (!am || Math.hypot(am[0] - m[0], am[1] - m[1]) > reach || !spannable(at)) continue;
    const sp = spanOf(ix, at, k);
    if (sp?.cells.includes(cell)) out.push(sp);
  }
  return out;
}

/** The kU span nearest a point on block space `cell`, among those covering it (that pass `ok`). */
export function spanNear(
  ix: SpanIndex,
  cell: string,
  k: number,
  p?: Pt,
  ok: (s: Span) => boolean = () => true,
): Span | null {
  const all = spansOver(ix, cell, k).filter(ok);
  const to = p ?? ix.mids.get(cell)!;
  const d = (s: Span) => {
    const m = mid(corners(s.slot)!);
    return Math.hypot(m[0] - to[0], m[1] - to[1]);
  };
  return all.reduce<Span | null>((best, s) => (!best || d(s) < d(best) ? s : best), null);
}

/** A drag from space `from` to `to`: the smallest span holding both (that passes `ok`), `from`
 *  nearest its corner (the space pressed stays a corner as the block grows). */
export function spanGrow(
  ix: SpanIndex,
  from: string,
  to: string,
  maxK = MAX_SPAN,
  ok: (s: Span) => boolean = () => true,
): Span | null {
  const start = ix.mids.get(from);
  if (!start) return null;
  for (let k = 1; k <= maxK; k++) {
    const fit = spansOver(ix, from, k).filter((s) => s.cells.includes(to) && ok(s));
    if (!fit.length) continue;
    const corner = (s: Span) =>
      Math.min(...corners(s.slot)!.map((v) => Math.hypot(v[0] - start[0], v[1] - start[1])));
    return fit.sort((a, b) => corner(a) - corner(b))[0]!;
  }
  return null;
}

/** The span among `spans` whose block covers point p (its sashing inside too), if any. */
export function spanAt(spans: readonly Span[] | undefined, p: Pt): Span | null {
  return spans?.find((s) => pointInPolygon(p, corners(s.slot)!)) ?? null;
}

/** The block space that can span under point p (spaces before spans merge), if any. */
export function cellAt(ix: SpanIndex, p: Pt): string | null {
  for (const s of ix.slots) {
    if (!spannable(s)) continue;
    const pts = corners(s)!;
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    if (p[0] < Math.min(...xs) || p[0] > Math.max(...xs)) continue;
    if (p[1] < Math.min(...ys) || p[1] > Math.max(...ys)) continue;
    if (pointInPolygon(p, pts)) return s.id;
  }
  return null;
}
