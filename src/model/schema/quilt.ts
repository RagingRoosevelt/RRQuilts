import Type from 'typebox';
import { ColoringBody, Fill } from './coloring';
import { Id, ItemId, Size, Vec2, itemBase } from './shared';

const count = Type.Integer({ minimum: 1, maximum: 100 });
const length = Type.Number({ minimum: 0 });

/** Horizontal layout: rows × cols of blocks, optional sashing and sash border. */
export const HorizontalLayout = Type.Object({
  style: Type.Literal('straight-set'),
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
  style: Type.Enum(['custom-set']),
});

/** Variable Point (spec 018): On-Point with diamonds `width` × `height` through the block; the
 *  diamonds take colors and fabrics only. */
export const VariablePointLayout = Type.Object({
  style: Type.Literal('variable-point'),
  cols: count,
  rows: count,
  width: Type.Number({ exclusiveMinimum: 0 }),
  height: Type.Number({ exclusiveMinimum: 0 }),
  sash: length,
  corner: Type.Union([Type.Literal('triangle'), Type.Literal('seam')]),
  edge: EdgeFinish,
});

/** Edge of a tessellation: trimmed straight, or whole shapes (bound along the zigzag). */
export const PatchEdge = Type.Union([Type.Literal('trim'), Type.Literal('none')]);

export const PatchShape = Type.Enum([
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
]);

/** One Patch (spec 018): one shape repeated `cols` × `rows`; `width` (and `height` where the shape
 *  has one) is the patch's finished size. */
export const OnePatchLayout = Type.Object({
  style: Type.Literal('one-patch'),
  shape: PatchShape,
  cols: count,
  rows: count,
  width: Type.Number({ exclusiveMinimum: 0 }),
  height: Type.Number({ exclusiveMinimum: 0 }),
  edge: PatchEdge,
});

/** Baby Blocks and Variable Blocks (spec 018): cubes of three diamonds; `width` across a cube,
 *  `top` the top diamond's height, `side` the side diamonds' upright edge. */
export const TumblingLayout = Type.Object({
  style: Type.Union([Type.Literal('baby-blocks'), Type.Literal('variable-blocks')]),
  cols: count,
  rows: count,
  width: Type.Number({ exclusiveMinimum: 0 }),
  top: Type.Number({ exclusiveMinimum: 0 }),
  side: Type.Number({ exclusiveMinimum: 0 }),
  edge: PatchEdge,
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
  /** Block styles: a block strip (square blocks, the width following length ÷ along; default),
   *  or false for a pieced strip (rectangles painted only, any width). */
  square: Type.Optional(Type.Boolean()),
});

/** Strip quilts (spec 017): strips stacked down (horizontal) or across (vertical), one length. */
export const StripLayout = Type.Object({
  style: Type.Union([Type.Literal('horizontal-strip'), Type.Literal('vertical-strip')]),
  length: Type.Number({ exclusiveMinimum: 0 }),
  strips: Type.Array(Strip, { minItems: 1 }),
});

export const Layout = Type.Union([
  HorizontalLayout,
  OnPointLayout,
  StripLayout,
  VariablePointLayout,
  OnePatchLayout,
  TumblingLayout,
  OtherLayout,
]);

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

/** A target size shown as an outline over the quilt (spec 006 FR-001a): the quilter's choices
 *  and the shape they resolved to (project units, top-left of its box at 0, 0), so the outline
 *  still draws if the size lists change. */
export const QuiltTarget = Type.Object({
  visible: Type.Boolean(),
  /** How strong the fill is (0…1; default 0.3); the outline always shows fully. */
  opacity: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  /** Outline and fill color, `#rrggbb` (default blue). */
  tint: Type.Optional(Type.String({ pattern: '^#[0-9a-fA-F]{6}$' })),
  /** Shade outside the shape (to the quilt's edge) instead of inside it. */
  invert: Type.Optional(Type.Boolean()),
  input: Type.Object({
    choice: Type.Union([Type.String({ maxLength: 100 }), Type.Null()]),
    region: Type.Union([Type.Literal('us'), Type.Literal('eu')]),
    custom: Type.Optional(Type.Tuple([length, length])),
    drop: Type.Optional(length),
    tuck: Type.Optional(length),
    tall: Type.Optional(Type.Boolean()),
    fit: Type.Optional(Type.Union([Type.Literal('women'), Type.Literal('men')])),
    size: Type.Optional(Type.String({ maxLength: 20 })),
    piece: Type.Optional(
      Type.Union([Type.Literal('front'), Type.Literal('back'), Type.Literal('sleeve')]),
    ),
    sleeveLength: Type.Optional(length),
    inseam: Type.Optional(length),
  }),
  outline: Type.Array(Type.Tuple([Type.Number(), Type.Number()]), { maxItems: 1000 }),
  core: Type.Optional(Type.Tuple([length, length, length, length])),
  label: Type.String({ maxLength: 200 }),
});

/** A colorway of a quilt (a palette swap of its primary colorway): every piece colored `from` (a
 *  fill key, e.g. "color:<id>") shows `to` instead. Edits to the quilt show in every colorway. */
export const Colorway = Type.Object({
  id: Id,
  name: Type.String({ maxLength: 100 }),
  swaps: Type.Array(Type.Object({ from: Type.String({ maxLength: 200 }), to: Fill }), {
    maxItems: 1000,
  }),
});

export const Quilt = Type.Object({
  ...itemBase,
  layout: Layout,
  borders: Type.Array(Border),
  /** Coloring table; placements reference entries (copy-on-write on edit). */
  colorings: Type.Record(Type.String(), ColoringBody),
  /** Fixed purposes: [piecing, appliqué, quilting]. */
  layers: Type.Tuple([PiecingLayer, FreeLayer, FreeLayer]),
  target: Type.Optional(QuiltTarget),
  /** Colorways and the one shown (none: the primary colorway, the quilt's own colors, named
   *  `primaryName`). */
  primaryName: Type.Optional(Type.String({ maxLength: 100 })),
  colorways: Type.Optional(Type.Array(Colorway, { maxItems: 100 })),
  shownColorway: Type.Optional(Id),
});

export type HorizontalLayout = Type.Static<typeof HorizontalLayout>;
export type OnPointLayout = Type.Static<typeof OnPointLayout>;
export type StripLayout = Type.Static<typeof StripLayout>;
export type VariablePointLayout = Type.Static<typeof VariablePointLayout>;
export type OnePatchLayout = Type.Static<typeof OnePatchLayout>;
export type TumblingLayout = Type.Static<typeof TumblingLayout>;
export type PatchShape = Type.Static<typeof PatchShape>;
export type Strip = Type.Static<typeof Strip>;
export type StripStyle = Type.Static<typeof StripStyle>;
export type Layout = Type.Static<typeof Layout>;
export type Border = Type.Static<typeof Border>;
export type SlotContent = Type.Static<typeof SlotContent>;
export type Item = Type.Static<typeof Item>;
export type Quilt = Type.Static<typeof Quilt>;
export type QuiltTarget = Type.Static<typeof QuiltTarget>;
export type Colorway = Type.Static<typeof Colorway>;
