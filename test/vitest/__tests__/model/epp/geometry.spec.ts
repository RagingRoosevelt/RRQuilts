import { describe, expect, it } from 'vitest';
import { checkOutline } from '@/model/epp/checks';
import { expand, lookupEpp } from '@/model/epp/expand';
import {
  centroid,
  cornerAngles,
  edges,
  edgeLength,
  orient,
  outerEdges,
  overlapping,
  place,
  type Poly,
} from '@/model/epp/geometry';
import { snap, snapPose, staticEdges } from '@/model/epp/snap';
import type { EppPiece, EppShape, Rosette } from '@/model/schema/epp';

/** A regular n-gon with unit edges, counter-clockwise on screen. */
function regular(n: number): Poly {
  const r = 1 / (2 * Math.sin(Math.PI / n));
  return orient(
    Array.from({ length: n }, (_, i): [number, number] => [
      r * Math.cos((2 * Math.PI * i) / n),
      r * Math.sin((2 * Math.PI * i) / n),
    ]),
  );
}
const shape = (id: string, outline: Poly, marked?: number[]): EppShape => ({
  id,
  notecard: { name: id },
  outline,
  ...(marked ? { marked } : {}),
});
const piece = (id: string, s: string, at: [number, number], turn = 0, scale = 1): EppPiece => ({
  id,
  shape: s,
  at,
  turn,
  scale,
});

