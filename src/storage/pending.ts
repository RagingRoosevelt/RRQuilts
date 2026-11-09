// Data entered for a project that isn't open, waiting on the device until the project next opens
// (spec 041). One record per project.
import { mergePatch, type PendingData, type QuiltPatch } from '@/model/data-pending';
import { idb } from './idb';

export const getPending = (id: string) => idb.get<PendingData>('pending', id);

export async function putPending(id: string, quiltId: string, patch: QuiltPatch) {
  const old = await getPending(id);
  const quilts = { ...old?.quilts, [quiltId]: mergePatch(old?.quilts[quiltId], patch) };
  await idb.put<PendingData>('pending', { id, quilts, updatedAt: Date.now() });
}

export const removePending = (id: string) => idb.delete('pending', id);

export async function allPending(): Promise<PendingData[]> {
  return idb.getAll<PendingData>('pending');
}
