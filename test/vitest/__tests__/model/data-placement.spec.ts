// Spec 046: several placements per number, the brush, series maps, the single day first, the Leap
// day setting, and the order line's segments.
import { describe, expect, it } from 'vitest';
import { Value } from 'typebox/value';
import {
  averageValues,
  dataFill,
  dataNumbers,
  dataTap,
  dayOf,
  numberLabel,
  placeDate,
  relabel,
  seriesLabel,
  setLead,
  type DataBrush,
} from '@/model/data-quilt';
import { migrate } from '@/model/io';
import { quiltBlocks } from '@/model/library-items';
import { DataPlan, type ValueSlot } from '@/model/schema/data-quilt';
import type { Block } from '@/model/schema/block';
import { traceSegments } from '@/render/data-overlay';

const temp: ValueSlot = {
  label: 'High',
  kind: 'number',
  ranges: [
    { from: 0, to: 50, fill: { color: 'blue' } },
    { from: 50, to: 120, fill: { color: 'red' } },
  ],
  categories: [],
};
const mood: ValueSlot = {
  label: 'Mood',
  kind: 'category',
  ranges: [],
  categories: ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id, fill: { color: id } })),
};
const plan = (p: Partial<DataPlan> = {}): DataPlan => ({
  on: true,
  plan: 'weeks',
  start: '2027-01-01',
  slots: [temp, mood],
  places: [],
  unused: 'filler',
  waiting: 'designed',
  show: 'real',
  sim: { source: 'builtin', set: 'sample', series: [null, null] },
  entries: {},
  ...p,
});
/** A data block of `kind` whose paints use value letters `letters`; `oneDay`: a 1-day variant. */
const block = (id: string, kind: 'day' | 'week' | 'month', letters = [0], oneDay = false) =>
  ({
    id,
    kind: 'seam',
    notecard: { name: id },
    colorings: [
      { id: 'c', fills: Object.fromEntries(letters.map((l) => [l, { data: { n: 1, slot: l } }])) },
    ],
    data: {
      kind,
      ...(oneDay ? { variants: [{ days: 1, drawing: {}, patches: [] }] } : {}),
    },
  }) as unknown as Block;
const week = block('wk', 'week', [0], true);
const day = block('day', 'day');
const brush = (n: number, b = week, kind: DataBrush['kind'] = 'week', series?: number[]) => ({
  n,
  block: b,
  kind,
  ...(series ? { series } : {}),
});
const ok = (r: ReturnType<typeof dataTap>) => {
  if ('error' in r) throw new Error(r.error);
  return r;
};

describe('placing (US1)', () => {
  it('a number takes several spaces; the highlight moves on', () => {
    let r = ok(dataTap(plan(), 's1', brush(1)));
    expect(r.next).toBe(2);
    r = ok(dataTap(r.plan, 's2', brush(1)));
    expect(r.plan.places.map((p) => [p.space, p.n])).toEqual([
      ['s1', 1],
      ['s2', 1],
    ]);
  });

  it('a placed space changes what differs from the brush, or (nothing does) comes off', () => {
    const other = block('wk2', 'week');
    const p = ok(dataTap(plan(), 's1', brush(3))).plan;
    // Same number, other block: the block changes, the highlight stays.
    let r = ok(dataTap(p, 's1', brush(3, other)));
    expect(r.plan.places).toEqual([{ space: 's1', n: 3, block: 'wk2' }]);
    expect(r.next).toBe(3);
    // Same block, other number: the number changes.
    r = ok(dataTap(p, 's1', brush(5)));
    expect(r.plan.places).toEqual([{ space: 's1', n: 5, block: 'wk' }]);
    expect(r.next).toBe(6);
    // Both differ: both change.
    r = ok(dataTap(p, 's1', brush(7, other)));
    expect(r.plan.places).toEqual([{ space: 's1', n: 7, block: 'wk2' }]);
    // Same number and block, other series: the series changes.
    r = ok(dataTap(p, 's1', brush(3, week, 'week', [1])));
    expect(r.plan.places).toEqual([{ space: 's1', n: 3, block: 'wk', series: [1] }]);
    // All the same: taken off, the highlight on its number.
    r = ok(dataTap(p, 's1', brush(3)));
    expect(r.plan.places).toEqual([]);
    expect(r.next).toBe(3);
  });

  it('a block that can’t show the number’s kind is refused', () => {
    expect(dataTap(plan(), 's', brush(2, day, 'day'))).toHaveProperty('error');
    expect(dataTap(plan({ plan: 'months' }), 's', brush(1))).toHaveProperty('error');
  });
});

