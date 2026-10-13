// Single color-collection files (.rrqcc, spec 011): like .rrqbl for one block.
import { produce } from 'immer';
import Type from 'typebox';
import Value from 'typebox/value';
import { DEFAULT_LICENSE, settleCredits } from './credits';
import { ColorCollection } from './schema/library';
import { colorsIn, isLibraryItem } from './library-items';
import type { Color } from './schema/palette';
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
    return { ok: false, error: 'Not a palette file (not valid JSON).' };
  }
  const r = raw as Record<string, unknown> | null;
  if (!r || r.format !== COLLECTION_FORMAT)
    return { ok: false, error: 'Not an RRQuilts palette file.' };
  if (typeof r.version === 'number' && r.version > COLLECTION_VERSION)
    return {
      ok: false,
      error: 'This palette is from a newer RRQuilts. Update the app to open it.',
    };
  if (!Value.Check(CollectionFile, raw)) {
    const e = [...Value.Errors(CollectionFile, raw)][0];
    return {
      ok: false,
      error: `Palette file is damaged: ${e ? `${e.instancePath || '/'}: ${e.message}` : ''}`,
    };
  }
  const ids = raw.collection.colors.map((c) => c.id);
  if (new Set(ids).size !== ids.length)
    return { ok: false, error: 'Palette file is damaged: duplicate color ids.' };
  return { ok: true, file: raw };
}

/**
 * A collection's colors (from a .rrqcc file or a library) join a project as the user's own colors,
 * credits kept and library links kept (Sync works for My library); colors already there (same id)
 * are skipped. `overwrite` first removes the user's own colors that no patch uses (used ones stay).
 */
export function importCollectionColors(
  doc: RrqDoc,
  c: ColorCollection,
  mode: 'append' | 'overwrite' = 'append',
) {
  const incoming = new Set(c.colors.map((x) => x.id));
  const p = doc.project;
  const used = new Set(
    colorsIn([
      ...p.blocks.flatMap((b) => b.colorings),
      ...p.quilts.flatMap((q) => Object.values(q.colorings)),
    ]),
  );
  const drop = (x: Color) =>
    mode === 'overwrite' && !isLibraryItem(x) && !incoming.has(x.id) && !used.has(x.id);
  const kept = doc.project.palette.colors.filter((x) => !drop(x));
  const have = new Set(kept.map((x) => x.id));
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
  const removed = doc.project.palette.colors.length - kept.length;
  if (!added.length && !removed) return { doc, added: 0, removed: 0 };
  return {
    doc: produce(doc, (d) => void (d.project.palette.colors = [...kept, ...added] as Color[])),
    added: added.length,
    removed,
  };
}
