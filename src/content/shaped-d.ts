// Shaped blocks, batch D (traditional designs, drawn for RRQuilts).
import { H, type P, type ShapedDef, type ShapedPiece } from './shaped-kit';

/** Lattice point: x in grid sides, r in grid rows (flat-top hexagon of side 1, grid side `s`). */
const lat =
  (s: number) =>
  (x: number, r: number): P => [x * s, r * H * s];
const piece = (
  pts: [number, number][],
  c: string,
  g: (x: number, r: number) => P,
): ShapedPiece => ({
  poly: pts.map(([x, r]) => g(x, r)),
  c,
});

const kg = lat(0.5);
const cg = lat(1 / 3);

type Row = [string, [number, number][]];
const build = (rows: Row[], g: (x: number, r: number) => P) => rows.map(([c, p]) => piece(p, c, g));

// Pieces shared by Columbia and Old Glory: the six-diamond star, the ring of 18 rhombi/triangles.
const star: [number, number][][] = [
  [
    [0, 0],
    [-0.5, -1],
    [0, -2],
    [0.5, -1],
  ],
  [
    [0, 0],
    [0.5, -1],
    [1.5, -1],
    [1, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [1.5, 1],
    [0.5, 1],
  ],
  [
    [0, 0],
    [0.5, 1],
    [0, 2],
    [-0.5, 1],
  ],
  [
    [0, 0],
    [-0.5, 1],
    [-1.5, 1],
    [-1, 0],
  ],
  [
    [0, 0],
    [-1, 0],
    [-1.5, -1],
    [-0.5, -1],
  ],
];
// Ring, clockwise from the top: [light para, a, b, light/white...] given per design below.
const ring = {
  topL: [
    [-1.5, -3],
    [-0.5, -3],
    [-1, -2],
    [-2, -2],
  ],
  topDiaL: [
    [-0.5, -3],
    [0, -2],
    [-0.5, -1],
    [-1, -2],
  ],
  topTri: [
    [-0.5, -3],
    [0.5, -3],
    [0, -2],
  ],
  topDiaR: [
    [0.5, -3],
    [1, -2],
    [0.5, -1],
    [0, -2],
  ],
  topR: [
    [0.5, -3],
    [1.5, -3],
    [2, -2],
    [1, -2],
  ],
  urPara: [
    [1, -2],
    [2, -2],
    [1.5, -1],
    [0.5, -1],
  ],
  urTri: [
    [2, -2],
    [2.5, -1],
    [1.5, -1],
  ],
  rUp: [
    [1.5, -1],
    [2.5, -1],
    [2, 0],
    [1, 0],
  ],
  rOut: [
    [2.5, -1],
    [3, 0],
    [2.5, 1],
    [2, 0],
  ],
  rLow: [
    [2, 0],
    [1, 0],
    [1.5, 1],
    [2.5, 1],
  ],
  lrTri: [
    [1.5, 1],
    [2.5, 1],
    [2, 2],
  ],
  lrPara: [
    [0.5, 1],
    [1.5, 1],
    [2, 2],
    [1, 2],
  ],
  botR: [
    [1, 2],
    [2, 2],
    [1.5, 3],
    [0.5, 3],
  ],
  botDiaR: [
    [0, 2],
    [0.5, 1],
    [1, 2],
    [0.5, 3],
  ],
  botTri: [
    [-0.5, 3],
    [0.5, 3],
    [0, 2],
  ],
  botDiaL: [
    [-0.5, 1],
    [0, 2],
    [-0.5, 3],
    [-1, 2],
  ],
  botL: [
    [-2, 2],
    [-1, 2],
    [-0.5, 3],
    [-1.5, 3],
  ],
  llPara: [
    [-1.5, 1],
    [-0.5, 1],
    [-1, 2],
    [-2, 2],
  ],
  llTri: [
    [-2.5, 1],
    [-1.5, 1],
    [-2, 2],
  ],
  lLow: [
    [-2, 0],
    [-1, 0],
    [-1.5, 1],
    [-2.5, 1],
  ],
  lOut: [
    [-2.5, -1],
    [-3, 0],
    [-2.5, 1],
    [-2, 0],
  ],
  lUp: [
    [-2.5, -1],
    [-1.5, -1],
    [-1, 0],
    [-2, 0],
  ],
  ulTri: [
    [-2, -2],
    [-1.5, -1],
    [-2.5, -1],
  ],
  ulPara: [
    [-2, -2],
    [-1, -2],
    [-0.5, -1],
    [-1.5, -1],
  ],
} as Record<string, [number, number][]>;

export const SHAPED_D: ShapedDef[] = [
  {
    // Grid of half-hexagon-side triangles: eight gray triangles in a star, eight white diamonds round them.
    name: 'Kentucky',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: build(
      [
        ...(
          [
            [
              [0, -2],
              [-0.5, -1],
              [0.5, -1],
            ],
            [
              [-1.5, -1],
              [-0.5, -1],
              [-1, 0],
            ],
            [
              [-0.5, -1],
              [0.5, -1],
              [0, 0],
            ],
            [
              [0.5, -1],
              [1.5, -1],
              [1, 0],
            ],
            [
              [-1, 0],
              [-1.5, 1],
              [-0.5, 1],
            ],
            [
              [0, 0],
              [-0.5, 1],
              [0.5, 1],
            ],
            [
              [1, 0],
              [0.5, 1],
              [1.5, 1],
            ],
            [
              [0, 2],
              [-0.5, 1],
              [0.5, 1],
            ],
          ] as [number, number][][]
        ).map((p): Row => ['N', p]),
        ...(
          [
            [
              [-1, -2],
              [0, -2],
              [-0.5, -1],
              [-1.5, -1],
            ],
            [
              [0, -2],
              [1, -2],
              [1.5, -1],
              [0.5, -1],
            ],
            [
              [-2, 0],
              [-1.5, -1],
              [-1, 0],
              [-1.5, 1],
            ],
            [
              [2, 0],
              [1.5, -1],
              [1, 0],
              [1.5, 1],
            ],
            [
              [-1, 0],
              [-0.5, -1],
              [0, 0],
              [-0.5, 1],
            ],
            [
              [0, 0],
              [0.5, -1],
              [1, 0],
              [0.5, 1],
            ],
            [
              [-1.5, 1],
              [-0.5, 1],
              [0, 2],
              [-1, 2],
            ],
            [
              [0.5, 1],
              [1.5, 1],
              [1, 2],
              [0, 2],
            ],
          ] as [number, number][][]
        ).map((p): Row => ['L', p]),
      ],
      kg,
    ),
  },
  {
    // Six white diamonds in a star; light, medium and dark diamonds tumble round it, light triangles at the edge.
    name: 'Columbia',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: build(
      [
        ...star.map((p): Row => ['L', p]),
        ...(
          [
            ['M', 'topL'],
            ['N', 'topDiaL'],
            ['M', 'topTri'],
            ['D', 'topDiaR'],
            ['M', 'topR'],
            ['N', 'urPara'],
            ['M', 'urTri'],
            ['D', 'rUp'],
            ['M', 'rOut'],
            ['N', 'rLow'],
            ['M', 'lrTri'],
            ['D', 'lrPara'],
            ['M', 'botR'],
            ['N', 'botDiaR'],
            ['M', 'botTri'],
            ['D', 'botDiaL'],
            ['M', 'botL'],
            ['N', 'llPara'],
            ['M', 'llTri'],
            ['D', 'lLow'],
            ['M', 'lOut'],
            ['N', 'lUp'],
            ['M', 'ulTri'],
            ['D', 'ulPara'],
          ] as [string, string][]
        ).map(([c, k]): Row => [c, ring[k]!]),
      ],
      cg,
    ),
  },
  {
    // A medium-gray six-point star; white diamonds round it, light diamonds and triangles at the edge.
    name: 'Old Glory',
    shape: 'hexagon',
    leg: 4,
    category: 'Stars',
    flat: true,
    pieces: build(
      [
        ...star.map((p): Row => ['N', p]),
        ...Object.entries(ring).map(([k, p]): Row => [
          /^(top[LR]|rOut|lOut|bot[LR]|.*Tri)$/.test(k) ? 'M' : 'L',
          p,
        ]),
      ],
      cg,
    ),
  },
];
