// The open project: in-memory document, file link, save status, crash-recovery draft, and the
// one-editing-tab lock. All edits go through `change()`.
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { parseProject, serializeProject } from '@/model/io';
import { newId } from '@/model/ids';
import { createProject } from '@/model/new-project';
import type { RrqDoc } from '@/model/schema/project';
import { createAutosave } from '@/session/autosave';
import {
  acquireEditLock,
  answerFlushRequests,
  takeOverEditLock,
  type HeldLock,
} from '@/session/tab-lock';
import { getDraft, markDraftClean, putDraft, removeDraft, type Draft } from '@/storage/drafts';
import {
  download,
  ensurePermission,
  saveWithPicker,
  supportsFileAccess,
  writeToHandle,
  type Picked,
} from '@/storage/files';
import { forgetRecent, getRecent, rememberRecent, type RecentEntry } from '@/storage/recent';

export type SaveStatus = 'none' | 'new' | 'saved' | 'unsaved' | 'unsaved-no-draft' | 'read-only';
export type SaveResult = 'saved' | 'downloaded' | 'cancelled';

const APP = import.meta.env.QCLI_APP_VERSION ?? 'dev';

export const useProjectStore = defineStore('project', () => {
  const doc = shallowRef<RrqDoc | null>(null);
  const handle = shallowRef<FileSystemFileHandle | null>(null);
  const savedOnce = ref(false);
  const revision = ref(0);
  const savedRevision = ref(0);
  const draftOk = ref(true);
  const readOnly = ref(false);
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

  async function writeDraft() {
    if (!doc.value || readOnly.value) return;
    try {
      await putDraft(doc.value, dirty.value);
      draftOk.value = true;
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
    close();
    doc.value = next;
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

  const newProject = (name?: string) =>
    load(createProject(name, undefined, APP), { saved: false, dirty: false });

  /** Open a file; returns problems found while loading (shown to the user). */
  async function openFile(picked: Picked): Promise<string[]> {
    const r = await parseProject(await picked.file.text());
    if (!r.ok) throw new Error(r.error);
    await load(r.doc, { handle: picked.handle ?? null, saved: true, dirty: false });
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

  async function restoreDraft(draft: Draft) {
    // If this project was saved to a file before, keep saving to that file.
    const recent = await getRecent(draft.id).catch(() => undefined);
    await load(draft.doc, { handle: recent?.handle ?? null, saved: !!recent, dirty: true });
  }

  async function discardDraft(draft: Draft) {
    await removeDraft(draft.id).catch(() => {});
  }

  /** Apply an edit. `fn` gets a copy and returns the new document (or mutates the copy). */
  function change(fn: (d: RrqDoc) => RrqDoc | void) {
    if (!doc.value || readOnly.value) return;
    const copy = structuredClone(doc.value);
    doc.value = fn(copy) ?? copy;
    revision.value++;
    autosave.changed();
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

  async function save(): Promise<SaveResult> {
    if (!doc.value || readOnly.value) return 'cancelled';
    if (handle.value && (await ensurePermission(handle.value, 'readwrite'))) {
      await writeToHandle(handle.value, serializeProject(doc.value));
      await afterSave(handle.value);
      return 'saved';
    }
    return saveAs();
  }

  async function saveAs(): Promise<SaveResult> {
    if (!doc.value || readOnly.value) return 'cancelled';
    const text = serializeProject(doc.value);
    if (supportsFileAccess()) {
      const h = await saveWithPicker(doc.value.project.name, text);
      if (!h) return 'cancelled';
      await afterSave(h);
      return 'saved';
    }
    download(doc.value.project.name, text);
    await afterSave(null);
    return 'downloaded';
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
    if (draft) {
      doc.value = draft.doc;
      if (draft.dirty) revision.value = savedRevision.value + 1;
    }
    readOnly.value = false;
    lostToOtherTab.value = false;
    return { holderAnswered: r.holderAnswered };
  }

  /** Close the open project. Unsaved work stays in its draft for restoring later. */
  function close() {
    autosave.dispose();
    lock?.release();
    lock = null;
    doc.value = null;
    handle.value = null;
  }

  // Never lose more than a moment of work when the tab goes away.
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void autosave.flush();
    });
    window.addEventListener('pagehide', () => void autosave.flush());
    window.addEventListener('beforeunload', (e) => {
      if (dirty.value && !readOnly.value) e.preventDefault();
    });
  }

  return {
    doc,
    handle,
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
    save,
    saveAs,
    saveCopy,
    continueHere,
    close,
  };
});
