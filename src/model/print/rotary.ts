// Rotary cutting: which pieces are squares, rectangles, or half/quarter-square triangles, the size
// to cut them (seam allowance included, rounded up), and the strips to cut across the fabric.
import type { Pt } from '../geometry/path';
import { roundUp } from './format';
import { bounds, rotate, simplify, snugRotation } from './polygon';
import type { Piece } from './pieces';

export type CutKind = 'square' | 'rect' | 'hst' | 'qst' | 'miter' | 'template';

export interface Cut {
  kind: CutKind;
  /**
   * Finished size: sides (square/rect), leg (hst), long side (qst), long edge × width (miter: a
   * strip with both ends trimmed at 45°, as a mitered border side); template: bounding box.
   */
  finished: [number, number];
  /** Size to cut: the square for triangles, cut once (hst) or twice (qst); template: box + seams. */
  cut: [number, number];
  /** Pieces from one cut shape. */
  yields: 1 | 2 | 4;
  /** The finished size is off the rounding grid, so rounding distorts it. */
  distorted: boolean;
}

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const onGrid = (x: number, step: number) => !step || near(x / step, Math.round(x / step), 1e-6);
const sides = (p: Pt[]) =>
  p.map((a, i) => {
    const b = p[(i + 1) % p.length]!;
    return [b[0] - a[0], b[1] - a[1]] as Pt;
  });
const isRight = (u: Pt, v: Pt, tol: number) =>
  Math.abs(u[0] * v[0] + u[1] * v[1]) <= tol * Math.hypot(...u) * Math.hypot(...v);
const axisAligned = (v: Pt) => Math.min(Math.abs(v[0]), Math.abs(v[1])) <= 1e-6 * Math.hypot(...v);

/**
 * How to cut one piece; `seam`, `step` (0 = exact), and `slack` (extra length on mitered strips) in
 * project units.
 */
export function cutFor(piece: Piece, seam: number, step: number, slack = 0): Cut {
  const p = simplify(piece.poly, 1e-4);
  const e = sides(p);
  const L = e.map((v) => Math.hypot(...v));
  const tol = 1e-3;
  if (!piece.curved && p.length === 4 && e.every((v, i) => isRight(v, e[(i + 1) % 4]!, tol))) {
    const [w, h] = [L[0]!, L[1]!].sort((a, b) => b - a) as [number, number];
    const square = near(w, h, tol * w);
    return {
      kind: square ? 'square' : 'rect',
      finished: [w, h],
      cut: [roundUp(w + 2 * seam, step), roundUp(h + 2 * seam, step)],
      yields: 1,
      distorted: !onGrid(w, step) || !onGrid(h, step),
    };
  }
  if (!piece.curved && p.length === 3) {
    const k = e.findIndex((v, i) => isRight(v, e[(i + 1) % 3]!, tol));
    if (k >= 0) {
      const leg1 = e[k]!;
      const leg2 = e[(k + 1) % 3]!;
      const hyp = e[(k + 2) % 3]!;
      if (near(Math.hypot(...leg1), Math.hypot(...leg2), tol * Math.hypot(...leg1))) {
        const leg = Math.hypot(...leg1);
        // Straight grain on the legs (half-square) unless the long side lies along the block edge.
        if (axisAligned(hyp) && !axisAligned(leg1)) {
          const long = Math.hypot(...hyp);
          const s = roundUp(long + 2 * (1 + Math.SQRT2) * seam, step);
          return {
            kind: 'qst',
            finished: [long, long],
            cut: [s, s],
            yields: 4,
            distorted: !onGrid(long, step),
          };
        }
        const s = roundUp(leg + (2 + Math.SQRT2) * seam, step);
        return {
          kind: 'hst',
          finished: [leg, leg],
          cut: [s, s],
          yields: 2,
          distorted: !onGrid(leg, step),
        };
      }
    }
  }
  if (!piece.curved && p.length === 4) {
    // Isosceles trapezoid with 45° ends: opposite sides k, k+2 parallel, long − short = 2 × width.
    for (const k of [0, 1]) {
      const [a, b] = [e[k]!, e[k + 2]!];
      const cross = a[0] * b[1] - a[1] * b[0];
      if (Math.abs(cross) > tol * L[k]! * L[k + 2]! || !near(L[k + 1]!, L[(k + 3) % 4]!, tol))
        continue;
      const long = Math.max(L[k]!, L[k + 2]!);
      const w =
        Math.abs((p[k + 2]![0] - p[k]![0]) * a[1] - (p[k + 2]![1] - p[k]![1]) * a[0]) / L[k]!;
      if (!near(long - Math.min(L[k]!, L[k + 2]!), 2 * w, tol * long)) continue;
      return {
        kind: 'miter',
        finished: [long, w],
        // The cut piece's long edge reaches s(1 + √2) past each finished corner.
        cut: [
          roundUp(long + 2 * (1 + Math.SQRT2) * seam + slack, step),
          roundUp(w + 2 * seam, step),
        ],
        yields: 1,
        distorted: !onGrid(w, step),
      };
    }
  }
  const [x0, y0, x1, y1] = bounds(rotate(p, snugRotation(p)));
  const box: [number, number] = [x1 - x0, y1 - y0];
  return {
    kind: 'template',
    finished: box,
    cut: [box[0] + 2 * seam, box[1] + 2 * seam],
    yields: 1,
    distorted: false,
  };
}

export interface CutLine {
  fill: string;
  cut: Cut;
  /** Pieces needed. */
  count: number;
  /** Shapes to cut (squares for triangles). */
  units: number;
  stripWidth: number;
  /** Strips across the usable fabric width; `pieced`: each unit is longer than a strip. */
  strips: number;
  pieced: boolean;
  /** Units from one strip. */
  perStrip: number;
}

const groupKey = (fill: string, c: Cut) =>
  `${fill}|${c.kind}|${c.cut.map((n) => n.toFixed(4)).join('x')}`;

/** Cutting plan per fill: whole strips across `usable` (the usable fabric width). */
export function cutPlan(
  pieces: Piece[],
  seam: number,
  step: number,
  usable: number,
  slack = 0,
): CutLine[] {
  const groups = new Map<string, { fill: string; cut: Cut; count: number }>();
  for (const piece of pieces) {
    const cut = cutFor(piece, seam, step, slack);
    const key = groupKey(piece.fill, cut);
    const g = groups.get(key) ?? { fill: piece.fill, cut, count: 0 };
    g.count++;
    groups.set(key, g);
  }
  return [...groups.values()].map(({ fill, cut, count }) => {
    const units = Math.ceil(count / cut.yields);
    const stripWidth = Math.min(...cut.cut);
    const length = Math.max(...cut.cut);
    const perStrip = Math.floor(usable / length);
    const pieced = perStrip === 0;
    const strips = pieced ? Math.ceil((units * length) / usable) : Math.ceil(units / perStrip);
    return { fill, cut, count, units, stripWidth, strips, pieced, perStrip };
  });
}
