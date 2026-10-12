// Unit conversion. Only real-world lengths change; block geometry is normalized (0…1), and
// angles, colors, and counts are unitless.
import { produce } from 'immer';
import type { ColoringBody } from './schema/coloring';
import type { RrqDoc, Units } from './schema/project';

const CM_PER_IN = 2.54;

export const unitFactor = (from: Units, to: Units) =>
  from === to ? 1 : to === 'cm' ? CM_PER_IN : 1 / CM_PER_IN;

type Pair = [number, number];
const scalePair = (p: Pair, k: number): Pair => [p[0] * k, p[1] * k];

function scaleColoring(c: ColoringBody, k: number) {
  for (const fill of Object.values(c.fills))
    if ('fabric' in fill) fill.offset = scalePair(fill.offset, k);
}

/** Returns a converted copy; the input is not modified. */
export function convertUnits(doc: RrqDoc, to: Units): RrqDoc {
  const k = unitFactor(doc.units, to);
  return produce(doc, (out) => {
    out.units = to;
    if (k === 1) return;
    const p = out.project;
    for (const f of p.palette.fabrics) f.size = scalePair(f.size, k);
    for (const b of p.blocks) {
      b.size = scalePair(b.size, k);
      for (const c of b.colorings) scaleColoring(c, k);
      // Snap and graph-paper steps restart at the new units' defaults (¼" vs 5 mm, not 6.35 mm).
      const e = b.editor as { snap?: { step?: number }; graph?: { step?: number } } | undefined;
      delete e?.snap?.step;
      delete e?.graph?.step;
    }
    for (const q of p.quilts) {
      if (q.layout.style === 'horizontal') {
        q.layout.block = scalePair(q.layout.block, k);
        q.layout.sash = scalePair(q.layout.sash, k);
      }
      for (const b of q.borders) b.sides = b.sides.map((s) => s * k) as typeof b.sides;
      for (const c of Object.values(q.colorings)) scaleColoring(c, k);
      for (const item of q.layers.flatMap((l) => l.items)) {
        item.x *= k;
        item.y *= k;
        item.w *= k;
        item.h *= k;
        if (item.text) item.text.size *= k;
      }
    }
  });
}
