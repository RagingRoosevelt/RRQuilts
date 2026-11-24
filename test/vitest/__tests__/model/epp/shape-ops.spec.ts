import { describe, expect, it } from 'vitest';
import { checkOutline } from '@/model/epp/checks';
import { gapAt, splitOutline } from '@/model/epp/faces';
import { cornerAngles, edgeLength, edges, orient, place, type Poly } from '@/model/epp/geometry';
import {
  lengthLabel,
  moveVertex,
  newShape,
  normalize,
  removeEdge,
  removeVertex,
  setAngle,
  snapToGrid,
  splitEdge,
  toggleLocked,
  toggleMarked,
} from '@/model/epp/shape-ops';
import { signedArea } from '@/model/geometry/path';

function hexagon(): Poly {
  return orient(
    Array.from({ length: 6 }, (_, i): [number, number] => [
      Math.cos((Math.PI / 3) * i),
      Math.sin((Math.PI / 3) * i),
    ]),
  );
}

describe('shape operations', () => {
  it('a new shape is a unit square, counter-clockwise, passing every check', () => {
    const s = newShape('Square', 'me');
    expect(signedArea(s.outline)).toBeGreaterThan(0);
    expect(checkOutline(s.outline)).toEqual({
      closes: true,
      simple: true,
      wholeUnits: true,
      convex: true,
    });
  });

  it('snaps corners to the square and triangle grids', () => {
    expect(snapToGrid([1.4, 2.6], 'square')).toEqual([1, 3]);
    const t = snapToGrid([0.45, 0.9], 'triangle');
    expect(t[0]).toBeCloseTo(0.5);
    expect(t[1]).toBeCloseTo(Math.sqrt(3) / 2);
    expect(snapToGrid([0.3, 0.3], 'free')).toEqual([0.3, 0.3]);
  });

  it('a locked corner does not move', () => {
    const s = toggleLocked(newShape('S'), 0);
    expect(moveVertex(s, 0, [5, 5], 'square').outline).toEqual(s.outline);
    expect(moveVertex(s, 1, [2, 1], 'square').outline[1]).toEqual([2, 1]);
  });

  it('setAngle turns a square corner to 60°, the turned edge keeping its length', () => {
    const s = setAngle(newShape('S'), 0, 60);
    expect(cornerAngles(orient(s.outline))[0]).toBeCloseTo(60);
    expect(edgeLength(edges(s.outline)[0]!)).toBeCloseTo(1);
  });

  it('setAngle does nothing when both neighbors are locked', () => {
    const s = toggleLocked(toggleLocked(newShape('S'), 1), 3);
    expect(setAngle(s, 0, 60)).toBe(s);
  });

  it('splitting a marked edge keeps both halves marked; removing a corner joins edges', () => {
    const s = splitEdge(toggleMarked(newShape('S'), 1), 1);
    expect(s.outline).toHaveLength(5);
    expect(s.marked).toEqual([1, 2]);
    expect(removeVertex(s, 2).outline).toHaveLength(4);
  });

  it('deleting an edge joins its corners at its middle; a triangle keeps its three', () => {
    const s = toggleMarked(newShape('S'), 2);
    const r = removeEdge(s, 0);
    expect(r.outline).toHaveLength(3);
    expect(r.outline[0]).toEqual([0.5, 1]);
    // Edge 2 (corner 2 to 3) is now edge 1.
    expect(r.marked).toEqual([1]);
    expect(removeEdge(r, 0)).toBe(r);
    // A locked corner stays where it is.
    const l = removeEdge(toggleLocked(newShape('S'), 1), 0);
    expect(l.outline[0]).toEqual([1, 1]);
    expect(l.locked).toEqual([0]);
  });

  it('normalize reverses a clockwise outline and re-indexes locks and marks', () => {
    const cw: { outline: [number, number][]; locked?: number[]; marked?: number[] } = {
      outline: [...newShape('S').outline].reverse(),
      locked: [0],
      marked: [0],
    };
    const n = normalize(cw);
    expect(signedArea(n.outline)).toBeGreaterThan(0);
    expect(n.outline[n.locked![0]!]).toEqual(cw.outline[0]);
    const [a, b] = edges(cw.outline)[0]!;
    const [c, d] = edges(n.outline)[n.marked![0]!]!;
    expect([c, d]).toEqual([b, a]);
  });

  it('labels lengths as whole numbers, fractions or decimals', () => {
    expect(lengthLabel(2)).toBe('2');
    expect(lengthLabel(0.5)).toBe('1/2');
    expect(lengthLabel(1.25)).toBe('1 1/4');
    expect(lengthLabel(Math.SQRT2)).toBe('1.41');
  });
});

