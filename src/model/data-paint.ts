// Day numerals on a data block's pieces (spec 025 User Story 1): putting one on and taking it off,
// counting them, reading order (rows / columns / snake), and where each piece's numeral sits (for
// the overlay and the order line).
import { interiorPoint } from './blocks/remap';
import { plainFill } from './coloring';
import { pathPolygon, pointInPolygon, type Pt } from './geometry/path';
import type { Block } from './schema/block';
import type { DataPaint, Fill } from './schema/coloring';

export type DataOrder = 'rows' | 'columns' | 'snake';
export const SLOT_NAMES = ['A', 'B', 'C', 'D'] as const;

type Fills = Readonly<Record<string, Fill>>;

const inSlot = (p: DataPaint, slot: number) => (p.slot ?? 0) === slot;

/**
 * Put day numeral `n` of value `slot` on a patch, over its color; the same numeral already there
 * comes off (its color returns). A numeral may sit on any number of patches.
 */
export function putNumeral(
  fills: Fills,
  id: string,
  n: number,
  slot: number,
): Record<string, Fill> {
  const f = fills[id];
  const out = { ...fills };
  if (f && 'data' in f && inSlot(f.data, slot) && f.data.n === n) {
    if (f.under) out[id] = f.under;
    else delete out[id];
    return out;
  }
  const under = plainFill(f);
  out[id] = { data: { n, ...(slot ? { slot } : {}) }, ...(under ? { under } : {}) };
  return out;
}

/** Every numeral of value `slot` taken off the patches `ids` (their colors come back). */
export function clearNumerals(fills: Fills, ids: readonly string[], slot: number) {
  const out = { ...fills };
  for (const id of ids) {
    const f = out[id];
    if (!f || !('data' in f) || !inSlot(f.data, slot)) continue;
    if (f.under) out[id] = f.under;
    else delete out[id];
  }
  return out;
}

/** How many of the patches `ids` each numeral of value `slot` is on. */
export function numeralCounts(fills: Fills, ids: readonly string[], slot: number) {
  const m = new Map<number, number>();
  for (const id of ids) {
    const f = fills[id];
    if (f && 'data' in f && inSlot(f.data, slot)) m.set(f.data.n, (m.get(f.data.n) ?? 0) + 1);
  }
  return m;
}

/** A piece's area centroid when it's inside the piece, else a point inside (concave pieces). */
function spot(poly: Pt[]): Pt {
  let a = 0;
  let x = 0;
  let y = 0;
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    const c = p[0] * q[1] - q[0] * p[1];
    a += c;
    x += (p[0] + q[0]) * c;
    y += (p[1] + q[1]) * c;
  });
  if (Math.abs(a) < 1e-12) return interiorPoint(poly);
  const c: Pt = [x / (3 * a), y / (3 * a)];
  return pointInPolygon(c, poly) ? c : interiorPoint(poly);
}

const spots = new WeakMap<Block, Map<string, Pt>>();
/** A point inside each piece, in the block's 0…1 square. */
export function pieceSpots(block: Block): Map<string, Pt> {
  let m = spots.get(block);
  if (!m) {
    m = new Map(
      ('patches' in block ? block.patches : []).map((p): [string, Pt] => [
        p.id,
        spot(pathPolygon(p.path, block.size)),
      ]),
    );
    spots.set(block, m);
  }
  return m;
}

/**
 * Pieces in reading order: rows top to bottom (left to right), columns left to right (top to
 * bottom), or snake (rows, every other one right to left). ponytail: a row is pieces whose spots
 * are within 2% of the block of the row's first; uneven pieces may need hand numbering.
 */
export function readingOrder(
  at: ReadonlyMap<string, Pt>,
  ids: readonly string[],
  order: DataOrder,
) {
  const [a, b]: [0 | 1, 0 | 1] = order === 'columns' ? [0, 1] : [1, 0];
  const list = ids.flatMap((id) => {
    const p = at.get(id);
    return p ? [{ id, p }] : [];
  });
  list.sort((x, y) => x.p[a] - y.p[a]);
  const rows: (typeof list)[] = [];
  for (const it of list) {
    const row = rows[rows.length - 1];
    if (row && it.p[a] - row[0]!.p[a] < 0.02) row.push(it);
    else rows.push([it]);
  }
  return rows
    .flatMap((row, i) => {
      row.sort((x, y) => x.p[b] - y.p[b]);
      return order === 'snake' && i % 2 ? row.reverse() : row;
    })
    .map((x) => x.id);
}

/** Label for a numbered piece: `5`, `5B` past slot A. */
export const paintLabel = (p: DataPaint) => `${p.n}${p.slot ? SLOT_NAMES[p.slot] : ''}`;
