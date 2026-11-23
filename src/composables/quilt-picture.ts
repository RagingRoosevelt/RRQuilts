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

/** Per (immutable) quilt: what its 3D picture shows, while the things it's drawn from stay the same. */
const memo = new WeakMap<Quilt, { deps: unknown[]; key: string; what: Picture3d }>();

export function useQuiltPicture() {
  const library = useLibraryStore();
  return (doc: RrqDoc, q: Quilt, px: number, dark: boolean): string => {
    const flat = () => quiltThumbnail(doc, q, px, dark, true);
    if (!is3d(q) || !q.epp?.pieces.length) return flat();
    const p = doc.project;
    const deps = [p.palette, p.eppShapes, p.rosettes, library.items, px];
    let m = memo.get(q);
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
      memo.set(q, m);
    }
    const what = m.what;
    return picture3d(m.key, () => what) ?? flat();
  };
}
