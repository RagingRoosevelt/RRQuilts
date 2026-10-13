import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { copyBlock, newBlock } from '@/editor/block-ops';
import {
  collectionFile,
  importCollectionColors,
  parseCollectionFile,
} from '@/model/collection-file';
import { allPatches } from '@/model/blocks/patches';
import { ALL_RIGHTS } from '@/model/credits';
import {
  addBlock,
  addCategory,
  addToCollection,
  categoryTree,
  colorChanged,
  copyToMine,
  deleteCategory,
  emptyPersonal,
  ensureCategory,
  linkState,
  lookupOf,
  saveCollection,
  searchItems,
  setCategory,
  syncBlock,
  syncColor,
  syncConflict,
  withSources,
  withSubcategories,
} from '@/model/library';
import { backupDoc, packDoc, parseLibrary, restore, serializeLibrary } from '@/model/library-file';
import { isLibraryItem, splitItems } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import type { LibraryDoc } from '@/model/schema/library';
import type { RrqDoc } from '@/model/schema/project';
import { expectFast } from '../timing';

const ME = 'Jane';
function projectWithBlock(units: 'in' | 'cm' = 'in') {
  const doc0 = createProject();
  const b = newBlock('Star', units === 'cm' ? [25.4, 25.4] : [10, 10], units, ME);
  const doc: RrqDoc = { ...doc0, units, project: { ...doc0.project, blocks: [b] } };
  return { doc, id: b.id };
}
const withColors = (doc: RrqDoc) =>
  produce(doc, (d) => {
    d.project.palette.colors.push(
      { id: 'jane.red', notecard: { name: 'Red' }, rgb: [200, 0, 0] },
      { id: 'jane.blue', notecard: { name: 'Blue' }, rgb: [0, 0, 200] },
    );
  });

