import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { builtinLibrary } from '@/content/starter';
import { copyBlock } from '@/editor/block-ops';
import { allPatches } from '@/model/blocks/patches';
import { contentVersion } from '@/model/identity';
import {
  isLibraryItem,
  splitItems,
  syncLibraryItems,
  keepAsMine,
  projectColorings,
  coloringSections,
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
    { style: 'straight-set', cols: 2, rows: 1, block: [10, 10], sash: [0, 0], sashBorder: false },
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
  it("color variants keep their library block's name", async () => {
    const { doc, lookup } = await setup();
    const star = lookup.block('rrquilts.ohio-star')!;
    const v = produce(copyBlock(star, [star.notecard.name]), (b) => {
      b.colorVariant = true;
    });
    expect(v.notecard.name).toBe('Ohio Star (2)');
    const d = syncLibraryItems(
      produce(doc, (x) => void x.project.blocks.push(v)),
      lookup,
    );
    expect(d.project.blocks[0]!.notecard.name).toBe('Ohio Star');
  });
  it('new projects contain no library items; using one embeds it and the colors it needs', async () => {
    const { doc, lookup } = await setup();
    expect(doc.project.blocks).toHaveLength(0);
    const d = syncLibraryItems(
      place(doc, 'rrquilts.ohio-star', { p1: { color: 'rrquilts.gold' } }),
      lookup,
    );
    expect(d.project.blocks.map((b) => b.id)).toEqual(['rrquilts.ohio-star']);
    expect(isLibraryItem(d.project.blocks[0]!)).toBe(true);
    // The quilt's gold, plus every color of the block's colorings (default + one per palette).
    const used = lookup
      .block('rrquilts.ohio-star')!
      .colorings.flatMap((k) =>
        Object.values(k.fills).flatMap((f) => ('color' in f ? [f.color] : [])),
      );
    expect(d.project.palette.colors.map((c) => c.id).sort()).toEqual(
      [...new Set(['rrquilts.gold', ...used])].sort(),
    );
    expect(syncLibraryItems(d, lookup)).toBe(d); // nothing to do
  });

  it('prunes library items nothing uses, keeps used ones and my own work', async () => {
    const { doc, lookup } = await setup();
    let d = place(doc, 'rrquilts.nine-patch', {});
    d = syncLibraryItems(d, lookup);
    expect(d.project.blocks.map((b) => b.id)).toEqual(['rrquilts.nine-patch']);
    d = place(d, 'rrquilts.ohio-star', {}); // replaces the only placement
    d = produce(
      d,
      (x) =>
        void x.project.palette.colors.push({
          id: 'me.mine',
          notecard: { name: 'Mine' },
          rgb: [1, 2, 3],
        }),
    );
    d = syncLibraryItems(d, lookup);
    expect(d.project.blocks.map((b) => b.id)).toEqual(['rrquilts.ohio-star']);
    expect(d.project.palette.colors.map((c) => c.id)).toContain('me.mine');
    expect(d.project.palette.colors.map((c) => c.id)).not.toContain('rrquilts.blue'); // nine patch's
  });

  it('reports same id at a different version, and can switch to the library version keeping quilt colors', async () => {
    const { doc, lookup, lib } = await setup();
    let d = syncLibraryItems(place(doc, 'rrquilts.four-patch', {}), lookup);
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
    // The project's copy can be kept as my own block first.
    const kept = swapToLibraryVersion(
      keepAsMine(d, 'block', fp.id, 'jane.old1'),
      lib.blocks.find((b) => b.id === fp.id)!,
      lookup,
    );
    const mine = kept.project.blocks.find((b) => b.id === 'jane.old1')!;
    expect(mine.size).toEqual([10, 12]);
    expect(mine.notecard.name).toBe('Four Patch (rev 1)');
    expect(mine.source?.derived).toBe(true);
  });

  it('editing makes my copy, used in quilts instead of the library block', async () => {
    const { doc, lookup } = await setup();
    let d = place(doc, 'rrquilts.ohio-star', { p1: { color: 'rrquilts.red' } });
    d = syncLibraryItems(d, lookup);
    const lib = d.project.blocks[0]!;
    const mine = copyBlock(lib, [], 'Jane Doe');
    d = useMyCopy(d, lib.id, mine, true);
    expect(d.project.blocks.map((b) => b.id)).toEqual([mine.id]);
    expect(mine.id).toMatch(/^jane-doe\./);
    expect(isLibraryItem(mine)).toBe(false);
    expect(d.project.quilts[0]!.layers[0].slots['b:r1c1']!.block).toBe(mine.id);
  });
});

