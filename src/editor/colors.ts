// Project color operations (framework-free, used inside project.change recipes).
import type { Draft } from 'immer';
import type { ColoringBody } from '@/model/schema/coloring';
import { isLibraryItem } from '@/model/library-items';
import type { RrqDoc } from '@/model/schema/project';

function allColorings(d: RrqDoc | Draft<RrqDoc>): ColoringBody[] {
  return [
    ...d.project.blocks.flatMap((b) => b.colorings),
    ...d.project.quilts.flatMap((q) => Object.values(q.colorings)),
  ] as ColoringBody[];
}

export const colorInUse = (doc: RrqDoc, id: string) =>
  allColorings(doc).some((c) => Object.values(c.fills).some((f) => 'color' in f && f.color === id));

/** Remove a color; patches using it become unfilled. */
export function deleteColor(d: Draft<RrqDoc>, id: string) {
  d.project.palette.colors = d.project.palette.colors.filter((c) => c.id !== id);
  for (const c of allColorings(d)) {
    for (const [patch, f] of Object.entries(c.fills))
      if ('color' in f && f.color === id) delete c.fills[patch];
  }
}

/** Colorings the project owns: its own blocks' and its quilts' (library blocks bring their colors). */
function ownColorings(d: RrqDoc | Draft<RrqDoc>): ColoringBody[] {
  return [
    ...d.project.blocks.filter((b) => !isLibraryItem(b)).flatMap((b) => b.colorings),
    ...d.project.quilts.flatMap((q) => Object.values(q.colorings)),
  ] as ColoringBody[];
}

/** Colors the project's own colorings use. */
export const colorsUsed = (doc: RrqDoc) =>
  new Set(
    ownColorings(doc).flatMap((c) =>
      Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : [])),
    ),
  );

/** Recolor the project's own colorings: every fill of an old color takes its new one. */
export function replaceColors(d: Draft<RrqDoc>, map: ReadonlyMap<string, string>) {
  for (const c of ownColorings(d))
    for (const f of Object.values(c.fills)) {
      const to = 'color' in f ? map.get(f.color) : undefined;
      if (to && 'color' in f) f.color = to;
    }
}

/** Colors a quilt shows: its own colorings' and those of the blocks placed in it. */
export function quiltColors(doc: RrqDoc, quilt: RrqDoc['project']['quilts'][number]) {
  const placed = new Set(Object.values(quilt.layers[0].slots).map((c) => c.block));
  return new Set(
    [
      ...Object.values(quilt.colorings),
      ...doc.project.blocks.filter((b) => placed.has(b.id)).flatMap((b) => b.colorings),
    ].flatMap((c) => Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : []))),
  );
}
