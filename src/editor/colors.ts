// Project color operations (framework-free, used inside project.change recipes).
import type { Draft } from 'immer';
import type { ColoringBody } from '@/model/schema/coloring';
import { resolveColoring } from '@/model/coloring';
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

const colorsOf = (cs: readonly ColoringBody[]) =>
  cs.flatMap((c) => Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : [])));

/** Colors the user painted: in the project's own blocks and in quilt colorings. */
export const colorsPainted = (doc: RrqDoc) => new Set(colorsOf(ownColorings(doc)));

/** What each placed slot shows: its quilt coloring over its block's (library blocks included). */
function shown(doc: RrqDoc | Draft<RrqDoc>, quilt: RrqDoc['project']['quilts'][number]) {
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  return Object.values(quilt.layers[0].slots).flatMap((s) => {
    const r = resolveColoring(quilt.colorings[s.coloring], blocks.get(s.block));
    return r ? [r] : [];
  });
}

/** Colors a quilt shows, its library blocks' designer colors included. */
export const quiltColors = (doc: RrqDoc, quilt: RrqDoc['project']['quilts'][number]) =>
  new Set(colorsOf(shown(doc, quilt)));

/** Colors the project depends on: painted ones, and those its quilts show. */
export const colorsUsed = (doc: RrqDoc) =>
  new Set([...colorsPainted(doc), ...doc.project.quilts.flatMap((q) => [...quiltColors(doc, q)])]);

/**
 * Recolor: every painted fill of an old color takes its new one; where a quilt shows an old color
 * from a block's own coloring (a library block's designer colors), the quilt recolors that patch,
 * leaving the block unchanged.
 */
export function replaceColors(d: Draft<RrqDoc>, map: ReadonlyMap<string, string>) {
  for (const c of ownColorings(d))
    for (const f of Object.values(c.fills)) {
      const to = 'color' in f ? map.get(f.color) : undefined;
      if (to && 'color' in f) f.color = to;
    }
  const blocks = new Map(d.project.blocks.map((b) => [b.id, b]));
  for (const q of d.project.quilts)
    for (const s of Object.values(q.layers[0].slots)) {
      const c = q.colorings[s.coloring];
      const base = c?.base && blocks.get(s.block)?.colorings.find((x) => x.id === c.base);
      if (!c || !base) continue;
      for (const [patch, f] of Object.entries(base.fills)) {
        const to = 'color' in f ? map.get(f.color) : undefined;
        if (to && !c.fills[patch] && !c.cleared?.includes(patch)) c.fills[patch] = { color: to };
      }
    }
}
