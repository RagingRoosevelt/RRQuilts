// Fabric images when projects are written and read (spec 014 FR-030/031, constitution IV): the
// user's own fabrics are embedded at the save size; library fabrics are referenced, embedded at
// 256 px only when the project asks to include them and their license allows sharing.
import { noSharing } from '@/model/credits';
import { isLibraryItem } from '@/model/library-items';
import type { Fabric } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Asset } from '@/model/schema/shared';
import { getImage, storeEmbedded } from './images';

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

/** The document as written to a file. */
export async function prepareForSave(doc: RrqDoc, saveSize: number): Promise<RrqDoc> {
  const include = !!doc.project.includeLibraryImages;
  const fabrics = await Promise.all(
    doc.project.palette.fabrics.map(async (f): Promise<Fabric> => {
      if (isLibraryItem(f)) {
        const share = include && !noSharing(f.license ?? f.source?.license);
        return { ...f, image: share ? await embedded(imageAt(f, 256)) : ref(f.image) };
      }
      return { ...f, image: await embedded(imageAt(f, saveSize)) };
    }),
  );
  return { ...doc, project: { ...doc.project, palette: { ...doc.project.palette, fabrics } } };
}

/** After opening: embedded images go into the store, and leave the in-memory document. */
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
