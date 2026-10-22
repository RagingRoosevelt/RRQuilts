import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { Value } from 'typebox/value';
import {
  applyPicks,
  dataFill,
  dataReport,
  fillNumbers,
  moveNumber,
  newDataPlan,
  nextFree,
  numberCount,
  numberLabel,
  numberName,
  placeNumber,
  presetSlot,
  takeBack,
  dayDate,
  dayOf,
  periodLength,
  scaleFill,
  slotColoring,
} from '@/model/data-quilt';
import { Quilt } from '@/model/schema/quilt';
import { DataPlan, type ValueSlot } from '@/model/schema/data-quilt';
import type { Block } from '@/model/schema/block';
import { fixture } from './helpers';

const temp: ValueSlot = {
  label: 'High',
  preset: 'temperature',
  kind: 'number',
  unit: '°F',
  ranges: [
    { from: 0, to: 40, fill: { color: 'blue' } },
    { from: 40, to: 70, fill: { color: 'green' } },
    { from: 70, to: 120, fill: { color: 'red' } },
  ],
  categories: [],
};
const mood: ValueSlot = {
  label: 'Mood',
  kind: 'category',
  ranges: [],
  categories: [
    { id: 'sad', name: 'Sad', fill: { color: 'gray' } },
    { id: 'ok', name: 'Fine', fill: { color: 'yellow' } },
  ],
};
const plan = (p: Partial<DataPlan> = {}): DataPlan => ({
  on: true,
  plan: 'months',
  start: '2027-01-01',
  slots: [temp, mood],
  order: [],
  picks: {},
  seed: 0,
  unused: 'filler',
  waiting: 'designed',
  filler: { color: 'black' },
  show: 'real',
  sim: { source: 'builtin', set: 'sample', series: ['high', 'mood'] },
  entries: {},
  ...p,
});

describe('data quilt days (spec 025)', () => {
  it('a period is a year: 366 days when it holds 29 February', () => {
    expect(periodLength('2027-01-01')).toBe(365);
    expect(periodLength('2028-01-01')).toBe(366);
    expect(periodLength('2027-09-01')).toBe(366);
    expect(dayDate('2027-01-01', 32)).toBe('2027-02-01');
  });

  it('months: unit month + local day; past the month is unused', () => {
    const p = plan();
    expect(dayOf(p, 2, { n: 28 })).toBe(59);
    expect(dayOf(p, 2, { n: 29 })).toBeUndefined();
    expect(dayOf(plan({ start: '2028-01-01' }), 2, { n: 29 })).toBe(60);
    expect(dayOf(p, undefined, { n: 3 })).toBeNull();
    expect(dayOf(plan({ start: '2027-09-01' }), 5, { n: 1 })).toBe(123); // January 1st
  });

  it('weeks: 7-day runs from the start, then a number per day left over', () => {
    const p = plan({ plan: 'weeks' });
    expect(numberCount(p)).toBe(53);
    expect(dayOf(p, 52, { n: 7 })).toBe(364);
    expect(dayOf(p, 1, { n: 8 })).toBeUndefined();
    expect(dayOf(p, 53, { n: 1 })).toBe(365);
    expect(dayOf(p, 53, { n: 2 })).toBeUndefined();
    const leap = plan({ plan: 'weeks', start: '2027-03-01' });
    expect(numberCount(leap)).toBe(54);
    expect(dayOf(leap, 54, { n: 1 })).toBe(366);
  });

  it('days: a number per day', () => {
    const p = plan({ plan: 'days' });
    expect(numberCount(p)).toBe(365);
    expect(dayOf(p, 10, { n: 1 })).toBe(10);
    expect(dayOf(p, 10, { n: 2 })).toBeUndefined();
  });
});

