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
 * reach past 4×d. `trim`: points sharper than 90° are cut off square to the corner, `d` past the
 * sewing corner (trimmed points line up when sewing).
 */
export function offset(poly: Pt[], d: number, trim = false): Pt[] {
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
    const turn = Math.atan2(den, prev.dir[0] * cur.dir[0] + prev.dir[1] * cur.dir[1]);
    if (trim && turn > Math.PI / 2 + 1e-6) {
      // Cut across the bisector at distance d from the sewing corner.
      const bx = prev.nrm[0] + cur.nrm[0];
      const by = prev.nrm[1] + cur.nrm[1];
      const bl = Math.hypot(bx, by);
      const b: Pt = [bx / bl, by / bl];
      const at = (e: (typeof edges)[number]): Pt => {
        const t =
          (d - ((e.start[0] - v[0]) * b[0] + (e.start[1] - v[1]) * b[1])) /
          (e.dir[0] * b[0] + e.dir[1] * b[1]);
        return [e.start[0] + e.dir[0] * t, e.start[1] + e.dir[1] * t];
      };
      out.push(at(prev), at(cur));
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

const segDist = (p: Pt, a: Pt, b: Pt) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)),
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
const inside = (p: Pt, poly: Pt[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

/**
 * The roomiest point inside a polygon (center of the largest circle that fits, `r` its radius):
 * where labels go. ponytail: grid search refined twice; polylabel if this ever shows up in profiles.
 */
export function roomiest(poly: Pt[]): { p: Pt; r: number } {
  const room = (p: Pt) =>
    inside(p, poly)
      ? Math.min(...poly.map((a, i) => segDist(p, a, poly[(i + 1) % poly.length]!)))
      : -1;
  let [x0, y0, x1, y1] = bounds(poly);
  let best = { p: [(x0 + x1) / 2, (y0 + y1) / 2] as Pt, r: -1 };
  for (let pass = 0; pass < 3; pass++) {
    const n = 16;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j <= n; j++) {
        const p: Pt = [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * j) / n];
        const r = room(p);
        if (r > best.r) best = { p, r };
      }
    const w = (x1 - x0) / 8;
    const h = (y1 - y0) / 8;
    [x0, y0, x1, y1] = [best.p[0] - w, best.p[1] - h, best.p[0] + w, best.p[1] + h];
  }
  return { p: best.p, r: Math.max(0, best.r) };
}
