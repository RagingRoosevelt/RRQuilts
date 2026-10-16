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

/** How an uneven layout edge is finished (spec 016): setting pieces cut exact or oversized by
 *  `float`, partial blocks trimmed by the edge, or no fill (the uneven edge is bound as it is). */
export const EdgeFinish = Type.Object({
  finish: Type.Union([
    Type.Literal('exact'),
    Type.Literal('float'),
    Type.Literal('trim'),
    Type.Literal('none'),
  ]),
  /** Kept when another finish is chosen. */
  float: length,
});

/** On-Point (spec 016): square blocks turned 45°, `cols` × `rows` on the main grid plus the blocks
 *  between them; `block` is the finished side. */
export const OnPointLayout = Type.Object({
  style: Type.Literal('on-point'),
  cols: count,
  rows: count,
  block: Type.Number({ exclusiveMinimum: 0 }),
  sash: length,
  corner: Type.Union([Type.Literal('triangle'), Type.Literal('seam')]),
  edge: EdgeFinish,
});

/** Styles whose generators come with later presets; parameters are stored as-is for now. */
export const OtherLayout = Type.Object({
  style: Type.Enum(['variable-point', 'baby-blocks', 'variable-blocks', 'one-patch', 'custom-set']),
});

export const StripStyle = Type.Enum([
  'plain',
  'blocks',
  'half-drop-blocks',
  'spaced-squares',
  'points-a',
  'points-b',
  'diamonds',
  'half-drop-diamonds',
  'double-diamonds',
  'half-drop-double-diamonds',
  'checker-board',
]);

/** One strip (spec 017): a lasting `id` (content follows it), style, width, and counts. */
export const Strip = Type.Object({
  id: Id,
  style: StripStyle,
  width: Type.Number({ exclusiveMinimum: 0 }),
  /** Units along the strip (repeating styles). */
  along: count,
  /** Units across the strip (Checker Board). */
  across: count,
});

/** Strip quilts (spec 017): strips stacked down (horizontal) or across (vertical), one length. */
export const StripLayout = Type.Object({
  style: Type.Union([Type.Literal('horizontal-strip'), Type.Literal('vertical-strip')]),
  length: Type.Number({ exclusiveMinimum: 0 }),
  strips: Type.Array(Strip, { minItems: 1 }),
});

export const Layout = Type.Union([HorizontalLayout, OnPointLayout, StripLayout, OtherLayout]);

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
export type OnPointLayout = Type.Static<typeof OnPointLayout>;
export type StripLayout = Type.Static<typeof StripLayout>;
export type Strip = Type.Static<typeof Strip>;
export type StripStyle = Type.Static<typeof StripStyle>;
export type Layout = Type.Static<typeof Layout>;
export type Border = Type.Static<typeof Border>;
export type SlotContent = Type.Static<typeof SlotContent>;
export type Item = Type.Static<typeof Item>;
export type Quilt = Type.Static<typeof Quilt>;
