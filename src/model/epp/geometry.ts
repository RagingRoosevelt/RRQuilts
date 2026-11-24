// EPP geometry (spec 027), in units, y down. Outlines turn counter-clockwise on screen
// (`signedArea` > 0). A piece's outline is placed around its centroid: mirror, scale, turn, then
// move to `at`.
import { add, dist, mul, signedArea, sub, type Pt } from '../geometry/path';

export const EPS = 1e-6;
export type Poly = Pt[];
export type Edge = [Pt, Pt];

export interface Pose {
  at: Pt;
  turn: number;
  mirror?: boolean | undefined;
  scale: number;
}

const RAD = Math.PI / 180;
export const rot = (p: Pt, r: number): Pt => [
  p[0] * Math.cos(r) - p[1] * Math.sin(r),
  p[0] * Math.sin(r) + p[1] * Math.cos(r),
];
export const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

/** Counter-clockwise on screen. */
export const orient = (poly: Poly): Poly => (signedArea(poly) < 0 ? [...poly].reverse() : poly);

export function centroid(poly: Poly): Pt {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const c = p[0] * q[1] - q[0] * p[1];
    a += c;
    cx += (p[0] + q[0]) * c;
    cy += (p[1] + q[1]) * c;
  }
  if (Math.abs(a) < EPS) {
    const n = poly.length || 1;
    return [poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

/** An outline moved by a pose (around its centroid), still counter-clockwise. */
export function place(outline: Poly, pose: Pose): Poly {
  const c = centroid(outline);
  const out = outline.map((p) => {
    let q = sub(p, c);
    if (pose.mirror) q = [-q[0], q[1]];
    return add(rot(mul(q, pose.scale), pose.turn * RAD), pose.at);
  });
  return pose.mirror ? out.reverse() : out;
}

export const edges = (poly: Poly): Edge[] => poly.map((a, i) => [a, poly[(i + 1) % poly.length]!]);
export const edgeLength = ([a, b]: Edge) => dist(a, b);

/** Interior angle at each corner, in degrees (outline counter-clockwise on screen). */
export function cornerAngles(poly: Poly): number[] {
  const n = poly.length;
  return poly.map((q, i) => {
    const d1 = sub(q, poly[(i - 1 + n) % n]!);
    const d2 = sub(poly[(i + 1) % n]!, q);
    // In raw coordinates such an outline turns clockwise: each corner's turn is negative.
    const turn = Math.atan2(d1[0] * d2[1] - d1[1] * d2[0], d1[0] * d2[0] + d1[1] * d2[1]);
    return 180 + turn / RAD;
  });
}

export function bbox(polys: readonly Poly[]): [number, number, number, number] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const poly of polys)
    for (const [x, y] of poly) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  return x0 === Infinity ? [0, 0, 0, 0] : [x0, y0, x1, y1];
}

/** Parameter of p's projection on a→b, and its distance from the line. */
function along(p: Pt, a: Pt, b: Pt) {
  const ab = sub(b, a);
  const L2 = ab[0] * ab[0] + ab[1] * ab[1];
  const t = L2 < EPS ? 0 : ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / L2;
  return { t, d: dist(p, lerp(a, b, t)) };
}

/** Buckets of edges by grid cell, so neighbors are found without testing every edge. */
export class EdgeIndex {
  private cells = new Map<string, number[]>();
  constructor(
    readonly items: readonly Edge[],
    private size = 1,
  ) {
    items.forEach((e, i) => {
      for (const k of this.keys(e, 0)) {
        const list = this.cells.get(k);
        if (list) list.push(i);
        else this.cells.set(k, [i]);
      }
    });
  }
  private keys([a, b]: Edge, pad: number): string[] {
    const s = this.size;
    const out: string[] = [];
    for (
      let x = Math.floor((Math.min(a[0], b[0]) - pad) / s);
      x <= Math.floor((Math.max(a[0], b[0]) + pad) / s);
      x++
    )
      for (
        let y = Math.floor((Math.min(a[1], b[1]) - pad) / s);
        y <= Math.floor((Math.max(a[1], b[1]) + pad) / s);
        y++
      )
        out.push(`${x},${y}`);
    return out;
  }
  /** Indexes of edges whose cells meet `e`'s box grown by `pad`. */
  near(e: Edge, pad = 0): number[] {
    const out = new Set<number>();
    for (const k of this.keys(e, pad)) for (const i of this.cells.get(k) ?? []) out.add(i);
    return [...out];
  }
}

/**
 * The outside edges of a set of polygons: each edge with the parts lying along another polygon's
 * edge removed, so a short edge against part of a long one leaves the rest of the long one free.
 */
export function outerEdges(polys: readonly Poly[]): Edge[] {
  const all: { e: Edge; owner: number }[] = [];
  polys.forEach((poly, i) => edges(poly).forEach((e) => all.push({ e, owner: i })));
  const index = new EdgeIndex(all.map((x) => x.e));
  const out: Edge[] = [];
  all.forEach(({ e: [a, b], owner }, i) => {
    const covered: [number, number][] = [];
    for (const j of index.near([a, b], 1e-4)) {
      if (j === i || all[j]!.owner === owner) continue;
      const [c, d] = all[j]!.e;
      const pc = along(c, a, b);
      const pd = along(d, a, b);
      if (pc.d > 1e-4 || pd.d > 1e-4) continue;
      const lo = Math.max(0, Math.min(pc.t, pd.t));
      const hi = Math.min(1, Math.max(pc.t, pd.t));
      if (hi - lo > EPS) covered.push([lo, hi]);
    }
    covered.sort((x, y) => x[0] - y[0]);
    let t = 0;
    for (const [lo, hi] of covered) {
      if (lo > t + EPS) out.push([lerp(a, b, t), lerp(a, b, lo)]);
      t = Math.max(t, hi);
    }
    if (t < 1 - EPS) out.push([lerp(a, b, t), b]);
  });
  return out;
}

// shortcut: separating-axis test, exact for convex outlines (shapes must be convex); a concave
// internal shape (flagged) may report an overlap it doesn't have. Fine until concave pieces exist.
function convexOverlap(P: Poly, Q: Poly): boolean {
  for (const poly of [P, Q])
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!;
      const b = poly[(i + 1) % poly.length]!;
      const n: Pt = [b[1] - a[1], a[0] - b[0]];
      const proj = (R: Poly) => R.map((p) => p[0] * n[0] + p[1] * n[1]);
      const p1 = proj(P);
      const p2 = proj(Q);
      if (Math.max(...p1) <= Math.min(...p2) + EPS || Math.max(...p2) <= Math.min(...p1) + EPS)
        return false;
    }
  return true;
}

/** Whether two pieces overlap by more than touching. */
export function overlaps(P: Poly, Q: Poly): boolean {
  const shrink = (poly: Poly) => {
    const c = centroid(poly);
    return poly.map((p) => add(c, mul(sub(p, c), 0.98)));
  };
  const [a, b] = [bbox([P]), bbox([Q])];
  if (a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1]) return false;
  return convexOverlap(shrink(P), shrink(Q));
}

/** Indexes of polygons that overlap another. */
export function overlapping(polys: readonly Poly[]): Set<number> {
  const out = new Set<number>();
  const boxes = polys.map((p) => bbox([p]));
  for (let i = 0; i < polys.length; i++)
    for (let j = i + 1; j < polys.length; j++) {
      const [a, b] = [boxes[i]!, boxes[j]!];
      if (a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1]) continue;
      if (overlaps(polys[i]!, polys[j]!)) out.add(i).add(j);
    }
  return out;
}
