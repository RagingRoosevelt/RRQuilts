// What's under a point: the slot and, if a block is placed there, the patch.
import { allPatches } from '@/model/blocks/patches';
import { pathPolygon, pointInPolygon, type Pt } from '@/model/geometry/path';
import type { Generated, Slot } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { Quilt } from '@/model/schema/quilt';
import { apply, invert } from './affine';
import { placementMatrix } from './placement';

const polys = new WeakMap<Block, { id: string; poly: Pt[] }[]>();

/** Patch outlines in normalized block coordinates, cached per block object. */
export function blockPolygons(block: Block) {
  let p = polys.get(block);
  if (!p) {
    p = allPatches(block).map((x) => ({ id: x.id, poly: pathPolygon(x.path, block.size) }));
    polys.set(block, p);
  }
  return p;
}

const slotPolys = new WeakMap<Slot, Pt[]>();
/** Flattened outline (arcs included), cached per slot. */
const slotPoly = (s: Slot): Pt[] => {
  let p = slotPolys.get(s);
  if (!p) slotPolys.set(s, (p = pathPolygon(s.outline, [1, 1])));
  return p;
};

export interface Hit {
  slotId: string;
  patchId?: string;
}

/** `pt` in quilt units. */
export function hitTest(
  blocks: Map<string, Block>,
  quilt: Quilt,
  generated: Generated,
  pt: Pt,
): Hit | null {
  for (const slot of generated.slots) {
    if (!pointInPolygon(pt, slotPoly(slot))) continue;
    const content = quilt.layers[0].slots[slot.id];
    const block = content && blocks.get(content.block);
    if (!content || !block) return { slotId: slot.id };
    const design = apply(invert(placementMatrix(slot, content, block)), pt);
    const n: Pt = [design[0] / block.size[0], design[1] / block.size[1]];
    let patchId: string | undefined;
    for (const p of blockPolygons(block)) if (pointInPolygon(n, p.poly)) patchId = p.id; // topmost wins
    return { slotId: slot.id, ...(patchId ? { patchId } : {}) };
  }
  return null;
}
