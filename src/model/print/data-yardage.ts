// Worst-case yardage for a data quilt (spec 025 User Story 6): what a day's place takes is unknown
// until the day comes, so each scale entry counts its most days expected (by default its days in
// the sample) times the largest place of its value slot. Pieces that aren't data places, and places
// with no day (filler or their own color), count as they show.
import { fillKey } from '../coloring';
import { sampleCounts, scaleEntries } from '../data-quilt';
import type { RrqDoc } from '../schema/project';
import type { Quilt } from '../schema/quilt';
import { quiltPieces, type Piece } from './pieces';
import { area } from './polygon';

const slotOfKey = (key: string) => Number(/\.(\d)$/.exec(key)?.[1] ?? 0);

export function dataYardagePieces(doc: RrqDoc, quilt: Quilt): Piece[] {
  const plan = quilt.data;
  const shown = quiltPieces(doc, quilt);
  if (!plan?.on) return shown;
  // The same pieces in the same order with the data paints left in (the plan switched off).
  const design = quiltPieces(doc, { ...quilt, data: { ...plan, on: false } });
  const scaleKeys = new Set(plan.slots.flatMap((s) => scaleEntries(s).map((e) => fillKey(e.fill))));
  const largest = new Map<number, Piece>();
  const out: Piece[] = [];
  design.forEach((p, i) => {
    const now = shown[i]!;
    if (!p.fill.startsWith('data:')) return void out.push(now);
    const slot = slotOfKey(p.fill);
    const big = largest.get(slot);
    if (!big || area(p.poly) > area(big.poly)) largest.set(slot, p);
    // A place showing a day's value is counted by the worst case below; one with no day yet (a
    // place, not a fabric) not at all; any other as it shows (filler, its own color).
    if (!scaleKeys.has(now.fill) && !now.fill.startsWith('data:')) out.push(now);
  });
  plan.slots.forEach((s, slot) => {
    const piece = largest.get(slot);
    if (!piece) return;
    const counts = sampleCounts(plan, slot);
    scaleEntries(s).forEach((e, j) => {
      const fill = fillKey(e.fill);
      for (let k = 0; k < (e.most ?? counts[j] ?? 0); k++) out.push({ ...piece, fill });
    });
  });
  return out;
}