describe('series (US2)', () => {
  it('each placement maps the block’s values onto the quilt’s; the line follows the block’s order', () => {
    const three = block('t', 'week', [0, 1, 2]);
    const p = plan({ slots: [temp, temp, temp] });
    // Quilt A → block C, B → A, C → B: block A reads qB, B reads qC, C reads qA.
    const r = ok(dataTap(p, 's', brush(1, three, 'week', [1, 2, 0])));
    expect(seriesLabel(r.plan.places[0]!, three)).toBe('qB, qC, qA');
    expect(seriesLabel({ space: 's', n: 1, block: 'wk' }, week)).toBe('qA');
    // Fewer quilt values than the block's: several block values show one (qA → A and C).
    const two = ok(dataTap(plan({ slots: [temp, temp] }), 's', brush(1, three, 'week', [0, 1, 0])));
    expect(seriesLabel(two.plan.places[0]!, three)).toBe('qA, qB, qA');
    // A value the quilt doesn't have: refused.
    expect(dataTap(plan({ slots: [temp] }), 's', brush(1, three))).toHaveProperty('error');
    // A piece reads the quilt value its letter maps to.
    const q = plan({ entries: { '2027-01-01': [10, 'c'] } });
    const f = { data: { n: 1 } };
    expect(dataFill(q, { space: 's', n: 1, block: 'wk' }, f)).toEqual({ color: 'blue' });
    expect(dataFill(q, { space: 's', n: 1, block: 'wk', series: [1] }, f)).toEqual({
      color: 'c',
    });
  });
});

describe('the single day first (US5)', () => {
  it('a 1-day block on Wk 1 starts the year with it; the other blocks move up a week', () => {
    let p = ok(dataTap(plan(), 'w1', brush(1))).plan; // Wk 1
    p = ok(dataTap(p, 'w2', brush(2))).plan; // Wk 2
    // The first space retyped as Jan 1.
    const r = ok(dataTap(p, 'w1', brush(1, day, 'day')));
    expect(r.ask).toMatch(
      /Start the year with Jan 1 as a single day\? The other block keeps its place/,
    );
    expect(r.plan.lead).toBe(true);
    const by = Object.fromEntries(r.plan.places.map((x) => [x.space, numberLabel(r.plan, x.n)]));
    expect(by).toEqual({ w1: 'Jan 1', w2: 'Wk 1' });
    expect(numberLabel(r.plan, 53)).toBe('Wk 52');
    expect(placeDate(r.plan, dayOf(r.plan, 53, { n: 7 })!)).toBe('2027-12-31');
    // Nothing else placed: no question.
    expect(ok(dataTap(plan(), 'j1', brush(1, day, 'day'))).ask).toBeUndefined();
  });

  it('back to the end: a 1-day block on Wk 52, a week block on Jan 1, or Jan 1 emptied (asked)', () => {
    let lead = ok(dataTap(plan(), 'j1', brush(1, day, 'day'))).plan;
    lead = ok(dataTap(lead, 'w', brush(2))).plan; // Wk 1
    const r = ok(dataTap(lead, 'x', brush(53, day, 'day')));
    expect(r.ask).toMatch(/Make Jan 1 part of Wk 1 again.*Wk 1 becomes Wk 2/);
    expect(r.plan.lead).toBeUndefined();
    const by = Object.fromEntries(r.plan.places.map((x) => [x.space, numberLabel(r.plan, x.n)]));
    expect(by).toEqual({ j1: 'Wk 1', w: 'Wk 2', x: 'Dec 31' });
    const w = ok(dataTap(lead, 'j1', brush(1)));
    expect(w.ask).toBeDefined();
    expect(w.plan.lead).toBeUndefined();
    const off = ok(dataTap(lead, 'j1', brush(1, day, 'day')));
    expect(off.ask).toMatch(/single day back at the end/);
    expect(off.plan.lead).toBeUndefined();
    expect(off.plan.places).toEqual([{ space: 'w', n: 2, block: 'wk' }]); // now Wk 2
    expect(setLead(setLead(plan(), true), false)).toEqual(plan());
  });
  it('a week block on the single day at the end moves it to the start (asked); a block picked from another kind’s list is refused', () => {
    let p = ok(dataTap(plan(), 'w', brush(1))).plan; // Wk 1
    p = ok(dataTap(p, 'd', brush(53, week, 'day'))).plan; // Dec 31, the week block's 1-day variant
    const r = ok(dataTap(p, 'd', brush(53, week, 'week')));
    expect(r.ask).toMatch(
      /Move the single day \(Dec 31\) to the start of the year and make this Wk 52\?/,
    );
    const by = Object.fromEntries(r.plan.places.map((x) => [x.space, numberLabel(r.plan, x.n)]));
    expect(by).toEqual({ w: 'Jan 1', d: 'Wk 52' });
    // Not the end: a day pick on a week, or a week pick on a single day, says where to pick it.
    expect(dataTap(p, 'x', brush(5, week, 'day'))).toMatchObject({
      error: /pick wk under Week blocks/,
    });
    expect(
      dataTap(ok(dataTap(plan(), 'j', brush(1, day, 'day'))).plan, 'x', brush(1, week, 'week')),
    ).not.toHaveProperty('error');
  });
});

