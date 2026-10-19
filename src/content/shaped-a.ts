// Shaped blocks, batch A: hexagon designs (traditional designs, drawn for RRQuilts).
import { H, hexV, lerp, type P, type ShapedDef } from './shaped-kit';

const O: [number, number] = [0, 0];

export const SHAPED_A: ShapedDef[] = [
  {
    // Six triangles in the middle, six trapezoids around them; each ring alternates.
    name: 'Hexagon Web I',
    shape: 'hexagon',
    leg: 4,
    category: 'Mosaics',
    flat: true,
    pieces: [0, 1, 2, 3, 4, 5].flatMap((k) => {
      const [a, b] = [hexV(k), hexV(k + 1)];
      return [
        { poly: [O, lerp(O, a, 0.5), lerp(O, b, 0.5)], c: k % 2 ? 'N' : 'D' },
        { poly: [lerp(O, a, 0.5), a, b, lerp(O, b, 0.5)], c: k % 2 ? 'D' : 'M' },
      ];
    }),
  },
  {
    // Two dark diamonds down the middle, a white diamond each side, four small dark triangles, and 12 thin ring triangles (gray outside, white inside).
    name: 'Madison Block',
    shape: 'hexagon',
    leg: 4,
    category: 'Mosaics',
    flat: true,
    pieces: (() => {
      const h = H / 2;
      const f = (poly: P[], sx: number, sy: number): P[] => poly.map(([x, y]) => [x * sx, y * sy]);
      const out: { poly: P[]; c: string }[] = [];
      for (const sy of [1, -1]) {
        out.push({
          poly: f(
            [
              [0, -H],
              [0.25, -h],
              [0, 0],
              [-0.25, -h],
            ],
            1,
            sy,
          ),
          c: 'D',
        });
      }
      for (const sx of [1, -1]) {
        out.push({
          poly: f(
            [
              [0.25, -h],
              [0, 0],
              [0.25, h],
              [0.5, 0],
            ],
            sx,
            1,
          ),
          c: 'L',
        });
        out.push({
          poly: f(
            [
              [0.75, -h],
              [1, 0],
              [0.75, h],
            ],
            sx,
            1,
          ),
          c: 'N',
        });
        out.push({
          poly: f(
            [
              [0.75, -h],
              [0.75, h],
              [0.5, 0],
            ],
            sx,
            1,
          ),
          c: 'L',
        });
        for (const sy of [1, -1]) {
          out.push({
            poly: f(
              [
                [0.25, -h],
                [0.75, -h],
                [0.5, 0],
              ],
              sx,
              sy,
            ),
            c: 'D',
          });
          out.push({
            poly: f(
              [
                [0, -H],
                [0.5, -H],
                [0.75, -h],
              ],
              sx,
              sy,
            ),
            c: 'N',
          });
          out.push({
            poly: f(
              [
                [0, -H],
                [0.75, -h],
                [0.25, -h],
              ],
              sx,
              sy,
            ),
            c: 'L',
          });
        }
      }
      return out;
    })(),
  },
  {
    // A small hexagon of two dark rhombi and two white triangles, ringed by two bent pieces and two trapezoids.
    name: 'Hexagon Web II',
    shape: 'hexagon',
    leg: 4,
    category: 'Mosaics',
    flat: true,
    pieces: (() => {
      const i = (k: number) => hexV(k, 0.5);
      const o = (k: number) => hexV(k);
      return [
        { poly: [O, i(4), i(5), i(0)], c: 'D' },
        { poly: [O, i(1), i(2), i(3)], c: 'D' },
        { poly: [O, i(3), i(4)], c: 'L' },
        { poly: [O, i(0), i(1)], c: 'L' },
        { poly: [i(4), o(4), o(5), o(0), i(0), i(5)], c: 'N' },
        { poly: [i(1), o(1), o(2), o(3), i(3), i(2)], c: 'N' },
        { poly: [i(3), o(3), o(4), i(4)], c: 'M' },
        { poly: [i(0), o(0), o(1), i(1)], c: 'M' },
      ];
    })(),
  },
  {
    // Six triangles around the center: three pieced from their centers (dark, medium, light), three plain.
    name: 'Wonder of Egypt',
    shape: 'hexagon',
    leg: 4,
    category: 'Mosaics',
    flat: true,
    pieces: [0, 1, 2, 3, 4, 5].flatMap((k) => {
      const [a, b] = [hexV(k), hexV(k + 1)];
      if (k % 2 === 0) return [{ poly: [O, a, b], c: 'L' }];
      const g: P = [(a[0] + b[0]) / 3, (a[1] + b[1]) / 3];
      return [
        { poly: [g, O, a], c: 'D' },
        { poly: [g, b, O], c: 'N' },
        { poly: [g, a, b], c: 'M' },
      ];
    }),
  },
  {
    // Six triangles around the center, each cut into a white corner triangle and a gray strip: a whirl.
    name: 'Hexagon Whirligig',
    shape: 'hexagon',
    leg: 4,
    category: 'Mosaics',
    flat: true,
    pieces: [0, 1, 2, 3, 4, 5].flatMap((k) => {
      const [a, b] = [hexV(k), hexV(k + 1)];
      const [p, q] = [lerp(O, a, 0.5), lerp(a, b, 0.5)];
      return [
        { poly: [p, a, q], c: 'L' },
        { poly: [O, p, q, b], c: 'M' },
      ];
    }),
  },
  {
    // Six dark arrowheads on the corners, white triangles along the edges, white rhombi and a white center.
    name: 'Arrowheads III',
    shape: 'hexagon',
    leg: 4,
    category: 'Mosaics',
    flat: true,
    pieces: (() => {
      const ks = [0, 1, 2, 3, 4, 5];
      const A = (k: number) => hexV(k + 0.5, 0.72);
      const I = (k: number) => hexV(k + 0.5, 0.4);
      const S = (k: number, d: number) => hexV(k + 0.5 + d, 0.56);
      return [
        { poly: ks.map((k) => I(k)), c: 'L' },
        ...ks.map((k) => ({ poly: [hexV(k), hexV(k + 1), A(k)], c: 'L' })),
        ...ks.map((k) => ({ poly: [A(k), S(k, 0.2), I(k), S(k, -0.2)], c: 'L' })),
        ...ks.map((k) => ({
          poly: [A(k - 1), hexV(k), A(k), S(k, -0.2), I(k), I(k - 1), S(k - 1, 0.2)],
          c: 'D',
        })),
      ];
    })(),
  },
];
