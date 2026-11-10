// English paper piecing (specs 027, 050, rrq v12, rrqlib v8). Geometry is in units: 1U is one edge
// of a scale-1 piece. Shapes and rosettes have no real size; an EPP quilt's `unit` gives 1U a length.
import Type from 'typebox';
import { Coloring, Fill } from './coloring';
import { Id, ItemId, itemBase, PathCommand, Vec2 } from './shared';

const Outline = Type.Array(Vec2, { minItems: 3, maxItems: 24 });
const Indexes = Type.Array(Type.Integer({ minimum: 0, maximum: 23 }), { maxItems: 24 });
const Scale = Type.Integer({ minimum: 1, maximum: 4 });

/** One EPP template shape (a library item): its corners in units, counter-clockwise. */
export const EppShape = Type.Object({
  ...itemBase,
  outline: Outline,
  /** Corners no tool moves. */
  locked: Type.Optional(Indexes),
  /** Edges (i = corner i to i + 1) deliberately not whole units. */
  marked: Type.Optional(Indexes),
  /** Fill for new pieces of this shape. */
  fill: Type.Optional(Fill),
});

/** A shape defined only inside one rosette or quilt (Multi-shape, Close space, Auto-close). */
export const InternalShape = Type.Object({
  id: Id,
  outline: Outline,
  marked: Type.Optional(Indexes),
});

/** A piece of a rosette: a library shape (item id) or one of the rosette's internal shapes (id). */
export const RosettePiece = Type.Object({
  id: Id,
  shape: ItemId,
  at: Vec2,
  turn: Type.Number(),
  mirror: Type.Optional(Type.Boolean()),
  scale: Scale,
});

/** A rosette (spec 050): pieces snapped edge to edge, colored like a block. Never holds rosettes. */
export const Rosette = Type.Object({
  ...itemBase,
  shapes: Type.Optional(Type.Array(InternalShape, { maxItems: 500 })),
  pieces: Type.Array(RosettePiece, { maxItems: 500 }),
  /** Fills keyed by piece id, as block colorings key by patch id. */
  colorings: Type.Array(Coloring, { minItems: 1, maxItems: 100 }),
  /** A recoloring of a library rosette: arrangement locked, only colorings change. */
  colorVariant: Type.Optional(Type.Boolean()),
});

/** A piece placed in an EPP quilt: a shape or a whole (linked) rosette. */
export const EppPiece = Type.Object({
  id: Id,
  shape: Type.Optional(ItemId),
  rosette: Type.Optional(ItemId),
  at: Vec2,
  turn: Type.Number(),
  mirror: Type.Optional(Type.Boolean()),
  scale: Scale,
  /** The rosette's coloring shown (absent: its first). */
  coloring: Type.Optional(Id),
  /** Repaints: a shape's own fill under '', a rosette's per piece id. */
  fills: Type.Optional(Type.Record(Type.String(), Fill)),
});

/** An EPP quilt's edge (spec 027 FR-001a). Borders and binding need one other than `none`. */
export const EppEdge = Type.Union([
  Type.Object({ kind: Type.Literal('none') }),
  Type.Object({
    kind: Type.Literal('cut'),
    rect: Type.Tuple([Type.Number(), Type.Number(), Type.Number(), Type.Number()]),
  }),
  Type.Object({ kind: Type.Literal('close'), fill: Type.Optional(Fill) }),
  Type.Object({
    kind: Type.Literal('custom'),
    outline: Type.Array(PathCommand, { maxItems: 1000 }),
  }),
]);

/** The EPP quilt type: a layout style with no block spaces. `unit` and `seam` in project units. */
export const EppLayout = Type.Object({
  style: Type.Literal('epp'),
  unit: Type.Number({ exclusiveMinimum: 0 }),
  seam: Type.Number({ minimum: 0 }),
  edge: EppEdge,
});

const Box = Type.Tuple([Type.Number(), Type.Number(), Type.Number(), Type.Number()]);

export const EppDesign = Type.Object({
  /** Shapes made in this quilt (Close space). */
  shapes: Type.Optional(Type.Array(InternalShape, { maxItems: 5000 })),
  pieces: Type.Array(EppPiece, { maxItems: 5000 }),
  /** The quilt's box in units: the pieces' bounds, or the Cut to size rectangle. Kept up to date
   *  with every edit, so the layout (borders, size) needs no shape lookups. */
  box: Type.Optional(Box),
  /** Auto-close: the closing pieces, outlines in units where they sit, rebuilt with every edit. */
  closing: Type.Optional(Type.Array(InternalShape, { maxItems: 5000 })),
});

export type EppShape = Type.Static<typeof EppShape>;
export type InternalShape = Type.Static<typeof InternalShape>;
export type RosettePiece = Type.Static<typeof RosettePiece>;
export type Rosette = Type.Static<typeof Rosette>;
export type EppPiece = Type.Static<typeof EppPiece>;
export type EppEdge = Type.Static<typeof EppEdge>;
export type EppLayout = Type.Static<typeof EppLayout>;
export type EppDesign = Type.Static<typeof EppDesign>;
