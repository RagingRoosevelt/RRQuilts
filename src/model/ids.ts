import type { Block } from './schema/block';
import type { RrqDoc } from './schema/project';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Short random id (10 chars base-36 ≈ 52 bits); plenty for ids unique within one file. */
export function newId(length = 10): string {
  let id = '';
  for (const b of crypto.getRandomValues(new Uint8Array(length))) id += ALPHABET[b % 36];
  return id;
}

function dupes(ids: string[], scope: string, out: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) out.push(`duplicate id "${id}" in ${scope}`);
    seen.add(id);
  }
}

/** All ids inside one block (nodes, segments, patches, stitches, colorings, sections). */
export function blockIds(block: Block): string[] {
  const parts = block.kind === 'combo' ? [block.pieced, block.applique] : [block];
  const ids: string[] = [];
  for (const p of parts) {
    if ('drawing' in p)
      ids.push(...p.drawing.nodes.map((n) => n.id), ...p.drawing.segments.map((s) => s.id));
    ids.push(...p.patches.map((x) => x.id));
    if ('stitches' in p) ids.push(...p.stitches.map((s) => s.id));
    if ('background' in p && p.background) ids.push(p.background.id);
  }
  ids.push(...block.colorings.map((c) => c.id));
  ids.push(...(block.foundation?.sections.map((s) => s.id) ?? []));
  return ids;
}

/**
 * Id uniqueness is scoped: top-level items across the whole file; geometry and colorings within
 * their block; placed items and coloring-table keys within their quilt.
 */
export function findDuplicateIds(doc: RrqDoc): string[] {
  const p = doc.project;
  const out: string[] = [];
  dupes(
    [
      ...p.palette.fabrics,
      ...p.palette.colors,
      ...p.palette.threads,
      ...p.blocks,
      ...p.photos,
      ...p.embroidery,
      ...p.quilts,
      ...p.fonts,
    ].map((x) => x.id),
    'project',
    out,
  );
  for (const b of p.blocks) dupes(blockIds(b), `block ${b.id}`, out);
  for (const q of p.quilts) {
    dupes(
      [...Object.keys(q.colorings), ...q.layers.flatMap((l) => l.items.map((i) => i.id))],
      `quilt ${q.id}`,
      out,
    );
  }
  return out;
}
