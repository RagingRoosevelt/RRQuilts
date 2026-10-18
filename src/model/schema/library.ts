// Library documents (.rrqlib, spec 002 amended by spec 011): My library backups and shareable packs.
import Type from 'typebox';
import { Block } from './block';
import { Color, Fabric } from './palette';
import { Units } from './project';
import { itemBase, Links, Socials } from './shared';

export const LIBRARY_FORMAT = 'rrqlib';
export const LIBRARY_VERSION = 4;

/**
 * A palette: a named set of colors and fabrics (spec 014); each keeps its own `id@version` so
 * projects link single colors and fabrics.
 */
export const ColorCollection = Type.Object({
  ...itemBase,
  colors: Type.Array(Color),
  fabrics: Type.Optional(Type.Array(Fabric)),
});

const category = { category: Type.Optional(Type.String()) };
/** `data` is the project-schema object itself (id, notecard, author, license, credits inside). */
export const LibraryItem = Type.Union([
  Type.Object({
    type: Type.Literal('block'),
    ...category,
    data: Block,
    /** Colors its colorings use that aren't library colors (as in `.rrqbl`). */
    colors: Type.Optional(Type.Array(Color)),
  }),
  Type.Object({ type: Type.Literal('colors'), ...category, data: ColorCollection }),
]);

/** Two levels: a category with a `parent` is a subcategory of that top-level category. */
export const Category = Type.Object({
  id: Type.String(),
  name: Type.String(),
  parent: Type.Optional(Type.String()),
});
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

/** A web library in a backup: where it is and which of its packs were installed. */
export const BackupConnection = Type.Object({
  url: Type.String(),
  ref: Type.Optional(Type.String()),
  library: Type.Object({ id: Type.String(), name: Type.String() }),
  /** Packs to download again on restore (the ones its library could still serve). */
  packs: Type.Array(Type.String()),
  /** Its index at backup time: restores the library, with all its packs listed, when offline. */
  index: Type.Optional(Type.Unknown()),
});
export type BackupConnection = Type.Static<typeof BackupConnection>;

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
  author: Type.Optional(
    Type.Object({
      name: Type.String(),
      url: Type.Optional(Type.String()),
      socials: Type.Optional(Socials),
    }),
  ),
  license: Type.Optional(Type.String()),
  links: Type.Optional(Links),
  changelog: Type.Optional(Type.Array(ChangelogEntry)),
  credits: Type.Optional(Type.Array(LibraryCredit)),
  categories: Type.Array(Category),
  repositories: Type.Optional(Type.Array(RepositoryRef)),
  /** The library a pack belongs to (spec 014: a library is a set of switchable packs). */
  library: Type.Optional(Type.Object({ id: Type.String(), name: Type.String() })),
  /**
   * Backups (v3): libraries added from the web, kept as their address and installed packs (no
   * images; restoring connects and downloads them again), and which backed-up packs were off.
   */
  connections: Type.Optional(Type.Array(BackupConnection)),
  packsOff: Type.Optional(Type.Array(Type.String())),
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
