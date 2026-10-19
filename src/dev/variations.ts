// Layout gallery (manual testing aid, dev server only: Tests tab): quilts built with each layout and
// its settings, with blocks, solids and mixes, drawn live with what each should show.
// NEWEST FIRST: put new variations at the top with the next id (G###, never reused or renumbered),
// and say in `added` which feature brought them.
import type { DevVariation } from './build';
import type { FillMode } from './fill-quilt';

export interface Variation {
  id: string;
  title: string;
  /** The feature (spec) that introduced what this shows. */
  added: string;
  /** What a correct picture shows. */
  expect: string;
  /** Layout style; the quilt starts from a 3×3 Straight Set of 10 in blocks converted to it. */
  style: string;
  /** Settings changed from that start (shown on the page as the key settings). */
  layout?: Record<string, unknown>;
  borders?: { style: string; sides: [number, number, number, number]; blocks?: [number, number] }[];
  fill?: FillMode;
}

const strip = (id: string, style: string, width: number, along = 4, across = 1) => ({
  id,
  style,
  width,
  along,
  across,
});

export const VARIATIONS: Variation[] = [
  {
    id: 'G024',
    title: 'Hexagon blocks, each different',
    added: 'Spec 026 shaped blocks',
    expect:
      'Pointy-top hexagon spaces, each holding a different hexagon block whole (not stretched), edges trimmed straight.',
    style: 'shaped-blocks',
    layout: { shape: 'hexagons', cols: 5, rows: 5, width: 4 },
  },
  {
    id: 'G023',
    title: 'Triangle blocks and solids',
    added: 'Spec 026 shaped blocks',
    expect:
      'Rows of up and down triangles; every other one holds a triangle block, the rest are plain colors. Blocks turn to fit the down triangles.',
    style: 'shaped-blocks',
    layout: { shape: 'triangles', cols: 6, rows: 4, width: 6 },
    fill: 'mix',
  },
  {
    id: 'G022',
    title: 'Diamond blocks on a flow, whole shapes',
    added: 'Spec 026 flow angle',
    expect:
      'The same 60° diamond block in every space, the whole grid turned 30°, the edge left zigzag (no trimming), outer pieces whole.',
    style: 'shaped-blocks',
    layout: { shape: 'diamonds', cols: 5, rows: 5, width: 4, flow: 30, edge: 'none' },
    fill: 'one',
  },
  {
    id: 'G021',
    title: 'Hexagons turned 15°',
    added: 'Spec 026 flow angle',
    expect: 'Hexagon blocks on a grid turned 15°, trimmed to a straight rectangular edge.',
    style: 'shaped-blocks',
    layout: { shape: 'hexagons', cols: 5, rows: 5, width: 4, flow: 15 },
  },
  {
    id: 'G020',
    title: 'Diamond Point with diamond blocks',
    added: 'Spec 026 Diamond Point',
    expect:
      '60° diamonds in an on-point grid, each holding a diamond block, setting triangles painted around them.',
    style: 'diamond-point',
  },
  {
    id: 'G019',
    title: 'Baby Blocks holding blocks',
    added: 'Spec 026 Baby Blocks as blocks',
    expect:
      'Tumbling cubes made of three 60° diamonds, each diamond a block space with a diamond block in it.',
    style: 'baby-blocks',
  },
  {
    id: 'G018',
    title: 'Variable Patch, squat cubes',
    added: 'Spec 018 Variable Blocks (Variable Patch)',
    expect:
      'Cubes with short tops and tall sides, every face a plain color, scrappy, trimmed edge.',
    style: 'variable-blocks',
    layout: { top: 3, side: 6 },
  },
  {
    id: 'G017',
    title: 'Variable Point, tall diamonds',
    added: 'Spec 018 Variable Point',
    expect: 'Diamonds twice as tall as wide in an on-point grid, all plain colors.',
    style: 'variable-point',
    layout: { width: 5, height: 10 },
  },
  {
    id: 'G016',
    title: 'Variable Point, seam corners and sashing',
    added: 'Spec 018 Variable Point',
    expect:
      'Diamonds with sashing between them; the corners are pieced with a seam instead of one triangle.',
    style: 'variable-point',
    layout: { corner: 'seam', sash: 1 },
  },
  {
    id: 'G015',
    title: 'One Patch hexagons on a flow',
    added: 'Spec 018 One Patch (flow: spec 026)',
    expect: 'Scrappy hexagon patches, grid turned 30°, trimmed straight.',
    style: 'one-patch',
    layout: { shape: 'hexagons', cols: 10, rows: 10, width: 2, height: 2, flow: 30 },
  },
  {
    id: 'G014',
    title: 'One Patch half-square triangles',
    added: 'Spec 018 One Patch',
    expect: 'Squares split corner to corner, each half its own color.',
    style: 'one-patch',
    layout: { shape: 'half-square-triangles', cols: 8, rows: 8, width: 4, height: 4 },
  },
  {
    id: 'G013',
    title: 'One Patch clamshells',
    added: 'Spec 018 One Patch',
    expect: 'Overlapping scallop rows of clamshells with curved edges, scrappy colors.',
    style: 'one-patch',
    layout: { shape: 'clamshells', cols: 8, rows: 10, width: 4, height: 4 },
  },
  {
    id: 'G012',
    title: 'One Patch bricks, whole edge',
    added: 'Spec 018 One Patch',
    expect: 'Bricks offset by half a brick each row; the edge left uneven (whole bricks).',
    style: 'one-patch',
    layout: { shape: 'bricks', cols: 6, rows: 12, width: 6, height: 3, edge: 'none' },
  },
  {
    id: 'G011',
    title: 'Pieced borders: points and diamonds',
    added: 'Spec 017 pieced borders',
    expect:
      'Inner plain border, then a points-out border with triangles pointing outward, then a diamonds border; corners meet cleanly.',
    style: 'straight-set',
    borders: [
      { style: 'long-horizontal', sides: [1, 1, 1, 1] },
      { style: 'points-out', sides: [3, 3, 3, 3] },
      { style: 'diamonds', sides: [3, 3, 3, 3] },
    ],
  },
  {
    id: 'G010',
    title: 'Borders: spaced squares and tiles on point',
    added: 'Spec 017 pieced borders',
    expect:
      'A spaced-squares border and a tile-on-point border with corner squares, around blocks and solids.',
    style: 'straight-set',
    fill: 'mix',
    borders: [
      { style: 'spaced-squares', sides: [3, 3, 3, 3] },
      { style: 'tile-on-point-corners', sides: [4, 4, 4, 4] },
    ],
  },
  {
    id: 'G009',
    title: 'Vertical strips with blocks',
    added: 'Spec 017 strip layouts',
    expect:
      'Columns: blocks, plain, half-drop blocks (end blocks cut in half), plain, checkerboard 2 squares across.',
    style: 'vertical-strip',
    layout: {
      strips: [
        strip('a', 'blocks', 8),
        strip('b', 'plain', 2),
        strip('c', 'half-drop-blocks', 8),
        strip('d', 'plain', 2),
        strip('e', 'checker-board', 4, 8, 2),
      ],
    },
  },
  {
    id: 'G008',
    title: 'Horizontal strips: pieced patterns',
    added: 'Spec 017 strip layouts',
    expect:
      'Rows top to bottom: plain, points A, diamonds, double diamonds, spaced squares; each pattern repeats along its row.',
    style: 'horizontal-strip',
    layout: {
      strips: [
        strip('a', 'plain', 3),
        strip('b', 'points-a', 4, 6),
        strip('c', 'diamonds', 5, 5),
        strip('d', 'double-diamonds', 5, 4),
        strip('e', 'spaced-squares', 3, 6),
      ],
    },
  },
  {
    id: 'G007',
    title: 'On Point with sashing, exact edge',
    added: 'Spec 016 On-Point',
    expect:
      'Blocks turned 45° with sashing between, setting triangles cut exactly to the blocks, straight edge.',
    style: 'on-point',
    layout: { sash: 1.5 },
  },
  {
    id: 'G006',
    title: 'On Point, floating blocks',
    added: 'Spec 016 On-Point',
    expect:
      'Oversized setting triangles: the blocks float 2 in from the edge instead of touching it.',
    style: 'on-point',
    layout: { edge: { finish: 'float', float: 2 } },
    fill: 'mix',
  },
  {
    id: 'G005',
    title: 'On Point, partial blocks at the edge',
    added: 'Spec 016 On-Point',
    expect: 'No setting triangles; blocks at the edge are cut by it (half and quarter blocks).',
    style: 'on-point',
    layout: { edge: { finish: 'trim', float: 0 } },
  },
  {
    id: 'G004',
    title: 'On Point, zigzag edge',
    added: 'Spec 016 On-Point',
    expect: 'No setting pieces at all: the zigzag edge of whole blocks is left as it is.',
    style: 'on-point',
    layout: { edge: { finish: 'none', float: 0 } },
    borders: [],
  },
  {
    id: 'G003',
    title: 'Straight Set, blocks and solids alternating',
    added: 'Straight Set (spec 006)',
    expect: 'Checkerboard of blocks and plain squares, no sashing, one plain border.',
    style: 'straight-set',
    layout: { cols: 5, rows: 5 },
    fill: 'mix',
  },
  {
    id: 'G002',
    title: 'Straight Set, rectangular blocks',
    added: 'Straight Set (spec 006)',
    expect:
      'The same block in every space stretched to 8 × 12 in rectangles, sashing with a sash border and cornerstones.',
    style: 'straight-set',
    layout: { cols: 4, rows: 2, block: [8, 12], sash: [2, 2], sashBorder: true },
    fill: 'one',
  },
  {
    id: 'G001',
    title: 'Straight Set, a different block in each space',
    added: 'Straight Set (spec 006)',
    expect: 'Nine different blocks in a 3 × 3 grid with sashing and a plain border.',
    style: 'straight-set',
    layout: { sash: [2, 2] },
  },
];

/** The gallery as Tests tab quilts, one section per feature. */
export const GALLERY: DevVariation[] = VARIATIONS.map((v) => ({ ...v, group: v.added }));
