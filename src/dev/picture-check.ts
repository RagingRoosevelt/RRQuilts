// Picture check (dev server only, Tests tab): each demo project sample (test/fixtures/formats) drawn
// now, beside the PNGs its release saved, with where they differ. "Now" uses the same drawing as
// Save image, at the same size, so only real drawing changes show.
import { parseProject } from '@/model/io';
import type { Color } from '@/model/schema/palette';
import { blockThumbnail, quiltThumbnail } from '@/render/thumbnail';

const demos = import.meta.glob<string>('/test/fixtures/formats/demo-v*.rrq', {
  query: '?raw',
  import: 'default',
});
const stored = import.meta.glob<string>('/test/fixtures/formats/demo-v*/*.png', {
  query: '?url',
  import: 'default',
  eager: true,
});

/** Shown and measured at this size. */
const SIDE = 480;

export interface Comparison {
  /** Reference label (v6.07): pictures numbered by name, so it stays put between runs. */
  ref: string;
  name: string;
  state: 'same' | 'changed' | 'new' | 'missing';
  /** Share of pixels that changed visibly. */
  share: number;
  release?: string;
  now?: string;
  diff?: string;
}
export interface Section {
  version: number;
  items: Comparison[];
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = fail;
    im.src = src;
  });

/** The picture at SIDE on white (as the page shows it). */
async function flat(src: string) {
  const im = await loadImage(src);
  const k = SIDE / Math.max(im.width, im.height);
  const c = document.createElement('canvas');
  [c.width, c.height] = [Math.round(im.width * k), Math.round(im.height * k)];
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(im, 0, 0, c.width, c.height);
  return c;
}

/** Changed share, and a picture of where: red over a faded copy of now. */
function compare(a: HTMLCanvasElement, b: HTMLCanvasElement) {
  if (a.width !== b.width || a.height !== b.height) return { share: 1 };
  const [w, h] = [a.width, a.height];
  const pa = a.getContext('2d')!.getImageData(0, 0, w, h).data;
  const out = b.getContext('2d')!.getImageData(0, 0, w, h);
  const pb = out.data;
  let changed = 0;
  for (let i = 0; i < pa.length; i += 4) {
    const d = Math.max(
      Math.abs(pa[i]! - pb[i]!),
      Math.abs(pa[i + 1]! - pb[i + 1]!),
      Math.abs(pa[i + 2]! - pb[i + 2]!),
    );
    if (d > 24) {
      changed++;
      [pb[i], pb[i + 1], pb[i + 2]] = [214, 40, 40];
    } else {
      const g = 0.3 * pb[i]! + 0.59 * pb[i + 1]! + 0.11 * pb[i + 2]!;
      pb[i] = pb[i + 1] = pb[i + 2] = 255 - (255 - g) * 0.3;
    }
  }
  const c = document.createElement('canvas');
  [c.width, c.height] = [w, h];
  c.getContext('2d')!.putImageData(out, 0, 0);
  return { share: changed / (w * h), diff: c.toDataURL() };
}

const pause = () => new Promise((r) => setTimeout(r));

/** One section per demo version, newest first; each picture drawn and compared in turn. */
export async function* pictureCheck(libraryColors: readonly Color[]): AsyncGenerator<Section> {
  const files = Object.keys(demos).sort(
    (a, b) => +b.match(/-v(\d+)\.rrq$/)![1]! - +a.match(/-v(\d+)\.rrq$/)![1]!,
  );
  for (const file of files) {
    const version = +file.match(/-v(\d+)\.rrq$/)![1]!;
    const parsed = await parseProject(await demos[file]!());
    if (!parsed.ok) throw new Error(`${file}: ${parsed.error}`);
    const doc = parsed.doc;
    // Save image's pictures: quilts at 2048, blocks at 1024 in their first coloring.
    const now = new Map<string, () => string>();
    for (const q of doc.project.quilts)
      now.set(q.notecard.name, () => quiltThumbnail(doc, { ...q }, 2048, false));
    for (const b of doc.project.blocks)
      if (b.id !== 'plain')
        now.set(b.notecard.name, () =>
          blockThumbnail(doc, { ...b }, 1024, false, undefined, libraryColors),
        );
    const dir = file.replace(/\.rrq$/, '/');
    const release = new Map(
      Object.entries(stored)
        .filter(([p]) => p.startsWith(dir))
        .map(([p, url]) => [decodeURIComponent(p.slice(dir.length, -4)), url]),
    );
    const names = [...new Set([...now.keys(), ...release.keys()])].sort();
    const items: Comparison[] = [];
    for (const [k, name] of names.entries()) {
      const ref = `v${version}.${String(k + 1).padStart(2, '0')}`;
      const rel = release.get(name);
      const drawn = now.get(name)?.();
      let item: Comparison;
      if (rel && drawn) {
        const [a, b] = await Promise.all([flat(rel), flat(drawn)]);
        const { share, diff } = compare(a, b);
        item = {
          ref,
          name,
          state: share < 0.001 ? 'same' : 'changed',
          share,
          release: rel,
          now: b.toDataURL(),
          ...(diff ? { diff } : {}),
        };
      } else
        item = {
          ref,
          name,
          state: rel ? 'missing' : 'new',
          share: 1,
          ...(rel ? { release: rel } : {}),
          ...(drawn ? { now: drawn } : {}),
        };
      items.push(item);
      await pause();
    }
    items.sort((x, y) => +(y.state !== 'same') - +(x.state !== 'same') || y.share - x.share);
    yield { version, items };
  }
}
