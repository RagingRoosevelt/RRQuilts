// Built-in four-patch family blocks (traditional designs, drawn for RRQuilts): each is a list of
// pieces on an n × n grid, turned into seam lines and sample points for its default coloring.
type P = [number, number];
type Seam = [P, P];

/** A piece: its outline (grid units) and a color letter (see `COLORS`). */
interface Piece {
  poly: P[];
  c: string;
}

/** Color letters → built-in color names: light, medium, dark, accent, and three "prints". */
const COLORS: Record<string, string> = {
  L: 'Cream',
  M: 'Sky',
  D: 'Indigo',
  K: 'Red',
  P: 'Gold',
  Q: 'Rose',
  S: 'Teal',
};

const rect = (c: number, r: number, w: number, h: number, color: string): Piece => ({
  poly: [
    [c, r],
    [c + w, r],
    [c + w, r + h],
    [c, r + h],
  ],
  c: color,
});
const sq = (c: number, r: number, color: string, s = 1) => rect(c, r, s, s, color);

/**
 * Half-square triangles: `/` splits a cell from its top-right to bottom-left corner (`a` upper
 * left, `b` lower right); `\` from top-left to bottom-right (`a` upper right, `b` lower left).
 */
function hst(c: number, r: number, diag: '/' | '\\', a: string, b: string, s = 1): Piece[] {
  const [tl, tr, br, bl]: [P, P, P, P] = [
    [c, r],
    [c + s, r],
    [c + s, r + s],
    [c, r + s],
  ];
  return diag === '/'
    ? [
        { poly: [tl, tr, bl], c: a },
        { poly: [tr, br, bl], c: b },
      ]
    : [
        { poly: [tl, tr, br], c: a },
        { poly: [tl, br, bl], c: b },
      ];
}

/** Quarter-square triangles (hourglass): colors of the top, right, bottom, and left triangles. */
function qst(c: number, r: number, s: number, t: string, ri: string, b: string, l: string) {
  const [tl, tr, br, bl, m]: [P, P, P, P, P] = [
    [c, r],
    [c + s, r],
    [c + s, r + s],
    [c, r + s],
    [c + s / 2, r + s / 2],
  ];
  return [
    { poly: [tl, tr, m], c: t },
    { poly: [tr, br, m], c: ri },
    { poly: [br, bl, m], c: b },
    { poly: [bl, tl, m], c: l },
  ];
}

/**
 * Rows of cells, one token each: a color letter is a square, `/XY` or `\XY` a half-square triangle
 * (see `hst`), `.` a cell covered by a bigger piece.
 */
const cells = (rows: string[]): Piece[] =>
  rows.flatMap((row, r) =>
    row
      .trim()
      .split(/\s+/)
      .flatMap((tok, c) =>
        tok === '.'
          ? []
          : tok.length === 1
            ? [sq(c, r, tok)]
            : hst(c, r, tok[0] as '/' | '\\', tok[1]!, tok[2]!),
      ),
  );

/** Four copies of a quadrant's pieces (built at 0,0), shifted to each quadrant of a 2h × 2h grid. */
const quads = (h: number, pieces: Piece[]) =>
  [
    [0, 0],
    [h, 0],
    [0, h],
    [h, h],
  ].flatMap(([dx, dy]) =>
    pieces.map((p) => ({ ...p, poly: p.poly.map(([x, y]): P => [x + dx!, y + dy!]) })),
  );

/**
 * Latticed Irish Chain: two diagonal chains on a 14 × 14 grid — black/stripes/medium along
 * c + r ≡ 13, dark/dots/check along c − r = ±7 — woven: the black chain is on top at the upper right
 * crossing, the dark chain at the lower left. Light squares and rectangles fill the two open corners.
 */
