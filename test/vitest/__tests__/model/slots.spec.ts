import { describe, expect, it } from 'vitest';
import { applyLayout, generateSlots, reconcile } from '@/model/layout/slots';
import type { Border, HorizontalLayout, Quilt } from '@/model/schema/quilt';
import { fixture } from './helpers';

const layout = (cols: number, rows: number): HorizontalLayout => ({
  style: 'horizontal',
  cols,
  rows,
  block: [9, 9],
  sash: [1, 1],
  sashBorder: true,
});
const borders: Border[] = [
  { style: 'long-horizontal', sides: [2, 2, 2, 2] },
  { style: 'mitered', sides: [3, 3, 3, 3] },
];

function filledQuilt(cols: number, rows: number): Quilt {
  const q = structuredClone(fixture().project.quilts[0]!);
  q.layout = layout(cols, rows);
  q.borders = borders;
  q.layers[0].slots = {};
  for (const s of generateSlots(q.layout, q.borders).slots) {
    if (s.id.startsWith('b:'))
      q.layers[0].slots[s.id] = { block: 'seam1', coloring: 'qk1', rotation: 90, flip: true };
  }
  return q;
}

describe('horizontal layout slots', () => {
  const g = generateSlots(layout(5, 6), borders);
  const byId = new Map(g.slots.map((s) => [s.id, s]));

  it('creates blocks, sashes, cornerstones, and border sides', () => {
    const count = (prefix: string) => g.slots.filter((s) => s.id.startsWith(prefix)).length;
    expect(count('b:')).toBe(30);
    expect(count('sash:v:')).toBe(6 * 6); // 6 rows × (left border + after each of 5 cols)
    expect(count('sash:h:')).toBe(7 * 5);
    expect(count('cs:')).toBe(7 * 6);
    expect(count('border:')).toBe(8);
    expect(g.unsupported).toEqual([]);
  });

  it('places blocks after the sash border with exact transforms', () => {
    expect(byId.get('b:r1c1')!.transform).toEqual([9, 0, 0, 9, 1, 1]);
    expect(byId.get('b:r3c4')!.transform).toEqual([9, 0, 0, 9, 31, 21]);
    expect(byId.get('sash:v:r1c0')!.transform).toEqual([1, 0, 0, 9, 0, 1]);
    expect(byId.get('cs:r6c5')!.transform).toEqual([1, 0, 0, 1, 50, 60]);
  });

  it('computes center and finished size including borders', () => {
    expect(g.center).toEqual([0, 0, 51, 61]);
    expect(g.bounds).toEqual([-5, -5, 56, 66]); // 61 × 71 finished
  });

  it('miters border corners', () => {
    expect(byId.get('border:2:top')!.outline).toEqual([
      ['M', -5, -5],
      ['L', 56, -5],
      ['L', 53, -2],
      ['L', -2, -2],
      ['Z'],
    ]);
  });

  it('is deterministic', () => {
    expect(generateSlots(layout(5, 6), borders)).toEqual(g);
  });

  it('reports styles without generators but still places them as strips', () => {
    const r = generateSlots(layout(2, 2), [{ style: 'points-in', sides: [2, 2, 2, 2] }]);
    expect(r.unsupported).toEqual(['border 1 points-in']);
    expect(r.slots.filter((s) => s.id.startsWith('border:'))).toHaveLength(4);
  });
});

describe('changing a layout keeps what still fits', () => {
  it('5×6 → 6×6 keeps all 30 blocks with rotation and coloring', () => {
    const q = filledQuilt(5, 6);
    const r = reconcile(q, layout(6, 6), borders);
    expect(r.dropped).toEqual([]);
    const next = applyLayout(q, layout(6, 6), borders);
    expect(Object.keys(next.layers[0].slots)).toHaveLength(30);
    expect(next.layers[0].slots['b:r6c5']).toEqual({
      block: 'seam1',
      coloring: 'qk1',
      rotation: 90,
      flip: true,
    });
    expect(next.layers[0].slots['b:r1c6']).toBeUndefined();
  });

  it('5×6 → 4×6 reports the 6 blocks that would be lost', () => {
    const r = reconcile(filledQuilt(5, 6), layout(4, 6), borders);
    expect(r.dropped.sort()).toEqual(['b:r1c5', 'b:r2c5', 'b:r3c5', 'b:r4c5', 'b:r5c5', 'b:r6c5']);
  });
});
