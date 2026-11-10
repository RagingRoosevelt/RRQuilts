// Shapes from lines (spec 027 Multi-shape, spec 050 Close space), through the planar arrangement
// that turns block seams into patches. Results are internal shapes (outline, no library item).
import { arrange, type InputSeg } from '../geometry/arrangement';
import { dist, pointInPolygon, type Pt } from '../geometry/path';
import { interiorPoint } from '../blocks/remap';
import { simplify } from '../print/polygon';
import { newId } from '../ids';
import type { InternalShape } from '../schema/epp';
import { bbox, edges, orient, type Poly } from './geometry';

const EPS = 1e-6;
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
 * The gap under p: the closed area the pieces' edges make around p that no piece covers. Only
 * pieces near p take part. Null when p is on a piece or the area isn't closed.
 */
export function gapAt(polys: readonly Poly[], p: Pt, reach = 6): Poly | null {
  if (polys.some((poly) => pointInPolygon(p, poly))) return null;
  const near = polys.filter((poly) => {
    const [x0, y0, x1, y1] = bbox([poly]);
    return x1 > p[0] - reach && x0 < p[0] + reach && y1 > p[1] - reach && y0 < p[1] + reach;
  });
  if (!near.length) return null;
  // The arrangement keeps the part connected to an outline edge: the edge nearest p.
  const all = near.flatMap((poly) => edges(poly));
  const mid = (e: [Pt, Pt]): Pt => [(e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2];
  const nearest = all.reduce((b, e) => (dist(mid(e), p) < dist(mid(b), p) ? e : b));
  const input = all.map((e, i) => line(`e${i}`, e[0], e[1], e === nearest));
  const face = arrange(input, EPS).faces.find(
    (f) =>
      pointInPolygon(p, f.poly) &&
      !near.some((poly) => pointInPolygon(interiorPoint(f.poly), poly)),
  );
  return face ? tidy(face.poly) : null;
}
