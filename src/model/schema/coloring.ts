import Type from 'typebox';
import { Id, ItemId, Vec2 } from './shared';

const FabricFill = Type.Object({ fabric: ItemId, offset: Vec2, rotation: Type.Number() });
const ColorFill = Type.Object({ color: ItemId });

/**
 * A data paint (spec 025, v9): a place for one day's value in a data quilt. `n` is the local day
 * (1–31 in a month block, 1–7 in a week block, 1 in a day block);
 * `slot` is the value slot (0–3 = A–D, absent = A). `under` is the color painted before, shown
 * where the design says "as designed".
 */
export const DataPaint = Type.Object({
  n: Type.Integer({ minimum: 1, maximum: 366 }),
  slot: Type.Optional(Type.Integer({ minimum: 0, maximum: 3 })),
});
const DataFill = Type.Object({
  data: DataPaint,
  under: Type.Optional(Type.Union([FabricFill, ColorFill])),
});

/** A patch filled with fabric (offset/rotation = fussy cut), a solid color, or a data paint.
 *  Absent = unfilled. */
export const Fill = Type.Union([FabricFill, ColorFill, DataFill]);
/** A fill that is a color or fabric (what data paints resolve to). */
export const PlainFill = Type.Union([FabricFill, ColorFill]);

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
export type PlainFill = Type.Static<typeof PlainFill>;
export type DataPaint = Type.Static<typeof DataPaint>;
export type ColoringBody = Type.Static<typeof ColoringBody>;
export type Coloring = Type.Static<typeof Coloring>;