function latticedIrishChain(): Piece[] {
  const big = [
    [2, 0, 3, 2],
    [0, 2, 2, 3],
    [2, 2, 3, 3],
    [5, 2, 2, 3],
    [2, 5, 3, 2],
    [9, 7, 3, 2],
    [7, 9, 2, 3],
    [9, 9, 3, 3],
    [12, 9, 2, 3],
    [9, 12, 3, 2],
  ] as const;
  const covered = (c: number, r: number) =>
    big.some(([x, y, w, h]) => c >= x && c < x + w && r >= y && r < y + h);
  const out: Piece[] = big.map(([x, y, w, h]) => rect(x, y, w, h, 'L'));
  for (let r = 0; r < 14; r++)
    for (let c = 0; c < 14; c++) {
      if (covered(c, r)) continue;
      const a = Math.min(...[-1, 13, 27].map((k) => Math.abs(c + r - k)));
      const b = Math.min(Math.abs(c - r - 7), Math.abs(c - r + 7));
      const fromK = a <= 2 ? 'KSM'[a] : undefined;
      const fromD = b <= 2 ? 'DQP'[b] : undefined;
      out.push(sq(c, r, (c >= 7 ? (fromK ?? fromD) : (fromD ?? fromK)) ?? 'L'));
    }
  return out;
}

const economy = (center: string[]) =>
  cells([`L /LD \\LD L`, `/LD ${center[0]} \\LD`, `\\DL ${center[1]} /DL`, `L \\DL /DL L`]);

