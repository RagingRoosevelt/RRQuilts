// Data Quilts (spec 041): every data quilt this device knows (the open project, unsaved drafts,
// saved projects by file handle), read without opening them, and where data entered for one goes:
// the open project, its draft, or pending on the device until the project next opens.
import { defineStore } from 'pinia';
import { computed, ref, shallowReactive } from 'vue';
import { applyPending, mergePatch, type PendingData, type QuiltPatch } from '@/model/data-pending';
import { setBlockMade, setMade, setYear } from '@/model/data-quilt';
import type { DayMade } from '@/model/schema/data-quilt';
import type { RrqDoc } from '@/model/schema/project';
import { lockedProjects } from '@/session/tab-lock';
import { putDraft, unsavedDrafts, type Draft } from '@/storage/drafts';
import { dataQuiltsOf, forgetKnown, knownProjects } from '@/storage/known';
import { allPending, putPending } from '@/storage/pending';
import { canRead, readProjectDoc } from '@/storage/read-project';
import { useProjectStore } from './project';

/** Where a project's data goes: the open project, its unsaved draft, or pending on the device
 *  (a saved file, or a project open in another tab). */
export type DataWhere = 'open' | 'draft' | 'pending';

export interface DataCard {
  projectId: string;
  projectName: string;
  quiltId: string;
  quiltName: string;
  draft?: Draft;
  handle?: FileSystemFileHandle;
}

/** Today on this device, `YYYY-MM-DD`. */
export const todayKey = () => new Date().toLocaleDateString('en-CA');

