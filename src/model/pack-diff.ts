// What a library update changes in a pack (spec 014): colors and fabrics added, removed, or changed
// (same id, new name or images), so the user can see it before accepting.
import type { LibraryDoc } from './schema/library';
import type { Color, Fabric } from './schema/palette';

export interface PackDiff {
  added: { colors: Color[]; fabrics: Fabric[] };
  removed: { colors: Color[]; fabrics: Fabric[] };
  changed: { colors: Color[]; fabrics: Fabric[] };
}

const colorsOf = (d: LibraryDoc) =>
  d.items.flatMap((i) => (i.type === 'colors' ? i.data.colors : []));
const fabricsOf = (d: LibraryDoc) =>
  d.items.flatMap((i) => (i.type === 'colors' ? (i.data.fabrics ?? []) : []));

function compare<T extends { id: string }>(was: T[], now: T[], same: (a: T, b: T) => boolean) {
  const before = new Map(was.map((x) => [x.id, x]));
  const after = new Map(now.map((x) => [x.id, x]));
  return {
    added: now.filter((x) => !before.has(x.id)),
    removed: was.filter((x) => !after.has(x.id)),
    changed: now.filter((x) => before.has(x.id) && !same(before.get(x.id)!, x)),
  };
}

const sameColor = (a: Color, b: Color) =>
  a.notecard.name === b.notecard.name && a.rgb.join() === b.rgb.join();
const shas = (f: Fabric) => [f.image.sha256, ...(f.sizes ?? []).map((s) => s.sha256)].sort().join();
const sameFabric = (a: Fabric, b: Fabric) =>
  a.notecard.name === b.notecard.name && shas(a) === shas(b);

/** The difference between an installed pack (`was`, none: newly offered) and its newer version. */
export function packDiff(was: LibraryDoc | undefined, now: LibraryDoc): PackDiff {
  const c = compare(was ? colorsOf(was) : [], colorsOf(now), sameColor);
  const f = compare(was ? fabricsOf(was) : [], fabricsOf(now), sameFabric);
  return {
    added: { colors: c.added, fabrics: f.added },
    removed: { colors: c.removed, fabrics: f.removed },
    changed: { colors: c.changed, fabrics: f.changed },
  };
}

/** How many colors and fabrics a diff touches, for a summary line. */
export const diffCount = (d: PackDiff) => ({
  added: d.added.colors.length + d.added.fabrics.length,
  removed: d.removed.colors.length + d.removed.fabrics.length,
  changed: d.changed.colors.length + d.changed.fabrics.length,
});
