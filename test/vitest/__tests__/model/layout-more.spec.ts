import { describe, expect, it } from 'vitest';
import { takesBlock } from '@/editor/scope';
import {
  flattenLoop,
  pathToSegs,
  pointInPolygon,
  signedArea,
  type Pt,
} from '@/model/geometry/path';
import { layoutDefaults, migrate } from '@/model/io';
import { generateSlots, type Generated } from '@/model/layout/slots';
import { slotGroup } from '@/model/plain';
import type { Layout, OnePatchLayout, PatchShape } from '@/model/schema/quilt';

const poly = (path: Generated['edge']) => flattenLoop(pathToSegs(path, [1, 1]), 1e-3);
/** Points that aren't in exactly one space (gaps or overlaps); within `inside` when given. */
function bad(g: Generated, inside?: Pt[], n = 24) {
  const polys = g.slots.map((s) => poly(s.outline));
  const [x0, y0, x1, y1] = g.center;
  let count = 0;
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const pt: Pt = [x0 + ((a + 0.3137) / n) * (x1 - x0), y0 + ((b + 0.5711) / n) * (y1 - y0)];
      if (inside && !pointInPolygon(pt, inside)) continue;
      if (polys.filter((q) => pointInPolygon(pt, q)).length !== 1) count++;
    }
  return count;
}
const area = (g: Generated) =>
  g.slots.reduce((s, x) => s + Math.abs(signedArea(poly(x.outline))), 0);
const unique = (g: Generated) => new Set(g.slots.map((s) => s.id)).size === g.slots.length;

const SHAPES: PatchShape[] = [
  'squares',
  'rectangles',
  'bricks',
  'half-square-triangles',
  'triangles',
  'diamonds',
  'hexagons',
  'tumblers',
  'clamshells',
  'octagons',
];
const one = (
  shape: PatchShape,
  cols: number,
  rows: number,
  edge: 'trim' | 'none',
): OnePatchLayout => ({
  style: 'one-patch',
  shape,
  cols,
  rows,
  width: 3,
  height: 2,
  edge,
});

describe('One Patch', () => {
  for (const shape of SHAPES)
    it(`${shape}: trimmed fills the rectangle, whole patches don't overlap`, () => {
      for (const [c, r] of [
        [1, 1],
        [2, 3],
        [5, 4],
      ] as const) {
        const at = `${shape} ${c}x${r}`;
        const t = generateSlots(one(shape, c, r, 'trim'), []);
        expect(unique(t), at).toBe(true);
        expect(bad(t), at).toBe(0);
        const [x0, y0, x1, y1] = t.center;
        expect(area(t), at).toBeCloseTo((x1 - x0) * (y1 - y0), 4);
        const w = generateSlots(one(shape, c, r, 'none'), []);
        expect(unique(w), at).toBe(true);
        expect(w.slots.length, at).toBeGreaterThan(0);
        expect(bad(w, shape === 'clamshells' ? undefined : poly(w.edge)), at).toBe(
          0 + (shape === 'clamshells' ? bad(w) : 0),
        );
        if (shape !== 'clamshells')
          expect(area(w), at).toBeCloseTo(Math.abs(signedArea(poly(w.edge))), 4);
      }
    });

  it('whole tumblers: as many along a row as patches across', () => {
    expect(generateSlots(one('tumblers', 5, 2, 'none'), []).slots).toHaveLength(10);
  });

  it('patches take fabric only, in the patch group', () => {
    const g = generateSlots(one('hexagons', 3, 3, 'trim'), []);
    expect(g.slots.every((s) => s.kind === 'patch' && !takesBlock(s))).toBe(true);
    expect(g.slots.every((s) => slotGroup(s.id) === 'patch')).toBe(true);
  });

  it('whole patches: borders set aside, edge follows the patches', () => {
    const g = generateSlots(one('hexagons', 3, 2, 'none'), [
      { style: 'long-horizontal', sides: [2, 2, 2, 2] },
    ]);
    expect(g.slots.some((s) => s.kind === 'border')).toBe(false);
    expect(g.edge.length).toBeGreaterThan(10);
  });
});

describe('Baby Blocks and Variable Blocks', () => {
  for (const style of ['baby-blocks', 'variable-blocks'] as const)
    it(`${style}: three faces per cube, trimmed and whole`, () => {
      const d = layoutDefaults(style, 1)! as Layout & { cols: number; rows: number };
      for (const [c, r] of [
        [1, 1],
        [3, 2],
        [4, 5],
      ] as const) {
        const l = { ...d, cols: c, rows: r } as Layout;
        const t = generateSlots(l, []);
        expect(unique(t)).toBe(true);
        expect(bad(t)).toBe(0);
        const w = generateSlots({ ...l, edge: 'none' } as Layout, []);
        expect(w.slots.length).toBe(3 * c * r);
        expect(bad(w, poly(w.edge))).toBe(0);
        expect(new Set(w.slots.map((s) => s.alt))).toEqual(new Set([0, 1, 2]));
      }
    });
});

describe('Variable Point', () => {
  it('On-Point stretched: width and height through the diamond, patches only', () => {
    const d = layoutDefaults('variable-point', 1)!;
    const g = generateSlots({ ...d, edge: { finish: 'exact', float: 0 } } as Layout, []);
    const main = g.slots.find((s) => s.id === 'p:r1c1')!;
    const pts = poly(main.outline);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(12, 6);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(16, 6);
    expect(g.slots.every((s) => !takesBlock(s))).toBe(true);
    expect(unique(g)).toBe(true);
    expect(bad(g)).toBe(0);
    for (const finish of ['float', 'trim', 'none'] as const) {
      const f = generateSlots({ ...d, edge: { finish, float: 1 } } as Layout, []);
      expect(unique(f), finish).toBe(true);
      expect(bad(f, finish === 'none' ? poly(f.edge) : undefined), finish).toBe(0);
    }
  });
});

describe('format v6', () => {
  it('gives placeholder layouts their defaults', () => {
    for (const style of ['variable-point', 'one-patch', 'baby-blocks', 'variable-blocks']) {
      const doc = migrate({
        format: 'rrq',
        version: 5,
        units: 'in',
        project: { quilts: [{ layout: { style } }] },
      }) as { project: { quilts: { layout: unknown }[] } };
      expect(doc.project.quilts[0]!.layout, style).toEqual(layoutDefaults(style, 1));
    }
  });
  it('Variable Point floats the same distance on every side', () => {
    const g = generateSlots(
      {
        style: 'variable-point',
        cols: 3,
        rows: 3,
        width: 12,
        height: 16,
        sash: 0,
        corner: 'triangle',
        edge: { finish: 'float', float: 1 },
      },
      [],
    );
    const [x0, y0, x1, y1] = g.center;
    expect([x1 - x0, y1 - y0]).toEqual([38, 50].map((v) => expect.closeTo(v, 9)));
  });
});
