// A drawn outline that is an existing shape (owner, 2026-11-10: Multi-shape pieces that match a
// library shape use it): the shape and the pose (turn, mirror, whole scale) that make it.
import { dist, type Pt } from '../geometry/path';
import { centroid, edges, edgeLength, place, type Pose, type Poly } from './geometry';

const EPS = 1e-6;
const perimeter = (p: Poly) => edges(p).reduce((s, e) => s + edgeLength(e), 0);

/** The pose that places `outline` exactly onto `target`, or null. */
export function poseOnto(outline: Poly, target: Poly): Pose | null {
  if (outline.length !== target.length || outline.length < 3) return null;
  const k = perimeter(target) / perimeter(outline);
  const scale = Math.round(k);
  if (scale < 1 || scale > 4 || Math.abs(k - scale) > 1e-6) return null;
  const at = centroid(target);
  const n = target.length;
  // `place` turns about the centroid: each start corner and mirror gives one candidate turn.
  for (const mirror of [false, true]) {
    const base = place(outline, { at: [0, 0], turn: 0, scale, mirror });
    const a0: Pt = [target[0]![0] - at[0], target[0]![1] - at[1]];
    for (let j = 0; j < n; j++) {
      const b = base[j]!;
      const turn = ((Math.atan2(a0[1], a0[0]) - Math.atan2(b[1], b[0])) * 180) / Math.PI;
      const pose: Pose = { at, turn, scale, mirror };
      const placed = place(outline, pose);
      if (placed.every((p, i) => dist(p, target[(i - j + n) % n]!) < 1e-5)) return pose;
    }
  }
  return null;
}

/** A pose as a piece stores it (no mirror flag when false). */
export const piecePose = (p: Pose) => ({
  at: p.at,
  turn: p.turn,
  scale: p.scale,
  ...(p.mirror ? { mirror: true } : {}),
});

/** The first candidate shape `target` is (in candidates' order), with its pose. */
export function matchShape<T extends { id: string; outline: Poly }>(
  target: Poly,
  candidates: readonly T[],
): { shape: T; pose: Pose } | null {
  for (const c of candidates) {
    const pose = poseOnto(c.outline, target);
    if (pose) return { shape: c, pose: { ...pose, turn: Math.round(pose.turn / EPS) * EPS } };
  }
  return null;
}
