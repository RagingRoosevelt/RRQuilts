import { describe, expect, it } from 'vitest';
import { convertUnits } from '@/model/units';
import { fixture } from './helpers';

/** Every number in `a` equals the one in `b` within `eps`. */
function closeTo(a: unknown, b: unknown, eps = 1e-9): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= eps;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((x, i) => closeTo(x, b[i], eps));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a);
    return (
      ka.length === Object.keys(b).length &&
      ka.every((k) => closeTo((a as never)[k], (b as never)[k], eps))
    );
  }
  return a === b;
}

describe('units', () => {
  it('in → cm scales real lengths and leaves geometry alone', () => {
    const doc = fixture();
    const cm = convertUnits(doc, 'cm');
    expect(cm.units).toBe('cm');
    expect(cm.project.blocks[0]!.size).toEqual([9 * 2.54, 9 * 2.54]);
    expect(cm.project.quilts[0]!.borders[0]!.sides[0]).toBeCloseTo(5.08);
    expect(cm.project.quilts[0]!.layers[1].items[1]!.text!.size).toBeCloseTo(3.81);
    const seam = cm.project.blocks[0]!;
    expect(seam.kind === 'seam' && seam.patches).toEqual(
      doc.project.blocks[0]!.kind === 'seam' && doc.project.blocks[0]!.patches,
    );
    expect(doc.units).toBe('in'); // input untouched
  });

  it('in → cm → in returns the original within 1e-9', () => {
    const doc = fixture();
    expect(closeTo(convertUnits(convertUnits(doc, 'cm'), 'in'), doc)).toBe(true);
  });
});
