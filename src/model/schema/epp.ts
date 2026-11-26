// English paper piecing (specs 027, 050, rrq v12, rrqlib v8; 3D EPP quilts too). Geometry is in
// units: 1U is one edge of a scale-1 piece. Shapes and rosettes have no real size; an EPP quilt's
// `unit` gives 1U a length.
import Type from 'typebox';
import { AutoMap, Coloring, Fill, Swap } from './coloring';
import { Id, ItemId, itemBase, PathCommand, Vec2 } from './shared';

const Outline = Type.Array(Vec2, { minItems: 3, maxItems: 24 });
const Indexes = Type.Array(Type.Integer({ minimum: 0, maximum: 23 }), { maxItems: 24 });
/** Shapes the app makes to fill a gap (Close space, Auto-close) follow the gap, however ragged:
 *  up to 1000 corners (bug 2026-11-24: an Auto-close piece over 24 corners saved a file that
 *  wouldn't open). Shapes drawn in the shape editor keep 24. */
const MadeOutline = Type.Array(Vec2, { minItems: 3, maxItems: 1000 });
const MadeIndexes = Type.Array(Type.Integer({ minimum: 0, maximum: 999 }), { maxItems: 1000 });
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
  outline: MadeOutline,
  marked: Type.Optional(MadeIndexes),
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

/**
 * A rosette's coloring (fills keyed by piece id). One that follows another (`source`, rrq v13,
 * rrqlib v9, rrqepp v2; 0.9.3 roadmap) maps that one's colors as a quilt colorway does: picked by
 * hand (`swaps`, Palette) or each its nearest in a palette (`auto`, Auto mapping), keyed by the
 * colors of its base (the painted coloring the chain of sources reaches). Its `fills` are the
 * colors shown, worked out again on every change. One without a source is painted (Re-color).
 */
export const RosetteColoring = Type.Object({
  ...Coloring.properties,
  source: Type.Optional(Id),
  swaps: Type.Optional(Type.Array(Swap, { maxItems: 1000 })),
  auto: Type.Optional(AutoMap),
  /** Palette mode: the palette its choices come from (none: all). */
  palette: Type.Optional(Type.String({ maxLength: 200 })),
});

/** A rosette (spec 050): pieces snapped edge to edge, colored like a block. Never holds rosettes. */
export const Rosette = Type.Object({
  ...itemBase,
  shapes: Type.Optional(Type.Array(InternalShape, { maxItems: 500 })),
  pieces: Type.Array(RosettePiece, { maxItems: 500 }),
  /** Fills keyed by piece id, as block colorings key by patch id. */
  colorings: Type.Array(RosetteColoring, { minItems: 1, maxItems: 100 }),
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
    /** Sized by hand (rrq v13): sides dragged or typed. Absent: the largest rectangle the pieces
     *  fill, found again after every edit. */
    manual: Type.Optional(Type.Literal(true)),
    /** Manual: the width to height kept while sizing (absent: freeform). */
    ratio: Type.Optional(
      Type.Tuple([Type.Number({ exclusiveMinimum: 0 }), Type.Number({ exclusiveMinimum: 0 })]),
    ),
  }),
  Type.Object({ kind: Type.Literal('close'), fill: Type.Optional(Fill) }),
  Type.Object({
    kind: Type.Literal('custom'),
    outline: Type.Array(PathCommand, { maxItems: 1000 }),
  }),
]);

/** The EPP quilt type: a layout style with no block spaces. `unit` in project units; the seam
 *  allowance is the project's (`project.seams.epp`). */
export const EppLayout = Type.Object({
  style: Type.Literal('epp'),
  unit: Type.Number({ exclusiveMinimum: 0 }),
  edge: EppEdge,
  /** A 3D EPP quilt (spec 027 User Story 7): its pieces are a net folded into an object. */
  threeD: Type.Optional(Type.Literal(true)),
  /** 3D: the object is filled with stuffing (its 3D assembly tab shows it stuffed). */
  stuffed: Type.Optional(Type.Literal(true)),
});

/** One edge of a piece in a 3D EPP quilt: the placed piece, the rosette piece inside it when it's a
 *  placed rosette, and the edge's index in its shape's outline (corner i to i + 1). */
export const EppEdgeRef = Type.Object({
  piece: Id,
  part: Type.Optional(Id),
  edge: Type.Integer({ minimum: 0, maximum: 999 }),
});

/** An explicit seam (3D): two equal edges that don't touch in 2D, sewn together. Edges that touch
 *  in 2D are seams without one. */
export const EppSeam = Type.Object({ a: EppEdgeRef, b: EppEdgeRef });

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
  /** 3D: explicit seams, and the piece the quilter picked to face front. */
  seams: Type.Optional(Type.Array(EppSeam, { maxItems: 5000 })),
  front: Type.Optional(Type.Object({ piece: Id, part: Type.Optional(Id) })),
  /** 3D: where the printout's 3D view sees the object from (turn about the up axis, tilt from
   *  the top, radians), as turned by hand in the Print tab. */
  printView: Type.Optional(Type.Object({ theta: Type.Number(), phi: Type.Number() })),
});

export type EppShape = Type.Static<typeof EppShape>;
export type InternalShape = Type.Static<typeof InternalShape>;
export type RosettePiece = Type.Static<typeof RosettePiece>;
export type Rosette = Type.Static<typeof Rosette>;
export type RosetteColoring = Type.Static<typeof RosetteColoring>;
export type EppPiece = Type.Static<typeof EppPiece>;
export type EppEdge = Type.Static<typeof EppEdge>;
export type EppLayout = Type.Static<typeof EppLayout>;
export type EppEdgeRef = Type.Static<typeof EppEdgeRef>;
export type EppSeam = Type.Static<typeof EppSeam>;
export type EppDesign = Type.Static<typeof EppDesign>;
