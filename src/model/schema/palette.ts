import Type from 'typebox';
import { Asset, ItemId, RGB, Size, itemBase } from './shared';

/** One standard size of a library fabric's image (spec 014: 256, 512, 1024 px long side). */
export const FabricImage = Type.Object({
  px: Type.Integer({ minimum: 1 }),
  sha256: Type.String({ pattern: '^[a-f0-9]{64}$' }),
  type: Type.String(),
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  /** Relative file in a library (repository layout); absent when only the hash is known. */
  path: Type.Optional(Type.String()),
});

export const Fabric = Type.Object({
  ...itemBase,
  /** The fabric's main image (largest size up to 512 px), embedded or referenced by hash. */
  image: Asset,
  /** Real-world size of the image in file units (true scale). */
  size: Size,
  /** The size wasn't set, so it's the 8 in default (shown with ≈). */
  approximate: Type.Optional(Type.Literal(true)),
  average: RGB,
  manufacturer: Type.Optional(Type.String()),
  sku: Type.Optional(Type.String()),
  /** Library fabrics: every standard size available, never larger than the source. */
  sizes: Type.Optional(Type.Array(FabricImage)),
});

export const Color = Type.Object({ ...itemBase, rgb: RGB });

export const Thread = Type.Object({
  ...itemBase,
  rgb: RGB,
  number: Type.Optional(Type.String()),
  manufacturer: Type.Optional(Type.String()),
});

export const Photo = Type.Object({ ...itemBase, image: Asset });

export const Embroidery = Type.Object({
  ...itemBase,
  file: Asset,
  threads: Type.Array(ItemId),
});

/** A typeface used by text items: embedded file or a font bundled with the app. */
export const Font = Type.Object({
  id: ItemId,
  family: Type.String(),
  asset: Type.Optional(Asset),
  bundled: Type.Optional(Type.String()),
});

/**
 * A palette of the project's own colors and fabrics (v3): named, listing them by id. The colors
 * and fabrics themselves stay in `colors` / `fabrics`; library ones come with library palettes.
 */
export const ProjectPalette = Type.Object({
  id: ItemId,
  notecard: Type.Object({ name: Type.String() }),
  colors: Type.Array(ItemId),
  fabrics: Type.Array(ItemId),
});

export const Palette = Type.Object({
  fabrics: Type.Array(Fabric),
  colors: Type.Array(Color),
  threads: Type.Array(Thread),
  /** The project's own palettes (v3). Own colors and fabrics in none of them join the first. */
  collections: Type.Optional(Type.Array(ProjectPalette)),
});
export type ProjectPalette = Type.Static<typeof ProjectPalette>;

export type Fabric = Type.Static<typeof Fabric>;
export type FabricImage = Type.Static<typeof FabricImage>;
export type Color = Type.Static<typeof Color>;
export type Palette = Type.Static<typeof Palette>;
