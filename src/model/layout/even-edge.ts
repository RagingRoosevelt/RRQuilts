// Even edge length (owner, 2026-11-16): the blocks a quilt places, each patch's straight edges at
// their finished length where the block sits, the nice lengths near one, and the layout with its
// block size scaled to reach it. Block quilts only: an EPP quilt's 1U already does this.
import { placementMatrix } from '@/render/placement';
import { allPatches } from '../blocks/patches';
import { cross, dist, dot, flattenLoop, len, pathToSegs, sub, type Pt } from '../geometry/path';
import { PLAIN_BLOCK } from '../plain';
import type { RrqDoc, Units } from '../schema/project';
import type { Layout, Quilt } from '../schema/quilt';
import { generateFor } from './slots';

export interface EdgePatch {
  /** Outline to draw, in the item's own coordinates (y down). */
  poly: Pt[];
  /** Straight edges, a run along one line counted once, with their finished length. */
  edges: { a: Pt; b: Pt; len: number }[];
}
export interface EdgeItem {
  key: string;
  label: string;
  patches: EdgePatch[];
}

/** Line pieces in loop order (null: a curve) → straight edges, a run along one line joined. */
function runs(segs: ({ a: Pt; b: Pt } | null)[]): [Pt, Pt][] {
  const along = (r: [Pt, Pt], s: { a: Pt; b: Pt }) => {
    const [u, v] = [sub(r[1], r[0]), sub(s.b, s.a)];
    return Math.abs(cross(u, v)) <= 1e-6 * len(u) * len(v) && dot(u, v) > 0;
  };
  const out: ([Pt, Pt] | null)[] = [];
  for (const s of segs) {
    const last = out[out.length - 1];
    if (s && last && along(last, s)) last[1] = s.b;
    else out.push(s ? [s.a, s.b] : null);
  }
  // The loop may start partway along an edge.
  const [first, last] = [out[0], out[out.length - 1]];
  if (out.length > 1 && first && last && along(last, { a: first[0], b: first[1] })) {
    first[0] = last[0];
    out.pop();
  }
  return out.filter((r): r is [Pt, Pt] => !!r && dist(r[0], r[1]) > 1e-9);
}

/** Each block a block quilt places in its block spaces, once per size (rosettes included). */
export function blockEdgeItems(doc: RrqDoc, quilt: Quilt): EdgeItem[] {
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const out = new Map<string, EdgeItem & { size: number[] }>();
  /** Each block's patches in its own design space, drawn once. */
  const drawn = new Map<string, { poly: Pt[]; lines: [Pt, Pt][] }[]>();
  for (const slot of generateFor(quilt).slots) {
    if (slot.kind !== 'block') continue;
    const content = quilt.layers[0].slots[slot.id];
    const block = content && blocks.get(content.block);
    if (!content || !block || block.id === PLAIN_BLOCK) continue;
    let geo = drawn.get(block.id);
    if (!geo) {
      geo = allPatches(block).map((p) => {
        const segs = pathToSegs(p.path, block.size);
        return {
          poly: flattenLoop(segs, 1e-3 * Math.max(...block.size)),
          lines: runs(segs.map((s) => (s.kind === 'line' ? s : null))),
        };
      });
      drawn.set(block.id, geo);
    }
    const [a, b, c, d] = placementMatrix(slot, content, block);
    const real = ([x, y]: Pt) => Math.hypot(a * x + c * y, b * x + d * y);
    const patches = geo.map(({ poly, lines }) => ({
      poly,
      edges: lines.map(([p0, p1]) => ({ a: p0, b: p1, len: real(sub(p1, p0)) })),
    }));
    // One size: the same edge lengths, however the space turns the block (Baby Blocks' diamonds).
    const lens = patches.flatMap((p) => p.edges.map((e) => e.len.toFixed(4)));
    const key = `${block.id}:${lens.sort().join(',')}`;
    if (out.has(key)) continue;
    const [w, h] = block.size;
    const size = [real([w, 0]), real([0, h])];
    out.set(key, { key, label: block.notecard.name, size, patches });
  }
  // A block in two sizes (strips of different counts) says which.
  const items = [...out.values()];
  const twice = (l: string) => items.filter((i) => i.label === l).length > 1;
  const short = (v: number) => `${+v.toFixed(2)}${doc.units === 'cm' ? ' cm' : '″'}`;
  return items.map(({ size: [w, h], ...it }) => ({
    ...it,
    label: twice(it.label)
      ? `${it.label} (${Math.abs(w! - h!) < 1e-9 ? short(w!) : `${short(w!)} × ${short(h!)}`})`
      : it.label,
  }));
}

/** Every 1/8 in (1 mm) from the whole inch (cm) below `x` to the one above, smallest first; a whole
 *  `x` gets the inch on each side (owner, 2026-11-16). */
export function niceLengths(x: number, units: Units): number[] {
  const step = units === 'cm' ? 0.1 : 1 / 8;
  const lo = Math.max(0, Math.ceil(x - 1e-9) - 1);
  const hi = Math.floor(x + 1e-9) + 1;
  const out: number[] = [];
  for (let n = Math.round(lo / step); n * step <= hi + 1e-9; n++)
    if (n > 0) out.push(Number((n * step).toFixed(6)));
  return out;
}

/** The Layout tab's block size fields: what Even edge length changes. */
export function blockSize(layout: Layout): number[] {
  switch (layout.style) {
    case 'straight-set':
      return layout.block[0] === layout.block[1] ? [layout.block[0]] : [...layout.block];
    case 'on-point':
      return [layout.block];
    case 'variable-point':
    case 'diamond-point':
      // A 60° diamond's width is its side (the Leg field).
      return layout.style === 'diamond-point' ? [layout.width] : [layout.width, layout.height];
    case 'shaped-blocks':
      return [layout.width];
    case 'baby-blocks':
    case 'variable-blocks':
      return [layout.side];
    case 'horizontal-strip':
    case 'vertical-strip':
      return [layout.length];
    default:
      return [];
  }
}

/** A block quilt's layout with its blocks `k` times the size (sashing, strips without blocks
 *  and borders stay). Strip blocks are the length ÷ the count along, so the length scales. */
export function scaleBlockSize(layout: Layout, k: number): Layout {
  switch (layout.style) {
    case 'straight-set':
      return { ...layout, block: [layout.block[0] * k, layout.block[1] * k] };
    case 'on-point':
      return { ...layout, block: layout.block * k };
    case 'variable-point':
    case 'diamond-point':
      return { ...layout, width: layout.width * k, height: layout.height * k };
    case 'shaped-blocks':
      return { ...layout, width: layout.width * k };
    case 'baby-blocks':
    case 'variable-blocks':
      return { ...layout, width: layout.width * k, top: layout.top * k, side: layout.side * k };
    case 'horizontal-strip':
    case 'vertical-strip':
      return { ...layout, length: layout.length * k };
    default:
      return layout;
  }
}