describe('My library: blocks', () => {
  it('adds a block in inches, keeps the project block editable and linked', async () => {
    const { doc, id } = projectWithBlock('cm');
    const r = await addBlock(emptyPersonal(ME), doc, id);
    const item = r.lib.items[0]!;
    expect(item.type === 'block' && item.data.size[0]).toBeCloseTo(10);
    expect(item.data.version).toMatch(/^[a-f0-9]{12}$/);
    expect(item.data.source).toBeUndefined();
    const b = r.doc.project.blocks[0]!;
    expect(isLibraryItem(b)).toBe(false);
    expect(linkState(r.lib, b, 'cm')).toBe('synced');
  });

  it('carries the project colors the block uses; other projects can draw it', async () => {
    const { doc, id } = projectWithBlock();
    const colored = produce(withColors(doc), (d) => {
      const b = d.project.blocks[0]!;
      b.colorings[0]!.fills = { [allPatches(b)[0]!.id]: { color: 'jane.red' } };
    });
    const { lib } = await addBlock(emptyPersonal(ME), colored, id);
    const item = lib.items[0]!;
    expect(item.type === 'block' && item.colors?.map((c) => c.id)).toEqual(['jane.red']);
    const view = { doc: lib, ...withSources(lib) };
    expect(isLibraryItem(lookupOf([view]).color('jane.red')!)).toBe(true);
  });

  it('edit → changed → sync bumps the revision; a stale copy is a conflict', async () => {
    const { doc, id } = projectWithBlock();
    const a = await addBlock(emptyPersonal(ME), doc, id);
    const edited = produce(a.doc, (d) => void (d.project.blocks[0]!.size = [12, 12]));
    expect(linkState(a.lib, edited.project.blocks[0]!, 'in')).toBe('changed');
    expect(syncConflict(a.lib, edited.project.blocks[0]!)).toBe(false);
    const s = await syncBlock(a.lib, edited, id);
    expect(s.lib.items[0]!.data.revision).toBe(2);
    expect(linkState(s.lib, s.doc.project.blocks[0]!, 'in')).toBe('synced');
    // Project A still has the copy made from revision 1.
    expect(syncConflict(s.lib, edited.project.blocks[0]!)).toBe(true);
  });

  it('a library item embedded elsewhere is read-only; Edit makes a linked copy (no credit)', async () => {
    const { doc, id } = projectWithBlock();
    const { lib } = await addBlock(emptyPersonal(ME), doc, id);
    const embedded = withSources(lib).blocks[0]!;
    expect(isLibraryItem(embedded)).toBe(true);
    const copy = copyBlock(embedded, [], ME);
    expect(copy.id).not.toBe(id);
    expect(copy.credits ?? []).toEqual([]);
    expect(copy.source?.itemId).toBe(id);
    const d2 = produce(createProject(), (d) => void d.project.blocks.push(copy));
    expect(linkState(lib, copy, 'in')).toBe('synced');
    const edited = produce(d2, (d) => void (d.project.blocks[0]!.size = [8, 8]));
    const s = await syncBlock(lib, edited, copy.id);
    expect(s.lib.items[0]!.data.id).toBe(id);
    expect(s.lib.items[0]!.data.revision).toBe(2);
  });

  it('linked copies hide their library entry in the sketchbook split', async () => {
    const { doc, id } = projectWithBlock();
    const { lib, doc: linked } = await addBlock(emptyPersonal(ME), doc, id);
    const split = splitItems(linked.project.blocks, withSources(lib).blocks);
    expect(split.mine.map((b) => b.id)).toEqual([id]);
    expect(split.library).toEqual([]);
  });

  it('categories: set, delete uncategorizes', async () => {
    const { doc, id } = projectWithBlock();
    let { lib } = await addBlock(emptyPersonal(ME), doc, id);
    const c = addCategory(lib, 'Stars');
    lib = setCategory(c.lib, id, c.category.id);
    expect(searchItems(lib.items, '', c.category.id)).toHaveLength(1);
    lib = deleteCategory(lib, c.category.id);
    expect(lib.items[0]!.category).toBeUndefined();
    expect(searchItems(lib.items, '', '')).toHaveLength(1);
  });

  it('categories: two levels by path; a parent matches and deletes its subcategories', async () => {
    const { doc, id } = projectWithBlock();
    let { lib } = await addBlock(emptyPersonal(ME), doc, id);
    const star8 = ensureCategory(lib, 'Stars/Eight-point stars');
    const again = ensureCategory(star8.lib, 'stars / eight-point STARS');
    expect(again.id).toBe(star8.id);
    expect(again.lib.categories).toHaveLength(2);
    lib = setCategory(star8.lib, id, star8.id);
    const stars = lib.categories.find((c) => !c.parent)!;
    expect(categoryTree(lib.categories).map((c) => c.label)).toEqual([
      'Stars',
      'Stars / Eight-point stars',
    ]);
    expect(withSubcategories(lib.categories, [stars.id])).toContain(star8.id);
    lib = deleteCategory(lib, stars.id);
    expect(lib.categories).toEqual([]);
    expect(lib.items[0]!.category).toBeUndefined();
  });

  it('a file subcategory whose parent is missing or nested becomes top-level', () => {
    const base = JSON.parse(serializeLibrary(emptyPersonal(ME), 'test'));
    base.categories = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B', parent: 'a' },
      { id: 'c', name: 'C', parent: 'b' },
      { id: 'd', name: 'D', parent: 'zz' },
    ];
    const r = parseLibrary(JSON.stringify(base));
    expect(r.ok && r.doc.categories.map((c) => c.parent ?? '-')).toEqual(['-', 'a', '-', '-']);
  });

  it('built-in blocks are filed in two-level categories', async () => {
    const builtin = builtinDoc(await builtinLibrary());
    const ohio = builtin.items.find((i) => i.data.notecard.name === 'Ohio Star')!;
    const label = categoryTree(builtin.categories).find((c) => c.id === ohio.category)?.label;
    expect(label).toBe('Stars / Eight-point stars');
    expect(builtin.items.filter((i) => i.type === 'block').every((i) => i.category)).toBe(true);
  });

  it('copy to mine credits the original and gets a new id', async () => {
    const builtin = builtinDoc(await builtinLibrary());
    const ohio = builtin.items.find((i) => i.data.notecard.name === 'Ohio Star')!;
    const lib = await copyToMine(emptyPersonal(ME), ohio, ME);
    const copy = lib.items[0]!.data;
    expect(copy.id).toMatch(/^jane\./);
    expect(copy.author).toBe(ME);
    expect(copy.credits?.[0]?.name).toBe('Ohio Star');
  });
});

