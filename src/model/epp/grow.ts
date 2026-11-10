// Grow mode (spec 027 FR-003b, prototype B): tap a free edge and the picked shape is attached there,
// outside the pieces already placed. The same test colors the picker's cards while hovering an edge.
import { add, dist, mul, sub, type Pt } from '../geometry/path';
import { centroid, overlaps, place, rot, type Edge, type Pose, type Poly } from './geometry';
import { steps } from './snap';

/**
 * The pose that puts one of the shape's edges against free edge `target` (running the other way, so
 * the shape lands outside its piece), not overlapping `polys`; the one nearest `near` when several
 * fit. Null when the shape fits nowhere on that edge.
 */
export function attach(
  outline: Poly,
  scale: number,
  target: Edge,
  polys: readonly Poly[],
  near?: Pt,
): Pose | null {
  const [c, d] = target;
  const Ls = dist(c, d);
  const us = mul(sub(c, d), 1 / Ls);
  const base = place(outline, { at: [0, 0], turn: 0, scale });
  const want = near ?? mul(add(c, d), 0.5);
  let best: Pose | null = null;
  let bd = Infinity;
  for (const mirror of [false, true]) {
    const poly = mirror ? place(outline, { at: [0, 0], turn: 0, scale, mirror }) : base;
    for (let j = 0; j < poly.length; j++) {
      const a = poly[j]!;
      const b = poly[(j + 1) % poly.length]!;
      const Lm = dist(a, b);
      const offsets = steps(Lm, Ls);
      if (!offsets) continue;
      const um = mul(sub(b, a), 1 / Lm);
      const r = Math.atan2(us[1], us[0]) - Math.atan2(um[1], um[0]);
      for (const o of offsets) {
        const m0 = Lm > Ls ? add(a, mul(um, o)) : a;
        const s0 = Ls > Lm ? add(d, mul(us, o)) : d;
        const at = sub(s0, rot(m0, r));
        const pose: Pose = { at, turn: (r * 180) / Math.PI, scale, mirror };
        const placed = place(outline, pose);
        if (polys.some((q) => overlaps(placed, q))) continue;
        const e = dist(centroid(placed), want);
        if (e < bd) [best, bd] = [pose, e];
      }
    }
    // A shape that is its own mirror image fits the same way mirrored: one pass is enough.
    if (best) break;
  }
  return best;
}

/** Whether the shape can be attached to that edge (picker card colors). */
export const fits = (outline: Poly, scale: number, target: Edge, polys: readonly Poly[]) =>
  attach(outline, scale, target, polys) !== null;
