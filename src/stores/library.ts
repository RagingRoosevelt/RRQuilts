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
import { packDiff, type PackDiff } from '@/model/pack-diff';
import {
  deleteConnection,
  fetchImages,
  fetchIndex,
  fetchPack,
  fetchPackDoc,
  loadConnections,
  putConnection,
  rawBase,
  type Connection,
  type LibraryIndex,
} from '@/storage/repositories';
import { useSettingsStore } from './settings';
import { useProjectStore } from './project';
import { freeUnusedImages } from '@/storage/fabric-files';
import { setMissingFetcher } from '@/render/fabric-images';

/** One pack's part of a library update. */
export interface PackChange {
  id: string;
  name: string;
  kind: 'updated' | 'removed';
  diff: PackDiff;
}

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
  const connectionsLoaded = loadConnections()
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
  /**
   * A library file's chosen packs (images already stored), installed when new or newer. When the
   * file names its repository, the library is connected as if added from the web: its other packs
   * are listed, to switch on (download) later. Returns whether it's connected.
   */
  async function installFromFile(
    index: LibraryIndex | undefined,
    docs: LibraryDoc[],
    chosen: string[],
  ): Promise<boolean> {
    for (const d of docs.filter((x) => chosen.includes(x.id))) {
      const have = packs.value.find((x) => x.id === d.id);
      if (!have || have.revision < d.revision) await savePack(d);
    }
    const url = index?.repository;
    if (!index || typeof url !== 'string' || !/^https:\/\//.test(url)) return false;
    let base: string;
    try {
      base = rawBase(url);
    } catch {
      return false;
    }
    const old = connections.value.find((c) => c.index.id === index.id);
    if (!old)
      await saveConnection({ id: `repo:${index.id}`, url, base, index, pinned: index.revision });
    else if (index.revision > old.pinned)
      await saveConnection({ ...old, index, pinned: index.revision });
    return true;
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
    // What changes in the packs on this device (their documents only; images come on Update).
    const installed = packs.value.filter((p) => p.library?.id === c.index.id);
    const changes: PackChange[] = [];
    for (const p of latest.packs) {
      const have = installed.find((x) => x.id === p.id);
      if (!have || (p.revision ?? 0) <= have.revision) continue;
      const next = await fetchPackDoc({ ...c, index: latest }, p);
      changes.push({ id: p.id, name: p.name, kind: 'updated', diff: packDiff(have, next.doc) });
    }
    for (const have of installed)
      if (!latest.packs.some((p) => p.id === have.id))
        changes.push({
          id: have.id,
          name: have.name,
          kind: 'removed',
          diff: packDiff(have, { ...have, items: [] }),
        });
    const offered = latest.packs.filter(
      (p) => !c.index.packs.some((x) => x.id === p.id) && !installed.some((x) => x.id === p.id),
    );
    return {
      index: latest,
      notes: (latest.changelog ?? []).filter((e) => e.revision > c.pinned),
      changes,
      /** Packs new to the library: listed to switch on, not downloaded. */
      newPacks: offered.map((p) => p.name),
    };
  }
  /** Move the pin: re-download the installed packs whose revision changed. */
  async function acceptUpdate(c: Connection, index: Connection['index'], px: number) {
    const next = { ...c, index, pinned: index.revision };
    const skipped: string[] = [];
    // Packs the library no longer has go (the update showed them as removed).
    for (const p of packs.value.filter((x) => x.library?.id === c.index.id))
      if (!index.packs.some((x) => x.id === p.id)) {
        packs.value = packs.value.filter((x) => x.id !== p.id);
        await write(() => deletePack(p.id));
      }
    for (const p of index.packs) {
      const have = packs.value.find((x) => x.id === p.id);
      if (have && (p.revision ?? 0) > have.revision)
        skipped.push(...(await installFromRepo(next, p.id, px)));
    }
    await saveConnection(next);
    // Newer versions may have dropped fabrics: their images go unless a project still uses them.
    void freeImages();
    return skipped;
  }
  async function declineUpdate(c: Connection, revision: number) {
    await saveConnection({ ...c, declined: revision });
  }
  /** Remove a library of packs from this device: its packs, and its connection if it has one. */
  async function removeLibrary(libId: string) {
    for (const p of packs.value.filter((x) => x.library?.id === libId)) await removePack(p.id);
    if (!connections.value.some((x) => x.index.id === libId)) return;
    connections.value = connections.value.filter((x) => x.index.id !== libId);
    await write(() => deleteConnection(libId));
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
  // Fabric images missing on this device (spec 014): download them from their connected library,
  // a pack at a time (fabrics of one pack missing together share one download).
  const fetching = new Map<string, Promise<boolean>>();
  setMissingFetcher((f) => {
    const packId = f.source?.libraryId;
    if (!packId) return Promise.resolve(false);
    let p = fetching.get(packId);
    if (!p) {
      const px = useSettingsStore().settings.imageSize;
      p = Promise.all([loaded, connectionsLoaded])
        .then(() => fetchPackImages([packId], (s) => s <= 256 || s <= px))
        .then((n) => n > 0);
      fetching.set(packId, p);
      void p.finally(() => fetching.delete(packId));
    }
    return p;
  });

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
    connectionsLoaded,
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
    installFromFile,
    installFromRepo,
    checkForUpdate,
    acceptUpdate,
    declineUpdate,
    removeLibrary,
    whereOf,
    lacking,
    connectRef,
    fetchPackImages,
    freeImages,
  };
});
