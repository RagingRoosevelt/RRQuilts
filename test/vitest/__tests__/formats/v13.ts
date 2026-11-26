// What project format v13 added (0.9.3), for the v13 demo and the format samples: a quilt with
// colorways in every mode (Palette, one following another, Auto map, Re-color; spec 019), an EPP
// quilt cut by hand to a square with an Auto map colorway (spec 027 FR-001c, spec 024), and the
// sample rosette's colorings following another (Palette, Auto map; spec 050 FR-003a). Needs the
// v12 content (epp-v12.ts) and the first quilt's layout.
import { castDraft, produce } from 'immer';
import { fillQuilt, type Kit } from '@/dev/fill-quilt';
import { addColorway, setSwap, startRecolor } from '@/model/colorways';
import { fitRatio } from '@/model/epp/edge';
import { lookupEpp } from '@/model/epp/expand';
import { setEdge } from '@/model/epp/quilt-ops';
import { addColoring } from '@/model/epp/rosette-ops';
import { fillKey } from '@/model/coloring';
import { syncDraft } from '@/model/library-items';
import { createQuilt } from '@/model/new-quilt';
import { quiltPieces } from '@/model/print/pieces';
import type { Fill } from '@/model/schema/coloring';
import type { RrqDoc } from '@/model/schema/project';
import type { Colorway, Quilt } from '@/model/schema/quilt';

const NEON = 'rrquilts.neon';

export function addV13(doc0: RrqDoc, kit: Kit): RrqDoc {
  let doc = doc0;
  const color = (i: number): Fill => ({ color: kit.colors[i % kit.colors.length]! });

  // Colorways: the first quilt's layout, filled, in Palette, following, Auto map and Re-color.
  const first = doc.project.quilts[0]!;
  const made = createQuilt('Colorways', first.layout, first.borders);
  doc = produce(doc, (d) => void d.project.quilts.push(made));
  doc = fillQuilt(doc, made.id, kit) as RrqDoc;
  const q = doc.project.quilts.find((x) => x.id === made.id)!;
  const keys = [...new Set(quiltPieces(doc, q).map((p) => p.fill))].filter((k) =>
    k.startsWith('color:'),
  );
  let v = setSwap(addColorway(q, 'swapped', 'Swapped'), 'swapped', keys[0]!, color(3));
  v = addColorway(v, 'follows', 'Follows Swapped');
  v = addColorway(v, 'neon', 'Neon');
  v = startRecolor(addColorway(v, 'painted', 'Painted'), 'painted', doc.project.blocks);
  v = structuredClone(v);
  for (const w of v.colorways as Colorway[]) {
    if (w.id === 'follows') Object.assign(w, { source: 'swapped', swaps: [] });
    if (w.id === 'neon') w.auto = { palette: NEON };
    const painted = w.recolor && Object.values(w.recolor.colorings)[0];
    const patch = painted && Object.keys(painted.fills)[0];
    if (painted && patch) painted.fills[patch] = color(5);
  }
  if (keys[1]) v = setSwap(v, 'follows', keys[1], color(6));
  const colorways: Quilt = { ...v, shownColorway: 'painted' };

  // An EPP quilt cut by hand to a square, shown in an Auto map colorway.
  const epp = doc.project.quilts.find((x) => x.notecard.name === 'EPP Quilt');
  let cut: Quilt | undefined;
  if (epp?.layout.style === 'epp') {
    const lookup = lookupEpp(doc.project, epp.epp?.shapes ?? [], kit.lookup);
    const largest = setEdge(
      { ...structuredClone(epp), id: 'eppcut', notecard: { name: 'EPP Cut by Hand' } },
      { kind: 'cut', rect: [0, 0, 0, 0] },
      lookup,
    );
    const edge = largest.layout.style === 'epp' ? largest.layout.edge : undefined;
    // As the Layout tab's Manual and Square (1:1): through setEdge, so the outline and borders
    // follow the cut.
    if (edge?.kind === 'cut')
      cut = {
        ...setEdge(
          largest,
          { kind: 'cut', rect: fitRatio(edge.rect, [1, 1]), manual: true, ratio: [1, 1] },
          lookup,
        ),
        colorways: [{ id: 'neon', name: 'Neon', swaps: [], auto: { palette: NEON } }],
        shownColorway: 'neon',
      };
  }

  // The sample rosette: a Palette coloring following its first, and an Auto map one after it.
  const k = (doc.project.rosettes ?? []).findIndex((r) => r.notecard.name === 'Sample Flower');
  const r = k >= 0 ? doc.project.rosettes![k]! : undefined;
  const base = r?.colorings[0];
  const key = base && Object.values(base.fills).map(fillKey)[0];
  const a =
    r && base && key
      ? addColoring(r, undefined, {
          name: 'Swapped',
          source: base.id,
          swaps: [{ from: key, to: color(4) }],
        })
      : undefined;
  const rosette =
    a && addColoring(a.rosette, undefined, { name: 'Neon', source: a.id, auto: { palette: NEON } });

  return produce(doc, (d) => {
    const p = d.project;
    const i = p.quilts.findIndex((x) => x.id === made.id);
    p.quilts[i] = castDraft(colorways);
    if (cut) p.quilts.push(castDraft(cut));
    if (rosette) p.rosettes![k] = castDraft(rosette.rosette);
    // Followed colorings, auto mappings and embedded library items worked out, as every edit.
    syncDraft(d, kit.lookup);
  });
}
