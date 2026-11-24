// Grid placement (spec 027 FR-003b, prototype C): a square or triangle lattice; a shape sits on it
// when every corner is a lattice point. The grid can be dragged until it lines up with a placed
// piece, and sized to the picked scale.
import { add, dist, sub, type Pt } from '../geometry/path';
import { place, type Pose, type Poly } from './geometry';

export type GridKind = 'square' | 'triangle';
const S3 = Math.sqrt(3);
const BASIS: Record<GridKind, [Pt, Pt]> = {
  square: [
    [1, 0],
    [0, 1],
  ],
  triangle: [
    [1, 0],
    [0.5, S3 / 2],
  ],
};
const TURNS: Record<GridKind, number[]> = {
  square: [0, 90, 180, 270],
  triangle: [0, 60, 120, 180, 240, 300],
};

export interface Lattice {
  kind: GridKind;
  origin: Pt;
  /** Lattice spacing in units (1, or the picked scale with Sync grid to selected size). */
  step: number;
}

function solve([b1, b2]: [Pt, Pt], p: Pt): Pt {
  const det = b1[0] * b2[1] - b1[1] * b2[0];
  return [(p[0] * b2[1] - p[1] * b2[0]) / det, (b1[0] * p[1] - b1[1] * p[0]) / det];
}

/** The lattice point nearest p. */
export function nearestPoint(g: Lattice, p: Pt): Pt {
  const [b1, b2] = BASIS[g.kind].map((b): Pt => [b[0] * g.step, b[1] * g.step]) as [Pt, Pt];
  const q = sub(p, g.origin);
  const [u, v] = solve([b1, b2], q);
  let best: Pt = g.origin;
  let bd = Infinity;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const c: Pt = [
        b1[0] * (Math.round(u) + i) + b2[0] * (Math.round(v) + j),
        b1[1] * (Math.round(u) + i) + b2[1] * (Math.round(v) + j),
      ];
      const d = dist(c, q);
      if (d < bd) [best, bd] = [c, d];
    }
  return add(best, g.origin);
}

const isInt = (x: number) => Math.abs(x - Math.round(x)) < 1e-6;

/** The turns (and mirrors) of a shape at `scale` whose corners all sit on a lattice of `step`. */
export function variants(outline: Poly, scale: number, kind: GridKind, step = 1, chiral = true) {
  const basis = BASIS[kind].map((b): Pt => [b[0] * step, b[1] * step]) as [Pt, Pt];
  const out: { turn: number; mirror: boolean; poly: Poly }[] = [];
  const keys = new Set<string>();
  for (const mirror of chiral ? [false, true] : [false])
    for (const turn of TURNS[kind]) {
      const poly = place(outline, { at: [0, 0], turn, scale, mirror });
      if (!poly.every((p) => solve(basis, sub(p, poly[0]!)).every(isInt))) continue;
      const key = poly
        .map((p) => p.map((c) => c.toFixed(3)).join(','))
        .sort()
        .join(';');
      if (keys.has(key)) continue;
      keys.add(key);
      out.push({ turn, mirror, poly });
    }
  return out;
}

/** The grid a shape sits on: triangles first (hexagons, diamonds, triangles), then squares. */
export function gridKindFor(outline: Poly): GridKind | null {
  if (variants(outline, 1, 'triangle').length) return 'triangle';
  if (variants(outline, 1, 'square').length) return 'square';
  return null;
}

/**
 * The pose of the shape on the grid nearest p (its centroid as near p as the grid allows), or the
 * `prefer`-th turn when the quilter has turned it. Null when the shape doesn't sit on this grid.
 */
export function cellAt(
  outline: Poly,
  scale: number,
  g: Lattice,
  p: Pt,
  prefer?: number,
): Pose | null {
  let vs = variants(outline, scale, g.kind, g.step);
  if (!vs.length) return null;
  if (prefer !== undefined) vs = [vs[((prefer % vs.length) + vs.length) % vs.length]!];
  let best: Pose | null = null;
  let bd = Infinity;
  for (const v of vs) {
    const corner = v.poly[0]!;
    const at = sub(nearestPoint(g, add(p, corner)), corner);
    const d = dist(at, p);
    if (d < bd) [best, bd] = [{ at, turn: v.turn, scale, mirror: v.mirror }, d];
  }
  return best;
}

/**
 * Drag grid: the origin moved by the drag, then snapped so the lattice point nearest a placed
 * corner lands on it when that corner is within `reach`.
 */
export function snapOrigin(g: Lattice, corners: readonly Pt[], reach: number): Pt {
  let best: Pt = g.origin;
  let bd = reach;
  for (const c of corners) {
    const q = nearestPoint(g, c);
    const d = dist(q, c);
    if (d < bd) [best, bd] = [add(g.origin, sub(c, q)), d];
  }
  return best;
}