/** The blocks: name, finished size (inches), grid, pieces. */
const DEFS: { name: string; size: number; n: number; pieces: Piece[] }[] = [
  {
    name: 'Sixteen Patch',
    size: 8,
    n: 4,
    pieces: cells(['L D L D', 'D L D L', 'L D L D', 'D L D L']),
  },
  {
    name: "Scot's Plaid",
    size: 8,
    n: 4,
    pieces: cells(['L M M M', 'M L D D', 'M D L L', 'M D L L']),
  },
  {
    name: 'Autumn Tints',
    size: 8,
    n: 4,
    pieces: [sq(0, 0, 'D', 2), sq(2, 2, 'D', 2), ...cells(['. . L K', '. . M L', 'L M', 'K L'])],
  },
  {
    name: 'Shadow Box',
    size: 8,
    n: 4,
    pieces: cells(['K M M M', 'K M M M', 'K M M M', '/KD D D D']),
  },
  { name: 'Jewel', size: 8, n: 2, pieces: cells(['D /DM', 'M M']) },
  {
    name: 'Cotton Reels',
    size: 8,
    n: 4,
    pieces: cells(['L /DM L /DP', '/DM L /DP L', 'L /DQ L /DK', '/DQ L /DK L']),
  },
  {
    name: 'Shoofly',
    size: 8,
    n: 4,
    pieces: cells(['D /DL \\DL D', '/DL L L \\DL', '\\LD L L /LD', 'D \\LD /LD D']),
  },
  {
    name: 'Blockade',
    size: 8,
    n: 4,
    pieces: cells(['\\ML /ML L /LM', 'L /LM L \\ML', '\\LM L /ML L', '/ML L /LM \\LM']),
  },
  {
    name: 'Friendship',
    size: 8,
    n: 4,
    pieces: cells(['K /KL \\DL D', '/KL /LK \\LD \\DL', '\\LP \\PL /ML /LM', 'P \\LP /LM M']),
  },
  {
    name: 'Twelve Triangles',
    size: 8,
    n: 4,
    pieces: cells(['D /DM \\DM D', '/DM /KL \\KL \\DM', '\\MD \\LK /LK /MD', 'D \\MD /MD D']),
  },
  {
    name: 'Friday the Thirteenth',
    size: 9,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [3, 0],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [6, 0],
          [6, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [6, 6],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [3, 6],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [6, 3],
          [5, 3],
          [3, 1],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 3],
          [3, 6],
          [3, 5],
          [5, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [3, 6],
          [0, 3],
          [1, 3],
          [3, 5],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 3],
          [3, 0],
          [3, 1],
          [1, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [3, 1],
          [5, 3],
          [3, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 3],
          [3, 5],
          [3, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 5],
          [1, 3],
          [3, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 3],
          [3, 1],
          [3, 3],
        ],
        c: 'M',
      },
    ],
  },
  { name: 'Yankee Puzzle', size: 8, n: 2, pieces: cells(['\\DL /DL', '/LD \\LD']) },
  {
    name: 'Big Dipper',
    size: 8,
    n: 4,
    pieces: [
      ...qst(0, 0, 2, 'M', 'L', 'M', 'L'),
      ...qst(2, 0, 2, 'L', 'M', 'L', 'M'),
      ...qst(0, 2, 2, 'L', 'M', 'L', 'M'),
      ...qst(2, 2, 2, 'M', 'L', 'M', 'L'),
    ],
  },
  { name: 'Broken Dishes', size: 8, n: 2, pieces: cells(['/ML \\LD', '\\DL /LM']) },
  {
    name: 'Right and Left',
    size: 8,
    n: 4,
    pieces: [
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 0],
          [2, 0],
          [1, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 0],
          [1, 1],
          [0, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 0],
          [4, 2],
          [2, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [4, 0],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 0],
          [4, 2],
          [3, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 2],
          [2, 2],
          [2, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2],
          [1, 3],
          [0, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [1, 3],
          [2, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 2],
          [4, 2],
          [2, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [4, 4],
          [3, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 4],
          [3, 3],
          [4, 4],
        ],
        c: 'M',
      },
    ],
  },
  { name: 'Three-Color Economy', size: 8, n: 4, pieces: economy(['M M', 'M M']) },
  { name: 'Two-Color Economy', size: 8, n: 4, pieces: economy(['L L', 'L L']) },
  { name: 'Economy Pinwheel', size: 8, n: 4, pieces: economy(['\\LM /ML', '/LM \\ML']) },
  {
    name: 'Four-H',
    size: 12,
    n: 6,
    pieces: [
      rect(0, 0, 1, 3, 'M'),
      rect(2, 0, 1, 3, 'M'),
      rect(3, 0, 3, 1, 'M'),
      rect(3, 2, 3, 1, 'M'),
      rect(0, 3, 3, 1, 'M'),
      rect(0, 5, 3, 1, 'M'),
      rect(3, 3, 1, 3, 'M'),
      rect(5, 3, 1, 3, 'M'),
      ...cells(['. L', '. M . L M L', '. L', '. . . . L', 'L M L . M', '. . . . L']),
    ],
  },
  {
    name: 'Sixteen-Patch Plaid',
    size: 16,
    n: 8,
    pieces: [
      sq(0, 0, 'D', 2),
      sq(6, 0, 'M', 2),
      sq(0, 6, 'M', 2),
      sq(6, 6, 'D', 2),
      rect(2, 0, 1, 2, 'L'),
      rect(5, 0, 1, 2, 'L'),
      rect(2, 6, 1, 2, 'L'),
      rect(5, 6, 1, 2, 'L'),
      rect(0, 2, 2, 1, 'L'),
      rect(6, 2, 2, 1, 'L'),
      rect(0, 5, 2, 1, 'L'),
      rect(6, 5, 2, 1, 'L'),
      ...cells([
        '. . . D L',
        '. . . L D',
        '. . D K L M',
        'D L K D M L D L',
        'L D L M D K L D',
        '. . M L K D',
        '. . . D L',
        '. . . L D',
      ]),
    ],
  },
  {
    name: 'White House Steps',
    size: 16,
    n: 8,
    pieces: cells([
      'D D D D D D D D',
      'D L L L L L L D',
      'D L D D D D L D',
      'D L D L L D L D',
      'D L D L L D L D',
      'D L D D D D L D',
      'D L L L L L L D',
      'D D D D D D D D',
    ]),
  },
  {
    name: 'Bright Hopes',
    size: 16,
    n: 8,
    pieces: quads(4, [
      rect(0, 0, 3, 1, 'M'),
      rect(3, 0, 1, 3, 'K'),
      rect(1, 3, 3, 1, 'P'),
      rect(0, 1, 1, 3, 'D'),
      sq(1, 1, 'L', 2),
    ]),
  },
  {
    name: 'Cogwheels',
    size: 16,
    n: 8,
    pieces: quads(4, [
      sq(2, 0, 'L', 2),
      sq(0, 2, 'M', 2),
      ...cells(['L M', 'M L', '. . M L', '. . L M']),
    ]),
  },
  {
    name: 'Red Cross',
    size: 16,
    n: 8,
    pieces: [
      sq(0, 0, 'D', 2),
      sq(6, 0, 'D', 2),
      sq(0, 6, 'D', 2),
      sq(6, 6, 'D', 2),
      ...cells([
        '. . L K K L',
        '. . L K K L',
        'L L L K K L L L',
        'K K K M M K K K',
        'K K K M M K K K',
        'L L L K K L L L',
        '. . L K K L',
        '. . L K K L',
      ]),
    ],
  },
  {
    name: 'Steps to Glory',
    size: 16,
    n: 8,
    pieces: cells([
      'D K M L D M M K',
      'K K M M L M M M',
      'M M K K D L M M',
      'L M K K D D L D',
      'D L L D K K M L',
      'K M D D K K M M',
      'K M M L L L K K',
      'D K K D L L K D',
    ]),
  },
  { name: 'Latticed Irish Chain', size: 21, n: 14, pieces: latticedIrishChain() },
];

