// Trim a space's outline to the quilt rectangle, one side at a time. Straight outlines: polygon
// clipping. Curved outlines (clamshell, spool): segments cut where they cross, true arcs kept.
import { intersect } from '../geometry/intersect';
import {
  dist,
  flattenLoop,
  pathToSegs,
  pointAt,
  signedArea,
  subSegment,
  type Pt,
  type Seg,
} from '../geometry/path';
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

/** Keep the part of a convex polygon on `keep`'s side of the line through `a` and `b`. */
export function clipByLine(poly: Pt[], a: Pt, b: Pt, keep: Pt): Pt[] {
  const side = (p: Pt) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const sign = Math.sign(side(keep));
  const out: Pt[] = [];
  poly.forEach((cur, i) => {
    const prev = poly[(i + poly.length - 1) % poly.length]!;
    const [sc, sp] = [side(cur) * sign, side(prev) * sign];
    if (sc >= -EPS !== sp >= -EPS) out.push(at(prev, cur, sp / (sp - sc)));
    if (sc >= -EPS) out.push(cur);
  });
  return out;
}

/** `poly` cut to a convex `window` (both straight-edged). */
export function clipConvex(poly: Pt[], window: Pt[]): Pt[] {
  const mid: Pt = [
    window.reduce((s, p) => s + p[0], 0) / window.length,
    window.reduce((s, p) => s + p[1], 0) / window.length,
  ];
  let out = poly;
  window.forEach((a, i) => {
    if (out.length) out = clipByLine(out, a, window[(i + 1) % window.length]!, mid);
  });
  return out;
}

const at = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const isStraight = (path: PathCommand[]) => path.every((c) => c[0] !== 'A' && c[0] !== 'C');

export const toPath = (poly: Pt[]): PathCommand[] => [
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
  // Curved: cut every segment where it crosses each side in turn, keep the pieces inside, and close
  // the gaps along that side. A shape cut in two stays one outline, joined along the edge.
  let segs = pathToSegs(outline, [1, 1]);
  const [x0, y0, x1, y1] = r;
  const far = 4 * Math.max(x1 - x0, y1 - y0) + 1;
  const eps = 1e-9 * far;
  const sides: [Seg, (p: Pt) => boolean][] = [
    [line([x0, y0 - far], [x0, y1 + far]), (p) => p[0] >= x0 - eps],
    [line([x1, y0 - far], [x1, y1 + far]), (p) => p[0] <= x1 + eps],
    [line([x0 - far, y0], [x1 + far, y0]), (p) => p[1] >= y0 - eps],
    [line([x0 - far, y1], [x1 + far, y1]), (p) => p[1] <= y1 + eps],
  ];
  for (const [edge, inside] of sides) {
    const kept: Seg[] = [];
    for (const seg of segs) {
      const ts = intersect(seg, edge, eps)
        .map((h) => h.t1)
        .filter((t) => t > 1e-9 && t < 1 - 1e-9)
        .sort((a, b) => a - b);
      const ends = [0, ...ts, 1];
      for (let n = 0; n + 1 < ends.length; n++) {
        const part = subSegment(seg, ends[n]!, ends[n + 1]!);
        if (inside(pointAt(part, 0.5))) kept.push(part);
      }
    }
    segs = [];
    for (const seg of kept) {
      const last = segs[segs.length - 1];
      if (last && dist(last.b, seg.a) > eps) segs.push(line(last.b, seg.a));
      segs.push(seg);
    }
    if (!segs.length) return null;
    const [first, end] = [segs[0]!, segs[segs.length - 1]!];
    if (dist(end.b, first.a) > eps) segs.push(line(end.b, first.a));
  }
  if (Math.abs(signedArea(flattenLoop(segs, 1e-4 * far))) < 1e-9 * far * far) return null;
  const path: PathCommand[] = [['M', ...segs[0]!.a]];
  for (const g of segs) {
    if (g.kind === 'line') path.push(['L', ...g.b]);
    else if (g.kind === 'arc') path.push(['A', ...g.b, g.sweep]);
    else path.push(['C', ...g.c1, ...g.c2, ...g.b]);
  }
  path.push(['Z']);
  return path;
}

const line = (a: Pt, b: Pt): Seg => ({ kind: 'line', a, b });
