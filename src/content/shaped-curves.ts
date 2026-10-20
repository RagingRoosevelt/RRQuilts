// Curved shaped blocks (traditional designs, drawn for RRQuilts): seams and color points.
import { corners, lerp, type CurvedDef, type P } from './shaped-kit';

const O: P = [0, 0];
const K6 = [0, 1, 2, 3, 4, 5];
const hex = corners('hexagon');
const v = (k: number) => hex[k % 6]!;
const mid = (k: number) => lerp(v(k), v(k + 1), 0.5);

// Rising Sun Triangle: a half sun on the bottom edge, rays from it to the sides.
const [tA, tB, tC] = corners('triangle') as [P, P, P];
const sunM = lerp(tB, tC, 0.5);
const sunR = 0.22;
const at = (deg: number, r: number): P => [
  sunM[0] + r * Math.cos((deg * Math.PI) / 180),
  sunM[1] - r * Math.sin((deg * Math.PI) / 180),
];
/** Where the ray from the sun at `deg` reaches the side (right side under 90°, left above). */
function rayEnd(deg: number): P {
  const [p, q] = deg < 90 ? [tA, tB] : [tA, tC];
  const s = at(deg, sunR);
  const d: P = [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)];
  const e: P = [q[0] - p[0], q[1] - p[1]];
  const t = ((p[0] - s[0]) * e[1] - (p[1] - s[1]) * e[0]) / (d[0] * e[1] - d[1] * e[0]);
  return [s[0] + d[0] * t, s[1] + d[1] * t];
}
const RAYS = [36, 72, 108, 144];

export const SHAPED_CURVES: CurvedDef[] = [
  {
    // Six spokes; a quarter-circle peel bows into each side, dark on every other side.
    name: 'Hexagon Orange Peel',
    shape: 'hexagon',
    leg: 4,
    category: 'Curves',
    seams: K6.flatMap((k): ([P, P] | [P, P, number])[] => [
      [O, v(k)],
      [v(k), v(k + 1), 90],
    ]),
    points: K6.flatMap((k): [P, string][] => [
      [lerp(O, mid(k), 0.45), k % 2 ? 'L' : 'M'],
      [lerp(O, mid(k), 0.94), k % 2 ? 'D' : 'L'],
    ]),
  },
  {
    // A half sun on the bottom edge (a curved seam); rays fan from it to the sides.
    name: 'Rising Sun Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Curves',
    seams: [
      [at(0, sunR), at(180, sunR), 180],
      ...RAYS.map((deg): [P, P] => [at(deg, sunR), rayEnd(deg)]),
    ],
    points: [
      [at(90, sunR / 2), 'P'],
      ...[18, 54, 90, 126, 162].map((deg, k): [P, string] => [
        at(deg, sunR + 0.12),
        k % 2 ? 'L' : 'K',
      ]),
    ],
  },
];
