// Read a project without opening it (spec 041: the Data Quilts list). The open project is never
// touched.
import { parseProject } from '@/model/io';
import type { RrqDoc } from '@/model/schema/project';
import { draftDoc, type Draft } from './drafts';

export type ReadResult =
  { ok: true; doc: RrqDoc } | { ok: false; why: 'denied' | 'gone' | 'invalid'; error?: string };

/** May the file be read without asking? */
export async function canRead(handle: FileSystemFileHandle) {
  try {
    return (await handle.queryPermission?.({ mode: 'read' })) === 'granted';
  } catch {
    return false;
  }
}

/** A draft's document, or a file's (asks the browser's permission when `ask`; needs a tap). */
export async function readProjectDoc(
  from: { draft: Draft } | { handle: FileSystemFileHandle; ask: boolean },
): Promise<ReadResult> {
  try {
    if ('draft' in from) return { ok: true, doc: (await draftDoc(from.draft)).doc };
    const h = from.handle;
    const allowed =
      (await canRead(h)) ||
      (from.ask && (await h.requestPermission?.({ mode: 'read' })) === 'granted');
    if (!allowed) return { ok: false, why: 'denied' };
    const r = await parseProject(await (await h.getFile()).text());
    return r.ok ? { ok: true, doc: r.doc } : { ok: false, why: 'invalid', error: r.error };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') return { ok: false, why: 'gone' };
    return { ok: false, why: 'invalid', error: (e as Error).message };
  }
}
