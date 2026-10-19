// Builds the layout gallery (test/gallery/variations.ts) into $GALLERY/gallery.rrq, one quilt per
// variation, plus gallery.json describing them for scripts/gallery-page.py. Run by `make gallery`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { produce } from 'immer';
import { it } from 'vitest';
import { serializeProject } from '@/model/io';
import { convertLayout, generateSlots, type LayoutStyle } from '@/model/layout/slots';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { Border, Layout } from '@/model/schema/quilt';
import { VARIATIONS, type Variation } from '../../../gallery/variations';
import { fillQuilt, starterKit } from '../formats/fill-quilt';

const dir = process.env.GALLERY;

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

/** The page's key settings: everything the variation sets, in words. */
const settings = (v: Variation, blockSpaces: number) => [
  `layout: ${v.style}`,
  ...Object.entries(v.layout ?? {}).map(([k, x]) => `${k}: ${show(x)}`),
  `borders: ${(v.borders ?? PLAIN_BORDER).map((b) => `${b.style} ${b.sides[0]} in`).join(', ') || 'none'}`,
  `fill: ${blockSpaces ? FILLS[v.fill ?? 'blocks'] : 'solids (no block spaces)'}`,
];

it.skipIf(!dir)(
  'build the layout gallery',
  async () => {
    const kit = await starterKit();
    let doc = createProject('Layout Gallery', 'in', 'gallery');
    const out = [];
    for (const v of VARIATIONS) {
      const name = `${v.id} ${v.title}`;
      let error: string | undefined;
      let blockSpaces = 0;
      try {
        const layout: Layout = {
          ...convertLayout(START, v.style as LayoutStyle, 'in'),
          ...v.layout,
        };
        const quilt = createQuilt(name, layout, (v.borders ?? PLAIN_BORDER) as Border[]);
        // Throws on settings the layout can't draw.
        blockSpaces = generateSlots(quilt.layout, quilt.borders).slots.filter(
          (s) => s.kind === 'block',
        ).length;
        doc = produce(doc, (d) => void d.project.quilts.push(quilt));
        doc = fillQuilt(doc, quilt.id, kit, v.fill);
      } catch (e) {
        error = (e as Error).message;
      }
      out.push({ ...v, name, settings: settings(v, blockSpaces), error });
    }
    mkdirSync(dir!, { recursive: true });
    writeFileSync(`${dir}/gallery.rrq`, serializeProject(doc));
    writeFileSync(`${dir}/gallery.json`, JSON.stringify(out, null, 1));
  },
  300_000,
);
