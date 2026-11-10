// Shapes from lines (spec 027 Multi-shape, spec 050 Close space), through the planar arrangement
// that turns block seams into patches. Results are internal shapes (outline, no library item).
import { arrange, type InputSeg } from '../geometry/arrangement';
import { dist, pointInPolygon, signedArea, type Pt } from '../geometry/path';
import { interiorPoint } from '../blocks/remap';
import { simplify } from '../print/polygon';
import { newId } from '../ids';
import type { InternalShape } from '../schema/epp';
import { bbox, edges, orient, type Poly } from './geometry';

const EPS = 1e-6;
const mid = ([a, b]: readonly [Pt, Pt]): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const line = (id: string, a: Pt, b: Pt, outline = false): InputSeg => ({
  id,
  seg: { kind: 'line', a, b },
  outline,
});

/** Counter-clockwise, no repeated or in-line corners, starting at its top-left corner. */
function tidy(poly: Poly): Poly {
  const p = orient(simplify(poly, 1e-6));
  let k = 0;
  p.forEach((v, i) => {
    const b = p[k]!;
    if (v[1] < b[1] - EPS || (Math.abs(v[1] - b[1]) < EPS && v[0] < b[0])) k = i;
  });
  return [...p.slice(k), ...p.slice(0, k)];
}

/** The closed areas an outline and the lines drawn across it make: one internal shape each. */
export function splitOutline(outline: Poly, lines: readonly [Pt, Pt][]): InternalShape[] {
  const input = [
    ...edges(outline).map(([a, b], i) => line(`o${i}`, a, b, true)),
    ...lines.map(([a, b], i) => line(`l${i}`, a, b)),
  ];
  return arrange(input, EPS).faces.map((f) => ({ id: newId(), outline: tidy(f.poly) }));
}

/**
 * The gap under p: the closed area the pieces' edges (and `lines`) make around p that no piece
 * covers. Only pieces near p take part. Null when p is on a piece or the area isn't closed.
 */
export function gapAt(
  polys: readonly Poly[],
  p: Pt,
  reach = 6,
  lines: readonly [Pt, Pt][] = [],
): Poly | null {
  if (polys.some((poly) => pointInPolygon(p, poly))) return null;
  const near = polys.filter((poly) => {
    const [x0, y0, x1, y1] = bbox([poly]);
    return x1 > p[0] - reach && x0 < p[0] + reach && y1 > p[1] - reach && y0 < p[1] + reach;
  });
  if (!near.length) return null;
  // The arrangement keeps the part connected to an outline edge: the first line, or the edge
  // nearest p.
  const all = [...lines, ...near.flatMap((poly) => edges(poly))];
  const nearest = lines[0] ?? all.reduce((b, e) => (dist(mid(e), p) < dist(mid(b), p) ? e : b));
  const input = all.map((e, i) => line(`e${i}`, e[0], e[1], e === nearest));
  const face = arrange(input, EPS).faces.find(
    (f) =>
      pointInPolygon(p, f.poly) &&
      !near.some((poly) => pointInPolygon(interiorPoint(f.poly), poly)),
  );
  return face ? tidy(face.poly) : null;
}

/**
 * Close space with a line from corner a to corner b (owner, 2026-11-10). Across a piece: the
 * parts it cuts that piece into (`piece` = its index in polys). Across empty space: the smaller
 * closed gap beside the line. Null when it does neither.
 */
export function lineCut(
  polys: readonly Poly[],
  a: Pt,
  b: Pt,
): { piece: number; parts: Poly[] } | { gap: Poly } | null {
  const len = dist(a, b);
  if (len < EPS) return null;
  const m = mid([a, b]);
  const piece = polys.findIndex((poly) => pointInPolygon(m, poly));
  if (piece >= 0) {
    const parts = splitOutline(polys[piece]!, [[a, b]]).map((s) => s.outline);
    return parts.length > 1 ? { piece, parts } : null;
  }
  // A point just off the line's middle on each side.
  const off = (k: number): Pt => [
    m[0] - (k * (b[1] - a[1])) / len / 1000,
    m[1] + (k * (b[0] - a[0])) / len / 1000,
  ];
  const reach = Math.max(6, len);
  const gaps = [off(1), off(-1)]
    .map((p) => gapAt(polys, p, reach, [[a, b]]))
    .filter((g): g is Poly => !!g);
  if (!gaps.length) return null;
  return {
    gap: gaps.reduce((s, g) => (Math.abs(signedArea(g)) < Math.abs(signedArea(s)) ? g : s)),
  };
}
