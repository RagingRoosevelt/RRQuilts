// Block shapes (spec 026, spec 001 FR-060a): triangle, 60° diamond, hexagon. A shaped block keeps
// its size as the shape's bounding box (width × height, always in the shape's proportions) and its
// drawing in that box's unit square, like square blocks. Upright positions: triangle point up,
// diamond standing on a point, hexagon pointy-top.
import { apply, invert, mul, type M, type Pt } from '../geometry/affine';

export type BlockShape = 'triangle' | 'diamond60' | 'hexagon';
export const BLOCK_SHAPES: BlockShape[] = ['triangle', 'diamond60', 'hexagon'];

const S3 = Math.sqrt(3);

/** Height ÷ width. */
export const ASPECT: Record<BlockShape, number> = {
  triangle: S3 / 2,
  diamond60: S3,
  hexagon: 2 / S3,
};

/** Degrees between the turns that keep the outline (spec 001 FR-060a). */
export const SHAPE_TURN: Record<BlockShape, number> = {
  triangle: 120,
  diamond60: 180,
  hexagon: 60,
};

export const SHAPE_NAME: Record<BlockShape, string> = {
  triangle: 'Triangle',
  diamond60: '60° diamond',
  hexagon: 'Hexagon',
};

/** Corners in the unit square, clockwise on screen, starting at the top. */
export const SHAPE_OUTLINE: Record<BlockShape, Pt[]> = {
  triangle: [
    [0.5, 0],
    [1, 1],
    [0, 1],
  ],
  diamond60: [
    [0.5, 0],
    [1, 0.5],
    [0.5, 1],
    [0, 0.5],
  ],
  hexagon: [
    [0.5, 0],
    [1, 0.25],
    [1, 0.75],
    [0.5, 1],
    [0, 0.75],
    [0, 0.25],
  ],
};

const CENTROID: Record<BlockShape, Pt> = {
  triangle: [0.5, 2 / 3],
  diamond60: [0.5, 0.5],
  hexagon: [0.5, 0.5],
};

/** Side length from the block size. */
export const legOf = (shape: BlockShape, size: readonly [number, number]) =>
  shape === 'hexagon' ? size[0] / S3 : size[0];

/** Block size (bounding box) from one of leg, width, or height. */
export function shapeSize(
  shape: BlockShape,
  by: 'leg' | 'width' | 'height',
  value: number,
): [number, number] {
  const w =
    by === 'width'
      ? value
      : by === 'height'
        ? value / ASPECT[shape]
        : shape === 'hexagon'
          ? value * S3
          : value;
  return [w, w * ASPECT[shape]];
}

/**
 * A turn (degrees clockwise on screen, a multiple of the shape's turn) after a left↔right flip, about
 * the shape's center, in unit-square coordinates (the shape maps onto itself).
 */
export function shapeOrient(shape: BlockShape, rotation: number, flip: boolean): M {
  const a = ASPECT[shape];
  const toReal: M = [1, 0, 0, a, 0, 0];
  const [cx, cy] = CENTROID[shape];
  const t = (rotation * Math.PI) / 180;
  const [c, s] = [Math.cos(t), Math.sin(t)];
  const ry = cy * a;
  // Turn about (cx, ry) in real (square-scaled) coordinates.
  const turn: M = [c, s, -s, c, cx - c * cx + s * ry, ry - s * cx - c * ry];
  const f: M = flip ? [-1, 0, 0, 1, 1, 0] : [1, 0, 0, 1, 0, 0];
  return mul(invert(toReal), mul(turn, mul(f, toReal)));
}

const area = (p: Pt[]) =>
  p.reduce((s, a, i) => {
    const b = p[(i + 1) % p.length]!;
    return s + a[0] * b[1] - b[0] * a[1];
  }, 0);

/** The affine map taking triangle (a0, a1, a2) to (b0, b1, b2). */
const tri = (a: Pt[], b: Pt[]): M => {
  const basis = (p: Pt[]): M => [
    p[1]![0] - p[0]![0],
    p[1]![1] - p[0]![1],
    p[2]![0] - p[0]![0],
    p[2]![1] - p[0]![1],
    p[0]![0],
    p[0]![1],
  ];
  return mul(basis(b), invert(basis(a)));
};

