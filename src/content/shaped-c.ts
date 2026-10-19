// Shaped blocks, batch C (traditional designs, drawn for RRQuilts).
import { hexV, lerp, type P, type ShapedDef, type ShapedPiece } from './shaped-kit';

const O: P = [0, 0];
const K6 = [0, 1, 2, 3, 4, 5];
const sc = (p: P, t: number): P => [p[0] * t, p[1] * t];
const add = (a: P, b: P, t = 1): P => [a[0] + b[0] * t, a[1] + b[1] * t];
/** Corner k of a pointy-top hexagon (0 = top, clockwise) and of a flat-top one. */
const pv = (k: number, r = 1): P => hexV(k - 1.5, r);
const fv = (k: number, r = 1): P => hexV(k, r);
/** Two-thirds point between corners: the notch of a six-point star. */
const third = (v: (k: number) => P, k: number): P => sc(add(v(k), v(k + 1)), 1 / 3);
const mid = (v: (k: number) => P, k: number): P => lerp(v(k), v(k + 1), 0.5);

// Interlocked Star: inner hexagon (radius 1/√3, flat-top) on a lattice of side u; rows 0..4, x in half units.
const u = 1 / (2 * Math.sqrt(3));
const L = (j: number, x: number): P => [x * u, (j - 2) * 0.25];

