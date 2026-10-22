// Numbering pieces with data paints (spec 025 User Story 1): the next free number, painting and
// taking back one piece, numbering many in rows / columns / snake order, and where each piece's
// number sits (for the overlay and the order line).
import { interiorPoint } from './blocks/remap';
import { plainFill } from './coloring';
import { pathPolygon, pointInPolygon, type Pt } from './geometry/path';
import type { Block } from './schema/block';
import type { DataPaint, Fill } from './schema/coloring';

/** Which numbers: a month block's days or a week block's. */
export type DataSet = '31' | '7';
export type DataOrder = 'rows' | 'columns' | 'snake';
export const SET_MAX: Record<DataSet, number> = { '31': 31, '7': 7 };
export const SLOT_NAMES = ['A', 'B', 'C', 'D'] as const;

type Fills = Readonly<Record<string, Fill>>;

// Both sets are one run of numbers: the set only caps how far numbering goes.
const inSlot = (p: DataPaint, slot: number) => (p.slot ?? 0) === slot;

/** Numbers of `slot` already painted. */
const used = (fills: Fills, slot: number) =>
  new Set(
    Object.values(fills).flatMap((f) => ('data' in f && inSlot(f.data, slot) ? [f.data.n] : [])),
  );

/** The smallest number of `set` not yet painted for `slot` (undefined: all used). */
export function nextNumber(fills: Fills, set: DataSet, slot: number): number | undefined {
  const have = used(fills, slot);
  for (let n = 1; n <= SET_MAX[set]; n++) if (!have.has(n)) return n;
  return undefined;
}

const paint = (n: number, slot: number, over: Fill | undefined): Fill => {
  const under = plainFill(over);
  return {
    data: { n, ...(slot ? { slot } : {}) },
    ...(under ? { under } : {}),
  };
};

/**
 * Number in order: a piece without this set's number gets the next one (over its color); one
 * that has it gives it back (its color returns). Returns the new fills, or undefined when the set
 * is full.
 */
export function numberPiece(fills: Fills, id: string, set: DataSet, slot: number) {
  const f = fills[id];
  const out = { ...fills };
  if (f && 'data' in f && inSlot(f.data, slot)) {
    if (f.under) out[id] = f.under;
    else delete out[id];
    return out;
  }
  const n = nextNumber(fills, set, slot);
  if (n === undefined) return undefined;
  out[id] = paint(n, slot, f);
  return out;
}

/** Number `ids` in the order given, each the next free number (ones already numbered are kept). */
export function numberPieces(fills: Fills, ids: readonly string[], set: DataSet, slot: number) {
  let out: Record<string, Fill> = { ...fills };
  for (const id of ids) {
    const f = out[id];
    if (f && 'data' in f && inSlot(f.data, slot)) continue;
    const n = nextNumber(out, set, slot);
    if (n === undefined) break;
    out = { ...out, [id]: paint(n, slot, f) };
  }
  return out;
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
