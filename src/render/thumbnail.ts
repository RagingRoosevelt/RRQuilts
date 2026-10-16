// Small images of quilts and blocks for sketchbook cards, cached per (immutable) object.
import { generateFor } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { boundsWithTarget, colorLookup, drawBlock, drawQuilt, fitView } from './draw';
import { display, imagesTick } from './fabric-images';

/** Thumbnails redraw when fabrics change or their images finish loading. */
const fabricsKey = (doc: RrqDoc) =>
  `${doc.project.palette.fabrics.length}:${imagesTick.value}:${display.mode}:${display.size}`;

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

/** A quilt's picture; `withTarget` adds its reference overlay when that's switched on. */
export function quiltThumbnail(
  doc: RrqDoc,
  quilt: Quilt,
  px = 240,
  dark = false,
  withTarget = false,
) {
  return cached(
    quilt,
    `${px}:${dark}:${withTarget}:${doc.project.palette.colors.length}:${fabricsKey(doc)}`,
    () => {
      const [c, ctx] = canvas(px);
      const g = generateFor(quilt);
      const bounds = withTarget ? boundsWithTarget(quilt, g.bounds) : g.bounds;
      drawQuilt(ctx, doc, quilt, g, {
        dpr: 1,
        view: fitView(bounds, px, px, 6),
        outlines: false,
        dark,
        target: withTarget,
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
    `${px}:${dark}:${coloring?.id ?? ''}:${doc.project.palette.colors.length}:${fabricsKey(doc)}`,
    () => {
      const [c, ctx] = canvas(px);
      const s = (px - 8) / Math.max(...block.size);
      ctx.setTransform(s, 0, 0, s, 4, 4);
      drawBlock(ctx, block, coloring, colorLookup(doc, libraryColors, { ctx, devicePerUnit: s }), {
        outlines: true,
        lineWidth: 1 / s,
        dark,
      });
      return c.toDataURL();
    },
  );
}
