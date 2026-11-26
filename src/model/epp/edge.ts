// An EPP quilt's edge (spec 027 FR-001a): No trimming, Cut to size (a rectangle) or Auto-close
// (closing pieces fill the notches up to the rectangle round the pieces). Units throughout.
import { arrange, type InputSeg } from '../geometry/arrangement';
import { pointInPolygon, type Pt } from '../geometry/path';
import { interiorPoint } from '../blocks/remap';
import { simplify } from '../print/polygon';
import { newId } from '../ids';
import type { InternalShape } from '../schema/epp';
import { nonWholeEdges } from './checks';
import { bbox, orient, outerEdges, type Poly } from './geometry';

export type Box = [number, number, number, number];
const EPS = 1e-6;

/**
 * The largest axis-aligned rectangle the pieces cover with no gaps: the starting Cut to size.
 * Found on a grid of `step` units (a cell counts only when the pieces hold it, so the rectangle
 * never reaches past them), then each side pushed out to where the pieces end. Fast enough to
 * follow every edit (about 30 ms for 900 pieces).
 * shortcut: a cell is tested along three lines (top, middle, bottom), so a gap lying wholly between
 * them is missed; fine for EPP pieces, whose gaps run between corners across a cell.
 */
export function cutRect(polys: readonly Poly[], step = 0.25): Box | null {
  if (!polys.length) return null;
  const [x0, y0, x1, y1] = bbox(polys);
  const cols = Math.max(1, Math.round((x1 - x0) / step));
  const rows = Math.max(1, Math.round((y1 - y0) / step));
  if (cols * rows > 400_000) return cutRect(polys, step * 2);
  // A cell counts when the pieces hold its top, middle and bottom lines end to end (each grid
  // line's spans found once, from where it crosses the pieces).
  const boxes = polys.map((p) => bbox([p]));
  const lines = Array.from({ length: 2 * rows + 1 }, (_, i) =>
    lineSpans(polys, boxes, false, y0 + (i * step) / 2, x0, x1),
  );
  const cell = (c: number, r: number) => {
    const [a, b] = [x0 + c * step, x0 + (c + 1) * step];
    return [2 * r, 2 * r + 1, 2 * r + 2].every((i) => spansCover(lines[i]!, a, b));
  };
  // Largest rectangle of covered cells: a histogram per row (stack method).
  const h = new Array<number>(cols).fill(0);
  let best: { area: number; box: Box } | null = null;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) h[c] = cell(c, r) ? h[c]! + 1 : 0;
    const stack: number[] = [];
    for (let c = 0; c <= cols; c++) {
      const hc = c < cols ? h[c]! : 0;
      while (stack.length && h[stack.at(-1)!]! >= hc) {
        const top = stack.pop()!;
        const height = h[top]!;
        const left = stack.length ? stack.at(-1)! + 1 : 0;
        const area = height * (c - left);
        if (height && (!best || area > best.area))
          best = {
            area,
            box: [
              x0 + left * step,
              y0 + (r + 1 - height) * step,
              x0 + c * step,
              y0 + (r + 1) * step,
            ],
          };
      }
      stack.push(c);
    }
  }
  return best ? snapCorners(grow(polys, best.box, step), polys.flat(), step) : null;
}

/**
 * The cut's corners snapped to piece corners (owner, 2026-11-10): each side may move to a piece
 * corner within `reach` of one of the cut's own corners, in or out; the box that lands the most of
 * its four corners on piece corners wins, then the one that moves least.
 */
