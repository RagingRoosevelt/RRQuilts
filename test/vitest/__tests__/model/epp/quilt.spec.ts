import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { autoClose, cutRect } from '@/model/epp/edge';
import { lookupEpp } from '@/model/epp/expand';
import { bbox, edges, place } from '@/model/epp/geometry';
import {
  addPiece,
  breakIntoPatches,
  newEppQuilt,
  paint,
  piecePolys,
  refresh,
  setEdge,
  fillGap,
  splitPiece,
} from '@/model/epp/quilt-ops';
import { lineCut } from '@/model/epp/faces';
import { generateFor } from '@/model/layout/slots';
import { signedArea } from '@/model/geometry/path';
import type { Quilt } from '@/model/schema/quilt';

const { shapes, rosettes } = eppStarters();
const lookup = lookupEpp({ eppShapes: shapes, rosettes });
const hexId = 'rrquilts.epp-hexagon';
const flowerId = rosettes.find((r) => r.notecard.name === 'Hexagon Flower')!.id;
const sqId = 'rrquilts.epp-square';

/** A 19-hexagon double flower as one placed rosette. */
function garden(): Quilt {
  const doubleId = rosettes.find((r) => r.notecard.name === 'Double Flower')!.id;
  return refresh(
    addPiece(newEppQuilt('G', 'in'), { rosette: doubleId, at: [0, 0], turn: 0, scale: 1 }).quilt,
    lookup,
  );
}