describe('faces', () => {
  it('a hexagon cut by its three diagonals makes six triangles', () => {
    const h = hexagon();
    const shapes = splitOutline(h, [
      [h[0]!, h[3]!],
      [h[1]!, h[4]!],
      [h[2]!, h[5]!],
    ]);
    expect(shapes).toHaveLength(6);
    for (const s of shapes) {
      expect(s.outline).toHaveLength(3);
      expect(checkOutline(s.outline).wholeUnits).toBe(true);
    }
  });

  it('the gap in a ring of six hexagons is a hexagon', () => {
    const ring = Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      return place(hexagon(), {
        at: [Math.sqrt(3) * Math.cos(a), Math.sqrt(3) * Math.sin(a)],
        turn: 0,
        scale: 1,
      });
    });
    const gap = gapAt(ring, [0, 0]);
    expect(gap).not.toBeNull();
    expect(gap!).toHaveLength(6);
    expect(Math.abs(signedArea(gap!))).toBeCloseTo((3 * Math.sqrt(3)) / 2);
  });

  it('no gap on a piece or in open space', () => {
    const one = [place(hexagon(), { at: [0, 0], turn: 0, scale: 1 })];
    expect(gapAt(one, [0, 0])).toBeNull();
    expect(gapAt(one, [5, 5])).toBeNull();
  });
});

describe('matching existing shapes', () => {
  it('finds a library shape at any turn, mirrored, and at a whole scale', async () => {
    const { matchShape } = await import('@/model/epp/match');
    const { eppStarters } = await import('@/content/epp');
    const shapes = eppStarters().shapes;
    const half = shapes.find((s) => s.notecard.name === 'Half Square')!;
    for (const pose of [
      { at: [3, 1] as [number, number], turn: 90, scale: 1, mirror: false },
      { at: [-2, 5] as [number, number], turn: 225, scale: 2, mirror: true },
    ]) {
      const drawn = place(half.outline, pose);
      const m = matchShape(drawn, shapes)!;
      expect(m.shape.id).toBe(half.id);
      const again = place(m.shape.outline, m.pose);
      again.forEach((p, i) => {
        const q = drawn.reduce((b, x) =>
          Math.hypot(x[0] - p[0], x[1] - p[1]) < Math.hypot(b[0] - p[0], b[1] - p[1]) ? x : b,
        );
        expect(Math.hypot(q[0] - p[0], q[1] - p[1])).toBeLessThan(1e-6);
        void i;
      });
    }
  });

  it('a hexagon split by its three diagonals gives six library triangles', async () => {
    const { matchShape } = await import('@/model/epp/match');
    const { eppStarters } = await import('@/content/epp');
    const shapes = eppStarters().shapes;
    const h = hexagon();
    const parts = splitOutline(h, [
      [h[0]!, h[3]!],
      [h[1]!, h[4]!],
      [h[2]!, h[5]!],
    ]);
    expect(parts.map((p) => matchShape(p.outline, shapes)?.shape.notecard.name)).toEqual(
      Array(6).fill('Triangle'),
    );
    // A shape no library has stays its own.
    expect(
      matchShape(
        [
          [0, 0],
          [3, 0],
          [0, 1],
        ],
        shapes,
      ),
    ).toBeNull();
  });
});
