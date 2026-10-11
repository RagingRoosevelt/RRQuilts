// Small images of quilts and blocks for sketchbook cards, cached per (immutable) object.
import { generateSlots } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup, drawBlock, drawQuilt, fitView } from './draw';

const cache = new WeakMap<object, Map<string, string>>();

function cached(key: object, extra: string, render: () => string) {
  let m = cache.get(key);
  if (!m) cache.set(key, (m = new Map()));
  let v = m.get(extra);
  if (!v) m.set(extra, (v = render()));
  return v;
}

function canvas(px: number) {
  const c = document.createElement('canvas');
  c.width = c.height = px;
  return [c, c.getContext('2d')!] as const;
}

export function quiltThumbnail(doc: RrqDoc, quilt: Quilt, px = 240, dark = false) {
  // Keyed by the quilt and palette/blocks arrays: any edit to them yields new objects.
  return cached(
    quilt,
    `${px}:${dark}:${doc.project.blocks.length}:${doc.project.palette.colors.length}`,
    () => {
      const [c, ctx] = canvas(px);
      const g = generateSlots(quilt.layout, quilt.borders);
      drawQuilt(ctx, doc, quilt, g, {
        dpr: 1,
        view: fitView(g.bounds, px, px, 6),
        outlines: false,
        dark,
      });
      return c.toDataURL();
    },
  );
}

export function blockThumbnail(doc: RrqDoc, block: Block, px = 160, dark = false) {
  return cached(block, `${px}:${dark}:${doc.project.palette.colors.length}`, () => {
    const [c, ctx] = canvas(px);
    const s = (px - 8) / Math.max(...block.size);
    ctx.setTransform(s, 0, 0, s, 4, 4);
    drawBlock(ctx, block, block.colorings[0], colorLookup(doc), {
      outlines: true,
      lineWidth: 1 / s,
      dark,
    });
    return c.toDataURL();
  });
}
