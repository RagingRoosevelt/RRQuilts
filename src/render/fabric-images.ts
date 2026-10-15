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

/** Every image of `f`, best first for `px`: the fit, then smaller sizes, then larger ones. */
function candidates(f: Fabric, px: number) {
  const sizes = [...(f.sizes ?? [])].sort((a, b) => a.px - b.px);
  const below = sizes.filter((s) => s.px <= px).reverse();
  const above = sizes.filter((s) => s.px > px);
  return [...new Set([...below, ...above].map((s) => s.sha256).concat(f.image.sha256))];
}

/**
 * Downloads a missing fabric's images from where it came from (a connected library), if it can.
 * Set by the library store; resolves true when something was fetched.
 */
let fetchMissing: ((f: Fabric) => Promise<boolean>) | undefined;
export const setMissingFetcher = (fn: (f: Fabric) => Promise<boolean>) => (fetchMissing = fn);

/** How fabric images are doing on this device: loading now, and not found (by fabric id). */
export const imageStatus = shallowRef({ loading: 0, missing: [] as string[] });
const missing = new Map<string, Fabric>();
let loading = 0;
/** Images being fetched to replace a smaller stand-in (once each per session). */
const upgrading = new Set<string>();
const publish = () => (imageStatus.value = { loading, missing: [...missing.keys()] });

async function storedRow(f: Fabric, px: number) {
  for (const sha of candidates(f, px)) {
    const row = await getImage(sha);
    if (row) return row;
  }
  if (f.image.data && (await storeEmbedded(f.image))) return getImage(f.image.sha256);
  return undefined;
}
/** The best stored image of `f` for `px`, downloading it first when it's missing and can be. */
async function findImage(f: Fabric, px: number) {
  loading++;
  publish();
  try {
    let row = await storedRow(f, px);
    if (!row && fetchMissing && (await fetchMissing(f).catch(() => false)))
      row = await storedRow(f, px);
    // Shown at a smaller size than the screen setting (e.g. downloaded at 256, now 512): use it now,
    // fetch the right size in the background, then redraw with it.
    const fit = imageFor(f, px);
    if (row && row.id !== fit && fetchMissing && !upgrading.has(fit)) {
      upgrading.add(fit);
      void fetchMissing(f)
        .then(async (ok) => {
          if (!ok || !(await getImage(fit))) return;
          bitmaps.delete(fit);
          urls.delete(fit);
          imagesTick.value++;
        })
        .catch(() => {});
    }
    if (row) missing.delete(f.id);
    else missing.set(f.id, f);
    return row;
  } finally {
    loading--;
    publish();
  }
}

async function load(sha: string, f: Fabric) {
  try {
    const row = await findImage(f, display.size);
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
          const row = await findImage(f, px);
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
export function swatchStyle(f: Fabric, px = 256) {
  const u = fabricUrl(f, px);
  return {
    backgroundColor: `rgb(${f.average.join(',')})`,
    ...(u ? { backgroundImage: `url(${u})`, backgroundSize: 'cover' } : {}),
  };
}

/** Try images that weren't available again (e.g. after a library pack is turned on). */
export function retryMissing() {
  for (const [k, v] of bitmaps) if (v === null) bitmaps.delete(k);
  for (const [k, v] of urls) if (v === null) urls.delete(k);
  missing.clear();
  publish();
  imagesTick.value++;
}

const average = (f: Fabric) => `rgb(${f.average.join(',')})`;
const patterns = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasPattern | null>>();

/**
 * A fabric pattern's matrix under `m` (the context's transform): the fabric keeps its true size and
 * the shape's rotation and mirroring, but never its stretch (a border is the plain block scaled to
 * fit). Built in device space, then `m` undone.
 */
export function patternMatrix(
  m: DOMMatrix,
  devicePerUnit: number,
  f: Pick<Fabric, 'size'>,
  bmp: { width: number; height: number },
  fill?: { offset: readonly number[]; rotation: number },
) {
  const len = Math.hypot(m.a, m.b) || 1;
  const [ux, uy] = [m.a / len, m.b / len];
  const flip = Math.sign(m.a * m.d - m.b * m.c) || 1;
  const device = new DOMMatrix([ux, uy, -uy * flip, ux * flip, m.e, m.f])
    .scaleSelf(devicePerUnit, devicePerUnit)
    .translateSelf(fill?.offset[0] ?? 0, fill?.offset[1] ?? 0)
    .rotateSelf(fill?.rotation ?? 0)
    .scaleSelf(f.size[0] / bmp.width, f.size[1] / bmp.height);
  return m.inverse().multiplySelf(device);
}

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
  p.setTransform(patternMatrix(ctx.getTransform(), devicePerUnit, f, bmp, fill));
  return p;
}
