// The four patch flags (spec 027 FR-006): closes, doesn't cross itself, whole-unit edges, convex.
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
  // An outline of corners always joins up: it fails only with fewer than three corners, or all in
  // one line (a crossed outline can have no area and still close).
  const closes =
    pts.length >= 3 &&
    pts.some((p, i) => {
      const a = pts[(i + 1) % pts.length]!;
      const b = pts[(i + 2) % pts.length]!;
      return Math.abs((a[0] - p[0]) * (b[1] - p[1]) - (a[1] - p[1]) * (b[0] - p[0])) > EPS;
    });
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

/**
 * Usable: closes, doesn't cross itself, convex. Edges that aren't whole units only warn (owner,
 * 2026-11-10): marking them with the Edge tool says they're meant, and clears the warning.
 */
export const passes = (f: Flags) => f.closes && f.simple && f.convex;

type Outlined = { outline: Poly; marked?: number[] | undefined };
/** Indexes of the outlines that aren't usable (red, the banner). */
export const failing = (outlines: readonly Outlined[]) =>
  outlines.flatMap((x, i) => (passes(checkOutline(x.outline, x.marked)) ? [] : [i]));
/** Indexes of usable outlines with unmarked edges that aren't whole units (a warning). */
export const unmarked = (outlines: readonly Outlined[]) =>
  outlines.flatMap((x, i) => {
    const f = checkOutline(x.outline, x.marked);
    return passes(f) && !f.wholeUnits ? [i] : [];
  });

/** What an outline fails, in words (the banner names it). */
export function problems(f: Flags): string[] {
  if (!f.closes) return ['doesn’t close'];
  return [...(f.simple ? [] : ['crosses itself']), ...(f.convex ? [] : ['isn’t convex'])];
}

/** Indexes of an outline's edges that aren't whole units (Save as rosette, Close space mark them). */
export const nonWholeEdges = (outline: Poly) =>
  edges(outline).flatMap((e, i) => (isWhole(edgeLength(e)) ? [] : [i]));
