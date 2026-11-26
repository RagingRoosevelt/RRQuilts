import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import {
  autoClose,
  cutRect,
  cutSnaps,
  dragCut,
  fitRatio,
  snapCorners,
  type Box,
} from '@/model/epp/edge';
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
  it('starts at 1U = 2 in (5 cm), no edge; the seam allowance is the project’s', () => {
    const q = newEppQuilt('Q', 'in');
    expect(q.layout).toEqual({ style: 'epp', unit: 2, edge: { kind: 'none' } });
    expect(newEppQuilt('Q', 'cm').layout).toMatchObject({ unit: 5 });
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
    const small = { kind: 'cut' as const, rect: [-1, -1, 1, 1] as Box, manual: true as const };
    const cut = eppQuiltPieces(setEdge(q, small, lookup), lookup);
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

  it('cut to size corners snap to piece corners within 1/4 U, in or out, most corners first', () => {
    // Top-left and top-right both land (2 corners, moving 0.4) beats top-left and bottom-right
    // (2 corners, moving 0.6); [2, 1] is near no corner.
    const corners: [number, number][] = [
      [0.1, -0.2],
      [3.9, -0.2],
      [4.2, 3.1],
      [2, 1],
    ];
    expect(snapCorners([0, 0, 4, 3], corners, 0.25)).toEqual([0.1, -0.2, 3.9, 3]);
    // Three corners beat two.
    expect(snapCorners([0, 0, 4, 3], [...corners, [0.1, 3.1], [3.9, 3.1]], 0.25)).toEqual([
      0.1, -0.2, 3.9, 3.1,
    ]);
    expect(snapCorners([0, 0, 4, 3], [], 0.25)).toEqual([0, 0, 4, 3]);
  });

  it('cut to size finds a gap narrower than 1/100 U (exact, not sampled)', () => {
    // Two 2 × 2 squares with a 0.005 slit between them: the cut stays in one.
    const sq = (x: number): [number, number][] => [
      [x, 0],
      [x + 2, 0],
      [x + 2, 2],
      [x, 2],
    ];
    const r = cutRect([sq(0), sq(2.005)])!;
    expect(r[2] - r[0]).toBeCloseTo(2, 6);
    // Touching, they're one 4 × 2 rectangle.
    expect(cutRect([sq(0), sq(2)])!.map((v) => +v.toFixed(6))).toEqual([0, 0, 4, 2]);
  });

  it('Largest rectangle follows the pieces; Manual keeps its size', () => {
    let q = setEdge(garden(), { kind: 'cut', rect: [0, 0, 0, 0] }, lookup);
    const rectOf = (x: Quilt) =>
      x.layout.style === 'epp' && x.layout.edge.kind === 'cut' ? x.layout.edge.rect : null;
    const before = rectOf(q)!;
    q = refresh(
      { ...q, epp: { ...q.epp!, pieces: q.epp!.pieces.map((p) => ({ ...p, at: [5, 3] })) } },
      lookup,
    );
    rectOf(q)!.forEach((v, i) => expect(v).toBeCloseTo(before[i]! + (i % 2 ? 3 : 5), 6));
    expect(q.epp!.box).toEqual(rectOf(q));
    // Manual: moving the pieces leaves the cut where it is.
    const manual: Box = [0, 0, 2, 2];
    q = setEdge(q, { kind: 'cut', rect: manual, manual: true }, lookup);
    q = refresh(
      { ...q, epp: { ...q.epp!, pieces: q.epp!.pieces.map((p) => ({ ...p, at: [0, 0] })) } },
      lookup,
    );
    expect(rectOf(q)).toEqual(manual);
  });

  it('a Manual cut drags by a side, a corner or its middle, snapping and keeping a ratio', () => {
    const polys: [number, number][][] = [
      [
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3],
      ],
      [
        [5, 1],
        [6, 2],
        [5, 3],
      ],
    ];
    const none = { x: [], y: [] };
    const o = { snaps: none, reach: 0.2, min: 1 };
    // A side moves alone; it never comes nearer its opposite than `min`.
    expect(dragCut([1, 1, 3, 2], 'r', [0.5, 9], o)).toEqual([1, 1, 3.5, 2]);
    expect(dragCut([1, 1, 3, 2], 'l', [5, 0], o)).toEqual([2, 1, 3, 2]);
    expect(dragCut([1, 1, 3, 2], 'tl', [-0.5, -0.5], o)).toEqual([0.5, 0.5, 3, 2]);
    expect(dragCut([1, 1, 3, 2], 'move', [1, 1], o)).toEqual([2, 2, 4, 3]);
    // Vertex snapping: a corner's line in reach, along the side.
    const v = { ...o, snaps: cutSnaps(polys, { vertex: true, edge: false }) };
    expect(dragCut([1, 1, 3, 2], 'r', [1.9, 0], v)).toEqual([1, 1, 5, 2]);
    // The triangle's tip at (6, 2) is on the side's line; its far corners (5, 1), (5, 3) too.
    expect(dragCut([1, 1, 3, 2], 'r', [2.9, 0], v)).toEqual([1, 1, 6, 2]);
    // Edge snapping only: the upright edge x = 5 (y 1 to 3) meets the side; no corner lines.
    const e = { ...o, snaps: cutSnaps(polys, { vertex: false, edge: true }) };
    expect(dragCut([1, 1, 3, 2], 'r', [1.85, 0], e)).toEqual([1, 1, 5, 2]);
    expect(dragCut([1, 1, 3, 2], 'r', [2.5, 0], e)).toEqual([1, 1, 5.5, 2]);
    // Moving snaps the side nearest a line (here the square's upright edge), keeping the size.
    const both = { ...o, snaps: cutSnaps(polys, { vertex: true, edge: true }) };
    dragCut([1, 1, 3, 2], 'move', [0.9, 0], both).forEach((x, i) =>
      expect(x).toBeCloseTo([2, 1, 4, 2][i]!, 9),
    );
    // A ratio: a side keeps the middle across, a corner its opposite corner.
    const r = { ...o, ratio: [2, 1] as [number, number] };
    expect(dragCut([0, 0, 2, 1], 'r', [2, 0], r)).toEqual([0, -0.5, 4, 1.5]);
    expect(dragCut([0, 0, 2, 1], 'br', [0, 1], r)).toEqual([0, 0, 4, 2]);
    expect(dragCut([0, 0, 2, 1], 'tl', [-2, 0], r)).toEqual([-2, -1, 2, 1]);
    // Picking a ratio: the largest of that shape inside, about the middle.
    expect(fitRatio([0, 0, 4, 4], [2, 1])).toEqual([0, 1, 4, 3]);
    expect(fitRatio([0, 0, 4, 1], [1, 1])).toEqual([1.5, 0, 2.5, 1]);
  });
});
