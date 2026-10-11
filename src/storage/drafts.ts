// Crash-recovery drafts of open projects. A draft is not a save: the .rrq file is the user's copy.
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
