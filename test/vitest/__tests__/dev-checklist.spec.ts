import { describe, expect, it } from 'vitest';
import { carryForward, type CheckState } from '@/dev/checklist';

const ok = (build: string): CheckState => ({ status: 'ok', at: 'x', build });

describe('checklist progress across releases', () => {
  it('a new release line starts from the newest earlier one, once', () => {
    const old = {
      '0.3.0:TC-001': ok('0.3.0'),
      '0.4.0:TC-001': ok('0.4.0+abc'),
      '0.4.0:TC-002': { status: 'problem', note: 'n', at: 'x', build: '0.4.0+abc' } as CheckState,
    };
    const s = carryForward(old, '0.5.0');
    expect(s['0.5.0:TC-001']).toEqual(ok('0.4.0+abc'));
    expect(s['0.5.0:TC-002']!.note).toBe('n');
    expect(s['0.4.0:TC-001']).toEqual(ok('0.4.0+abc')); // the old line is kept
    // Started over: nothing comes back.
    const fresh = Object.fromEntries(
      Object.entries(s).filter(([k]) => !k.startsWith('0.5.0:') || k.endsWith('@carried')),
    );
    expect(
      Object.keys(carryForward(fresh, '0.5.0')).filter((k) => k.startsWith('0.5.0:TC')),
    ).toEqual([]);
    // The line itself, unchanged; 0.10.0 is newer than 0.9.0.
    expect(carryForward(old, '0.4.0')['0.4.0:TC-002']!.status).toBe('problem');
    expect(carryForward({ '0.9.0:TC-001': ok('0.9.0') }, '0.10.0')['0.10.0:TC-001']).toBeTruthy();
  });
});