describe('EPP quilt', () => {
  it('starts at 1U = 2 in (5 cm) and 3/8 in (1 cm) seam allowance, no edge', () => {
    const q = newEppQuilt('Q', 'in');
    expect(q.layout).toEqual({ style: 'epp', unit: 2, seam: 0.375, edge: { kind: 'none' } });
    expect(newEppQuilt('Q', 'cm').layout).toMatchObject({ unit: 5, seam: 1 });
  });

  it('its size follows the 1U length; the arrangement stays', () => {
    const q = garden();
    const g = generateFor(q);
    const [x0, , x1] = g.bounds;
    const [u0, , u1] = q.epp!.box!;
    expect(x1 - x0).toBeCloseTo((u1 - u0) * 2);
    const bigger = { ...q, layout: { ...q.layout, unit: 3 } } as Quilt;
    const [b0, , b1] = generateFor(bigger).bounds;
    expect(b1 - b0).toBeCloseTo((u1 - u0) * 3);
  });

  it('borders only round a made edge', () => {
    const q = { ...garden(), borders: [{ style: 'mitered', sides: [1, 1, 1, 1] }] } as Quilt;
    expect(generateFor(q).slots).toHaveLength(0);
    const closed = setEdge(q, { kind: 'close' }, lookup);
    expect(generateFor(closed).slots.length).toBeGreaterThan(0);
  });

  it('Auto-close fills the notches round a flower up to its rectangle', () => {
    const q = setEdge(garden(), { kind: 'close' }, lookup);
    const polys = piecePolys(q, lookup);
    const closing = q.epp!.closing!;
    expect(closing.length).toBeGreaterThan(0);
    const area = (ps: [number, number][][]) => ps.reduce((s, p) => s + Math.abs(signedArea(p)), 0);
    const [x0, y0, x1, y1] = bbox(polys);
    expect(area(polys) + area(closing.map((c) => c.outline))).toBeCloseTo((x1 - x0) * (y1 - y0), 4);
    // (No overlap check: closing pieces aren't convex, and `overlapping` is exact for convex only.)
  });

  it('Cut to size starts as a rectangle the pieces fill', () => {
    const q = setEdge(garden(), { kind: 'cut', rect: [0, 0, 0, 0] }, lookup);
    const edge = q.layout.style === 'epp' ? q.layout.edge : undefined;
    expect(edge?.kind).toBe('cut');
    const r: [number, number, number, number] = edge?.kind === 'cut' ? edge.rect : [0, 0, 0, 0];
    expect(r[2] - r[0]).toBeGreaterThan(3);
    expect(r[3] - r[1]).toBeGreaterThan(3);
    expect(q.epp!.box).toEqual(r);
    expect(generateFor(q).trim).toBe(true);
    // Every corner of it is covered by a piece.
    const polys = piecePolys(q, lookup);
    expect(cutRect(polys)).toEqual(r);
  });

  it('paint scopes: this, all of the rosette piece, same shape, same fill', () => {
    let q = addPiece(newEppQuilt('Q', 'in'), {
      rosette: flowerId,
      at: [0, 0],
      turn: 0,
      scale: 1,
    }).quilt;
    const second = addPiece(q, { rosette: flowerId, at: [10, 0], turn: 0, scale: 1 });
    q = second.quilt;
    const [first] = q.epp!.pieces;
    const red = { color: 'red' };
    const fillsOf = (x: Quilt) => x.epp!.pieces.map((p) => Object.keys(p.fills ?? {}).length);
    expect(fillsOf(paint(q, lookup, first!.id, 'p1', red, 'this'))).toEqual([1, 0]);
    expect(fillsOf(paint(q, lookup, first!.id, 'p1', red, 'all'))).toEqual([1, 1]);
    expect(fillsOf(paint(q, lookup, first!.id, 'p1', red, 'shape'))).toEqual([7, 7]);
    // Petals share a fill: the same fill paints six in each flower.
    expect(fillsOf(paint(q, lookup, first!.id, 'p2', red, 'fill'))).toEqual([6, 6]);
  });

  it('break into patches keeps where pieces are and their fills', () => {
    const q = addPiece(newEppQuilt('Q', 'in'), {
      rosette: flowerId,
      at: [3, 4],
      turn: 30,
      scale: 2,
    }).quilt;
    const before = piecePolys(q, lookup);
    const broken = breakIntoPatches(q, lookup, q.epp!.pieces[0]!.id);
    expect(broken.epp!.pieces).toHaveLength(7);
    expect(broken.epp!.pieces.every((p) => p.shape === hexId && p.scale === 2)).toBe(true);
    const after = piecePolys(broken, lookup);
    after.forEach((p, i) => {
      const c = (x: [number, number][]) =>
        x.reduce((s, v) => [s[0] + v[0] / x.length, s[1] + v[1] / x.length], [0, 0]);
      expect(c(p)[0]).toBeCloseTo(c(before[i]!)[0]);
      expect(c(p)[1]).toBeCloseTo(c(before[i]!)[1]);
    });
    expect(broken.epp!.pieces.filter((p) => p.fills?.['']).length).toBe(7);
  });

  it('closing pieces on a square row are whole squares', () => {
    const sq = shapes.find((s) => s.id === sqId)!;
    const polys = [
      place(sq.outline, { at: [0.5, 0.5], turn: 0, scale: 1 }),
      place(sq.outline, { at: [2.5, 0.5], turn: 0, scale: 1 }),
      place(sq.outline, { at: [0.5, 1.5], turn: 0, scale: 1 }),
      place(sq.outline, { at: [1.5, 1.5], turn: 0, scale: 1 }),
      place(sq.outline, { at: [2.5, 1.5], turn: 0, scale: 1 }),
    ];
    const c = autoClose(polys);
    expect(c).toHaveLength(1);
    expect(edges(c[0]!.outline)).toHaveLength(4);
  });
});

