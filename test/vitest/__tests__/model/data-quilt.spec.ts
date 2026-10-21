import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { Value } from 'typebox/value';
import {
  applyPicks,
  dataFill,
  dataReport,
  newDataPlan,
  nextUnit,
  nextYearDay,
  numberUnits,
  presetSlot,
  toggleUnit,
  unitLabel,
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
  units: {},
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

  it('weeks: 7-day runs from the start; year days anywhere', () => {
    const p = plan({ plan: 'weeks' });
    expect(dayOf(p, 52, { n: 7 })).toBe(364);
    expect(dayOf(p, 1, { n: 8 })).toBeUndefined();
    expect(dayOf(p, undefined, { n: 365, year: true })).toBe(365);
    expect(dayOf(p, undefined, { n: 366, year: true })).toBeUndefined();
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

/** The fixture's first quilt, its first space numbered 3 and painted day 5. */
function dataQuilt(p: DataPlan): { q: Quilt; slotId: string } {
  const q = structuredClone<Quilt>(fixture().project.quilts[0]!);
  const slotId = Object.keys(q.layers[0].slots)[0]!;
  const s = q.layers[0].slots[slotId]!;
  q.colorings[s.coloring] = { fills: { a: { data: { n: 5 } }, b: { color: 'cream' } } };
  q.data = { ...p, units: { [slotId]: 3 } };
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

describe('month picks', () => {
  const block = (id: string): Block => ({ ...structuredClone(fixture().project.blocks[0]!), id });
  const blocks = ['m28', 'm29', 'm31a', 'm31b'].map(block);

  it('each numbered space shows a pick for its length, else the next longer', () => {
    const { q, slotId } = dataQuilt(plan({ start: '2028-01-01' }));
    const ids = [slotId, 'u2', 'u3', 'u4'];
    const units = Object.fromEntries(ids.map((id, i) => [id, [2, 4, 1, 3][i]!]));
    const next = produce(q, (d) => {
      d.data!.units = units;
      d.data!.picks = { '28': ['m28'], '29': ['m29'], '31': ['m31a', 'm31b'] };
      let n = 0;
      applyPicks(d, blocks, () => `c${n++}`);
    });
    const at = (i: number) => next.layers[0].slots[ids[i]!]!.block;
    expect(at(0)).toBe('m29'); // February 2028
    expect(['m31a', 'm31b']).toContain(at(1)); // April: no 30, so 31
    expect(['m31a', 'm31b']).toContain(at(2));
    expect(next.colorings[next.layers[0].slots[slotId]!.coloring]).toBeDefined();
    // Stable until shuffled.
    const again = produce(next, (d) => applyPicks(d, blocks, () => 'zz'));
    expect(again).toBe(next);
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

  it('unit numbers: next free, take back, number many in order', () => {
    let p = plan();
    p = toggleUnit(p, 's1')!;
    p = toggleUnit(p, 's2')!;
    expect(p.units).toEqual({ s1: 1, s2: 2 });
    p = toggleUnit(p, 's1')!;
    expect(nextUnit(p)).toBe(1);
    p = numberUnits(p, ['s3', 's2', 's4']);
    expect(p.units).toEqual({ s2: 2, s3: 1, s4: 3 });
    expect(unitLabel(p, 3)).toBe('Mar');
    expect(unitLabel({ ...p, start: '2027-09-01' }, 5)).toBe('Jan');
    const full = numberUnits(
      { ...p, units: {} },
      Array.from({ length: 14 }, (_, i) => `x${i}`),
    );
    expect(Object.keys(full.units)).toHaveLength(12);
    expect(toggleUnit(full, 'more')).toBeUndefined();
  });

  it('the report: numbers twice, missing months, unnumbered spaces, days without a place', () => {
    const { q, slotId } = dataQuilt(plan());
    q.data!.units = { [slotId]: 3, other: 3 };
    const r = dataReport(q, []);
    expect(r.join(' ')).toMatch(/more than one space: Mar/);
    expect(r.join(' ')).toMatch(/No space yet for Jan, Feb, Apr/);
    expect(r.join(' ')).toMatch(/364 days have no place/);
    q.data!.units = {};
    expect(dataReport(q, []).join(' ')).toMatch(/1 space has day places but no month number/);
  });

  it('next year day counts the whole quilt', () => {
    const { q, slotId } = dataQuilt(plan());
    const s = q.layers[0].slots[slotId]!;
    q.colorings[s.coloring]!.fills.c = { data: { n: 1, year: true } };
    expect(nextYearDay(q, [], 0)).toBe(2);
    expect(nextYearDay(q, [], 1)).toBe(1);
  });
});
