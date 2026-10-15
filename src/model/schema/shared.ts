// Shared building blocks for the .rrq / .rrqlib schemas (JSON Schema via TypeBox).
import Type from 'typebox';

export const Id = Type.String({ pattern: '^[a-z0-9]{1,32}$' });
/**
 * Shareable item id: `<author>.<random>` (spec 008), e.g. `jane-doe.k3x9q2m7ta` or
 * `rrquilts.ohio-star`. Plain ids (no author) are accepted for local/older items.
 */
export const ItemId = Type.String({ pattern: '^[a-z0-9][a-z0-9-]{0,63}(\\.[a-z0-9-]{1,64})?$' });
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
  /** A user-managed kind of tag ("eight-point"), shown and searched apart from plain tags. */
  styles: Type.Optional(Type.Array(Type.String())),
  categories: Type.Optional(Type.Array(Type.String())),
});

/** The author's socials: a site (or free-text type) and a handle (or, for Website/custom, a link). */
export const Socials = Type.Array(
  Type.Object({
    type: Type.String({ maxLength: 60 }),
    handle: Type.String({ maxLength: 500 }),
    /** The one shown in printed credits (else the first). */
    credit: Type.Optional(Type.Boolean()),
  }),
  { maxItems: 50 },
);

/** Where an item copied from a library or repository came from. */
export const Source = Type.Object({
  libraryId: Type.String(),
  itemId: Type.String(),
  revision: Type.Integer({ minimum: 1 }),
  /** The library item's content version this came from (linked copies: sync and conflicts). */
  version: Type.Optional(Type.String({ pattern: '^[a-f0-9]{12}$' })),
  /** Attribution carried with the item (constitution Principle VI). */
  name: Type.Optional(Type.String()),
  library: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  /** SPDX identifier. */
  license: Type.Optional(Type.String()),
  /** True once the item has been copied-and-changed or edited. */
  derived: Type.Optional(Type.Boolean()),
});

/** An earlier contributor to an item (spec 009), origin first. */
export const Credit = Type.Object({
  author: Type.Optional(Type.String()),
  /** The item's name at that point. */
  name: Type.Optional(Type.String()),
  license: Type.Optional(Type.String()),
  library: Type.Optional(Type.String()),
});

/** Embedded binary (packed form). Library repositories may use `path` instead (spec 002). */
/**
 * A binary file. With `data` it's embedded; without, it's a reference resolved by `sha256` from the
 * device's image store or a library (spec 014: library fabric images aren't embedded in projects).
 */
export const Asset = Type.Object({
  data: Type.Optional(Type.String({ pattern: '^data:[a-z]+/[a-z0-9.+-]+;base64,' })),
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
  id: ItemId,
  notecard: Notecard,
  source: Type.Optional(Source),
  /** Content hash (12 hex) of the item's design; `id@version` identifies an exact version. */
  version: Type.Optional(Type.String({ pattern: '^[a-f0-9]{12}$' })),
  /** Human-friendly counter, incremented whenever `version` changes. */
  revision: Type.Optional(Type.Integer({ minimum: 1 })),
  /** Who made this version (display name). */
  author: Type.Optional(Type.String()),
  /** License id; absent → the project license. */
  license: Type.Optional(Type.String()),
  credits: Type.Optional(Type.Array(Credit)),
};

export type Credit = Type.Static<typeof Credit>;
export type Socials = Type.Static<typeof Socials>;
export type Path = Type.Static<typeof Path>;
export type PathCommand = Type.Static<typeof PathCommand>;
export type Asset = Type.Static<typeof Asset>;
export type Vec2 = Type.Static<typeof Vec2>;
