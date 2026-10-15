// The project's own palettes (format v3): named groups of its own colors and fabrics, listed by id.
// Library colors and fabrics aren't in them (they come with library palettes).
import type { Draft } from 'immer';
import { isLibraryItem } from './library-items';
import type { ColorCollection } from './schema/library';
import type { Color, Fabric, ProjectPalette } from './schema/palette';
import type { RrqDoc } from './schema/project';

export const DEFAULT_PALETTE = 'Project palette';

/**
 * Keep palettes in step with the project (run on every edit): own colors and fabrics in no palette
 * join the first (one named "Project palette" is made if there's none), and ids of items that are
 * gone are dropped.
 */
export function syncPalettes(d: Draft<RrqDoc>, newId: () => string) {
  const p = d.project.palette;
  const colors = new Set(p.colors.filter((c) => !isLibraryItem(c)).map((c) => c.id));
  const fabrics = new Set(p.fabrics.filter((f) => !isLibraryItem(f)).map((f) => f.id));
  const cols = p.collections ?? [];
  for (const c of cols) {
    if (c.colors.some((id) => !colors.has(id))) c.colors = c.colors.filter((id) => colors.has(id));
    if (c.fabrics.some((id) => !fabrics.has(id)))
      c.fabrics = c.fabrics.filter((id) => fabrics.has(id));
  }
  const filed = new Set(cols.flatMap((c) => [...c.colors, ...c.fabrics]));
  const loose = {
    colors: [...colors].filter((id) => !filed.has(id)),
    fabrics: [...fabrics].filter((id) => !filed.has(id)),
  };
  if (!loose.colors.length && !loose.fabrics.length) return;
  if (!p.collections?.length)
    p.collections = [{ id: newId(), notecard: { name: DEFAULT_PALETTE }, colors: [], fabrics: [] }];
  const first = p.collections[0]!;
  first.colors.push(...loose.colors);
  first.fabrics.push(...loose.fabrics);
}

/** The project's palettes with their colors and fabrics (own items in none are shown in the first). */
export function projectPalettes(doc: RrqDoc): {
  palette: ProjectPalette;
  colors: Color[];
  fabrics: Fabric[];
}[] {
  const p = doc.project.palette;
  const color = new Map(p.colors.map((c) => [c.id, c]));
  const fabric = new Map(p.fabrics.map((f) => [f.id, f]));
  return (p.collections ?? []).map((palette) => ({
    palette,
    colors: palette.colors.flatMap((id) => color.get(id) ?? []),
    fabrics: palette.fabrics.flatMap((id) => fabric.get(id) ?? []),
  }));
}

/** Add a new, empty palette; returns its id. */
export function addPalette(d: Draft<RrqDoc>, id: string, name: string) {
  (d.project.palette.collections ??= []).push({ id, notecard: { name }, colors: [], fabrics: [] });
  return id;
}

/** Put colors and fabrics (already in the project) into palette `id` (moving them from others). */
export function fileInto(d: Draft<RrqDoc>, id: string, colors: string[], fabrics: string[] = []) {
  const cols = d.project.palette.collections ?? [];
  for (const c of cols) {
    c.colors = c.colors.filter((x) => !colors.includes(x));
    c.fabrics = c.fabrics.filter((x) => !fabrics.includes(x));
  }
  const to = cols.find((c) => c.id === id);
  if (to) {
    to.colors.push(...colors);
    to.fabrics.push(...fabrics);
  }
}

export function renamePalette(d: Draft<RrqDoc>, id: string, name: string) {
  const c = d.project.palette.collections?.find((x) => x.id === id);
  if (c) c.notecard.name = name;
}

/** Remove palette `id` and its colors and fabrics from the project (the caller swaps uses first). */
export function deletePalette(d: Draft<RrqDoc>, id: string) {
  const p = d.project.palette;
  const gone = p.collections?.find((c) => c.id === id);
  if (!gone) return;
  p.collections = p.collections!.filter((c) => c.id !== id);
  p.colors = p.colors.filter((c) => !gone.colors.includes(c.id));
  p.fabrics = p.fabrics.filter((f) => !gone.fabrics.includes(f.id));
}

