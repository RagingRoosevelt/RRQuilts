import { describe, expect, it } from 'vitest';
import { addStarterContent } from '@/content/starter';
import { addLine } from '@/editor/draw-ops';
import {
  attribution,
  copyBlock,
  deleteColoring,
  editorSettings,
  markDerived,
  newBlock,
  saveColoringAs,
} from '@/editor/block-ops';
import { snap, defaultSnap, reachOf } from '@/editor/snap';
import { withoutNode } from '@/editor/draw-ops';
import { createProject } from '@/model/new-project';

describe('snapping', () => {
  const drawing = addLine({ nodes: [], segments: [] }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 });
  const size = [10, 10] as const;
  const s = defaultSnap('in');

  it('prefers existing nodes, then the ¼" grid', () => {
    const n = snap([0.1, 5.1], drawing, size, s, reachOf(0.3));
    expect(n.kind).toBe('node');
    expect(n.endpoint).toEqual({ node: drawing.nodes[0]!.id });
    const g = snap([3.13, 7.12], drawing, size, s, reachOf(0.3));
    expect(g).toMatchObject({ kind: 'grid', p: [3.25, 7] });
  });

  it('snaps onto seams when enabled and grid is off; divisions mode uses n parts', () => {
    const onSeam = snap([3.33, 5.08], drawing, size, s, { ...reachOf(0.3), grid: 0 });
    expect(onSeam.kind).toBe('seam');
    expect(onSeam.p[1]).toBeCloseTo(5);
    const div = snap(
      [3.4, 6.6],
      drawing,
      size,
      { ...s, mode: 'divisions', divisions: [3, 3] },
      reachOf(0.3),
    );
    expect(div.p[0]).toBeCloseTo(10 / 3);
    expect(div.p[1]).toBeCloseTo(20 / 3);
  });

  it('ends on a diagonal seam rather than a nearby grid point off the seam', () => {
    const diag = addLine({ nodes: [], segments: [] }, { x: 0, y: 0 }, { x: 1, y: 1 });
    // Near (3.3, 3.4): grid point (3.25, 3.5) is off the diagonal; the diagonal is closer to exact.
    const r = snap([3.3, 3.42], diag, size, s, reachOf(0.3));
    expect(r.kind).toBe('seam');
    expect(r.p[0]).toBeCloseTo(r.p[1], 9);
    // Where a grid point lies on the seam, use it (exact and on the grid).
    expect(snap([5.04, 4.97], diag, size, s, reachOf(0.3))).toMatchObject({
      kind: 'grid',
      p: [5, 5],
    });
  });

  it('a dragged node snaps against the rest of the drawing (its own seams excluded)', () => {
    let d = addLine({ nodes: [], segments: [] }, { x: 0, y: 0.5 }, { x: 0.5, y: 0.5 });
    d = addLine(d, { x: 0.3, y: 0 }, { x: 0.3, y: 1 });
    const end = d.nodes[1]!.id; // free end of the horizontal seam
    const r = snap([3.05, 7.12], withoutNode(d, end), size, s, reachOf(0.3));
    expect(r.kind).not.toBe('free');
    expect(r.p[0]).toBeCloseTo(3); // on the vertical seam (here at the grid point on it)
  });

  it('a target Off never pulls; all Off lands on the pointer', () => {
    expect(snap([0.1, 5.1], drawing, size, s, { ...reachOf(0.3), nodes: 0 }).kind).not.toBe('node');
    expect(snap([3.13, 7.12], drawing, size, s, reachOf(0))).toMatchObject({
      kind: 'free',
      p: [3.13, 7.12],
    });
  });

  it('each target reaches its own distance', () => {
    const far: [number, number] = [3.37, 7.12]; // 0.17 from the nearest grid point
    expect(snap(far, drawing, size, s, { ...reachOf(0.3), grid: 0.1 }).kind).toBe('free');
    expect(snap(far, drawing, size, s, { ...reachOf(0.1), grid: 0.3 }).kind).toBe('grid');
  });

  it('lines up level and plumb with corners, exactly (spec 031)', () => {
    const d = addLine({ nodes: [], segments: [] }, { x: 0.1, y: 0.23 }, { x: 0.13, y: 0.27 });
    const r = { ...reachOf(0.15, 0.15), grid: 0 };
    // Level with (1, 2.3), far from it: takes y 2.3.
    const level = snap([6.07, 2.36], d, size, s, r);
    expect(level.kind).toBe('align');
    expect(level.p[0]).toBeCloseTo(6.07, 12);
    expect(level.p[1]).toBeCloseTo(2.3, 12);
    expect(level.endpoint).toMatchObject({ y: d.nodes[0]!.y }); // stored exactly level
    expect(level.to).toEqual([[1, 0.23 * 10]]);
    // Plumb with (1.3, 2.7) and level with (1, 2.3): both at once.
    const both = snap([1.36, 2.39], d, size, s, { ...r, nodes: 0, seams: 0 });
    expect(both.p[0]).toBeCloseTo(1.3, 12);
    expect(both.p[1]).toBeCloseTo(2.3, 12);
    expect(both.to).toHaveLength(2);
    // With the grid on, the free axis lands on the nearest grid column.
    const col = snap([6.07, 2.36], d, size, s, { ...r, grid: 0.15 });
    expect(col.p).toEqual([6, 0.23 * 10]);
    // The seam's own start counts as a corner.
    const from = snap([8.02, 4.53], { nodes: [], segments: [] }, size, s, r, undefined, [3, 4.5]);
    expect(from.p[1]).toBe(4.5);
  });

  it("lines up along a shaped block's three grid axes", () => {
    const tri = [6, 6 * (Math.sqrt(3) / 2)] as const;
    const none = { nodes: [], segments: [] };
    // A 60° line from the apex (3, 0): points along it are 30° off vertical.
    const t = 2;
    const on: [number, number] = [3 + t * 0.5, t * (Math.sqrt(3) / 2)];
    const r = snap(
      [on[0] + 0.05, on[1] - 0.02],
      none,
      tri,
      defaultSnap('in', 'triangle'),
      { nodes: 0, seams: 0, grid: 0, align: 0.1 },
      'triangle',
    );
    expect(r.kind).toBe('align');
    // On the line through the apex along 60°.
    expect((r.p[0] - 3) * (Math.sqrt(3) / 2) - r.p[1] * 0.5).toBeCloseTo(0, 9);
  });

  it('falls back to the pointer, clamped to the block', () => {
    expect(snap([11, -1], drawing, size, s, { ...reachOf(0.1), grid: 0 })).toMatchObject({
      kind: 'free',
      p: [10, 0],
    });
  });
});