describe('data quilt scales', () => {
  it('ranges: the range holding it (from inclusive), else the nearest', () => {
    expect(scaleFill(temp, 40)).toEqual({ color: 'green' });
    expect(scaleFill(temp, 39.9)).toEqual({ color: 'blue' });
    expect(scaleFill(temp, -10)).toEqual({ color: 'blue' });
    expect(scaleFill(temp, 130)).toEqual({ color: 'red' });
    expect(scaleFill(temp, null)).toBeUndefined();
  });

  it('categories: by id, name, or place in the list', () => {
    expect(scaleFill(mood, 'ok')).toEqual({ color: 'yellow' });
    expect(scaleFill(mood, 'sad')).toEqual({ color: 'gray' });
    expect(scaleFill(mood, 'fine')).toEqual({ color: 'yellow' });
    expect(scaleFill(mood, 1)).toEqual({ color: 'gray' });
    expect(scaleFill(mood, 9)).toEqual({ color: 'yellow' });
  });

  it('real data, waiting days and unused places', () => {
    const f = { data: { n: 5 }, under: { color: 'cream' } };
    const p = plan({ entries: { '2027-03-05': [75, 'ok'] } });
    expect(dataFill(p, 3, f)).toEqual({ color: 'red' });
    expect(dataFill(p, 3, { data: { n: 5, slot: 1 } })).toEqual({ color: 'yellow' });
    expect(dataFill(p, 4, f)).toEqual({ color: 'cream' }); // waiting: as designed
    expect(dataFill({ ...p, waiting: 'filler' }, 4, f)).toEqual({ color: 'black' });
    expect(dataFill({ ...p, waiting: 'simulation' }, 4, f)).toHaveProperty('color');
    expect(dataFill(p, 2, { data: { n: 30 }, under: { color: 'cream' } })).toEqual({
      color: 'black',
    });
    expect(
      dataFill({ ...p, unused: 'designed' }, 2, { data: { n: 30 }, under: { color: 'cream' } }),
    ).toEqual({ color: 'cream' });
    expect(dataFill(p, undefined, f)).toBe(f); // no unit: still a place
  });
});

/** The fixture's first quilt, its first space holding number 3 and painted day 5. */
function dataQuilt(p: DataPlan): { q: Quilt; slotId: string } {
  const q = structuredClone<Quilt>(fixture().project.quilts[0]!);
  const slotId = Object.keys(q.layers[0].slots)[0]!;
  const s = q.layers[0].slots[slotId]!;
  q.colorings[s.coloring] = { fills: { a: { data: { n: 5 } }, b: { color: 'cream' } } };
  q.data = { ...p, order: [null, null, slotId] };
  return { q, slotId };
}

describe('slotColoring', () => {
  it('works out data paints; leaves other fills', () => {
    const { q, slotId } = dataQuilt(plan({ entries: { '2027-03-05': [10, null] } }));
    expect(Value.Check(Quilt, q)).toBe(true);
    const c = slotColoring(q, slotId, undefined);
    expect(c?.fills).toEqual({ a: { color: 'blue' }, b: { color: 'cream' } });
  });

  it('a switched-off plan shows the places', () => {
    const { q, slotId } = dataQuilt(plan());
    q.data!.on = false;
    expect(slotColoring(q, slotId, undefined)?.fills.a).toEqual({ data: { n: 5 } });
  });
});

describe('block pools', () => {
  /** A block with `n` day places. */
  const block = (id: string, n: number): Block => {
    const b = structuredClone(fixture().project.blocks[0]!);
    b.colorings[0]!.fills = Object.fromEntries(
      Array.from({ length: n }, (_, i) => [`p${i}`, { data: { n: i + 1 } }]),
    );
    return { ...b, id };
  };
  const blocks = [block('m28', 28), block('m29', 29), block('m31a', 31), block('m31b', 31)];

  it('each placed number shows a block from the pool for its days; a block too small is passed over', () => {
    const { q, slotId } = dataQuilt(plan({ start: '2028-01-01' }));
    const ids = [slotId, 'u2', 'u3', 'u4'];
    const next = produce(q, (d) => {
      // Numbers 2 (Feb 2028), 4 (Apr), 1 (Jan), 3 (Mar).
      d.data!.order = [ids[2]!, ids[0]!, ids[3]!, ids[1]!];
      d.data!.picks = { '29': ['m28', 'm29'], '31': ['m31a', 'm31b'] };
      let n = 0;
      applyPicks(d, blocks, () => `c${n++}`);
    });
    const at = (i: number) => next.layers[0].slots[ids[i]!]?.block;
    expect(at(0)).toBe('m29'); // m28 has too few places for the 29 pool
    expect(at(1)).toBeUndefined(); // April: the 30 pool is empty
    expect(['m31a', 'm31b']).toContain(at(2));
    expect(['m31a', 'm31b']).toContain(at(3));
    expect(next.colorings[next.layers[0].slots[slotId]!.coloring]).toBeDefined();
    // Stable until shuffled.
    const again = produce(next, (d) => applyPicks(d, blocks, () => 'zz'));
    expect(again).toBe(next);
    // A number taken back (or Clear) empties its space.
    const cleared = produce(next, (d) => {
      d.data!.order = [null, null, null, null];
      applyPicks(d, blocks, () => 'zz');
    });
    for (const id of ids) expect(cleared.layers[0].slots[id]).toBeUndefined();
    expect(cleared.colorings[next.layers[0].slots[slotId]!.coloring]).toBeUndefined();
  });
});

