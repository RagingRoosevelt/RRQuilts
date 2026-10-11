import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { builtinLibrary } from '@/content/starter';
import { copyBlock } from '@/editor/block-ops';
import { allPatches } from '@/model/blocks/patches';
import { contentVersion } from '@/model/identity';
import {
  embed,
  isLibraryItem,
  pruneLibraryItems,
  swapToLibraryVersion,
  useMyCopy,
  versionMismatches,
  type LibraryLookup,
} from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { RrqDoc } from '@/model/schema/project';

async function setup() {
  const lib = await builtinLibrary();
  const lookup: LibraryLookup = {
    block: (id) => lib.blocks.find((b) => b.id === id),
    color: (id) => lib.colors.find((c) => c.id === id),
  };
  const quilt = createQuilt(
    'Q',
    { style: 'horizontal', cols: 2, rows: 1, block: [10, 10], sash: [0, 0], sashBorder: false },
    [],
  );
  const doc0 = createProject();
  const doc: RrqDoc = { ...doc0, project: { ...doc0.project, quilts: [quilt] } };
  return { lib, lookup, doc };
}
const place = (doc: RrqDoc, blockId: string, fills: Record<string, { color: string }>) =>
  produce(doc, (d) => {
    const q = d.project.quilts[0]!;
    q.colorings.k = { fills };
    q.layers[0].slots['b:r1c1'] = { block: blockId, coloring: 'k', rotation: 0, flip: false };
  });

describe('library items in projects', () => {
  it('new projects contain no library items; using one embeds it and the colors it needs', async () => {
    const { doc, lookup } = await setup();
    expect(doc.project.blocks).toHaveLength(0);
    const d = embed(doc, lookup, { blocks: ['rrquilts.ohio-star'] });
    expect(d.project.blocks.map((b) => b.id)).toEqual(['rrquilts.ohio-star']);
    expect(isLibraryItem(d.project.blocks[0]!)).toBe(true);
    expect(d.project.palette.colors.map((c) => c.id).sort()).toEqual([
      'rrquilts.cream',
      'rrquilts.navy',
      'rrquilts.red',
    ]);
    expect(embed(d, lookup, { blocks: ['rrquilts.ohio-star'] })).toBe(d); // already there
  });

  it('prunes library items nothing uses, keeps used ones and my own work', async () => {
    const { doc, lookup } = await setup();
    let d = embed(doc, lookup, { blocks: ['rrquilts.ohio-star', 'rrquilts.nine-patch'] });
    d = place(d, 'rrquilts.ohio-star', {});
    d = produce(
      d,
      (x) =>
        void x.project.palette.colors.push({
          id: 'me.mine',
          notecard: { name: 'Mine' },
          rgb: [1, 2, 3],
        }),
    );
    d = pruneLibraryItems(d);
    expect(d.project.blocks.map((b) => b.id)).toEqual(['rrquilts.ohio-star']);
    expect(d.project.palette.colors.map((c) => c.id)).toContain('me.mine');
    expect(d.project.palette.colors.map((c) => c.id)).not.toContain('rrquilts.blue'); // nine patch's
  });

  it('reports same id at a different version, and can switch to the library version keeping quilt colors', async () => {
    const { doc, lookup, lib } = await setup();
    let d = embed(doc, lookup, { blocks: ['rrquilts.four-patch'] });
    const fp = d.project.blocks[0]!;
    // Pretend the project has an older version: same id, a slightly different size.
    const older = { ...fp, size: [10, 12] as [number, number] };
    older.version = await contentVersion(older);
    d = produce(d, (x) => void (x.project.blocks[0] = older));
    const fills = Object.fromEntries(
      allPatches(older).map((p) => [p.id, { color: 'rrquilts.gold' }]),
    );
    d = place(d, fp.id, fills);
    expect(versionMismatches(d, lookup).map((m) => m.project.id)).toEqual(['rrquilts.four-patch']);
    const swapped = swapToLibraryVersion(
      d,
      lib.blocks.find((b) => b.id === fp.id)!,
      lookup,
    );
    expect(swapped.project.blocks[0]!.version).toBe(fp.version);
    const q = swapped.project.quilts[0]!;
    expect(Object.values(q.colorings.k!.fills)).toHaveLength(4);
    expect(
      Object.values(q.colorings.k!.fills).every((f) => 'color' in f && f.color === 'rrquilts.gold'),
    ).toBe(true);
  });

  it('editing makes my copy, used in quilts instead of the library block', async () => {
    const { doc, lookup } = await setup();
    let d = embed(doc, lookup, { blocks: ['rrquilts.ohio-star'] });
    d = place(d, 'rrquilts.ohio-star', { p1: { color: 'rrquilts.red' } });
    const lib = d.project.blocks[0]!;
    const mine = copyBlock(lib, [], 'Jane Doe');
    d = useMyCopy(d, lib.id, mine, true);
    expect(d.project.blocks.map((b) => b.id)).toEqual([mine.id]);
    expect(mine.id).toMatch(/^jane-doe\./);
    expect(isLibraryItem(mine)).toBe(false);
    expect(d.project.quilts[0]!.layers[0].slots['b:r1c1']!.block).toBe(mine.id);
  });
});
