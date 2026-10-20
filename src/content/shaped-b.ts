// Shaped blocks, batch B: log cabin style blocks (traditional designs, drawn for RRQuilts).
import { corners, lerp, type P, type ShapedDef, type ShapedPiece } from './shaped-kit';
import type { BlockShape } from '@/model/blocks/shape';

const scale = (poly: P[], s: number): P[] => poly.map(([x, y]) => [x * s, y * s]);

/** Where the line a-b meets the line c-d. */
function meet([a, b]: [P, P], [c, d]: [P, P]): P {
  const [r, s] = [
    [b[0] - a[0], b[1] - a[1]],
    [d[0] - c[0], d[1] - c[1]],
  ] as [P, P];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
  return lerp(a, b, t);
}

type Style = 'miter' | 'spiral' | 'sym';

/** One ring between outline `O` and the smaller outline `I`: a strip per side, colors `cs`. */
/** `order`: each side's place in the sewing order (log cabin style; default: around, from side 0). */
function ring(
  O: P[],
  I: P[],
  style: Style,
  cs: string[],
  full = 0,
  order?: number[],
): ShapedPiece[] {
  const n = O.length;
  const at = (a: P[], j: number) => a[((j % n) + n) % n]!;
  const lineI = (j: number): [P, P] => [at(I, j), at(I, j + 1)];
  const lineO = (j: number): [P, P] => [at(O, j), at(O, j + 1)];
  return O.map((_, j): ShapedPiece => {
    const c = cs[j]!;
    if (style === 'miter') return { poly: [at(O, j), at(O, j + 1), at(I, j + 1), at(I, j)], c };
    if (style === 'spiral' || order) {
      // Log cabin order: each strip runs the whole side of what's sewn so far, over the ends of the
      // neighbors sewn before it, and stops at the line of those sewn after it.
      const t = order ?? O.map((_, k) => k);
      const before = (k: number) => t[((k % n) + n) % n]! < t[j]!;
      const start: P[] = before(j - 1) ? [at(O, j)] : [meet(lineO(j), lineI(j - 1))];
      const end: P[] = before(j + 1)
        ? [at(O, j + 1), meet(lineI(j), lineO(j + 1))]
        : [meet(lineO(j), lineI(j + 1))];
      const inner: P[] = [
        at(I, j + 1),
        at(I, j),
        ...(before(j - 1) ? [meet(lineI(j), lineO(j - 1))] : []),
      ];
      return { poly: [...start, ...end, ...inner], c };
    }
    // sym: the strips on one pair of opposite sides run full length, the others fit between.
    const w = (k: number, side: number) => meet(lineI(k), lineO(side));
    if (j % 2 === full) return { poly: [at(O, j), at(O, j + 1), w(j, j + 1), w(j, j - 1)], c };
    return { poly: [w(j - 1, j), w(j + 1, j), at(I, j + 1), at(I, j)], c };
  });
}

/** Rings of strips around a center (color `mid`); `rings[r]` = colors of ring r's sides. */
function cabin(
  shape: BlockShape,
  style: Style,
  steps: number[],
  rings: string[][],
  mid: string,
  full = 0,
  flat = false,
  order?: number[],
): ShapedPiece[] {
  const base = corners(shape, flat);
  const pieces = rings.flatMap((cs, r) =>
    ring(scale(base, steps[r]!), scale(base, steps[r + 1]!), style, cs, full, order),
  );
  return [...pieces, { poly: scale(base, steps[rings.length]!), c: mid }];
}

