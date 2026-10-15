import Type from 'typebox';
import { Block } from './block';
import { Embroidery, Font, Palette, Photo } from './palette';
import { Quilt } from './quilt';
import { Id, ItemId, Socials } from './shared';

export const FORMAT = 'rrq';
export const VERSION = 4;

export const Units = Type.Union([Type.Literal('in'), Type.Literal('cm')]);

/** A library a project uses (spec 014 FR-032): where to get it, and which packs. */
export const LibraryRef = Type.Object({
  id: Type.String(),
  name: Type.String(),
  author: Type.Optional(Type.String()),
  /** Repository address (spec 002), with an optional branch or tag. */
  url: Type.Optional(Type.String()),
  ref: Type.Optional(Type.String()),
  /** A local `.rrqlib`'s file name, when there's no address. */
  file: Type.Optional(Type.String()),
  packs: Type.Array(Type.String()),
});

export const Project = Type.Object({
  /** Stable identity across renames and file copies (drafts, tab locks, recent list). */
  id: Id,
  name: Type.String(),
  notes: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  authorSocials: Type.Optional(Socials),
  /** Covers the file; default for items without their own license (spec 009). */
  license: Type.Optional(Type.String()),
  palette: Palette,
  blocks: Type.Array(Block),
  photos: Type.Array(Photo),
  embroidery: Type.Array(Embroidery),
  quilts: Type.Array(Quilt),
  fonts: Type.Array(Font),
  /** Library blocks picked for this project's design tray (spec 011); its own blocks always show. */
  libraryBlocks: Type.Optional(Type.Array(ItemId)),
  /** Library palettes (color collections) picked for this project's design tray. */
  libraryPalettes: Type.Optional(Type.Array(ItemId)),
  /** Libraries this project's items come from, so a device without one can offer to add it. */
  libraries: Type.Optional(Type.Array(LibraryRef)),
  /** Saving embeds library fabric images too (256 px), for sharing with people without them. */
  includeLibraryImages: Type.Optional(Type.Boolean()),
});

export const RrqDoc = Type.Object(
  {
    format: Type.Literal(FORMAT),
    version: Type.Literal(VERSION),
    app: Type.String(),
    units: Units,
    project: Project,
  },
  {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://ragingroosevelt.github.io/RRQuilts/schemas/rrq.v${VERSION}.json`,
    title: `RRQuilts project (.rrq) v${VERSION}`,
  },
);

export type Units = Type.Static<typeof Units>;
export type LibraryRef = Type.Static<typeof LibraryRef>;
export type Project = Type.Static<typeof Project>;
export type RrqDoc = Type.Static<typeof RrqDoc>;
