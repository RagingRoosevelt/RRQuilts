// Single color-collection files (.rrqcc, spec 011): like .rrqbl for one block.
import { produce } from 'immer';
import Type from 'typebox';
import Value from 'typebox/value';
import { DEFAULT_LICENSE, settleCredits } from './credits';
import { ColorCollection } from './schema/library';
import { Units, type RrqDoc } from './schema/project';

export const COLLECTION_FORMAT = 'rrqcc';
export const COLLECTION_VERSION = 1;

export const CollectionFile = Type.Object({
  format: Type.Literal(COLLECTION_FORMAT),
  version: Type.Integer({ minimum: 1 }),
  units: Type.Optional(Units),
  app: Type.Optional(Type.String()),
  collection: ColorCollection,
});
export type CollectionFile = Type.Static<typeof CollectionFile>;

export const collectionFile = (collection: ColorCollection, app: string): CollectionFile => ({
  format: COLLECTION_FORMAT,
  version: COLLECTION_VERSION,
  app,
  collection,
});

export function parseCollectionFile(
  text: string,
): { ok: true; file: CollectionFile } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not a color collection file (not valid JSON).' };
  }
  const r = raw as Record<string, unknown> | null;
  if (!r || r.format !== COLLECTION_FORMAT)
    return { ok: false, error: 'Not an RRQuilts color collection file.' };
  if (typeof r.version === 'number' && r.version > COLLECTION_VERSION)
    return {
      ok: false,
      error: 'This collection is from a newer RRQuilts. Update the app to open it.',
    };
  if (!Value.Check(CollectionFile, raw)) {
    const e = [...Value.Errors(CollectionFile, raw)][0];
    return {
      ok: false,
      error: `Color collection file is damaged: ${e ? `${e.instancePath || '/'}: ${e.message}` : ''}`,
    };
  }
  const ids = raw.collection.colors.map((c) => c.id);
  if (new Set(ids).size !== ids.length)
    return { ok: false, error: 'Color collection file is damaged: duplicate color ids.' };
  return { ok: true, file: raw };
}

/**
 * A collection's colors join a project as the user's own colors (credits kept); colors already
 * there (same id) are skipped. Returns how many were added.
 */
export function importCollectionColors(doc: RrqDoc, file: CollectionFile) {
  const have = new Set(doc.project.palette.colors.map((c) => c.id));
  const c = file.collection;
  const added = c.colors
    .filter((x) => !have.has(x.id))
    .map((x) =>
      produce(x, (d) => {
        settleCredits(d);
        if (d.source) d.source.derived = true;
        if (!d.author && c.author) d.author = c.author;
        d.license ??= c.license ?? doc.project.license ?? DEFAULT_LICENSE;
      }),
    );
  if (!added.length) return { doc, added: 0 };
  return {
    doc: produce(doc, (d) => void d.project.palette.colors.push(...added)),
    added: added.length,
  };
}
