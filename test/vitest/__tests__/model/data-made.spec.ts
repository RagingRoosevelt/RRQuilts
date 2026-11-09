// Spec 041: made marks, a day's color, the last entry and the days next steps cover.
import { describe, expect, it } from 'vitest';
import { Value } from 'typebox/value';
import {
  dayColor,
  fitPlaces,
  lastEntry,
  newDataPlan,
  nextDays,
  setBlockMade,
  setMade,
} from '@/model/data-quilt';
import { parseProject } from '@/model/io';
import { DataPlan } from '@/model/schema/data-quilt';
import { VERSION } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { fixture } from './helpers';

const plan = () => {
  const p = newDataPlan('in', 2027);
  p.entries = { '2027-01-03': [41], '2027-01-01': [28], '2027-01-02': [null] };
  return p;
};

describe('made marks', () => {
  it('set and clear Cut and Assembled per day; a day with neither goes', () => {
    let p = setMade(plan(), '2027-01-01', 'cut', true, '2027-01-04');
    p = setMade(p, '2027-01-01', 'assembled', true, '2027-01-05');
    p = setMade(p, '2027-01-01', 'cut', true, '2027-01-09'); // keeps the first date
    expect(p.made).toEqual({ '2027-01-01': { cut: '2027-01-04', assembled: '2027-01-05' } });
    expect(Value.Check(DataPlan, p)).toBe(true);
    p = setMade(p, '2027-01-01', 'cut', false, '2027-01-09');
    p = setMade(p, '2027-01-01', 'assembled', false, '2027-01-09');
    expect('made' in p).toBe(false);
  });

  it('blocks assembled by number; refitting drops numbers the plan no longer has', () => {
    let p = setBlockMade(plan(), 1, true, '2027-02-01');
    p = setBlockMade(p, 40, true, '2027-02-01'); // past the 12 months
    expect(Value.Check(DataPlan, p)).toBe(true);
    expect(fitPlaces(p).plan.blocksMade).toEqual({ 1: '2027-02-01' });
    expect('blocksMade' in setBlockMade(setBlockMade(plan(), 1, true, 'x'), 1, false, 'x')).toBe(
      false,
    );
  });

  it('last entry and next days (entered, not cut, oldest first)', () => {
    const p = setMade(plan(), '2027-01-01', 'cut', true, '2027-01-04');
    expect(lastEntry(p)).toBe('2027-01-03');
    expect(nextDays(plan())).toEqual(['2027-01-01', '2027-01-03']);
    expect(nextDays(p)).toEqual(['2027-01-03']);
  });
});

describe('a day color', () => {
  it('is the range fill, through the shown colorway', () => {
    const q = { data: plan() } as unknown as Quilt;
    expect(dayColor(q, 0, '2027-01-01')).toEqual({ color: 'rrquilts.sky' });
    expect(dayColor(q, 0, '2027-01-02')).toBeUndefined();
    expect(dayColor(q, 1, '2027-01-01')).toBeUndefined();
    const swapped = {
      ...q,
      shownColorway: 'cw',
      colorways: [
        { id: 'cw', name: 'B', swaps: [{ from: 'color:rrquilts.sky', to: { color: 'x' } }] },
      ],
    } as unknown as Quilt;
    expect(dayColor(swapped, 0, '2027-01-01')).toEqual({ color: 'x' });
  });
});

describe('v10 → v11 (spec 041)', () => {
  it('opens a version 10 project unchanged apart from its version', async () => {
    const r = await parseProject(JSON.stringify({ ...fixture(), version: 10 }));
    expect(r.ok && r.doc).toEqual({ ...fixture(), version: VERSION });
  });
});
