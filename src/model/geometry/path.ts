// Geometry primitives for lines, circular arcs, and cubic Béziers.
// Coordinates: x right, y down (screen). Arc `sweep` is in degrees; positive = counter-clockwise
// as seen on screen. All math here runs in design space (normalized coords × block size), where
// arcs are true circles.

export type Pt = [number, number];
export type Seg =
  | { kind: 'line'; a: Pt; b: Pt }
  | { kind: 'arc'; a: Pt; b: Pt; sweep: number }
  | { kind: 'bezier'; a: Pt; c1: Pt; c2: Pt; b: Pt };

export const add = (p: Pt, q: Pt): Pt => [p[0] + q[0], p[1] + q[1]];
export const sub = (p: Pt, q: Pt): Pt => [p[0] - q[0], p[1] - q[1]];
export const mul = (p: Pt, k: number): Pt => [p[0] * k, p[1] * k];
export const dot = (p: Pt, q: Pt) => p[0] * q[0] + p[1] * q[1];
export const cross = (p: Pt, q: Pt) => p[0] * q[1] - p[1] * q[0];
export const len = (p: Pt) => Math.hypot(p[0], p[1]);
export const dist = (p: Pt, q: Pt) => len(sub(p, q));
const lerp = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
const RAD = Math.PI / 180;

export interface ArcGeom {
  center: Pt;
  r: number;
  /** Start angle (atan2 in raw y-down coords) and signed sweep in radians (same convention). */
  start: number;
  sweep: number;
}

/**
 * Center/radius from chord and sweep. On-screen counter-clockwise in y-down coordinates is a
 * negative atan2 rotation, hence `theta = -sweep`.
 */
export function arcGeom(a: Pt, b: Pt, sweepDeg: number): ArcGeom {
  const theta = -sweepDeg * RAD;
  const d = sub(b, a);
  const L = len(d);
  const m = lerp(a, b, 0.5);
  const n: Pt = [-d[1] / L, d[0] / L];
  const h = L / 2 / Math.tan(theta / 2);
  const center = add(m, mul(n, h));
  const r = Math.abs(L / 2 / Math.sin(theta / 2));
  return { center, r, start: Math.atan2(a[1] - center[1], a[0] - center[0]), sweep: theta };
}

export function pointAt(s: Seg, t: number): Pt {
  switch (s.kind) {
    case 'line':
      return lerp(s.a, s.b, t);
    case 'arc': {
      const g = arcGeom(s.a, s.b, s.sweep);
      const ang = g.start + g.sweep * t;
      return [g.center[0] + g.r * Math.cos(ang), g.center[1] + g.r * Math.sin(ang)];
    }
    case 'bezier': {
      const u = 1 - t;
      const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] as const;
      return [
        w[0] * s.a[0] + w[1] * s.c1[0] + w[2] * s.c2[0] + w[3] * s.b[0],
        w[0] * s.a[1] + w[1] * s.c1[1] + w[2] * s.c2[1] + w[3] * s.b[1],
      ];
    }
  }
}

/** First derivative (direction of travel) at t. */
export function derivative(s: Seg, t: number): Pt {
  switch (s.kind) {
    case 'line':
      return sub(s.b, s.a);
    case 'arc': {
      const g = arcGeom(s.a, s.b, s.sweep);
      const ang = g.start + g.sweep * t;
      return [-g.r * Math.sin(ang) * g.sweep, g.r * Math.cos(ang) * g.sweep];
    }
    case 'bezier': {
      const u = 1 - t;
      const d1 = sub(s.c1, s.a);
      const d2 = sub(s.c2, s.c1);
      const d3 = sub(s.b, s.c2);
      return add(add(mul(d1, 3 * u * u), mul(d2, 6 * u * t)), mul(d3, 3 * t * t));
    }
  }
}

function secondDerivative(s: Seg, t: number): Pt {
  switch (s.kind) {
    case 'line':
      return [0, 0];
    case 'arc': {
      const g = arcGeom(s.a, s.b, s.sweep);
      const ang = g.start + g.sweep * t;
      const k = -g.r * g.sweep * g.sweep;
      return [k * Math.cos(ang), k * Math.sin(ang)];
    }
    case 'bezier': {
      const a = add(sub(s.c2, mul(s.c1, 2)), s.a);
      const b = add(sub(s.b, mul(s.c2, 2)), s.c1);
      return add(mul(a, 6 * (1 - t)), mul(b, 6 * t));
    }
  }
}

/** Signed curvature at t (sign follows the direction of travel). */
export function curvature(s: Seg, t: number): number {
  const d1 = derivative(s, t);
  const d2 = secondDerivative(s, t);
  const l = len(d1);
  return l === 0 ? 0 : cross(d1, d2) / (l * l * l);
}

