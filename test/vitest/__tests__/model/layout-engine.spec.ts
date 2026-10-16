import { describe, expect, it } from 'vitest';
import { flattenLoop, pathToSegs, signedArea } from '@/model/geometry/path';
import { clipOutline } from '@/model/layout/clip';
import { generateSlots, rectPath } from '@/model/layout/slots';
import type { PathCommand } from '@/model/schema/shared';
import type { Border, HorizontalLayout } from '@/model/schema/quilt';
import { oracleHorizontal } from './horizontal-oracle';

// Numbers equal to 1e-9 (the engine composes affine maps, so the last bit may differ); ids, kinds of
// path command, and order exactly. Returns the first difference.
function diff(a: unknown, b: unknown, at = ''): string | null {
  if (typeof a === 'number' && typeof b === 'number')
    return Math.abs(a - b) <= 1e-9 ? null : `${at}: ${a} ≠ ${b}`;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${at}: length ${a.length} ≠ ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = diff(a[i], b[i], `${at}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  return a === b ? null : `${at}: ${String(a)} ≠ ${String(b)}`;
}

const borderSets: Border[][] = [
  [],
  [{ style: 'long-horizontal', sides: [2, 2, 2, 2] }],
  [
    { style: 'long-vertical', sides: [1.5, 2, 2.5, 3] },
    { style: 'mitered', sides: [3, 3, 3, 3] },
    { style: 'points-in', sides: [2, 2, 2, 2] },
  ],
];

describe('Horizontal on the layout engine matches the old generator (SC-001)', () => {
  const blocks: [number, number][] = [
    [9, 9],
    [12.5, 8],
    [7.62, 7.62],
    [1 / 3, 0.7],
  ];
  const sashes: [number, number][] = [
    [0, 0],
    [1.5, 0],
    [0, 2],
    [1, 1],
    [2.54, 0.635],
  ];
  it('ids, outlines, transforms, order, center, and bounds', () => {
    let cases = 0;
    for (let cols = 1; cols <= 6; cols++)
      for (let rows = 1; rows <= 6; rows++)
        for (const block of blocks)
          for (const sash of sashes)
            for (const sashBorder of [false, true])
              for (const borders of borderSets) {
                const l: HorizontalLayout = {
                  style: 'horizontal',
                  cols,
                  rows,
                  block,
                  sash,
                  sashBorder,
                };
                const want = oracleHorizontal(l);
                const got = generateSlots(l, borders);
                const center = got.slots.filter((s) => !s.id.startsWith('border:'));
                const at = `${cols}x${rows} ${block.join()} ${sash.join()} ${sashBorder} ${borders.length}`;
                const d =
                  diff(
                    center.map((s) => [s.id, s.outline, s.transform]),
                    want.slots.map((s) => [s.id, s.outline, s.transform]),
                  ) ?? diff(got.center, want.center, 'center');
                expect(d, at).toBeNull();
                cases++;
              }
    expect(cases).toBe(6 * 6 * 4 * 5 * 2 * 3);
  });
});

describe('clipping to the quilt', () => {
  const area = (path: PathCommand[]) =>
    Math.abs(signedArea(flattenLoop(pathToSegs(path, [1, 1]), 1e-5)));

  it('trims a straight outline', () => {
    const r = clipOutline(rectPath(-1, -1, 2, 2), [0, 0, 10, 10])!;
    expect(area(r)).toBeCloseTo(1, 9);
  });

  it('trims a curved outline and keeps its arc', () => {
    // Unit square with a half-circle bulging right (radius ½); clip away the left half.
    const shape: PathCommand[] = [['M', 0, 0], ['L', 1, 0], ['A', 1, 1, -180], ['L', 0, 1], ['Z']];
    const r = clipOutline(shape, [0.5, -5, 5, 5])!;
    expect(r.some((c) => c[0] === 'A')).toBe(true);
    expect(area(r)).toBeCloseTo(0.5 + Math.PI / 8, 3);
  });

  it('drops what lies outside', () => {
    expect(clipOutline(rectPath(20, 20, 1, 1), [0, 0, 10, 10])).toBeNull();
  });
});
