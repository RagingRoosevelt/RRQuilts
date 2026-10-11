// Starter content for new projects: 12 traditional (public-domain) blocks drawn originally as
// seam lines, and 36 solid colors. CC-BY-4.0, RRQuilts contributors.
// Default colorings are given as sample points: the patch containing (x, y) gets that color.
import { produce } from 'immer';
import { deriveSeamPatches } from '@/model/blocks/derive';
import { pathPolygon, pointInPolygon } from '@/model/geometry/path';
import { contentVersion } from '@/model/identity';
import type { SeamBlock, Segment } from '@/model/schema/block';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';

type P = [number, number];

export const STARTER_LIBRARY = {
  name: 'RRQuilts starter',
  author: 'RRQuilts contributors',
  license: 'CC-BY-4.0',
} as const;
type Seam = [P, P] | [P, P, number]; // line, or arc with sweep (degrees)

export const STARTER_COLORS: [string, [number, number, number]][] = [
  ['White', [250, 250, 248]],
  ['Cream', [244, 236, 216]],
  ['Linen', [230, 220, 200]],
  ['Pale Gray', [214, 214, 210]],
  ['Gray', [150, 150, 148]],
  ['Charcoal', [64, 64, 66]],
  ['Black', [24, 24, 26]],
  ['Tan', [205, 180, 140]],
  ['Brown', [120, 80, 50]],
  ['Rust', [168, 74, 44]],
  ['Red', [196, 40, 44]],
  ['Barn Red', [140, 34, 38]],
  ['Pink', [240, 168, 184]],
  ['Rose', [208, 92, 120]],
  ['Coral', [240, 120, 96]],
  ['Orange', [236, 128, 40]],
  ['Gold', [218, 168, 40]],
  ['Yellow', [248, 216, 72]],
  ['Butter', [250, 236, 160]],
  ['Chartreuse', [180, 200, 60]],
  ['Green', [72, 150, 72]],
  ['Forest', [40, 90, 56]],
  ['Sage', [150, 170, 140]],
  ['Mint', [176, 222, 196]],
  ['Teal', [32, 128, 128]],
  ['Aqua', [96, 196, 208]],
  ['Sky', [150, 196, 232]],
  ['Blue', [48, 104, 176]],
  ['Indigo', [38, 52, 110]],
  ['Navy', [28, 36, 72]],
  ['Lavender', [190, 170, 220]],
  ['Purple', [112, 64, 150]],
  ['Plum', [96, 40, 80]],
  ['Brick', [178, 90, 70]],
  ['Olive', [112, 112, 48]],
  ['Denim', [90, 120, 160]],
];
const C = Object.fromEntries(STARTER_COLORS.map(([name], i) => [name, i]));

interface StarterBlock {
  name: string;
  seams: Seam[];
  base: number;
  points: [number, number, number][];
}

const t = 1 / 3;
const rect = (x0: number, y0: number, x1: number, y1: number, k = 8): Seam[] => {
  const [a, b, c, d] = [x0 / k, y0 / k, x1 / k, y1 / k];
  return [
    [
      [a, b],
      [c, b],
    ],
    [
      [c, b],
      [c, d],
    ],
    [
      [c, d],
      [a, d],
    ],
    [
      [a, d],
      [a, b],
    ],
  ];
};
const grid3: Seam[] = [
  [
    [t, 0],
    [t, 1],
  ],
  [
    [2 * t, 0],
    [2 * t, 1],
  ],
  [
    [0, t],
    [1, t],
  ],
  [
    [0, 2 * t],
    [1, 2 * t],
  ],
];
const cross: Seam[] = [
  [
    [0.5, 0],
    [0.5, 1],
  ],
  [
    [0, 0.5],
    [1, 0.5],
  ],
];
const diagonals: Seam[] = [
  [
    [0, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 0],
  ],
];
const x = (x0: number, y0: number): Seam[] => [
  [
    [x0, y0],
    [x0 + t, y0 + t],
  ],
  [
    [x0 + t, y0],
    [x0, y0 + t],
  ],
];

// Log cabin on an 8-unit grid: center, then three rounds of logs (light top/right, dark bottom/left).
const logs = [
  [2, 2, 5, 3],
  [5, 2, 6, 5],
  [3, 5, 6, 6],
  [2, 3, 3, 6],
  [1, 1, 6, 2],
  [6, 1, 7, 6],
  [2, 6, 7, 7],
  [1, 2, 2, 7],
  [0, 0, 7, 1],
  [7, 0, 8, 7],
  [1, 7, 8, 8],
  [0, 1, 1, 8],
] as const;
const logColors = [C.Cream, C.Linen, C.Indigo, C.Navy];