/** Split at t into two segments of the same kind. */
export function split(s: Seg, t: number): [Seg, Seg] {
  const m = pointAt(s, t);
  switch (s.kind) {
    case 'line':
      return [
        { kind: 'line', a: s.a, b: m },
        { kind: 'line', a: m, b: s.b },
      ];
    case 'arc':
      return [
        { kind: 'arc', a: s.a, b: m, sweep: s.sweep * t },
        { kind: 'arc', a: m, b: s.b, sweep: s.sweep * (1 - t) },
      ];
    case 'bezier': {
      const p01 = lerp(s.a, s.c1, t);
      const p12 = lerp(s.c1, s.c2, t);
      const p23 = lerp(s.c2, s.b, t);
      const p012 = lerp(p01, p12, t);
      const p123 = lerp(p12, p23, t);
      return [
        { kind: 'bezier', a: s.a, c1: p01, c2: p012, b: m },
        { kind: 'bezier', a: m, c1: p123, c2: p23, b: s.b },
      ];
    }
  }
}

/** The part of `s` between parameters t0 < t1. */
export function subSegment(s: Seg, t0: number, t1: number): Seg {
  const right = t0 > 0 ? split(s, t0)[1] : s;
  return t1 < 1 ? split(right, (t1 - t0) / (1 - t0))[0] : right;
}

export function reverse(s: Seg): Seg {
  switch (s.kind) {
    case 'line':
      return { kind: 'line', a: s.b, b: s.a };
    case 'arc':
      return { kind: 'arc', a: s.b, b: s.a, sweep: -s.sweep };
    case 'bezier':
      return { kind: 'bezier', a: s.b, c1: s.c2, c2: s.c1, b: s.a };
  }
}

/** Points along the segment (excluding the start), max deviation ≈ `tol`. */
export function flatten(s: Seg, tol: number): Pt[] {
  if (s.kind === 'line') return [s.b];
  let n: number;
  if (s.kind === 'arc') {
    const g = arcGeom(s.a, s.b, s.sweep);
    const step = 2 * Math.acos(Math.max(-1, 1 - tol / g.r));
    n = Math.max(2, Math.ceil(Math.abs(g.sweep) / step));
  } else {
    const hull = dist(s.a, s.c1) + dist(s.c1, s.c2) + dist(s.c2, s.b);
    n = Math.max(2, Math.ceil(Math.sqrt(hull / tol)));
  }
  n = Math.min(n, 512);
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? s.b : pointAt(s, (i + 1) / n)));
}

export function flattenLoop(segs: Seg[], tol: number): Pt[] {
  return segs.flatMap((s) => flatten(s, tol));
}

/** Shoelace area; positive for loops that turn counter-clockwise on screen (y down). */
export function signedArea(poly: Pt[]): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    a += p[0] * q[1] - q[0] * p[1];
  }
  return -a / 2;
}

export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function bbox(s: Seg): [number, number, number, number] {
  const pts =
    s.kind === 'line'
      ? [s.a, s.b]
      : s.kind === 'bezier'
        ? [s.a, s.c1, s.c2, s.b]
        : [s.a, ...flatten(s, 1e-3)];
  if (s.kind === 'arc') {
    // flatten undershoots the true bulge slightly; pad by the flatten tolerance.
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return [
      Math.min(...xs) - 1e-3,
      Math.min(...ys) - 1e-3,
      Math.max(...xs) + 1e-3,
      Math.max(...ys) + 1e-3,
    ];
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/** Stored path (normalized coords) → segments in design space (arcs circular at `size`). */
export function pathToSegs(
  path: readonly (readonly (string | number)[])[],
  size: [number, number],
): Seg[] {
  const [w, h] = size;
  const P = (x: number, y: number): Pt => [x * w, y * h];
  const segs: Seg[] = [];
  let start: Pt = [0, 0];
  let cur: Pt = [0, 0];
  for (const c of path) {
    const n = c.slice(1) as number[];
    if (c[0] === 'M') start = cur = P(n[0]!, n[1]!);
    else if (c[0] === 'L') segs.push({ kind: 'line', a: cur, b: (cur = P(n[0]!, n[1]!)) });
    else if (c[0] === 'A')
      segs.push({ kind: 'arc', a: cur, b: (cur = P(n[0]!, n[1]!)), sweep: n[2]! });
    else if (c[0] === 'C') {
      segs.push({
        kind: 'bezier',
        a: cur,
        c1: P(n[0]!, n[1]!),
        c2: P(n[2]!, n[3]!),
        b: (cur = P(n[4]!, n[5]!)),
      });
    } else if (c[0] === 'Z' && dist(cur, start) > 0)
      segs.push({ kind: 'line', a: cur, b: (cur = start) });
  }
  return segs;
}

/** Flattened outline of a stored closed path, in normalized coordinates. */
export function pathPolygon(
  path: readonly (readonly (string | number)[])[],
  size: [number, number],
): Pt[] {
  const tol = 1e-3 * Math.max(size[0], size[1]);
  return flattenLoop(pathToSegs(path, size), tol).map(
    (p) => [p[0] / size[0], p[1] / size[1]] as Pt,
  );
}
