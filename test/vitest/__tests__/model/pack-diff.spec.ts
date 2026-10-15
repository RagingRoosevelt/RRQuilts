import { describe, expect, it } from 'vitest';
import { diffCount, packDiff } from '@/model/pack-diff';
import type { LibraryDoc } from '@/model/schema/library';

const fabric = (id: string, sha = id, name = id) => ({
  id,
  notecard: { name },
  image: { sha256: sha, type: 'image/webp' },
  size: [8, 8] as [number, number],
  average: [1, 2, 3] as [number, number, number],
});
const color = (id: string, rgb: [number, number, number] = [0, 0, 0]) => ({
  id,
  notecard: { name: id },
  rgb,
});
const pack = (colors: ReturnType<typeof color>[], fabrics: ReturnType<typeof fabric>[]) =>
  ({
    format: 'rrqlib',
    version: 2,
    units: 'in',
    kind: 'pack',
    id: 'p',
    revision: 1,
    name: 'P',
    categories: [],
    items: [{ type: 'colors', data: { id: 'pal', notecard: { name: 'P' }, colors, fabrics } }],
  }) as unknown as LibraryDoc;

describe('pack updates (spec 014)', () => {
  it('lists colors and fabrics added, removed and changed', () => {
    const was = pack([color('a'), color('b')], [fabric('f1'), fabric('f2'), fabric('f3')]);
    const now = pack(
      [color('a', [9, 9, 9]), color('c')],
      [fabric('f1'), fabric('f3', 'new-image'), fabric('f4')],
    );
    const d = packDiff(was, now);
    expect(d.added.colors.map((x) => x.id)).toEqual(['c']);
    expect(d.removed.colors.map((x) => x.id)).toEqual(['b']);
    expect(d.changed.colors.map((x) => x.id)).toEqual(['a']);
    expect(d.added.fabrics.map((x) => x.id)).toEqual(['f4']);
    expect(d.removed.fabrics.map((x) => x.id)).toEqual(['f2']);
    expect(d.changed.fabrics.map((x) => x.id)).toEqual(['f3']);
    expect(diffCount(d)).toEqual({ added: 2, removed: 2, changed: 2 });
  });

  it('counts everything as added for a pack not installed yet', () => {
    expect(diffCount(packDiff(undefined, pack([color('a')], [fabric('f')])))).toEqual({
      added: 2,
      removed: 0,
      changed: 0,
    });
  });
});
