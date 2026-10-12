// Single-block files (.rrqb): one block plus the colors its own colorings use. Imported blocks are
// the user's own (editable); the original author stays credited (constitution Principle VI).
import { produce } from 'immer';
import Type from 'typebox';
import Value from 'typebox/value';
import { findDuplicateIds } from './ids';
import { DEFAULT_LICENSE, settleCredits } from './credits';
import { canonicalContent, itemId, stableStringify } from './identity';
import { isLibraryItem } from './library-items';
import { createProject } from './new-project';
import { variationName } from './new-quilt';
import { Block } from './schema/block';
import { Color } from './schema/palette';
import { Units, type RrqDoc } from './schema/project';

export const BLOCK_FORMAT = 'rrqb';
export const BLOCK_VERSION = 1;

export const BlockFile = Type.Object({
  format: Type.Literal(BLOCK_FORMAT),
  version: Type.Integer({ minimum: 1 }),
  units: Units,
  /** Display name of whoever exported it. */
  author: Type.Optional(Type.String()),
  block: Block,
  colors: Type.Array(Color),
});
export type BlockFile = Type.Static<typeof BlockFile>;

const colorIdsOf = (b: Block) =>
  new Set(
    b.colorings.flatMap((c) =>
      Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : [])),
    ),
  );

/** `palette`: colors to draw from (project + library); only those the block uses are kept. */
export function blockFile(
  block: Block,
  units: Units,
  palette: readonly Color[],
  author: string,
): BlockFile {
  const used = colorIdsOf(block);
  const colors = [...new Map(palette.filter((c) => used.has(c.id)).map((c) => [c.id, c])).values()];
  return {
    format: BLOCK_FORMAT,
    version: BLOCK_VERSION,
    units,
    ...(author ? { author } : {}),
    block,
    colors,
  };
}

export const serializeBlock = (...args: Parameters<typeof blockFile>) =>
  JSON.stringify(blockFile(...args));

export function parseBlockFile(
  text: string,
): { ok: true; file: BlockFile } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not a block file (not valid JSON).' };
  }
  const r = raw as Record<string, unknown> | null;
  if (!r || r.format !== BLOCK_FORMAT) return { ok: false, error: 'Not an RRQuilts block file.' };
  if (typeof r.version === 'number' && r.version > BLOCK_VERSION) {
    return { ok: false, error: 'This block is from a newer RRQuilts. Update the app to open it.' };
  }
  if (!Value.Check(BlockFile, raw)) {
    const e = [...Value.Errors(BlockFile, raw)][0];
    return {
      ok: false,
      error: `Block file is damaged: ${e ? `${e.instancePath || '/'}: ${e.message}` : ''}`,
    };
  }
  const empty = createProject();
  const palette = { ...empty.project.palette, colors: raw.colors };
  const dup = findDuplicateIds({
    ...empty,
    project: { ...empty.project, palette, blocks: [raw.block] },
  });
  if (dup.length) return { ok: false, error: `Block file is damaged: ${dup[0]}` };
  return { ok: true, file: raw };
}

/**
 * Add an imported block to a project as the user's own block. Same id and version already there →
 * unchanged; same id, different design → added as a copy with a new id. Returns the block's id.
 */
export function importBlock(
  doc: RrqDoc,
  file: BlockFile,
  me: string,
): { doc: RrqDoc; blockId: string } {
  const existing = doc.project.blocks.find((b) => b.id === file.block.id);
  const same = (x: Block) =>
    x.version && file.block.version
      ? x.version === file.block.version
      : stableStringify(canonicalContent(x, doc.units)) ===
        stableStringify(canonicalContent(file.block, file.units));
  if (existing && same(existing)) return { doc, blockId: existing.id };
  const k = file.units === doc.units ? 1 : doc.units === 'cm' ? 2.54 : 1 / 2.54;
  const haveColors = new Set(doc.project.palette.colors.map((c) => c.id));
  const known = new Set([...haveColors, ...file.colors.map((c) => c.id)]);
  const block = produce(file.block, (b) => {
    b.size = [b.size[0] * k, b.size[1] * k];
    if (existing) {
      b.id = itemId(me);
      b.notecard.name = variationName(
        b.notecard.name,
        doc.project.blocks.map((x) => x.notecard.name),
      );
      delete b.revision;
      delete b.version;
    }
    // Credits come with the block; the importer becomes its author only once they change it.
    settleCredits(b);
    if (b.source) b.source.derived = true;
    if (!b.author && file.author && !b.credits?.length) b.author = file.author;
    b.license ??= doc.project.license ?? DEFAULT_LICENSE;
    for (const c of b.colorings) {
      for (const [pid, f] of Object.entries(c.fills))
        if ('color' in f && !known.has(f.color)) delete c.fills[pid];
      for (const [pid, f] of Object.entries(c.fills)) if ('fabric' in f) delete c.fills[pid]; // ponytail: fabrics aren't in .rrqb yet
    }
  });
  const next = produce(doc, (d) => {
    d.project.blocks.push(block);
    d.project.palette.colors.push(...file.colors.filter((c) => !haveColors.has(c.id)));
  });
  return { doc: next, blockId: block.id };
}

/**
 * Import every block of another (already parsed) project, nothing else, as if each were a `.rrqb`.
 * Blocks from a library the user already has (`skip`) are left out. Returns how many were added.
 */
export function importProjectBlocks(
  doc: RrqDoc,
  from: RrqDoc,
  me: string,
  skip: (id: string) => boolean = () => false,
): { doc: RrqDoc; added: number } {
  let next = doc;
  let added = 0;
  for (const b of from.project.blocks) {
    if (b.notecard.tags?.includes('system') || (isLibraryItem(b) && skip(b.id))) continue;
    const file = blockFile(b, from.units, from.project.palette.colors, from.project.author ?? '');
    const r = importBlock(next, file, me);
    if (r.doc !== next) added++;
    next = r.doc;
  }
  return { doc: next, added };
}
