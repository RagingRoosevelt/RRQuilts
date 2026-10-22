import { describe, expect, it } from 'vitest';
import { castDraft, produce } from 'immer';
import { Value } from 'typebox/value';
import {
  moveBound,
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
  pruneVariants,
  syncVariants,
  takesKind,
  variantFor,
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
  types: {},
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

describe('data block types and variants', () => {
  /** A month data block with 30 and 28-day variants (its own drawing is the 31). */
  const month = (): Block => {
    const b = structuredClone(fixture().project.blocks.find((x) => x.kind === 'seam')!);
    if (b.kind !== 'seam') throw new Error('seam block expected');
    const v = (days: 28 | 30) => ({ days, drawing: b.drawing, patches: b.patches });
    return { ...b, id: 'ms', data: { kind: 'month', variants: [v(30), v(28)] } };
  };

  it('each placed space shows its type’s smallest variant with enough days', () => {
    const { q, slotId } = dataQuilt(plan({ start: '2028-01-01' }));
    const ids = [slotId, 'u2', 'u3', 'u4'];
    const blocks: Block[] = [month()];
    syncVariants(blocks, [{ ...q, data: { ...q.data!, types: { x: 'ms' } } }]);
    expect(blocks.map((b) => b.id)).toEqual(['ms', 'ms-v30', 'ms-v28']);
    expect(blocks[1]!.notecard.tags).toEqual(['system']);
    const next = produce(q, (d) => {
      // Jan, Feb (29 days in 2028), Mar, Apr.
      d.data!.order = ids;
      d.data!.types = Object.fromEntries(ids.map((id) => [id, 'ms']));
      let n = 0;
      applyPicks(d, blocks, () => `c${n++}`);
    });
    const at = (i: number) => next.layers[0].slots[ids[i]!]?.block;
    expect([at(0), at(1), at(2), at(3)]).toEqual(['ms', 'ms-v30', 'ms', 'ms-v30']);
    expect(next.colorings[next.layers[0].slots[slotId]!.coloring]).toBeDefined();
    // Stable.
    expect(produce(next, (d) => applyPicks(d, blocks, () => 'zz'))).toBe(next);
    // 2027: February takes the 28.
    const y27 = produce(next, (d) => {
      d.data!.start = '2027-01-01';
      applyPicks(d, blocks, () => 'yy');
    });
    expect(y27.layers[0].slots[ids[1]!]!.block).toBe('ms-v28');
    // A number taken back (or Clear) empties its space and drops its type.
    const cleared = produce(next, (d) => {
      d.data!.order = [null, null, null, null];
      applyPicks(d, blocks, () => 'zz');
    });
    for (const id of ids) expect(cleared.layers[0].slots[id]).toBeUndefined();
    expect(cleared.data!.types).toEqual({});
    expect(pruneVariants(blocks, [cleared]).map((b) => b.id)).toEqual(['ms']);
    expect(variantFor(month(), 31)).toBe('ms');
    // A 1-day variant: what a single day shows; it makes the block a day type too.
    const withDay: Block = {
      ...month(),
      data: {
        kind: 'month',
        variants: [...month().data!.variants!, { ...month().data!.variants![0]!, days: 1 }],
      },
    };
    expect(variantFor(withDay, 1)).toBe('ms-v1');
    expect(variantFor(withDay, 28)).toBe('ms-v28');
    expect(takesKind(withDay, 'day')).toBe(true);
    expect(takesKind(month(), 'day')).toBe(false);
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
    p = placeNumber(p, 's1', 1, 'ms');
    p = placeNumber(p, 's3', 3, 'ms');
    expect(nextFree(p, 1)).toBe(2);
    expect(nextFree(p, 3)).toBe(4); // 3 placed: skipped
    p = placeNumber(p, 's1', 5, 'ms'); // a space holds one number
    expect(p.order.slice(0, 5)).toEqual([null, null, 's3', null, 's1']);
    p = takeBack(p, 's3');
    expect(nextFree(p, 3)).toBe(3);
    p = fillNumbers(p, ['s1', 'a', 'b'], () => 'ms');
    expect(p.types).toEqual({ s1: 'ms', a: 'ms', b: 'ms' });
    expect(p.order.slice(0, 5)).toEqual(['a', 'b', null, null, 's1']);
    p = moveNumber(p, 5, 1); // s1 becomes 001, the rest move down
    expect(p.order.slice(0, 5)).toEqual(['s1', 'a', 'b', null, null]);
    expect(p.order).toHaveLength(12);
    expect(numberLabel(p, 7)).toBe('Jul');
    expect(numberLabel(plan({ plan: 'weeks' }), 7)).toBe('Wk 7');
    expect(numberLabel(plan({ plan: 'weeks' }), 53)).toBe(numberName(plan({ plan: 'weeks' }), 53)); // a left-over day: its date
    expect(numberLabel({ ...plan({ plan: 'days' }), start: '2027-01-01' }, 2)).toBe('Jan 2');
    expect(numberName(p, 3)).toBe('Mar');
    expect(numberName({ ...p, start: '2027-09-01' }, 5)).toBe('Jan');
    expect(numberName(plan({ plan: 'weeks' }), 2)).toBe('Week of Jan 8');
    const full = fillNumbers(
      p,
      Array.from({ length: 14 }, (_, i) => `x${i}`),
      () => 'ms',
    );
    expect(nextFree(full)).toBeUndefined();
    // No type for the kind: those numbers stay empty.
    expect(fillNumbers(p, ['y'], () => undefined).order).toEqual(p.order);
  });

  it('the report: numbers not placed, missing types, unnumbered spaces, days without a place', () => {
    const { q, slotId } = dataQuilt(plan());
    q.data!.order = [null, null, slotId, ...Array<null>(9).fill(null)];
    q.data!.types = { [slotId]: 'gone' };
    const r = dataReport(q, []).join(' ');
    expect(r).toMatch(/11 numbers not placed yet: Jan, Feb, Apr/);
    expect(r).toMatch(/1 block type is missing: gone/);
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

describe('layout changes on a data quilt', () => {
  it('fewer rows: removed spaces give their numbers back, and the edit goes through', async () => {
    const { syncDraft } = await import('@/model/library-items');
    const { applyLayout, generateFor } = await import('@/model/layout/slots');
    const doc = structuredClone(fixture());
    const i = doc.project.quilts.findIndex((q) => 'rows' in q.layout && q.layout.rows > 1);
    const q0 = doc.project.quilts[i]!;
    const ids = generateFor(q0)
      .slots.filter((s) => s.kind === 'block')
      .map((s) => s.id);
    doc.project.quilts[i] = { ...q0, data: { ...plan(), order: ids, types: {} } };
    const frozen = produce(doc, () => {}); // as the store holds it
    const q = frozen.project.quilts[i]!;
    const layout = {
      ...q.layout,
      rows: (q.layout as { rows: number }).rows - 1,
    } as Quilt['layout'];
    const next = produce(frozen, (d) => {
      d.project.quilts[i] = castDraft(applyLayout(q, layout, q.borders));
      syncDraft(d);
    });
    const left = new Set(generateFor(next.project.quilts[i]!).slots.map((s) => s.id));
    const order = next.project.quilts[i]!.data!.order;
    expect(order.filter(Boolean).every((id) => left.has(id!))).toBe(true);
    expect(order.some((id) => id === null)).toBe(true);
  });
});

describe('moveBound', () => {
  const r = (...b: number[]) => b.slice(0, -1).map((from, k) => ({ from, to: b[k + 1]! }));
  it('moves the joined neighbour', () => {
    expect(moveBound(r(0, 60, 70, 80, 90), 2, 'from', 65)).toEqual(r(0, 60, 65, 80, 90));
  });
  it('pushes the range’s own end and the ones past it, at least 1 apart', () => {
    expect(moveBound(r(0, 60, 70, 80, 90), 2, 'from', 85)).toEqual(r(0, 60, 85, 86, 90));
    expect(moveBound(r(0, 60, 70, 80, 90), 1, 'from', 100)).toEqual(r(0, 100, 101, 102, 103));
  });
  it('pushes down too', () => {
    expect(moveBound(r(0, 60, 70, 80, 90), 2, 'to', 50)).toEqual(r(0, 48, 49, 50, 90));
  });
});
