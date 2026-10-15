// Fabric images for drawing (spec 014): decoded once per hash from the device image store, drawn as
// patterns at true scale. Drawing is synchronous; an image not decoded yet draws as its stand-in
// (average color) or blank, and `imagesTick` changes when images arrive so views redraw.
import { shallowRef } from 'vue';
import type { Fill } from '@/model/schema/coloring';
import type { Fabric } from '@/model/schema/palette';
import { getImage, storeEmbedded } from '@/storage/images';

export type FabricMode = 'standins' | 'blank' | 'colors';
/** Set from settings (`fabricImages`, `imageSize`). */
export const display = { mode: 'standins' as FabricMode, size: 512 };

/** Bumped as images finish decoding; reading it in a render makes that render redraw then. */
export const imagesTick = shallowRef(0);

type Entry = ImageBitmap | null | Promise<void>; // null: not available
const bitmaps = new Map<string, Entry>();

/** The image to show for a fabric: its standard size closest to (not above) the screen size. */
export function imageFor(f: Fabric, px = display.size) {
  const sizes = [...(f.sizes ?? [])].sort((a, b) => a.px - b.px);
  const fit = sizes.filter((s) => s.px <= px).at(-1) ?? sizes[0];
  return fit?.sha256 ?? f.image.sha256;
}

async function load(sha: string, f: Fabric) {
  try {
    let row = await getImage(sha);
    if (!row && f.image.sha256 === sha && f.image.data && (await storeEmbedded(f.image)))
      row = await getImage(sha);
    if (!row) return void bitmaps.set(sha, null);
    bitmaps.set(sha, await createImageBitmap(new Blob([row.bytes], { type: row.type })));
    imagesTick.value++;
  } catch {
    bitmaps.set(sha, null);
  }
}

/** The decoded image, or undefined while loading / when missing / when images are off. */
export function bitmap(f: Fabric): ImageBitmap | undefined {
  void imagesTick.value; // track
  if (display.mode === 'colors') return undefined;
  const sha = imageFor(f);
  const b = bitmaps.get(sha);
  if (b === undefined) bitmaps.set(sha, load(sha, f));
  return b && !(b instanceof Promise) ? b : undefined;
}

const urls = new Map<string, string | null | Promise<void>>();

/** An object URL of the fabric's image (for swatches in lists), or undefined until it loads. */
export function fabricUrl(f: Fabric, px = 256): string | undefined {
  void imagesTick.value; // track
  if (display.mode === 'colors') return undefined;
  const sha = imageFor(f, px);
  const u = urls.get(sha);
  if (u === undefined)
    urls.set(
      sha,
      (async () => {
        try {
          let row = await getImage(sha);
          if (!row && f.image.sha256 === sha && f.image.data && (await storeEmbedded(f.image)))
            row = await getImage(sha);
          urls.set(
            sha,
            row ? URL.createObjectURL(new Blob([row.bytes], { type: row.type })) : null,
          );
          imagesTick.value++;
        } catch {
          urls.set(sha, null);
        }
      })(),
    );
  return typeof u === 'string' ? u : undefined;
}

/** CSS for a fabric swatch: its image over its average color. */
export function swatchStyle(f: Fabric) {
  const u = fabricUrl(f);
  return {
    backgroundColor: `rgb(${f.average.join(',')})`,
    ...(u ? { backgroundImage: `url(${u})`, backgroundSize: 'cover' } : {}),
  };
}

/** Try images that weren't available again (e.g. after a library pack is turned on). */
export function retryMissing() {
  for (const [k, v] of bitmaps) if (v === null) bitmaps.delete(k);
  for (const [k, v] of urls) if (v === null) urls.delete(k);
  imagesTick.value++;
}

const average = (f: Fabric) => `rgb(${f.average.join(',')})`;
const patterns = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasPattern | null>>();

/**
 * Fill style for a fabric in `ctx`'s current transform. `devicePerUnit`: device pixels per real
 * unit (inch or cm) for this drawing, so the print keeps its true size however the block is scaled.
 */
export function fabricFill(
  ctx: CanvasRenderingContext2D,
  f: Fabric,
  fill: Extract<Fill, { fabric: string }> | undefined,
  devicePerUnit: number,
): string | CanvasPattern {
  const bmp = bitmap(f);
  if (!bmp) return display.mode === 'blank' ? 'rgba(0,0,0,0)' : average(f);
  let byCtx = patterns.get(ctx);
  if (!byCtx) patterns.set(ctx, (byCtx = new Map()));
  const sha = imageFor(f);
  let p = byCtx.get(sha);
  if (p === undefined) byCtx.set(sha, (p = ctx.createPattern(bmp, 'repeat')));
  if (!p) return average(f);
  const m = ctx.getTransform();
  const k = devicePerUnit / Math.hypot(m.a, m.b); // current user units per real unit, inverted
  p.setTransform(
    new DOMMatrix()
      .translateSelf(fill?.offset[0] ?? 0, fill?.offset[1] ?? 0)
      .rotateSelf(fill?.rotation ?? 0)
      .scaleSelf((f.size[0] / bmp.width) * k, (f.size[1] / bmp.height) * k),
  );
  return p;
}
