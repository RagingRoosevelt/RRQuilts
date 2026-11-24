import { describe, expect, it } from 'vitest';
import { expand, lookupEpp } from '@/model/epp/expand';
import {
  centroid,
  edges,
  orient,
  outerEdges,
  overlapping,
  place,
  type Poly,
} from '@/model/epp/geometry';
import { cellAt, gridKindFor, nearestPoint, snapOrigin, variants } from '@/model/epp/grid';
import { attach, fits } from '@/model/epp/grow';
import {
  addColoring,
  addPiece,
  closeSpace,
  copyIn,
  deleteColoring,
  newRosette,
  paintPiece,
  removePieces,
  splitPiece,
  fillGap,
} from '@/model/epp/rosette-ops';
import { lineCut } from '@/model/epp/faces';
import type { EppShape } from '@/model/schema/epp';

function regular(n: number): Poly {
  const r = 1 / (2 * Math.sin(Math.PI / n));
  return orient(
    Array.from({ length: n }, (_, i): [number, number] => [
      r * Math.cos((2 * Math.PI * i) / n),
      r * Math.sin((2 * Math.PI * i) / n),
    ]),
  );
}
const hex: EppShape = { id: 'hex', notecard: { name: 'Hexagon' }, outline: regular(6) };
const square: EppShape = {
  id: 'sq',
  notecard: { name: 'Square' },
  outline: orient([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]),
};

describe('grow', () => {
  it('attaching a hexagon to each edge of a hexagon makes a flower', () => {
    const middle = place(hex.outline, { at: [0, 0], turn: 0, scale: 1 });
    const polys = [middle];
    for (const e of edges(middle)) {
      const pose = attach(hex.outline, 1, e, polys);
      expect(pose).not.toBeNull();
      polys.push(place(hex.outline, pose!));
    }
    expect(polys).toHaveLength(7);
    expect([...overlapping(polys)]).toEqual([]);
    for (const p of polys.slice(1)) expect(Math.hypot(...centroid(p))).toBeCloseTo(Math.sqrt(3));
  });

  it('a 1U square fits a 2U edge at two places, nearest the tap', () => {
    const big = place(
      orient([
        [0, 0],
        [2, 0],
        [2, 1],
        [0, 1],
      ]),
      { at: [1, 0.5], turn: 0, scale: 1 },
    );
    const top = outerEdges([big]).find(([a, b]) => Math.abs(a[1]) < 1e-9 && Math.abs(b[1]) < 1e-9)!;
    const left = attach(square.outline, 1, top, [big], [0.2, -0.5]);
    const right = attach(square.outline, 1, top, [big], [1.8, -0.5]);
    expect(left!.at[0]).toBeCloseTo(0.5);
    expect(right!.at[0]).toBeCloseTo(1.5);
    expect(left!.at[1]).toBeCloseTo(-0.5);
  });

  it('nothing fits where it would overlap', () => {
    const a = place(square.outline, { at: [0, 0], turn: 0, scale: 1 });
    const b = place(square.outline, { at: [1, 0], turn: 0, scale: 1 });
    // a's right edge is against b: attaching there overlaps b.
    const right = edges(a).find(
      ([p, q]) => Math.abs(p[0] - 0.5) < 1e-9 && Math.abs(q[0] - 0.5) < 1e-9,
    )!;
    expect(fits(square.outline, 1, right, [a, b])).toBe(false);
  });
});

describe('grid', () => {
  it('hexagons sit on the triangle grid, squares on the square grid', () => {
    expect(gridKindFor(hex.outline)).toBe('triangle');
    expect(gridKindFor(square.outline)).toBe('square');
    expect(variants(hex.outline, 1, 'triangle').length).toBeGreaterThan(0);
  });

  it('cellAt puts every corner on a lattice point', () => {
    const g = { kind: 'triangle' as const, origin: [0.2, 0.1] as [number, number], step: 1 };
    const pose = cellAt(hex.outline, 1, g, [3.3, 2.1])!;
    for (const p of place(hex.outline, pose)) {
      const q = nearestPoint(g, p);
      expect(Math.hypot(q[0] - p[0], q[1] - p[1])).toBeLessThan(1e-6);
    }
  });

  it('the grid snaps to a placed corner in reach', () => {
    const g = { kind: 'square' as const, origin: [0.1, 0.05] as [number, number], step: 1 };
    const o = snapOrigin(g, [[3, 4]], 0.3);
    expect(o[0]).toBeCloseTo(0);
    expect(o[1]).toBeCloseTo(0);
  });
});

