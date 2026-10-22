import Type from 'typebox';
import { Coloring } from './coloring';
import { Id, ItemId, Path, Size, Vec2, itemBase } from './shared';

// Block geometry is normalized: 0…1 across the block's width and height.

export const Node = Type.Object({
  id: Id,
  x: Type.Number(),
  y: Type.Number(),
  handle: Type.Optional(
    Type.Union([
      Type.Literal('corner'),
      Type.Literal('cusp'),
      Type.Literal('smooth'),
      Type.Literal('symmetric'),
    ]),
  ),
});

const segBase = { id: Id, from: Id, to: Id };
export const Segment = Type.Union([
  Type.Object({ ...segBase, kind: Type.Literal('line') }),
  Type.Object({
    ...segBase,
    kind: Type.Literal('arc'),
    sweep: Type.Number({ exclusiveMinimum: -360, exclusiveMaximum: 360, not: { const: 0 } }),
  }),
  Type.Object({ ...segBase, kind: Type.Literal('bezier'), c1: Vec2, c2: Vec2 }),
]);

export const Drawing = Type.Object({ nodes: Type.Array(Node), segments: Type.Array(Segment) });

export const Patch = Type.Object({
  id: Id,
  path: Path,
  flags: Type.Optional(Type.Array(Type.String())),
});

/** Open path drawn as stitching (thread), not cut from fabric. */
export const Stitch = Type.Object({ id: Id, path: Path });

export const Foundation = Type.Object({
  sections: Type.Array(
    Type.Object({
      id: Id,
      patches: Type.Array(Id),
      needsReview: Type.Optional(Type.Boolean()),
    }),
  ),
});

export const GridType = Type.Union([
  Type.Literal('rectangle'),
  Type.Literal('circle'),
  Type.Literal('arc'),
  Type.Literal('star8'),
  Type.Literal('kaleidoscope'),
  Type.Literal('octagon'),
]);

/** Editor state saved with the block (snap/grid/guides/tracing image); free-form for now. */
export const Editor = Type.Object({});

/** A shaped block (spec 026): absent = square or rectangle. `size` is the shape's bounding box. */
export const BlockShape = Type.Union([
  Type.Literal('triangle'),
  Type.Literal('diamond60'),
  Type.Literal('hexagon'),
]);

/** A month data block's shorter variant (spec 025): its own drawing, numbered 1 to `days`. */
export const DataVariant = Type.Object({
  days: Type.Union([Type.Literal(28), Type.Literal(29), Type.Literal(30)]),
  drawing: Drawing,
  patches: Type.Array(Patch),
  unconnected: Type.Optional(Type.Array(Id)),
});

/**
 * A data block (spec 025): a type a data quilt places, by kind. A month block's own drawing is its
 * 31-day variant; `variants` add shorter ones. `of`/`days`: a variant the app made from block `of`
 * to show in a quilt (hidden, rebuilt on every change).
 */
export const DataBlockInfo = Type.Object({
  kind: Type.Union([Type.Literal('day'), Type.Literal('week'), Type.Literal('month')]),
  variants: Type.Optional(Type.Array(DataVariant, { maxItems: 3 })),
  of: Type.Optional(ItemId),
  days: Type.Optional(Type.Integer({ minimum: 28, maximum: 30 })),
});

const blockBase = {
  ...itemBase,
  size: Size,
  shape: Type.Optional(BlockShape),
  colorings: Type.Array(Coloring),
  foundation: Type.Optional(Foundation),
  editor: Type.Optional(Editor),
  /** A recoloring of a library block: the drawing is locked, only colorings change. */
  colorVariant: Type.Optional(Type.Boolean()),
  data: Type.Optional(DataBlockInfo),
};

const seamPart = {
  drawing: Drawing,
  patches: Type.Array(Patch),
  /** Segments not connected to the rest of the drawing (flagged, never deleted). */
  unconnected: Type.Optional(Type.Array(Id)),
};
const gridPart = {
  grid: Type.Object({ type: GridType, params: Type.Record(Type.String(), Type.Number()) }),
  patches: Type.Array(Patch),
};
const appliquePart = {
  /** First = bottom of the stack. */
  patches: Type.Array(Patch),
  stitches: Type.Array(Stitch),
};

export const Block = Type.Union([
  Type.Object({ ...blockBase, kind: Type.Literal('seam'), ...seamPart }),
  Type.Object({ ...blockBase, kind: Type.Literal('grid'), ...gridPart }),
  Type.Object({ ...blockBase, kind: Type.Literal('applique'), ...appliquePart, background: Patch }),
  Type.Object({
    ...blockBase,
    kind: Type.Union([Type.Literal('motif'), Type.Literal('stencil'), Type.Literal('frame')]),
    ...appliquePart,
  }),
  Type.Object({
    ...blockBase,
    kind: Type.Literal('combo'),
    pieced: Type.Union([
      Type.Object({ kind: Type.Literal('seam'), ...seamPart }),
      Type.Object({ kind: Type.Literal('grid'), ...gridPart }),
    ]),
    applique: Type.Object({ ...appliquePart, background: Type.Optional(Patch) }),
  }),
]);

export type Node = Type.Static<typeof Node>;
export type Segment = Type.Static<typeof Segment>;
export type Drawing = Type.Static<typeof Drawing>;
export type Patch = Type.Static<typeof Patch>;
export type Block = Type.Static<typeof Block>;
export type BlockShapeId = Type.Static<typeof BlockShape>;
export type SeamBlock = Extract<Block, { kind: 'seam' }>;
export type DataBlockInfo = Type.Static<typeof DataBlockInfo>;
export type DataVariant = Type.Static<typeof DataVariant>;
export type DataKind = DataBlockInfo['kind'];