describe('EPP quilt print pieces', () => {
  it('pieces at the 1U length, closing pieces included, outside the cut left out', async () => {
    const { eppQuiltPieces } = await import('@/model/epp/print');
    const { templates } = await import('@/model/print/pieces');
    const q = garden();
    const plain = eppQuiltPieces(q, lookup);
    expect(plain.pieces).toHaveLength(19);
    expect(templates(plain.pieces)).toHaveLength(1);
    // 1U = 2 in: a hexagon edge is 2 in.
    const [a, b] = plain.pieces[0]!.poly;
    expect(Math.hypot(b![0] - a![0], b![1] - a![1])).toBeCloseTo(2);
    const closed = eppQuiltPieces(setEdge(q, { kind: 'close' }, lookup), lookup);
    expect(closed.pieces.length).toBeGreaterThan(19);
    // A small cut in the middle leaves the outer ring out.
    const cut = eppQuiltPieces(setEdge(q, { kind: 'cut', rect: [-1, -1, 1, 1] }, lookup), lookup);
    expect(cut.outside).toBeGreaterThan(0);
    expect(cut.pieces.length + cut.outside).toBe(19);
  });

  it('close space line splits a square into two library Half Squares in its fill', () => {
    const q = addPiece(newEppQuilt('S', 'in'), {
      shape: sqId,
      at: [0, 0],
      turn: 0,
      scale: 1,
      fills: { '': { color: 'c' } },
    }).quilt;
    const sq = piecePolys(q, lookup)[0]!;
    const cut = lineCut([sq], sq[0]!, sq[2]!);
    expect(cut && 'piece' in cut).toBe(true);
    const out = splitPiece(
      q,
      q.epp!.pieces[0]!.id,
      (cut as { parts: (typeof sq)[] }).parts,
      shapes,
    );
    expect(out.epp!.pieces.map((p) => p.shape)).toEqual([
      'rrquilts.epp-half-square',
      'rrquilts.epp-half-square',
    ]);
    expect(out.epp!.pieces.map((p) => p.fills?.[''])).toEqual([{ color: 'c' }, { color: 'c' }]);
    expect(out.epp!.shapes).toBeUndefined();
  });

  it("close space line between two Six-Diamond Stars fills both sides (owner's Quilt 3)", () => {
    const star = rosettes.find((r) => r.notecard.name === 'Six-Diamond Star')!.id;
    let q = newEppQuilt('Q', 'in');
    for (const [at, turn] of [
      [[-1.4057157092264432, -0.6179966044142614], 0],
      [[1.5942842907735557, -0.6179966044142609], -60],
    ] as const)
      q = addPiece(q, { rosette: star, at: [...at], turn, scale: 1 }).quilt;
    const y = -0.6179966044142614;
    const cut = lineCut(piecePolys(q, lookup), [0.5942842907735557, y], [-0.4057157092264432, y]);
    const gaps = (cut as { gaps: ReturnType<typeof piecePolys> }).gaps;
    expect(gaps).toHaveLength(2);
    q = gaps.reduce((out, g) => fillGap(out, g, shapes), q);
    expect(q.epp!.pieces.slice(2).map((p) => p.shape)).toEqual([
      'rrquilts.epp-triangle',
      'rrquilts.epp-triangle',
    ]);
  });

  it('cut to size sits on the pieces, not past them (owner: "shifted towards the top too much")', () => {
    const star = rosettes.find((r) => r.notecard.name === 'Six-Diamond Star')!.id;
    let q = newEppQuilt('Q', 'in');
    const y = -0.6179966044142614;
    for (const p of [
      { rosette: star, at: [-1.4057157092264432, y] as [number, number], turn: 0 },
      { rosette: star, at: [1.5942842907735557, y] as [number, number], turn: -60 },
      {
        shape: 'rrquilts.epp-60-diamond',
        at: [0.09428429077355646, y] as [number, number],
        turn: -240,
      },
    ])
      q = addPiece(q, { ...p, scale: 1 }).quilt;
    const r = cutRect(piecePolys(q, lookup))!;
    const h = Math.sqrt(3) / 2;
    const want = [-1.4057157092264432 - 1, y - h, 1.5942842907735557 + 1, y + h];
    r.forEach((v, i) => expect(v).toBeCloseTo(want[i]!, 5));
  });
});
