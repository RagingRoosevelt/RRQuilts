import { describe, expect, it } from 'vitest';
import { flattenLoop, pathToSegs, pointInPolygon, type Pt } from '@/model/geometry/path';
import { migrate, stripDefaults } from '@/model/io';
import { generateSlots, reconcile, type Generated } from '@/model/layout/slots';
import {
  STRIP_STYLES,
  addStrip,
  deleteStrip,
  insertStrip,
  setStrip,
  squareFixes,
  squareUnit,
  stripOf,
  swapStrips,
} from '@/model/layout/strips';
import type { Strip, StripLayout, StripStyle } from '@/model/schema/quilt';
import { quiltWith, slotArea } from './layout-helpers';

const strip = (id: string, style: StripStyle, width = 6, along = 4, across = 3): Strip => ({
  id,
  style,
  width,
  along,
  across,
});
const one = (
  s: Strip,
  length = 40,
  style: StripLayout['style'] = 'horizontal-strip',
): StripLayout => ({
  style,
  length,
  strips: [s],
});
const polys = (g: Generated) =>
  g.slots.map((s) => flattenLoop(pathToSegs(s.outline, [1, 1]), 1e-3));
function badSamples(g: Generated, n = 30) {
  const ps = polys(g);
  const [x0, y0, x1, y1] = g.center;
  let bad = 0;
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const pt: Pt = [x0 + ((a + 0.3137) / n) * (x1 - x0), y0 + ((b + 0.5711) / n) * (y1 - y0)];
      if (ps.filter((q) => pointInPolygon(pt, q)).length !== 1) bad++;
    }
  return bad;
}
const area = (g: Generated) => g.slots.reduce((s, x) => s + slotArea(x), 0);

describe('strip styles (SC-003)', () => {
  for (const { value: style } of STRIP_STYLES)
    it(`${style} covers its strip for counts 1…24`, () => {
      for (let along = 1; along <= 24; along++) {
        const g = generateSlots(one(strip('s1', style, 6, along, 3)), []);
        const at = `${style} ×${along}`;
        expect(area(g), at).toBeCloseTo(40 * 6, 6);
        expect(new Set(g.slots.map((s) => s.id)).size, at).toBe(g.slots.length);
        if ([1, 2, 5, 24].includes(along)) expect(badSamples(g), at).toBe(0);
      }
    });

  it('only block styles make block spaces; the rest are plain strip pieces', () => {
    for (const { value: style } of STRIP_STYLES) {
      const kinds = new Set(generateSlots(one(strip('s1', style)), []).slots.map((s) => s.kind));
      expect([...kinds], style).toEqual(style.includes('blocks') ? ['block'] : ['strip']);
    }
  });

  it('half drop blocks: half blocks at both ends, placed whole', () => {
    const g = generateSlots(one(strip('s1', 'half-drop-blocks', 10, 4)), []);
    expect(g.slots.map((s) => s.id)).toEqual([
      'b:ss1:0',
      'b:ss1:1',
      'b:ss1:2',
      'b:ss1:3',
      'b:ss1:4',
    ]);
    expect(slotArea(g.slots[0]!)).toBeCloseTo(50, 6);
    expect(g.slots[0]!.transform).toEqual([10, 0, 0, 10, -5, 0]);
  });

  it('vertical strips are horizontal ones turned, with upright blocks', () => {
    const l: StripLayout = {
      ...stripDefaults(1),
      strips: stripDefaults(1).strips.map((s, i) => ({ ...s, id: `s${i}` })),
    };
    const h = generateSlots(l, []);
    const v = generateSlots({ ...l, style: 'vertical-strip' }, []);
    expect(v.center).toEqual([0, 0, h.center[3], h.center[2]]);
    expect(v.slots.map((s) => s.id)).toEqual(h.slots.map((s) => s.id));
    const b = v.slots.find((s) => s.kind === 'block')!;
    expect(b.transform[1]).toBe(0);
    expect(b.transform[2]).toBe(0);
    expect(b.transform[0]).toBeGreaterThan(0);
    expect(b.transform[3]).toBeGreaterThan(0);
    expect(badSamples(v)).toBe(0);
  });
});

