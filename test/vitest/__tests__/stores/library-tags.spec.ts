// Spec 029: the quilter's tags (and Favorite) on library items, blocks and palettes alike.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { emptyPersonal } from '@/model/library';
import { FAVORITE, tagsFor } from '@/model/tags';
import { resetIdb } from '@/storage/idb';
import { useLibraryStore } from '@/stores/library';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
  setActivePinia(createPinia());
});

describe('tags on library palettes', () => {
  it('keeps them in My library for a built-in palette', async () => {
    const library = useLibraryStore();
    await library.loaded;
    const c = library.views.flatMap((v) => v.collections)[0]!;
    await library.setTags('Sam', c.id, [FAVORITE]);
    expect(tagsFor(c.notecard.tags, [c.id], library.kept)).toEqual([FAVORITE]);
    await library.setTags('Sam', c.id, []);
    expect(tagsFor(c.notecard.tags, [c.id], library.kept)).toEqual([]);
  });

  it('puts them on a My library palette itself', async () => {
    const library = useLibraryStore();
    await library.loaded;
    const pal = { ...library.views.flatMap((v) => v.collections)[0]!, id: 'sam.pal' };
    await library.saveMine({ ...emptyPersonal('Sam'), items: [{ type: 'colors', data: pal }] });
    await library.setTags('Sam', 'sam.pal', [FAVORITE, 'Spring']);
    const saved = library.mine!.items.find((i) => i.data.id === 'sam.pal')!;
    expect(saved.data.notecard.tags).toEqual([FAVORITE, 'Spring']);
    expect(library.mine!.annotations ?? []).toEqual([]);
  });
});