describe('rosette operations', () => {
  it('copying a flower into a rosette leaves no rosette refs and keeps its fills', () => {
    let flower = newRosette('Flower', 'me');
    flower = addPiece(flower, 'hex', { at: [0, 0], turn: 0, scale: 1 }, { color: 'y' });
    flower = addPiece(flower, 'hex', { at: [0, Math.sqrt(3)], turn: 0, scale: 1 }, { color: 'r' });
    const lk = lookupEpp({ eppShapes: [hex], rosettes: [flower] });
    const r = copyIn(newRosette('Garden', 'me'), flower, lk, { at: [10, 0], turn: 60, scale: 1 });
    expect(r.pieces).toHaveLength(2);
    expect(r.pieces.every((p) => p.shape === 'hex')).toBe(true);
    const fills = r.pieces.map((p) => r.colorings[0]!.fills[p.id]);
    expect(fills).toEqual([{ color: 'y' }, { color: 'r' }]);
    // The two copies are still neighbors, √3 apart.
    const [a, b] = r.pieces.map((p) => p.at);
    expect(Math.hypot(a![0] - b![0], a![1] - b![1])).toBeCloseTo(Math.sqrt(3));
  });

  it('close space fills the middle of a ring of six hexagons', () => {
    let r = newRosette('Ring');
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      r = addPiece(r, 'hex', {
        at: [Math.sqrt(3) * Math.cos(a), Math.sqrt(3) * Math.sin(a)],
        turn: 0,
        scale: 1,
      });
    }
    const lk = lookupEpp({ eppShapes: [hex], rosettes: [r] });
    const polys = r.pieces.map((p) => place(hex.outline, p));
    const closed = closeSpace(r, polys, [0, 0])!;
    expect(closed.shapes).toHaveLength(1);
    expect(closed.pieces).toHaveLength(7);
    const leaves = expand(
      { id: 'x', rosette: r.id, at: [0, 0], turn: 0, scale: 1 },
      lookupEpp({ eppShapes: [hex], rosettes: [closed] }),
    );
    expect([...overlapping(leaves.map((l) => l.poly))]).toEqual([]);
    expect(lk.shape('hex')).toBeDefined();
  });

  it('close space line: a corner-to-corner line fills the gaps on both sides or splits a piece, known shapes used', () => {
    let r = newRosette('Ring');
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      r = addPiece(r, 'hex', {
        at: [Math.sqrt(3) * Math.cos(a), Math.sqrt(3) * Math.sin(a)],
        turn: 0,
        scale: 1,
      });
    }
    const h = Math.sqrt(3) / 2;
    const half = {
      id: 'half',
      outline: orient([
        [1, 0],
        [0.5, h],
        [-0.5, h],
        [-1, 0],
      ]),
    };
    const polys = r.pieces.map((p) => place(hex.outline, p));
    // Across the hole: both halves, each the known half hexagon.
    const cut = lineCut(polys, [1, 0], [-1, 0]);
    const gaps = (cut as { gaps: Poly[] }).gaps;
    expect(gaps).toHaveLength(2);
    const two = gaps.reduce((out, g) => fillGap(out, g, [half]), r);
    expect(two.pieces.slice(6).map((p) => p.shape)).toEqual(['half', 'half']);
    expect(two.shapes).toBeUndefined();
    // Fill the whole hole (a new shape), paint it, then split it along the same line.
    let full = closeSpace(r, polys, [0, 0])!;
    const mid = full.pieces.at(-1)!;
    full = paintPiece(full, full.colorings[0]!.id, mid.id, { color: 'x' });
    const all = full.pieces.map((p) =>
      place((p.shape === 'hex' ? hex : full.shapes![0]!).outline, p),
    );
    const s = lineCut(all, [1, 0], [-1, 0]);
    expect(s && 'piece' in s && s.piece).toBe(6);
    const split = splitPiece(full, mid.id, (s as { parts: Poly[] }).parts, [half]);
    expect(split.pieces).toHaveLength(8);
    expect(split.pieces.slice(6).map((p) => p.shape)).toEqual(['half', 'half']);
    expect(split.shapes).toBeUndefined();
    expect(split.pieces.slice(6).map((p) => split.colorings[0]!.fills[p.id])).toEqual([
      { color: 'x' },
      { color: 'x' },
    ]);
    // Along an edge both sides are pieces: nothing.
    expect(lineCut(polys, [1, 0], [0.5, h])).toBeNull();
  });

  it('colorings: add a copy, paint, delete; removing a piece drops its fills', () => {
    let r = addPiece(newRosette('R'), 'sq', { at: [0, 0], turn: 0, scale: 1 }, { color: 'a' });
    const { rosette, id } = addColoring(r, r.colorings[0]!.id);
    r = paintPiece(rosette, id, r.pieces[0]!.id, { color: 'b' });
    expect(r.colorings.map((c) => c.fills[r.pieces[0]!.id])).toEqual([
      { color: 'a' },
      { color: 'b' },
    ]);
    r = deleteColoring(r, id);
    expect(r.colorings).toHaveLength(1);
    expect(deleteColoring(r, r.colorings[0]!.id).colorings).toHaveLength(1);
    r = removePieces(r, new Set([r.pieces[0]!.id]));
    expect(r.colorings[0]!.fills).toEqual({});
  });
});
