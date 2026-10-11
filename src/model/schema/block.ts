import Type from 'typebox';
import { Coloring } from './coloring';
import { Id, Path, Size, Vec2, itemBase } from './shared';

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

const blockBase = {
  ...itemBase,
  size: Size,
  colorings: Type.Array(Coloring),
  foundation: Type.Optional(Foundation),
  editor: Type.Optional(Editor),
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
export type SeamBlock = Extract<Block, { kind: 'seam' }>;