describe('My library: color collections', () => {
  it('save, add to, change and sync a color', async () => {
    const doc = withColors(createProject());
    const s = await saveCollection(emptyPersonal(ME), doc, 'Brights', ['jane.red'], ME);
    const coll = s.lib.items[0]!;
    expect(coll.type).toBe('colors');
    expect(s.doc.project.palette.colors[0]!.source?.derived).toBe(true);
    const a = await addToCollection(s.lib, s.doc, coll.data.id, ['jane.blue']);
    const data = a.lib.items[0]!.data;
    expect('colors' in data && data.colors.map((c) => c.id)).toEqual(['jane.red', 'jane.blue']);
    expect(data.revision).toBe(2);
    const edited = produce(a.doc, (d) => void (d.project.palette.colors[0]!.rgb = [180, 0, 0]));
    expect(colorChanged(a.lib, edited.project.palette.colors[0]!)).toBe(true);
    const synced = await syncColor(a.lib, edited, 'jane.red');
    expect(colorChanged(synced.lib, synced.doc.project.palette.colors[0]!)).toBe(false);
    expect(synced.lib.items[0]!.data.revision).toBe(3);
  });

  it('.rrqplt round trip; import adds the colors as own', async () => {
    const doc = withColors(createProject());
    const s = await saveCollection(emptyPersonal(ME), doc, 'Brights', ['jane.red'], ME);
    const coll = s.lib.items[0]!.data;
    const r = parseCollectionFile(JSON.stringify(collectionFile(coll as never, 'test')));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const imp = importCollectionColors(createProject(), r.file.collection);
    expect(imp.added).toBe(1);
    expect(isLibraryItem(imp.doc.project.palette.colors[0]!)).toBe(false);
    expect(importCollectionColors(imp.doc, r.file.collection).added).toBe(0);
    expect(parseCollectionFile('{"format":"rrqplt","version":9}').ok).toBe(false);
  });

  it('overwrite import drops unused own colors, keeps used ones', () => {
    const doc = produce(withColors(projectWithBlock().doc), (d) => {
      d.project.blocks[0]!.colorings[0]!.fills['p1'] = { color: 'jane.blue' };
    });
    const green = {
      id: 'x.green',
      notecard: { name: 'Green' },
      rgb: [0, 200, 0] as [number, number, number],
    };
    const c = { id: 'x.coll', notecard: { name: 'Greens' }, colors: [green] };
    const r = importCollectionColors(doc, c, 'overwrite');
    expect(r.doc.project.palette.colors.map((x) => x.id)).toEqual(['jane.blue', 'x.green']);
    expect(r.removed).toBe(1);
    expect(importCollectionColors(doc, c).doc.project.palette.colors).toHaveLength(3);
  });

  it('built-in colors look up through the "Basic colors" collection', async () => {
    const items = await builtinLibrary();
    const view = { doc: builtinDoc(items), ...withSources(builtinDoc(items)) };
    expect(view.collections[0]!.notecard.name).toBe('Basic colors');
    const lookup = lookupOf([view]);
    expect(lookup.color(items.colors[0]!.id)).toBe(items.colors[0]);
    expect(lookup.block(items.blocks[0]!.id)).toBe(items.blocks[0]);
  });
});

