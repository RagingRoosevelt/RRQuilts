// Spec 041: next steps for picked days of a data quilt (the demo's months and weeks quilts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseProject } from '@/model/io';
import { daySteps } from '@/model/print/data-steps';
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
});
