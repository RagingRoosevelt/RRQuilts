import Type from 'typebox';
import { Id, ItemId, Vec2 } from './shared';

/** A patch filled with fabric (offset/rotation = fussy cut) or a solid color. Absent = unfilled. */
export const Fill = Type.Union([
  Type.Object({ fabric: ItemId, offset: Vec2, rotation: Type.Number() }),
  Type.Object({ color: ItemId }),
]);

export const ThreadUse = Type.Object({
  thread: ItemId,
  style: Type.Union([Type.Literal('solid'), Type.Literal('dashed')]),
  weight: Type.Number({ exclusiveMinimum: 0 }),
});

/** Coloring contents; keyed by patch id (fills) and patch/stitch id (threads). */
export const ColoringBody = Type.Object({
  fills: Type.Record(Type.String(), Fill),
  threads: Type.Optional(Type.Record(Type.String(), ThreadUse)),
  /**
   * Quilt colorings only: the block coloring this one follows. `fills` then override it per patch,
   * so later changes to the block's coloring show wherever the quilt hasn't recolored.
   */
  base: Type.Optional(Id),
  /** Patches left unfilled in the quilt although `base` fills them. */
  cleared: Type.Optional(Type.Array(Type.String())),
});

export const Coloring = Type.Object({
  id: Id,
  name: Type.Optional(Type.String()),
  ...ColoringBody.properties,
});

export type Fill = Type.Static<typeof Fill>;
export type ColoringBody = Type.Static<typeof ColoringBody>;
export type Coloring = Type.Static<typeof Coloring>;
