// Cornered Week and Month Strips (spec 025): nested L strips from the top left corner, each L two
// straight bars so it sews on log cabin style (owner's "Cornered Week Strip (2)", 2026-11-10).
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';

const blocks = builtinItems().blocks;

describe.each([
  ['Cornered Week Strip', 7],
  ['Cornered Month Strip', 31],
] as const)('%s', (name, n) => {
  const b = blocks.find((x) => x.notecard.name === name)!;
  const sets = [
    { days: n as number, patches: b.patches },
    ...(b.data?.variants ?? []).map((v) => ({ days: v.days, patches: v.patches })),
  ];

  it('has only straight seams, all connected', () => {
    expect(b.drawing.segments.every((s) => s.kind === 'line')).toBe(true);
    expect(b.unconnected ?? []).toEqual([]);
  });

  it('day 1 is the corner square; every later strip is two bars of its day', () => {
    for (const s of sets) {
      // n strips: the corner square plus two bars each for the rest (unused days black).
      expect(s.patches).toHaveLength(1 + 2 * (n - 1));
      const fills = s.patches.map((p) => b.colorings[0]!.fills[p.id]!);
      const placed = fills.flatMap((f) => ('data' in f ? [f.data.n] : [])).sort((x, y) => x - y);
      expect(placed).toEqual(
        Array.from({ length: s.days }, (_, i) => i + 1).flatMap((d) => (d === 1 ? [d] : [d, d])),
      );
    }
  });
});
