// 2-D affine matrices in SVG/canvas order [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f.
export type M = [number, number, number, number, number, number];
export type Pt = [number, number];

export const IDENTITY: M = [1, 0, 0, 1, 0, 0];

/** m ∘ n (apply n first, then m). */
export const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

export const apply = (m: M, [x, y]: Pt): Pt => [
  m[0] * x + m[2] * y + m[4],
  m[1] * x + m[3] * y + m[5],
];

export function invert(m: M): M {
  const det = m[0] * m[3] - m[1] * m[2];
  return [
    m[3] / det,
    -m[1] / det,
    -m[2] / det,
    m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det,
    (m[1] * m[4] - m[0] * m[5]) / det,
  ];
}

export const scale = (sx: number, sy = sx): M => [sx, 0, 0, sy, 0, 0];

/** Placement in the unit square: flip left↔right, then rotate clockwise (on screen) in 90° steps. */
export function orient(rotation: 0 | 90 | 180 | 270, flip: boolean): M {
  const f: M = flip ? [-1, 0, 0, 1, 1, 0] : IDENTITY;
  const r90: M = [0, 1, -1, 0, 1, 0]; // (x, y) → (1 − y, x)
  let m = f;
  for (let i = 0; i < rotation / 90; i++) m = mul(r90, m);
  return m;
}
