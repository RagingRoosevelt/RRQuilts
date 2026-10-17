import { describe, expect, it } from 'vitest';
import { takesBlock } from '@/editor/scope';
import { flattenLoop, pathToSegs, pointInPolygon, type Pt } from '@/model/geometry/path';
import { generateSlots, type Generated } from '@/model/layout/slots';
import type { Border, Layout } from '@/model/schema/quilt';

const STYLES: Border['style'][] = [
  'corner-blocks',
  'blocks',
  'half-drop-blocks',
  'spaced-squares',
  'diamonds',
  'half-drop-diamonds',
  'double-diamonds',
  'half-drop-double-diamonds',
  'big-little-diamonds',
  'half-drop-big-little-diamonds',
  'points-out',
  'points-in',
  'big-little-points-out',
  'big-little-points-in',
  'tile-squares',
  'tile-on-point',
  'tile-on-point-corners',
  'blocks-aligned-inside',
  'half-drop-aligned',
];
const layout: Layout = {
  style: 'straight-set',
  cols: 4,
  rows: 3,
  block: [6, 6],
  sash: [0, 0],
  sashBorder: false,
};
const border = (style: Border['style'], blocks?: [number, number]): Border => ({
  style,
  sides: [3, 3, 2, 2.5],
  ...(blocks ? { blocks } : {}),
});
const polys = (g: Generated) =>
  g.slots
    .filter((s) => s.kind === 'border')
    .map((s) => flattenLoop(pathToSegs(s.outline, [1, 1]), 1e-3));
/** Sample points in the border ring that aren't in exactly one border piece. */
function bad(g: Generated, n = 40) {
  const ps = polys(g);
  const [x0, y0, x1, y1] = g.bounds;
  const [c0, d0, c1, d1] = g.center;
  let count = 0;
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const pt: Pt = [x0 + ((a + 0.3137) / n) * (x1 - x0), y0 + ((b + 0.5711) / n) * (y1 - y0)];
      if (pt[0] > c0 && pt[0] < c1 && pt[1] > d0 && pt[1] < d1) continue;
      if (ps.filter((q) => pointInPolygon(pt, q)).length !== 1) count++;
    }
  return count;
}

describe('pieced border styles (spec 018)', () => {
  for (const style of STYLES)
    it(`${style} covers the border ring, unique ids, fabric only`, () => {
      for (const blocks of [undefined, [1, 1], [5, 3]] as const) {
        const g = generateSlots(layout, [border(style, blocks as [number, number] | undefined)]);
        const at = `${style} ${blocks?.join() ?? 'auto'}`;
        expect(g.unsupported, at).toEqual([]);
        expect(new Set(g.slots.map((s) => s.id)).size, at).toBe(g.slots.length);
        expect(bad(g), at).toBe(0);
        expect(
          g.slots.filter((s) => s.kind === 'border').every((s) => !takesBlock(s)),
          at,
        ).toBe(true);
      }
    });

  it('points out have their tips at the outer edge; points in, at the quilt', () => {
    // Corners of the top border's second point lying on the outer edge (y = -3): one tip or a base.
    const onOuter = (style: Border['style']) => {
      const g = generateSlots(layout, [border(style, [4, 3])]);
      const f = g.slots.find((s) => s.id === 'border:1:top:f1')!;
      return f.outline.filter((c) => (c[0] === 'M' || c[0] === 'L') && Math.abs(c[2] + 3) < 1e-9)
        .length;
    };
    expect(onOuter('points-out')).toBe(1);
    expect(onOuter('points-in')).toBe(2);
  });

  it('aligned styles follow the layout: four along the top, three down the sides', () => {
    const g = generateSlots(layout, [border('blocks-aligned-inside', [9, 9])]);
    expect(g.slots.filter((s) => /^border:1:top:u\d/.test(s.id))).toHaveLength(4);
    expect(g.slots.filter((s) => /^border:1:left:u\d/.test(s.id))).toHaveLength(3);
  });

  it('colors carry over between pattern styles (foreground stays foreground)', () => {
    const ids = (style: Border['style']) =>
      new Set(generateSlots(layout, [border(style, [4, 3])]).slots.map((s) => s.id));
    const d = ids('diamonds');
    const p = ids('points-out');
    expect([...p].filter((x) => d.has(x)).length).toBeGreaterThan(8);
  });
});
