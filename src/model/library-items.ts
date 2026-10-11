// Library items in projects (spec 008): a library item is embedded only while something uses it,
// keeps its identity (`id@version`), and is never edited in place.
import { produce } from 'immer';
import { allPatches } from './blocks/patches';
import { assignIds } from './blocks/remap';
import { pathPolygon } from './geometry/path';
import type { Block } from './schema/block';
import type { ColoringBody } from './schema/coloring';
import type { Color } from './schema/palette';
import type { RrqDoc } from './schema/project';

type Sourced = { source?: { derived?: boolean } | undefined };
/** Came from a library and hasn't been changed: read-only, identified by `id@version`. */
export const isLibraryItem = (x: Sourced) => !!x.source && !x.source.derived;

export interface LibraryLookup {
  block(id: string): Block | undefined;
  color(id: string): Color | undefined;
}

const toUnits = (b: Block, units: RrqDoc['units']): Block =>
  units === 'cm' ? { ...b, size: [b.size[0] * 2.54, b.size[1] * 2.54] } : b;

const colorsIn = (colorings: ColoringBody[]) =>
  colorings.flatMap((c) => Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : [])));

/** Copy library blocks/colors into the project if missing (plus colors their default colorings use). */
export function embed(
  doc: RrqDoc,
  lib: LibraryLookup,
  want: { blocks?: string[]; colors?: string[] },
): RrqDoc {
  const p = doc.project;
  const haveBlocks = new Set(p.blocks.map((b) => b.id));
  const haveColors = new Set(p.palette.colors.map((c) => c.id));
  const blocks = (want.blocks ?? [])
    .filter((id) => !haveBlocks.has(id))
    .map((id) => lib.block(id))
    .filter((b) => !!b);
  const colorIds = [...(want.colors ?? []), ...colorsIn(blocks.flatMap((b) => b.colorings))];
  const colors = [...new Set(colorIds)]
    .filter((id) => !haveColors.has(id))
    .map((id) => lib.color(id))
    .filter((c) => !!c);
  if (!blocks.length && !colors.length) return doc;
  return produce(doc, (d) => {
    d.project.blocks.push(...blocks.map((b) => toUnits(b, doc.units)));
    d.project.palette.colors.push(...colors);
  });
}

/** Remove embedded library items nothing uses anymore (blocks first, then colors). */
export function pruneLibraryItems(doc: RrqDoc): RrqDoc {
  const p = doc.project;
  const usedBlocks = new Set(
    p.quilts.flatMap((q) => [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...q.layers.flatMap((l) => l.items.flatMap((i) => (i.ref ? [i.ref] : []))),
    ]),
  );
  const keptBlocks = p.blocks.filter((b) => !isLibraryItem(b) || usedBlocks.has(b.id));
  const usedColors = new Set(
    colorsIn([
      ...keptBlocks.flatMap((b) => b.colorings),
      ...p.quilts.flatMap((q) => Object.values(q.colorings)),
    ]),
  );
  const keptColors = p.palette.colors.filter((c) => !isLibraryItem(c) || usedColors.has(c.id));
  if (keptBlocks.length === p.blocks.length && keptColors.length === p.palette.colors.length)
    return doc;
  return produce(doc, (d) => {
    d.project.blocks = d.project.blocks.filter((b) => keptBlocks.some((k) => k.id === b.id));
    d.project.palette.colors = d.project.palette.colors.filter((c) =>
      keptColors.some((k) => k.id === c.id),
    );
  });
}

/** Embedded library items whose library has the same id at a different version. */
export function versionMismatches(doc: RrqDoc, lib: LibraryLookup) {
  const out: { kind: 'block' | 'color'; project: Block | Color; library: Block | Color }[] = [];
  for (const b of doc.project.blocks) {
    const l = isLibraryItem(b) ? lib.block(b.id) : undefined;
    if (l?.version && b.version && l.version !== b.version)
      out.push({ kind: 'block', project: b, library: l });
  }
  for (const c of doc.project.palette.colors) {
    const l = isLibraryItem(c) ? lib.color(c.id) : undefined;
    if (l?.version && c.version && l.version !== c.version)
      out.push({ kind: 'color', project: c, library: l });
  }
  return out;
}

/** Replace an embedded block with another version (same id), carrying quilt fills by overlap. */
export function swapToLibraryVersion(doc: RrqDoc, libBlock: Block, lib: LibraryLookup): RrqDoc {
  const old = doc.project.blocks.find((b) => b.id === libBlock.id);
  if (!old) return doc;
  const next = toUnits(libBlock, doc.units);
  const oldPatches = allPatches(old).map((p) => ({
    id: p.id,
    poly: pathPolygon(p.path, old.size),
  }));
  const newPatches = allPatches(next).map((p) => ({
    path: p.path,
    poly: pathPolygon(p.path, next.size),
  }));
  const from = assignIds(oldPatches, newPatches).map((a) => a.from);
  const newIds = allPatches(next).map((p) => p.id);
  const swapped = produce(doc, (d) => {
    d.project.blocks = d.project.blocks.map((b) => (b.id === next.id ? next : b));
    for (const q of d.project.quilts) {
      const used = new Set(
        Object.values(q.layers[0].slots).flatMap((s) => (s.block === next.id ? [s.coloring] : [])),
      );
      for (const id of used) {
        const c = q.colorings[id];
        if (!c) continue;
        const fills: ColoringBody['fills'] = {};
        newIds.forEach((pid, i) => {
          const src = from[i];
          if (src && c.fills[src]) fills[pid] = c.fills[src];
        });
        c.fills = fills;
      }
    }
  });
  return embed(swapped, lib, { colors: colorsIn(next.colorings) });
}

/** Add the user's copy of a library block and use it wherever the library block was used. */
export function useMyCopy(
  doc: RrqDoc,
  libBlockId: string,
  copy: Block,
  replaceInQuilts: boolean,
): RrqDoc {
  const withCopy = produce(doc, (d) => {
    d.project.blocks.push(copy);
    if (!replaceInQuilts) return;
    for (const q of d.project.quilts) {
      for (const s of Object.values(q.layers[0].slots))
        if (s.block === libBlockId) s.block = copy.id;
      for (const i of q.layers.flatMap((l) => l.items)) if (i.ref === libBlockId) i.ref = copy.id;
    }
  });
  return pruneLibraryItems(withCopy);
}
