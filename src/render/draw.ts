// Draw a quilt on a 2-D canvas. View maps quilt units → CSS pixels; `dpr` scales to device pixels.
import type { Generated, Slot } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import { resolveColoring } from '@/model/coloring';
import type { ColoringBody, Fill } from '@/model/schema/coloring';
import type { Color, Fabric } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { mul, type M } from './affine';
import { blockPaths, toPath2D } from './paths';
import { placementMatrix } from './placement';
import { fabricFill } from './fabric-images';

export interface View {
  scale: number;
  tx: number;
  ty: number;
}

export interface DrawOptions {
  dpr: number;
  view: View;
  outlines: boolean;
  /** Show each placed block's name over it. */
  labels?: boolean;
  hover?: string | null;
  selected?: Set<string>;
  /** Visual theme: patch outline and empty-space colors. */
  dark: boolean;
}

const slotPaths = new WeakMap<Slot, Path2D>();
const slotPath = (s: Slot) => {
  let p = slotPaths.get(s);
  if (!p) slotPaths.set(s, (p = toPath2D(s.outline, [1, 1])));
  return p;
};

let hatchCache: { dark: boolean; pattern: CanvasPattern | null } | undefined;
function hatch(ctx: CanvasRenderingContext2D, dark: boolean) {
  if (hatchCache?.dark !== dark) {
    const c = document.createElement('canvas');
    c.width = c.height = 8;
    const g = c.getContext('2d')!;
    g.fillStyle = dark ? '#3a3a3a' : '#f2f2f2';
    g.fillRect(0, 0, 8, 8);
    g.strokeStyle = dark ? '#555' : '#c8c8c8';
    g.beginPath();
    g.moveTo(0, 8);
    g.lineTo(8, 0);
    g.stroke();
    hatchCache = { dark, pattern: ctx.createPattern(c, 'repeat') };
  }
  return hatchCache.pattern ?? '#ddd';
}

/**
 * Fill → fill style. `extra`: library colors/fabrics not (yet) in the project, e.g. for library
 * blocks. With `canvas`, fabrics draw as true-scale image patterns (spec 014); without, as their
 * average color.
 */
export function colorLookup(
  doc: RrqDoc,
  extra: readonly Color[] = [],
  canvas?: { ctx: CanvasRenderingContext2D; devicePerUnit: number },
  extraFabrics: readonly Fabric[] = [],
) {
  const colors = new Map(
    [...extra, ...doc.project.palette.colors].map((c) => [c.id, `rgb(${c.rgb.join(',')})`]),
  );
  const fabrics = new Map([...extraFabrics, ...doc.project.palette.fabrics].map((f) => [f.id, f]));
  return (f: Fill | undefined): string | CanvasPattern | undefined => {
    if (!f) return undefined;
    if ('color' in f) return colors.get(f.color);
    const fab = fabrics.get(f.fabric);
    if (!fab) return undefined;
    return canvas
      ? fabricFill(canvas.ctx, fab, f, canvas.devicePerUnit)
      : `rgb(${fab.average.join(',')})`;
  };
}

/** Draw one block's patches with a coloring, in the current transform (block design units). */
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  coloring: ColoringBody | undefined,
  fillOf: ReturnType<typeof colorLookup>,
  opts: { outlines: boolean; lineWidth: number; dark: boolean },
) {
  for (const p of blockPaths(block)) {
    ctx.fillStyle = fillOf(coloring?.fills[p.id]) ?? hatch(ctx, opts.dark);
    ctx.fill(p.path);
  }
  if (opts.outlines) {
    ctx.lineWidth = opts.lineWidth;
    ctx.strokeStyle = opts.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    for (const p of blockPaths(block)) ctx.stroke(p.path);
  }
}

export function drawQuilt(
  ctx: CanvasRenderingContext2D,
  doc: RrqDoc,
  quilt: Quilt,
  generated: Generated,
  o: DrawOptions,
) {
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const fillOf = colorLookup(doc, [], { ctx, devicePerUnit: o.dpr * o.view.scale });
  const base: M = [
    o.dpr * o.view.scale,
    0,
    0,
    o.dpr * o.view.scale,
    o.dpr * o.view.tx,
    o.dpr * o.view.ty,
  ];
  const px = 1 / (o.dpr * o.view.scale); // one device pixel in quilt units

  for (const slot of generated.slots) {
    ctx.setTransform(...base);
    const content = quilt.layers[0].slots[slot.id];
    const block: Block | undefined = content && blocks.get(content.block);
    const outline = slotPath(slot);
    if (!content || !block) {
      ctx.fillStyle = o.dark ? '#2b2b2b' : '#fbfbfb';
      ctx.fill(outline);
      ctx.lineWidth = px;
      ctx.strokeStyle = o.dark ? '#555' : '#c9c9c9';
      ctx.stroke(outline);
      continue;
    }
    ctx.save();
    ctx.clip(outline);
    const m = placementMatrix(slot, content, block);
    ctx.setTransform(...mul(base, m));
    const unitsPerPx = px / Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
    drawBlock(ctx, block, resolveColoring(quilt.colorings[content.coloring], block), fillOf, {
      outlines: o.outlines,
      lineWidth: unitsPerPx,
      dark: o.dark,
    });
    ctx.restore();
  }

  ctx.setTransform(...base);
  for (const slot of generated.slots) {
    const hi = slot.id === o.hover ? 2 : o.selected?.has(slot.id) ? 3 : 0;
    if (!hi) continue;
    ctx.lineWidth = hi * px;
    ctx.strokeStyle = hi === 3 ? '#1976d2' : 'rgba(25,118,210,0.7)';
    ctx.stroke(slotPath(slot));
  }
  if (o.labels) drawLabels(ctx, quilt, generated, blocks, base, o.dpr);
}

/** Block names centered on their placements (screen-space text, skipped where too small). */
function drawLabels(
  ctx: CanvasRenderingContext2D,
  quilt: Quilt,
  generated: Generated,
  blocks: Map<string, Block>,
  base: M,
  dpr: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const slot of generated.slots) {
    const content = quilt.layers[0].slots[slot.id];
    const block = content && blocks.get(content.block);
    if (!block || block.notecard.tags?.includes('system')) continue;
    const [a, b, c, d, e, f] = mul(base, slot.transform);
    const width = Math.min(Math.hypot(a, b), Math.hypot(c, d)); // device px
    if (width < 48 * dpr) continue;
    const size = Math.min(13 * dpr, width / 6);
    ctx.font = `${size}px sans-serif`;
    let text = block.notecard.name;
    const max = width * 0.9 - size;
    while (text.length > 1 && ctx.measureText(text).width > max) text = text.slice(0, -2) + '…';
    const x = a / 2 + c / 2 + e;
    const y = b / 2 + d / 2 + f;
    const w = ctx.measureText(text).width + size;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y);
  }
}

/** Scale/offset that fits `bounds` (quilt units) inside a w×h CSS-pixel area with a margin. */
export function fitView(
  bounds: [number, number, number, number],
  w: number,
  h: number,
  margin = 24,
): View {
  const [x0, y0, x1, y1] = bounds;
  const s = Math.max(0.01, Math.min((w - 2 * margin) / (x1 - x0), (h - 2 * margin) / (y1 - y0)));
  return { scale: s, tx: (w - (x1 - x0) * s) / 2 - x0 * s, ty: (h - (y1 - y0) * s) / 2 - y0 * s };
}
