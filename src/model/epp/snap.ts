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
function steps(Lm: number, Ls: number): number[] | null {
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
 * middles and `maxTurn` radians of added turn. Null when nothing is in reach.
 */
export function snap(
  moving: readonly Poly[],
  index: EdgeIndex,
  reach: number,
  maxTurn = Math.PI,
): Snap | null {
  let best: Snap | null = null;
  for (const [a, b] of outerEdges(moving)) {
    const Lm = dist(a, b);
    if (Lm < 0.1) continue;
    const um = mul(sub(b, a), 1 / Lm);
    for (const i of index.near([a, b], reach + Lm)) {
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
        if (dd > reach) continue;
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

/** A pose after a snap: its origin moves like any point, its turn gains the snap's. */
export function snapPose<T extends Pose>(pose: T, s: Snap): T {
  return {
    ...pose,
    at: add(rot(pose.at, s.rot), s.move),
    turn: pose.turn + (s.rot * 180) / Math.PI,
  };
}

export { lerp };
