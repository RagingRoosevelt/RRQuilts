// Libraries on this device (spec 011): My library and each installed pack, one record each.
import type { LibraryDoc } from '@/model/schema/library';
import { idb } from './idb';

interface Row {
  id: string;
  doc: LibraryDoc;
}
const MINE = 'mine';

export async function loadLibraries() {
  const rows = await idb.getAll<Row>('libraries');
  return {
    mine: rows.find((r) => r.id === MINE)?.doc,
    packs: rows.filter((r) => r.id.startsWith('pack:')).map((r) => r.doc),
  };
}
export const putMine = (doc: LibraryDoc) => idb.put<Row>('libraries', { id: MINE, doc });
export const putPack = (doc: LibraryDoc) =>
  idb.put<Row>('libraries', { id: `pack:${doc.id}`, doc });
export const deletePack = (id: string) => idb.delete('libraries', `pack:${id}`);
