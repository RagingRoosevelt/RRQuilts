// Trim a space's outline to the quilt rectangle. Straight outlines: polygon clipping against the
// rectangle's four sides. Curved outlines (clamshell, spool): the arrangement of the outline and the
// rectangle, keeping the faces inside both, with true arcs.
import { toPatch } from '../blocks/derive';
import { arrange } from '../geometry/arrangement';
import { flattenLoop, pathToSegs, pointInPolygon, type Pt } from '../geometry/path';
import type { PathCommand } from '../schema/shared';
import type { Bounds } from './slots';

const EPS = 1e-9;

/** Where an outline lies relative to `r`: wholly inside, wholly outside, or crossing it. */
export function relation(poly: Pt[], [x0, y0, x1, y1]: Bounds): 'in' | 'out' | 'cross' {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [a, b, c, d] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  if (a >= x0 - EPS && b >= y0 - EPS && c <= x1 + EPS && d <= y1 + EPS) return 'in';
  if (c <= x0 + EPS || a >= x1 - EPS || d <= y0 + EPS || b >= y1 - EPS) return 'out';
  return 'cross';
}

/** Clip a straight-edged polygon to the rectangle (Sutherland–Hodgman); [] when nothing's left. */
export function clipPolygon(poly: Pt[], [x0, y0, x1, y1]: Bounds): Pt[] {
  const edges: [(p: Pt) => number, (a: Pt, b: Pt) => Pt][] = [
    [(p) => p[0] - x0, (a, b) => at(a, b, (x0 - a[0]) / (b[0] - a[0]))],
    [(p) => x1 - p[0], (a, b) => at(a, b, (x1 - a[0]) / (b[0] - a[0]))],
    [(p) => p[1] - y0, (a, b) => at(a, b, (y0 - a[1]) / (b[1] - a[1]))],
    [(p) => y1 - p[1], (a, b) => at(a, b, (y1 - a[1]) / (b[1] - a[1]))],
  ];
  let out = poly;
  for (const [inside, cross] of edges) {
    const src = out;
    out = [];
    src.forEach((cur, i) => {
      const prev = src[(i + src.length - 1) % src.length]!;
      const [pc, pp] = [inside(cur) >= -EPS, inside(prev) >= -EPS];
      if (pc !== pp) out.push(cross(prev, cur));
      if (pc) out.push(cur);
    });
    if (!out.length) return [];
  }
  return out;
}

const at = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const isStraight = (path: PathCommand[]) => path.every((c) => c[0] !== 'A' && c[0] !== 'C');

const toPath = (poly: Pt[]): PathCommand[] => [
  ['M', ...poly[0]!],
  ...poly.slice(1).map((p): PathCommand => ['L', ...p]),
  ['Z'],
];

/** `outline` trimmed to `r` (quilt units); null when nothing is left. */
export function clipOutline(outline: PathCommand[], r: Bounds): PathCommand[] | null {
  if (isStraight(outline)) {
    const pts = outline.flatMap((c): Pt[] => (c[0] === 'M' || c[0] === 'L' ? [[c[1], c[2]]] : []));
    const poly = clipPolygon(pts, r);
    return poly.length >= 3 ? toPath(poly) : null;
  }
  const segs = pathToSegs(outline, [1, 1]);
  const scale = Math.max(r[2] - r[0], r[3] - r[1]);
  const shape = flattenLoop(segs, 1e-4 * scale);
  const [x0, y0, x1, y1] = r;
  const box: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const input = [
    ...segs.map((seg, i) => ({ id: `s${i}`, seg, outline: true })),
    ...box.map((a, i) => ({
      id: `r${i}`,
      seg: { kind: 'line' as const, a, b: box[(i + 1) % 4]! },
      outline: true,
    })),
  ];
  const inside = (p: Pt) => p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1;
  const faces = arrange(input, 1e-7 * scale).faces.filter((f) => {
    const p = interior(f.poly);
    return p && inside(p) && pointInPolygon(p, shape);
  });
  // ponytail: one piece per space. A space cut in two by the edge (a spool through its waist) keeps
  // its larger part; give Slot several outlines if a preset ever needs both.
  const best = faces.sort((a, b) => b.area - a.area)[0];
  return best ? toPatch(best, 1, 1).path : null;
}

/** A point inside a simple polygon: the midpoint of a short diagonal that lies inside. */
function interior(poly: Pt[]): Pt | null {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const c = poly[(i + 2) % poly.length]!;
    const p: Pt = [(a[0] + b[0] * 2 + c[0]) / 4, (a[1] + b[1] * 2 + c[1]) / 4];
    if (pointInPolygon(p, poly)) return p;
  }
  return null;
}
