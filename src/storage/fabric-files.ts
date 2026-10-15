// Fabric images when projects are written and read (spec 014 FR-030/031, constitution IV): the
// user's own fabrics are embedded at the save size; library fabrics are referenced, embedded at
// 256 px only when the project asks to include them and their license allows sharing.
import { noSharing } from '@/model/credits';
import { isLibraryItem } from '@/model/library-items';
import type { Fabric } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Asset } from '@/model/schema/shared';
import type { LibraryDoc } from '@/model/schema/library';
import type { Draft } from './drafts';
import { idb } from './idb';
import { getImage, pruneImages, storeEmbedded } from './images';

/** The image of `f` to save at `px`: its largest standard size up to `px`, else its main image. */
function imageAt(f: Fabric, px: number): Omit<Asset, 'data'> {
  const s = [...(f.sizes ?? [])]
    .sort((a, b) => a.px - b.px)
    .filter((x) => x.px <= px)
    .at(-1);
  return s ? { sha256: s.sha256, type: s.type, width: s.width, height: s.height } : f.image;
}

/** An asset as a reference (no embedded data). */
const ref = (a: Omit<Asset, 'data'>): Asset => ({
  sha256: a.sha256,
  type: a.type,
  ...(a.width ? { width: a.width } : {}),
  ...(a.height ? { height: a.height } : {}),
});

function toDataUri(bytes: ArrayBuffer, type: string) {
  const b = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < b.length; i += 0x8000)
    bin += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return `data:${type};base64,${btoa(bin)}`;
}

/** A fabric's image with its data (from the store), or the reference when the bytes aren't here. */
async function embedded(img: Asset): Promise<Asset> {
  const row = await getImage(img.sha256);
  if (!row) return img; // not on this device: keep what we have (a reference, or existing data)
  return { ...ref(img), data: toDataUri(row.bytes, row.type) };
}

/**
 * The image of `f` to save at `px`, embedded: its size for `px` if this device has it, else the
 * largest smaller one it has, else (`larger`) any it has: a file saved at 256 and saved again at 512
 * keeps its image rather than losing it. Else the reference.
 */
async function embeddedAt(f: Fabric, px: number, larger = true): Promise<Asset> {
  const sizes = [...(f.sizes ?? [])].sort((a, b) => a.px - b.px);
  const order = [
    ...sizes.filter((x) => x.px <= px).reverse(),
    ...(larger ? sizes.filter((x) => x.px > px) : []),
  ].map((x) => ({ sha256: x.sha256, type: x.type, width: x.width, height: x.height }));
  for (const a of larger || !sizes.length ? [...order, f.image] : order) {
    const e = await embedded(a);
    if (e.data) return e;
  }
  return f.image.data ? f.image : ref(imageAt(f, px));
}

/** The document as written to a file. */
export async function prepareForSave(doc: RrqDoc, saveSize: number): Promise<RrqDoc> {
  const include = !!doc.project.includeLibraryImages;
  const fabrics = await Promise.all(
    doc.project.palette.fabrics.map(async (f): Promise<Fabric> => {
      if (isLibraryItem(f)) {
        const share = include && !noSharing(f.license ?? f.source?.license);
        return { ...f, image: share ? await embeddedAt(f, 256, false) : ref(f.image) };
      }
      return { ...f, image: await embeddedAt(f, saveSize) };
    }),
  );
  return { ...doc, project: { ...doc.project, palette: { ...doc.project.palette, fabrics } } };
}

/** After opening: embedded images go into the store, and leave the in-memory document. */
/**
 * Fabrics with their images embedded at `px` (for a palette file shared on its own); fabrics whose
 * license forbids sharing keep a reference only.
 */
export function embedFabrics(fabrics: readonly Fabric[], px: number): Promise<Fabric[]> {
  return Promise.all(
    fabrics.map(async (f) =>
      noSharing(f.license ?? f.source?.license) ? f : { ...f, image: await embeddedAt(f, px) },
    ),
  );
}

/** Store fabrics' embedded images on this device; the fabrics keep references. */
export function absorbFabrics(fabrics: readonly Fabric[]): Promise<Fabric[]> {
  return Promise.all(
    fabrics.map(async (f) => {
      if (!f.image.data) return f;
      try {
        if (!(await storeEmbedded(f.image))) return f;
      } catch {
        return f;
      }
      return { ...f, image: ref(f.image) };
    }),
  );
}

export async function absorbImages(doc: RrqDoc): Promise<RrqDoc> {
  const fabrics = await Promise.all(
    doc.project.palette.fabrics.map(async (f) => {
      if (!f.image.data) return f;
      try {
        if (!(await storeEmbedded(f.image))) return f;
      } catch {
        return f; // storage unavailable: keep the data so the image still shows
      }
      return { ...f, image: ref(f.image) };
    }),
  );
  return { ...doc, project: { ...doc.project, palette: { ...doc.project.palette, fabrics } } };
}

/** Every image hash a fabric points at. */
const fabricShas = (f: Fabric) => [f.image.sha256, ...(f.sizes ?? []).map((s) => s.sha256)];

/**
 * Free the stored images nothing on this device uses any more: not the libraries `docs`, the open
 * `projects`, or any draft (spec 014). Run after removing a pack or disconnecting a library.
 */
export async function freeUnusedImages(docs: readonly LibraryDoc[], projects: readonly RrqDoc[]) {
  const keep = new Set<string>();
  for (const d of docs)
    for (const it of d.items)
      if (it.type === 'colors')
        for (const f of it.data.fabrics ?? []) fabricShas(f).forEach((s) => keep.add(s));
  const drafts = await idb.getAll<Draft>('drafts');
  for (const p of [...projects, ...drafts.map((d) => d.doc)])
    for (const f of p.project.palette.fabrics) fabricShas(f).forEach((s) => keep.add(s));
  await pruneImages(keep);
}
