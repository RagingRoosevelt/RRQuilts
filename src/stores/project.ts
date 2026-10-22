// The open project: in-memory document, file link, save status, crash-recovery draft, and the
// one-editing-tab lock. All edits go through `change()`.
import { freeze, produce, produceWithPatches, type Draft as ImmerDraft } from 'immer';
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { absorbImages, prepareForSave } from '@/storage/fabric-files';
import { libraryRefs } from '@/model/library-refs';
import { quiltProject } from '@/model/export-quilt';
import { parseProject, serializeProject } from '@/model/io';
import { newId } from '@/model/ids';
import { createProject } from '@/model/new-project';
import type { Block } from '@/model/schema/block';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import { itemId, stampVersions } from '@/model/identity';
import {
  keepAsMine,
  swapToLibraryVersion,
  syncDraft,
  followColorVariants,
  syncLibraryItems,
  versionMismatches,
} from '@/model/library-items';
import { useLibraryStore } from './library';
import { createHistory } from '@/editor/undo';
import { createAutosave } from '@/session/autosave';
import { socialsOut } from '@/settings/socials';
import { openedProject } from '@/settings/settings';
import { useSettingsStore } from '@/stores/settings';
import {
  acquireEditLock,
  answerFlushRequests,
  takeOverEditLock,
  type HeldLock,
} from '@/session/tab-lock';
import {
  getDraft,
  markDraftClean,
  putDraft,
  removeDraft,
  type Draft,
  draftDoc,
} from '@/storage/drafts';
import {
  download,
  ensurePermission,
  exportFile,
  pickSaveHandle,
  supportsFileAccess,
  writeToHandle,
  type Picked,
} from '@/storage/files';
import { forgetRecent, getRecent, rememberRecent, type RecentEntry } from '@/storage/recent';

export type SaveStatus = 'none' | 'new' | 'saved' | 'unsaved' | 'unsaved-no-draft' | 'read-only';
export type SaveResult = 'saved' | 'downloaded' | 'cancelled';

const APP = import.meta.env.APP_VERSION;

