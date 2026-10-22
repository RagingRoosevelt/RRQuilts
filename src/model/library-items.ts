// Library items in projects (spec 008): a library item is embedded only while something uses it,
// keeps its identity (`id@version`), and is never edited in place.
import { plainFill } from './coloring';
import { swapColorings } from './colorways';
import { applyPicks, dataBlocks, dataColorings, pruneVariants, syncVariants } from './data-quilt';
import { castDraft, current, isDraft, produce, type Draft } from 'immer';
import { refreshAuto, type PaletteSwatch } from './colorway-auto';
import { projectPalettes, syncPalettes } from './project-palettes';
import { newId } from './ids';
import { allPatches } from './blocks/patches';
import { assignIds, remapColoring } from './blocks/remap';
import { pathPolygon } from './geometry/path';
import { variationName } from './new-quilt';
import type { Block } from './schema/block';
import type { ColoringBody, Fill } from './schema/coloring';
import type { Color, Fabric } from './schema/palette';
import type { ColorCollection } from './schema/library';
import type { RrqDoc } from './schema/project';

type Sourced = { source?: { libraryId: string; derived?: boolean | undefined } | undefined };
/** Came from a library and hasn't been changed: read-only, identified by `id@version`. */
export const isLibraryItem = (x: Sourced) => !!x.source && !x.source.derived;

export interface LibraryLookup {
  block(id: string): Block | undefined;
  color(id: string): Color | undefined;
  /** Library fabrics (spec 014); optional so plain lookups (tests, files) needn't provide it. */
  fabric?(id: string): Fabric | undefined;
  /** Library palettes (spec 024 auto mapping); optional likewise. */
  collection?(id: string): ColorCollection | undefined;
}

/** A library fabric (sizes in inches, like library blocks) in project units. */
export const fabricToUnits = (f: Fabric, units: RrqDoc['units']): Fabric =>
  units === 'cm' ? { ...f, size: [f.size[0] * 2.54, f.size[1] * 2.54] } : f;

/** A library block (inches) in project units. */
/** What a block's drawing is made of (not its name, credits or colorings). */
const DRAWN = [
  'size',
  'shape',
  'drawing',
  'patches',
  'unconnected',
  'grid',
  'stitches',
  'background',
  'data',
] as const;

/**
 * Color variants carry their library block's name, and its drawing (theirs is locked): the block
 * as the project holds it (so a declined library update stays declined), else as the library has
 * it. A redrawn block redraws them, their own colorings kept, new patches colored as its first.
 */
export function followColorVariants(
  d: Draft<RrqDoc>,
  lib: { block(id: string): Block | undefined } | undefined,
) {
  const p = d.project;
  for (const b of p.blocks) {
    if (!b.colorVariant || !b.source) continue;
    const id = b.source.itemId;
    const own = p.blocks.find((x) => x.id === id);
    // The project's copy is a draft here: a plain copy of it to read from.
    const origin = (own && (isDraft(own) ? current(own) : own)) ?? lib?.block(id);
    const name = origin?.notecard.name ?? b.source.name;
    if (name && b.notecard.name !== name) b.notecard.name = name;
    if (origin && origin.kind === b.kind) followDrawing(b, toUnits(origin, d.units));
  }
}

/** A color variant redrawn as its library block `o` is now (spec 008: its drawing is locked). */
function followDrawing(b: Draft<Block>, o: Block) {
  const bb = b as Record<string, unknown>;
  const oo = o as Record<string, unknown>;
  let changed = false;
  for (const k of DRAWN) {
    if (JSON.stringify(bb[k]) === JSON.stringify(oo[k])) continue;
    changed = true;
    if (oo[k] === undefined) delete bb[k];
    else bb[k] = structuredClone(oo[k]);
  }
  if (!changed) return;
  const ids = [
    ...('patches' in o ? o.patches.map((x) => x.id) : []),
    ...(o.data?.variants ?? []).flatMap((v) => v.patches.map((x) => x.id)),
  ];
  const first = o.colorings[0]?.fills ?? {};
  for (const c of b.colorings)
    for (const id of ids) if (!(id in c.fills) && first[id]) c.fills[id] = castDraft(first[id]);
}

export const toUnits = (b: Block, units: RrqDoc['units']): Block =>
  units === 'cm' ? { ...b, size: [b.size[0] * 2.54, b.size[1] * 2.54] } : b;

