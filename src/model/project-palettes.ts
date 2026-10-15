// The project's own palettes (format v3): named groups of its own colors and fabrics, listed by id.
// Library colors and fabrics aren't in them (they come with library palettes).
import type { Draft } from 'immer';
import { isLibraryItem } from './library-items';
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
