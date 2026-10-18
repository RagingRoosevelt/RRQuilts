// Spec 026: block layouts of triangles, 60° diamonds and hexagons; flow angle; shaped placement.
import { describe, expect, it } from 'vitest';
import { applyTool } from '@/editor/actions';
import { newBlock } from '@/editor/block-ops';
import { SHAPE_OUTLINE, SHAPE_TURN, shapeSize, type BlockShape } from '@/model/blocks/shape';
import { apply, type Pt } from '@/model/geometry/affine';
import { flattenLoop, pathToSegs } from '@/model/geometry/path';
import { generateSlots, type Slot } from '@/model/layout/slots';
import { layoutDefaults, migrate } from '@/model/io';
import { createProject } from '@/model/new-project';
import type { Layout, Quilt } from '@/model/schema/quilt';
import type { RrqDoc } from '@/model/schema/project';
import { placementMatrix } from '@/render/placement';
import { quiltPieces } from '@/model/print/pieces';

const corners = (s: Slot) => flattenLoop(pathToSegs(s.outline, [1, 1]), 1e-6);
const near = (a: Pt, b: Pt, tol = 1e-6) => Math.hypot(a[0] - b[0], a[1] - b[1]) < tol;
const shaped = (shape: 'triangles' | 'diamonds' | 'hexagons', extra: object = {}): Layout => ({
  style: 'shaped-blocks',
  shape,
  cols: 4,
  rows: 4,
  width: 3,
  edge: 'none',
  ...extra,
});
const SHAPE: Record<string, BlockShape> = {
  triangles: 'triangle',
  diamonds: 'diamond60',
  hexagons: 'hexagon',
};

describe('Shaped Blocks', () => {
  it.each(['triangles', 'diamonds', 'hexagons'] as const)(
    '%s: every space is a block space whose block lands on its outline',
    (shape) => {
      const g = generateSlots(shaped(shape), []);
      expect(g.slots.length).toBeGreaterThan(8);
      const block = newBlock(
        'B',
        shapeSize(SHAPE[shape]!, 'leg', 3),
        'in',
        '',
        undefined,
        SHAPE[shape],
      );
      for (const s of g.slots) {
        expect(s.kind).toBe('block');
        expect(s.id.startsWith('b:')).toBe(true);
        expect(s.shape).toBe(SHAPE[shape]);
        for (let r = 0; r < 360; r += SHAPE_TURN[SHAPE[shape]!])
          for (const flip of [false, true]) {
            const m = placementMatrix(
              s,
              { block: block.id, coloring: 'c', rotation: r as 0, flip },
              block,
            );
            const out = corners(s);
            for (const [x, y] of SHAPE_OUTLINE[SHAPE[shape]!]) {
              const p = apply(m, [x * block.size[0], y * block.size[1]]);
              expect(out.some((q) => near(p, q))).toBe(true);
            }
          }
      }
    },
  );

  it('trimmed: a turned grid still fills the same quilt', () => {
    const flat = generateSlots(shaped('hexagons', { edge: 'trim' }), []);
    const turned = generateSlots(shaped('hexagons', { edge: 'trim', flow: 30 }), []);
    expect(turned.center).toEqual(flat.center);
    const area = (g: typeof flat) =>
      g.slots.reduce((a, s) => {
        const p = corners(s);
        return (
          a +
          Math.abs(
            p.reduce(
              (t, u, i) => t + u[0] * p[(i + 1) % p.length]![1] - p[(i + 1) % p.length]![0] * u[1],
              0,
            ),
          ) /
            2
        );
      }, 0);
    const [x0, y0, x1, y1] = flat.center;
    expect(area(turned)).toBeCloseTo((x1 - x0) * (y1 - y0), 6);
    expect(area(flat)).toBeCloseTo((x1 - x0) * (y1 - y0), 6);
  });
});