describe('block operations', () => {
  const doc = addStarterContent(createProject());
  const star = doc.project.blocks.find((b) => b.notecard.name === 'Ohio Star')!;

  it('new blocks start as one patch with a ¼" (5 mm) snap', () => {
    const b = newBlock('Mine', [10, 10], 'in');
    expect(b.patches).toHaveLength(1);
    expect(editorSettings(b, 'in').snap.step).toBe(0.25);
    expect(editorSettings(newBlock('cm', [25, 25], 'cm'), 'cm').snap.step).toBe(0.5);
  });

  it('copies credit everyone before; the copier becomes the author', () => {
    const c = copyBlock(star, ['Ohio Star'], 'Jane');
    expect(c.id).not.toBe(star.id);
    expect(c.notecard.name).toBe('Ohio Star (2)');
    expect(c.source?.derived).toBe(true);
    expect(c.author).toBe('Jane');
    expect(c.license).toBe('CC-BY-SA-4.0'); // its own from now on, not linked to the project
    expect(c.credits).toEqual([
      {
        author: 'RRQuilts contributors',
        name: 'Ohio Star',
        license: 'PDM-1.0',
        library: 'Built-In',
      },
    ]);
    expect(attribution(star)).toMatch(
      /^From Ohio Star by RRQuilts contributors \(.*Public domain\)/,
    );
    // Sam edits Jane's copy: Jane joins the chain; Sam's own copies don't repeat him.
    const sam = markDerived(c, 'Sam', 'CC-BY-SA-4.0');
    expect(sam.author).toBe('Sam');
    expect(sam.credits?.map((x) => [x.author, x.license])).toEqual([
      ['RRQuilts contributors', 'PDM-1.0'],
      ['Jane', 'CC-BY-SA-4.0'],
    ]);
    expect(attribution(sam)).toBe('Based on Ohio Star by RRQuilts contributors, Jane');
    expect(markDerived(sam, 'Sam')).toBe(sam);
    expect(copyBlock(sam, [], 'Sam').credits).toHaveLength(2);
  });

  it('colorings: save as new copies the fills; the last one cannot be deleted', () => {
    const { block, id } = saveColoringAs(star, star.colorings[0]!.id);
    expect(block.colorings).toHaveLength(star.colorings.length + 1);
    expect(block.colorings.at(-1)).toMatchObject({
      id,
      name: `Coloring ${block.colorings.length}`,
      fills: star.colorings[0]!.fills,
    });
    const one = block.colorings.reduce((b, k) => deleteColoring(b, k.id), block);
    expect(one.colorings).toHaveLength(1);
  });
});