export function snapCorners(box: Box, corners: readonly Pt[], reach: number): Box {
  const [x0, y0, x1, y1] = box;
  const rc: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const near = corners.filter((c) => rc.some((r) => Math.hypot(c[0] - r[0], c[1] - r[1]) <= reach));
  // Each side's choices: where it is, or a near piece corner's x (left, right) or y (top, bottom).
  const opts = (v: number, axis: 0 | 1) => [
    v,
    ...near.map((c) => c[axis]).filter((u) => Math.abs(u - v) <= reach),
  ];
  const on = (p: Pt) => near.some((c) => Math.hypot(c[0] - p[0], c[1] - p[1]) < 1e-6);
  let best = { hits: -1, moved: Infinity, box };
  for (const a of opts(x0, 0))
    for (const b of opts(y0, 1))
      for (const c of opts(x1, 0))
        for (const d of opts(y1, 1)) {
          if (c - a < reach || d - b < reach) continue;
          const pts: Pt[] = [
            [a, b],
            [c, b],
            [c, d],
            [a, d],
          ];
          const hits = pts.filter(on).length;
          const moved = Math.abs(a - x0) + Math.abs(b - y0) + Math.abs(c - x1) + Math.abs(d - y1);
          if (hits > best.hits || (hits === best.hits && moved < best.moved - 1e-9))
            best = { hits, moved, box: [a, b, c, d] };
        }
  return best.box;
}

/**
 * Where the line x = v (`vertical`) or y = v runs inside the pieces between `from` and `to`, as
 * merged spans (a seam between pieces counts): exact, from where it crosses each piece's outline.
 */
function lineSpans(
  polys: readonly Poly[],
  boxes: readonly Box[],
  vertical: boolean,
  v: number,
  from: number,
  to: number,
): [number, number][] {
  const [a, b] = vertical ? [0, 1] : [1, 0];
  const spans: [number, number][] = [];
  polys.forEach((poly, k) => {
    const box = boxes[k]!;
    if (box[a]! > v + EPS || box[a + 2]! < v - EPS || box[b]! > to || box[b + 2]! < from) return;
    const cuts: number[] = [];
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length]!;
      // An edge along the line covers itself; others cut it where they cross (half-open ends).
      if (Math.abs(p[a]! - v) < 1e-9 && Math.abs(q[a]! - v) < 1e-9)
        spans.push([Math.min(p[b]!, q[b]!), Math.max(p[b]!, q[b]!)]);
      else if (p[a]! > v !== q[a]! > v)
        cuts.push(p[b]! + ((v - p[a]!) / (q[a]! - p[a]!)) * (q[b]! - p[b]!));
    });
    cuts.sort((x, y) => x - y);
    for (let i = 0; i + 1 < cuts.length; i += 2) spans.push([cuts[i]!, cuts[i + 1]!]);
  });
  spans.sort((x, y) => x[0] - y[0]);
  const out: [number, number][] = [];
  for (const [lo, hi] of spans) {
    const last = out.at(-1);
    if (last && lo <= last[1] + 1e-7) last[1] = Math.max(last[1], hi);
    else out.push([lo, hi]);
  }
  return out;
}
/** Whether merged `spans` hold all of [from, to]. */
const spansCover = (spans: readonly [number, number][], from: number, to: number) =>
  spans.some(([lo, hi]) => lo <= from + 1e-7 && hi >= to - 1e-7);

/** Each side of a covered box pushed out (up to `reach`) while the pieces still fill it. */
function grow(polys: readonly Poly[], box: Box, reach: number): Box {
  const b: Box = [...box];
  const SAMPLE = 0.01;
  const boxes = polys.map((p) => bbox([p]));
  const corners = polys.flat();
  const sideCovered = (k: number, v: number) => {
    const vertical = k === 0 || k === 2;
    const [from, to] = vertical ? [b[1], b[3]] : [b[0], b[2]];
    return spansCover(lineSpans(polys, boxes, vertical, v, from, to), from, to);
  };
  for (let k = 0; k < 4; k++) {
    const dir = k < 2 ? -1 : 1;
    // Lines out to `reach`, nearest first: every 1/100 U, every piece corner's and halfway between
    // them (what a line covers changes only at a corner's, so a gap however narrow is met).
    const out = (v: number) => (v - box[k]!) * dir;
    const at = [
      ...Array.from({ length: Math.floor(reach / SAMPLE + 1e-9) }, (_, i) => (i + 1) * SAMPLE),
      ...corners.map((c) => out(c[k % 2]!)).filter((d) => d > 0 && d <= reach),
    ].sort((x, y) => x - y);
    const tests = at.flatMap((d, i) => [((at[i - 1] ?? 0) + d) / 2, d]);
    let good = b[k]!;
    let bad: number | null = null;
    for (const d of tests) {
      const v = box[k]! + dir * d;
      if (!sideCovered(k, v)) {
        bad = v;
        break;
      }
      good = v;
    }
    // Then halve the last step to the edge.
    for (let i = 0; bad !== null && i < 20; i++) {
      const m: number = (good + bad) / 2;
      if (sideCovered(k, m)) good = m;
      else bad = m;
    }
    b[k] = good;
  }
  return b;
}

