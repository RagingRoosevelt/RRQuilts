import { describe, expect, it } from 'vitest';
import {
  clearNumerals,
  numeralCounts,
  paintLabel,
  putNumeral,
  readingOrder,
} from '@/model/data-paint';
import type { Pt } from '@/model/geometry/path';
import type { Fill } from '@/model/schema/coloring';

const gray: Fill = { color: 'gray' };

describe('data places (spec 025 US1)', () => {
  it('numerals: on over the color, on several patches, off again', () => {
    let f: Record<string, Fill> = { a: gray, b: gray, c: gray };
    f = putNumeral(f, 'a', 5, 0);
    f = putNumeral(f, 'b', 5, 0);
    expect(f.a).toEqual({ data: { n: 5 }, under: gray });
    expect(numeralCounts(f, ['a', 'b', 'c'], 0).get(5)).toBe(2);
    f = putNumeral(f, 'b', 6, 0); // another numeral replaces it
    expect(f.b).toEqual({ data: { n: 6 }, under: gray });
    f = putNumeral(f, 'a', 5, 0); // the same numeral comes off
    expect(f.a).toEqual(gray);
    f = putNumeral(f, 'c', 1, 1);
    expect(f.c).toEqual({ data: { n: 1, slot: 1 }, under: gray });
    expect(numeralCounts(f, ['a', 'b', 'c'], 0).get(1)).toBeUndefined();
    expect(paintLabel({ n: 1, slot: 1 })).toBe('1B');
    // Clear: value A's numerals off the given patches only.
    const c = clearNumerals({ ...f, d: { data: { n: 2 } } }, ['b', 'c'], 0);
    expect(c.b).toEqual(gray);
    expect(c.c).toEqual(f.c); // value B stays
    expect(c.d).toEqual({ data: { n: 2 } }); // not among the patches
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

describe('CSV into data values (spec 025 US4, US5)', () => {
  it('reads rows, dates and values; skips what isn’t a date', async () => {
    const { parseCsv, parseDate, guessDateColumn, csvValues, hasHeader } =
      await import('@/model/data-csv');
    const rows = parseCsv(
      'Day;High;Mood\n2027-01-01;31;"Good"\n1/2/2027;28,5;Low\nnot a date;3;x\n2027-02-30;1;y\n',
    );
    expect(rows[1]).toEqual(['2027-01-01', '31', 'Good']);
    expect(parseDate('3/5/2027')).toBe('2027-03-05');
    expect(parseDate('2027/3/5')).toBe('2027-03-05');
    expect(parseDate('2027-02-30')).toBeUndefined();
    expect(guessDateColumn(rows)).toBe(0);
    expect(hasHeader(rows, 0)).toBe(true);
    const r = csvValues(rows, 0, [1, 2]);
    expect(r.values).toEqual({ '2027-01-01': [31, 'Good'], '2027-01-02': [28.5, 'Low'] });
    expect([r.read, r.skipped]).toEqual([2, 2]);
    expect(csvValues(parseCsv('2027-01-01,72°F'), 0, [1]).values['2027-01-01']).toEqual([72]);
  });
});
