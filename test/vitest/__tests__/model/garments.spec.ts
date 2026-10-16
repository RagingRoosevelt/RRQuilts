import { describe, expect, it } from 'vitest';
import { bbox, garmentOutline, measurements, SIZES, type Fit } from '@/model/garments';
import type { Pt } from '@/model/geometry/path';

const area = (p: Pt[]) =>
  Math.abs(
    p.reduce(
      (a, [x, y], i) => a + x * p[(i + 1) % p.length]![1] - p[(i + 1) % p.length]![0] * y,
      0,
    ),
  ) / 2;
const width = (p: Pt[]) => bbox(p)[2] - bbox(p)[0];
const height = (p: Pt[]) => bbox(p)[3] - bbox(p)[1];

describe('garment outlines (wizard target sizes)', () => {
  const pieces = [
    ['top', 'front'],
    ['top', 'back'],
    ['top', 'sleeve'],
    ['pants', 'front'],
    ['pants', 'back'],
  ] as const;
  for (const fit of ['women', 'men'] as Fit[])
    for (const [g, piece] of pieces)
      it(`${fit} ${g} ${piece} grows with the size`, () => {
        const outs = SIZES.map((s) => garmentOutline(g, piece, measurements(fit, s)));
        for (const o of outs) expect(area(o)).toBeGreaterThan(50);
        for (let i = 1; i < outs.length; i++) {
          expect(width(outs[i]!)).toBeGreaterThan(width(outs[i - 1]!));
          expect(area(outs[i]!)).toBeGreaterThan(area(outs[i - 1]!));
        }
      });

  it("sizes match the body: a women's M front is a quarter of the hip and ease plus its button stand", () => {
    const m = measurements('women', 'M');
    expect(width(garmentOutline('top', 'front', m))).toBeCloseTo((m.hip + 4) / 4 + 1, 6);
    expect(width(garmentOutline('top', 'back', m))).toBeCloseTo((m.hip + 4) / 2, 6);
    expect(height(garmentOutline('pants', 'front', m))).toBeCloseTo(m.rise + m.inseam, 6);
  });

  it('sleeves are as long as asked, to the wrist by default; backs have the higher neck', () => {
    const m = measurements('men', 'L');
    expect(height(garmentOutline('top', 'sleeve', m))).toBeCloseTo(m.arm, 6);
    expect(height(garmentOutline('top', 'sleeve', m, 12))).toBeCloseTo(12, 6);
    const neck = (p: Pt[]) => p[0]![1];
    expect(neck(garmentOutline('top', 'back', m))).toBeLessThan(
      neck(garmentOutline('top', 'front', m)),
    );
  });
});
