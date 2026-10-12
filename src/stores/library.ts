// Libraries (spec 008/011): built-in, My library, and installed packs. Projects look items up across
// all of them (My library first, then packs, then built-in). Changes are saved to IndexedDB.
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { emptyPersonal, lookupOf, withSources, type LibraryView } from '@/model/library';
import type { LibraryDoc } from '@/model/schema/library';
import { deletePack, loadLibraries, putMine, putPack } from '@/storage/libraries';

export const useLibraryStore = defineStore('library', () => {
  const builtin = shallowRef<LibraryDoc | null>(null);
  const mine = shallowRef<LibraryDoc | null>(null);
  const packs = shallowRef<LibraryDoc[]>([]);
  /** False when this browser won't keep libraries (blocked storage); they live in memory only. */
  const stored = ref(true);

  const loaded = Promise.all([
    builtinLibrary().then((x) => void (builtin.value = Object.freeze(builtinDoc(x)))),
    loadLibraries()
      .then((r) => {
        mine.value = r.mine ?? null;
        packs.value = r.packs;
      })
      .catch(() => void (stored.value = false)),
  ]).then(() => undefined);

  const views = computed<LibraryView[]>(() =>
    [mine.value, ...packs.value, builtin.value]
      .filter((d): d is LibraryDoc => !!d)
      .map((doc) => ({ doc, ...withSources(doc) })),
  );
  const lookup = computed(() => lookupOf(views.value));
  /** Every library item, each id once (the one projects get). */
  const items = computed(() => {
    const seen = new Set<string>();
    const once = <T extends { id: string }>(x: T) => !seen.has(x.id) && !!seen.add(x.id);
    return {
      blocks: views.value.flatMap((v) => v.blocks).filter(once),
      colors: views.value.flatMap((v) => v.colors).filter(once),
    };
  });

  let askedPersist = false;
  async function write(fn: () => Promise<void>) {
    try {
      await fn();
      stored.value = true;
    } catch {
      stored.value = false;
    }
    // Ask the browser not to evict libraries under storage pressure (best effort).
    if (!askedPersist) {
      askedPersist = true;
      void navigator.storage?.persist?.().catch(() => {});
    }
  }

  /** My library, created on first use. */
  const ensureMine = (me: string) => mine.value ?? emptyPersonal(me);
  async function saveMine(doc: LibraryDoc) {
    mine.value = Object.freeze(doc);
    await write(() => putMine(doc));
  }
  async function savePack(doc: LibraryDoc) {
    packs.value = [...packs.value.filter((p) => p.id !== doc.id), Object.freeze(doc)];
    await write(() => putPack(doc));
  }
  async function removePack(id: string) {
    packs.value = packs.value.filter((p) => p.id !== id);
    await write(() => deletePack(id));
  }

  return {
    builtin,
    mine,
    packs,
    stored,
    loaded,
    views,
    lookup,
    items,
    ensureMine,
    saveMine,
    savePack,
    removePack,
  };
});
