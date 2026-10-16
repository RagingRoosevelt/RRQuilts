// Unit conversion. Only real-world lengths change; block geometry is normalized (0…1), and
// angles, colors, and counts are unitless.
import { produce } from 'immer';
import type { ColoringBody } from './schema/coloring';
import type { RrqDoc, Units } from './schema/project';

const CM_PER_IN = 2.54;

export const unitFactor = (from: Units, to: Units) =>
  from === to ? 1 : to === 'cm' ? CM_PER_IN : 1 / CM_PER_IN;

/** Lengths as precise as a quilter works: 3 decimals of an inch, 2 of a centimeter. */
export const roundLen = (v: number, units: Units) => {
  const f = units === 'cm' ? 100 : 1000;
  return Math.round(v * f) / f;
};

type Pair = [number, number];

function scaleColoring(c: ColoringBody, scalePair: (p: Pair) => Pair) {
  for (const fill of Object.values(c.fills))
    if ('fabric' in fill) fill.offset = scalePair(fill.offset);
}

/** Returns a converted copy; the input is not modified. */
export function convertUnits(doc: RrqDoc, to: Units): RrqDoc {
  const k = unitFactor(doc.units, to);
  // Float noise is dropped (5.08 cm → 2″, not 1.9999999999999998″); 1/16″ stays exact.
  const len = (v: number) => Math.round(v * k * 1e6) / 1e6;
  const scalePair = (p: Pair): Pair => [len(p[0]), len(p[1])];
  return produce(doc, (out) => {
    out.units = to;
    if (k === 1) return;
    const p = out.project;
    for (const f of p.palette.fabrics) f.size = scalePair(f.size);
    for (const b of p.blocks) {
      b.size = scalePair(b.size);
      for (const c of b.colorings) scaleColoring(c, scalePair);
      // Snap and graph-paper steps restart at the new units' defaults (¼" vs 5 mm, not 6.35 mm).
      const e = b.editor as { snap?: { step?: number }; graph?: { step?: number } } | undefined;
      delete e?.snap?.step;
      delete e?.graph?.step;
    }
    for (const q of p.quilts) {
      if (q.layout.style === 'horizontal') {
        q.layout.block = scalePair(q.layout.block);
        q.layout.sash = scalePair(q.layout.sash);
      } else if (q.layout.style === 'on-point') {
        q.layout.block = len(q.layout.block);
        q.layout.sash = len(q.layout.sash);
        q.layout.edge.float = len(q.layout.edge.float);
      } else if (q.layout.style === 'horizontal-strip' || q.layout.style === 'vertical-strip') {
        q.layout.length = len(q.layout.length);
        for (const st of q.layout.strips) st.width = len(st.width);
      }
      for (const b of q.borders) b.sides = b.sides.map(len) as typeof b.sides;
      for (const c of Object.values(q.colorings)) scaleColoring(c, scalePair);
      for (const item of q.layers.flatMap((l) => l.items)) {
        item.x = len(item.x);
        item.y = len(item.y);
        item.w = len(item.w);
        item.h = len(item.h);
        if (item.text) item.text.size = len(item.text.size);
      }
    }
  });
}
