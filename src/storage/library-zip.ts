// Zipped `.rrqlib` files (spec 002 FR-053, spec 014): a library's `library.json` index and its packs
// (or one `rrqlib.json`), with fabric images as files beside each pack. Images are checked against
// their hashes and kept in the device image store; packs come back ready to install.
import { parseLibraryValue } from '@/model/library-file';
import type { LibraryBackup, LibraryDoc } from '@/model/schema/library';
import { readZip, writeZip, type ZipEntry } from '@/model/zip';
import { getImage, putImage } from './images';

export interface ZippedLibrary {
  /** The library, when the zip has an index. */
  library?: { id: string; name: string };
  /** A My library backup (with its images now stored), for the restore dialog. */
  backup?: LibraryBackup;
  packs: LibraryDoc[];
  /** Problems with single packs or images (the rest loaded). */
  skipped: string[];
}

/** Whether these bytes are a zip (vs. a JSON `.rrqlib`). */
export const isZip = (b: Uint8Array) =>
  b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;

const json = (e: ZipEntry | undefined): unknown =>
  e ? JSON.parse(new TextDecoder().decode(e.bytes)) : undefined;

export async function readLibraryZip(bytes: Uint8Array<ArrayBuffer>): Promise<ZippedLibrary> {
  const entries = await readZip(bytes);
  const byName = new Map(entries.map((e) => [e.name, e]));
  const index = json(byName.get('library.json')) as
    | { format?: string; id?: string; name?: string; packs?: { path?: string; name?: string }[] }
    | undefined;
  const skipped: string[] = [];
  let paths: string[];
  let library: ZippedLibrary['library'];
  if (index) {
    if (
      index.format !== 'rrqlib-index' ||
      typeof index.id !== 'string' ||
      !Array.isArray(index.packs)
    )
      throw new Error('This zip’s library.json isn’t an RRQuilts library index.');
    library = { id: index.id, name: typeof index.name === 'string' ? index.name : index.id };
    paths = index.packs.flatMap((p) => (typeof p.path === 'string' ? [p.path] : []));
  } else if (byName.has('rrqlib.json')) paths = ['rrqlib.json'];
  else throw new Error('This zip has no library.json or rrqlib.json.');

  const packs: LibraryDoc[] = [];
  for (const path of paths) {
    const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
    let raw: unknown;
    try {
      raw = json(byName.get(path));
    } catch {
      skipped.push(`${path}: not valid JSON`);
      continue;
    }
    if (!raw) {
      skipped.push(`${path}: missing from the zip`);
      continue;
    }
    const r = parseLibraryValue(raw);
    if (!r.ok) {
      skipped.push(`${path}: ${r.error}`);
      continue;
    }
    skipped.push(...r.skipped.map((s) => `${r.doc.name}: ${s}`));
    // Images beside the document, checked against the hashes it declares (a backup's packs too).
    for (const d of [r.doc, ...(r.doc.packs ?? [])])
      for (const item of d.items) {
        if (item.type !== 'colors') continue;
        for (const f of item.data.fabrics ?? [])
          for (const s of f.sizes ?? []) {
            const e = s.path && byName.get(dir + s.path);
            if (!e) continue; // a size this zip doesn't carry (e.g. 1024 in a Standard zip)
            const sha = await putImage(e.bytes, { type: s.type, width: s.width, height: s.height });
            if (sha !== s.sha256)
              skipped.push(`${d.name}: ${f.notecard.name}: image doesn't match`);
          }
      }
    if (r.doc.kind === 'personal') return { packs: [], backup: r.doc, skipped };
    packs.push(library ? { ...r.doc, library } : r.doc);
  }
  return { ...(library ? { library } : {}), packs, skipped };
}

const EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

/**
 * A library document with its fabric images as a zip (`rrqlib.json` + `images/`), or undefined when
 * it has no fabric images on this device (then plain JSON is enough).
 */
export async function writeLibraryZip(
  doc: LibraryBackup,
  serialize: (d: LibraryBackup) => string,
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  const images = new Map<string, ZipEntry>();
  const withPaths = async (d: LibraryDoc): Promise<LibraryDoc> => ({
    ...d,
    items: await Promise.all(
      d.items.map(async (item) => {
        if (item.type !== 'colors' || !item.data.fabrics?.length) return item;
        const fabrics = await Promise.all(
          item.data.fabrics.map(async (f) => ({
            ...f,
            sizes: await Promise.all(
              (f.sizes ?? []).map(async (s) => {
                const row = await getImage(s.sha256);
                if (!row) return s;
                const path = `images/${s.sha256}.${EXT[row.type] ?? 'img'}`;
                images.set(path, { name: path, bytes: new Uint8Array(row.bytes) });
                return { ...s, path };
              }),
            ),
          })),
        );
        return { ...item, data: { ...item.data, fabrics } };
      }),
    ),
  });
  const out: LibraryBackup = {
    ...(await withPaths(doc)),
    ...(doc.packs ? { packs: await Promise.all(doc.packs.map(withPaths)) } : {}),
  };
  if (!images.size) return undefined;
  const json = new TextEncoder().encode(serialize(out));
  return writeZip([{ name: 'rrqlib.json', bytes: json }, ...images.values()]);
}