/** A short hash of one color or fabric (id, name, color), to tell whether it changed. */
const itemKey = (x: Color | Fabric) => {
  const text = `${x.id}|${x.notecard.name}|${'rgb' in x ? x.rgb.join() : 'fabric'}`;
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
};

/** What a palette holds, as `id=hash` per color and fabric (kept as the link's `base`). */
export function contentKey(colors: readonly Color[], fabrics: readonly Fabric[]) {
  return [...colors, ...fabrics]
    .map((x) => `${x.id}=${itemKey(x)}`)
    .sort()
    .join(';');
}
const parseKey = (key: string | undefined) =>
  key === undefined
    ? undefined
    : new Map(
        key
          .split(';')
          .filter(Boolean)
          .map((e) => e.split('=') as [string, string]),
      );

export interface PaletteLink {
  collection: ColorCollection;
  /** Both hold the same colors and fabrics. */
  inSync: boolean;
}

/** The My library palette each project palette is synced with (its `source`), and how they compare. */
export function paletteLinks(
  doc: RrqDoc,
  mine: readonly ColorCollection[],
): Map<string, PaletteLink> {
  const out = new Map<string, PaletteLink>();
  for (const pp of projectPalettes(doc)) {
    const src = pp.palette.source;
    const c = src && mine.find((x) => x.id === src.itemId);
    if (!c) continue;
    out.set(pp.palette.id, {
      collection: c,
      inSync: contentKey(pp.colors, pp.fabrics) === contentKey(c.colors, c.fabrics ?? []),
    });
  }
  return out;
}

/** One difference between a project palette and its My library palette. */
export interface PaletteChange {
  id: string;
  kind: 'color' | 'fabric';
  name: string;
  project?: Color | Fabric | undefined;
  library?: Color | Fabric | undefined;
}

/**
 * How to sync each difference: the side that changed since the last sync (`base`) wins on its own;
 * a color or fabric changed on both sides (or with no record of the last sync) is a conflict for
 * the user to settle.
 */
export function resolveSync(
  changes: PaletteChange[],
  base: string | undefined,
): { auto: Map<string, 'project' | 'library'>; conflicts: PaletteChange[] } {
  const was = parseKey(base);
  const auto = new Map<string, 'project' | 'library'>();
  const conflicts: PaletteChange[] = [];
  for (const c of changes) {
    if (!was) {
      conflicts.push(c);
      continue;
    }
    const b = was.get(c.id);
    const p = c.project && itemKey(c.project);
    const l = c.library && itemKey(c.library);
    if (p === b)
      auto.set(c.id, 'library'); // only My library changed it (or added/removed it)
    else if (l === b) auto.set(c.id, 'project');
    else conflicts.push(c);
  }
  return { auto, conflicts };
}

/** The colors and fabrics that differ (only on one side, or changed), project order first. */
export function paletteDiff(
  pp: { colors: Color[]; fabrics: Fabric[] },
  c: ColorCollection,
): PaletteChange[] {
  const out: PaletteChange[] = [];
  const add = <T extends Color | Fabric>(kind: 'color' | 'fabric', mine: T[], theirs: T[]) => {
    const same = (a: T, b: T) =>
      a.notecard.name === b.notecard.name &&
      ('rgb' in a && 'rgb' in b ? a.rgb.join() === b.rgb.join() : true);
    const lib = new Map(theirs.map((x) => [x.id, x]));
    const proj = new Map(mine.map((x) => [x.id, x]));
    for (const x of mine) {
      const y = lib.get(x.id);
      if (!y || !same(x, y))
        out.push({ id: x.id, kind, name: x.notecard.name, project: x, library: y });
    }
    for (const y of theirs)
      if (!proj.has(y.id)) out.push({ id: y.id, kind, name: y.notecard.name, library: y });
  };
  add('color', pp.colors, c.colors);
  add('fabric', pp.fabrics, c.fabrics ?? []);
  return out;
}

/** Link project palette `id` to My library palette `itemId`, or (no `itemId`) break its link. */
export function linkPalette(
  d: Draft<RrqDoc>,
  id: string,
  link?: { libraryId: string; itemId: string; base?: string },
) {
  const c = d.project.palette.collections?.find((x) => x.id === id);
  if (!c) return;
  if (link) c.source = link;
  else delete c.source;
}