export const useDataQuiltsStore = defineStore('data-quilts', () => {
  const project = useProjectStore();
  const cards = ref<DataCard[]>([]);
  /** Projects read this session (the file or draft as read). */
  const docs = shallowReactive(new Map<string, RrqDoc>());
  const pending = shallowReactive(new Map<string, PendingData>());
  /** Projects open in some tab (this one's included). */
  const locked = ref(new Set<string>());
  /** Files the browser doesn't let us read yet (a tap on Show asks). */
  const needsAsk = ref(new Set<string>());
  const failed = ref(new Map<string, string>());

  const openId = computed(() => (project.isOpen ? project.doc!.project.id : undefined));

  /** Rebuild the list: the open project, then drafts, then known files. */
  async function refresh() {
    const out: DataCard[] = [];
    const seen = new Set<string>();
    const add = (
      doc: { id: string; name: string },
      quilts: { id: string; name: string }[],
      x: Partial<DataCard>,
    ) => {
      if (seen.has(doc.id)) return;
      seen.add(doc.id);
      for (const q of quilts)
        out.push({
          projectId: doc.id,
          projectName: doc.name,
          quiltId: q.id,
          quiltName: q.name,
          ...x,
        });
    };
    if (project.isOpen) add(project.doc!.project, dataQuiltsOf(project.doc!), {});
    const [drafts, known, pend, held] = await Promise.all([
      unsavedDrafts().catch(() => []),
      knownProjects().catch(() => []),
      allPending().catch(() => []),
      lockedProjects().catch(() => new Set<string>()),
    ]);
    locked.value = held;
    pending.clear();
    for (const p of pend) pending.set(p.id, p);
    for (const d of drafts) {
      docs.set(d.id, d.doc);
      add(d.doc.project, dataQuiltsOf(d.doc), { draft: d });
    }
    const asks = new Set<string>();
    for (const k of known) {
      if (seen.has(k.id) || !k.handle) continue;
      add(k, k.quilts, { handle: k.handle });
      if (!docs.has(k.id)) {
        if (await canRead(k.handle)) await read(k.id, k.handle, false);
        else asks.add(k.id);
      }
    }
    needsAsk.value = asks;
    cards.value = out;
  }

  /** Read a saved project's file (`ask`: may prompt; call from a tap). */
  async function read(id: string, handle: FileSystemFileHandle, ask: boolean) {
    const r = await readProjectDoc({ handle, ask });
    const fails = new Map(failed.value);
    if (r.ok) {
      docs.set(id, r.doc);
      fails.delete(id);
      const asks = new Set(needsAsk.value);
      asks.delete(id);
      needsAsk.value = asks;
    } else if (r.why === 'gone') {
      await forgetKnown(id).catch(() => {});
      fails.set(id, 'The file was moved or deleted.');
    } else if (r.why === 'invalid') fails.set(id, r.error ?? 'The file could not be read.');
    failed.value = fails;
    return r.ok;
  }

  /** A project's document as Data Quilts shows it (pending data laid over). */
  function docOf(id: string): RrqDoc | undefined {
    if (id === openId.value) return project.doc!;
    const d = docs.get(id);
    return d && applyPending(d, pending.get(id));
  }

  const quiltOf = (c: Pick<DataCard, 'projectId' | 'quiltId'>) =>
    docOf(c.projectId)?.project.quilts.find((q) => q.id === c.quiltId);

  function whereOf(id: string): DataWhere {
    if (id === openId.value && !project.readOnly) return 'open';
    const draft = cards.value.find((c) => c.projectId === id)?.draft;
    return draft && !locked.value.has(id) ? 'draft' : 'pending';
  }

  async function forget(id: string) {
    await forgetKnown(id).catch(() => {});
    docs.delete(id);
    cards.value = cards.value.filter((c) => c.projectId !== id);
  }

  /** Apply a change to one quilt's data wherever it belongs. */
  async function write(c: DataCard, patch: QuiltPatch, coalesce?: string) {
    const id = c.projectId;
    const one = { quilts: { [c.quiltId]: patch } };
    const where = whereOf(id);
    if (where === 'open') {
      const base = project.doc!;
      project.change(() => applyPending(base, one), coalesce ? { coalesce } : {});
      return;
    }
    if (where === 'draft') {
      const next = applyPending(docs.get(id)!, one);
      docs.set(id, next);
      await putDraft(next, true);
      return;
    }
    await putPending(id, c.quiltId, patch);
    const old = pending.get(id);
    const quilts = { ...old?.quilts };
    quilts[c.quiltId] = mergePatch(quilts[c.quiltId], patch);
    pending.set(id, { id, quilts, updatedAt: Date.now() });
  }

  function setEntry(c: DataCard, date: string, slot: number, value: number | string | null) {
    const plan = quiltOf(c)?.data;
    if (!plan) return;
    const row = plan.slots.map((_, i) => plan.entries[date]?.[i] ?? null);
    row[slot] = value;
    return write(c, { entries: { [date]: row } }, `data:${c.quiltId}:entry:${date}:${slot}`);
  }

  function setMark(c: DataCard, date: string, part: keyof DayMade, on: boolean) {
    const plan = quiltOf(c)?.data;
    if (!plan) return;
    const day = setMade(plan, date, part, on, todayKey()).made?.[date] ?? null;
    return write(c, { made: { [date]: day } });
  }

  function setBlockMark(c: DataCard, n: number, on: boolean) {
    const plan = quiltOf(c)?.data;
    if (!plan) return;
    const at = setBlockMade(plan, n, on, todayKey()).blocksMade?.[n] ?? null;
    return write(c, { blocksMade: { [n]: at } });
  }

  function setStart(c: DataCard, year: number) {
    const plan = quiltOf(c)?.data;
    if (!plan) return;
    return write(c, { start: setYear(plan, year).start });
  }

  /** What the steps page prints: a document, a quilt, and days or block numbers. */
  const stepsInput = ref<{
    doc: RrqDoc;
    quiltId: string;
    days?: string[];
    numbers?: number[];
  } | null>(null);

  return {
    cards,
    needsAsk,
    failed,
    pending,
    refresh,
    read,
    docOf,
    quiltOf,
    whereOf,
    forget,
    setEntry,
    setMark,
    setBlockMark,
    setStart,
    stepsInput,
  };
});