describe('setting a plan up', () => {
  it('a new plan and every preset are valid; ranges run on without gaps', () => {
    for (const units of ['in', 'cm'] as const) {
      const p = newDataPlan(units, 2027);
      for (const preset of ['temperature', 'mood', 'daylight', 'rainfall', 'custom'] as const) {
        const s = presetSlot(preset, units);
        p.slots = [s];
        expect(Value.Check(DataPlan, p)).toBe(true);
        s.ranges.slice(1).forEach((r, i) => expect(r.from).toBe(s.ranges[i]!.to));
      }
    }
    expect(scaleFill(presetSlot('temperature', 'in'), 75)).toEqual({ color: 'rrquilts.yellow' });
  });

  it('the numbered list: place, take back, skip placed, fill, reorder', () => {
    let p = plan({ order: Array<null>(12).fill(null) });
    p = placeNumber(p, 's1', 1);
    p = placeNumber(p, 's3', 3);
    expect(nextFree(p, 1)).toBe(2);
    expect(nextFree(p, 3)).toBe(4); // 3 placed: skipped
    p = placeNumber(p, 's1', 5); // a space holds one number
    expect(p.order.slice(0, 5)).toEqual([null, null, 's3', null, 's1']);
    p = takeBack(p, 's3');
    expect(nextFree(p, 3)).toBe(3);
    p = fillNumbers(p, ['s1', 'a', 'b']);
    expect(p.order.slice(0, 5)).toEqual(['a', 'b', null, null, 's1']);
    p = moveNumber(p, 5, 1); // s1 becomes 001, the rest move down
    expect(p.order.slice(0, 5)).toEqual(['s1', 'a', 'b', null, null]);
    expect(p.order).toHaveLength(12);
    expect(numberLabel(p, 7)).toBe('Jul');
    expect(numberLabel(plan({ plan: 'weeks' }), 7)).toBe('007');
    expect(numberName(p, 3)).toBe('Mar');
    expect(numberName({ ...p, start: '2027-09-01' }, 5)).toBe('Jan');
    expect(numberName(plan({ plan: 'weeks' }), 2)).toBe('Week of Jan 8');
    const full = fillNumbers(
      p,
      Array.from({ length: 14 }, (_, i) => `x${i}`),
    );
    expect(nextFree(full)).toBeUndefined();
  });

  it('the report: numbers not placed, empty pools, unnumbered spaces, days without a place', () => {
    const { q, slotId } = dataQuilt(plan());
    q.data!.order = [null, null, slotId, ...Array<null>(9).fill(null)];
    const r = dataReport(q, []).join(' ');
    expect(r).toMatch(/11 numbers not placed yet: Jan, Feb, Apr/);
    expect(r).toMatch(/The 31-day pool has no block yet/);
    expect(r).toMatch(/364 days have no place/);
    q.data!.order = [];
    expect(dataReport(q, []).join(' ')).toMatch(/1 space has day places but no number/);
  });
});

describe('worst-case yardage (spec 025 US6)', () => {
  it('each range counts its most days (default: its days in the sample) in the largest place', async () => {
    const { dataYardagePieces } = await import('@/model/print/data-yardage');
    const { quiltPieces } = await import('@/model/print/pieces');
    const doc = structuredClone(fixture());
    const q = doc.project.quilts[0]!;
    const [slotId, s] = Object.entries(q.layers[0].slots).find(([, x]) =>
      doc.project.blocks.find((b) => b.id === x.block && 'patches' in b && b.patches.length > 1),
    )!;
    const block = doc.project.blocks.find((b) => b.id === s.block)!;
    const patch = ('patches' in block ? block.patches : [])[0]!.id;
    q.colorings[s.coloring] = { fills: { [patch]: { data: { n: 5 } } } };
    q.data = { ...plan({ show: 'simulation', slots: [temp] }), order: [null, null, slotId] };
    const off = quiltPieces(doc, { ...q, data: { ...q.data, on: false } });
    const worst = dataYardagePieces(doc, q);
    const keys = new Set(temp.ranges.map((r) => `color:${(r.fill as { color: string }).color}`));
    // Every slot holding this coloring has one place; the data places become 365 days' worth.
    const places = worst.filter((p) => keys.has(p.fill)).length;
    expect(places).toBe(365);
    expect(worst.length).toBe(off.filter((p) => !p.fill.startsWith('data:')).length + 365);
    q.data.slots = [{ ...temp, ranges: temp.ranges.map((r) => ({ ...r, most: 10 })) }];
    expect(dataYardagePieces(doc, q).filter((p) => keys.has(p.fill)).length).toBe(30);
  });
});
