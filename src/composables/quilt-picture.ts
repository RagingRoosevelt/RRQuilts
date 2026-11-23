// A quilt's card picture: a 3D EPP quilt as its folded object once that's drawn (owner, 2026-11-23;
// render/epp3d-picture.ts), the flat picture until then and for every other quilt.
import { shownColorway, swapper } from '@/model/colorways';
import { lookupEpp } from '@/model/epp/expand';
import { quiltNet } from '@/model/epp/net';
import { is3d } from '@/model/epp/quilt-ops';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { colorLookup } from '@/render/draw';
import { picture3d, type Picture3d } from '@/render/epp3d-picture';
import { quiltThumbnail } from '@/render/thumbnail';
import { useLibraryStore } from '@/stores/library';

/** Per (immutable) quilt and size: what its 3D picture shows, while what it's drawn from stays. */
const memo = new WeakMap<Quilt, Map<number, { deps: unknown[]; key: string; what: Picture3d }>>();

export function useQuiltPicture() {
  const library = useLibraryStore();
  /** A 3D quilt's folded object, `px` square (null while it's drawn, or for any other quilt). */
  const view3d = (doc: RrqDoc, q: Quilt, px: number): string | null => {
    if (!is3d(q) || !q.epp?.pieces.length) return null;
    const p = doc.project;
    const deps = [p.palette, p.eppShapes, p.rosettes, library.items];
    let sizes = memo.get(q);
    if (!sizes) memo.set(q, (sizes = new Map()));
    let m = sizes.get(px);
    if (!m || m.deps.some((d, i) => d !== deps[i])) {
      const { net, leaves } = quiltNet(q, lookupEpp(p, q.epp.shapes ?? [], library.lookup));
      const paint = colorLookup(doc, library.items.colors, undefined, library.items.fabrics);
      const swap = swapper(shownColorway(q));
      const colors = leaves.map((l) => {
        const v = paint(swap(l.fill));
        return typeof v === 'string' ? v : '#bdbdbd';
      });
      const stuffed = q.layout.style === 'epp' && !!q.layout.stuffed;
      const what = { net, colors, stuffed, px };
      m = { deps, key: JSON.stringify(what), what };
      sizes.set(px, m);
    }
    const what = m.what;
    return picture3d(m.key, () => what);
  };
  /** A card's picture: a 3D quilt's folded object once drawn, else the flat picture. */
  const card = (doc: RrqDoc, q: Quilt, px: number, dark: boolean): string =>
    view3d(doc, q, px) ?? quiltThumbnail(doc, q, px, dark, true);
  return Object.assign(card, { view3d });
}
