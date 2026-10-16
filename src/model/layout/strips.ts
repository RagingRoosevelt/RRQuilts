// Strip quilt edits (spec 017). Strips keep their ids, so their content goes wherever they go.
import { newId } from '../ids';
import type { Strip, StripLayout, StripStyle } from '../schema/quilt';

export const STRIP_STYLES: { value: StripStyle; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'blocks', label: 'Pieced Blocks' },
  { value: 'half-drop-blocks', label: 'Half Drop Blocks' },
  { value: 'spaced-squares', label: 'Spaced Squares' },
  { value: 'points-a', label: 'Points A' },
  { value: 'points-b', label: 'Points B' },
  { value: 'diamonds', label: 'Diamonds' },
  { value: 'half-drop-diamonds', label: 'Half Drop Diamonds' },
  { value: 'double-diamonds', label: 'Double Diamonds' },
  { value: 'half-drop-double-diamonds', label: 'Half Drop Double Diamonds' },
  { value: 'checker-board', label: 'Checker Board' },
];

/** A new, blank strip: plain, 2″ (5 cm) wide. */
const fresh = (units: 'in' | 'cm'): Strip => ({
  id: newId(),
  style: 'plain',
  width: units === 'cm' ? 5 : 2,
  along: 6,
  across: 1,
});

export const addStrip = (l: StripLayout, units: 'in' | 'cm') => {
  const s = fresh(units);
  return { layout: { ...l, strips: [...l.strips, s] }, id: s.id };
};

export const insertStrip = (l: StripLayout, before: string, units: 'in' | 'cm') => {
  const s = fresh(units);
  const i = Math.max(
    0,
    l.strips.findIndex((x) => x.id === before),
  );
  return { layout: { ...l, strips: [...l.strips.slice(0, i), s, ...l.strips.slice(i)] }, id: s.id };
};

/** Remove a strip; the last one stays. */
export const deleteStrip = (l: StripLayout, id: string): StripLayout =>
  l.strips.length > 1 ? { ...l, strips: l.strips.filter((x) => x.id !== id) } : l;

export function swapStrips(l: StripLayout, a: string, b: string): StripLayout {
  const [i, j] = [l.strips.findIndex((x) => x.id === a), l.strips.findIndex((x) => x.id === b)];
  if (i < 0 || j < 0 || i === j) return l;
  const strips = [...l.strips];
  [strips[i], strips[j]] = [strips[j]!, strips[i]!];
  return { ...l, strips };
}

/** Block strips that keep their blocks square (the default). */
export const squareBlocks = (s: Strip) =>
  (s.style === 'blocks' || s.style === 'half-drop-blocks') && s.square !== false;

/** A strip's width as laid out: square block strips follow the length and their count. */
export const stripWidth = (l: StripLayout, s: Strip) =>
  squareBlocks(s) ? l.length / s.along : s.width;

/** Move a strip into gap `to` (0 = before the first, n = after the last). */
export function moveStrip(l: StripLayout, id: string, to: number): StripLayout {
  const from = l.strips.findIndex((x) => x.id === id);
  if (from < 0) return l;
  const at = to > from ? to - 1 : to;
  if (at === from) return l;
  const strips = l.strips.filter((x) => x.id !== id);
  strips.splice(at, 0, l.strips[from]!);
  return { ...l, strips };
}

export const setStrip = (
  l: StripLayout,
  id: string,
  patch: Partial<Omit<Strip, 'id'>>,
): StripLayout => ({
  ...l,
  strips: l.strips.map((x) => (x.id === id ? { ...x, ...patch } : x)),
});

/** The strip a space belongs to. */
export const stripOf = (slotId: string) => /^(?:strip:|b:s)([^:]+):/.exec(slotId)?.[1];

/** Length one unit takes along the strip when its shapes are square (blocks, diamonds) or 90°. */
export function squareUnit(s: Strip): number | null {
  switch (s.style) {
    case 'blocks':
    case 'half-drop-blocks':
    case 'diamonds':
    case 'half-drop-diamonds':
      return s.width;
    case 'double-diamonds':
    case 'half-drop-double-diamonds':
      return s.width / 2;
    case 'points-a':
    case 'points-b':
      return 2 * s.width;
    case 'checker-board':
      return s.width / s.across;
    default:
      return null;
  }
}

/** Fixes that make a strip's units square: the count at this length, or the length at this count. */
export function squareFixes(l: StripLayout, s: Strip): { along?: number; length?: number } | null {
  if (squareBlocks(s)) return null; // already square by construction
  const unit = squareUnit(s);
  if (unit === null || Math.abs(l.length / s.along - unit) < 1 / 64) return null;
  const along = Math.round(l.length / unit);
  return {
    ...(along >= 1 && along <= 100 && Math.abs(l.length / along - unit) < 1 / 64 ? { along } : {}),
    length: unit * s.along,
  };
}
