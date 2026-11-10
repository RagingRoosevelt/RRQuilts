// Edge snapping (spec 027 FR-003, FR-002). Equal edges meet end to end; a whole-unit edge runs along
// a longer whole-unit edge at whole-unit steps; any other length L snaps to L, whole multiples of L,
// L/2 and L/4, the shorter edge stepping along the longer by its own length.
import { add, dist, mul, sub, type Pt } from '../geometry/path';
import { isWhole } from './checks';
import { EdgeIndex, lerp, outerEdges, rot, type Edge, type Pose, type Poly } from './geometry';

export interface Snap {
  /** Turn (radians) about the origin, then move. */
  rot: number;
  move: Pt;
  score: number;
  /** The two edges that meet, after the snap (for highlighting). */
  target: Edge;
}

/** Positions (offsets from the longer edge's start, in units) where the shorter can sit. */
export function steps(Lm: number, Ls: number): number[] | null {
  const short = Math.min(Lm, Ls);
  const long = Math.max(Lm, Ls);
  if (short < 0.1) return null;
  if (isWhole(Lm) && isWhole(Ls)) {
    const n = Math.round(long - short);
    return Array.from({ length: n + 1 }, (_, k) => k);
  }
  const k = long / short;
  if (Math.abs(k - Math.round(k)) > 1e-6) return null;
  return Array.from({ length: Math.round(k) }, (_, i) => i * short);
}

/** The static side, indexed once per drag. */
export const staticEdges = (polys: readonly Poly[]) => new EdgeIndex(outerEdges(polys), 2);

/**
 * Best snap of moving polygons onto static edges, within `reach` units between the matched edges'
 * middles (or `share` of the shorter edge's length, when that's more: a fixed share of an edge
 * snaps the same at every zoom) and `maxTurn` radians of added turn. Overlaps are allowed (the
 * quilter tidies up by dragging). Null when nothing is in reach.
 */
export function snap(
  moving: readonly Poly[],
  index: EdgeIndex,
  reach: number,
  maxTurn = Math.PI,
  share = 0,
): Snap | null {
  let best: Snap | null = null;
  for (const [a, b] of outerEdges(moving)) {
    const Lm = dist(a, b);
    if (Lm < 0.1) continue;
    const um = mul(sub(b, a), 1 / Lm);
    for (const i of index.near([a, b], Math.max(reach, share * Lm) + Lm)) {
      const [c, d] = index.items[i]!;
      const Ls = dist(c, d);
      const offsets = steps(Lm, Ls);
      if (!offsets) continue;
      const us = mul(sub(c, d), 1 / Ls); // the static edge walked d → c (the other way round)
      const L = Math.min(Lm, Ls);
      const r = Math.atan2(us[1], us[0]) - Math.atan2(um[1], um[0]);
      const rr = Math.atan2(Math.sin(r), Math.cos(r));
      if (Math.abs(rr) > maxTurn + 1e-9) continue;
      for (const o of offsets) {
        const m0 = Lm > Ls ? add(a, mul(um, o)) : a;
        const s0 = Ls > Lm ? add(d, mul(us, o)) : d;
        const dd = dist(add(m0, mul(um, L / 2)), add(s0, mul(us, L / 2)));
        if (dd > Math.max(reach, share * L)) continue;
        const score = dd + Math.abs(rr) * 0.15;
        if (best && score >= best.score) continue;
        best = {
          rot: rr,
          move: sub(s0, rot(m0, rr)),
          score,
          target: [s0, add(s0, mul(us, L))],
        };
      }
    }
  }
  return best;
}

/**
 * Turn tool on a snapped piece (owner, 2026-11-10): the smallest turn, either way (ties the same way
 * each time, so taps cycle), that brings another of its edges flush against a neighbor edge it lies
 * along now, kept as near where it was as the fit allows. Null when it lies along no neighbor edge.
 */
export function nextTurn(moving: readonly Poly[], index: EdgeIndex): Snap | null {
  const mine = outerEdges(moving);
  // Neighbor edges it lies along: collinear, running the other way, overlapping.
  const along: Edge[] = [];
  for (const [a, b] of mine) {
    const L = dist(a, b);
    const u = mul(sub(b, a), 1 / L);
    for (const i of index.near([a, b], 1e-3)) {
      const [c, d] = index.items[i]!;
      const v = mul(sub(d, c), 1 / dist(c, d));
      if (u[0] * v[0] + u[1] * v[1] > -0.9999) continue;
      const off = (p: Pt) => Math.abs((p[0] - a[0]) * u[1] - (p[1] - a[1]) * u[0]);
      if (off(c) > 1e-4 || off(d) > 1e-4) continue;
      const t = (p: Pt) => (p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1];
      if (Math.min(L, Math.max(t(c), t(d))) - Math.max(0, Math.min(t(c), t(d))) > 1e-4)
        along.push([c, d]);
    }
  }
  if (!along.length) return null;
  const centre = (polys: readonly Poly[]) => {
    const pts = polys.flat();
    return mul(
      pts.reduce((s, p) => add(s, p), [0, 0] as Pt),
      1 / pts.length,
    );
  };
  const was = centre(moving);
  let best: Snap | null = null;
  let bestTurn = Infinity;
  let bestShift = Infinity;
  for (const [c, d] of along) {
    const Ls = dist(c, d);
    const us = mul(sub(c, d), 1 / Ls);
    for (const [a, b] of mine) {
      const Lm = dist(a, b);
      const offsets = steps(Lm, Ls);
      if (!offsets) continue;
      const um = mul(sub(b, a), 1 / Lm);
      let r = Math.atan2(us[1], us[0]) - Math.atan2(um[1], um[0]);
      r = Math.atan2(Math.sin(r), Math.cos(r));
      if (Math.abs(r) < 1e-6) continue; // the edge already there
      // Ties (a square's ±90°) go the same way: a bit less for one direction.
      const size = Math.abs(r) - (r > 0 ? 1e-9 : 0);
      const L = Math.min(Lm, Ls);
      for (const o of offsets) {
        const m0 = Lm > Ls ? add(a, mul(um, o)) : a;
        const s0 = Ls > Lm ? add(d, mul(us, o)) : d;
        const move = sub(s0, rot(m0, r));
        const now = add(rot(was, r), move);
        const shift = dist(now, was);
        if (size < bestTurn - 1e-6 || (Math.abs(size - bestTurn) <= 1e-6 && shift < bestShift)) {
          bestTurn = size;
          bestShift = shift;
          best = { rot: r, move, score: 0, target: [s0, add(s0, mul(us, L))] };
        }
      }
    }
  }
  return best;
}

/** A pose after a snap: its origin moves like any point, its turn gains the snap's. */
export function snapPose<T extends Pose>(pose: T, s: Snap): T {
  return {
    ...pose,
    at: add(rot(pose.at, s.rot), s.move),
    turn: pose.turn + (s.rot * 180) / Math.PI,
  };
}

export { lerp };