describe('Leap day (US6)', () => {
  const leapYear = (p: Partial<DataPlan>) => plan({ start: '2028-01-01', ...p });
  const labels = (p: DataPlan) => dataNumbers(p).map((x) => x.label);
  it('Weeks: extra (both ends), a 2-day number, or Feb 29 averaged or ignored', () => {
    const extra = labels(leapYear({}));
    expect([extra[0], extra[1], extra.at(-2), extra.at(-1), extra.length]).toEqual([
      'Jan 1',
      'Wk 1',
      'Wk 52',
      'Dec 31',
      54,
    ]);
    expect(labels(leapYear({ leap: 'pair' })).at(-1)).toBe('Dec 30–31');
    expect(dataNumbers(leapYear({ leap: 'pair' })).at(-1)).toMatchObject({ len: 2, kind: 'week' });
    for (const leap of ['average', 'ignore'] as const) {
      const p = leapYear({ leap });
      expect(labels(p)).toHaveLength(53);
      // Wk 9 (Feb 26 – Mar 3) runs past Feb 29.
      expect(placeDate(p, dayOf(p, 9, { n: 4 })!)).toBe('2028-03-01');
    }
  });

  it('Days: Feb 29 a number, or not', () => {
    expect(dataNumbers(leapYear({ plan: 'days' }))).toHaveLength(366);
    expect(dataNumbers(leapYear({ plan: 'days', leap: 'ignore' }))).toHaveLength(365);
    // A Days plan reads 2-day as extra.
    expect(dataNumbers(leapYear({ plan: 'days', leap: 'pair' }))).toHaveLength(366);
    // Months: untouched.
    expect(dataNumbers(leapYear({ plan: 'months', leap: 'ignore' }))[1]!.len).toBe(29);
  });

  it('average: numbers halved, categories rounded down or up', () => {
    expect(averageValues(temp, 40, 60)).toBe(50);
    expect(averageValues(temp, null, 60)).toBe(60);
    expect(averageValues(mood, 'a', 'b')).toBe('a');
    expect(averageValues(mood, 'a', 'b', 'up')).toBe('b');
    expect(averageValues(mood, 'a', 'c')).toBe('b');
    const p = leapYear({
      plan: 'days',
      leap: 'average',
      entries: { '2028-02-28': [40, 'a'], '2028-02-29': [70, 'b'] },
    });
    const place = { space: 's', n: 59, block: 'd' }; // Feb 28
    expect(dataFill(p, place, { data: { n: 1 } })).toEqual({ color: 'red' }); // 55
    expect(dataFill({ ...p, leapRound: 'up' }, place, { data: { n: 1, slot: 1 } })).toEqual({
      color: 'b',
    });
  });

  it('changing it moves placements by label; numbers that go take theirs off', () => {
    const p = leapYear({
      plan: 'days',
      places: [
        { space: 'a', n: 60, block: 'day' }, // Feb 29
        { space: 'b', n: 61, block: 'day' }, // Mar 1
      ],
    });
    const r = relabel(p, { ...p, leap: 'ignore' });
    expect(r.lost).toBe(1);
    expect(r.plan.places).toEqual([{ space: 'b', n: 60, block: 'day' }]);
    expect(Value.Check(DataPlan, r.plan)).toBe(true);
  });
});