export const SHAPED_C: ShapedDef[] = [
  {
    // Six rhombi meet at the middle, one at each corner; a white triangle fills each side.
    name: 'Eisenhower Star',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: K6.flatMap((k) => [
      { poly: [O, third(fv, k - 1), fv(k), third(fv, k)], c: k % 2 ? 'M' : 'N' },
      { poly: [fv(k), fv(k + 1), third(fv, k)], c: 'L' },
    ]),
  },
  {
    // A six-point star, each point a light and a dark triangle; white triangles fill the sides.
    name: 'Hexagon Star',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    pieces: K6.flatMap((k) => [
      { poly: [O, pv(k), third(pv, k - 1)], c: 'M' },
      { poly: [O, pv(k), third(pv, k)], c: 'N' },
      { poly: [pv(k), pv(k + 1), third(pv, k)], c: 'L' },
    ]),
  },
  {
    // Six white rhombi in a star; six gray rhombi, one at each corner.
    name: 'Tea Box',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    pieces: K6.flatMap((k) => [
      { poly: [O, pv(k, 0.5), mid(pv, k), pv(k + 1, 0.5)], c: 'L' },
      { poly: [pv(k), mid(pv, k - 1), pv(k, 0.5), mid(pv, k)], c: 'N' },
    ]),
  },
  {
    // Twelve rhombi of three tones that read as tumbling cubes.
    name: 'Block Puzzle',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: (() => {
      const h = Math.sqrt(3) / 2;
      const p = (x: number, r: number): P => [x, (r * h) / 2]; // r in half-rows
      const rh = (a: P, b: P, c: P, d: P, col: string): ShapedPiece => ({
        poly: [a, b, c, d],
        c: col,
      });
      return [
        rh(p(-0.5, -2), p(0, -2), p(-0.25, -1), p(-0.75, -1), 'L'),
        rh(p(0, -2), p(0.25, -1), p(0, 0), p(-0.25, -1), 'M'),
        rh(p(0, -2), p(0.5, -2), p(0.75, -1), p(0.25, -1), 'N'),
        rh(p(-0.75, -1), p(-0.25, -1), p(0, 0), p(-0.5, 0), 'N'),
        rh(p(-0.75, -1), p(-0.5, 0), p(-0.75, 1), p(-1, 0), 'M'),
        rh(p(0.25, -1), p(0.75, -1), p(0.5, 0), p(0, 0), 'L'),
        rh(p(0.75, -1), p(1, 0), p(0.75, 1), p(0.5, 0), 'M'),
        rh(p(-0.5, 0), p(0, 0), p(-0.25, 1), p(-0.75, 1), 'L'),
        rh(p(0, 0), p(0.5, 0), p(0.75, 1), p(0.25, 1), 'N'),
        rh(p(0, 0), p(0.25, 1), p(0, 2), p(-0.25, 1), 'M'),
        rh(p(-0.75, 1), p(-0.25, 1), p(0, 2), p(-0.5, 2), 'N'),
        rh(p(0.25, 1), p(0.75, 1), p(0.5, 2), p(0, 2), 'L'),
      ];
    })(),
  },
  {
    // Six rays to the edge midpoints, each a medium and a light piece with a dark tip; white rhombi between.
    name: 'Cosmos',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: K6.flatMap((k) => {
      const T = mid(fv, k);
      const [a, b] = [sc(fv(k), 0.5), sc(fv(k + 1), 0.5)];
      const [k1, k2, B] = [lerp(T, a, 0.55), lerp(T, b, 0.55), lerp(O, T, 0.6)];
      return [
        { poly: [fv(k), mid(fv, k - 1), a, T], c: 'L' },
        { poly: [O, a, k1, B], c: 'N' },
        { poly: [O, B, k2, b], c: 'M' },
        { poly: [T, k1, B, k2], c: 'D' },
      ];
    }),
  },
  {
    // Two interlocked triangles round a striped center, inside a ring of six gray and light triangles.
    name: 'Interlocked Star',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    pieces: [
      // ring of triangles outside the inner hexagon
      ...[
        [[pv(0), L(0, -1), L(0, 1)], 'M'],
        [[pv(0), pv(5), L(0, -1)], 'N'],
        [[pv(0), L(0, 1), pv(1)], 'N'],
        [[pv(5), L(2, -2), pv(4)], 'N'],
        [[pv(1), pv(2), L(2, 2)], 'N'],
        [[pv(5), L(0, -1), L(2, -2)], 'D'],
        [[L(0, 1), pv(1), L(2, 2)], 'D'],
        [[pv(4), L(4, -1), L(2, -2)], 'M'],
        [[pv(2), L(4, 1), L(2, 2)], 'M'],
        [[pv(4), pv(3), L(4, -1)], 'N'],
        [[L(4, -1), L(4, 1), pv(3)], 'D'],
        [[L(4, 1), pv(3), pv(2)], 'N'],
      ].map(([poly, c]) => ({ poly, c }) as ShapedPiece),
      // inner hexagon, rows of small triangles
      ...[
        [[L(0, -1), L(0, 0), L(1, -0.5), L(1, -1.5)], 'D'],
        [[L(0, 0), L(1, -0.5), L(1, 0.5)], 'M'],
        [[L(0, 0), L(0, 1), L(1, 1.5), L(1, 0.5)], 'M'],
        [[L(1, -1.5), L(2, -2), L(2, -1)], 'M'],
        [[L(1, -1.5), L(1, -0.5), L(2, -1)], 'D'],
        [[L(1, -0.5), L(1, 0.5), L(2, 1), L(3, 0.5), L(3, -0.5), L(2, -1)], 'P'],
        [[L(1, 0.5), L(1, 1.5), L(2, 1)], 'D'],
        [[L(1, 1.5), L(2, 2), L(3, 1.5), L(2, 1)], 'D'],
        [[L(2, -2), L(2, -1), L(3, -1.5)], 'M'],
        [[L(2, -1), L(3, -1.5), L(3, -0.5)], 'M'],
        [[L(2, 1), L(3, 0.5), L(3, 1.5)], 'M'],
        [[L(3, -1.5), L(3, -0.5), L(4, 0), L(4, -1)], 'D'],
        [[L(3, -0.5), L(3, 0.5), L(4, 0)], 'D'],
        [[L(3, 0.5), L(3, 1.5), L(4, 1), L(4, 0)], 'M'],
      ].map(([poly, c]) => ({ poly, c }) as ShapedPiece),
    ],
  },
  {
    // A star of dark diamonds round a dark hexagon, white triangles between, six light rhombi outside.
    name: 'Ozark Diamonds',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: [
      { poly: K6.map((k) => fv(k, 0.25)), c: 'N' },
      ...K6.flatMap((k): ShapedPiece[] => {
        const [T, Tp, P, c] = [mid(fv, k), mid(fv, k - 1), sc(fv(k), 0.5), sc(fv(k), 0.25)];
        const Q = sc(fv(k + 1), 0.5);
        const [h, hp, c1] = [sc(T, 0.5), sc(Tp, 0.5), sc(fv(k + 1), 0.25)];
        const [ma, mb] = [lerp(T, P, 0.5), lerp(T, Q, 0.5)];
        return [
          { poly: [fv(k), Tp, P, T], c: 'M' },
          { poly: [T, ma, h, mb], c: 'N' },
          { poly: [ma, P, h], c: 'L' },
          { poly: [mb, h, Q], c: 'L' },
          { poly: [P, h, c, hp], c: 'N' },
          { poly: [h, c, c1], c: 'L' },
        ];
      }),
    ],
  },
];
