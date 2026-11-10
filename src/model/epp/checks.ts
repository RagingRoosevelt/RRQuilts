// The four patch flags (spec 027 FR-006): closes, doesn't cross itself, whole-unit edges, convex.
import { signedArea } from '../geometry/path';
import { cornerAngles, edges, edgeLength, EPS, orient, type Poly } from './geometry';

export interface Flags {
  closes: boolean;
  simple: boolean;
  wholeUnits: boolean;
  convex: boolean;
}

export const isWhole = (n: number) => n >= 1 - 1e-6 && Math.abs(n - Math.round(n)) < 1e-6;

function crosses(
  a: [number, number],
  b: [number, number],
  c: [number, number],
  d: [number, number],
) {
  const o = (p: number[], q: number[], r: number[]) =>
    (q[0]! - p[0]!) * (r[1]! - p[1]!) - (q[1]! - p[1]!) * (r[0]! - p[0]!);
  const d1 = o(c, d, a);
  const d2 = o(c, d, b);
  const d3 = o(a, b, c);
  const d4 = o(a, b, d);
  return d1 * d2 < -EPS && d3 * d4 < -EPS;
}

export function checkOutline(outline: Poly, marked: readonly number[] = []): Flags {
  const pts = outline.filter(
    (p, i) => i === 0 || Math.hypot(p[0] - outline[i - 1]![0], p[1] - outline[i - 1]![1]) > EPS,
  );
  const closes = pts.length >= 3 && Math.abs(signedArea(pts)) > EPS;
  const es = edges(outline);
  let simple = closes;
  for (let i = 0; simple && i < es.length; i++)
    for (let j = i + 2; j < es.length; j++) {
      if (i === 0 && j === es.length - 1) continue;
      if (crosses(es[i]![0], es[i]![1], es[j]![0], es[j]![1])) {
        simple = false;
        break;
      }
    }
  const wholeUnits = es.every((e, i) => marked.includes(i) || isWhole(edgeLength(e)));
  const convex = simple && cornerAngles(orient(outline)).every((a) => a < 180 - 1e-6 && a > EPS);
  return { closes, simple, wholeUnits, convex };
}

export const passes = (f: Flags) => f.closes && f.simple && f.wholeUnits && f.convex;

/** Indexes of the outlines failing any flag (for the banner). */
export const failing = (outlines: readonly { outline: Poly; marked?: number[] | undefined }[]) =>
  outlines.flatMap((x, i) => (passes(checkOutline(x.outline, x.marked)) ? [] : [i]));
