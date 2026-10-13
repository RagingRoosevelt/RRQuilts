// Built-in medallions: a center framed by borders (traditional designs, drawn for RRQuilts).
import { gridBlocks, goose, hst, qst, rect, sq, sqInSq, type GridDef, type Piece } from './grid';

/** A one-unit border around ring k of an n × n grid, with cornerstones. */
function border(n: number, k: number, c: string, corner = c): Piece[] {
  const [a, z, s] = [k, n - k - 1, n - 2 * k - 2];
  return [
    rect(a + 1, a, s, 1, c),
    rect(a + 1, z, s, 1, c),
    rect(a, a + 1, 1, s, c),
    rect(z, a + 1, 1, s, c),
    ...[a, z].flatMap((x) => [sq(x, a, corner), sq(x, z, corner)]),
  ];
}

/** The unit cells of ring k, drawn by `cell(c, r, side)`: side 0 top, 1 right, 2 bottom, 3 left. */
function ring(
  n: number,
  k: number,
  corner: string,
  cell: (c: number, r: number, side: number) => Piece[],
) {
  const [a, z] = [k, n - k - 1];
  const out: Piece[] = [];
  for (let r = a; r <= z; r++)
    for (let c = a; c <= z; c++) {
      const edge = [r === a, c === z, r === z, c === a];
      const n2 = edge.filter(Boolean).length;
      if (n2 === 2) out.push(sq(c, r, corner));
      else if (n2 === 1) out.push(...cell(c, r, edge.indexOf(true)));
    }
  return out;
}

/** The four corner triangles outside the diamond of square (o, o, s). */
const corners = (o: number, s: number, col: string) => sqInSq(o, o, s, col, '').slice(0, 4);

/** The diamond of square (o, o, s) less the square set in it (o + s/4 … o + 3s/4): four triangles. */
function diamondRing(o: number, s: number, col: string): Piece[] {
  const [m, a, b, e] = [o + s / 2, o + s / 4, o + (3 * s) / 4, o + s];
  return [
    {
      poly: [
        [m, o],
        [b, a],
        [a, a],
      ],
      c: col,
    },
    {
      poly: [
        [e, m],
        [b, b],
        [b, a],
      ],
      c: col,
    },
    {
      poly: [
        [m, e],
        [a, b],
        [b, b],
      ],
      c: col,
    },
    {
      poly: [
        [o, m],
        [a, a],
        [a, b],
      ],
      c: col,
    },
  ];
}

/** A two-unit border of an n × n grid; `corner(c, r)` draws each 2 × 2 cornerstone. */
function wideBorder(n: number, c: string, corner: (x: number, y: number) => Piece[]): Piece[] {
  const [s, z] = [n - 4, n - 2];
  return [
    rect(2, 0, s, 2, c),
    rect(2, z, s, 2, c),
    rect(0, 2, 2, s, c),
    rect(z, 2, 2, s, c),
    ...[0, z].flatMap((x) => [...corner(x, 0), ...corner(x, z)]),
  ];
}

/** A 2 × 2 pinwheel of half-square triangles. */
const pinwheel = (x: number, y: number, a: string, b: string) => [
  ...hst(x, y, '\\', a, b),
  ...hst(x + 1, y, '/', b, a),
  ...hst(x, y + 1, '/', a, b),
  ...hst(x + 1, y + 1, '\\', b, a),
];

/** Sawtooth teeth for `ring`, all turning the same way: a outside, b inside on the top. */
const saw = (a: string, b: string) => (c: number, r: number, side: number) =>
  hst(c, r, side % 2 ? '\\' : '/', side < 2 ? a : b, side < 2 ? b : a);

