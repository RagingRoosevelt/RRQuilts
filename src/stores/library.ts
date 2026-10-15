// Libraries (spec 008/011): built-in, My library, and installed packs. Projects look items up across
// all of them (My library first, then packs, then built-in). Changes are saved to IndexedDB.
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { emptyPersonal, lookupOf, withSources, type LibraryView } from '@/model/library';
import type { LibraryDoc } from '@/model/schema/library';
import type { LibraryRef } from '@/model/schema/project';
import type { LibraryWhere } from '@/model/library-refs';
import { deletePack, loadLibraries, putMine, putPack } from '@/storage/libraries';
import {
  deleteConnection,
  fetchImages,
  fetchIndex,
  fetchPack,
  loadConnections,
  putConnection,
  rawBase,
  type Connection,
} from '@/storage/repositories';
import { useSettingsStore } from './settings';
import { useProjectStore } from './project';
import { freeUnusedImages } from '@/storage/fabric-files';

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
    void freeImages();
  }
  /** Free images no library or project uses any more (after removing packs). */
  function freeImages() {
    const open = useProjectStore().doc;
    // Off packs from connected libraries let go of their images: they download again when on.
    const off = new Set(useSettingsStore().settings.packsOff);
    const linked = (d: LibraryDoc) => connections.value.some((c) => c.index.id === d.library?.id);
    const kept = packs.value.filter((d) => !off.has(d.id) || !linked(d));
    const docs = [...(mine.value ? [mine.value] : []), ...kept];
    return freeUnusedImages(docs, open ? [open] : []).catch(() => {});
  }

  // --- Libraries connected from the web (spec 002 US3/US4, spec 014) ---
  const connections = shallowRef<Connection[]>([]);
  void loadConnections()
    .then((c) => {
      const now = connections.value; // connected meanwhile: keep
      connections.value = [...c.filter((x) => !now.some((y) => y.id === x.id)), ...now];
    })
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

  /** Fetch connected packs' missing images (`want`: sizes; default 1024 px, printing only). */
  async function fetchPackImages(
    packIds: string[],
    want: (px: number) => boolean = (px) => px === 1024,
  ) {
    let n = 0;
    for (const id of packIds) {
      const doc = packs.value.find((p) => p.id === id);
      const c = connections.value.find((x) => x.index.id === doc?.library?.id);
      const path = c?.index.packs.find((p) => p.id === id)?.path;
      if (!doc || !c || !path) continue;
      const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
      await fetchImages(c.base + dir, doc, want).catch(() => {});
      n++;
    }
    return n;
  }
  /** Where a pack came from (its library, and the address it's connected from). */
  function whereOf(packId: string): LibraryWhere | undefined {
    const pack = packs.value.find((p) => p.id === packId);
    const libId = pack?.library?.id;
    const c = connections.value.find(
      (x) => x.index.id === libId || x.index.packs.some((p) => p.id === packId),
    );
    const library = pack?.library ?? (c && { id: c.index.id, name: c.index.name });
    if (!library && !c) return undefined;
    return {
      ...(library ? { library } : {}),
      ...(c ? { url: c.url, ...(c.ref ? { ref: c.ref } : {}) } : {}),
    };
  }
  /** Packs of `ref` this device lacks (spec 014 FR-032). */
  const lacking = (ref: LibraryRef) => {
    const have = new Set(allViews.value.map((v) => v.doc.id));
    return ref.packs.filter((p) => !have.has(p));
  };
  /** Connect a project's library by its address and download the packs the project uses. */
  async function connectRef(ref: LibraryRef, px: number) {
    if (!ref.url) throw new Error('No address for this library.');
    const c =
      connections.value.find((x) => x.index.id === ref.id) ?? (await connect(ref.url, ref.ref));
    const skipped: string[] = [];
    for (const p of lacking(ref))
      if (c.index.packs.some((x) => x.id === p)) skipped.push(...(await installFromRepo(c, p, px)));
    return skipped;
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
    whereOf,
    lacking,
    connectRef,
    fetchPackImages,
    freeImages,
  };
});
