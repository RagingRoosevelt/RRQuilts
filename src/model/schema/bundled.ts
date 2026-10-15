// Libraries every copy of the app offers (bundled_libraries.json at the project root, read at
// build time). Nothing is downloaded until the user opens one or switches a pack on.
import { Type } from 'typebox';

export const BUNDLED_FORMAT = 'rrq-bundled-libraries';
export const BUNDLED_VERSION = 1;

export const BundledLibrary = Type.Object(
  {
    /** Shown until the library's own index is downloaded (then its own name is used). */
    name: Type.String({ minLength: 1, maxLength: 200 }),
    /** The repository address, e.g. https://github.com/RRQuilts/rrqlib-cloud9 (https only). */
    url: Type.String({ pattern: '^https://', maxLength: 500 }),
    /** A branch or tag; the repository's default (main) when left out. */
    ref: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
    /** One line about it, shown under the name. */
    description: Type.Optional(Type.String({ maxLength: 500 })),
  },
  { additionalProperties: false },
);

export const BundledLibraries = Type.Object(
  {
    /** Lets editors check the file against the published schema. */
    $schema: Type.Optional(Type.String()),
    format: Type.Literal(BUNDLED_FORMAT),
    version: Type.Literal(BUNDLED_VERSION),
    libraries: Type.Array(BundledLibrary),
  },
  {
    additionalProperties: false,
    $id: 'https://ragingroosevelt.github.io/RRQuilts/schemas/bundled_libraries.v1.json',
  },
);

export type BundledLibrary = Type.Static<typeof BundledLibrary>;
export type BundledLibraries = Type.Static<typeof BundledLibraries>;
