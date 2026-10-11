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
});

export const Coloring = Type.Object({
  id: Id,
  name: Type.Optional(Type.String()),
  ...ColoringBody.properties,
});

export type Fill = Type.Static<typeof Fill>;
export type ColoringBody = Type.Static<typeof ColoringBody>;
export type Coloring = Type.Static<typeof Coloring>;