// --- A Manual cut (0.9.3 roadmap): dragged by its sides, corners or middle, snapping. ---

/** What's dragged: a side, a corner (two sides) or the whole cut. */
export type CutHandle = 'l' | 't' | 'r' | 'b' | 'tl' | 'tr' | 'bl' | 'br' | 'move';
/** A line a side can snap to: x = v (or y = v) from `lo` to `hi` along the other axis. */
export interface SnapLine {
  v: number;
  lo: number;
  hi: number;
}
export interface CutSnaps {
  x: SnapLine[];
  y: SnapLine[];
}

/** The lines the cut's sides snap to: through piece corners (`vertex`), along upright and level
 *  piece edges (`edge`). */
export function cutSnaps(polys: readonly Poly[], o: { vertex: boolean; edge: boolean }): CutSnaps {
  const x: SnapLine[] = [];
  const y: SnapLine[] = [];
  for (const poly of polys)
    poly.forEach((p, i) => {
      if (o.vertex) {
        x.push({ v: p[0], lo: p[1], hi: p[1] });
        y.push({ v: p[1], lo: p[0], hi: p[0] });
      }
      const q = poly[(i + 1) % poly.length]!;
      if (!o.edge) return;
      if (Math.abs(p[0] - q[0]) < EPS)
        x.push({ v: p[0], lo: Math.min(p[1], q[1]), hi: Math.max(p[1], q[1]) });
      if (Math.abs(p[1] - q[1]) < EPS)
        y.push({ v: p[1], lo: Math.min(p[0], q[0]), hi: Math.max(p[0], q[0]) });
    });
  return { x, y };
}

/** How far a side at `v`, running from `lo` to `hi`, moves to the nearest line within `reach` that
 *  meets it (null: none in reach). */
function snapBy(v: number, lo: number, hi: number, lines: readonly SnapLine[], reach: number) {
  let best: number | null = null;
  for (const l of lines)
    if (l.hi >= lo - reach && l.lo <= hi + reach && Math.abs(l.v - v) <= reach)
      if (best === null || Math.abs(l.v - v) < Math.abs(best)) best = l.v - v;
  return best;
}
/** The smaller of two snaps (0: neither). */
const nearer = (a: number | null, b: number | null) =>
  a === null ? (b ?? 0) : b === null || Math.abs(a) <= Math.abs(b) ? a : b;

/** The largest box of `ratio` (width : height) inside `b`, about its middle. */
export function fitRatio(b: Box, ratio: readonly [number, number]): Box {
  const [w, h] = [b[2] - b[0], b[3] - b[1]];
  const r = ratio[0] / ratio[1];
  const [fw, fh] = w / h > r ? [h * r, h] : [w, w / r];
  const [cx, cy] = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  return [cx - fw / 2, cy - fh / 2, cx + fw / 2, cy + fh / 2];
}

/**
 * The cut `start` with `handle` dragged by `d` (units): sides snap to `snaps` within `reach`, no
 * side comes nearer its opposite than `min`, and a `ratio` keeps its shape (a side keeps the
 * middle across, a corner its opposite corner). Moving keeps the size, snapping the nearest side.
 */