export const SHAPED_B: ShapedDef[] = [
  {
    // Two rounds of strips around a small triangle, spiralling; the right strips are gray.
    name: 'Round and Round 60-Degree Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Strips/Log Cabin',
    pieces: cabin(
      'triangle',
      'spiral',
      [1, 0.64, 0.32],
      [
        ['N', 'L', 'L'],
        ['N', 'L', 'L'],
      ],
      'L',
    ),
  },
  {
    // Two spiral rounds around a diamond; the two upper strips of each round are dark.
    name: 'Round and Round 60-Degree Diamond',
    shape: 'diamond60',
    leg: 5,
    category: 'Strips/Log Cabin',
    pieces: cabin(
      'diamond60',
      'spiral',
      [1, 0.72, 0.44],
      [
        ['D', 'L', 'L', 'D'],
        ['D', 'L', 'L', 'D'],
      ],
      'L',
    ),
  },
  {
    // Two rounds where opposite strips run full length: white upper left and lower right.
    name: 'Symmetrical 60-Degree Diamond',
    shape: 'diamond60',
    leg: 5,
    category: 'Strips/Log Cabin',
    pieces: cabin(
      'diamond60',
      'sym',
      [1, 0.7, 0.4],
      [
        ['D', 'L', 'D', 'L'],
        ['D', 'L', 'D', 'L'],
      ],
      'L',
      1,
    ),
  },
  {
    // Log cabin diamond, three thin rounds: long white strips, dark ends, light center.
    name: 'Symmetrical Parallelogram',
    shape: 'diamond60',
    leg: 4,
    category: 'Strips/Log Cabin',
    pieces: cabin(
      'diamond60',
      'sym',
      [1, 0.78, 0.56, 0.34],
      [
        ['L', 'D', 'L', 'D'],
        ['L', 'D', 'L', 'D'],
        ['L', 'D', 'L', 'D'],
      ],
      'L',
      0,
    ),
  },
  {
    // Log cabin diamond, three spiral rounds: dark right-hand strips, light left-hand strips.
    name: 'Round and Round Parallelogram',
    shape: 'diamond60',
    leg: 4,
    category: 'Strips/Log Cabin',
    pieces: cabin(
      'diamond60',
      'spiral',
      [1, 0.78, 0.56, 0.34],
      [
        ['D', 'D', 'L', 'L'],
        ['D', 'D', 'L', 'L'],
        ['D', 'D', 'L', 'L'],
      ],
      'L',
    ),
  },
  {
    // Three spiral rounds around a hexagon; the right and bottom strips are dark.
    name: 'Round and Round Hexagon',
    shape: 'hexagon',
    leg: 4,
    category: 'Strips/Log Cabin',
    flat: true,
    pieces: cabin(
      'hexagon',
      'spiral',
      [1, 0.8, 0.6, 0.4],
      [
        ['D', 'D', 'L', 'L', 'L', 'D'],
        ['D', 'D', 'L', 'L', 'L', 'D'],
        ['D', 'D', 'L', 'L', 'L', 'D'],
      ],
      'L',
      0,
      true,
    ),
  },
  {
    // Three rounds; the top and left sides dark, the bottom and right light.
    name: 'Opposite Hexagon',
    shape: 'hexagon',
    leg: 4,
    category: 'Strips/Log Cabin',
    flat: true,
    // Sewn in opposite pairs, courthouse steps style: top and bottom, then upper left and lower
    // right, then lower left and upper right (sides: 0 lower right, 1 bottom, … 4 top, 5 upper right).
    pieces: cabin(
      'hexagon',
      'spiral',
      [1, 0.8, 0.6, 0.4],
      [
        ['L', 'L', 'D', 'D', 'D', 'L'],
        ['L', 'L', 'D', 'D', 'D', 'L'],
        ['L', 'L', 'D', 'D', 'D', 'L'],
      ],
      'L',
      0,
      true,
      [3, 1, 4, 2, 0, 5],
    ),
  },
  {
    // Three mitered rounds with dark and light strips alternating around, three-fold symmetric.
    name: 'Symmetrical Hexagon',
    shape: 'hexagon',
    leg: 4,
    category: 'Strips/Log Cabin',
    flat: true,
    pieces: cabin(
      'hexagon',
      'miter',
      [1, 0.8, 0.6, 0.4],
      [
        ['D', 'L', 'D', 'L', 'D', 'L'],
        ['D', 'L', 'D', 'L', 'D', 'L'],
        ['D', 'L', 'D', 'L', 'D', 'L'],
      ],
      'L',
      0,
      true,
    ),
  },
];
