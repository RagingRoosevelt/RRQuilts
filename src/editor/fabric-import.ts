// Turning image files into fabrics (spec 014 FR-020): square crop, 256 and 512 px (never enlarged),
// WebP (JPEG where the browser can't write WebP), average color, stored by hash.
import type { Fabric, FabricImage } from '@/model/schema/palette';
import type { Units } from '@/model/schema/project';
import { putImage } from '@/storage/images';

export const IMPORT_SIZES = [256, 512] as const;
/** Unset sizes are 8 in square (spec 014 FR-004), marked approximate. */
export const DEFAULT_INCHES = 8;

/** Output sizes for a source image: each standard size, capped at the source's own long side. */
export function targetSizes(w: number, h: number, sizes: readonly number[] = IMPORT_SIZES) {
  const long = Math.max(w, h);
  const out: { px: number; width: number; height: number }[] = [];
  for (const s of sizes) {
    const px = Math.min(s, long);
    if (out.some((o) => o.px === px)) continue;
    const k = px / long;
    out.push({ px, width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) });
  }
  return out;
}

/** The centred square of a w × h image. */
export const squareCrop = (w: number, h: number) => {
  const s = Math.min(w, h);
  return { sx: Math.floor((w - s) / 2), sy: Math.floor((h - s) / 2), s };
};

/** Average color of RGBA pixels (alpha-weighted, transparent pixels ignored). */
export function averageOf(rgba: ArrayLike<number>): [number, number, number] {
  let r = 0, g = 0, b = 0, n = 0; // prettier-ignore
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const a = rgba[i + 3]! / 255;
    r += rgba[i]! * a;
    g += rgba[i + 1]! * a;
    b += rgba[i + 2]! * a;
    n += a;
  }
  return n ? [Math.round(r / n), Math.round(g / n), Math.round(b / n)] : [128, 128, 128];
}

/** Real-world size for an image with no size given: 8 in on its long side, in `units`. */
export function defaultSize(w: number, h: number, units: Units): [number, number] {
  const long = (units === 'cm' ? 2.54 : 1) * DEFAULT_INCHES;
  const k = long / Math.max(w, h);
  return [Math.round(w * k * 100) / 100, Math.round(h * k * 100) / 100];
}

/** "SGF-40300-Gilded-Ginko-Ice_500px.jpg" → { name: "Gilded Ginko Ice", sku: "SGF-40300" }. */
export function nameFromFile(file: string): { name: string; sku?: string } {
  let base = file
    .split('/')
    .pop()!
    .replace(/\.[a-z0-9]+$/i, '');
  base = base.replace(/[-_ ]?\d{2,4}px$/i, '');
  const sku = /^([A-Z]{1,6}-?\d{2,6}(?:-\d{1,4})?)(?=[-_ ]|$)/.exec(base)?.[1];
  const rest = (sku ? base.slice(sku.length) : base).replace(/[-_]+/g, ' ').trim();
  const name = rest.replace(/\s+/g, ' ') || sku || base;
  return sku ? { name, sku } : { name };
}

export interface ProcessedImage {
  name: string;
  sku?: string;
  /** Source pixel size after cropping. */
  width: number;
  height: number;
  average: [number, number, number];
  sizes: (FabricImage & { bytes: Uint8Array<ArrayBuffer> })[];
}

function canvasOf(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
const toBlob = (c: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob | null>((resolve) => c.toBlob(resolve, type, q));

/** Decode, crop, resize, and encode one image (browser only). Throws if it can't be read. */
export async function processImage(
  file: Blob,
  fileName: string,
  opts: { crop: boolean; rect?: { x: number; y: number; w: number; h: number } | undefined },
): Promise<ProcessedImage> {
  const bmp = await createImageBitmap(file);
  // A crop the user set (fractions of the image), else the centered square or the whole image.
  const r = opts.rect;
  const sq = squareCrop(bmp.width, bmp.height);
  const sx = r ? Math.round(r.x * bmp.width) : opts.crop ? sq.sx : 0;
  const sy = r ? Math.round(r.y * bmp.height) : opts.crop ? sq.sy : 0;
  const w = r ? Math.max(1, Math.round(r.w * bmp.width)) : opts.crop ? sq.s : bmp.width;
  const h = r ? Math.max(1, Math.round(r.h * bmp.height)) : opts.crop ? sq.s : bmp.height;
  const sizes: ProcessedImage['sizes'] = [];
  for (const t of targetSizes(w, h)) {
    const c = canvasOf(t.width, t.height);
    const g = c.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.drawImage(bmp, sx, sy, w, h, 0, 0, t.width, t.height);
    let blob = await toBlob(c, 'image/webp', 0.8);
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(c, 'image/jpeg', 0.85); // Safari
    if (!blob) throw new Error('This browser couldn’t encode the image.');
    sizes.push({
      ...t,
      type: blob.type,
      sha256: '',
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
  }
  const small = canvasOf(32, 32).getContext('2d')!;
  small.drawImage(bmp, sx, sy, w, h, 0, 0, 32, 32);
  bmp.close();
  return {
    ...nameFromFile(fileName),
    width: w,
    height: h,
    average: averageOf(small.getImageData(0, 0, 32, 32).data),
    sizes,
  };
}

/** Store a processed image's sizes and build the fabric (its main image is the largest size). */
export async function fabricFrom(
  p: ProcessedImage,
  opts: { id: string; name?: string; size?: [number, number]; units: Units; author?: string },
): Promise<Fabric> {
  const sizes: FabricImage[] = [];
  for (const { bytes, ...s } of p.sizes) sizes.push({ ...s, sha256: await putImage(bytes, s) });
  const main = sizes.at(-1)!;
  return {
    id: opts.id,
    notecard: { name: opts.name ?? p.name },
    ...(opts.author ? { author: opts.author } : {}),
    image: { sha256: main.sha256, type: main.type, width: main.width, height: main.height },
    size: opts.size ?? defaultSize(p.width, p.height, opts.units),
    ...(opts.size ? {} : { approximate: true as const }),
    average: p.average,
    ...(p.sku ? { sku: p.sku } : {}),
    sizes,
  };
}

/** Image files to import from a picked list (zips expanded, non-images skipped). */
export async function imageFiles(files: File[]): Promise<{ name: string; blob: Blob }[]> {
  const { readZip } = await import('@/model/zip');
  const out: { name: string; blob: Blob }[] = [];
  const isImage = (n: string) => /\.(jpe?g|png|webp)$/i.test(n);
  for (const f of files) {
    if (/\.zip$/i.test(f.name)) {
      for (const e of await readZip(new Uint8Array(await f.arrayBuffer())))
        if (isImage(e.name) && !e.name.startsWith('__MACOSX/'))
          out.push({ name: e.name, blob: new Blob([e.bytes]) });
    } else if (isImage(f.name)) out.push({ name: f.webkitRelativePath || f.name, blob: f });
  }
  return out;
}
