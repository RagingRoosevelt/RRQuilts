import { describe, expect, it } from 'vitest';
import { lch, sortSwatches, validSortPrefs, type SortPref } from '@/model/palette-sort';

type S = { name: string; rgb: [number, number, number] };
const sw: S[] = [
  { name: 'White', rgb: [255, 255, 255] },
  { name: 'Navy', rgb: [20, 30, 110] },
  { name: 'Red', rgb: [200, 30, 40] },
  { name: 'Gray', rgb: [128, 128, 128] },
  { name: 'Yellow', rgb: [240, 210, 40] },
  { name: 'Green', rgb: [40, 150, 60] },
];
const names = (p: SortPref) =>
  sortSwatches(
    sw,
    p,
    (x) => x.rgb,
    (x) => x.name,
  ).map((x) => x.name);

describe('palette sort (spec 032)', () => {
  it('reads lightness like the eye (yellow lighter than blue)', () => {
    expect(lch([240, 210, 40]).l).toBeGreaterThan(lch([20, 30, 110]).l);
    expect(lch([255, 255, 255]).l).toBeCloseTo(100, 0);
  });
  it('hue runs from red around the wheel, grays last light to dark', () => {
    expect(names({ key: 'hue' })).toEqual(['Red', 'Yellow', 'Green', 'Navy', 'White', 'Gray']);
  });
  it('value runs light to dark; reverse flips it', () => {
    expect(names({ key: 'value' })[0]).toBe('White');
    expect(names({ key: 'value' }).at(-1)).toBe('Navy');
    expect(names({ key: 'value', reverse: true })[0]).toBe('Navy');
  });
  it('saturation puts vivid first and grays last; name sorts naturally', () => {
    expect(names({ key: 'saturation' }).slice(-2).sort()).toEqual(['Gray', 'White']);
    expect(names({ key: 'name' })).toEqual(['Gray', 'Green', 'Navy', 'Red', 'White', 'Yellow']);
  });
  it('saved order is the stored order', () => {
    expect(names({ key: 'saved' })).toEqual(sw.map((x) => x.name));
  });
  it('validates stored preferences', () => {
    expect(validSortPrefs({ a: { key: 'hue' }, b: { key: 'name', reverse: true } })).toBe(true);
    expect(validSortPrefs({ a: { key: 'rainbow' } })).toBe(false);
    expect(validSortPrefs([])).toBe(false);
  });
});
