// Block patches as cached Path2D objects in block design units (true circular arcs).
import { allPatches } from '@/model/blocks/patches';
import { arcGeom, type Pt } from '@/model/geometry/path';
import type { Block } from '@/model/schema/block';
import type { PathCommand } from '@/model/schema/shared';

export function toPath2D(path: readonly PathCommand[], size: readonly [number, number]): Path2D {
  const [w, h] = size;
  const p = new Path2D();
  let cur: Pt = [0, 0];
  for (const c of path) {
    if (c[0] === 'M' || c[0] === 'L') {
      cur = [c[1] * w, c[2] * h];
      if (c[0] === 'M') p.moveTo(...cur);
      else p.lineTo(...cur);
    } else if (c[0] === 'A') {
      const end: Pt = [c[1] * w, c[2] * h];
      const g = arcGeom(cur, end, c[3]);
      // Positive g.sweep runs clockwise on screen, which is canvas's default direction.
      p.arc(g.center[0], g.center[1], g.r, g.start, g.start + g.sweep, g.sweep < 0);
      cur = end;
    } else if (c[0] === 'C') {
      cur = [c[5] * w, c[6] * h];
      p.bezierCurveTo(c[1] * w, c[2] * h, c[3] * w, c[4] * h, ...cur);
    } else p.closePath();
  }
  return p;
}

const cache = new WeakMap<Block, { id: string; path: Path2D }[]>();

/** Patches bottom-first, cached per (immutable) block object. */
export function blockPaths(block: Block) {
  let v = cache.get(block);
  if (!v) {
    v = allPatches(block).map((p) => ({ id: p.id, path: toPath2D(p.path, block.size) }));
    cache.set(block, v);
  }
  return v;
}
