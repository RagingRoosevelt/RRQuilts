import { describe, expect, it } from 'vitest';
import { applyLayout, convertLayout, generateSlots, reconcile } from '@/model/layout/slots';
import { onPointDefaults } from '@/model/io';
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

describe('convertLayout', () => {
  const h: HorizontalLayout = { ...layout(3, 4), block: [8, 6], sash: [2, 1] };
  const op = convertLayout(h, 'on-point', 'in');
  const d = onPointDefaults(1);

  it('Horizontal to On-Point keeps counts, block and sash width, defaults for the rest', () => {
    expect(op).toEqual({ ...d, cols: 3, rows: 4, block: 8, sash: 2 });
  });

  it('On-Point back to Horizontal is square with no sash border', () => {
    expect(convertLayout({ ...d, block: 8, sash: 2 }, 'horizontal', 'in')).toMatchObject({
      style: 'horizontal',
      block: [8, 8],
      sash: [2, 2],
      sashBorder: false,
    });
  });

  it('keeps all nine blocks going to On-Point, drops between and setting pieces coming back', () => {
    const q = filledQuilt(3, 3);
    q.borders = [];
    q.layout = layout(3, 3);
    expect(reconcile(q, convertLayout(q.layout, 'on-point', 'in'), []).dropped).toEqual([]);
    const o = structuredClone(q);
    o.layout = { ...d, cols: 3, rows: 3 };
    o.layers[0].slots = {
      'b:r1c1': { block: 'seam1', coloring: 'qk1', rotation: 0, flip: false },
      'b:m:r1c1': { block: 'seam1', coloring: 'qk1', rotation: 0, flip: false },
      'set:m:r0c1': { block: 'seam1', coloring: 'qk1', rotation: 0, flip: false },
    };
    expect(reconcile(o, layout(3, 3), []).dropped.sort()).toEqual(['b:m:r1c1', 'set:m:r0c1']);
  });
});

describe('blocks at On-Point edge positions follow the edge finish', () => {
  const op = (finish: 'exact' | 'trim', corner: 'triangle' | 'seam' = 'triangle') => ({
    ...onPointDefaults(1),
    corner,
    edge: { finish, float: 1 },
  });
  const at = (slots: Record<string, unknown>, id: string) => Object.keys(slots).includes(id);
  const placed = { block: 'seam1', coloring: 'qk1', rotation: 0 as const, flip: false };

  it('a block in a setting piece becomes the trimmed block there, and back', () => {
    const q = structuredClone(fixture().project.quilts[0]!);
    q.layout = op('exact');
    q.borders = [];
    q.layers[0].slots = {
      'set:m:r0c1': placed,
      'set:m:r0c2': { ...placed, block: 'plain' },
    };
    const toTrim = reconcile(q, op('trim'), []);
    expect(at(toTrim.slots, 'b:m:r0c1')).toBe(true);
    expect(toTrim.dropped).toEqual(['set:m:r0c2']); // plain fill has nowhere to go
    q.layout = op('trim');
    q.layers[0].slots = toTrim.slots;
    expect(at(reconcile(q, op('exact'), []).slots, 'set:m:r0c1')).toBe(true);
  });

  it('a seam corner hands its first half to the trimmed corner block', () => {
    const q = structuredClone(fixture().project.quilts[0]!);
    q.layout = op('exact', 'seam');
    q.borders = [];
    q.layers[0].slots = { 'set:m:r0c0:1': placed };
    expect(at(reconcile(q, op('trim'), []).slots, 'b:m:r0c0')).toBe(true);
    q.layout = op('trim');
    q.layers[0].slots = { 'b:m:r0c0': placed };
    expect(at(reconcile(q, op('exact', 'seam'), []).slots, 'set:m:r0c0:1')).toBe(true);
  });
});
