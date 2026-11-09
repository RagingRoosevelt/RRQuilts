// Instructions for a data quilt (spec 041): for any set of days, which pieces each takes, in which
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

/** One patch a day shows: where it is (a block space and patch), the value it shows, and the
 *  piece as placed in the quilt. */
export interface DayPatch {
  date: string;
  space: string;
  patchId: string;
  /** Quilt value (0–3). */
  series: number;
  block: Block;
  piece: Piece;
}

/** Finds days' patches in a quilt (real entries), reusing each space's pieces. */
function patchFinder(doc: RrqDoc, quilt: Quilt) {
  const q = real(quilt);
  const plan = q.data!;
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const slots = new Map(generateFor(quilt).slots.map((s) => [s.id, s]));
  const spaces = new Map<
    string,
    { block: Block; ids: string[]; raw: ReturnType<typeof resolveColoring>; pieces: Piece[] } | null
  >();
  const space = (id: string) => {
    if (!spaces.has(id)) {
      const slot = slots.get(id);
      const content = q.layers[0].slots[id];
      const block = content && blocks.get(content.block);
      spaces.set(
        id,
        slot && block
          ? {
              block,
              ids: allPatches(block).map((p) => p.id),
              raw: resolveColoring(q.colorings[content.coloring], block),
              pieces: quiltPieces(doc, q, undefined, [slot]),
            }
          : null,
      );
    }
    return spaces.get(id) ?? null;
  };
  /** A date's number and day in it, and its patches in every placement of the number. */
  const find = (date: string) => {
    const at = numberOfDate(plan, date);
    if (!at) return undefined;
    const list: DayPatch[] = [];
    for (const place of placesOf(plan, at.k)) {
      const sp = space(place.space);
      if (!sp) continue;
      sp.pieces.forEach((piece, i) => {
        const patchId = sp.ids[i]!;
        const f = sp.raw?.fills[patchId];
        if (!f || !('data' in f) || f.data.n !== at.n) return;
        const series = seriesOf(place, f.data.slot ?? 0);
        list.push({ date, space: place.space, patchId, series, block: sp.block, piece });
      });
    }
    return { ...at, placed: placesOf(plan, at.k).length > 0, list };
  };
  return { q, plan, slots, find };
}

/** Every patch of `days`, whether entered or not (for highlighting where they go). */
export function dayPatches(doc: RrqDoc, quilt: Quilt, days: readonly string[]): DayPatch[] {
  if (!quilt.data) return [];
  const { find } = patchFinder(doc, quilt);
  return days.flatMap((d) => find(d)?.list ?? []);
}

/** Steps for each of `days` (dates), in date order. */
export function daySteps(doc: RrqDoc, quilt: Quilt, days: readonly string[]): DayStep[] {
  if (!quilt.data) return [];
  const { q, plan, slots, find } = patchFinder(doc, quilt);
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
    const at = find(date);
    if (!at?.placed) return { ...base, values, pieces: [], reason: 'not-placed' };
    const head = { ...base, number: at.k, label: numberLabel(plan, at.k), values };
    if (!values.length) return { ...head, pieces: [], reason: 'no-entry' };
    const merged = new Map<string, StepPiece>();
    for (const x of at.list) {
      if (!values.some((v) => v.slot === x.series)) continue;
      const letter = letterIn(x.block, x.piece);
      const key = `${letter}|${x.series}|${x.piece.fill}`;
      const hit = merged.get(key);
      if (hit) hit.count++;
      else
        merged.set(key, { letter, slot: x.series, fill: x.piece.fill, count: 1, piece: x.piece });
    }
    return { ...head, pieces: [...merged.values()] };
  });
}