export const MEDALLION_DEFS: GridDef[] = [
  {
    name: 'Amish Center Diamond',
    size: 20,
    n: 10,
    pieces: [
      ...border(10, 0, 'D', 'K'),
      ...corners(1, 8, 'S'),
      ...diamondRing(1, 8, 'K'),
      sq(3, 3, 'P', 4),
    ],
  },
  {
    name: 'Amish Center Square',
    size: 20,
    n: 10,
    pieces: [...border(10, 0, 'D', 'K'), ...border(10, 1, 'S', 'P'), sq(2, 2, 'N', 6)],
  },
  {
    name: 'Sawtooth Medallion',
    size: 16,
    n: 8,
    pieces: [
      ...border(8, 0, 'D', 'K'),
      // Teeth all turn the same way round the ring.
      ...ring(8, 1, 'K', (c, r, side) =>
        hst(c, r, side % 2 ? '\\' : '/', side < 2 ? 'L' : 'K', side < 2 ? 'K' : 'L'),
      ),
      ...sqInSq(2, 2, 4, 'M', 'D'),
    ],
  },
  {
    name: 'Nested Squares',
    size: 12,
    n: 8,
    pieces: [
      ...corners(0, 8, 'L'),
      ...diamondRing(0, 8, 'D'),
      ...corners(2, 4, 'M'),
      ...diamondRing(2, 4, 'N'),
      ...sqInSq(3, 3, 2, 'L', 'K'),
    ],
  },
  {
    name: 'Flying Geese Medallion',
    size: 16,
    n: 8,
    pieces: [
      ...border(8, 0, 'D', 'K'),
      ...[2, 4].flatMap((i) => [
        ...goose(i, 1, 2, 1, '^', 'S', 'L'),
        ...goose(6, i, 1, 2, '>', 'S', 'L'),
        ...goose(i, 6, 2, 1, 'v', 'S', 'L'),
        ...goose(1, i, 1, 2, '<', 'S', 'L'),
      ]),
      ...[1, 6].flatMap((x) => [sq(x, 1, 'K'), sq(x, 6, 'K')]),
      ...sqInSq(2, 2, 4, 'L', 'D'),
    ],
  },
  {
    name: 'Hourglass Medallion',
    size: 16,
    n: 8,
    pieces: [
      ...border(8, 0, 'N', 'K'),
      ...ring(8, 1, 'K', (c, r) =>
        (c + r) % 2 ? qst(c, r, 1, 'K', 'L', 'K', 'L') : qst(c, r, 1, 'L', 'K', 'L', 'K'),
      ),
      sq(2, 2, 'P', 4),
    ],
  },
  {
    name: 'Piano Keys Medallion',
    size: 18,
    n: 12,
    pieces: [
      ...border(12, 0, 'D', 'K'),
      ...[1, 9].flatMap((x) => [sq(x, 1, 'K', 2), sq(x, 9, 'K', 2)]),
      ...[3, 4, 5, 6, 7, 8].flatMap((i) => {
        const c = i % 2 ? 'L' : 'M';
        return [rect(i, 1, 1, 2, c), rect(i, 9, 1, 2, c), rect(1, i, 2, 1, c), rect(9, i, 2, 1, c)];
      }),
      ...sqInSq(3, 3, 6, 'M', 'P'),
    ],
  },
  {
    name: 'Framed Hourglass',
    size: 16,
    n: 8,
    pieces: [
      ...border(8, 0, 'D', 'K'),
      ...border(8, 1, 'L', 'P'),
      ...qst(2, 2, 4, 'K', 'M', 'K', 'M'),
    ],
  },
  {
    name: 'Diamond Border Medallion',
    size: 16,
    n: 8,
    pieces: [
      ...border(8, 0, 'D', 'K'),
      ...ring(8, 1, 'S', (c, r) => sqInSq(c, r, 1, 'L', 'S')),
      ...corners(2, 4, 'L'),
      ...diamondRing(2, 4, 'K'),
      sq(3, 3, 'P', 2),
    ],
  },
  {
    name: 'Diamond in the Square',
    size: 24,
    n: 12,
    pieces: [...border(12, 0, 'D', 'K'), ...border(12, 1, 'S', 'P'), ...sqInSq(2, 2, 8, 'N', 'K')],
  },
  {
    name: 'Checkerboard Medallion',
    size: 20,
    n: 10,
    pieces: [
      ...border(10, 0, 'D', 'K'),
      ...ring(10, 1, 'K', (c, r) => [sq(c, r, (c + r) % 2 ? 'L' : 'K')]),
      ...sqInSq(2, 2, 6, 'M', 'P'),
    ],
  },
  {
    name: 'Framed Diamond',
    size: 16,
    n: 16,
    pieces: [
      ...border(16, 0, 'D', 'K'),
      ...corners(1, 14, 'L'),
      // A narrow diamond frame, mitered at its points.
      {
        poly: [
          [8, 1],
          [15, 8],
          [14, 8],
          [8, 2],
        ],
        c: 'S',
      },
      {
        poly: [
          [15, 8],
          [8, 15],
          [8, 14],
          [14, 8],
        ],
        c: 'S',
      },
      {
        poly: [
          [8, 15],
          [1, 8],
          [2, 8],
          [8, 14],
        ],
        c: 'S',
      },
      {
        poly: [
          [1, 8],
          [8, 1],
          [8, 2],
          [2, 8],
        ],
        c: 'S',
      },
      ...diamondRing(2, 12, 'M'),
      sq(5, 5, 'K', 6),
    ],
  },
  {
    name: 'Economy Border Medallion',
    size: 24,
    n: 12,
    pieces: [
      ...border(12, 0, 'D', 'K'),
      ...[1, 3, 5, 7, 9].flatMap((p) => [
        ...sqInSq(p, 1, 2, 'L', 'S'),
        ...sqInSq(p, 9, 2, 'L', 'S'),
        ...(p === 1 || p === 9 ? [] : [...sqInSq(1, p, 2, 'L', 'S'), ...sqInSq(9, p, 2, 'L', 'S')]),
      ]),
      sq(3, 3, 'N', 6),
    ],
  },
  {
    name: 'Pinwheel Corners Medallion',
    size: 20,
    n: 10,
    pieces: [
      ...wideBorder(10, 'D', (x, y) => pinwheel(x, y, 'L', 'K')),
      ...sqInSq(2, 2, 6, 'L', 'S'),
    ],
  },
  {
    name: 'Framed Cross',
    size: 20,
    n: 10,
    pieces: [
      ...border(10, 0, 'D', 'K'),
      ...border(10, 1, 'L', 'S'),
      ...[2, 6].flatMap((x) => [sq(x, 2, 'M', 2), sq(x, 6, 'M', 2)]),
      rect(4, 2, 2, 6, 'K'),
      rect(2, 4, 2, 2, 'K'),
      rect(6, 4, 2, 2, 'K'),
    ],
  },
  {
    name: 'Double Sawtooth Medallion',
    size: 20,
    n: 10,
    pieces: [
      ...border(10, 0, 'D', 'K'),
      ...ring(10, 1, 'K', saw('L', 'K')),
      ...ring(10, 2, 'L', saw('K', 'L')),
      sq(3, 3, 'P', 4),
    ],
  },
  {
    name: 'Hourglass Corners Medallion',
    size: 20,
    n: 10,
    pieces: [
      ...wideBorder(10, 'D', (x, y) => qst(x, y, 2, 'K', 'L', 'K', 'L')),
      ...corners(2, 6, 'L'),
      ...diamondRing(2, 6, 'K'),
      sq(3.5, 3.5, 'P', 3),
    ],
  },
  {
    name: 'Window Pane Medallion',
    size: 18,
    n: 9,
    pieces: [
      ...border(9, 0, 'D', 'K'),
      ...border(9, 1, 'S', 'P'),
      ...[2, 5].flatMap((x) => [sq(x, 2, 'M', 2), sq(x, 5, 'M', 2)]),
      rect(4, 2, 1, 5, 'L'),
      rect(2, 4, 2, 1, 'L'),
      rect(5, 4, 2, 1, 'L'),
    ],
  },
  {
    name: 'Mitered Frame Medallion',
    size: 20,
    n: 10,
    pieces: [
      ...border(10, 0, 'D', 'K'),
      // Light top and left, shadow bottom and right.
      {
        poly: [
          [1, 1],
          [9, 1],
          [8, 2],
          [2, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 1],
          [2, 2],
          [2, 8],
          [1, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 9],
          [2, 8],
          [8, 8],
          [9, 9],
        ],
        c: 'N',
      },
      {
        poly: [
          [9, 1],
          [9, 9],
          [8, 8],
          [8, 2],
        ],
        c: 'N',
      },
      ...sqInSq(2, 2, 6, 'M', 'K'),
    ],
  },
];

export const MEDALLION_BLOCKS = gridBlocks(MEDALLION_DEFS, 'Medallions');
