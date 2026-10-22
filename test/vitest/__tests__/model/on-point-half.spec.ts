import { describe, expect, it } from 'vitest';
import { onPointDefaults } from '@/model/io';
import { generateSlots } from '@/model/layout/slots';
import { pathPolygon } from '@/model/geometry/path';
import { area } from '@/model/print/polygon';
import type { Layout } from '@/model/schema/quilt';

const onPoint = (cols: number, rows: number, finish: 'exact' | 'none' = 'exact'): Layout => ({
  ...onPointDefaults(1),
  cols,
  rows,
  block: 10,
  sash: 0,
  edge: { finish, float: 0 },
});
const ids = (l: Layout) => generateSlots(l, []).slots.map((s) => s.id);
const D = 10 * Math.SQRT2;

describe('On-Point half rows (a half row is the short row after the last long one)', () => {
  it('2 × 2½: the short row between rows 2 and 3 is blocks, row 3 setting pieces', () => {
    const whole = ids(onPoint(2, 2));
    const half = ids(onPoint(2, 2.5));
    expect(whole).not.toContain('b:m:r2c1');
    expect(half).toContain('b:m:r2c1');
    expect(half).toEqual(expect.arrayContaining(['set:r3c1', 'set:r3c2']));
    expect(half.filter((i) => i.startsWith('b:'))).toHaveLength(
      whole.filter((i) => i.startsWith('b:')).length + 1,
    );
    // Half a block's diagonal taller, no wider.
    const [, , w2, h2] = generateSlots(onPoint(2, 2), []).bounds;
    const [, , w, h] = generateSlots(onPoint(2, 2.5), []).bounds;
    expect(w).toBeCloseTo(w2);
    expect(h - h2).toBeCloseTo(D / 2);
    // Another half: the next long row, as 2 × 3.
    expect(
      ids(onPoint(2, 3))
        .filter((i) => i.startsWith('b:'))
        .sort(),
    ).toEqual(
      ['b:r1c1', 'b:r1c2', 'b:r2c1', 'b:r2c2', 'b:r3c1', 'b:r3c2', 'b:m:r1c1', 'b:m:r2c1'].sort(),
    );
  });

  it('2½ across adds the short column; whole cubes trace the same blocks', () => {
    const half = ids(onPoint(2.5, 2));
    expect(half).toContain('b:m:r1c2');
    expect(half).toEqual(expect.arrayContaining(['set:r1c3', 'set:r2c3']));
    const g = generateSlots(onPoint(2.5, 2.5, 'none'), []);
    expect(g.edge.length).toBeGreaterThan(8);
    expect(g.slots.filter((s) => s.kind === 'block')).toHaveLength(4 + 4);
  });

  it('pieces cover the quilt exactly: no gaps, no overlaps, half or whole, sashed or floating', () => {
    for (const [cols, rows] of [
      [4, 3],
      [4, 3.5],
      [3.5, 3],
      [3.5, 3.5],
      [1, 1],
      [1.5, 1],
    ])
      for (const [sash, float] of [
        [0, 0],
        [0, 2],
        [1.5, 0],
        [1.5, 2],
      ])
        for (const corner of ['triangle', 'seam'] as const) {
          const l = {
            ...onPoint(cols!, rows!),
            sash,
            corner,
            edge: { finish: 'float', float },
          } as Layout;
          const g = generateSlots(l, []);
          const [x0, y0, x1, y1] = g.center;
          const pieces = g.slots.reduce((t, x) => t + area(pathPolygon(x.outline, [1, 1])), 0);
          expect(pieces).toBeCloseTo((x1 - x0) * (y1 - y0), 6);
        }
  });

  it('a whole count is as before', () => {
    expect(ids(onPoint(3, 3))).toContain('set:m:r3c3');
  });
});
