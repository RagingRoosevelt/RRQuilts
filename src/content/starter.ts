// Built-in starter content: 13 traditional blocks (plus the four-, five-, seven-, and nine-patch families in their own files) drawn originally as seam lines, 36 basic solid
// colors, and five themed palettes, by RRQuilts contributors. Public Domain Mark.
// Default colorings are given as sample points: the patch containing (x, y) gets that color.
import { shapeSize, type BlockShape } from '@/model/blocks/shape';
import { SHAPED_BLOCKS, curvedStarter, shapedStarter } from './shaped';
import { SHAPED_CURVES } from './shaped-curves';
import { produce } from 'immer';
import { deriveSeamPatches } from '@/model/blocks/derive';
import { pathPolygon, pointInPolygon } from '@/model/geometry/path';
import { contentVersion } from '@/model/identity';
import type { SeamBlock, Segment } from '@/model/schema/block';
import { LIBRARY_FORMAT, LIBRARY_VERSION, type LibraryDoc } from '@/model/schema/library';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import { FIVE_PATCH_BLOCKS } from './five-patch';
import { FOUR_PATCH_BLOCKS } from './four-patch';
import { LETTER_BLOCKS, NUMBER_BLOCKS } from './letters';
import { MEDALLION_BLOCKS } from './medallions';
import { NINE_PATCH_BLOCKS } from './nine-patch';
import { PALETTE_COLORINGS } from './palette-colorings';
import { LOG_CABIN_BLOCKS, STRIP_BLOCKS } from './strips';
import { SEVEN_PATCH_BLOCKS } from './seven-patch';

type P = [number, number];

export const STARTER_LIBRARY = {
  name: 'Built-In',
  author: 'RRQuilts contributors',
  /** Traditional designs and plain colors (spec 009). */
  license: 'PDM-1.0',
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

/** Themed palettes; color names are unique across the library (they're the colors' ids). */
export const STARTER_PALETTES: { name: string; colors: [string, [number, number, number]][] }[] = [
  {
    name: 'Pastels',
    colors: [
      ['Blush', [248, 204, 210]],
      ['Peach', [250, 214, 184]],
      ['Lemon Chiffon', [252, 240, 186]],
      ['Pistachio', [204, 232, 196]],
      ['Seafoam', [190, 230, 220]],
      ['Powder Blue', [190, 214, 238]],
      ['Periwinkle', [196, 200, 240]],
      ['Lilac', [214, 198, 232]],
    ],
  },
  {
    name: 'Darks',
    colors: [
      ['Midnight', [20, 24, 48]],
      ['Espresso', [60, 40, 30]],
      ['Oxblood', [90, 20, 28]],
      ['Hunter', [30, 60, 40]],
      ['Slate', [60, 70, 84]],
      ['Aubergine', [60, 28, 60]],
      ['Deep Teal', [16, 72, 80]],
      ['Graphite', [44, 44, 48]],
    ],
  },
  {
    name: 'Gems',
    colors: [
      ['Ruby', [155, 17, 30]],
      ['Garnet', [115, 54, 53]],
      ['Citrine', [228, 200, 30]],
      ['Topaz', [230, 150, 50]],
      ['Emerald', [0, 128, 80]],
      ['Aquamarine', [110, 200, 190]],
      ['Sapphire', [15, 82, 186]],
      ['Amethyst', [153, 102, 204]],
    ],
  },
  {
    name: 'Neon',
    colors: [
      ['Neon Pink', [255, 40, 160]],
      ['Hot Coral', [255, 80, 90]],
      ['Neon Orange', [255, 110, 20]],
      ['Neon Yellow', [240, 255, 30]],
      ['Neon Green', [60, 255, 60]],
      ['Electric Cyan', [0, 240, 255]],
      ['Neon Blue', [30, 140, 255]],
      ['Neon Purple', [180, 40, 255]],
    ],
  },
  {
    name: 'Traditional',
    colors: [
      ['Muslin', [238, 228, 205]],
      ['Shirting', [244, 240, 228]],
      ['Turkey Red', [178, 34, 34]],
      ['Double Pink', [220, 120, 150]],
      ['Cheddar', [232, 150, 40]],
      ['Poison Green', [60, 140, 60]],
      ['Prussian Blue', [30, 50, 90]],
      ['Madder Brown', [110, 50, 30]],
    ],
  },
];

interface StarterBlock {
  name: string;
  /** Finished size in inches (default 10); a shaped block's side. */
  size?: number;
  /** Shaped blocks (spec 026). */
  shape?: BlockShape;
  /** Category path in the built-in library ("Stars/Eight-point stars"). */
  category: string;
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
    // One patch, no seams: a plain square (alternate blocks, blocks between on point).
    name: 'Plain Block',
    category: 'Basics',
    seams: [],
    base: C.Cream!,
    points: [],
  },
  {
    name: 'Four Patch',
    category: 'N-Patch/Four-patch',
    seams: cross,
    base: C.Cream!,
    points: [
      [0.25, 0.25, C.Red!],
      [0.75, 0.75, C.Red!],
    ],
  },
  {
    name: 'Nine Patch',
    category: 'N-Patch/Nine-patch',
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
    category: 'N-Patch',
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
    category: 'N-Patch/Four-patch',
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
    category: 'N-Patch/Four-patch',
    seams: diagonals,
    base: C.Cream!,
    points: [
      [0.5, 0.2, C.Plum!],
      [0.5, 0.8, C.Plum!],
    ],
  },
  {
    name: 'Flying Geese',
    category: 'N-Patch',
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
    category: 'Medallions',
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
    category: 'Strips/Strips',
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
    name: 'Basic Log Cabin',
    category: 'Strips/Log Cabin',
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
    category: 'N-Patch/Nine-patch',
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
    category: 'Stars/Eight-point stars',
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
    category: 'Curves',
    seams: [[[0.6, 0], [0, 0.6], -90]],
    base: C.Cream!,
    points: [[0.2, 0.2, C.Denim!]],
  },
  ...[
    ...FOUR_PATCH_BLOCKS,
    ...FIVE_PATCH_BLOCKS,
    ...SEVEN_PATCH_BLOCKS,
    ...NINE_PATCH_BLOCKS,
    ...LETTER_BLOCKS,
    ...NUMBER_BLOCKS,
    ...LOG_CABIN_BLOCKS,
    ...STRIP_BLOCKS,
    ...MEDALLION_BLOCKS,
    ...SHAPED_BLOCKS.map(shapedStarter),
    ...SHAPED_CURVES.map(curvedStarter),
  ].map((b) => ({
    name: b.name,
    size: b.size,
    ...('shape' in b ? { shape: b.shape } : {}),
    category: b.category,
    seams: b.seams,
    base: C.Cream!,
    points: b.points.map(([x, y, color]): [number, number, number] => [x, y, C[color]!]),
  })),
];