describe('geometry', () => {
  it('places around the centroid and keeps outlines counter-clockwise', () => {
    const sq = orient([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    const p = place(sq, { at: [5, 5], turn: 90, scale: 2, mirror: true });
    expect(centroid(p)[0]).toBeCloseTo(5);
    expect(centroid(p)[1]).toBeCloseTo(5);
    expect(edges(p).every((e) => Math.abs(edgeLength(e) - 2) < 1e-9)).toBe(true);
    expect(cornerAngles(p).every((a) => Math.abs(a - 90) < 1e-9)).toBe(true);
  });

  it('corner angles of a hexagon are 120°', () => {
    expect(cornerAngles(regular(6)).every((a) => Math.abs(a - 120) < 1e-9)).toBe(true);
  });

  it('a short edge along part of a long one leaves the rest of the long one outside', () => {
    const long = orient([
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
    ]);
    const small = orient([
      [0, -1],
      [1, -1],
      [1, 0],
      [0, 0],
    ]);
    const out = outerEdges([long, small]);
    const onTop = out.filter(([a, b]) => Math.abs(a[1]) < 1e-9 && Math.abs(b[1]) < 1e-9);
    expect(onTop).toHaveLength(1);
    expect(edgeLength(onTop[0]!)).toBeCloseTo(1);
  });

  it('finds overlaps but not touching pieces', () => {
    const sq = orient([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]);
    const a = place(sq, { at: [0, 0], turn: 0, scale: 1 });
    const b = place(sq, { at: [1, 0], turn: 0, scale: 1 });
    const c = place(sq, { at: [0.5, 0], turn: 0, scale: 1 });
    expect([...overlapping([a, b])]).toEqual([]);
    expect([...overlapping([a, c])].sort()).toEqual([0, 1]);
  });
});

describe('checks', () => {
  it('a 2-1-2-1 parallelogram is closed, simple, whole and convex', () => {
    const f = checkOutline(
      orient([
        [0, 0],
        [2, 0],
        [2.5, Math.sqrt(3) / 2],
        [0.5, Math.sqrt(3) / 2],
      ]),
    );
    expect(f).toEqual({ closes: true, simple: true, wholeUnits: true, convex: true });
  });
  it('a bow-tie crosses itself', () => {
    expect(
      checkOutline([
        [0, 0],
        [1, 1],
        [1, 0],
        [0, 1],
      ]).simple,
    ).toBe(false);
  });
  it('a dart is not convex', () => {
    const f = checkOutline(
      orient([
        [0, 0],
        [2, 0],
        [1, 0.5],
        [1, 2],
      ]),
    );
    expect(f.convex).toBe(false);
  });
  it('a marked edge passes the whole-unit flag', () => {
    const tri = orient([
      [0, 0],
      [1, 0],
      [0, 1],
    ]);
    expect(checkOutline(tri).wholeUnits).toBe(false);
    const hyp = edges(tri).findIndex((e) => edgeLength(e) > 1.2);
    expect(checkOutline(tri, [hyp]).wholeUnits).toBe(true);
  });
  it('fewer than three corners does not close', () => {
    expect(
      checkOutline([
        [0, 0],
        [1, 0],
        [1, 0],
      ]).closes,
    ).toBe(false);
  });
});

describe('expand', () => {
  it('expands a rosette with its coloring and per-placement repaints', () => {
    const hex = shape('hex', regular(6));
    const r: Rosette = {
      id: 'flower',
      notecard: { name: 'Flower' },
      pieces: [
        { id: 'a', shape: 'hex', at: [0, 0], turn: 0, scale: 1 },
        { id: 'b', shape: 'hex', at: [0, Math.sqrt(3)], turn: 0, scale: 1 },
      ],
      colorings: [{ id: 'c1', fills: { a: { color: 'y' }, b: { color: 'r' } } }],
    };
    const lookup = lookupEpp({ eppShapes: [hex], rosettes: [r] });
    const leaves = expand(
      { id: 'p', rosette: 'flower', at: [10, 10], turn: 0, scale: 2, fills: { b: { color: 'g' } } },
      lookup,
    );
    expect(leaves.map((l) => l.fill)).toEqual([{ color: 'y' }, { color: 'g' }]);
    expect(leaves.every((l) => l.scale === 2)).toBe(true);
    expect(edgeLength(edges(leaves[0]!.poly)[0]!)).toBeCloseTo(2);
  });
  it('a missing shape expands to nothing', () => {
    expect(expand(piece('p', 'nope', [0, 0]), lookupEpp({}))).toEqual([]);
  });
});

describe('snap', () => {
  const hex = shape('hex', regular(6));
  const lookup = lookupEpp({ eppShapes: [hex] });
  const polys = (ps: EppPiece[]) => ps.flatMap((p) => expand(p, lookup).map((l) => l.poly));

  it('six hexagons dropped near a middle one each snap flush', () => {
    const middle = piece('m', 'hex', [0, 0]);
    for (let k = 0; k < 6; k++) {
      const ang = (Math.PI / 3) * k + Math.PI / 6;
      const near = piece('n', 'hex', [1.9 * Math.cos(ang), 1.9 * Math.sin(ang)], 7);
      const s = snap(polys([near]), staticEdges(polys([middle])), 0.8);
      expect(s).not.toBeNull();
      const placed = snapPose(near, s!);
      expect(Math.hypot(placed.at[0], placed.at[1])).toBeCloseTo(Math.sqrt(3), 6);
      expect([...overlapping(polys([middle, placed]))]).toEqual([]);
    }
  });

  it('a 1U square edge sits along a 2U edge at whole-unit steps', () => {
    const big = shape(
      'big',
      orient([
        [0, 0],
        [2, 0],
        [2, 1],
        [0, 1],
      ]),
    );
    const sq = shape(
      'sq',
      orient([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ]),
    );
    const lk = lookupEpp({ eppShapes: [big, sq] });
    const base = expand(piece('b', 'big', [1, 0.5]), lk).map((l) => l.poly);
    for (const x of [0.6, 1.4]) {
      const moving = piece('s', 'sq', [x, -0.6]);
      const s = snap(
        expand(moving, lk).map((l) => l.poly),
        staticEdges(base),
        0.6,
      );
      const at = snapPose(moving, s!).at;
      expect(at[0]).toBeCloseTo(x < 1 ? 0.5 : 1.5);
      expect(at[1]).toBeCloseTo(-0.5);
    }
  });

  it('a marked 1.5 edge snaps to 3 and 0.75 but not to 1', () => {
    const rect = (id: string, w: number) =>
      shape(
        id,
        orient([
          [0, 0],
          [w, 0],
          [w, 1],
          [0, 1],
        ]),
        [0, 2],
      );
    const lk = lookupEpp({
      eppShapes: [rect('a', 1.5), rect('b', 3), rect('c', 0.75), rect('d', 1)],
    });
    const moving = piece('m', 'a', [0, -0.55]);
    const mp = expand(moving, lk).map((l) => l.poly);
    for (const [id, ok] of [
      ['b', true],
      ['c', true],
      ['d', false],
    ] as const) {
      const base = expand(piece('x', id, [0, 0.5]), lk).map((l) => l.poly);
      const s = snap(mp, staticEdges(base), 1, 0.01);
      // Only the long sides can meet (the 1U ends are whole, 1.5 isn't a multiple of 1).
      const ok2 =
        !!s &&
        Math.abs(edgeLength(s.target) - Math.min(1.5, id === 'b' ? 3 : id === 'c' ? 0.75 : 1)) <
          1e-9;
      expect(ok2).toBe(ok);
    }
  });
});
