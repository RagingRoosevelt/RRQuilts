// Library items in projects (spec 008): a library item is embedded only while something uses it,
// keeps its identity (`id@version`), and is never edited in place.
import { swapColorings } from './quilt-variants';
import { produce, type Draft } from 'immer';
import { syncPalettes } from './project-palettes';
import { newId } from './ids';
import { allPatches } from './blocks/patches';
import { assignIds, remapColoring } from './blocks/remap';
import { pathPolygon } from './geometry/path';
import { variationName } from './new-quilt';
import type { Block } from './schema/block';
import type { ColoringBody } from './schema/coloring';
import type { Color, Fabric } from './schema/palette';
import type { RrqDoc } from './schema/project';

type Sourced = { source?: { libraryId: string; derived?: boolean | undefined } | undefined };
/** Came from a library and hasn't been changed: read-only, identified by `id@version`. */
export const isLibraryItem = (x: Sourced) => !!x.source && !x.source.derived;

export interface LibraryLookup {
  block(id: string): Block | undefined;
  color(id: string): Color | undefined;
  /** Library fabrics (spec 014); optional so plain lookups (tests, files) needn't provide it. */
  fabric?(id: string): Fabric | undefined;
}

/** A library fabric (sizes in inches, like library blocks) in project units. */
export const fabricToUnits = (f: Fabric, units: RrqDoc['units']): Fabric =>
  units === 'cm' ? { ...f, size: [f.size[0] * 2.54, f.size[1] * 2.54] } : f;

/** A library block (inches) in project units. */
export const toUnits = (b: Block, units: RrqDoc['units']): Block =>
  units === 'cm' ? { ...b, size: [b.size[0] * 2.54, b.size[1] * 2.54] } : b;

export const colorsIn = (colorings: ColoringBody[]) =>
  colorings.flatMap((c) => Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : [])));
export const fabricsIn = (colorings: ColoringBody[]) =>
  colorings.flatMap((c) =>
    Object.values(c.fills).flatMap((f) => ('fabric' in f ? [f.fabric] : [])),
  );

export const blocksUsed = (p: RrqDoc['project']) =>
  new Set(
    p.quilts.flatMap((q) => [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...q.layers.flatMap((l) => l.items.flatMap((i) => (i.ref ? [i.ref] : []))),
    ]),
  );

/**
 * Keep library items in step with use, inside one edit: embed library blocks/colors that are
 * referenced but missing (converted to project units), then drop library items nothing uses.
 */
export function syncDraft(d: Draft<RrqDoc>, lib?: LibraryLookup) {
  const p = d.project;
  syncPalettes(d, newId);
  if (lib) {
    const have = new Set(p.blocks.map((b) => b.id));
    for (const id of blocksUsed(p)) {
      const b = !have.has(id) ? lib.block(id) : undefined;
      if (b) p.blocks.push(toUnits(b, d.units));
    }
  }
  // Color variants carry their library block's name.
  for (const b of p.blocks) {
    const name =
      b.colorVariant && b.source && (lib?.block(b.source.itemId)?.notecard.name ?? b.source.name);
    if (name && b.notecard.name !== name) b.notecard.name = name;
  }
  const usedBlocks = blocksUsed(p);
  const keptBlocks = p.blocks.filter((b) => !isLibraryItem(b) || usedBlocks.has(b.id));
  if (keptBlocks.length !== p.blocks.length) p.blocks = keptBlocks;
  const usedColors = new Set(
    colorsIn([
      ...p.blocks.flatMap((b) => b.colorings),
      ...p.quilts.flatMap((q) => Object.values(q.colorings)),
      ...swapColorings(p.quilts),
    ]),
  );
  if (lib) {
    const have = new Set(p.palette.colors.map((c) => c.id));
    for (const id of usedColors) {
      const c = !have.has(id) ? lib.color(id) : undefined;
      if (c) p.palette.colors.push(c);
    }
  }
  const keptColors = p.palette.colors.filter((c) => !isLibraryItem(c) || usedColors.has(c.id));
  if (keptColors.length !== p.palette.colors.length) p.palette.colors = keptColors;
  // Library fabrics (spec 014) the same way: in the project while painted, gone when not.
  const colorings = [
    ...p.blocks.flatMap((b) => b.colorings),
    ...p.quilts.flatMap((q) => Object.values(q.colorings)),
    ...swapColorings(p.quilts),
  ];
  const usedFabrics = new Set(fabricsIn(colorings));
  if (lib?.fabric) {
    const have = new Set(p.palette.fabrics.map((f) => f.id));
    for (const id of usedFabrics) {
      const f = !have.has(id) ? lib.fabric(id) : undefined;
      if (f) p.palette.fabrics.push(fabricToUnits(f, d.units));
    }
  }
  const keptFabrics = p.palette.fabrics.filter((f) => !isLibraryItem(f) || usedFabrics.has(f.id));
  if (keptFabrics.length !== p.palette.fabrics.length) p.palette.fabrics = keptFabrics;
}

