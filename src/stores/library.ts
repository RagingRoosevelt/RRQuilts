// Libraries (spec 008/011): built-in, My library, and installed packs. Projects look items up across
// all of them (My library first, then packs, then built-in). Changes are saved to IndexedDB.
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { emptyPersonal, lookupOf, withSources, type LibraryView } from '@/model/library';
import type { LibraryDoc } from '@/model/schema/library';
import { deletePack, loadLibraries, putMine, putPack } from '@/storage/libraries';
import {
  deleteConnection,
  fetchIndex,
  fetchPack,
  loadConnections,
  putConnection,
  rawBase,
  type Connection,
} from '@/storage/repositories';
import { useSettingsStore } from './settings';

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

  /** Every library on the device (the Libraries page lists them all). */
  const allViews = computed<LibraryView[]>(() =>
    [mine.value, ...packs.value, builtin.value]
      .filter((d): d is LibraryDoc => !!d)
      .map((doc) => ({ doc, ...withSources(doc) })),
  );
  /** Libraries in use: packs switched off (spec 014) are left out of trays and pickers. */
  const views = computed<LibraryView[]>(() => {
    const off = new Set(useSettingsStore().settings.packsOff);
    return allViews.value.filter((v) => !off.has(v.doc.id));
  });
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

  // --- Libraries connected from the web (spec 002 US3/US4, spec 014) ---
  const connections = shallowRef<Connection[]>([]);
  void loadConnections()
    .then((c) => void (connections.value = c))
    .catch(() => {});
  async function saveConnection(c: Connection) {
    connections.value = [...connections.value.filter((x) => x.index.id !== c.index.id), c];
    await write(() => putConnection(c));
  }
  /** Connect by address: only the index is fetched; packs download when switched on. */
  async function connect(url: string, ref?: string) {
    const base = rawBase(url, ref);
    const index = await fetchIndex(base);
    const c: Connection = {
      id: `repo:${index.id}`,
      url: url.trim(),
      ...(ref ? { ref } : {}),
      base,
      index,
      pinned: index.revision,
    };
    await saveConnection(c);
    return c;
  }
  /** Download and install one of a connected library's packs. */
  async function installFromRepo(c: Connection, packId: string, px: number) {
    const p = c.index.packs.find((x) => x.id === packId);
    if (!p) throw new Error('That pack isn’t in the library any more.');
    const r = await fetchPack(c, p, px);
    await savePack(r.doc);
    return r.skipped;
  }
  /** A newer revision of a connected library, if any (with its changelog since the pin). */
  async function checkForUpdate(c: Connection) {
    const latest = await fetchIndex(c.base);
    if (latest.revision <= c.pinned) return undefined;
    return {
      index: latest,
      notes: (latest.changelog ?? []).filter((e) => e.revision > c.pinned),
    };
  }
  /** Move the pin: re-download the installed packs whose revision changed. */
  async function acceptUpdate(c: Connection, index: Connection['index'], px: number) {
    const next = { ...c, index, pinned: index.revision };
    const skipped: string[] = [];
    for (const p of index.packs) {
      const have = packs.value.find((x) => x.id === p.id);
      if (have && (p.revision ?? 0) > have.revision)
        skipped.push(...(await installFromRepo(next, p.id, px)));
    }
    await saveConnection(next);
    return skipped;
  }
  async function declineUpdate(c: Connection, revision: number) {
    await saveConnection({ ...c, declined: revision });
  }
  async function disconnect(c: Connection) {
    for (const p of packs.value.filter((x) => x.library?.id === c.index.id)) await removePack(p.id);
    connections.value = connections.value.filter((x) => x.index.id !== c.index.id);
    await write(() => deleteConnection(c.index.id));
  }

  return {
    builtin,
    mine,
    packs,
    stored,
    loaded,
    views,
    allViews,
    lookup,
    items,
    ensureMine,
    saveMine,
    savePack,
    removePack,
    connections,
    connect,
    installFromRepo,
    checkForUpdate,
    acceptUpdate,
    declineUpdate,
    disconnect,
  };
});
