import { describe, expect, it } from 'vitest';
import { colorFilter, paletteMatches, swatchMatches } from '@/model/palette-color-filter';

const f = () => colorFilter();
const teal: [number, number, number] = [30, 140, 160];
const red: [number, number, number] = [200, 30, 40];
const pink: [number, number, number] = [210, 60, 120];
const gray: [number, number, number] = [128, 128, 128];
const cream: [number, number, number] = [245, 238, 220];

describe('palette color filter (spec 033)', () => {
  it('matches a hue range and leaves grays out of it', () => {
    const x = f();
    x.hue = { on: true, center: 210, range: 30 };
    expect(swatchMatches(teal, x)).toBe(true);
    expect(swatchMatches(red, x)).toBe(false);
    expect(swatchMatches(gray, x)).toBe(false);
  });
  it('wraps the hue range past 0/360', () => {
    const x = f();
    x.hue = { on: true, center: 10, range: 30 };
    expect(swatchMatches(red, x)).toBe(true);
    expect(swatchMatches(pink, x)).toBe(true);
  });
  it('value and saturation ranges', () => {
    const light = f();
    light.value = { on: true, min: 70, max: 100 };
    expect(swatchMatches(cream, light)).toBe(true);
    expect(swatchMatches(teal, light)).toBe(false);
    const muted = f();
    muted.sat = { on: true, min: 0, max: 25 };
    expect(swatchMatches(gray, muted)).toBe(true);
    expect(swatchMatches(red, muted)).toBe(false);
  });
  it('a palette matches through any one swatch; none set matches all', () => {
    const x = f();
    expect(paletteMatches([], x)).toBe(true);
    x.hue = { on: true, center: 210, range: 30 };
    expect(paletteMatches([red, teal], x)).toBe(true);
    expect(paletteMatches([red, gray], x)).toBe(false);
    expect(paletteMatches([], x)).toBe(false);
  });
});
