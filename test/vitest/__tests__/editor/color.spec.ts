import { describe, expect, it } from 'vitest';
import { fromHex, fromHsl, toHex, toHsl } from '@/editor/color';

describe('color conversions', () => {
  it('hex round-trips', () => {
    expect(toHex([196, 40, 44])).toBe('#c4282c');
    expect(fromHex('#c4282c')).toEqual([196, 40, 44]);
    expect(fromHex('fff')).toEqual([255, 255, 255]);
    expect(fromHex('nope')).toBeNull();
  });
  it('hsl round-trips within rounding', () => {
    for (const rgb of [
      [196, 40, 44],
      [48, 104, 176],
      [250, 236, 160],
      [24, 24, 26],
    ] as const) {
      const back = fromHsl(toHsl([...rgb]));
      back.forEach((v, i) => expect(Math.abs(v - rgb[i]!)).toBeLessThanOrEqual(3));
    }
    expect(toHsl([255, 0, 0])).toEqual([0, 100, 50]);
  });
});
