// Spec 029: what a block's drawing says about sewing it.
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import { blockConstruction } from '@/model/blocks/construction';

const blocks = builtinItems().blocks;
const named = (n: string) => {
  const b = blocks.find((x) => x.notecard.name === n);
  if (!b) throw new Error(`no block ${n}`);
  return blockConstruction(b);
};

describe('block construction', () => {
  it('nine patch: straight seams right across, beginner', () => {
    expect(named('Nine Patch')).toMatchObject({ curved: false, setIn: false, pieces: 9 });
    expect(named('Nine Patch').difficulty).toBe('beginner');
  });

  it('stars and log cabins sew without set-in seams', () => {
    for (const n of [
      'Ohio Star',
      'Churn Dash',
      'Log Cabin I',
      'Flying Geese',
      'Pinwheel',
      // Each strip covers the end of the one before it; the units join along one straight seam.
      'Round and Round 60-Degree Triangle',
      'Round and Round Hexagon',
      'Opposite Hexagon',
      'Basic Log Cabin',
      'Grape Vine',
      // 60° triangle blocks on a triangle lattice sew in straight rows.
      'Triangle Star',
      'Twisted Triangle',
      // Fans, strips, a frame and a picture: each piece sews on along one straight seam.
      'Sunburst Triangle',
      'Framed Triangle',
      'Sailboat',
      // Fractals: grid rows and halved triangles.
      'Sierpinski Carpet',
      'Hilbert Curve',
      'Sierpinski Diamond',
    ])
      expect(named(n).setIn, n).toBe(false);
  });

  it('partial-seam and mitered blocks need set-in seams', () => {
    // Bright Hopes is the classic partial-seam block (Double Strips is two of it); Tea Box's units
    // meet along a seam that turns.
    for (const n of [
      'Bright Hopes',
      'Double Strips',
      'Mitered Frame Medallion',
      'Tea Box',
      'Three Kites',
      'Triangle Pinwheel',
      'Spike Star',
      // The background is set in around its jagged edge.
      'Koch Snowflake',
    ])
      expect(named(n).setIn, n).toBe(true);
  });

  it('curves are found and make a block advanced', () => {
    expect(named('Hexagon Orange Peel')).toMatchObject({ curved: true, difficulty: 'advanced' });
    expect(named("Drunkard's Path").curved).toBe(true);
  });

  it('some built-in blocks need set-in seams', () => {
    const setIn = blocks.filter((b) => blockConstruction(b).setIn).map((b) => b.notecard.name);
    expect(setIn.length).toBeGreaterThan(0);
    expect(setIn).not.toContain('Nine Patch');
  });

  it('is cached and quick over every built-in block', () => {
    const t = performance.now();
    for (const b of blocks) blockConstruction(b);
    expect(performance.now() - t).toBeLessThan(5000);
    expect(blockConstruction(blocks[0]!)).toBe(blockConstruction(blocks[0]!));
  });
});
