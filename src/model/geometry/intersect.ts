// Intersections between lines, circular arcs, and cubic Béziers (design space).
//
// Approach: line–line is solved exactly. Every other pair is found on fine polylines (crossings
// plus near-touches, so tangent contacts count), then refined on the true curves by alternating
// closest-point projection until the points agree within `eps`. Coincident pieces (collinear lines,
// same-circle arcs) return nothing here; overlaps are handled by endpoint projection in the
// arrangement.
import { arcGeom, bbox, dist, dot, flatten, len, pointAt, sub, type Pt, type Seg } from './path';

export interface Hit {
  t1: number;
  t2: number;
}

/** Closest point on `s` to `p`: parameter and distance. */
export function project(s: Seg, p: Pt): { t: number; d: number } {
  if (s.kind === 'line') {
    const d = sub(s.b, s.a);
    const L2 = dot(d, d);
    const t = L2 === 0 ? 0 : Math.min(1, Math.max(0, dot(sub(p, s.a), d) / L2));
    return { t, d: dist(p, pointAt(s, t)) };
  }
  if (s.kind === 'arc') {
    const g = arcGeom(s.a, s.b, s.sweep);
    let rel = Math.atan2(p[1] - g.center[1], p[0] - g.center[0]) - g.start;
    // Normalize the angle into the sweep's direction.
    const twoPi = 2 * Math.PI;
    if (g.sweep > 0) rel = ((rel % twoPi) + twoPi) % twoPi;
    else rel = -(((-rel % twoPi) + twoPi) % twoPi);
    let t = rel / g.sweep;
    if (t > 1) {
      // Outside the arc: nearest endpoint.
      t = dist(p, s.a) < dist(p, s.b) ? 0 : 1;
    }
    return { t, d: dist(p, pointAt(s, t)) };
  }
  // Bézier: coarse sampling then Newton on d/dt |P(t) - p|².
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 64; i++) {
    const d = dist(p, pointAt(s, i / 64));
    if (d < bestD) [best, bestD] = [i / 64, d];
  }
  let t = best;
  for (let i = 0; i < 20; i++) {
    const h = 1e-6;
    const f = (u: number) => {
      const q = sub(pointAt(s, u), p);
      return dot(q, q);
    };
    const f1 = (f(t + h) - f(t - h)) / (2 * h);
    const f2 = (f(t + h) - 2 * f(t) + f(t - h)) / (h * h);
    if (f2 <= 0) break;
    t = Math.min(1, Math.max(0, t - f1 / f2));
  }
  return { t, d: dist(p, pointAt(s, t)) };
}

function lineLine(s1: Seg & { kind: 'line' }, s2: Seg & { kind: 'line' }, eps: number): Hit[] {
  const r = sub(s1.b, s1.a);
  const q = sub(s2.b, s2.a);
  const denom = r[0] * q[1] - r[1] * q[0];
  if (Math.abs(denom) <= eps * eps) return []; // parallel or collinear
  const w = sub(s2.a, s1.a);
  const t1 = (w[0] * q[1] - w[1] * q[0]) / denom;
  const t2 = (w[0] * r[1] - w[1] * r[0]) / denom;
  const tolA = eps / Math.max(len(r), eps);
  const tolB = eps / Math.max(len(q), eps);
  if (t1 < -tolA || t1 > 1 + tolA || t2 < -tolB || t2 > 1 + tolB) return [];
  return [{ t1: Math.min(1, Math.max(0, t1)), t2: Math.min(1, Math.max(0, t2)) }];
}

/** Polyline with the curve parameter of every vertex. */
function sampled(s: Seg, tol: number): { pts: Pt[]; ts: number[] } {
  const pts = [s.a, ...flatten(s, tol)];
  return { pts, ts: pts.map((_, i) => i / (pts.length - 1)) };
}

function refine(s1: Seg, s2: Seg, t1: number, eps: number): Hit | null {
  let t2 = project(s2, pointAt(s1, t1)).t;
  for (let i = 0; i < 100; i++) {
    t1 = project(s1, pointAt(s2, t2)).t;
    const next = project(s2, pointAt(s1, t1));
    t2 = next.t;
    if (next.d < eps * 1e-3) break;
  }
  return dist(pointAt(s1, t1), pointAt(s2, t2)) <= eps ? { t1, t2 } : null;
}

function sameCircle(s1: Seg, s2: Seg, eps: number): boolean {
  if (s1.kind !== 'arc' || s2.kind !== 'arc') return false;
  const g1 = arcGeom(s1.a, s1.b, s1.sweep);
  const g2 = arcGeom(s2.a, s2.b, s2.sweep);
  return dist(g1.center, g2.center) <= eps && Math.abs(g1.r - g2.r) <= eps;
}

function boxesApart(s1: Seg, s2: Seg, pad: number): boolean {
  const [ax0, ay0, ax1, ay1] = bbox(s1);
  const [bx0, by0, bx1, by1] = bbox(s2);
  return ax1 + pad < bx0 || bx1 + pad < ax0 || ay1 + pad < by0 || by1 + pad < ay0;
}

export function intersect(s1: Seg, s2: Seg, eps: number): Hit[] {
  if (s1.kind === 'line' && s2.kind === 'line') return lineLine(s1, s2, eps);
  if (boxesApart(s1, s2, eps)) return [];
  if (sameCircle(s1, s2, eps)) return [];

  const tol = eps * 1e4;
  const A = sampled(s1, tol);
  const B = sampled(s2, tol);
  const candidates: number[] = [];
  for (let i = 0; i < A.pts.length - 1; i++) {
    for (let j = 0; j < B.pts.length - 1; j++) {
      const a: Seg = { kind: 'line', a: A.pts[i]!, b: A.pts[i + 1]! };
      const b: Seg = { kind: 'line', a: B.pts[j]!, b: B.pts[j + 1]! };
      const hit = lineLine(a, b, eps)[0];
      const near = !hit && project(b, a.a).d <= tol * 4; // tangent touches don't cross
      if (hit || near) candidates.push(A.ts[i]! + (A.ts[i + 1]! - A.ts[i]!) * (hit?.t1 ?? 0));
    }
  }
  const hits: Hit[] = [];
  for (const t of candidates) {
    const h = refine(s1, s2, t, eps);
    if (h && !hits.some((x) => dist(pointAt(s1, x.t1), pointAt(s1, h.t1)) <= eps * 10))
      hits.push(h);
  }
  return hits;
}
