import { describe, expect, it } from 'vitest';
import { apply, type M, type Pt } from '@/model/geometry/affine';
import { deriveSeamPatches } from '@/model/blocks/derive';
import {
  ASPECT,
  BLOCK_SHAPES,
  SHAPE_OUTLINE,
  SHAPE_TURN,
  fitShape,
  lattice,
  legOf,
  shapeOrient,
  shapeSize,
} from '@/model/blocks/shape';

const near = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-9;
/** Every corner lands on some corner. */
const keepsOutline = (m: M, pts: Pt[]) => pts.every((p) => pts.some((q) => near(apply(m, p), q)));

describe('block shapes', () => {
  it('sizes from leg, width, or height', () => {
    expect(shapeSize('hexagon', 'leg', 2)).toEqual([2 * Math.sqrt(3), 4]);
    const tri = shapeSize('triangle', 'height', Math.sqrt(3));
    expect(tri[0]).toBeCloseTo(2);
    expect(legOf('triangle', tri)).toBeCloseTo(2);
    for (const s of BLOCK_SHAPES) {
      const [w, h] = shapeSize(s, 'leg', 3);
      expect(h / w).toBeCloseTo(ASPECT[s]);
      expect(legOf(s, [w, h])).toBeCloseTo(3);
    }
  });

  it('turns and flips map each outline onto itself', () => {
    for (const s of BLOCK_SHAPES)
      for (let r = 0; r < 360; r += SHAPE_TURN[s])
        for (const f of [false, true])
          expect(keepsOutline(shapeOrient(s, r, f), SHAPE_OUTLINE[s])).toBe(true);
    // A 60° turn of a triangle is not a symmetry.
    expect(keepsOutline(shapeOrient('triangle', 60, false), SHAPE_OUTLINE.triangle)).toBe(false);
  });

  it('fits a shape onto a turned, either-wound polygon without mirroring', () => {
    // A point-down triangle, side 2, wound the other way.
    const down: Pt[] = [
      [0, 0],
      [1, Math.sqrt(3)],
      [2, 0],
    ];
    const m = fitShape('triangle', down)!;
    expect(m[0] * m[3] - m[1] * m[2]).toBeGreaterThan(0);
    for (const q of SHAPE_OUTLINE.triangle)
      expect(down.some((p) => near(apply(m, q), p))).toBe(true);
    // Upright: no turn.
    const up = SHAPE_OUTLINE.hexagon.map(([x, y]): Pt => [x * 4 + 1, y * (4 * ASPECT.hexagon)]);
    fitShape('hexagon', up)!.forEach((x, i) =>
      expect(x).toBeCloseTo([4, 0, 0, 4 * ASPECT.hexagon, 1, 0][i]!),
    );
    expect(fitShape('hexagon', down)).toBeUndefined();
  });

  it('snaps to a triangle grid through every corner', () => {
    for (const s of BLOCK_SHAPES) {
      const size = shapeSize(s, 'leg', 3);
      const g = lattice(s, size, 3);
      for (const [x, y] of SHAPE_OUTLINE[s]) {
        const c: Pt = [x * size[0], y * size[1]];
        expect(near(g.nearest([c[0] + 0.1, c[1] - 0.05]), c)).toBe(true);
      }
      expect(g.lines().length).toBeGreaterThan(6);
    }
  });

  it('finds patches inside the shape only', () => {
    const size = shapeSize('hexagon', 'leg', 2);
    const empty = deriveSeamPatches({ nodes: [], segments: [] }, size, 'hexagon');
    expect(empty.patches).toHaveLength(1);
    expect(empty.patches[0]!.poly).toHaveLength(6);
    // A seam from the left corner to the right one (both on the outline) halves the hexagon.
    const split = deriveSeamPatches(
      {
        nodes: [
          { id: 'a', x: 0, y: 0.25 },
          { id: 'b', x: 1, y: 0.25 },
        ],
        segments: [{ id: 's', kind: 'line', from: 'a', to: 'b' }],
      },
      size,
      'hexagon',
    );
    expect(split.patches).toHaveLength(2);
    expect(split.unconnected).toEqual([]);
  });
});
