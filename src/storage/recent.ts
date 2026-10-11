// Recently opened projects. File handles are stored where the browser supports them so a project
// can be reopened without picking the file again (after a permission prompt).
import { idb } from './idb';

export interface RecentEntry {
  id: string;
  name: string;
  openedAt: number;
  handle?: FileSystemFileHandle;
}

const MAX = 20;

export async function recentProjects(): Promise<RecentEntry[]> {
  return (await idb.getAll<RecentEntry>('recent')).sort((a, b) => b.openedAt - a.openedAt);
}

export async function rememberRecent(entry: RecentEntry) {
  await idb.put<RecentEntry>('recent', entry);
  const all = await recentProjects();
  for (const old of all.slice(MAX)) await idb.delete('recent', old.id);
}

export const getRecent = (id: string) => idb.get<RecentEntry>('recent', id);

export const forgetRecent = (id: string) => idb.delete('recent', id);
