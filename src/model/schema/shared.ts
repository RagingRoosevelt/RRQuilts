// Shared building blocks for the .rrq / .rrq_lib schemas (JSON Schema via TypeBox).
import Type from 'typebox';

export const Id = Type.String({ pattern: '^[a-z0-9]{1,32}$' });
export const Vec2 = Type.Tuple([Type.Number(), Type.Number()]);
const positive = Type.Number({ exclusiveMinimum: 0 });
export const Size = Type.Tuple([positive, positive]);
const byte = Type.Integer({ minimum: 0, maximum: 255 });
export const RGB = Type.Tuple([byte, byte, byte]);

export const Notecard = Type.Object({
  name: Type.String(),
  notes: Type.Optional(Type.String()),
  reference: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  categories: Type.Optional(Type.Array(Type.String())),
});

/** Where an item copied from a library or repository came from. */
export const Source = Type.Object({
  libraryId: Type.String(),
  itemId: Type.String(),
  revision: Type.Integer({ minimum: 1 }),
});

/** Embedded binary (packed form). Library repositories may use `path` instead (spec 002). */
export const Asset = Type.Object({
  data: Type.String({ pattern: '^data:[a-z]+/[a-z0-9.+-]+;base64,' }),
  type: Type.String(),
  sha256: Type.String({ pattern: '^[a-f0-9]{64}$' }),
  width: Type.Optional(Type.Integer({ minimum: 1 })),
  height: Type.Optional(Type.Integer({ minimum: 1 })),
});

/**
 * Path commands. `A` is a circular arc to (x, y) with signed sweep in degrees
 * (positive = counter-clockwise), circular at the block's designed proportions.
 */
export const PathCommand = Type.Union([
  Type.Tuple([Type.Literal('M'), Type.Number(), Type.Number()]),
  Type.Tuple([Type.Literal('L'), Type.Number(), Type.Number()]),
  Type.Tuple([
    Type.Literal('A'),
    Type.Number(),
    Type.Number(),
    Type.Number({ exclusiveMinimum: -360, exclusiveMaximum: 360, not: { const: 0 } }),
  ]),
  Type.Tuple([
    Type.Literal('C'),
    Type.Number(),
    Type.Number(),
    Type.Number(),
    Type.Number(),
    Type.Number(),
    Type.Number(),
  ]),
  Type.Tuple([Type.Literal('Z')]),
]);
export const Path = Type.Array(PathCommand, { minItems: 2 });

/** Fields every top-level item carries. */
export const itemBase = {
  id: Id,
  notecard: Notecard,
  source: Type.Optional(Source),
};

export type Path = Type.Static<typeof Path>;
export type PathCommand = Type.Static<typeof PathCommand>;
export type Asset = Type.Static<typeof Asset>;
export type Vec2 = Type.Static<typeof Vec2>;