const key = ([x, y]: P) => `${x},${y}`;

/** Piece outlines → seam lines (edges split where other corners lie on them, each once). */
function seamsOf(pieces: Piece[], n: number): Seam[] {
  const corners = [...new Map(pieces.flatMap((p) => p.poly).map((v) => [key(v), v])).values()];
  const seen = new Set<string>();
  const out: Seam[] = [];
  for (const { poly } of pieces)
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length]!;
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const len2 = dx * dx + dy * dy;
      const ts = [
        0,
        1,
        ...corners
          .filter(([x, y]) => Math.abs((x - a[0]) * dy - (y - a[1]) * dx) < 1e-9)
          .map(([x, y]) => ((x - a[0]) * dx + (y - a[1]) * dy) / len2)
          .filter((t) => t > 1e-9 && t < 1 - 1e-9),
      ].sort((u, v) => u - v);
      for (let k = 0; k + 1 < ts.length; k++) {
        const p: P = [a[0] + dx * ts[k]!, a[1] + dy * ts[k]!];
        const q: P = [a[0] + dx * ts[k + 1]!, a[1] + dy * ts[k + 1]!];
        const id = [key(p), key(q)].sort().join('|');
        if (seen.has(id)) continue;
        seen.add(id);
        out.push([
          [p[0] / n, p[1] / n],
          [q[0] / n, q[1] / n],
        ]);
      }
    });
  return out;
}

/** The blocks as seams (normalized) and sample points with color names, plus size and category. */
export const FOUR_PATCH_BLOCKS = DEFS.map((d) => ({
  name: d.name,
  size: d.size,
  category: 'N-Patch/Four-patch',
  seams: seamsOf(d.pieces, d.n),
  points: d.pieces.map((p): [number, number, string] => {
    const [sx, sy] = p.poly.reduce(([x, y], [px, py]) => [x + px, y + py], [0, 0]);
    return [sx / p.poly.length / d.n, sy / p.poly.length / d.n, COLORS[p.c]!];
  }),
  /** Color counts by letter (for checking against the source's cutting lists). */
  counts: d.pieces.reduce<Record<string, number>>(
    (m, p) => ({ ...m, [p.c]: (m[p.c] ?? 0) + 1 }),
    {},
  ),
}));
