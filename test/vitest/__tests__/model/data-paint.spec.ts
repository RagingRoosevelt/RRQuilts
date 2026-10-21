import { describe, expect, it } from 'vitest';
import {
  nextNumber,
  numberPiece,
  numberPieces,
  paintLabel,
  readingOrder,
} from '@/model/data-paint';
import type { Pt } from '@/model/geometry/path';
import type { Fill } from '@/model/schema/coloring';

const gray: Fill = { color: 'gray' };

describe('data places (spec 025 US1)', () => {
  it('number in order: the next free number, over the color; tapping again takes it back', () => {
    let f: Record<string, Fill> = { a: gray, b: gray, c: gray };
    f = numberPiece(f, 'a', '31', 0)!;
    f = numberPiece(f, 'b', '31', 0)!;
    expect(f.a).toEqual({ data: { n: 1 }, under: gray });
    expect(f.b).toEqual({ data: { n: 2 }, under: gray });
    f = numberPiece(f, 'a', '31', 0)!;
    expect(f.a).toEqual(gray);
    expect(nextNumber(f, '31', 0)).toBe(1);
    // Other sets and slots count apart.
    expect(nextNumber(f, '31', 1)).toBe(1);
    f = numberPiece(f, 'c', 'year', 1)!;
    expect(f.c).toEqual({ data: { n: 1, year: true, slot: 1 }, under: gray });
    expect(paintLabel({ n: 1, year: true, slot: 1 })).toBe('Y1B');
  });

  it('a full set refuses another number', () => {
    const f = Object.fromEntries(
      [1, 2, 3, 4, 5, 6, 7].map((n): [string, Fill] => [`p${n}`, { data: { n } }]),
    );
    expect(numberPiece({ ...f, x: gray }, 'x', '7', 0)).toBeUndefined();
  });

  it('numbering many keeps those numbered, fills the gaps in order', () => {
    const f = numberPieces({ a: gray, b: { data: { n: 1 } }, c: gray }, ['a', 'b', 'c'], '7', 0);
    expect(f.a).toEqual({ data: { n: 2 }, under: gray });
    expect(f.c).toEqual({ data: { n: 3 }, under: gray });
  });

  it('reading order: rows, columns, snake', () => {
    // 2 × 3 grid of piece centers.
    const at = new Map<string, Pt>([
      ['tl', [0.1, 0.25]],
      ['tm', [0.5, 0.26]],
      ['tr', [0.9, 0.25]],
      ['bl', [0.1, 0.75]],
      ['bm', [0.5, 0.75]],
      ['br', [0.9, 0.74]],
    ]);
    const ids = [...at.keys()].reverse();
    expect(readingOrder(at, ids, 'rows')).toEqual(['tl', 'tm', 'tr', 'bl', 'bm', 'br']);
    expect(readingOrder(at, ids, 'snake')).toEqual(['tl', 'tm', 'tr', 'br', 'bm', 'bl']);
    expect(readingOrder(at, ids, 'columns')).toEqual(['tl', 'bl', 'tm', 'bm', 'tr', 'br']);
  });
});
