// A quilt's data plan (spec 025, v9): what each day records, how values map to fills, where days
// sit (the numbered list of block spaces, block pools), the real entries and the sample data shown
// while designing.
import Type from 'typebox';
import { PlainFill } from './coloring';
import { Id, ItemId } from './shared';

/** A day's date, `YYYY-MM-DD`. */
export const DateKey = Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' });

/** One value: a number (number slots), a category id (category slots), or none. */
const Value = Type.Union([Type.Number(), Type.String({ maxLength: 40 }), Type.Null()]);
/** Values by date, one per value slot (A–D, in order). */
export const DayValues = Type.Record(DateKey, Type.Array(Value, { maxItems: 4 }));

/** `most`: the most days expected in it, for worst-case yardage (absent: its days in the sample). */
const most = Type.Optional(Type.Integer({ minimum: 0, maximum: 366 }));
export const DataRange = Type.Object({
  from: Type.Number(),
  to: Type.Number(),
  fill: PlainFill,
  most,
});
export const DataCategory = Type.Object({
  id: Id,
  name: Type.String({ maxLength: 60 }),
  fill: PlainFill,
  most,
});

export const DataPreset = Type.Enum(['temperature', 'mood', 'daylight', 'rainfall', 'custom']);

/** A value slot (A–D): its label, and its scale as number ranges or categories. */
export const ValueSlot = Type.Object({
  label: Type.String({ maxLength: 40 }),
  preset: Type.Optional(DataPreset),
  kind: Type.Union([Type.Literal('number'), Type.Literal('category')]),
  /** Shown after numbers (°F, h, in). */
  unit: Type.Optional(Type.String({ maxLength: 12 })),
  ranges: Type.Array(DataRange, { maxItems: 50 }),
  categories: Type.Array(DataCategory, { maxItems: 50 }),
});

/** Sample data: a built-in set (a series per value slot, none = no sample) or a loaded CSV. */
export const DataSim = Type.Union([
  Type.Object({
    source: Type.Literal('builtin'),
    set: Type.String({ maxLength: 40 }),
    series: Type.Array(Type.Union([Type.String({ maxLength: 40 }), Type.Null()]), {
      maxItems: 4,
    }),
  }),
  Type.Object({
    source: Type.Literal('csv'),
    name: Type.String({ maxLength: 200 }),
    values: DayValues,
  }),
]);

const Picks = Type.Array(ItemId, { maxItems: 50 });

export const DataPlan = Type.Object({
  /** The Layout tab's Data quilt switch; off keeps the settings. */
  on: Type.Boolean(),
  plan: Type.Union([Type.Literal('months'), Type.Literal('weeks'), Type.Literal('days')]),
  /** First day of the one-year period (Months: the 1st of a month). */
  start: DateKey,
  slots: Type.Array(ValueSlot, { minItems: 1, maxItems: 4 }),
  /** The numbered list: the block space (slot) id holding each number, in order (index 0 = 001),
   *  null while not placed. Months 12, Weeks 52 then the leftover days, Days one per day. */
  order: Type.Array(Type.Union([Type.String({ maxLength: 200 }), Type.Null()]), {
    maxItems: 366,
  }),
  /** Block pools by the day places a number needs (28–31 for months, 7 for weeks, 1 for days). */
  picks: Type.Object({
    '28': Type.Optional(Picks),
    '29': Type.Optional(Picks),
    '30': Type.Optional(Picks),
    '31': Type.Optional(Picks),
    '7': Type.Optional(Picks),
    '1': Type.Optional(Picks),
  }),
  /** Seed for picking among several blocks of a pool (Shuffle changes it). */
  seed: Type.Integer({ minimum: 0 }),
  /** Places past a number's days (a block with more places than it needs): the filler, or as
   *  designed. */
  unused: Type.Union([Type.Literal('filler'), Type.Literal('designed')]),
  /** Days without an entry (Real data): as designed, the sample value, or the filler. */
  waiting: Type.Union([
    Type.Literal('designed'),
    Type.Literal('simulation'),
    Type.Literal('filler'),
  ]),
  filler: Type.Optional(PlainFill),
  show: Type.Union([Type.Literal('simulation'), Type.Literal('real')]),
  sim: DataSim,
  entries: DayValues,
});

export type DataPlan = Type.Static<typeof DataPlan>;
export type ValueSlot = Type.Static<typeof ValueSlot>;
export type DataSim = Type.Static<typeof DataSim>;
export type DayValues = Type.Static<typeof DayValues>;
export type DataPreset = Type.Static<typeof DataPreset>;
export type Pool = keyof DataPlan['picks'];
