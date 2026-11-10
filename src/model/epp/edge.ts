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

/**
 * The largest axis-aligned rectangle the pieces cover with no gaps: the starting Cut to size.
 * shortcut: sampled on a grid of `step` units (a quarter unit by default), so it can come out up to a
 * step short of the true largest rectangle; fine as a starting point the quilter adjusts.
 */
export function cutRect(polys: readonly Poly[], step = 0.25): Box | null {
  if (!polys.length) return null;
  const [x0, y0, x1, y1] = bbox(polys);
  const cols = Math.max(1, Math.round((x1 - x0) / step));
  const rows = Math.max(1, Math.round((y1 - y0) / step));
  if (cols * rows > 400_000) return cutRect(polys, step * 2);
  const covered = (x: number, y: number) => polys.some((p) => pointInPolygon([x, y], p));
  // Largest rectangle of covered cells: a histogram per row (stack method).
  const h = new Array<number>(cols).fill(0);
  let best: { area: number; box: Box } | null = null;
  for (let r = 0; r < rows; r++) {
    const cy = y0 + (r + 0.5) * step;
    for (let c = 0; c < cols; c++) h[c] = covered(x0 + (c + 0.5) * step, cy) ? h[c]! + 1 : 0;
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
  return best?.box ?? null;
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
