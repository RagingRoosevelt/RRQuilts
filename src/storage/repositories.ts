// Libraries connected from the web (spec 002 US3/US4, spec 014): a repository serving `library.json`
// (an index of packs) or a single `rrqlib.json`. Only the index is fetched on connect; a pack is
// downloaded when switched on. Everything fetched is untrusted: validated, and images hash-checked.
import { parseLibraryValue } from '@/model/library-file';
import type { LibraryDoc } from '@/model/schema/library';
import type { Links } from '@/model/schema/shared';
import { idb } from './idb';
import { getImage, putImage } from './images';

export interface IndexPack {
  id: string;
  name: string;
  kind?: string;
  path: string;
  items?: number;
  revision?: number;
  sizes?: Record<string, number>;
}
export interface LibraryIndex {
  format: 'rrqlib-index';
  version: number;
  id: string;
  name: string;
  description?: string;
  author?: { name: string; url?: string };
  license?: string;
  /** Home page, gallery and other pages (optional; not checked here, never followed by the app). */
  links?: Links;
  revision: number;
  changelog?: { revision: number; date: string; notes: string }[];
  packs: IndexPack[];
}
/** A connection, kept with the libraries (IndexedDB `libraries`, id `repo:<library id>`). */
export interface Connection {
  id: string;
  url: string;
  ref?: string;
  /** Where files are read from (raw file URL prefix, ending in `/`). */
  base: string;
  /** The index as of the pinned revision. */
  index: LibraryIndex;
  pinned: number;
  /** A newer revision the user declined. */
  declined?: number;
}

/** A repository web address → the prefix its raw files are served from. */
export function rawBase(url: string, ref?: string): string {
  const u = url
    .trim()
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
  const gh = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/.exec(u);
  if (gh) return `https://raw.githubusercontent.com/${gh[1]}/${gh[2]}/${ref || gh[3] || 'main'}/`;
  if (!/^https:\/\//.test(u)) throw new Error('Use an https:// address.');
  return u + '/';
}

const MAX_JSON = 20 * 1024 * 1024;
const MAX_IMAGE = 10 * 1024 * 1024;

async function fetchBytes(url: string, max: number) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw Object.assign(new Error(`${r.status} for ${url}`), { status: r.status });
  const b = new Uint8Array(await r.arrayBuffer());
  if (b.length > max) throw new Error(`${url} is too large.`);
  return b;
}
const fetchJson = async (url: string) =>
  JSON.parse(new TextDecoder().decode(await fetchBytes(url, MAX_JSON))) as unknown;

/** The library's index, or a one-pack index around a single `rrqlib.json`. */
export async function fetchIndex(base: string): Promise<LibraryIndex> {
  try {
    const raw = (await fetchJson(base + 'library.json')) as Partial<LibraryIndex>;
    if (raw.format !== 'rrqlib-index' || typeof raw.id !== 'string' || !Array.isArray(raw.packs))
      throw new Error('This library’s library.json isn’t an RRQuilts library index.');
    if ((raw.version ?? 1) > 1)
      throw new Error('This library is from a newer RRQuilts. Update the app.');
    return raw as LibraryIndex;
  } catch (e) {
    if ((e as { status?: number }).status !== 404) throw e;
  }
  let raw: unknown;
  try {
    raw = await fetchJson(base + 'rrqlib.json');
  } catch (e) {
    if ((e as { status?: number }).status !== 404) throw e;
    throw new Error(
      'No RRQuilts library at that address (no library.json). Check that the repository is ' +
        'public, its files are pushed, and the branch is right.',
      { cause: e },
    );
  }
  const single = parseLibraryValue(raw);
  if (!single.ok) throw new Error(single.error);
  const d = single.doc;
  return {
    format: 'rrqlib-index',
    version: 1,
    id: d.id,
    name: d.name,
    ...(d.author ? { author: d.author } : {}),
    ...(d.license ? { license: d.license } : {}),
    revision: d.revision,
    ...(d.changelog ? { changelog: d.changelog } : {}),
    packs: [{ id: d.id, name: d.name, path: 'rrqlib.json', revision: d.revision }],
  };
}

/** Download one pack and its images up to `px` (256 always), checked; returns it ready to install. */
/** A pack's document only (no images), checked: to see what an update would change. */
export async function fetchPackDoc(c: Connection, pack: IndexPack) {
  const r = parseLibraryValue(await fetchJson(c.base + pack.path));
  if (!r.ok) throw new Error(`${pack.name}: ${r.error}`);
  return r;
}

export async function fetchPack(
  c: Connection,
  pack: IndexPack,
  px: number,
): Promise<{ doc: LibraryDoc; skipped: string[] }> {
  const r = await fetchPackDoc(c, pack);
  const dir = pack.path.includes('/') ? pack.path.slice(0, pack.path.lastIndexOf('/') + 1) : '';
  const skipped = [...r.skipped];
  await fetchImages(c.base + dir, r.doc, (s) => s <= 256 || s <= px, skipped);
  return {
    doc: { ...r.doc, library: { id: c.index.id, name: c.index.name } },
    skipped,
  };
}

/** Fetch the images of `doc`'s fabrics whose size `want` accepts (missing ones only). */
export async function fetchImages(
  dirUrl: string,
  doc: LibraryDoc,
  want: (px: number) => boolean,
  skipped: string[] = [],
) {
  for (const item of doc.items) {
    if (item.type !== 'colors') continue;
    for (const f of item.data.fabrics ?? [])
      for (const s of f.sizes ?? []) {
        if (!want(s.px) || !s.path || s.path.includes('..') || (await getImage(s.sha256))) continue;
        try {
          const bytes = await fetchBytes(dirUrl + s.path, MAX_IMAGE);
          const sha = await putImage(bytes, { type: s.type, width: s.width, height: s.height });
          if (sha !== s.sha256) skipped.push(`${f.notecard.name}: image doesn't match`);
        } catch {
          skipped.push(`${f.notecard.name}: image couldn't be downloaded`);
        }
      }
  }
  return skipped;
}

export const loadConnections = async () =>
  (await idb.getAll<Connection & { id: string }>('libraries')).filter((r) =>
    r.id.startsWith('repo:'),
  );
export const putConnection = (c: Connection) =>
  idb.put<Connection>('libraries', { ...c, id: `repo:${c.index.id}` });
export const deleteConnection = (libraryId: string) => idb.delete('libraries', `repo:${libraryId}`);
