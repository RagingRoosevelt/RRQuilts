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
import { snap, defaultSnap } from '@/editor/snap';
import { withoutNode } from '@/editor/draw-ops';
import { createProject } from '@/model/new-project';

describe('snapping', () => {
  const drawing = addLine({ nodes: [], segments: [] }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 });
  const size = [10, 10] as const;
  const s = defaultSnap('in');

  it('prefers existing nodes, then the ¼" grid', () => {
    const n = snap([0.1, 5.1], drawing, size, s, 0.3);
    expect(n.kind).toBe('node');
    expect(n.endpoint).toEqual({ node: drawing.nodes[0]!.id });
    const g = snap([3.13, 7.12], drawing, size, s, 0.3);
    expect(g).toMatchObject({ kind: 'grid', p: [3.25, 7] });
  });

  it('snaps onto seams when enabled and grid is off; divisions mode uses n parts', () => {
    const onSeam = snap([3.33, 5.08], drawing, size, { ...s, grid: false }, 0.3);
    expect(onSeam.kind).toBe('seam');
    expect(onSeam.p[1]).toBeCloseTo(5);
    const div = snap(
      [3.4, 6.6],
      drawing,
      size,
      { ...s, mode: 'divisions', divisions: [3, 3] },
      0.3,
    );
    expect(div.p[0]).toBeCloseTo(10 / 3);
    expect(div.p[1]).toBeCloseTo(20 / 3);
  });

  it('ends on a diagonal seam rather than a nearby grid point off the seam', () => {
    const diag = addLine({ nodes: [], segments: [] }, { x: 0, y: 0 }, { x: 1, y: 1 });
    // Near (3.3, 3.4): grid point (3.25, 3.5) is off the diagonal; the diagonal is closer to exact.
    const r = snap([3.3, 3.42], diag, size, s, 0.3);
    expect(r.kind).toBe('seam');
    expect(r.p[0]).toBeCloseTo(r.p[1], 9);
    // Where a grid point lies on the seam, use it (exact and on the grid).
    expect(snap([5.04, 4.97], diag, size, s, 0.3)).toMatchObject({ kind: 'grid', p: [5, 5] });
  });

  it('a dragged node snaps against the rest of the drawing (its own seams excluded)', () => {
    let d = addLine({ nodes: [], segments: [] }, { x: 0, y: 0.5 }, { x: 0.5, y: 0.5 });
    d = addLine(d, { x: 0.3, y: 0 }, { x: 0.3, y: 1 });
    const end = d.nodes[1]!.id; // free end of the horizontal seam
    const r = snap([3.05, 7.12], withoutNode(d, end), size, s, 0.3);
    expect(r.kind).not.toBe('free');
    expect(r.p[0]).toBeCloseTo(3); // on the vertical seam (here at the grid point on it)
  });

  it('falls back to the pointer, clamped to the block', () => {
    expect(snap([11, -1], drawing, size, { ...s, grid: false }, 0.1)).toMatchObject({
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
    expect(c.license).toBeUndefined();
    expect(c.credits).toEqual([
      {
        author: 'RRQuilts contributors',
        name: 'Ohio Star',
        license: 'CC-BY-4.0',
        library: 'RRQuilts starter',
      },
    ]);
    expect(attribution(star)).toMatch(/^From Ohio Star by RRQuilts contributors \(.*CC BY 4\.0\)/);
    // Sam edits Jane's copy: Jane joins the chain; Sam's own copies don't repeat him.
    const sam = markDerived(c, 'Sam', 'CC-BY-SA-4.0');
    expect(sam.author).toBe('Sam');
    expect(sam.credits?.map((x) => [x.author, x.license])).toEqual([
      ['RRQuilts contributors', 'CC-BY-4.0'],
      ['Jane', 'CC-BY-SA-4.0'],
    ]);
    expect(attribution(sam)).toBe('Based on Ohio Star by RRQuilts contributors, Jane');
    expect(markDerived(sam, 'Sam')).toBe(sam);
    expect(copyBlock(sam, [], 'Sam').credits).toHaveLength(2);
  });

  it('colorings: save as new copies the fills; the last one cannot be deleted', () => {
    const { block, id } = saveColoringAs(star, star.colorings[0]!.id);
    expect(block.colorings).toHaveLength(2);
    expect(block.colorings[1]).toMatchObject({
      id,
      name: 'Coloring 2',
      fills: star.colorings[0]!.fills,
    });
    const one = deleteColoring(deleteColoring(block, id), block.colorings[0]!.id);
    expect(one.colorings).toHaveLength(1);
  });
});