export function dragCut(
  start: Box,
  handle: CutHandle,
  d: readonly [number, number],
  o: { snaps: CutSnaps; reach: number; min: number; ratio?: readonly [number, number] | undefined },
): Box {
  let [x0, y0, x1, y1] = start;
  if (handle === 'move') {
    [x0, y0, x1, y1] = [x0 + d[0], y0 + d[1], x1 + d[0], y1 + d[1]];
    const { x, y } = o.snaps;
    const ox = nearer(snapBy(x0, y0, y1, x, o.reach), snapBy(x1, y0, y1, x, o.reach));
    const oy = nearer(snapBy(y0, x0, x1, y, o.reach), snapBy(y1, x0, x1, y, o.reach));
    return [x0 + ox, y0 + oy, x1 + ox, y1 + oy];
  }
  const has = (c: string) => handle.includes(c);
  const sx = (v: number) => v + (snapBy(v, y0, y1, o.snaps.x, o.reach) ?? 0);
  const sy = (v: number) => v + (snapBy(v, x0, x1, o.snaps.y, o.reach) ?? 0);
  if (has('l')) x0 = Math.min(sx(x0 + d[0]), x1 - o.min);
  if (has('r')) x1 = Math.max(sx(x1 + d[0]), x0 + o.min);
  if (has('t')) y0 = Math.min(sy(y0 + d[1]), y1 - o.min);
  if (has('b')) y1 = Math.max(sy(y1 + d[1]), y0 + o.min);
  if (!o.ratio) return [x0, y0, x1, y1];
  const r = o.ratio[0] / o.ratio[1];
  let [w, h] = [x1 - x0, y1 - y0];
  if (handle.length === 2) {
    // A corner: the larger of the two sizes asked for, from the corner opposite.
    if (w / h > r) h = w / r;
    else w = h * r;
    return [
      has('l') ? x1 - w : x0,
      has('t') ? y1 - h : y0,
      has('l') ? x1 : x0 + w,
      has('t') ? y1 : y0 + h,
    ];
  }
  if (has('l') || has('r')) {
    const cy = (y0 + y1) / 2;
    return [x0, cy - w / r / 2, x1, cy + w / r / 2];
  }
  const cx = (x0 + x1) / 2;
  return [cx - (h * r) / 2, y0, cx + (h * r) / 2, y1];
}

/**
 * Auto-close: the closing pieces between the pieces' outside edges and the rectangle round them
 * (areas touching the rectangle; holes inside the quilt stay holes). Outlines in units where they
 * sit; edges that aren't whole units are marked (they're made, not chosen).
 */
export function autoClose(polys: readonly Poly[]): InternalShape[] {
  if (!polys.length) return [];
  const [x0, y0, x1, y1] = bbox(polys);
  const corners: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const input: InputSeg[] = [
    ...corners.map((a, i): InputSeg => ({
      id: `r${i}`,
      seg: { kind: 'line', a, b: corners[(i + 1) % 4]! },
      outline: true,
    })),
    ...outerEdges(polys).map(([a, b], i): InputSeg => ({
      id: `e${i}`,
      seg: { kind: 'line', a, b },
    })),
  ];
  const onBox = ([x, y]: Pt) =>
    Math.abs(x - x0) < EPS ||
    Math.abs(x - x1) < EPS ||
    Math.abs(y - y0) < EPS ||
    Math.abs(y - y1) < EPS;
  return arrange(input, EPS)
    .faces.filter((f) => f.area > EPS)
    .filter((f) => !polys.some((p) => pointInPolygon(interiorPoint(f.poly), p)))
    .filter((f) => f.poly.some(onBox))
    .map((f) => {
      const outline = orient(simplify(f.poly, 1e-6));
      const marked = nonWholeEdges(outline);
      return { id: newId(), outline, ...(marked.length ? { marked } : {}) };
    });
}
