// Project color operations (framework-free, used inside project.change recipes).
import type { Draft } from 'immer';
import type { ColoringBody } from '@/model/schema/coloring';
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
