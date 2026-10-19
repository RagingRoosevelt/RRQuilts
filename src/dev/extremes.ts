// Extremes (Tests tab, dev server only): sizes, counts, units and turns at the edges of what a
// quilter would do, to catch arithmetic, clipping and speed problems. Newest first, next id on top.
import type { DevVariation } from './build';

const G = { units: 'Units', size: 'Sizes', count: 'Counts', turn: 'Turned and flipped blocks' };

export const EXTREMES: DevVariation[] = [
  {
    id: 'X12',
    title: 'Shaped blocks turned and flipped',
    group: G.turn,
    expect:
      'Triangle blocks with every third turned one step and every third mirrored; each still fills its space exactly.',
    style: 'shaped-blocks',
    layout: { shape: 'triangles', cols: 6, rows: 4, width: 6 },
    turns: true,
  },
  {
    id: 'X11',
    title: 'Square blocks turned and flipped',
    group: G.turn,
    expect: 'Every third block turned 90°, every third mirrored left to right; none stretched.',
    style: 'straight-set',
    layout: { cols: 4, rows: 4 },
    turns: true,
  },
  {
    id: 'X10',
    title: 'Centimetres: On-Point with sashing',
    group: G.units,
    expect:
      'A centimetre project: 25 cm blocks on point, 4 cm sashing, 7.5 cm border; same look as inches.',
    style: 'on-point',
    layout: { sash: 4 },
    units: 'cm',
  },
  {
    id: 'X09',
    title: 'Centimetres: hexagon blocks',
    group: G.units,
    expect: 'Hexagon blocks with 10 cm sides in a centimetre project, trimmed straight.',
    style: 'shaped-blocks',
    layout: { shape: 'hexagons', cols: 5, rows: 5, width: 10 },
    units: 'cm',
  },
  {
    id: 'X08',
    title: 'Five borders, narrow to wide',
    group: G.size,
    expect: 'Five plain borders from ¼ in to 6 in, each its own color, corners square.',
    style: 'straight-set',
    borders: [0.25, 1, 2, 4, 6].map((w) => ({
      style: 'long-horizontal',
      sides: [w, w, w, w] as [number, number, number, number],
    })),
  },
  {
    id: 'X07',
    title: 'One 60 in block',
    group: G.size,
    expect: 'A single huge block, crisp at any zoom.',
    style: 'straight-set',
    layout: { cols: 1, rows: 1, block: [60, 60] },
  },
  {
    id: 'X06',
    title: 'Half-inch blocks',
    group: G.size,
    expect: 'A 10 × 10 grid of ½ in blocks: tiny but every piece drawn.',
    style: 'straight-set',
    layout: { cols: 10, rows: 10, block: [0.5, 0.5] },
    borders: [{ style: 'long-horizontal', sides: [0.5, 0.5, 0.5, 0.5] }],
  },
  {
    id: 'X05',
    title: 'Long thin blocks',
    group: G.size,
    expect: 'Twelve 2 × 24 in block spaces side by side, blocks stretched tall.',
    style: 'straight-set',
    layout: { cols: 12, rows: 1, block: [2, 24] },
    fill: 'one',
  },
  {
    id: 'X04',
    title: '1 × 1 On-Point',
    group: G.count,
    expect: 'One block on point with four setting triangles around it.',
    style: 'on-point',
    layout: { cols: 1, rows: 1 },
  },
  {
    id: 'X03',
    title: '1 × 1 Straight Set, no border',
    group: G.count,
    expect: 'One block, nothing else.',
    style: 'straight-set',
    layout: { cols: 1, rows: 1 },
    borders: [],
  },
  {
    id: 'X02',
    title: '60 × 60 hexagon patches',
    group: G.count,
    expect:
      'A dense hexagon field in two alternating colors (filled with All and Alternate); check the build and draw times.',
    style: 'one-patch',
    layout: { shape: 'hexagons', cols: 60, rows: 60, width: 1, height: 1 },
  },
  {
    id: 'X01',
    title: '40 × 40 blocks',
    group: G.count,
    expect: '1,600 small blocks, all filled; check the build and draw times.',
    style: 'straight-set',
    layout: { cols: 40, rows: 40, block: [2, 2] },
    fill: 'one',
  },
];
