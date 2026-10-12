import Type from 'typebox';
import { Block } from './block';
import { Embroidery, Font, Palette, Photo } from './palette';
import { Quilt } from './quilt';
import { Id } from './shared';

export const FORMAT = 'rrq';
export const VERSION = 1;

export const Units = Type.Union([Type.Literal('in'), Type.Literal('cm')]);

export const Project = Type.Object({
  /** Stable identity across renames and file copies (drafts, tab locks, recent list). */
  id: Id,
  name: Type.String(),
  notes: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  /** Covers the file; default for items without their own license (spec 009). */
  license: Type.Optional(Type.String()),
  palette: Palette,
  blocks: Type.Array(Block),
  photos: Type.Array(Photo),
  embroidery: Type.Array(Embroidery),
  quilts: Type.Array(Quilt),
  fonts: Type.Array(Font),
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
    $id: 'https://ragingroosevelt.github.io/RRQuilts/schemas/rrq.v1.json',
    title: 'RRQuilts project (.rrq) v1',
  },
);

export type Units = Type.Static<typeof Units>;
export type Project = Type.Static<typeof Project>;
export type RrqDoc = Type.Static<typeof RrqDoc>;