describe('.rrqlib files', () => {
  async function mine() {
    const { doc, id } = projectWithBlock();
    return (await addBlock(emptyPersonal(ME), doc, id)).lib;
  }

  it('round trip; invalid items skipped and listed; newer versions refused', async () => {
    const lib = await mine();
    const raw = JSON.parse(serializeLibrary(lib, 'test')) as LibraryDoc & { items: unknown[] };
    raw.items.push({ type: 'block', data: { notecard: { name: 'Broken' } } });
    const r = parseLibrary(JSON.stringify(raw));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.doc.items).toEqual(lib.items);
    expect(r.skipped).toHaveLength(1);
    expect(r.skipped[0]).toContain('Broken');
    expect(parseLibrary(JSON.stringify({ ...raw, version: 99 })).ok).toBe(false);
    expect(parseLibrary('nope').ok).toBe(false);
  });

  it('cm files are read in inches; unknown categories dropped', async () => {
    const lib = await mine();
    const cm = {
      ...lib,
      units: 'cm',
      items: lib.items.map((i) =>
        i.type === 'block'
          ? { ...i, category: 'gone', data: { ...i.data, size: [25.4, 25.4] } }
          : i,
      ),
    };
    const r = parseLibrary(JSON.stringify(cm));
    expect(r.ok && r.doc.items[0]!.type === 'block' && r.doc.items[0]!.data.size[0]).toBeCloseTo(
      10,
    );
    expect(r.ok && r.doc.items[0]!.category).toBeUndefined();
  });

  it('packs need author and license; only backups hold packs', async () => {
    const lib = await mine();
    expect(parseLibrary(JSON.stringify({ ...lib, kind: 'pack' })).ok).toBe(false);
    const { doc: pack } = packDoc(lib, ME, { name: 'P', author: ME, license: 'CC-BY-SA-4.0' });
    expect(parseLibrary(JSON.stringify(pack)).ok).toBe(true);
    expect(parseLibrary(JSON.stringify({ ...pack, packs: [pack] })).ok).toBe(false);
  });

  it('backup holds My library and packs; restore merges or replaces', async () => {
    const lib = await mine();
    const { doc: pack } = packDoc(lib, ME, { name: 'P', author: ME, license: 'CC0-1.0' });
    const backup = backupDoc(lib, [pack], { mine: true, packs: true });
    const r = parseLibrary(serializeLibrary(backup, 'test'));
    expect(r.ok && r.doc.packs?.[0]?.id).toBe(pack.id);
    if (!r.ok) return;
    const empty = emptyPersonal(ME);
    const merged = restore({ mine: empty, packs: [] }, r.doc, { mine: 'merge', packs: {} });
    expect(merged.mine.id).toBe(empty.id);
    expect(merged.mine.items).toHaveLength(1);
    expect(merged.packs).toHaveLength(1);
    const replaced = restore({ mine: empty, packs: [] }, r.doc, { mine: 'replace', packs: {} });
    expect(replaced.mine.id).toBe(lib.id);
    const kept = restore({ mine: lib, packs: [{ ...pack, name: 'old' }] }, r.doc, {
      mine: 'merge',
      packs: {},
    });
    expect(kept.packs[0]!.name).toBe('old');
  });

  it('packs leave out others’ all-rights-reserved items and follow share-alike', async () => {
    const lib = await mine();
    const theirs = produce(lib.items[0]!, (i) => {
      i.data.id = 'sam.x';
      i.data.author = 'Sam';
      i.data.license = ALL_RIGHTS;
      i.data.notecard.name = 'Secret';
    });
    const sa = produce(lib.items[0]!, (i) => {
      i.data.id = 'sam.y';
      i.data.author = 'Sam';
      i.data.license = 'CC-BY-SA-4.0';
      i.data.notecard.name = 'Shared';
    });
    const r = packDoc({ ...lib, items: [...lib.items, theirs, sa] }, ME, {
      name: 'P',
      author: ME,
      license: 'CC0-1.0',
    });
    expect(r.excluded).toEqual(['Secret']);
    expect(r.doc.license).toBe('CC-BY-SA-4.0');
    expect(r.lock?.license).toBe('CC-BY-SA-4.0');
    expect(r.doc.credits).toEqual([{ name: 'Shared', author: 'Sam', license: 'CC-BY-SA-4.0' }]);
  });
});

describe('library search', () => {
  it('searches 500 blocks quickly', async () => {
    const lib = await (async () => {
      const { doc, id } = projectWithBlock();
      return (await addBlock(emptyPersonal(ME), doc, id)).lib;
    })();
    const one = lib.items[0]!;
    const items = Array.from({ length: 500 }, (_, i) =>
      produce(one, (d) => {
        d.data.id = `jane.b${i}`;
        d.data.notecard.name = `Block ${i}`;
        d.data.notecard.styles = i % 2 ? ['eight-point'] : [];
      }),
    );
    expect(searchItems(items, 'eight point')).toHaveLength(250);
    expect(searchItems(items, 'nine')).toHaveLength(0);
    expect(searchItems(items, 'eight-point')).toHaveLength(250);
    expectFast('search 500 library blocks', () => searchItems(items, 'block 4'), 100);
  });
});
