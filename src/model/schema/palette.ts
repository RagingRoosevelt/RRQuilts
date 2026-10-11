import Type from 'typebox';
import { Asset, ItemId, RGB, Size, itemBase } from './shared';

export const Fabric = Type.Object({
  ...itemBase,
  image: Asset,
  /** Real-world size of the image in file units (true scale). */
  size: Size,
  average: RGB,
  manufacturer: Type.Optional(Type.String()),
  sku: Type.Optional(Type.String()),
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

export const Palette = Type.Object({
  fabrics: Type.Array(Fabric),
  colors: Type.Array(Color),
  threads: Type.Array(Thread),
});

export type Fabric = Type.Static<typeof Fabric>;
export type Color = Type.Static<typeof Color>;
export type Palette = Type.Static<typeof Palette>;
