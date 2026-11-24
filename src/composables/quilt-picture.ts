// A quilt's card picture: a 3D EPP quilt as its folded object once that's drawn (owner, 2026-11-23;
// render/epp3d-picture.ts), the flat picture until then and for every other quilt.
import { shownColorway, swapper } from '@/model/colorways';
import { lookupEpp } from '@/model/epp/expand';
import { quiltNet } from '@/model/epp/net';
import { is3d } from '@/model/epp/quilt-ops';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup } from '@/render/draw';
import { picture3d, START_VIEW, type Shape3d, type View3d } from '@/render/epp3d-picture';
import { quiltThumbnail } from '@/render/thumbnail';
import { useLibraryStore } from '@/stores/library';

/** Per (immutable) quilt: its shape and shape key, while what it's drawn from stays the same. */
const memo = new WeakMap<Quilt, { deps: unknown[]; key: string; shape: Shape3d }>();
/** Each quilt's last picture per size: shown while a changed one is drawn (no placeholder flash). */
const last = new Map<string, string>();

export function useQuiltPicture() {
  const library = useLibraryStore();
  /**
   * A 3D quilt's folded object, `px` square, seen from `view` (default: as the 3D assembly tab
   * opens): its picture (null while the first one is drawn) and its shape key (for `orbit`). Null
   * for any other quilt.
   */
  const view3d = (doc: RrqDoc, q: Quilt, px: number, view: View3d = START_VIEW) => {
    if (!is3d(q) || !q.epp?.pieces.length) return null;
    const p = doc.project;
    const deps = [p.palette, p.eppShapes, p.rosettes, library.items];
    let m = memo.get(q);
    if (!m || m.deps.some((d, i) => d !== deps[i])) {
      const { net, leaves } = quiltNet(q, lookupEpp(p, q.epp.shapes ?? [], library.lookup));
      const paint = colorLookup(doc, library.items.colors, undefined, library.items.fabrics);
      const swap = swapper(shownColorway(q));
      const colors = leaves.map((l) => {
        const v = paint(swap(l.fill));
        return typeof v === 'string' ? v : '#bdbdbd';
      });
      const shape = { net, colors, stuffed: q.layout.style === 'epp' && !!q.layout.stuffed };
      m = { deps, key: JSON.stringify(shape), shape };
      memo.set(q, m);
    }
    const shape = m.shape;
    const url = picture3d(m.key, () => shape, px, view);
    const slot = `${q.id}:${px}`;
    if (url) last.set(slot, url);
    return { url: url ?? last.get(slot) ?? null, shape: m.key };
  };
  /** A card's picture: a 3D quilt's folded object once drawn, else the flat picture. */
  const card = (doc: RrqDoc, q: Quilt, px: number, dark: boolean): string =>
    view3d(doc, q, px)?.url ?? quiltThumbnail(doc, q, px, dark, true);
  return Object.assign(card, { view3d });
}
