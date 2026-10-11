// Small images of quilts and blocks for sketchbook cards, cached per (immutable) object.
import { generateSlots } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup, drawBlock, drawQuilt, fitView } from './draw';

const cache = new WeakMap<object, Map<string, { dep: unknown; url: string }>>();

/** Cached per (immutable) `key` + `extra`; re-rendered when `dep` (e.g. the blocks array) changes. */
function cached(key: object, extra: string, render: () => string, dep?: unknown) {
  let m = cache.get(key);
  if (!m) cache.set(key, (m = new Map()));
  let v = m.get(extra);
  if (!v || v.dep !== dep) m.set(extra, (v = { dep, url: render() }));
  return v.url;
}

function canvas(px: number) {
  const c = document.createElement('canvas');
  c.width = c.height = px;
  return [c, c.getContext('2d')!] as const;
}

export function quiltThumbnail(doc: RrqDoc, quilt: Quilt, px = 240, dark = false) {
  return cached(
    quilt,
    `${px}:${dark}:${doc.project.palette.colors.length}`,
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
    doc.project, // blocks or colors changed → redraw
  );
}

export function blockThumbnail(
  doc: RrqDoc,
  block: Block,
  px = 160,
  dark = false,
  coloringId?: string,
  libraryColors: readonly Color[] = [],
) {
  const coloring = block.colorings.find((c) => c.id === coloringId) ?? block.colorings[0];
  return cached(
    block,
    `${px}:${dark}:${coloring?.id ?? ''}:${doc.project.palette.colors.length}`,
    () => {
      const [c, ctx] = canvas(px);
      const s = (px - 8) / Math.max(...block.size);
      ctx.setTransform(s, 0, 0, s, 4, 4);
      drawBlock(ctx, block, coloring, colorLookup(doc, libraryColors), {
        outlines: true,
        lineWidth: 1 / s,
        dark,
      });
      return c.toDataURL();
    },
  );
}
