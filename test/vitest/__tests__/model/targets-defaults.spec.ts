import { describe, expect, it } from 'vitest';
import { defaultsFrom, startChoice } from '@/model/targets';

describe('reference overlay defaults (settings)', () => {
  const none = { choice: null, region: 'us' as const };
  it('garments start from the quilter’s own size; another fit starts at the middle', () => {
    const mine = { pants: { fit: 'men' as const, size: '36', inseam: 34 } };
    const p = startChoice('pants', none, 'in', mine);
    expect([p.fit, p.size, p.inseam]).toEqual(['men', '36', 34]);
    const w = startChoice('pants', { ...none, fit: 'women' }, 'in', mine);
    expect([w.fit, w.size, w.inseam]).toEqual(['women', '8', 30.5]);
    expect(startChoice('pants', none, 'cm', mine).inseam).toBe(86.5);
  });
  it('the quilter’s bed starts with its drop, tuck, and tall; other beds with their own', () => {
    const mine = { bed: { region: 'us' as const, name: 'Twin', drop: 10, tuck: 12, tall: true } };
    expect(startChoice('Twin', none, 'in', mine)).toMatchObject({ drop: 10, tuck: 12, tall: true });
    expect(startChoice('Queen', none, 'in', mine)).toMatchObject({
      drop: 14,
      tuck: 0,
      tall: false,
    });
  });
  it('a first use gives the defaults, in inches', () => {
    const p = startChoice('pants', { ...none, fit: 'men' }, 'cm');
    const d = defaultsFrom(p, 'cm').pants!;
    expect([d.fit, d.size]).toEqual(['men', '32']);
    expect(d.inseam).toBeCloseTo(32, 0); // 81.5 cm, rounded to the half centimeter
    expect(defaultsFrom(startChoice('Queen', none, 'in'), 'in').bed).toEqual({
      region: 'us',
      name: 'Queen',
      drop: 14,
      tuck: 0,
      tall: false,
    });
    expect(defaultsFrom(startChoice('Throw', none, 'in'), 'in')).toEqual({});
  });
});
