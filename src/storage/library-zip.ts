// Zipped `.rrqlib` files (spec 002 FR-053, spec 014): a library's `library.json` index and its packs
// (or one `rrqlib.json`), with fabric images as files beside each pack. Images are checked against
// their hashes and kept in the device image store; packs come back ready to install.
import { parseLibraryValue } from '@/model/library-file';
import type { LibraryDoc } from '@/model/schema/library';
import { readZip, type ZipEntry } from '@/model/zip';
import { putImage } from './images';

export interface ZippedLibrary {
  /** The library, when the zip has an index. */
  library?: { id: string; name: string };
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
    // Images beside the pack, checked against the hashes the pack declares.
    for (const item of r.doc.items) {
      if (item.type !== 'colors') continue;
      for (const f of item.data.fabrics ?? [])
        for (const s of f.sizes ?? []) {
          const e = s.path && byName.get(dir + s.path);
          if (!e) continue; // a size this zip doesn't carry (e.g. 1024 in a Standard zip)
          const sha = await putImage(e.bytes, { type: s.type, width: s.width, height: s.height });
          if (sha !== s.sha256)
            skipped.push(`${r.doc.name}: ${f.notecard.name}: image doesn't match`);
        }
    }
    packs.push(library ? { ...r.doc, library } : r.doc);
  }
  return { ...(library ? { library } : {}), packs, skipped };
}
