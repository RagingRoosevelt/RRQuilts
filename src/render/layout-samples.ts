// Small layout pictures drawn by the layout engine: the quilt wizard's style cards and the quilt
// editor's block filter (spec 026).
import type { BlockShape } from '@/model/blocks/shape';
import { flattenLoop, pathToSegs } from '@/model/geometry/path';
import { layoutDefaults, onPointDefaults } from '@/model/io';
import { generateSlots } from '@/model/layout/slots';
import type {
  Border,
  Layout,
  OnePatchLayout,
  PatchShape,
  ShapedBlocksLayout,
  TumblingLayout,
  VariablePointLayout,
} from '@/model/schema/quilt';

/** Outlines of a layout's spaces as SVG paths, or null when there are too many to draw. */
export function picture(l: Layout, b: Border[]) {
  const g = generateSlots(l, b);
  // ponytail: plain SVG paths, capped; a canvas would be needed to preview very large quilts.
  if (g.slots.length > 6000) return null;
  const [x0, y0, x1, y1] = g.bounds;
  return {
    box: `${x0} ${y0} ${x1 - x0} ${y1 - y0}`,
    paths: g.slots.map((s) => ({
      kind: s.kind,
      d: `M${flattenLoop(pathToSegs(s.outline, [1, 1]), 0.05)
        .map((p) => `${p[0]} ${p[1]}`)
        .join('L')}Z`,
    })),
  };
}

export type Style =
  | 'straight-set'
  | 'on-point'
  | 'strips'
  | 'variable-point'
  | 'one-patch'
  | 'shaped-blocks'
  | 'diamond-point'
  | 'baby-blocks'
  | 'variable-blocks';
export const sampleOnePatch = (shape: PatchShape): Layout => ({
  ...(layoutDefaults('one-patch', 1) as OnePatchLayout),
  shape,
  cols: 3,
  rows: 3,
  width: 1,
  height: 1,
});
const sampleStrips = (style: 'horizontal-strip' | 'vertical-strip'): Layout => ({
  style,
  length: 16,
  strips: ['plain', 'blocks', 'plain', 'blocks'].map((st, i) => ({
    id: `w${i}`,
    style: st as 'plain' | 'blocks',
    width: st === 'plain' ? 3 : 4,
    along: 4,
    across: 1,
  })),
});
/** Styles to pick from, each with a small sample. */
const BOTH: ('blocks' | 'patches')[] = ['blocks', 'patches'];
export const STYLES: {
  value: Style;
  label: string;
  sample: Layout;
  modes: ('blocks' | 'patches')[];
}[] = [
  {
    value: 'straight-set',
    label: 'Straight Set',
    modes: BOTH,
    sample: {
      style: 'straight-set',
      cols: 3,
      rows: 3,
      block: [1, 1],
      sash: [0, 0],
      sashBorder: false,
    },
  },
  {
    value: 'on-point',
    label: 'On-Point',
    modes: BOTH,
    sample: { ...onPointDefaults(1), block: 1, edge: { finish: 'exact', float: 0 } },
  },
  { value: 'strips', label: 'Strips', sample: sampleStrips('horizontal-strip'), modes: BOTH },
  {
    value: 'diamond-point',
    label: 'Diamond Point',
    modes: ['blocks'],
    sample: {
      ...(layoutDefaults('diamond-point', 1) as VariablePointLayout),
      width: 1,
      height: Math.sqrt(3),
      edge: { finish: 'exact', float: 0 },
    },
  },
  {
    value: 'variable-point',
    label: 'Variable Point',
    modes: ['patches'],
    sample: {
      ...(layoutDefaults('variable-point', 1) as VariablePointLayout),
      width: 1,
      height: 1.3,
      edge: { finish: 'exact', float: 0 },
    },
  },
  {
    value: 'shaped-blocks',
    label: 'Shaped Blocks',
    modes: ['blocks'],
    sample: { ...sampleOnePatch('hexagons'), style: 'shaped-blocks' } as ShapedBlocksLayout,
  },
  {
    value: 'one-patch',
    label: 'One Patch',
    sample: sampleOnePatch('hexagons'),
    modes: ['patches'],
  },
  {
    value: 'baby-blocks',
    label: 'Baby Blocks',
    modes: ['blocks'],
    sample: {
      ...(layoutDefaults('baby-blocks', 1) as TumblingLayout),
      cols: 3,
      rows: 3,
      width: Math.sqrt(3),
      top: 1,
      side: 1,
    },
  },
  {
    value: 'variable-blocks',
    label: 'Variable Patch',
    modes: ['patches'],
    sample: {
      ...(layoutDefaults('variable-blocks', 1) as TumblingLayout),
      cols: 3,
      rows: 3,
      width: 2,
      top: 1,
      side: 1.4,
    },
  },
];
/** The block shape a filter entry takes: square blocks, or a shaped block (spec 026). */
export type ShapeFilter = 'square' | BlockShape;

const shaped = (shape: PatchShape) =>
  ({ ...sampleOnePatch(shape), style: 'shaped-blocks' }) as ShapedBlocksLayout;
const card = (key: string, label: string, shape: ShapeFilter, sample: Layout) => ({
  key,
  label,
  shape,
  picture: picture(sample, [])!,
});
const sampleOf = (st: Style) => STYLES.find((x) => x.value === st)!.sample;
/** Layouts that hold blocks, each with the block shape its spaces take (Shaped Blocks once per shape). */
export const BLOCK_LAYOUTS = [
  card('straight-set', 'Straight Set', 'square', sampleOf('straight-set')),
  card('on-point', 'On-Point', 'square', sampleOf('on-point')),
  card('strips', 'Strips', 'square', sampleOf('strips')),
  card('baby-blocks', 'Baby Blocks', 'diamond60', sampleOf('baby-blocks')),
  card('diamond-point', 'Diamond Point', 'diamond60', sampleOf('diamond-point')),
  card('shaped-triangles', 'Shaped Blocks: triangles', 'triangle', shaped('triangles')),
  card('shaped-diamonds', 'Shaped Blocks: diamonds', 'diamond60', shaped('diamonds')),
  card('shaped-hexagons', 'Shaped Blocks: hexagons', 'hexagon', shaped('hexagons')),
];

/** Whether a block (its `shape`, none = square) passes the block filter's layout and shape picks. */
export function blockFits(
  shape: BlockShape | undefined,
  layout: string | null,
  pick: ShapeFilter | null,
) {
  const s = shape ?? 'square';
  return (
    (!pick || s === pick) && (!layout || BLOCK_LAYOUTS.find((l) => l.key === layout)?.shape === s)
  );
}
