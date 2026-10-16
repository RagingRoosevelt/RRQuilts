// Test-only engine presets for every planned lattice layout (spec 016 FR-002a, SC-004). They prove
// the engine can make each style; the user-facing presets come with later specs.
import { tile, type Band, type CellPiece, type Merge, type Tiling } from '@/model/layout/engine';
import type { Bounds, Slot, SpaceShape } from '@/model/layout/slots';
import type { PathCommand } from '@/model/schema/shared';
import type { M } from '@/model/geometry/affine';

export interface Preset {
  name: string;
  slots: Slot[];
  /** The quilt rectangle when trimmed; null for a shaped edge (whole spaces only). */
  clip: Bounds | null;
}

const R3 = Math.sqrt(3);
const Q: Bounds = [0, 0, 48, 36];

const piece = (
  name: string,
  shape: SpaceShape,
  transform: M,
  outline?: PathCommand[],
  turns = 90,
): CellPiece => ({
  kind: 'block',
  shape,
  turns,
  size: [Math.hypot(transform[0], transform[1]), Math.hypot(transform[2], transform[3])],
  transform,
  ...(outline ? { outline } : {}),
  id: (i, j) => `${name}:i${i}j${j}`,
  alt: (i, j) => (((i + j) % 2) + 2) % 2,
});
const band = (cell: CellPiece[], a: [number, number], b: [number, number], n = 12): Band => ({
  cell,
  a,
  b,
  i: [-n, n],
  j: [-n, n],
});
const run = (name: string, t: Tiling, merges: Merge[] = []): Preset => ({
  name,
  slots: tile({ ...t, merges }),
  clip: t.clip ?? null,
});

/** Diamonds measured through the block: a lattice of squares sheared and turned as a whole. */
const variablePoint = () =>
  run('Variable Point', {
    bands: [band([piece('b', 'rect', [1, 0, 0, 1, 0, 0])], [1, 0], [0, 1], 40)],
    map: [5, 3, -5, 3, 24, -12],
    clip: Q,
  });

/** Three diamonds per cube on a hexagon lattice; `squash` < 1 gives Variable Blocks. */
function babyBlocks(squash = 1) {
  const a = 4;
  const [w, h] = [(a * R3) / 2, a / 2];
  const P = {
    top: [0, -a],
    ur: [w, -h],
    lr: [w, h],
    bot: [0, a],
    ll: [-w, h],
    ul: [-w, -h],
    o: [0, 0],
  } as const;
  const para = (o: readonly number[], x: readonly number[], y: readonly number[]): M => [
    x[0]! - o[0]!,
    x[1]! - o[1]!,
    y[0]! - o[0]!,
    y[1]! - o[1]!,
    o[0]!,
    o[1]!,
  ];
  const cell = [
    piece('top', 'diamond60', para(P.ul, P.top, P.o), undefined, 180),
    piece('left', 'diamond60', para(P.ul, P.o, P.ll), undefined, 180),
    piece('right', 'diamond60', para(P.o, P.ur, P.bot), undefined, 180),
  ];
  return run(squash === 1 ? 'Baby Blocks' : 'Variable Blocks', {
    bands: [band(cell, [2 * w, 0], [w, 3 * h], 14)],
    map: [1, 0, 0, squash, 0, 0],
    clip: Q,
  });
}

/** Vertical strips: a plain strip, then a strip of blocks dropped half a block. */
const strips = () =>
  run('Vertical Strip', {
    bands: [
      {
        cell: [{ ...piece('plain', 'rect', [6, 0, 0, 36, 0, 0]), kind: 'sash' }],
        a: [12, 0],
        b: [0, 1],
        i: [0, 3],
        j: [0, 0],
      },
      {
        cell: [piece('drop', 'rect', [6, 0, 0, 6, 6, -3])],
        a: [12, 0],
        b: [0, 6],
        i: [0, 3],
        j: [0, 6],
      },
    ],
    clip: Q,
  });

/** One Patch: bricks, each row shifted half a brick (two pieces per cell). */
const onePatch = () =>
  run('One Patch', {
    bands: [
      band(
        [
          piece('p', 'rect', [4, 0, 0, 2, 0, 0], undefined, 180),
          piece('q', 'rect', [4, 0, 0, 2, 2, 2], undefined, 180),
        ],
        [4, 0],
        [0, 4],
      ),
    ],
    clip: Q,
  });

/** Triangle grid: each cell an up and a down triangle, ids `t:i{i}j{j}{u|d}`. */
function triangleBand(s: number, n = 24): Band {
  const h = (s * R3) / 2;
  const tri = (ud: 'u' | 'd', outline: PathCommand[]): CellPiece => ({
    ...piece('t', 'triangle', [s * 1.5, 0, 0, h, -s / 2, 0], outline, 120),
    id: (i, j) => `t:i${i}j${j}${ud}`,
  });
  // Unit box spans x from −s/2 to s (×1.5), y 0…h: down = O, O+a, O+b; up = O+a, O+a+b, O+b.
  const X = (x: number) => (x + s / 2) / (1.5 * s);
  const d = tri('d', [['M', X(0), 0], ['L', X(s), 0], ['L', X(s / 2), 1], ['Z']]);
  const u = tri('u', [['M', X(s), 0], ['L', X(1.5 * s), 1], ['L', X(s / 2), 1], ['Z']]);
  // ponytail: the box is wider than the cell, fine for a test preset (transform only maps blocks).
  return band([d, u], [s, 0], [s / 2, h], n);
}

