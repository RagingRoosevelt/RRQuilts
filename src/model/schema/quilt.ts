import Type from 'typebox';
import { ColoringBody } from './coloring';
import { Id, ItemId, Size, Vec2, itemBase } from './shared';

const count = Type.Integer({ minimum: 1, maximum: 100 });
const length = Type.Number({ minimum: 0 });

/** Horizontal layout: rows × cols of blocks, optional sashing and sash border. */
export const HorizontalLayout = Type.Object({
  style: Type.Literal('horizontal'),
  cols: count,
  rows: count,
  block: Size,
  sash: Type.Tuple([length, length]),
  sashBorder: Type.Boolean(),
});

/** Styles whose generators come with the layout feature; parameters are stored as-is for now. */
export const OtherLayout = Type.Object({
  style: Type.Enum([
    'on-point',
    'variable-point',
    'baby-blocks',
    'variable-blocks',
    'horizontal-strip',
    'vertical-strip',
    'one-patch',
    'custom-set',
  ]),
});

export const Layout = Type.Union([HorizontalLayout, OtherLayout]);

export const BorderStyle = Type.Enum([
  'mitered',
  'corner-blocks',
  'long-vertical',
  'long-horizontal',
  'blocks',
  'half-drop-blocks',
  'spaced-squares',
  'diamonds',
  'half-drop-diamonds',
  'double-diamonds',
  'half-drop-double-diamonds',
  'big-little-diamonds',
  'half-drop-big-little-diamonds',
  'points-out',
  'points-in',
  'big-little-points-out',
  'big-little-points-in',
  'tile-on-point',
  'tile-on-point-corners',
  'tile-squares',
  'blocks-aligned-inside',
  'half-drop-aligned',
]);

export const Border = Type.Object({
  style: BorderStyle,
  /** Finished widths: left, top, right, bottom. */
  sides: Type.Tuple([length, length, length, length]),
  /** Block counts along horizontal and vertical sides, for block-space styles. */
  blocks: Type.Optional(Type.Tuple([count, count])),
});

export const SlotContent = Type.Object({
  block: ItemId,
  coloring: Id,
  rotation: Type.Union([Type.Literal(0), Type.Literal(90), Type.Literal(180), Type.Literal(270)]),
  flip: Type.Boolean(),
});

export const Text = Type.Object({
  value: Type.String(),
  font: ItemId,
  size: Type.Number({ exclusiveMinimum: 0 }),
  bold: Type.Boolean(),
  italic: Type.Boolean(),
  align: Type.Union([Type.Literal('left'), Type.Literal('center'), Type.Literal('right')]),
});

export const Item = Type.Object({
  id: Id,
  kind: Type.Enum(['block', 'motif', 'stencil', 'photo', 'text', 'embroidery']),
  ref: Type.Optional(ItemId),
  x: Type.Number(),
  y: Type.Number(),
  w: Type.Number({ exclusiveMinimum: 0 }),
  h: Type.Number({ exclusiveMinimum: 0 }),
  rotation: Type.Number(),
  skew: Vec2,
  flip: Type.Boolean(),
  clip: Type.Union([Type.Literal('none'), Type.Literal('center'), Type.Literal('quilt')]),
  coloring: Type.Optional(Id),
  text: Type.Optional(Text),
});

export const PiecingLayer = Type.Object({
  visible: Type.Boolean(),
  slots: Type.Record(Type.String(), SlotContent),
  items: Type.Array(Item),
});
export const FreeLayer = Type.Object({ visible: Type.Boolean(), items: Type.Array(Item) });

export const Quilt = Type.Object({
  ...itemBase,
  layout: Layout,
  borders: Type.Array(Border),
  /** Coloring table; placements reference entries (copy-on-write on edit). */
  colorings: Type.Record(Type.String(), ColoringBody),
  /** Fixed purposes: [piecing, appliqué, quilting]. */
  layers: Type.Tuple([PiecingLayer, FreeLayer, FreeLayer]),
});

export type HorizontalLayout = Type.Static<typeof HorizontalLayout>;
export type Layout = Type.Static<typeof Layout>;
export type Border = Type.Static<typeof Border>;
export type SlotContent = Type.Static<typeof SlotContent>;
export type Item = Type.Static<typeof Item>;
export type Quilt = Type.Static<typeof Quilt>;