describe('strip edits keep content with its strip (SC-002)', () => {
  const base: StripLayout = {
    style: 'horizontal-strip',
    length: 48,
    strips: [strip('a', 'blocks', 8, 6), strip('b', 'points-a', 4, 6), strip('c', 'plain', 3)],
  };
  const filled = () => {
    const q = quiltWith(base, []);
    for (const s of generateSlots(base, []).slots)
      q.layers[0].slots[s.id] = {
        block: s.kind === 'block' ? 'seam1' : 'plain',
        coloring: 'qk1',
        rotation: 0,
        flip: false,
      };
    return q;
  };

  it('insert, delete, swap', () => {
    const q = filled();
    const n = Object.keys(q.layers[0].slots).length;
    const ins = insertStrip(base, 'b', 'in').layout;
    expect(reconcile(q, ins, []).dropped).toEqual([]);
    const sw = swapStrips(base, 'a', 'c');
    expect(sw.strips.map((s) => s.id)).toEqual(['c', 'b', 'a']);
    expect(Object.keys(reconcile(q, sw, []).slots)).toHaveLength(n);
    const del = deleteStrip(base, 'b');
    expect(reconcile(q, del, []).dropped.every((id) => stripOf(id) === 'b')).toBe(true);
    expect(deleteStrip(one(strip('x', 'plain')), 'x').strips).toHaveLength(1);
  });

  it('new strips are blank: plain, 2″ (5 cm), with new ids', () => {
    expect(addStrip(base, 'in').layout.strips.at(-1)).toMatchObject({ style: 'plain', width: 2 });
    const ins = insertStrip(base, 'b', 'cm');
    expect(ins.layout.strips.map((s) => s.id).indexOf(ins.id)).toBe(1);
    expect(ins.layout.strips[1]).toMatchObject({ style: 'plain', width: 5 });
  });

  it('changing a strip style only touches that strip; pattern colors carry over', () => {
    const q = filled();
    // Points → Diamonds: foreground stays foreground, background stays background.
    expect(reconcile(q, setStrip(base, 'b', { style: 'diamonds' }), []).dropped).toEqual([]);
    const r = reconcile(q, setStrip(base, 'b', { style: 'blocks' }), []);
    expect(r.dropped.length).toBeGreaterThan(0);
    expect(r.dropped.every((id) => stripOf(id) === 'b')).toBe(true);
  });
});

describe('square units (SC-004)', () => {
  it('fixes give square units or 90° points within 1/64″', () => {
    for (const { value: style } of STRIP_STYLES) {
      const s = strip('s', style, 5, 7, 2);
      const l = one(s, 47);
      const fix = squareFixes(l, s);
      if (squareUnit(s) === null) {
        expect(fix, style).toBeNull();
        continue;
      }
      const lengthFixed = one(s, fix!.length);
      expect(squareFixes(lengthFixed, s), style).toBeNull();
      if (fix!.along) expect(squareFixes(l, { ...s, along: fix!.along }), style).toBeNull();
    }
  });
});

describe('format', () => {
  it('migrates placeholder strip quilts to the default strips', () => {
    const doc = migrate({
      format: 'rrq',
      version: 5,
      units: 'cm',
      project: { quilts: [{ layout: { style: 'vertical-strip' } }] },
    }) as { project: { quilts: { layout: StripLayout }[] } };
    const l = doc.project.quilts[0]!.layout;
    expect(l.style).toBe('vertical-strip');
    expect(l.length).toBe(120);
    expect(l.strips.map((s) => s.style)).toEqual(['plain', 'blocks', 'plain', 'blocks', 'plain']);
  });
});
