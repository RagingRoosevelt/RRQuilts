// An EPP quilt's edge (spec 027 FR-001a): No trimming, Cut to size (a rectangle) or Auto-close
// (closing pieces fill the notches up to the rectangle round the pieces). Units throughout.
import { arrange, type InputSeg } from '../geometry/arrangement';
import { pointInPolygon, type Pt } from '../geometry/path';
import { interiorPoint } from '../blocks/remap';
import { simplify } from '../print/polygon';
import { newId } from '../ids';
import type { InternalShape } from '../schema/epp';
import { nonWholeEdges } from './checks';
import { bbox, orient, outerEdges, type Poly } from './geometry';

export type Box = [number, number, number, number];
const EPS = 1e-6;

/** p inside a piece or on its outline (a seam between two pieces counts as covered). */
function covers(polys: readonly Poly[], p: Pt): boolean {
  return polys.some(
    (poly) =>
      pointInPolygon(p, poly) ||
      poly.some((a, i) => {
        const b = poly[(i + 1) % poly.length]!;
        const ab: Pt = [b[0] - a[0], b[1] - a[1]];
        const l2 = ab[0] ** 2 + ab[1] ** 2;
        const t = l2
          ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2))
          : 0;
        return Math.hypot(p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t) < 1e-7;
      }),
  );
}

/**
 * The largest axis-aligned rectangle the pieces cover with no gaps: the starting Cut to size.
 * Found on a grid of `step` units (a cell counts only when its corners and middle are covered, so
 * the rectangle never reaches past the pieces), then each side pushed out to where the pieces end.
 * shortcut: coverage is sampled every 1/100 U along a side and at piece corners, so a gap narrower
 * than that between corners is missed; fine for EPP pieces, whose gaps end in corners.
 */
export function cutRect(polys: readonly Poly[], step = 0.25): Box | null {
  if (!polys.length) return null;
  const [x0, y0, x1, y1] = bbox(polys);
  const cols = Math.max(1, Math.round((x1 - x0) / step));
  const rows = Math.max(1, Math.round((y1 - y0) / step));
  if (cols * rows > 400_000) return cutRect(polys, step * 2);
  const covered = (x: number, y: number) => covers(polys, [x, y]);
  const cell = (c: number, r: number) => {
    const [cx, cy] = [x0 + c * step, y0 + r * step];
    return (
      covered(cx + step / 2, cy + step / 2) &&
      covered(cx, cy) &&
      covered(cx + step, cy) &&
      covered(cx, cy + step) &&
      covered(cx + step, cy + step)
    );
  };
  // Largest rectangle of covered cells: a histogram per row (stack method).
  const h = new Array<number>(cols).fill(0);
  let best: { area: number; box: Box } | null = null;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) h[c] = cell(c, r) ? h[c]! + 1 : 0;
    const stack: number[] = [];
    for (let c = 0; c <= cols; c++) {
      const hc = c < cols ? h[c]! : 0;
      while (stack.length && h[stack.at(-1)!]! >= hc) {
        const top = stack.pop()!;
        const height = h[top]!;
        const left = stack.length ? stack.at(-1)! + 1 : 0;
        const area = height * (c - left);
        if (height && (!best || area > best.area))
          best = {
            area,
            box: [
              x0 + left * step,
              y0 + (r + 1 - height) * step,
              x0 + c * step,
              y0 + (r + 1) * step,
            ],
          };
      }
      stack.push(c);
    }
  }
  return best ? grow(polys, best.box, step) : null;
}

/** Each side of a covered box pushed out (up to `reach`) while the side stays covered. */
function grow(polys: readonly Poly[], box: Box, reach: number): Box {
  const b: Box = [...box];
  const SAMPLE = 0.01;
  const corners = polys.flat();
  const sideCovered = (k: number, v: number) => {
    const vertical = k === 0 || k === 2;
    const [from, to] = vertical ? [b[1], b[3]] : [b[0], b[2]];
    const n = Math.max(1, Math.ceil((to - from) / SAMPLE));
    // Piece corners along the side too: a notch's tip is where a gap comes closest.
    const at = [
      ...Array.from({ length: n + 1 }, (_, i) => from + ((to - from) * i) / n),
      ...corners.map((c) => c[vertical ? 1 : 0]).filter((u) => u > from && u < to),
    ];
    return at.every((u) => covers(polys, vertical ? [v, u] : [u, v]));
  };
  for (let k = 0; k < 4; k++) {
    const dir = k < 2 ? -1 : 1;
    // Out in small steps to the first uncovered side, then halve the last step to the edge.
    let good = b[k]!;
    let bad: number | null = null;
    for (let d = SAMPLE; d <= reach + 1e-9; d += SAMPLE) {
      const v = box[k]! + dir * d;
      if (!sideCovered(k, v)) {
        bad = v;
        break;
      }
      good = v;
    }
    for (let i = 0; bad !== null && i < 20; i++) {
      const m: number = (good + bad) / 2;
      if (sideCovered(k, m)) good = m;
      else bad = m;
    }
    b[k] = good;
  }
  return b;
}

/**
 * Auto-close: the closing pieces between the pieces' outside edges and the rectangle round them
 * (areas touching the rectangle; holes inside the quilt stay holes). Outlines in units where they
 * sit; edges that aren't whole units are marked (they're made, not chosen).
 */
export function autoClose(polys: readonly Poly[]): InternalShape[] {
  if (!polys.length) return [];
  const [x0, y0, x1, y1] = bbox(polys);
  const corners: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const input: InputSeg[] = [
    ...corners.map((a, i): InputSeg => ({
      id: `r${i}`,
      seg: { kind: 'line', a, b: corners[(i + 1) % 4]! },
      outline: true,
    })),
    ...outerEdges(polys).map(([a, b], i): InputSeg => ({
      id: `e${i}`,
      seg: { kind: 'line', a, b },
    })),
  ];
  const onBox = ([x, y]: Pt) =>
    Math.abs(x - x0) < EPS ||
    Math.abs(x - x1) < EPS ||
    Math.abs(y - y0) < EPS ||
    Math.abs(y - y1) < EPS;
  return arrange(input, EPS)
    .faces.filter((f) => f.area > EPS)
    .filter((f) => !polys.some((p) => pointInPolygon(interiorPoint(f.poly), p)))
    .filter((f) => f.poly.some(onBox))
    .map((f) => {
      const outline = orient(simplify(f.poly, 1e-6));
      const marked = nonWholeEdges(outline);
      return { id: newId(), outline, ...(marked.length ? { marked } : {}) };
    });
}
