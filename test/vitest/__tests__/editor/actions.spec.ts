import { describe, expect, it } from 'vitest';
import { addStarterContent } from '@/content/starter';
import { applyTool, type ToolState } from '@/editor/actions';
import { allPatches } from '@/model/blocks/patches';
import { paint, resolveColoring } from '@/model/coloring';
import { produce } from 'immer';
import { mul, orient, type M } from '@/render/affine';
import { generateSlots } from '@/model/layout/slots';
import { createProject } from '@/model/new-project';
import type { RrqDoc } from '@/model/schema/project';

function setup() {
  let doc = addStarterContent(createProject());
  doc = {
    ...doc,
    project: {
      ...doc.project,
      quilts: [
        {
          id: 'q',
          notecard: { name: 'Q' },
          layout: {
            style: 'horizontal',
            cols: 2,
            rows: 2,
            block: [10, 10],
            sash: [1, 1],
            sashBorder: false,
          },
          borders: [{ style: 'long-horizontal', sides: [2, 2, 2, 2] }],
          colorings: {},
          layers: [
            { visible: true, slots: {}, items: [] },
            { visible: true, items: [] },
            { visible: true, items: [] },
          ],
        },
      ],
    },
  };
  const ids = generateSlots(
    doc.project.quilts[0]!.layout,
    doc.project.quilts[0]!.borders,
  ).slots.map((s) => s.id);
  const byName = (n: string) => doc.project.blocks.find((b) => b.notecard.name === n)!;
  const color = (n: string) => doc.project.palette.colors.find((c) => c.notecard.name === n)!.id;
  return { doc, ids, byName, color };
}
const run = (doc: RrqDoc, ids: string[], slotId: string, s: ToolState, patchId?: string) =>
  applyTool(doc, 'q', ids, { slotId, ...(patchId ? { patchId } : {}) }, s);
const q = (doc: RrqDoc) => doc.project.quilts[0]!;

