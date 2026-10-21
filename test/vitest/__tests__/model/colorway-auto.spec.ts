import { describe, expect, it } from 'vitest';
import type { Quilt } from '@/model/schema/quilt';
import type { Fill } from '@/model/schema/coloring';
import { addColorway, removeColorway, shownColorway, swapper } from '@/model/colorways';
import { dependents, refreshAuto, type PaletteSwatch } from '@/model/colorway-auto';
import { fixture } from './helpers';

const RGB: Record<string, [number, number, number]> = {
  red: [200, 30, 40],
  cream: [245, 238, 220],
  green: [40, 150, 60],
  navy: [20, 30, 110],
  sky: [120, 180, 230],
  ivory: [250, 248, 240],
};
const rgbOf = (f: Fill) => ('color' in f ? RGB[f.color] : undefined);
const blues: PaletteSwatch[] = ['navy', 'sky', 'ivory'].map((c) => ({
  fill: { color: c },
  rgb: RGB[c]!,
}));
const pal = (id: string) => (id === 'blues' ? blues : undefined);

/** The fixture's first quilt with one placed coloring: red and cream. */
function quilt(): Quilt {
  const q = structuredClone<Quilt>(fixture().project.quilts[0]!);
  for (const s of Object.values(q.layers[0].slots))
    q.colorings[s.coloring] = { fills: { a: { color: 'red' }, b: { color: 'cream' } } };
  return q;
}
const auto = (q: Quilt, id: string, a: NonNullable<Quilt['colorways']>[number]['auto']): Quilt => {
  const out = addColorway(q, id, 'Blues');
  out.colorways = out.colorways!.map((v) => (v.id === id ? { ...v, auto: a! } : v));
  return out;
};
const shows = (q: Quilt, id: string, c: string) => swapper(shownColorway(q, id))({ color: c });

describe('auto mapping (spec 024)', () => {
  it('each primary color becomes its nearest in the palette, live', () => {
    let q = refreshAuto(auto(quilt(), 'a', { palette: 'blues' }), [], pal, rgbOf);
    expect(shows(q, 'a', 'red')).toEqual({ color: 'navy' });
    expect(shows(q, 'a', 'cream')).toEqual({ color: 'ivory' });
    // The primary recolored: the mapping follows.
    for (const s of Object.values(q.layers[0].slots))
      q.colorings[s.coloring] = { fills: { a: { color: 'green' }, b: { color: 'cream' } } };
    q = refreshAuto(q, [], pal, rgbOf);
    expect(shows(q, 'a', 'green')).not.toEqual({ color: 'green' });
  });
  it('overrides stay; one whose pick left the palette goes back to automatic', () => {
    let q = auto(quilt(), 'a', {
      palette: 'blues',
      overrides: [
        { from: 'color:red', to: { color: 'sky' } },
        { from: 'color:cream', to: { color: 'gone' } },
      ],
    });
    q = refreshAuto(q, [], pal, rgbOf);
    expect(shows(q, 'a', 'red')).toEqual({ color: 'sky' });
    expect(shows(q, 'a', 'cream')).toEqual({ color: 'ivory' });
    expect(shownColorway(q, 'a')!.auto!.overrides).toHaveLength(1);
  });
  it('chains follow their source; a lost palette or source leaves a manual colorway as it looked', () => {
    let q = auto(quilt(), 'a', { palette: 'blues' });
    q = auto(q, 'b', { palette: 'blues', source: 'a' });
    q = refreshAuto(q, [], pal, rgbOf);
    expect(shows(q, 'b', 'red')).toEqual({ color: 'navy' });
    expect([...dependents(q, 'a')]).toEqual(['a', 'b']);
    const before = shownColorway(q, 'b')!.swaps;
    q = refreshAuto(removeColorway(q, 'a', []), [], pal, rgbOf);
    expect(shownColorway(q, 'b')!.auto).toBeUndefined();
    expect(shownColorway(q, 'b')!.swaps).toEqual(before);
    const lost = refreshAuto(auto(quilt(), 'c', { palette: 'gone' }), [], pal, rgbOf);
    expect(shownColorway(lost, 'c')!.auto).toBeUndefined();
  });
  it('unknown palettes (no libraries here) leave it as it is; nothing to do returns the same quilt', () => {
    const q = auto(quilt(), 'a', { palette: 'lib-pal' });
    expect(refreshAuto(q, [], () => null, rgbOf)).toBe(q);
    const done = refreshAuto(auto(quilt(), 'a', { palette: 'blues' }), [], pal, rgbOf);
    expect(refreshAuto(done, [], pal, rgbOf)).toBe(done);
  });
});