/**
 * The unit square → plane map that lays a block of `shape` onto `poly` (that shape's corners, in
 * either winding): never mirrored, and of the fits the one turned least from upright. Undefined
 * when `poly` isn't that shape.
 */
export function fitShape(shape: BlockShape, poly: Pt[]): M | undefined {
  const v = SHAPE_OUTLINE[shape];
  const n = v.length;
  if (poly.length !== n) return undefined;
  const p = Math.sign(area(poly)) === Math.sign(area(v)) ? poly : [...poly].reverse();
  const size = Math.max(...p.map((q) => Math.hypot(q[0] - p[0]![0], q[1] - p[0]![1])));
  let best: { m: M; cost: number } | undefined;
  for (let o = 0; o < n; o++) {
    const at = (k: number) => p[(k + o) % n]!;
    const m = tri([v[0]!, v[1]!, v[2]!], [at(0), at(1), at(2)]);
    const fits = v.every((q, k) => {
      const r = apply(m, q);
      return Math.hypot(r[0] - at(k)[0], r[1] - at(k)[1]) <= 1e-6 * size;
    });
    if (!fits) continue;
    const angle = Math.atan2(m[1], m[0]);
    const cost = Math.abs(angle) + (angle < 0 ? 1e-9 : 0);
    if (!best || cost < best.cost) best = { m, cost };
  }
  return best?.m;
}

/**
 * The triangle grid of a shaped block, in design units (block size `w` × `h`): `divisions` steps per
 * side, through the top corner. Triangles and diamonds have level rows; hexagons (pointy-top) have
 * upright columns.
 */
export function lattice(shape: BlockShape, size: readonly [number, number], divisions: number) {
  const L = legOf(shape, size) / divisions;
  const origin: Pt = [size[0] / 2, 0];
  const [e1, e2]: [Pt, Pt] =
    shape === 'hexagon'
      ? [
          [0, L],
          [(L * S3) / 2, L / 2],
        ]
      : [
          [L, 0],
          [L / 2, (L * S3) / 2],
        ];
  const toPlane: M = [e1[0], e1[1], e2[0], e2[1], origin[0], origin[1]];
  const toGrid = invert(toPlane);
  return {
    /** The grid point nearest `p`. */
    nearest(p: Pt): Pt {
      const [u, v] = apply(toGrid, p);
      let best: Pt = origin;
      let d = Infinity;
      for (const i of [Math.floor(u), Math.ceil(u)])
        for (const j of [Math.floor(v), Math.ceil(v)]) {
          const q = apply(toPlane, [i, j]);
          const dq = Math.hypot(q[0] - p[0], q[1] - p[1]);
          if (dq < d) [best, d] = [q, dq];
        }
      return best;
    },
    /** Grid lines (three directions) across the block's bounding box. */
    lines(): [Pt, Pt][] {
      const [w, h] = size;
      const K = Math.ceil((2 * (w + h)) / L) + 2;
      const out: [Pt, Pt][] = [];
      const dirs: [Pt, Pt][] = [
        [e1, e2],
        [e2, e1],
        [[e2[0] - e1[0], e2[1] - e1[1]], e1],
      ];
      for (const [d, step] of dirs)
        for (let k = -K; k <= K; k++) {
          const a: Pt = [origin[0] + k * step[0], origin[1] + k * step[1]];
          const seg = clipLine(a, d, w, h);
          if (seg) out.push(seg);
        }
      return out;
    },
  };
}

/** The part of the line through `a` along `d` inside [0, w] × [0, h]. */
function clipLine(a: Pt, d: Pt, w: number, h: number): [Pt, Pt] | undefined {
  let t0 = -Infinity;
  let t1 = Infinity;
  for (const [p, dp, max] of [
    [a[0], d[0], w],
    [a[1], d[1], h],
  ] as const) {
    if (Math.abs(dp) < 1e-12) {
      if (p < -1e-9 || p > max + 1e-9) return undefined;
      continue;
    }
    const [ta, tb] = [(0 - p) / dp, (max - p) / dp];
    t0 = Math.max(t0, Math.min(ta, tb));
    t1 = Math.min(t1, Math.max(ta, tb));
  }
  if (t1 - t0 < 1e-9) return undefined;
  return [
    [a[0] + t0 * d[0], a[1] + t0 * d[1]],
    [a[0] + t1 * d[0], a[1] + t1 * d[1]],
  ];
}