describe('editor actions', () => {
  it('sets a block in all spaces, then another in alternate spaces', () => {
    const { doc, ids, byName } = setup();
    const a = byName('Ohio Star').id;
    const b = byName('Nine Patch').id;
    let d = run(doc, ids, 'b:r1c1', { tool: 'set', scope: 'all', block: a, color: null }).doc!;
    d = run(d, ids, 'b:r1c2', { tool: 'set', scope: 'alternate', block: b, color: null }).doc!;
    const slots = q(d).layers[0].slots;
    expect(slots['b:r1c1']!.block).toBe(a);
    expect(slots['b:r2c2']!.block).toBe(a);
    expect(slots['b:r1c2']!.block).toBe(b);
    expect(slots['b:r2c1']!.block).toBe(b);
    // New placements follow the block's default coloring.
    const star = byName('Ohio Star');
    expect(q(d).colorings[slots['b:r1c1']!.coloring]).toEqual({
      base: star.colorings[0]!.id,
      fills: {},
    });
    expect(resolveColoring(q(d).colorings[slots['b:r1c1']!.coloring], star)!.fills).toEqual(
      star.colorings[0]!.fills,
    );
    expect(Object.keys(q(d).colorings)).toHaveLength(2);
  });

  it('rotates and flips placements of the same block', () => {
    const { doc, ids, byName } = setup();
    let d = run(doc, ids, 'b:r1c1', {
      tool: 'set',
      scope: 'all',
      block: byName('Pinwheel').id,
      color: null,
    }).doc!;
    d = run(d, ids, 'b:r1c1', { tool: 'rotate', scope: 'all', block: null, color: null }).doc!;
    d = run(d, ids, 'b:r1c1', { tool: 'flip', scope: 'this', block: null, color: null }).doc!;
    expect(q(d).layers[0].slots['b:r2c2']).toMatchObject({ rotation: 90, flip: false });
    // Mirroring a 90°-rotated block on screen = 270° + flip in placement terms.
    expect(q(d).layers[0].slots['b:r1c1']).toMatchObject({ rotation: 270, flip: true });
    d = run(d, ids, 'b:r1c1', { tool: 'erase', scope: 'this', block: null, color: null }).doc!;
    expect(q(d).layers[0].slots['b:r1c1']).toBeUndefined();
  });

  it('paints one patch in this block only, or in all identical blocks', () => {
    const { doc, ids, byName, color } = setup();
    const star = byName('Ohio Star');
    const patch = allPatches(star)[0]!.id;
    let d = run(doc, ids, 'b:r1c1', {
      tool: 'set',
      scope: 'all',
      block: star.id,
      color: null,
    }).doc!;
    const red = color('Purple');
    d = run(
      d,
      ids,
      'b:r1c1',
      { tool: 'paint', scope: 'this', block: null, color: red },
      patch,
    ).doc!;
    const fill = (slot: string) =>
      q(d).colorings[q(d).layers[0].slots[slot]!.coloring]!.fills[patch];
    expect(fill('b:r1c1')).toEqual({ color: red });
    expect(fill('b:r1c2')).not.toEqual({ color: red });
    d = run(d, ids, 'b:r1c2', { tool: 'paint', scope: 'all', block: null, color: red }, patch).doc!;
    for (const s of ['b:r1c1', 'b:r1c2', 'b:r2c1', 'b:r2c2'])
      expect(fill(s)).toEqual({ color: red });
  });

  it('paints sashes and borders as plain pieces, by kind', () => {
    const { doc, ids, color } = setup();
    const gold = color('Gold');
    let d = run(doc, ids, 'sash:v:r1c1', {
      tool: 'paint',
      scope: 'all',
      block: null,
      color: gold,
    }).doc!;
    const sashes = ids.filter((id) => id.startsWith('sash:'));
    for (const s of sashes) {
      const c = q(d).layers[0].slots[s]!;
      expect(c.block).toBe('plain');
      expect(q(d).colorings[c.coloring]!.fills.p).toEqual({ color: gold });
    }
    expect(q(d).layers[0].slots['cs:r1c1']).toBeUndefined();
    d = run(d, ids, 'border:1:top', {
      tool: 'paint',
      scope: 'this',
      block: null,
      color: gold,
    }).doc!;
    expect(q(d).layers[0].slots['border:1:top']).toBeDefined();
    expect(q(d).layers[0].slots['border:1:left']).toBeUndefined();
    expect(d.project.blocks.filter((b) => b.id === 'plain')).toHaveLength(1);
  });

  it('swap changes a color everywhere; eyedropper and find select', () => {
    const { doc, ids, byName, color } = setup();
    const np = byName('Nine Patch');
    let d = run(doc, ids, 'b:r1c1', { tool: 'set', scope: 'all', block: np.id, color: null }).doc!;
    const patch = allPatches(np)[0]!.id;
    const before = q(d).colorings[q(d).layers[0].slots['b:r1c1']!.coloring]!.fills[patch]!;
    const teal = color('Teal');
    d = run(
      d,
      ids,
      'b:r2c2',
      { tool: 'swap', scope: 'this', block: null, color: teal },
      patch,
    ).doc!;
    const fills = Object.values(q(d).colorings).flatMap((c) => Object.values(c.fills));
    expect(fills.some((f) => JSON.stringify(f) === JSON.stringify(before))).toBe(false);
    expect(
      run(d, ids, 'b:r1c1', { tool: 'eyedropper', scope: 'this', block: null, color: null }, patch)
        .selectColor,
    ).toBe(teal);
    expect(
      run(d, ids, 'b:r1c1', { tool: 'find', scope: 'this', block: null, color: null }).selectBlock,
    ).toBe(np.id);
  });

  it('explains what is missing instead of failing', () => {
    const { doc, ids, color } = setup();
    expect(
      run(doc, ids, 'b:r1c1', { tool: 'set', scope: 'this', block: null, color: null }).message,
    ).toBeTruthy();
    expect(
      run(doc, ids, 'b:r1c1', { tool: 'paint', scope: 'this', block: null, color: color('Red') })
        .message,
    ).toMatch(/block here/);
  });

  it('sets and paints on a 900-block quilt in under 100 ms each', () => {
    const { doc, byName, color } = setup();
    const big = {
      ...doc,
      project: {
        ...doc.project,
        quilts: [
          {
            ...doc.project.quilts[0]!,
            layout: { ...doc.project.quilts[0]!.layout, cols: 30, rows: 30 } as never,
          },
        ],
      },
    };
    const ids = generateSlots(
      big.project.quilts[0]!.layout,
      big.project.quilts[0]!.borders,
    ).slots.map((s) => s.id);
    const star = byName('Ohio Star');
    let t = performance.now();
    const d = run(big, ids, 'b:r1c1', {
      tool: 'set',
      scope: 'all',
      block: star.id,
      color: null,
    }).doc!;
    expect(performance.now() - t).toBeLessThan(100);
    t = performance.now();
    run(
      d,
      ids,
      'b:r1c1',
      { tool: 'paint', scope: 'alternate', block: null, color: color('Red') },
      allPatches(star)[0]!.id,
    );
    expect(performance.now() - t).toBeLessThan(100);
  });

  it('flip mirrors left↔right or top↕bottom as seen on screen, even on rotated blocks', () => {
    const { doc, ids, byName } = setup();
    let d = run(doc, ids, 'b:r1c1', {
      tool: 'set',
      scope: 'this',
      block: byName('Pinwheel').id,
      color: null,
    }).doc!;
    d = run(d, ids, 'b:r1c1', { tool: 'rotate', scope: 'this', block: null, color: null }).doc!; // 90°
    const z = (x: M) => x.map((v) => v + 0) as M; // -0 → 0
    const m = (x: RrqDoc): M => {
      const c = q(x).layers[0].slots['b:r1c1']!;
      return z(orient(c.rotation, c.flip));
    };
    const H: M = [-1, 0, 0, 1, 1, 0]; // screen mirror left↔right in the unit square
    const V: M = [1, 0, 0, -1, 0, 1]; // screen mirror top↕bottom
    const flip = (x: RrqDoc, flipAxis: 'h' | 'v') =>
      run(x, ids, 'b:r1c1', { tool: 'flip', scope: 'this', block: null, color: null, flipAxis })
        .doc!;
    expect(m(flip(d, 'h'))).toEqual(z(mul(H, m(d))));
    expect(m(flip(d, 'v'))).toEqual(z(mul(V, m(d))));
    expect(m(flip(flip(d, 'v'), 'v'))).toEqual(m(d)); // mirroring twice restores
  });

  it('set uses the coloring chosen for that block', () => {
    const { doc, ids, byName } = setup();
    const star = byName('Ohio Star');
    const withTwo = {
      ...doc,
      project: {
        ...doc.project,
        blocks: doc.project.blocks.map((b) =>
          b.id === star.id ? { ...b, colorings: [...b.colorings, { id: 'alt', fills: {} }] } : b,
        ),
      },
    };
    const d = run(withTwo, ids, 'b:r1c1', {
      tool: 'set',
      scope: 'this',
      block: star.id,
      color: null,
      coloringOf: new Map([[star.id, 'alt']]),
    }).doc!;
    expect(q(d).colorings[q(d).layers[0].slots['b:r1c1']!.coloring]!.fills).toEqual({});
  });

  it('placements follow later changes to the block coloring, except where recolored in the quilt', () => {
    const { doc, ids, byName, color } = setup();
    const star = byName('Ohio Star');
    const [p1, p2] = allPatches(star).map((p) => p.id);
    let d = run(doc, ids, 'b:r1c1', {
      tool: 'set',
      scope: 'all',
      block: star.id,
      color: null,
    }).doc!;
    // Recolor p1 in the quilt, then clear p2 there.
    d = run(
      d,
      ids,
      'b:r1c1',
      { tool: 'paint', scope: 'all', block: null, color: color('Gold') },
      p1,
    ).doc!;
    const slotIds = Object.keys(q(d).layers[0].slots);
    const cleared = paint(q(d), slotIds, p2!, undefined, (id) =>
      d.project.blocks.find((b) => b.id === id),
    );
    d = produce(d, (x) => void (x.project.quilts[0] = cleared));
    // Now change the block's own coloring everywhere.
    d = produce(d, (x) => {
      const fills = x.project.blocks.find((b) => b.id === star.id)!.colorings[0]!.fills;
      for (const k of Object.keys(fills)) fills[k] = { color: color('Black') };
    });
    const block = d.project.blocks.find((b) => b.id === star.id)!;
    const c = q(d).colorings[q(d).layers[0].slots['b:r2c2']!.coloring];
    const fills = resolveColoring(c, block)!.fills;
    expect(fills[p1!]).toEqual({ color: color('Gold') });
    expect(fills[p2!]).toBeUndefined();
    const others = allPatches(block)
      .map((p) => p.id)
      .filter((p) => p !== p1 && p !== p2);
    expect(others.every((p) => fills[p]?.['color' as never] === color('Black'))).toBe(true);
  });
});