describe('the order line (US3)', () => {
  const m = (order: number, x: number, y = 0) => ({ order, p: [x, y] as [number, number] });
  const segs = (ms: ReturnType<typeof m>[]) => traceSegments(ms).map(([a, b]) => `${a[0]}>${b[0]}`);
  it('one to one, one to many, many to one', () => {
    expect(segs([m(1, 0), m(2, 10)])).toEqual(['0>10']);
    expect(segs([m(1, 0), m(2, 10), m(2, 20)])).toEqual(['0>10', '0>20']);
    expect(segs([m(1, 0), m(1, 5), m(2, 10)])).toEqual(['0>10', '5>10']);
  });
  it('many to many: in order, each to the nearest left, then the rules above', () => {
    // x₁ = 0 takes 10 (nearer than 100); x₂ = 90 gets 100.
    expect(segs([m(1, 0), m(1, 90), m(2, 100), m(2, 10)])).toEqual(['0>10', '90>100']);
    // Three to two: x₁ takes its nearest, then x₂ and x₃ both go to the last.
    expect(segs([m(1, 0), m(1, 50), m(1, 60), m(2, 1), m(2, 55)])).toEqual([
      '0>1',
      '50>55',
      '60>55',
    ]);
    // Numbers missing between: the next one present.
    expect(segs([m(1, 0), m(3, 10)])).toEqual(['0>10']);
  });
});

describe('format v10 (spec 046)', () => {
  const v9 = (data: Record<string, unknown>) => ({
    format: 'rrq',
    version: 9,
    project: { quilts: [{ id: 'q', data }] },
  });
  const places = (doc: Record<string, unknown>) =>
    (doc.project as { quilts: { data: { places: unknown } }[] }).quilts[0]!.data.places;
  it('the numbered list and types become placements', () => {
    const doc = migrate(v9({ plan: 'months', order: ['a', null, 'b'], types: { a: 'x', b: 'y' } }));
    expect(places(doc)).toEqual([
      { space: 'a', n: 1, block: 'x' },
      { space: 'b', n: 3, block: 'y' },
    ]);
  });
  it('a leap year’s Weeks list: weeks move up one, Dec 30 goes to Jan 1', () => {
    const order = Array.from({ length: 54 }, (_, i) => `s${i + 1}`);
    const types = Object.fromEntries(order.map((s) => [s, 'w']));
    const doc = migrate(v9({ plan: 'weeks', start: '2028-01-01', order, types }));
    const by = Object.fromEntries(
      (places(doc) as { space: string; n: number }[]).map((p) => [p.space, p.n]),
    );
    expect([by.s1, by.s52, by.s53, by.s54]).toEqual([2, 53, 1, 54]);
  });
});

describe('blocks in use', () => {
  it('a data block placed only as its variant counts as used', () => {
    const q = {
      layers: [{ slots: { s: { block: 'head-v1', coloring: 'c' } }, items: [] }],
      data: plan({ places: [{ space: 's', n: 53, block: 'head' }] }),
    } as unknown as Parameters<typeof quiltBlocks>[0];
    expect(quiltBlocks(q)).toContain('head');
  });
});
