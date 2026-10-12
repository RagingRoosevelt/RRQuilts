// Library documents (.rrqlib, spec 002 amended by spec 011): My library backups and shareable packs.
import Type from 'typebox';
import { Block } from './block';
import { Color } from './palette';
import { Units } from './project';
import { itemBase } from './shared';

export const LIBRARY_FORMAT = 'rrqlib';
export const LIBRARY_VERSION = 1;

/** A named set of colors; each color keeps its own `id@version` so projects link single colors. */
export const ColorCollection = Type.Object({ ...itemBase, colors: Type.Array(Color) });

const category = { category: Type.Optional(Type.String()) };
/** `data` is the project-schema object itself (id, notecard, author, license, credits inside). */
export const LibraryItem = Type.Union([
  Type.Object({ type: Type.Literal('block'), ...category, data: Block }),
  Type.Object({ type: Type.Literal('colors'), ...category, data: ColorCollection }),
]);

export const Category = Type.Object({ id: Type.String(), name: Type.String() });
export const ChangelogEntry = Type.Object({
  revision: Type.Integer({ minimum: 1 }),
  date: Type.String(),
  notes: Type.String(),
});
/** A connected repository, by reference (spec 012). */
export const RepositoryRef = Type.Object({
  url: Type.String(),
  ref: Type.Optional(Type.String()),
  pinned: Type.Integer({ minimum: 1 }),
  declined: Type.Optional(Type.Integer({ minimum: 1 })),
});
export const LibraryCredit = Type.Object({
  name: Type.String(),
  author: Type.Optional(Type.String()),
  license: Type.Optional(Type.String()),
});

const head = {
  format: Type.Literal(LIBRARY_FORMAT),
  version: Type.Integer({ minimum: 1 }),
  app: Type.Optional(Type.String()),
  units: Units,
  kind: Type.Union([Type.Literal('personal'), Type.Literal('pack')]),
  id: Type.String({ minLength: 1, maxLength: 200 }),
  revision: Type.Integer({ minimum: 1 }),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.Object({ name: Type.String(), url: Type.Optional(Type.String()) })),
  license: Type.Optional(Type.String()),
  changelog: Type.Optional(Type.Array(ChangelogEntry)),
  credits: Type.Optional(Type.Array(LibraryCredit)),
  categories: Type.Array(Category),
  repositories: Type.Optional(Type.Array(RepositoryRef)),
};

/** The envelope as read from a file: items and embedded packs are checked one by one. */
export const LibraryEnvelope = Type.Object({
  ...head,
  items: Type.Array(Type.Unknown()),
  packs: Type.Optional(Type.Array(Type.Unknown())),
});
export const LibraryDoc = Type.Object({ ...head, items: Type.Array(LibraryItem) });

export type ColorCollection = Type.Static<typeof ColorCollection>;
export type LibraryItem = Type.Static<typeof LibraryItem>;
export type Category = Type.Static<typeof Category>;
export type LibraryDoc = Type.Static<typeof LibraryDoc>;
/** A backup: My library plus the packs installed with it. */
export type LibraryBackup = LibraryDoc & { packs?: LibraryDoc[] };