export const STARTER_BLOCKS: StarterBlock[] = [
  {
    name: 'Four Patch',
    seams: cross,
    base: C.Cream!,
    points: [
      [0.25, 0.25, C.Red!],
      [0.75, 0.75, C.Red!],
    ],
  },
  {
    name: 'Nine Patch',
    seams: grid3,
    base: C.Cream!,
    points: [
      [0.17, 0.17, C.Blue!],
      [0.83, 0.17, C.Blue!],
      [0.5, 0.5, C.Blue!],
      [0.17, 0.83, C.Blue!],
      [0.83, 0.83, C.Blue!],
    ],
  },
  {
    name: 'Half-Square Triangle',
    seams: [
      [
        [0, 0],
        [1, 1],
      ],
    ],
    base: C.Cream!,
    points: [[0.75, 0.25, C.Teal!]],
  },
  {
    name: 'Pinwheel',
    seams: [...cross, ...diagonals],
    base: C.White!,
    points: [
      [0.33, 0.17, C.Orange!],
      [0.83, 0.33, C.Orange!],
      [0.67, 0.83, C.Orange!],
      [0.17, 0.67, C.Orange!],
    ],
  },
  {
    name: 'Hourglass',
    seams: diagonals,
    base: C.Cream!,
    points: [
      [0.5, 0.2, C.Plum!],
      [0.5, 0.8, C.Plum!],
    ],
  },
  {
    name: 'Flying Geese',
    seams: [
      [
        [0, 0.5],
        [1, 0.5],
      ],
      [
        [0, 0.5],
        [0.5, 0],
      ],
      [
        [0.5, 0],
        [1, 0.5],
      ],
      [
        [0, 1],
        [0.5, 0.5],
      ],
      [
        [0.5, 0.5],
        [1, 1],
      ],
    ],
    base: C.Sky!,
    points: [
      [0.5, 0.3, C.Forest!],
      [0.5, 0.8, C.Forest!],
    ],
  },
  {
    name: 'Square in a Square',
    seams: [
      [
        [0.5, 0],
        [1, 0.5],
      ],
      [
        [1, 0.5],
        [0.5, 1],
      ],
      [
        [0.5, 1],
        [0, 0.5],
      ],
      [
        [0, 0.5],
        [0.5, 0],
      ],
    ],
    base: C.Gold!,
    points: [[0.5, 0.5, C['Barn Red']!]],
  },
  {
    name: 'Rail Fence',
    seams: [
      [
        [t, 0],
        [t, 1],
      ],
      [
        [2 * t, 0],
        [2 * t, 1],
      ],
    ],
    base: C.Mint!,
    points: [
      [0.5, 0.5, C.Teal!],
      [0.83, 0.5, C.Forest!],
    ],
  },
  {
    name: 'Log Cabin',
    seams: [...rect(3, 3, 5, 5), ...logs.flatMap(([a, b, c, d]) => rect(a, b, c, d))],
    base: C.Cream!,
    points: [
      [0.5, 0.5, C.Red!],
      ...logs.map(([a, b, c, d], i): [number, number, number] => [
        (a + c) / 16,
        (b + d) / 16,
        logColors[(i % 4 >= 2 ? 2 : 0) + (Math.floor(i / 4) % 2)]!,
      ]),
    ],
  },
  {
    name: 'Churn Dash',
    seams: [
      ...grid3,
      [
        [t, 0],
        [0, t],
      ],
      [
        [2 * t, 0],
        [1, t],
      ],
      [
        [1, 2 * t],
        [2 * t, 1],
      ],
      [
        [0, 2 * t],
        [t, 1],
      ],
      [
        [t, 1 / 6],
        [2 * t, 1 / 6],
      ],
      [
        [t, 5 / 6],
        [2 * t, 5 / 6],
      ],
      [
        [1 / 6, t],
        [1 / 6, 2 * t],
      ],
      [
        [5 / 6, t],
        [5 / 6, 2 * t],
      ],
    ],
    base: C.Cream!,
    points: [
      [0.22, 0.22, C.Brick!],
      [0.78, 0.22, C.Brick!],
      [0.78, 0.78, C.Brick!],
      [0.22, 0.78, C.Brick!],
      [0.5, 0.25, C.Brick!],
      [0.5, 0.75, C.Brick!],
      [0.25, 0.5, C.Brick!],
      [0.75, 0.5, C.Brick!],
    ],
  },
  {
    name: 'Ohio Star',
    seams: [...grid3, ...x(t, 0), ...x(0, t), ...x(2 * t, t), ...x(t, 2 * t)],
    base: C.Cream!,
    points: [
      [0.5, 0.5, C.Red!],
      [0.39, 0.17, C.Navy!],
      [0.61, 0.17, C.Navy!],
      [0.39, 0.83, C.Navy!],
      [0.61, 0.83, C.Navy!],
      [0.17, 0.39, C.Navy!],
      [0.17, 0.61, C.Navy!],
      [0.83, 0.39, C.Navy!],
      [0.83, 0.61, C.Navy!],
    ],
  },
  {
    name: "Drunkard's Path",
    seams: [[[0.6, 0], [0, 0.6], -90]],
    base: C.Cream!,
    points: [[0.2, 0.2, C.Denim!]],
  },
  {
    // The "Super S" / "Cool S": drawn on a 2 × 5 grid (u, v), 2" units, centered in the block.
    name: 'Super S',
    seams: superS(),
    base: C.Cream!,
    points: [
      [0.38, 0.3, C['Barn Red']!], // top-left column + point
      [0.5, 0.5, C['Barn Red']!], // diagonal
      [0.62, 0.7, C['Barn Red']!], // bottom-right column + point
      [0.62, 0.3, C.Gold!], // upper hook
      [0.38, 0.7, C.Gold!], // lower hook
    ],
  },
];