describe('splitItems', () => {
  it('lists mine first, library entries once, preferring embedded copies, then uninstalled ones', () => {
    const src = { libraryId: 'l', itemId: 'x', revision: 1 };
    type Item = { id: string; source?: typeof src; tag?: string };
    const mine: Item = { id: 'me.a' };
    const embedded = { id: 'lib.b', source: src, tag: 'project' };
    const orphan = { id: 'gone.c', source: src };
    const r = splitItems(
      [mine, embedded, orphan],
      [
        { id: 'lib.a2', source: src },
        { id: 'lib.b', source: src, tag: 'library' },
      ],
    );
    expect(r.mine).toEqual([mine]);
    expect(r.library.map((x) => x.id)).toEqual(['lib.a2', 'lib.b', 'gone.c']);
    expect(r.library[1]).toBe(embedded);
  });
});

describe('projectColorings', () => {
  it("a color variant's own colorings are the ones changed or added since the copy", async () => {
    const { lib, lookup } = await setup();
    const orig = lib.blocks.find((b) => b.colorings.length > 1)!;
    const v0 = produce(copyBlock(orig, []), (c) => void (c.colorVariant = true));
    expect(projectColorings(v0, lookup)!.own).toEqual([]);
    const v1 = produce(v0, (c) => {
      const k = c.colorings[1]!;
      const patch = Object.keys(k.fills ?? {})[0] ?? 'p';
      k.fills = { ...k.fills, [patch]: { color: 'mine' } };
    });
    expect(projectColorings(v1, lookup)!.own.map((c) => c.id)).toEqual([v1.colorings[1]!.id]);
    expect(projectColorings(orig, lookup)).toBeUndefined();
    // Previews show them in their own section, apart from the library's.
    expect(coloringSections(v0, lookup)).toEqual([{ colorings: v0.colorings }]);
    const secs = coloringSections(v1, lookup);
    expect(secs.map((x) => [x.label, x.colorings.length])).toEqual([
      ['Project colorings', 1],
      ['Library colorings', v1.colorings.length - 1],
    ]);
  });
});

describe('library fabrics (spec 014)', () => {
  it('are embedded while painted, in project units, and dropped when not', async () => {
    const { lookup, doc } = await setup();
    const fabric = {
      id: 'agf.pe-595',
      notecard: { name: 'Marshmallow' },
      source: { libraryId: 'agf', itemId: 'agf.pe-595', revision: 1 },
      image: { sha256: 'a'.repeat(64), type: 'image/webp', width: 512, height: 512 },
      size: [8, 8] as [number, number],
      average: [240, 236, 233] as [number, number, number],
    };
    const lib = { ...lookup, fabric: (id: string) => (id === fabric.id ? fabric : undefined) };
    const cmDoc = produce(doc, (d) => void (d.units = 'cm'));
    const painted = produce(cmDoc, (d) => {
      const b = d.project.blocks[0] ?? undefined;
      if (b) b.colorings[0]!.fills.p1 = { fabric: fabric.id, offset: [0, 0], rotation: 0 };
      else
        d.project.quilts[0]!.colorings.k = {
          fills: { p1: { fabric: fabric.id, offset: [0, 0], rotation: 0 } },
        };
    });
    const synced = syncLibraryItems(painted, lib);
    expect(synced.project.palette.fabrics.map((f) => [f.id, f.size])).toEqual([
      [fabric.id, [20.32, 20.32]],
    ]);
    const unpainted = syncLibraryItems(
      produce(synced, (d) => {
        for (const b of d.project.blocks) for (const c of b.colorings) c.fills = {};
        for (const q of d.project.quilts) q.colorings = {};
      }),
      lib,
    );
    expect(unpainted.project.palette.fabrics).toEqual([]);
  });
});
