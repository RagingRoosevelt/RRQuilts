// Crash-recovery drafts of open projects. A draft is not a save: the .rrq file is the user's copy.
import { parseProject } from '@/model/io';
import type { RrqDoc } from '@/model/schema/project';
import { idb } from './idb';

export interface Draft {
  id: string;
  name: string;
  savedAt: number;
  /** True when the draft has changes not yet saved to a file. */
  dirty: boolean;
  doc: RrqDoc;
}

export const putDraft = (doc: RrqDoc, dirty: boolean, now = Date.now()) =>
  idb.put<Draft>('drafts', {
    id: doc.project.id,
    name: doc.project.name,
    savedAt: now,
    dirty,
    doc,
  });

export const getDraft = (id: string) => idb.get<Draft>('drafts', id);

/**
 * A draft's document, brought up to the current format the way a file is (migrations, then the
 * same checks), so drafts written by an older app version still open. Throws (the draft is kept)
 * when it can't be read; `report` lists problems found, as for a file.
 */
export async function draftDoc(d: Draft): Promise<{ doc: RrqDoc; report: string[] }> {
  const r = await parseProject(JSON.stringify(d.doc));
  if (!r.ok) throw new Error(`Couldn't open the unsaved changes of “${d.name}”: ${r.error}`);
  return { doc: r.doc, report: r.report };
}

export async function markDraftClean(id: string) {
  const d = await getDraft(id);
  if (d) await idb.put<Draft>('drafts', { ...d, dirty: false });
}

export const removeDraft = (id: string) => idb.delete('drafts', id);

/** Drafts with unsaved work, newest first (what the restore prompt offers). */
export async function unsavedDrafts(): Promise<Draft[]> {
  return (await idb.getAll<Draft>('drafts'))
    .filter((d) => d.dirty)
    .sort((a, b) => b.savedAt - a.savedAt);
}