function superS(): Seam[] {
  const P = (u: number, v: number): P => [(3 + 2 * u) / 10, v / 5];
  const path = (pts: [number, number][]): Seam[] =>
    pts.slice(1).map((q, i) => [P(...pts[i]!), P(...q)]);
  return [
    // Outline, clockwise from the top point (the points touch the block's top and bottom edges).
    ...path([
      [1, 0],
      [2, 1],
      [2, 2],
      [1.5, 2.5],
      [2, 3],
      [2, 4],
      [1, 5],
      [0, 4],
      [0, 3],
      [0.5, 2.5],
      [0, 2],
      [0, 1],
      [1, 0],
    ]),
    // Inside: the two middle lines, the two diagonals, and two short seams so every piece can be sewn.
    [P(1, 0), P(1, 2)],
    [P(1, 3), P(1, 5)],
    [P(0, 2), P(1, 3)],
    [P(1, 2), P(2, 3)],
    [P(0, 2), P(1, 2)],
    [P(1, 3), P(2, 3)],
  ];
}

// --- Built-in library (spec 008) ---------------------------------------------------------------

export const LIBRARY_ID = 'rrquilts-starter';
const libId = (name: string) =>
  `rrquilts.${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
const credit = (name: string) => ({
  libraryId: LIBRARY_ID,
  itemId: libId(name),
  revision: 1,
  name,
  library: STARTER_LIBRARY.name,
  author: STARTER_LIBRARY.author,
  license: STARTER_LIBRARY.license,
});

export interface BuiltinItems {
  colors: Color[];
  blocks: SeamBlock[];
}

/**
 * The built-in library in inches, with deterministic ids (`rrquilts.<name>`, and n1/s1/p1… inside
 * blocks) so its content versions are stable across app loads.
 */
export function builtinItems(): BuiltinItems {
  const size: [number, number] = [10, 10];
  const colors: Color[] = STARTER_COLORS.map(([name, rgb]) => ({
    id: libId(name),
    notecard: { name },
    rgb,
    source: credit(name),
    revision: 1,
  }));
  const blocks = STARTER_BLOCKS.map((b): SeamBlock => {
    const nodes: { id: string; x: number; y: number }[] = [];
    const node = ([x, y]: P) => {
      const id = `n${nodes.length + 1}`;
      nodes.push({ id, x, y });
      return id;
    };
    const segments: Segment[] = b.seams.map((sm, i) =>
      sm.length === 3
        ? { id: `s${i + 1}`, kind: 'arc', from: node(sm[0]), to: node(sm[1]), sweep: sm[2] }
        : { id: `s${i + 1}`, kind: 'line', from: node(sm[0]), to: node(sm[1]) },
    );
    const drawing = { nodes, segments };
    const patches = deriveSeamPatches(drawing, size).patches.map((p, i) => ({
      id: `p${i + 1}`,
      path: p.path,
    }));
    const fills: Record<string, { color: string }> = {};
    for (const p of patches) {
      const poly = pathPolygon(p.path, size);
      const hit = b.points.find(([px, py]) => pointInPolygon([px, py], poly));
      fills[p.id] = { color: colors[hit ? hit[2] : b.base]!.id };
    }
    return {
      id: libId(b.name),
      kind: 'seam',
      size,
      notecard: { name: b.name, tags: ['starter'] },
      source: credit(b.name),
      revision: 1,
      drawing,
      patches,
      colorings: [{ id: 'k1', fills }],
    };
  });
  return { colors, blocks };
}

/** The built-in library with content versions (computed once at startup). */
export async function builtinLibrary(): Promise<BuiltinItems> {
  const items = builtinItems();
  for (const x of [...items.colors, ...items.blocks]) x.version = await contentVersion(x, 'in');
  return items;
}

/** Embed the whole built-in library into a project, converted to its units (tests, samples). */
export function addStarterContent(doc: RrqDoc): RrqDoc {
  const items = builtinItems();
  const k = doc.units === 'cm' ? 2.54 : 1;
  return produce(doc, (d) => {
    d.project.palette.colors.push(...items.colors);
    d.project.blocks.push(
      ...items.blocks.map((b) => ({
        ...b,
        size: [b.size[0] * k, b.size[1] * k] as [number, number],
      })),
    );
  });
}
