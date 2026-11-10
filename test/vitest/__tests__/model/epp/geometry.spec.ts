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

  it('reaches half an edge whatever the zoom, and turns no more than allowed', () => {
    const middle = polys([piece('m', 'hex', [0, 0])]);
    // 0.4U off where it belongs, a few pixels' reach at this zoom: half an edge still catches it.
    const near = piece('n', 'hex', [0, Math.sqrt(3) + 0.4]);
    expect(snap(polys([near]), staticEdges(middle), 0.05)).toBeNull();
    const s = snap(polys([near]), staticEdges(middle), 0.05, Math.PI, 0.5);
    expect(snapPose(near, s!).at[1]).toBeCloseTo(Math.sqrt(3));
    // A square turned 45° from its neighbor: a 30° limit leaves it, a free turn snaps it.
    const sq = shape(
      'sq',
      orient([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ]),
    );
    const lk = lookupEpp({ eppShapes: [sq] });
    const at = (p: EppPiece) => expand(p, lk).map((l) => l.poly);
    const base = staticEdges(at(piece('b', 'sq', [0, 0])));
    const turned = at(piece('t', 'sq', [1.1, 0], 45));
    expect(snap(turned, base, 0.5, Math.PI / 6, 0.5)).toBeNull();
    expect(snap(turned, base, 0.5, Math.PI, 0.5)).not.toBeNull();
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

describe('usable shapes and warnings', () => {
  it('edges that are not whole units warn but leave the shape usable; marked ones clear it', async () => {
    const { failing, nonWholeEdges, passes, problems, unmarked } =
      await import('@/model/epp/checks');
    const tri = orient([
      [0, 0],
      [1, 0],
      [0, 1],
    ]);
    const f = checkOutline(tri);
    expect(passes(f)).toBe(true);
    expect(unmarked([{ outline: tri }])).toEqual([0]);
    expect(unmarked([{ outline: tri, marked: nonWholeEdges(tri) }])).toEqual([]);
    const bow: Poly = [
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 1],
    ];
    expect(failing([{ outline: bow }])).toEqual([0]);
    expect(problems(checkOutline(bow))).toContain('crosses itself');
  });
});

describe('turning a snapped piece', () => {
  it('turns to its next edge that fits the same neighbor, the smallest turn first', async () => {
    const { nextTurn, snapPose, staticEdges } = await import('@/model/epp/snap');
    const sq = shape(
      'sq',
      orient([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ]),
    );
    const half = shape(
      'h',
      orient([
        [0, 0],
        [1, 0],
        [0, 1],
      ]),
      [1],
    );
    const tri = shape(
      't',
      (() => {
        const r = 1 / Math.sqrt(3);
        return orient(
          [0, 1, 2].map((i): [number, number] => [
            r * Math.cos((2 * Math.PI * i) / 3),
            r * Math.sin((2 * Math.PI * i) / 3),
          ]),
        );
      })(),
    );
    const lk = lookupEpp({ eppShapes: [sq, half, tri] });
    const at = (p: EppPiece) => expand(p, lk).map((l) => l.poly);
    const base = staticEdges(at(piece('b', 'sq', [0, 0])));
    // A half square with a leg against the square's right edge: the next fit is the other leg
    // (90°); its long edge (√2) can't lie on a 1U edge.
    const h0 = at(piece('h', 'h', [0, 0]))[0]!;
    const legs = edges(h0).filter((e) => Math.abs(edgeLength(e) - 1) < 1e-9);
    expect(legs).toHaveLength(2);
    // Put it against the square by snapping it first.
    const near = piece('h', 'h', [0.85, 0.1]);
    const s0 = snap(at(near), base, 0.6, Math.PI, 0.5)!;
    const placed = snapPose(near, s0);
    const turned = nextTurn(at(placed), base)!;
    expect(Math.abs(turned.rot)).toBeCloseTo(Math.PI / 2, 6);
    const after = snapPose(placed, turned);
    expect([...overlapping([...at(piece('b', 'sq', [0, 0])), ...at(after)])]).toEqual([]);
    // The owner's case: a honeycomb's flat top under a square stays attached as it turns.
    const { eppStarters } = await import('@/content/epp');
    const hc = eppStarters().shapes.find((x) => x.notecard.name === 'Honeycomb')!;
    const lk2 = lookupEpp({ eppShapes: [sq, hc] });
    const at2 = (p: EppPiece) => expand(p, lk2).map((l) => l.poly);
    const square = at2(piece('b', 'sq', [0, 0]));
    const idx = staticEdges(square);
    let hcPose = snapPose(
      piece('c', hc.id, [0, 1.3]),
      snap(at2(piece('c', hc.id, [0, 1.3])), idx, 0.6, Math.PI, 0.5)!,
    );
    for (let k = 0; k < 6; k++) {
      const s = nextTurn(at2(hcPose), idx)!;
      expect(s).not.toBeNull();
      expect(Math.abs(s.rot)).toBeLessThan(Math.PI);
      hcPose = snapPose(hcPose, s);
      // Still against the square, not overlapping it.
      expect(nextTurn(at2(hcPose), idx)).not.toBeNull();
      expect([...overlapping([...square, ...at2(hcPose)])]).toEqual([]);
    }
    // Not snapped: nothing to turn along.
    expect(nextTurn(at(piece('far', 'sq', [5, 5])), base)).toBeNull();
  });
});