const triangles = () => run('Triangle', { bands: [triangleBand(4)], clip: Q });

const diamonds = () =>
  run('Diamond (60°)', {
    bands: [
      band(
        [piece('d', 'diamond60', [4, 0, 2, 2 * R3, 0, 0], undefined, 180)],
        [4, 0],
        [2, 2 * R3],
        16,
      ),
    ],
    clip: Q,
  });

/** The six grid triangles around vertex (i, j). */
const around = (i: number, j: number) => [
  `t:i${i}j${j}d`,
  `t:i${i - 1}j${j}u`,
  `t:i${i - 1}j${j}d`,
  `t:i${i - 1}j${j - 1}u`,
  `t:i${i}j${j - 1}d`,
  `t:i${i}j${j - 1}u`,
];
function centers(keep: (i: number, j: number) => boolean, n = 24) {
  const out: [number, number][] = [];
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) if (keep(i, j)) out.push([i, j]);
  return out;
}
const mod = (x: number, m: number) => ((x % m) + m) % m;

const hexagons = () =>
  run(
    'Hexagon',
    { bands: [triangleBand(3)], clip: Q },
    centers((i, j) => mod(i - j, 3) === 0).map(([i, j]) => ({
      shape: 'hexagon',
      covers: around(i, j),
    })),
  );

const mixedBabyBlocks = () =>
  run(
    'Baby Blocks (triangle grid)',
    { bands: [triangleBand(3)], clip: Q },
    centers((i, j) => mod(i - j, 3) === 0).flatMap(([i, j]) => {
      const t = around(i, j);
      return [
        { shape: 'diamond60' as const, covers: [t[0]!, t[5]!] },
        { shape: 'diamond60' as const, covers: [t[1]!, t[2]!] },
        { shape: 'diamond60' as const, covers: [t[3]!, t[4]!] },
      ];
    }),
  );

const hexagonsAndTriangles = () =>
  run(
    'Hexagons and Triangles',
    { bands: [triangleBand(3)], clip: Q },
    centers((i, j) => mod(i, 2) === 0 && mod(j, 2) === 0).map(([i, j]) => ({
      shape: 'hexagon',
      covers: around(i, j),
    })),
  );

const star = () =>
  run(
    'Star',
    { bands: [triangleBand(3)], clip: Q },
    centers((i, j) => mod(i, 3) === 0 && mod(j, 3) === 0).map(([i, j]) => ({
      shape: 'hexagon',
      covers: around(i, j),
    })),
  );

/** Clamshells (radius 3): a semicircle over two concave quarter circles; rows offset by r. */
function clamshells(trim: boolean) {
  const outline: PathCommand[] = [
    ['M', 0, 0.5],
    ['A', 1, 0.5, -180],
    ['A', 0.5, 1, 90],
    ['A', 0, 0.5, 90],
    ['Z'],
  ];
  const r = 3;
  const cell = [{ ...piece('c', 'clamshell', [2 * r, 0, 0, 2 * r, -r, -r], outline, 360) }];
  if (trim)
    return run('Clamshell (trimmed)', { bands: [band(cell, [2 * r, 0], [r, r], 20)], clip: Q });
  // Shaped edge: whole clamshells in rows 0…5, 6 across.
  return run('Clamshell (shaped edge)', {
    bands: [{ cell, a: [2 * r, 0], b: [r, r], i: [0, 5], j: [0, 5] }],
  });
}

/** Spools: squares with convex top and bottom, concave sides; every other one turned 90°. */
function spools() {
  const outline: PathCommand[] = [
    ['M', 0, 0],
    ['A', 1, 0, -60],
    ['A', 1, 1, 60],
    ['A', 0, 1, -60],
    ['A', 0, 0, 60],
    ['Z'],
  ];
  const s = 4;
  const cell = [
    piece('a', 'spool', [s, 0, 0, s, 0, 0], outline, 180),
    piece('b', 'spool', [0, s, -s, 0, 2 * s, 0], outline, 180),
  ];
  return run('Spool', { bands: [band(cell, [2 * s, 0], [s, s], 14)], clip: Q });
}

export const presets = (): Preset[] => [
  variablePoint(),
  babyBlocks(),
  babyBlocks(0.8),
  strips(),
  onePatch(),
  triangles(),
  diamonds(),
  hexagons(),
  mixedBabyBlocks(),
  hexagonsAndTriangles(),
  star(),
  clamshells(true),
  clamshells(false),
  spools(),
];
