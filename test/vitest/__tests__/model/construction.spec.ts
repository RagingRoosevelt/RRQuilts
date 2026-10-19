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
    for (const n of ['Ohio Star', 'Churn Dash', 'Log Cabin I', 'Flying Geese', 'Pinwheel'])
      expect(named(n).setIn, n).toBe(false);
  });

  it('partial-seam and mitered blocks need set-in seams', () => {
    // Bright Hopes is the classic partial-seam block; Basic Log Cabin is drawn pinwheeled (no log
    // spans a whole side), so it needs one too.
    for (const n of ['Bright Hopes', 'Mitered Frame Medallion', 'Basic Log Cabin'])
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
