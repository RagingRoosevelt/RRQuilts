// The layout gallery's project: one quilt per variation (variations.ts), filled as a quilter would,
// with the key settings in words. Dev server only (Tests tab).
import { produce } from 'immer';
import { convertLayout, generateSlots, type LayoutStyle } from '@/model/layout/slots';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { RrqDoc } from '@/model/schema/project';
import type { Border, Layout } from '@/model/schema/quilt';
import { fillQuilt, starterKit } from './fill-quilt';
import { VARIATIONS, type Variation } from './variations';

const START: Layout = {
  style: 'straight-set',
  cols: 3,
  rows: 3,
  block: [10, 10],
  sash: [0, 0],
  sashBorder: false,
};
const PLAIN_BORDER: Border[] = [{ style: 'long-horizontal', sides: [3, 3, 3, 3] }];
const FILLS = {
  blocks: 'a different block in each block space',
  one: 'the same block in every block space',
  mix: 'blocks and solids alternating',
  solids: 'solids only',
};

const show = (v: unknown): string =>
  Array.isArray(v)
    ? v.every((x) => typeof x !== 'object')
      ? v.join(' × ')
      : v.map(show).join(', ')
    : typeof v === 'object' && v
      ? 'style' in v && 'width' in v
        ? `${String(v.style)} ${String(v.width)} in`
        : Object.entries(v)
            .map(([k, x]) => `${k} ${show(x)}`)
            .join(', ')
      : String(v);

/** Everything the variation sets, in words (printed from the same settings that build it). */
const settings = (v: Variation, blockSpaces: number) => [
  `layout: ${v.style}`,
  ...Object.entries(v.layout ?? {}).map(([k, x]) => `${k}: ${show(x)}`),
  `borders: ${(v.borders ?? PLAIN_BORDER).map((b) => `${b.style} ${b.sides[0]} in`).join(', ') || 'none'}`,
  `fill: ${blockSpaces ? FILLS[v.fill ?? 'blocks'] : 'solids (no block spaces)'}`,
];

export interface GalleryEntry extends Variation {
  quiltId?: string;
  settings: string[];
  error?: string;
}

export async function buildGallery(): Promise<{ doc: RrqDoc; entries: GalleryEntry[] }> {
  const kit = await starterKit();
  let doc = createProject('Layout Gallery', 'in', 'gallery');
  const entries: GalleryEntry[] = [];
  for (const v of VARIATIONS) {
    let error: string | undefined;
    let quiltId: string | undefined;
    let blockSpaces = 0;
    try {
      const layout: Layout = {
        ...convertLayout(START, v.style as LayoutStyle, 'in'),
        ...v.layout,
      };
      const quilt = createQuilt(
        `${v.id} ${v.title}`,
        layout,
        (v.borders ?? PLAIN_BORDER) as Border[],
      );
      // Throws on settings the layout can't draw.
      blockSpaces = generateSlots(quilt.layout, quilt.borders).slots.filter(
        (s) => s.kind === 'block',
      ).length;
      doc = produce(doc, (d) => void d.project.quilts.push(quilt));
      doc = fillQuilt(doc, quilt.id, kit, v.fill);
      quiltId = quilt.id;
    } catch (e) {
      error = (e as Error).message;
    }
    entries.push({
      ...v,
      settings: settings(v, blockSpaces),
      ...(quiltId ? { quiltId } : {}),
      ...(error ? { error } : {}),
    });
  }
  return { doc, entries };
}