export const useProjectStore = defineStore('project', () => {
  const doc = shallowRef<RrqDoc | null>(null);
  const handle = shallowRef<FileSystemFileHandle | null>(null);
  const savedOnce = ref(false);
  const revision = ref(0);
  const savedRevision = ref(0);
  const draftOk = ref(true);
  const readOnly = ref(false);
  /** Embedded library items whose library holds a different version (asked about after open). */
  const mismatches = shallowRef<ReturnType<typeof versionMismatches>>([]);
  /** Set when another tab took over editing (shown as an explanation). */
  const lostToOtherTab = ref(false);
  let lock: HeldLock | null = null;

  const isOpen = computed(() => doc.value !== null);
  const dirty = computed(() => revision.value !== savedRevision.value);
  const status = computed<SaveStatus>(() => {
    if (!doc.value) return 'none';
    if (readOnly.value) return 'read-only';
    if (!dirty.value) return savedOnce.value ? 'saved' : 'new';
    return draftOk.value ? 'unsaved' : 'unsaved-no-draft';
  });

  let askedPersist = false;
  async function writeDraft() {
    if (!doc.value || readOnly.value) return;
    try {
      await putDraft(doc.value, dirty.value);
      draftOk.value = true;
      // Ask the browser not to evict drafts/libraries under storage pressure (best effort).
      if (!askedPersist) {
        askedPersist = true;
        void navigator.storage?.persist?.().catch(() => {});
      }
    } catch {
      draftOk.value = false;
    }
  }
  const autosave = createAutosave(writeDraft);
  answerFlushRequests(
    () => (readOnly.value ? null : (doc.value?.project.id ?? null)),
    async () => {
      autosave.dispose();
      await writeDraft();
    },
  );

  function onLost() {
    lock = null;
    autosave.dispose();
    readOnly.value = true;
    lostToOtherTab.value = true;
  }

  /** `saved`: matches a file on disk. `dirty`: has changes worth a recovery draft. */
  async function load(
    next: RrqDoc,
    opts: { handle?: FileSystemFileHandle | null; saved: boolean; dirty: boolean },
  ) {
    await close();
    openedProject(useSettingsStore().settings, next.project.id, next.project.quilts.length > 0);
    // Color variants redrawn since (their library block changed): a change worth saving.
    const followed = produce(next, (d) => followColorVariants(d, useLibraryStore().lookup));
    if (followed !== next) opts = { ...opts, dirty: true };
    next = followed;
    doc.value = freeze(next, true);
    handle.value = opts.handle ?? null;
    savedOnce.value = opts.saved;
    revision.value = opts.dirty ? 1 : 0;
    savedRevision.value = 0;
    draftOk.value = true;
    lostToOtherTab.value = false;
    lock = await acquireEditLock(next.project.id, onLost);
    readOnly.value = lock === null;
    if (opts.dirty && !readOnly.value) await writeDraft();
  }

  /** New, empty project in the units chosen in Settings (library items embed when used). */
  function newProject(name?: string) {
    const { units, author, socials } = useSettingsStore().settings;
    const doc = createProject(name, units, APP);
    if (author) doc.project.author = author;
    const out = socialsOut(socials);
    if (author && out.length) doc.project.authorSocials = out;
    return load(doc, { saved: false, dirty: false });
  }

  /** Open a file; returns problems found while loading (shown to the user). */
  async function openFile(picked: Picked): Promise<string[]> {
    const r = await parseProject(await picked.file.text());
    if (!r.ok) throw new Error(r.error);
    await load(await absorbImages(r.doc), {
      handle: picked.handle ?? null,
      saved: true,
      dirty: false,
    });
    mismatches.value = versionMismatches(r.doc, useLibraryStore().lookup);
    // Libraries the project uses that this device lacks (spec 014): say so, and where to add them.
    const lib = useLibraryStore();
    const missing = (r.doc.project.libraries ?? []).filter((l) => lib.lacking(l).length);
    if (missing.length)
      r.report.push(
        `This project uses ${missing.length > 1 ? 'libraries' : 'a library'} this device doesn't have: ` +
          missing.map((l) => (l.author ? `${l.name} by ${l.author}` : l.name)).join(', ') +
          '. Add them from the project’s Details tab or Libraries; until then their fabrics show as average colors.',
      );
    await rememberRecent({
      id: r.doc.project.id,
      name: r.doc.project.name,
      openedAt: Date.now(),
      ...(picked.handle ? { handle: picked.handle } : {}),
    }).catch(() => {});
    return r.report;
  }

  async function openRecent(entry: RecentEntry): Promise<string[]> {
    if (!entry.handle || !(await ensurePermission(entry.handle, 'readwrite'))) {
      throw new Error(
        'Pick the file again — the browser no longer allows opening it from the recent list.',
      );
    }
    try {
      return await openFile({ file: await entry.handle.getFile(), handle: entry.handle });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotFoundError') {
        await forgetRecent(entry.id).catch(() => {});
        throw new Error('That file was moved or deleted. Pick it again.', { cause: e });
      }
      throw e;
    }
  }

  /** Open unsaved work; returns problems found while loading (as for a file). */
  async function restoreDraft(draft: Draft): Promise<string[]> {
    const { doc: d, report } = await draftDoc(draft);
    // If this project was saved to a file before, keep saving to that file.
    const recent = await getRecent(draft.id).catch(() => undefined);
    await load(d, { handle: recent?.handle ?? null, saved: !!recent, dirty: draft.dirty });
    return report;
  }

  async function discardDraft(draft: Draft) {
    await removeDraft(draft.id).catch(() => {});
  }

  /** Apply an edit. `fn` gets a copy and returns the new document (or mutates the copy). */
  const history = createHistory();
  const canUndo = ref(false);
  const canRedo = ref(false);
  const syncHistory = () => {
    canUndo.value = history.canUndo;
    canRedo.value = history.canRedo;
  };

  function touched() {
    revision.value++;
    autosave.changed();
    syncHistory();
  }

  /**
   * Apply an edit as an Immer recipe: mutate the draft, or return a replacement document.
   * Every change is one undo step; changes with the same `coalesce` key within 1 s merge.
   */
  function change(
    recipe: (d: ImmerDraft<RrqDoc>) => RrqDoc | void,
    opts: { coalesce?: string } = {},
  ) {
    if (!doc.value || readOnly.value) return;
    const lib = useLibraryStore().lookup;
    // Library items embed when used and leave when unused, in the same undo step (spec 008).
    const [next, patches, inverse] = produceWithPatches(doc.value, (d) => {
      const r = recipe(d);
      if (r) return syncLibraryItems(r, lib);
      syncDraft(d, lib);
    });
    if (!patches.length) return;
    doc.value = next;
    history.record(patches, inverse, opts.coalesce);
    touched();
  }

  function undo() {
    if (!doc.value || readOnly.value) return;
    const prev = history.undo(doc.value);
    if (prev) {
      doc.value = prev;
      touched();
    }
  }

  function redo() {
    if (!doc.value || readOnly.value) return;
    const next = history.redo(doc.value);
    if (next) {
      doc.value = next;
      touched();
    }
  }

  async function afterSave(h: FileSystemFileHandle | null) {
    handle.value = h;
    savedOnce.value = true;
    savedRevision.value = revision.value;
    autosave.dispose();
    const d = doc.value!;
    await markDraftClean(d.project.id).catch(() => {});
    await rememberRecent({
      id: d.project.id,
      name: d.project.name,
      openedAt: Date.now(),
      ...(h ? { handle: h } : {}),
    }).catch(() => {});
  }

  /** Give my own items current versions/revisions before writing them out (spec 008). */
  async function stamp() {
    if (doc.value) doc.value = freeze(await stampVersions(doc.value), true);
  }
  /** The file's text: fabric images per spec 014, and the libraries the project uses. */
  const fileText = () => textOf(doc.value!);
  async function textOf(d: RrqDoc) {
    const refs = libraryRefs(d, useLibraryStore().whereOf);
    const { libraries: _old, ...rest } = d.project;
    void _old;
    const withRefs = { ...d, project: refs.length ? { ...rest, libraries: refs } : rest };
    return serializeProject(await prepareForSave(withRefs, useSettingsStore().settings.saveSize));
  }

  /** Writing a file (not while a save dialog is open: some never report a cancel). */
  const writing = ref(false);
  async function write(h: FileSystemFileHandle | null, text: string) {
    writing.value = true;
    try {
      if (h) await writeToHandle(h, text);
      else download(doc.value!.project.name, text);
      await afterSave(h);
    } finally {
      writing.value = false;
    }
  }

  async function save(): Promise<SaveResult> {
    if (!doc.value || readOnly.value) return 'cancelled';
    await stamp();
    if (handle.value && (await ensurePermission(handle.value, 'readwrite'))) {
      await write(handle.value, await fileText());
      return 'saved';
    }
    return saveAs();
  }

  async function saveAs(): Promise<SaveResult> {
    if (!doc.value || readOnly.value) return 'cancelled';
    await stamp();
    const text = await fileText();
    if (supportsFileAccess()) {
      const h = await pickSaveHandle(doc.value.project.name);
      if (!h) return 'cancelled';
      await write(h, text);
      return 'saved';
    }
    await write(null, text);
    return 'downloaded';
  }

  /** Export one quilt as a project file of its own (just that quilt and what it uses). */
  async function exportQuilt(quiltId: string) {
    const d = doc.value && quiltProject(doc.value, quiltId, newId());
    if (d) await exportFile(d.project.name, await textOf(d), 'rrq');
  }

  /** Save as a separate project (new id) and continue editing the copy. */
  async function saveCopy(): Promise<SaveResult> {
    if (!doc.value) return 'cancelled';
    const copy = structuredClone(doc.value);
    copy.project.id = newId();
    copy.project.name = `${copy.project.name} (copy)`;
    await load(copy, { saved: false, dirty: true });
    return saveAs();
  }

  /** "Continue here anyway": move editing of this project to this tab. */
  async function continueHere(): Promise<{ holderAnswered: boolean }> {
    if (!doc.value) return { holderAnswered: false };
    const id = doc.value.project.id;
    const r = await takeOverEditLock(id, onLost);
    lock = r.lock;
    const draft = await getDraft(id).catch(() => undefined);
    // Written by the other tab, maybe an older app version: brought up to date like any draft.
    const fresh = draft && (await draftDoc(draft).catch(() => undefined));
    if (draft && fresh) {
      doc.value = freeze(fresh.doc, true);
      if (draft.dirty) revision.value = savedRevision.value + 1;
    }
    readOnly.value = false;
    lostToOtherTab.value = false;
    history.clear();
    syncHistory();
    return { holderAnswered: r.holderAnswered };
  }

  /** Close the open project. Unsaved work stays in its draft for restoring later. */
  function close(): Promise<void> {
    history.clear();
    syncHistory();
    autosave.dispose();
    const released = lock?.release() ?? Promise.resolve();
    lock = null;
    doc.value = null;
    handle.value = null;
    mismatches.value = [];
    return released;
  }

  // Never lose more than a moment of work when the tab goes away.
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void autosave.flush();
    });
    window.addEventListener('pagehide', () => void autosave.flush());
    window.addEventListener('beforeunload', (e) => {
      // Write the draft now: Firefox aborts IndexedDB writes started later, during pagehide.
      void autosave.flush();
      if (dirty.value && !readOnly.value) e.preventDefault();
    });
  }

  /**
   * Switch the chosen items to their library version (one undo step). The project's copies are
   * kept as the user's own items unless `deleteCopies`.
   */
  function useLibraryVersions(ids: string[], deleteCopies = false) {
    const lib = useLibraryStore().lookup;
    if (!doc.value || !ids.length) return void (mismatches.value = []);
    const me = useSettingsStore().settings.author;
    let next = doc.value;
    for (const m of mismatches.value.filter((x) => ids.includes(x.project.id))) {
      if (!deleteCopies) next = keepAsMine(next, m.kind, m.project.id, itemId(me));
      next =
        m.kind === 'block'
          ? swapToLibraryVersion(next, m.library as Block, lib)
          : produce(next, (x) => {
              const i = x.project.palette.colors.findIndex((c) => c.id === m.project.id);
              x.project.palette.colors[i] = m.library as Color;
            });
    }
    change(() => next);
    mismatches.value = [];
  }

  return {
    doc,
    handle,
    writing,
    mismatches,
    useLibraryVersions,
    isOpen,
    dirty,
    status,
    readOnly,
    lostToOtherTab,
    newProject,
    openFile,
    openRecent,
    restoreDraft,
    discardDraft,
    change,
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    saveAs,
    saveCopy,
    exportQuilt,
    continueHere,
    close,
  };
});
