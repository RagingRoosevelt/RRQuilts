// App-level libraries (spec 008): the built-in starter library now; packs and repositories later.
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { builtinLibrary, type BuiltinItems } from '@/content/starter';
import type { LibraryLookup } from '@/model/library-items';

export const useLibraryStore = defineStore('library', () => {
  const items = shallowRef<BuiltinItems>({ blocks: [], colors: [] });
  const loaded = builtinLibrary().then((x) => void (items.value = Object.freeze(x)));
  const lookup: LibraryLookup = {
    block: (id) => items.value.blocks.find((b) => b.id === id),
    color: (id) => items.value.colors.find((c) => c.id === id),
  };
  return { items, loaded, lookup };
});
