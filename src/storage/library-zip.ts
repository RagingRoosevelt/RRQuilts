// Zipped `.rrqlib` files (spec 002 FR-053, spec 014): a library's `library.json` index and its packs
// (or one `rrqlib.json`), with fabric images as files beside each pack. Images are checked against
// their hashes and kept in the device image store, a library's only for the packs chosen.
import { itemFabrics } from '@/model/library';
import { parseLibraryValue } from '@/model/library-file';
import type { LibraryBackup, LibraryDoc } from '@/model/schema/library';
import type { Fabric } from '@/model/schema/palette';
import { readZip, writeZip, type ZipEntry } from '@/model/zip';
import { getImage, imageIds, putImage } from './images';
import type { LibraryIndex } from './repositories';

export interface ZippedLibrary {
  /** The library, when the zip has an index. */
  library?: { id: string; name: string };
  /** The zip's index as written (its packs, and the repository it came from, if it says). */
  index?: LibraryIndex;
  /** A My library backup (with its images now stored), for the restore dialog. */
  backup?: LibraryBackup;
  packs: LibraryDoc[];
  /** Problems with single packs (the rest loaded). */
  skipped: string[];
  /** Keep these packs' images (checked against their hashes); returns the ones that didn't match. */
  storeImages: (packIds: string[]) => Promise<string[]>;
  /** Installed packs' images, compared with this device (one read of its image list). */
  imageCheck: (packIds: string[]) => Promise<Record<string, ImageCheck>>;
}

export interface ImageCheck {
  /** The largest image size the zip carries for the pack, and the largest this device holds. */
  filePx: number;
  havePx: number;
  /** Images the zip has, at sizes this device holds, that it lacks. */
  holes: number;
}

/** Whether these bytes are a zip (vs. a JSON `.rrqlib`). */
export const isZip = (b: Uint8Array) =>
  b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;

type ImageSize = NonNullable<Fabric['sizes']>[number];

const json = (e: ZipEntry | undefined): unknown =>
  e ? JSON.parse(new TextDecoder().decode(e.bytes)) : undefined;

export async function readLibraryZip(bytes: Uint8Array<ArrayBuffer>): Promise<ZippedLibrary> {
  const entries = await readZip(bytes);
  const byName = new Map(entries.map((e) => [e.name, e]));
  const index = json(byName.get('library.json')) as
    | (Partial<Omit<LibraryIndex, 'packs'>> & { packs?: { path?: string; name?: string }[] })
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
  const images = new Map<string, { e: ZipEntry; s: ImageSize; label: string }[]>();
  async function storeImages(packIds: string[]) {
    const bad: string[] = [];
    for (const id of packIds)
      for (const { e, s, label } of images.get(id) ?? []) {
        const sha = await putImage(e.bytes, { type: s.type, width: s.width, height: s.height });
        if (sha !== s.sha256) bad.push(`${label}: image doesn't match`);
      }
    return bad;
  }
  const docs = new Map<string, LibraryDoc>();
  async function imageCheck(packIds: string[]) {
    const here = new Set((await imageIds()).map(String));
    const out: Record<string, ImageCheck> = {};
    for (const id of packIds) {
      const doc = docs.get(id);
      if (!doc) continue;
      const sizes = doc.items.flatMap((i) => itemFabrics(i).flatMap((f) => f.sizes ?? []));
      const havePx = Math.max(0, ...sizes.filter((s) => here.has(s.sha256)).map((s) => s.px));
      const inZip = (images.get(id) ?? []).map((x) => x.s);
      out[id] = {
        filePx: Math.max(0, ...inZip.map((s) => s.px)),
        havePx,
        holes: inZip.filter((s) => s.px <= havePx && !here.has(s.sha256)).length,
      };
    }
    return out;
  }
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
    // Images beside the document (a backup's packs too), stored once chosen.
    for (const d of [r.doc, ...(r.doc.packs ?? [])])
      for (const item of d.items) {
        for (const f of itemFabrics(item))
          for (const s of f.sizes ?? []) {
            const e = s.path && byName.get(dir + s.path);
            if (!e) continue; // a size this zip doesn't carry (e.g. 1024 in a Standard zip)
            const list = images.get(d.id) ?? [];
            images.set(d.id, [...list, { e, s, label: `${d.name}: ${f.notecard.name}` }]);
          }
      }
    if (r.doc.kind === 'personal') {
      await storeImages([r.doc.id, ...(r.doc.packs ?? []).map((p) => p.id)]).then((bad) =>
        skipped.push(...bad),
      );
      return { packs: [], backup: r.doc, skipped, storeImages, imageCheck };
    }
    packs.push(library ? { ...r.doc, library } : r.doc);
    docs.set(r.doc.id, r.doc);
  }
  return {
    ...(library ? { library, index: index as LibraryIndex } : {}),
    packs,
    skipped,
    storeImages,
    imageCheck,
  };
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
        if (!itemFabrics(item).length) return item;
        const fabrics = await Promise.all(
          itemFabrics(item).map(async (f) => ({
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
        return item.type === 'colors'
          ? { ...item, data: { ...item.data, fabrics } }
          : { ...item, fabrics };
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