export const colorsIn = (colorings: ColoringBody[]) =>
  colorings.flatMap((c) =>
    Object.values(c.fills).flatMap((x) => {
      const f = plainFill(x);
      return f && 'color' in f ? [f.color] : [];
    }),
  );
export const fabricsIn = (colorings: ColoringBody[]) =>
  colorings.flatMap((c) =>
    Object.values(c.fills).flatMap((x) => {
      const f = plainFill(x);
      return f && 'fabric' in f ? [f.fabric] : [];
    }),
  );

export const blocksUsed = (p: RrqDoc['project']) =>
  new Set(
    p.quilts.flatMap((q) => [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...dataBlocks(q),
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
  followColorVariants(d, lib);
  // Data quilts (spec 025): placed spaces show their type's variant for their number's days.
  syncVariants(p.blocks, p.quilts);
  p.quilts.forEach((q, i) => {
    if (!q.data?.on) return;
    // A quilt (a layout change) or a part of it (a new plan) swapped in whole by the edit isn't a
    // draft and may be frozen: copy it so its blocks can be placed.
    const live = isDraft(q) ? q : (p.quilts[i] = castDraft(structuredClone(q)));
    // ponytail: a part that isn't a draft was swapped in, and may hold frozen pieces: copy it all.
    const thaw = <T>(v: T): T =>
      v && typeof v === 'object' && !isDraft(v) ? (castDraft(structuredClone(v)) as T) : v;
    if (live.data) live.data = thaw(live.data);
    live.colorings = thaw(live.colorings);
    live.layers[0] = thaw(live.layers[0]);
    live.layers[0].slots = thaw(live.layers[0].slots);
    applyPicks(live, p.blocks, newId);
  });
  const withVariants = pruneVariants(p.blocks, p.quilts);
  if (withVariants.length !== p.blocks.length) p.blocks = withVariants;
  const usedBlocks = blocksUsed(p);
  const keptBlocks = p.blocks.filter((b) => !isLibraryItem(b) || usedBlocks.has(b.id));
  if (keptBlocks.length !== p.blocks.length) p.blocks = keptBlocks;
  // Auto mapping (spec 024): worked out from the source colors and the palette as they are now.
  refreshAutoMappings(d, lib);
  const usedColors = new Set(
    colorsIn([
      ...p.blocks.flatMap((b) => b.colorings),
      ...p.quilts.flatMap((q) => Object.values(q.colorings)),
      ...swapColorings(p.quilts),
      ...dataColorings(p.quilts),
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
    ...dataColorings(p.quilts),
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

function refreshAutoMappings(d: Draft<RrqDoc>, lib?: LibraryLookup) {
  const p = d.project;
  if (!p.quilts.some((q) => q.colorways?.some((v) => v.auto))) return;
  const doc = current(d);
  const own = new Map(projectPalettes(doc).map((pp) => [pp.palette.id, pp]));
  const color = (id: string) =>
    doc.project.palette.colors.find((c) => c.id === id) ?? lib?.color(id);
  const fabric = (id: string) =>
    doc.project.palette.fabrics.find((f) => f.id === id) ?? lib?.fabric?.(id);
  const swatches = (colors: readonly Color[], fabrics: readonly Fabric[]): PaletteSwatch[] => [
    ...colors.map((c) => ({ fill: { color: c.id }, rgb: c.rgb })),
    ...fabrics.map((f) => ({
      fill: { fabric: f.id, offset: [0, 0] as [number, number], rotation: 0 },
      rgb: f.average,
    })),
  ];
  const paletteOf = (id: string) => {
    const pp = own.get(id);
    if (pp) return swatches(pp.colors, pp.fabrics);
    if (!lib?.collection) return null; // libraries not known here: leave it
    const c = lib.collection(id);
    return c && swatches(c.colors, c.fabrics ?? []);
  };
  const rgbOf = (x: Fill) => {
    const f = plainFill(x);
    return !f ? undefined : 'color' in f ? color(f.color)?.rgb : fabric(f.fabric)?.average;
  };
  p.quilts.forEach((q, i) => {
    const next = refreshAuto(doc.project.quilts[i]!, doc.project.blocks, paletteOf, rgbOf);
    if (next !== doc.project.quilts[i] && next.colorways)
      p.quilts[i]!.colorways = castDraft(next.colorways);
  });
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