export const syncLibraryItems = (doc: RrqDoc, lib?: LibraryLookup): RrqDoc =>
  produce(doc, (d) => syncDraft(d, lib));

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
  const assignments = assignIds(oldPatches, newPatches).map((a, i) => ({
    ...a,
    id: allPatches(next)[i]!.id,
  }));
  const oldIds = new Set(oldPatches.map((p) => p.id));
  const swapped = produce(doc, (d) => {
    d.project.blocks = d.project.blocks.map((b) => (b.id === next.id ? next : b));
    for (const q of d.project.quilts) {
      const used = new Set(
        Object.values(q.layers[0].slots).flatMap((s) => (s.block === next.id ? [s.coloring] : [])),
      );
      for (const id of used) {
        const c = q.colorings[id];
        if (c) q.colorings[id] = remapColoring(c, assignments, oldIds);
      }
    }
  });
  return syncLibraryItems(swapped, lib);
}

/**
 * Before replacing an embedded library item with another version, keep it as the user's own item:
 * new id, "(rev N)" name, still credited (derived).
 */
export function keepAsMine(doc: RrqDoc, kind: 'block' | 'color', id: string, newItemId: string) {
  const list = kind === 'block' ? doc.project.blocks : doc.project.palette.colors;
  const old = list.find((x) => x.id === id);
  if (!old) return doc;
  const taken = list.map((x) => x.notecard.name);
  const base = `${old.notecard.name} (rev ${old.revision ?? 1})`;
  const copy = produce(old, (c) => {
    c.id = newItemId;
    c.notecard.name = taken.includes(base) ? variationName(base, taken) : base;
    delete c.version; // stamped on save; revisions restart for the new item
    delete c.revision;
    if (c.source) c.source.derived = true;
  });
  return produce(doc, (d) => {
    if (kind === 'block') d.project.blocks.push(copy as Block);
    else d.project.palette.colors.push(copy as Color);
  });
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
  return syncLibraryItems(withCopy);
}

/**
 * My items vs library items for display. A library entry shows the project's embedded copy when
 * there is one (it's what the project uses); embedded items whose library isn't installed follow.
 * Entries the project holds as its own (linked copies with the same id, spec 011) show only there.
 */
export function splitItems<T extends { id: string } & Sourced>(
  project: readonly T[],
  library: readonly T[],
) {
  const embedded = new Map(project.filter(isLibraryItem).map((x) => [x.id, x]));
  const libIds = new Set(library.map((x) => x.id));
  const mine = project.filter((x) => !isLibraryItem(x));
  const own = new Set(mine.map((x) => x.id));
  return {
    mine,
    library: [
      ...library.filter((x) => !own.has(x.id)).map((x) => embedded.get(x.id) ?? x),
      ...[...embedded.values()].filter((x) => !libIds.has(x.id)),
    ],
  };
}

/** A color variant's own colorings: those new or changed since it was copied from its library
 *  block (`lib` finds that block). Undefined for other blocks, or when the original isn't found. */
export function projectColorings(
  b: Block,
  lib: { block(id: string): Block | undefined } | undefined,
) {
  const origin = b.colorVariant && b.source ? lib?.block(b.source.itemId) : undefined;
  if (!origin) return undefined;
  const theirs = new Set(origin.colorings.map((c) => JSON.stringify(c)));
  return { origin, own: b.colorings.filter((c) => !theirs.has(JSON.stringify(c))) };
}

/**
 * A block's colorings in sections for previews: a color variant's own colorings apart from its
 * library block's (spec 008 US7); otherwise one unlabeled section.
 */
export function coloringSections(
  b: Block,
  lib: { block(id: string): Block | undefined } | undefined,
  own = 'Project colorings',
): { label?: string; colorings: Block['colorings'] }[] {
  const v = projectColorings(b, lib);
  if (!v || !v.own.length) return [{ colorings: b.colorings }];
  const mine = new Set(v.own.map((c) => c.id));
  const theirs = b.colorings.filter((c) => !mine.has(c.id));
  return [
    { label: own, colorings: v.own },
    ...(theirs.length ? [{ label: 'Library colorings', colorings: theirs }] : []),
  ];
}
