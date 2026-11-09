// Next steps for a data quilt (spec 041): for any set of days, which pieces each takes, in which
// fabric, in which block. Real entries only: the sample never stands in for a day's fabric.
import { allPatches } from '../blocks/patches';
import { fillKey, resolveColoring } from '../coloring';
import { dayColor, numberLabel, numberOfDate, placesOf, seriesOf } from '../data-quilt';
import { generateFor } from '../layout/slots';
import type { Block } from '../schema/block';
import type { DayMade } from '../schema/data-quilt';
import type { RrqDoc } from '../schema/project';
import type { Quilt } from '../schema/quilt';
import { shapeKey } from './polygon';
import { quiltPieces, templates, type Piece } from './pieces';

export interface StepPiece {
  /** The piece's letter in its block (shapes lettered in order, as the block's own templates). */
  letter: string;
  /** Quilt value (0–3) it shows. */
  slot: number;
  /** Fill key, through the shown colorway. */
  fill: string;
  count: number;
  /** One such piece as placed (for templates). */
  piece: Piece;
}

export interface DayStep {
  date: string;
  /** The plan's number (1-based) and its label (Jan, Wk 3); none when the day has no place. */
  number?: number;
  label?: string;
  reason?: 'no-entry' | 'not-placed';
  values: { slot: number; value: number | string; fill: string }[];
  pieces: StepPiece[];
  made?: DayMade;
}

/** The quilt as making sees it: real entries, days without one as designed. */
const real = (q: Quilt): Quilt =>
  q.data ? { ...q, data: { ...q.data, show: 'real', waiting: 'designed' } } : q;

/** Steps for each of `days` (dates), in date order. */
export function daySteps(doc: RrqDoc, quilt: Quilt, days: readonly string[]): DayStep[] {
  const plan = quilt.data;
  if (!plan) return [];
  const q = real(quilt);
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const slots = new Map(generateFor(quilt).slots.map((s) => [s.id, s]));
  const letters = new Map<Block, Map<string, string>>();
  const letterIn = (b: Block, p: Piece) => {
    let m = letters.get(b);
    if (!m) {
      m = new Map();
      // Lettered as the block's own pieces, in the first space showing it.
      const first = [...slots.values()].find((s) => q.layers[0].slots[s.id]?.block === b.id);
      for (const t of templates(first ? quiltPieces(doc, q, b.id, [first]) : []))
        m.set(shapeKey(t.poly), t.letter);
      letters.set(b, m);
    }
    return m.get(shapeKey(p.poly)) ?? '?';
  };

  return [...days].sort().map((date): DayStep => {
    const made = plan.made?.[date];
    const base = { date, ...(made ? { made } : {}) };
    const values = plan.slots.flatMap((_, slot) => {
      const v = plan.entries[date]?.[slot];
      return v === null || v === undefined || v === ''
        ? []
        : [{ slot, value: v, fill: fillKey(dayColor(quilt, slot, date)) }];
    });
    const at = numberOfDate(plan, date);
    const places = at ? placesOf(plan, at.k) : [];
    if (!at || !places.length) return { ...base, values, pieces: [], reason: 'not-placed' };
    const { k, n } = at;
    const head = { ...base, number: k, label: numberLabel(plan, k), values };
    if (!values.length) return { ...head, pieces: [], reason: 'no-entry' };
    const merged = new Map<string, StepPiece>();
    for (const place of places) {
      const slot = slots.get(place.space);
      const content = q.layers[0].slots[place.space];
      const block = content && blocks.get(content.block);
      if (!slot || !block) continue;
      const raw = resolveColoring(q.colorings[content.coloring], block);
      const ids = allPatches(block).map((p) => p.id);
      quiltPieces(doc, q, undefined, [slot]).forEach((piece, i) => {
        const f = raw?.fills[ids[i]!];
        if (!f || !('data' in f) || f.data.n !== n) return;
        const series = seriesOf(place, f.data.slot ?? 0);
        if (!values.some((v) => v.slot === series)) return;
        const letter = letterIn(block, piece);
        const key = `${letter}|${series}|${piece.fill}`;
        const hit = merged.get(key);
        if (hit) hit.count++;
        else merged.set(key, { letter, slot: series, fill: piece.fill, count: 1, piece });
      });
    }
    return { ...head, pieces: [...merged.values()] };
  });
}
