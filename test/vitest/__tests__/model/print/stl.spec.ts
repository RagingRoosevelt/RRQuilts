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

  it('the hanging hole sits on a line from the middle out to a corner (owner, 2026-11-13)', () => {
    for (const name of ['Hexagon', 'Square', 'Triangle', 'Pentagon', 'Octagon', '60° Diamond'])
      for (const inches of [1, 2, 3]) {
        const P = mm(name, inches);
        const r = buildTemplate(P, STL_BUILD, lines, 6 * inches);
        if (!r.holeAt) continue;
        // Regular shapes and the diamond: the middle of the floor is the middle of the outline.
        const o: Pt = [
          P.reduce((s, p) => s + p[0], 0) / P.length,
          P.reduce((s, p) => s + p[1], 0) / P.length,
        ];
        const h: Pt = [r.holeAt[0] - o[0], r.holeAt[1] - o[1]];
        const onLine = P.some(([x, y]) => {
          const v: Pt = [x - o[0], y - o[1]];
          const cross = (h[0] * v[1] - h[1] * v[0]) / Math.hypot(...v);
          return Math.abs(cross) < 0.01 && h[0] * v[0] + h[1] * v[1] > 0;
        });
        expect(onLine, `${name} ${inches}"`).toBe(true);
      }
    // A 60° diamond's hole goes toward a sharp corner, where there's the most room.
    const D = mm('60° Diamond', 2);
    const r = buildTemplate(D, STL_BUILD, lines, 12);
    const o: Pt = [D.reduce((s, p) => s + p[0], 0) / 4, D.reduce((s, p) => s + p[1], 0) / 4];
    const far = Math.max(...D.map(([x, y]) => Math.hypot(x - o[0], y - o[1])));
    const sharp = D.filter(([x, y]) => Math.hypot(x - o[0], y - o[1]) > far - 1e-6);
    const toward = sharp.some(
      ([x, y]) => (x - o[0]) * (r.holeAt![0] - o[0]) + (y - o[1]) * (r.holeAt![1] - o[1]) > 0,
    );
    expect(toward).toBe(true);
  });

  it('the text shrinks up to a quarter to make room for a hole (owner, 2026-11-13)', () => {
    // A 2" Half Hexagon paper: 12 mm text fills the floor; at 10.83 mm a 3/8" hole fits.
    const r = buildTemplate(mm('Half Hexagon', 2), STL_BUILD, ['Edge: 2"', 'SA: 0'], 12);
    expect(r.hole).toBe('3/8"');
    expect(r.textSize).toBeLessThan(12);
    expect(r.textSize).toBeGreaterThanOrEqual(9);
    // No more than a quarter: a 1 1/2" Half Hexagon paper keeps its text and has no hole.
    const s = buildTemplate(mm('Half Hexagon', 1.5), STL_BUILD, ['Edge: 1 1/2"', 'SA: 0'], 9);
    expect(s.hole).toBeUndefined();
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
    expect(stlLength(0.95, 'cm')).toBe('9.5mm');
    for (const ch of 'Edge: Size SA: 0123456789/".m×') expect(STL_FONT.glyphs[ch]).toBeDefined();
  });
});