describe('Baby Blocks and Diamond Point hold diamond blocks; their twins hold patches', () => {
  it('Baby Blocks: diamond block spaces; Variable Patch: patches', () => {
    const baby = generateSlots(layoutDefaults('baby-blocks', 1) as Layout, []);
    expect(baby.slots.every((s) => s.kind === 'block' && s.shape === 'diamond60')).toBe(true);
    const variable = generateSlots(layoutDefaults('variable-blocks', 1) as Layout, []);
    expect(variable.slots.every((s) => s.kind === 'patch')).toBe(true);
  });

  it('Diamond Point: the diamonds are 60° block spaces, setting pieces are patches', () => {
    const g = generateSlots(layoutDefaults('diamond-point', 1) as Layout, []);
    const blocks = g.slots.filter((s) => s.kind === 'block');
    expect(blocks.length).toBeGreaterThan(10);
    expect(blocks.every((s) => s.shape === 'diamond60')).toBe(true);
    expect(g.slots.filter((s) => s.id.startsWith('set:')).every((s) => s.kind === 'patch')).toBe(
      true,
    );
  });

  it('v6 Baby Blocks open as Variable Patch with the same ids', () => {
    const layout = layoutDefaults('baby-blocks', 1)!;
    const doc = migrate({
      format: 'rrq',
      version: 6,
      units: 'in',
      project: { quilts: [{ layout }] },
    }) as { project: { quilts: { layout: Layout }[] } };
    const after = doc.project.quilts[0]!.layout;
    expect(after.style).toBe('variable-blocks');
    expect(generateSlots(after, []).slots.map((s) => s.id)).toEqual(
      generateSlots({ ...(layout as Layout), style: 'variable-blocks' } as Layout, []).slots.map(
        (s) => s.id,
      ),
    );
  });
});

describe('placing shaped blocks', () => {
  const setup = () => {
    const tri = newBlock('Tri', shapeSize('triangle', 'leg', 3), 'in', '', undefined, 'triangle');
    const sq = newBlock('Sq', [3, 3], 'in');
    const layout = shaped('triangles');
    const quilt: Quilt = {
      id: 'q',
      notecard: { name: 'Q' },
      layout,
      borders: [],
      colorings: {},
      layers: [
        { visible: true, slots: {}, items: [] },
        { visible: true, items: [] },
        { visible: true, items: [] },
      ],
    };
    const base = createProject();
    const doc: RrqDoc = {
      ...base,
      project: { ...base.project, blocks: [tri, sq], quilts: [quilt] },
    };
    return { doc, tri, sq, spaces: generateSlots(layout, []).slots };
  };

  it('Set takes only blocks of the space shape; Rotate steps by its turn', () => {
    const { doc, tri, sq, spaces } = setup();
    const at = spaces[0]!.id;
    const no = applyTool(
      doc,
      'q',
      spaces,
      { slotId: at },
      {
        tool: 'set',
        scope: 'this',
        block: sq.id,
        color: null,
      },
    );
    expect(no.doc).toBeUndefined();
    expect(no.message).toMatch(/triangle blocks/);
    let d = applyTool(
      doc,
      'q',
      spaces,
      { slotId: at },
      {
        tool: 'set',
        scope: 'all',
        block: tri.id,
        color: null,
      },
    ).doc!;
    expect(Object.keys(d.project.quilts[0]!.layers[0].slots)).toHaveLength(spaces.length);
    d = applyTool(
      d,
      'q',
      spaces,
      { slotId: at },
      {
        tool: 'rotate',
        scope: 'this',
        block: null,
        color: null,
      },
    ).doc!;
    expect(d.project.quilts[0]!.layers[0].slots[at]!.rotation).toBe(120);
  });

  it('prints whole shaped blocks as their pieces, trimmed ones with what shows', () => {
    const { doc, tri, spaces } = setup();
    const d = applyTool(
      doc,
      'q',
      spaces,
      { slotId: spaces[0]!.id },
      {
        tool: 'set',
        scope: 'all',
        block: tri.id,
        color: null,
      },
    ).doc!;
    const pieces = quiltPieces(d, d.project.quilts[0]!);
    expect(pieces).toHaveLength(spaces.length);
    expect(pieces.every((p) => !p.shown && p.poly.length === 3)).toBe(true);
  });
});
