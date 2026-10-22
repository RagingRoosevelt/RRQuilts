// Setting sweeps (Tests tab, dev server only): one layout with one setting stepped through its
// range, side by side, with one expectation for the row. Add sweeps at the top with the next id.
import type { DevVariation } from './build';

interface Sweep {
  id: string;
  title: string;
  /** What the row as a whole should show. */
  expect: string;
  base: Omit<DevVariation, 'id' | 'title' | 'group'>;
  /** Each step: its caption and the settings it changes. */
  steps: { label: string; layout?: Record<string, unknown>; borders?: DevVariation['borders'] }[];
}

const SWEEPS: Sweep[] = [
  {
    id: 'S10',
    title: 'Diamond Point blocks across, in halves',
    expect:
      'Each half step adds one column of 60° diamonds at the right: a short column (one diamond fewer down), then the next long one. Setting triangles always finish the right edge.',
    base: { style: 'diamond-point', layout: { cols: 2, rows: 3 } },
    steps: [2, 2.5, 3, 3.5].map((cols) => ({ label: `${cols} across`, layout: { cols } })),
  },
  {
    id: 'S09',
    title: 'On-Point blocks down, in halves',
    expect:
      'Each half step adds one row of diamonds at the bottom: 2½ ends on a short row (2 blocks), 3 adds the next long row (3 blocks), and so on. The width never changes; setting triangles always finish the bottom.',
    base: { style: 'on-point', layout: { cols: 3, rows: 2 } },
    steps: [2, 2.5, 3, 3.5, 4].map((rows) => ({ label: `${rows} down`, layout: { rows } })),
  },
  {
    id: 'S08',
    title: 'Shaped Blocks edges, trimmed or whole',
    expect:
      'Each shape trimmed to a straight rectangle with its border, then left whole with a zigzag edge and no border (borders are set aside, spec 016 FR-022); the blocks inside are the same in both.',
    base: { style: 'shaped-blocks', layout: { cols: 5, rows: 5, width: 4 } },
    steps: ['triangles', 'diamonds', 'hexagons'].flatMap((shape) => [
      { label: `${shape}, trimmed`, layout: { shape, edge: 'trim' } },
      { label: `${shape}, whole`, layout: { shape, edge: 'none' } },
    ]),
  },
  {
    id: 'S07',
    title: 'One Patch shapes',
    expect: 'Every One Patch shape tiling the quilt with no gaps or overlaps, trimmed straight.',
    base: { style: 'one-patch', layout: { cols: 8, rows: 8, width: 3, height: 3 } },
    steps: [
      'squares',
      'rectangles',
      'bricks',
      'half-square-triangles',
      'triangles',
      'diamonds',
      'hexagons',
      'tumblers',
      'clamshells',
      'octagons',
    ].map((shape) => ({ label: shape, layout: { shape } })),
  },
  {
    id: 'S06',
    title: 'Variable Patch cube proportions',
    expect:
      'Cubes from flat to tall: the top diamonds shrink as the sides grow; faces always meet.',
    base: { style: 'variable-blocks' },
    steps: [
      [6, 2],
      [5, 3],
      [4, 4],
      [3, 5],
      [2, 6],
    ].map(([top, side]) => ({ label: `top ${top}, side ${side}`, layout: { top, side } })),
  },
  {
    id: 'S05',
    title: 'Variable Point diamond height',
    expect: 'Diamonds 5 in wide growing taller; the setting triangles stretch to match.',
    base: { style: 'variable-point', layout: { width: 5 } },
    steps: [5, 7.5, 10, 12.5, 15].map((height) => ({
      label: `height ${height}`,
      layout: { height },
    })),
  },
  {
    id: 'S04',
    title: 'Straight Set sashing widths',
    expect:
      'Sashing from none to wide, with a sash border; the blocks keep their size and the quilt grows.',
    base: { style: 'straight-set', layout: { sashBorder: true } },
    steps: [0, 1, 2, 4].map((w) => ({ label: `sash ${w}`, layout: { sash: [w, w] } })),
  },
  {
    id: 'S03',
    title: 'On-Point edges, with and without sashing',
    expect:
      'Each edge finish (exact, floating 2 in, partial blocks, zigzag) without and then with 1.5 in sashing.',
    base: { style: 'on-point' },
    steps: (['exact', 'float', 'trim', 'none'] as const).flatMap((finish) =>
      [0, 1.5].map((sash) => ({
        label: `${finish}, sash ${sash}`,
        layout: { edge: { finish, float: finish === 'float' ? 2 : 0 }, sash },
      })),
    ),
  },
  {
    id: 'S02',
    title: 'One Patch triangles, flow angle',
    expect: 'The triangle grid turning with the slider; 60° looks the same as 0°.',
    base: {
      style: 'one-patch',
      layout: { shape: 'triangles', cols: 10, rows: 8, width: 4, height: 4 },
    },
    steps: [0, 15, 30, 45, 60].map((flow) => ({ label: `flow ${flow}°`, layout: { flow } })),
  },
  {
    id: 'S01',
    title: 'Hexagon blocks, flow angle',
    expect:
      'The hexagon grid and its blocks turning together, always trimmed straight; 60° looks the same as 0°.',
    base: { style: 'shaped-blocks', layout: { shape: 'hexagons', cols: 5, rows: 5, width: 4 } },
    steps: [0, 15, 30, 45, 60].map((flow) => ({ label: `flow ${flow}°`, layout: { flow } })),
  },
];

/** One quilt per step; the steps' own changes show as the key settings. */
export const SWEEP_QUILTS: DevVariation[] = SWEEPS.flatMap((s) =>
  s.steps.map((step, i) => ({
    ...s.base,
    id: `${s.id}.${i + 1}`,
    title: step.label,
    group: `${s.id} ${s.title}`,
    note: s.expect,
    layout: { ...s.base.layout, ...step.layout },
    ...(step.borders ? { borders: step.borders } : {}),
  })),
);
