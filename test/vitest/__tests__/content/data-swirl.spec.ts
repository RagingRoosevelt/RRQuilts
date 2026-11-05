// Swirl, Pinwheel and Quartered data blocks (spec 025): a spike per day in equal wedges from the center, square and hexagon,
// month ones with a variant per shorter month that has exactly that many spikes.
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import { flattenLoop, pathToSegs, signedArea } from '@/model/geometry/path';

const blocks = builtinItems().blocks;

describe.each([
  ['Week Swirl', 7, undefined],
  ['Hexagon Week Swirl', 7, 'hexagon'],
  ['Month Swirl', 31, undefined],
  ['Hexagon Month Swirl', 31, 'hexagon'],
  ['Week Pinwheel', 7, undefined],
  ['Hexagon Week Pinwheel', 7, 'hexagon'],
  ['Month Pinwheel', 31, undefined],
  ['Hexagon Month Pinwheel', 31, 'hexagon'],
  ['Quartered Month Swirl', 31, undefined],
] as const)('%s', (name, days, shape) => {
  const b = blocks.find((x) => x.notecard.name === name)!;
  const sets = [
    { days, patches: b.patches },
    ...(b.data?.variants ?? []).map((v) => ({ days: v.days, patches: v.patches })),
  ];

  it('is a data block of its shape, seams all connected', () => {
    expect(b.data?.kind).toBe(days === 7 ? 'week' : 'month');
    expect(b.shape).toBe(shape);
    expect(b.unconnected ?? []).toEqual([]);
    expect(sets.map((s) => s.days)).toEqual(days === 7 ? [7] : [31, 30, 29, 28]);
  });

  it('has three pieces per day and one data place per day, each day once', () => {
    for (const s of sets) {
      expect(s.patches).toHaveLength(3 * s.days);
      const fills = s.patches.map((p) => b.colorings[0]!.fills[p.id]!);
      const placed = fills.flatMap((f) => ('data' in f ? [f.data.n] : [])).sort((x, y) => x - y);
      expect(placed).toEqual(Array.from({ length: s.days }, (_, i) => i + 1));
    }
  });
});

describe('Quartered Month Swirl spikes', () => {
  // Owner: "all triangles should be the same size".
  it('are all the same triangle', () => {
    const b = blocks.find((x) => x.notecard.name === 'Quartered Month Swirl')!;
    const k1 = b.colorings[0]!.fills;
    const areas = b.patches
      .filter((p) => 'data' in k1[p.id]!)
      .map((p) => Math.abs(signedArea(flattenLoop(pathToSegs(p.path, b.size), 1e-3))));
    expect(areas).toHaveLength(31);
    for (const a of areas) expect(a).toBeCloseTo(areas[0]!, 6);
  });
});