// --- Built-in library (spec 008) ---------------------------------------------------------------

export const LIBRARY_ID = 'rrquilts-starter';
/** Blocks renamed to the reference book's names (lettered variants to its numbers, 2026-10-20):
 *  each keeps the id its former name gave it, so projects and annotations still find it. */
const FORMER: Record<string, string> = {
  'Double Irish Chain I': 'Double Irish Chain A',
  'Double Irish Chain II': 'Double Irish Chain B',
  "King's Crown II": "King's Crown B",
  'Providence Block II': 'Providence Block B',
  "Joseph's Coat II": "Joseph's Coat B",
  'Mexican Cross I': 'Mexican Cross A',
  "Grandmother's Own III": "Grandmother's Own C",
  "Grandmother's Own IV": "Grandmother's Own D",
  "Grandmother's Cross II": "Grandmother's Cross B",
  'Dove in a Window II': 'Dove in a Window B',
  'Red Cross I': 'Red Cross A',
  'Nine-Patch Variation I': 'Nine-Patch Variation A',
  'Nine-Patch Variation II': 'Nine-Patch Variation B',
  'Basketweave I': 'Basketweave A',
  'Tree Everlasting I': 'Tree Everlasting A',
  'Hourglass II': 'Hourglass B',
  'Hourglass III': 'Hourglass C',
  'Handy Andy II': 'Handy Andy B',
  'Flying Dutchman II': 'Flying Dutchman B',
  'Arizona II': 'Arizona B',
  'Attic Window I': 'Attic Window A',
  'Steps to the Altar II': 'Steps to the Altar B',
  'Railroad II': 'Railroad B',
  'Rolling Pinwheel II': 'Rolling Pinwheel B',
  'Shoofly II': 'Shoofly B',
  'Double Pinwheel III': 'Double Pinwheel C',
  'Greek Cross II': 'Greek Cross B',
  'New Album I': 'New Album A',
  'Single Wedding Ring II': 'Single Wedding Ring B',
};
const libId = (name: string) =>
  `rrquilts.${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
const credit = (name: string) => ({
  libraryId: LIBRARY_ID,
  itemId: libId(FORMER[name] ?? name),
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
  // Deriving hundreds of blocks' patches is slow: build once, hand out copies (callers mutate).
  return structuredClone((built ??= buildItems()));
}
let built: BuiltinItems | undefined;
function buildItems(): BuiltinItems {
  const colors: Color[] = [...STARTER_COLORS, ...STARTER_PALETTES.flatMap((p) => p.colors)].map(
    ([name, rgb]) => ({
      id: libId(name),
      notecard: { name },
      rgb,
      source: credit(name),
      revision: 1,
    }),
  );
  const blocks = STARTER_BLOCKS.map((b): SeamBlock => {
    const size: [number, number] = b.shape
      ? shapeSize(b.shape, 'leg', b.size ?? 4)
      : [b.size ?? 10, b.size ?? 10];
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
    const patches = deriveSeamPatches(drawing, size, b.shape).patches.map((p, i) => ({
      id: `p${i + 1}`,
      path: p.path,
    }));
    const fills: Record<string, { color: string }> = {};
    for (const p of patches) {
      const poly = pathPolygon(p.path, size);
      const hit = b.points.find(([px, py]) => pointInPolygon([px, py], poly));
      fills[p.id] = { color: colors[hit ? hit[2] : b.base]!.id };
    }
    const block: SeamBlock = {
      id: libId(FORMER[b.name] ?? b.name),
      kind: 'seam',
      size,
      ...(b.shape ? { shape: b.shape } : {}),
      notecard: { name: b.name },
      source: credit(b.name),
      revision: 1,
      drawing,
      patches,
      colorings: [
        { id: 'k1', name: 'Basic colors', fills },
        // One coloring per themed palette: the basic colors swapped for that palette's.
        ...STARTER_PALETTES.flatMap((pal, i) => {
          const swap = new Map(
            (PALETTE_COLORINGS[b.name]?.[i] ?? '')
              .split(',')
              .filter(Boolean)
              .map((kv) => kv.split('=').map(libId) as [string, string]),
          );
          return swap.size
            ? [
                {
                  id: `k${i + 2}`,
                  name: pal.name,
                  fills: Object.fromEntries(
                    Object.entries(fills).map(([p, f]) => [
                      p,
                      { color: swap.get(f.color) ?? f.color },
                    ]),
                  ),
                },
              ]
            : [];
        }),
      ],
    };
    return block;
  });
  return { colors, blocks };
}

/** The built-in library with content versions (computed once at startup). */
export async function builtinLibrary(): Promise<BuiltinItems> {
  const items = builtinItems();
  for (const x of [...items.colors, ...items.blocks]) x.version = await contentVersion(x, 'in');
  return items;
}

/** Built-in categories, two levels ("Parent/Child"); parents listed before their children. */
const STARTER_CATEGORIES = [
  'Basics',
  'Medallions',
  'Strips',
  'Strips/Log Cabin',
  'Strips/Strips',
  'N-Patch',
  'N-Patch/Four-patch',
  'N-Patch/Five-patch',
  'N-Patch/Seven-patch',
  'N-Patch/Nine-patch',
  'Mosaics',
  'Images',
  'Images/Flowers',
  'Images/Plants',
  'Images/Animals',
  'Stars',
  'Stars/Four-point stars',
  'Stars/Eight-point stars',
  'Curves',
  'Symbols',
  'Symbols/Letters',
  'Symbols/Numbers',
];
const catId = (path: string) =>
  `rrquilts.category.${path
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, '-')
    .replace('/', '.')}`;

/** The built-in library as a library document (its colors as one collection, "Basic colors"). */
export function builtinDoc(items: BuiltinItems): LibraryDoc {
  return {
    format: LIBRARY_FORMAT,
    version: LIBRARY_VERSION,
    units: 'in',
    kind: 'pack',
    id: LIBRARY_ID,
    revision: 1,
    name: STARTER_LIBRARY.name,
    author: { name: STARTER_LIBRARY.author },
    license: STARTER_LIBRARY.license,
    categories: STARTER_CATEGORIES.map((path) => {
      const [top, sub] = path.split('/');
      return sub
        ? { id: catId(path), name: sub, parent: catId(top!) }
        : { id: catId(path), name: top! };
    }),
    items: [
      ...items.blocks.map((data, i) => ({
        type: 'block' as const,
        category: catId(STARTER_BLOCKS[i]!.category),
        data,
      })),
      ...[{ name: 'Basic colors', colors: STARTER_COLORS }, ...STARTER_PALETTES].map((p) => ({
        type: 'colors' as const,
        data: {
          id: `rrquilts.${p.name.toLowerCase().replace(/ /g, '-')}`,
          notecard: { name: p.name },
          author: STARTER_LIBRARY.author,
          license: STARTER_LIBRARY.license,
          colors: p.colors.map(([name]) => items.colors.find((c) => c.notecard.name === name)!),
        },
      })),
    ],
  };
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
