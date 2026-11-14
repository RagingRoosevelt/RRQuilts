import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { offset } from '@/model/print/polygon';
import {
  buildTemplate,
  checkMesh,
  isConvex,
  STL_BUILD,
  stlBytes,
  stlLength,
} from '@/model/print/stl';
import { STL_FONT } from '@/model/print/stl-font';
import type { Pt } from '@/model/geometry/path';

const { shapes } = eppStarters();
/** A starter shape at `inches` per 1U, in mm, y up. */
const mm = (name: string, inches: number): Pt[] =>
  shapes
    .find((s) => s.notecard.name === name)!
    .outline.map(([x, y]): Pt => [x * inches * 25.4, -y * inches * 25.4]);
const lines = ['Edge: 1"', 'SA: 3/8"'];
const closed = (r: ReturnType<typeof buildTemplate>) => {
  expect(r.errors).toEqual([]);
  const c = checkMesh(r.mesh!);
  expect(c).toMatchObject({ badEdges: 0, degenerate: 0, flipped: 0 });
  expect(c.volume).toBeGreaterThan(0);
  return c;
};

describe('3D-printed templates (spec 027 stretch goal, owner 2026-11-13)', () => {
  it('a 1" hexagon: one closed solid with 6 mm text and a hanging hole, the letters 0.6 mm deep', () => {
    const r = buildTemplate(mm('Hexagon', 1), STL_BUILD, ['Edge: 1"', 'SA: 0'], 6);
    closed(r);
    expect(r.textSize).toBe(6);
    expect(r.hole).toBeDefined();
    const zs = new Set(r.mesh!.V.map((v) => +v[2].toFixed(4)));
    // Bottom, chamfer tops, letter bottoms, floor, pocket wall middle, top chamfer, top.
    expect([...zs].sort((a, b) => a - b)).toEqual([0, 0.4, 0.6, 1.2, 2.6, 3.6, 4]);
  });

  it('every starter shape, paper and fabric (trimmed or not), from 1/2" to 2": closed solids', () => {
    for (const s of shapes)
      for (const inches of [0.5, 1, 2])
        for (const fabric of [null, false, true]) {
          const paper = mm(s.notecard.name, inches);
          const out = fabric === null ? paper : offset(paper, 9.525, fabric);
          closed(buildTemplate(out, STL_BUILD, lines, 6 * inches));
        }
  });

  it('text first, then the hole: a big template gets the 3/4" hole and its full text size', () => {
    const r = buildTemplate(mm('Hexagon', 2), STL_BUILD, ['Edge: 2"', 'SA: 3/8"'], 12);
    expect(r.textSize).toBe(12);
    expect(r.hole).toBe('3/4"');
  });

  it('concave outlines are refused; settings that leave no floor or no flat top are errors', () => {
    const L: Pt[] = [
      [0, 0],
      [40, 0],
      [40, 20],
      [20, 20],
      [20, 40],
      [0, 40],
    ];
    expect(isConvex(L)).toBe(false);
    expect(buildTemplate(L, STL_BUILD, lines, 6).errors[0]).toMatch(/Concave/);
    const hex = mm('Hexagon', 1);
    expect(buildTemplate(hex, { ...STL_BUILD, depth: 1.2 }, lines, 6).errors).toHaveLength(1);
    expect(buildTemplate(hex, { ...STL_BUILD, wall: 1.5 }, lines, 6).errors).toHaveLength(1);
  });

  it('writes binary STL: 84 header bytes and 50 per triangle', () => {
    const r = buildTemplate(mm('Square', 1), STL_BUILD, lines, 6);
    const buf = stlBytes(r.mesh!, 'Square');
    expect(buf.byteLength).toBe(84 + 50 * r.mesh!.T.length);
    expect(new DataView(buf).getUint32(80, true)).toBe(r.mesh!.T.length);
  });

  it('sizes as quilters write them, and the font has every character they use', () => {
    expect(stlLength(1.5, 'in')).toBe('1 1/2"');
    expect(stlLength(0.375, 'in')).toBe('3/8"');
    expect(stlLength(2, 'in')).toBe('2"');
    expect(stlLength(2.5, 'cm')).toBe('25mm');
    for (const ch of 'Edge: Size SA: 0123456789/".m×') expect(STL_FONT.glyphs[ch]).toBeDefined();
  });
});
