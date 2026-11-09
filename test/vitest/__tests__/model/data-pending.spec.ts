// Spec 041: data waiting on the device for a project that isn't open.
import { describe, expect, it } from 'vitest';
import { applyPending, mergePatch } from '@/model/data-pending';
import { newDataPlan } from '@/model/data-quilt';
import type { RrqDoc } from '@/model/schema/project';
import { fixture } from './helpers';

function doc(): RrqDoc {
  const d = structuredClone(fixture());
  const q = d.project.quilts[0]!;
  q.data = newDataPlan('in', 2027);
  q.data.entries = { '2027-01-01': [20], '2027-01-02': [30] };
  q.data.made = { '2027-01-01': { cut: '2027-01-03' } };
  return d;
}

describe('pending data', () => {
  it('later writes win per day', () => {
    const a = mergePatch(undefined, { entries: { '2027-01-05': [1] }, made: { x: null } });
    const b = mergePatch(a, { entries: { '2027-01-05': [2], '2027-01-06': [3] } });
    expect(b).toEqual({ entries: { '2027-01-05': [2], '2027-01-06': [3] }, made: { x: null } });
  });

  it('applies entries and marks; an emptied row and a cleared mark go', () => {
    const d = doc();
    const id = d.project.quilts[0]!.id;
    const out = applyPending(d, {
      quilts: {
        [id]: {
          entries: { '2027-01-02': [null], '2027-01-04': [41] },
          made: { '2027-01-01': null, '2027-01-04': { cut: '2027-01-05' } },
          blocksMade: { 1: '2027-02-01' },
        },
        gone: { entries: { '2027-01-04': [1] } },
      },
    });
    const p = out.project.quilts[0]!.data!;
    expect(p.entries).toEqual({ '2027-01-01': [20], '2027-01-04': [41] });
    expect(p.made).toEqual({ '2027-01-04': { cut: '2027-01-05' } });
    expect(p.blocksMade).toEqual({ 1: '2027-02-01' });
    expect(d.project.quilts[0]!.data!.entries['2027-01-02']).toEqual([30]); // input untouched
  });

  it('nothing pending gives the same document', () => {
    const d = doc();
    expect(applyPending(d, undefined)).toBe(d);
    expect(applyPending(d, { quilts: { other: {} } })).toBe(d);
  });
});
