// Projects with data quilts this device has seen (spec 041): the Data Quilts list reads them from
// their file handle (or their draft) without opening them. Not capped, unlike the recent list.
import type { RrqDoc } from '@/model/schema/project';
import { idb } from './idb';

export interface KnownProject {
  id: string;
  name: string;
  handle?: FileSystemFileHandle;
  /** Its data quilts (switched on). */
  quilts: { id: string; name: string }[];
  /** Last opened or saved. */
  seenAt: number;
}

export const dataQuiltsOf = (doc: RrqDoc) =>
  doc.project.quilts.filter((q) => q.data?.on).map((q) => ({ id: q.id, name: q.notecard.name }));

/** Remember (or forget, when it has none) a project's data quilts. A known handle is kept when
 *  none is given (a draft of a saved project). */
export async function rememberKnown(doc: RrqDoc, handle?: FileSystemFileHandle | null) {
  const quilts = dataQuiltsOf(doc);
  const id = doc.project.id;
  if (!quilts.length) return idb.delete('known', id);
  const old = await idb.get<KnownProject>('known', id);
  const h = handle ?? old?.handle;
  await idb.put<KnownProject>('known', {
    id,
    name: doc.project.name,
    quilts,
    seenAt: Date.now(),
    ...(h ? { handle: h } : {}),
  });
}

export async function knownProjects(): Promise<KnownProject[]> {
  return (await idb.getAll<KnownProject>('known')).sort((a, b) => b.seenAt - a.seenAt);
}

export const forgetKnown = (id: string) => idb.delete('known', id);
