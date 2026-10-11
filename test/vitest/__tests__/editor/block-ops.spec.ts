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

  it('copies keep attribution and are marked derived', () => {
    const c = copyBlock(star, ['Ohio Star']);
    expect(c.id).not.toBe(star.id);
    expect(c.notecard.name).toBe('Ohio Star (2)');
    expect(c.source).toMatchObject({
      license: 'CC-BY-4.0',
      author: 'RRQuilts contributors',
      derived: true,
    });
    expect(attribution(c)).toBe(
      'Based on Ohio Star by RRQuilts contributors (RRQuilts starter, CC-BY-4.0)',
    );
    expect(attribution(star)).toMatch(/^From Ohio Star/);
    expect(markDerived(star).source?.derived).toBe(true);
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
