// Plain polygon tools for printing: clean outlines, seam-allowance offsets, matching shapes.
import type { Pt } from '../geometry/path';

/** Twice the area in raw coordinates (positive = counter-clockwise with y up). */
const raw2 = (poly: Pt[]) =>
  poly.reduce((a, p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    return a + p[0] * q[1] - q[0] * p[1];
  }, 0);

export const area = (poly: Pt[]) => Math.abs(raw2(poly)) / 2;

/** Drop repeated points and points on a straight run (within `tol`). */
export function simplify(poly: Pt[], tol = 1e-6): Pt[] {
  const pts = poly.filter((p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    return Math.hypot(q[0] - p[0], q[1] - p[1]) > tol;
  });
  for (let i = 0; pts.length > 3 && i < pts.length;) {
    const a = pts[(i + pts.length - 1) % pts.length]!;
    const b = pts[i]!;
    const c = pts[(i + 1) % pts.length]!;
    const ac = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const off = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / ac;
    const between = (b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1]) > 0;
    if (off <= tol && between) pts.splice(i, 1);
    else i++;
  }
  return pts;
}

/** The same polygon, counter-clockwise in raw coordinates. */
export const ccw = (poly: Pt[]) => (raw2(poly) < 0 ? [...poly].reverse() : poly);

/**
 * Outline grown outward by `d` (seam allowance): mitred corners, bevelled where a mitre would
 * reach past 4×d (sharp points).
 */
export function offset(poly: Pt[], d: number): Pt[] {
  const p = ccw(poly);
  const n = p.length;
  const edges = p.map((a, i) => {
    const b = p[(i + 1) % n]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const dir: Pt = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const nrm: Pt = [dir[1], -dir[0]]; // right of travel = outside for a ccw loop
    return { a, dir, nrm, start: [a[0] + nrm[0] * d, a[1] + nrm[1] * d] as Pt };
  });
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = edges[(i + n - 1) % n]!;
    const cur = edges[i]!;
    const v = cur.a;
    const den = prev.dir[0] * cur.dir[1] - prev.dir[1] * cur.dir[0];
    if (Math.abs(den) < 1e-9) {
      out.push(cur.start);
      continue;
    }
    const w: Pt = [cur.start[0] - prev.start[0], cur.start[1] - prev.start[1]];
    const t = (w[0] * cur.dir[1] - w[1] * cur.dir[0]) / den;
    const x: Pt = [prev.start[0] + prev.dir[0] * t, prev.start[1] + prev.dir[1] * t];
    if (Math.hypot(x[0] - v[0], x[1] - v[1]) > 4 * d) {
      out.push([v[0] + prev.nrm[0] * d, v[1] + prev.nrm[1] * d], cur.start);
    } else out.push(x);
  }
  return out;
}

/**
 * Key equal for polygons of the same shape and size in any position or rotation. Mirror images
 * differ (they're cut from the other side of the fabric).
 */
export function shapeKey(poly: Pt[]): string {
  const p = ccw(simplify(poly));
  const n = p.length;
  const tokens = p.map((a, i) => {
    const b = p[(i + 1) % n]!;
    const c = p[(i + 2) % n]!;
    const turn = Math.atan2(
      (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]),
      (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]),
    );
    const deg = Math.round((turn * 180) / Math.PI) + 0; // whole degrees; +0 avoids "-0"
    return `${Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 1000)}:${deg}`;
  });
  let best = '';
  for (let i = 0; i < n; i++) {
    const s = [...tokens.slice(i), ...tokens.slice(0, i)].join(',');
    if (!best || s < best) best = s;
  }
  return best;
}

export const bounds = (poly: Pt[]) => {
  const xs = poly.map((q) => q[0]);
  const ys = poly.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
};

export const rotate = (poly: Pt[], rad: number): Pt[] => {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return poly.map(([x, y]) => [x * c - y * s, x * s + y * c]);
};

function hull(poly: Pt[]): Pt[] {
  const pts = [...poly].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const h: Pt[] = [];
    for (const q of list) {
      while (h.length >= 2 && cross(h[h.length - 2]!, h[h.length - 1]!, q) <= 0) h.pop();
      h.push(q);
    }
    return h.slice(0, -1);
  };
  return [...half(pts), ...half([...pts].reverse())];
}

/** Rotation (radians) that gives the smallest bounding box; 0 when nothing beats upright. */
export function snugRotation(poly: Pt[]): number {
  const boxArea = (rad: number) => {
    const [x0, y0, x1, y1] = bounds(rotate(poly, rad));
    return (x1 - x0) * (y1 - y0);
  };
  let best = 0;
  let bestArea = boxArea(0);
  const h = hull(poly);
  for (let i = 0; i < h.length; i++) {
    const a = h[i]!;
    const b = h[(i + 1) % h.length]!;
    const rad = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const A = boxArea(rad);
    if (A < bestArea * (1 - 1e-6)) {
      best = rad;
      bestArea = A;
    }
  }
  return best;
}
