// Spec 041: next steps for picked days of a data quilt (the demo's months and weeks quilts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseProject } from '@/model/io';
import { blockOwn, daySteps, numberDates } from '@/model/print/data-steps';
import type { RrqDoc } from '@/model/schema/project';

async function demo(): Promise<RrqDoc> {
  const r = await parseProject(readFileSync('test/fixtures/formats/demo-v10.rrq', 'utf8'));
  if (!r.ok) throw new Error(r.error);
  return structuredClone(r.doc);
}
const dataQuilt = (doc: RrqDoc, plan: 'months' | 'weeks') =>
  doc.project.quilts.find((q) => q.data?.plan === plan)!;

describe('day steps', () => {
  it('months: each entered day is its piece in its range fabric, in January', async () => {
    const doc = await demo();
    const q = dataQuilt(doc, 'months');
    q.data!.entries = { '2027-01-11': [33], '2027-01-12': [41], '2027-01-13': [null] };
    q.data!.show = 'simulation'; // making uses real entries whatever is shown
    const steps = daySteps(doc, q, ['2027-01-13', '2027-01-11', '2027-01-12']);
    expect(steps.map((s) => [s.date, s.label, s.reason])).toEqual([
      ['2027-01-11', 'Jan', undefined],
      ['2027-01-12', 'Jan', undefined],
      ['2027-01-13', 'Jan', 'no-entry'],
    ]);
    const [a, b] = steps;
    expect(a!.values).toEqual([{ slot: 0, value: 33, fill: 'color:rrquilts.aqua' }]);
    expect(a!.pieces.map((p) => [p.slot, p.fill, p.count])).toEqual([
      [0, 'color:rrquilts.aqua', 1],
    ]);
    expect(b!.pieces[0]!.fill).toBe('color:rrquilts.mint');
    expect(a!.pieces[0]!.letter).toMatch(/^[A-Z]+$/);
  });

  it('weeks: two values per day; a day past the placed weeks is not placed', async () => {
    const doc = await demo();
    const q = dataQuilt(doc, 'weeks');
    q.data!.entries = { '2027-01-11': [33, 20], '2027-12-20': [50, 40] };
    const [jan, dec] = daySteps(doc, q, ['2027-01-11', '2027-12-20']);
    expect(jan!.pieces.map((p) => p.slot).sort()).toEqual([0, 1]);
    expect(jan!.pieces.every((p) => p.count >= 1)).toBe(true);
    expect(dec!.reason).toBe('not-placed');
  });

  it('a week of days merges identical pieces per fabric; only day pieces are steps', async () => {
    const doc = await demo();
    const q = dataQuilt(doc, 'months');
    q.data!.entries = { '2027-01-11': [33], '2027-01-12': [34], '2027-01-13': [41] };
    const steps = daySteps(doc, q, ['2027-01-11', '2027-01-12', '2027-01-13']);
    // Each day its own piece; Jan 11 and 12 both Aqua.
    expect(steps.map((x) => x.pieces[0]!.fill)).toEqual([
      'color:rrquilts.aqua',
      'color:rrquilts.aqua',
      'color:rrquilts.mint',
    ]);
    expect(steps.flatMap((x) => x.pieces).every((p) => !p.fill.startsWith('data:'))).toBe(true);
  });
});

describe('block by block', () => {
  it("a month's dates; February's places past the 28th are the block's own pieces", async () => {
    const doc = await demo();
    const q = dataQuilt(doc, 'months');
    expect(numberDates(q.data!, 2)).toHaveLength(28);
    expect(numberDates(q.data!, 2)[0]).toBe('2027-02-01');
    const own = blockOwn(doc, q, 2);
    expect(own.reduce((n, p) => n + p.count, 0)).toBeGreaterThanOrEqual(3);
    expect(own.every((p) => !p.fill.startsWith('data:'))).toBe(true);
  });
});
