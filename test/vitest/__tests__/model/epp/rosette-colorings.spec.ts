import { describe, expect, it } from 'vitest';
import type { PaletteSwatch } from '@/model/colorway-auto';
import {
  baseColoring,
  deleteColoring,
  listOrder,
  refreshColorings,
} from '@/model/epp/rosette-colorings';
import { addColoring, addPiece, newRosette, paintPiece } from '@/model/epp/rosette-ops';
import type { Fill } from '@/model/schema/coloring';
import type { Rosette } from '@/model/schema/epp';

// Colors by name, with their RGB.
const RGB: Record<string, [number, number, number]> = {
  red: [220, 20, 20],
  green: [20, 200, 20],
  blue: [20, 20, 220],
  yellow: [240, 230, 30],
  navy: [10, 10, 90],
  pink: [250, 120, 160],
  lime: [120, 250, 40],
};
const rgbOf = (f: Fill) => ('color' in f ? RGB[f.color] : undefined);
const sw = (c: string): PaletteSwatch => ({ fill: { color: c }, rgb: RGB[c]! });
const PALETTES: Record<string, PaletteSwatch[]> = { bright: [sw('pink'), sw('lime')] };
const paletteOf = (id: string) => PALETTES[id];
const refresh = (r: Rosette) => refreshColorings(r, paletteOf, rgbOf);

/** Two squares painted red and green in coloring A. */
function twoSquares() {
  let r = addPiece(newRosette('R'), 'sq', { at: [0, 0], turn: 0, scale: 1 }, { color: 'red' });
  r = addPiece(r, 'sq', { at: [1, 0], turn: 0, scale: 1 }, { color: 'green' });
  const [p, q] = r.pieces.map((x) => x.id) as [string, string];
  return { r, a: r.colorings[0]!.id, p, q };
}
const colorsOf = (r: Rosette, id: string, p: string, q: string) => {
  const c = r.colorings.find((x) => x.id === id)!;
  return [c.fills[p], c.fills[q]].map((f) => (f && 'color' in f ? f.color : undefined));
};

describe('rosette colorings that follow another', () => {
  it('Palette: the picks show, and repainting what it follows shows through', () => {
    const { r: r0, a, p, q } = twoSquares();
    const made = addColoring(r0, undefined, {
      source: a,
      swaps: [{ from: 'color:red', to: { color: 'blue' } }],
    });
    let r = refresh(made.rosette);
    expect(colorsOf(r, made.id, p, q)).toEqual(['blue', 'green']);
    // Repaint the green square red in A: it takes the red pick.
    r = refresh(paintPiece(r, a, q, { color: 'red' }));
    expect(colorsOf(r, made.id, p, q)).toEqual(['blue', 'blue']);
    // Nothing moved: the same rosette back.
    expect(refresh(r)).toBe(r);
  });

  it('Auto mapping: each color its nearest in the palette, picks by hand kept', () => {
    const { r: r0, a, p, q } = twoSquares();
    const made = addColoring(r0, undefined, { source: a, auto: { palette: 'bright' } });
    let r = refresh(made.rosette);
    expect(colorsOf(r, made.id, p, q)).toEqual(['pink', 'lime']);
    r = refresh(
      addColoring(r, undefined, {
        source: a,
        auto: { palette: 'bright', overrides: [{ from: 'color:red', to: { color: 'lime' } }] },
      }).rosette,
    );
    expect(colorsOf(r, r.colorings[2]!.id, p, q)).toEqual(['lime', 'lime']);
    // A palette that's gone: a Palette one, keeping its picks.
    r = refresh({
      ...r,
      colorings: r.colorings.map((c) => (c.auto ? { ...c, auto: { palette: 'gone' } } : c)),
    });
    expect(r.colorings[1]!.auto).toBeUndefined();
    expect(r.colorings[1]!.palette).toBe('gone');
    expect(colorsOf(r, r.colorings[1]!.id, p, q)).toEqual(['pink', 'lime']);
  });

  it('following another keeps the picks; auto mapping matches what it follows as shown', () => {
    const { r: r0, a, p, q } = twoSquares();
    // B: red → yellow by hand. C: auto mapping B as B shows it.
    const b = addColoring(r0, undefined, {
      source: a,
      swaps: [{ from: 'color:red', to: { color: 'yellow' } }],
    });
    const c = addColoring(b.rosette, undefined, { source: b.id, auto: { palette: 'bright' } });
    const r = refresh(c.rosette);
    // B shows yellow and green; their nearest in bright: lime and lime.
    expect(colorsOf(r, c.id, p, q)).toEqual(['lime', 'lime']);
    // The base of both is A: picks keyed by A's colors.
    expect(baseColoring(r, r.colorings[2]!)!.id).toBe(a);
    expect(r.colorings[2]!.swaps!.map((s) => s.from).sort()).toEqual(['color:green', 'color:red']);
  });

  it('a loop or a missing source leaves it painted as it shows', () => {
    const { r: r0, a, p, q } = twoSquares();
    const b = addColoring(r0, undefined, {
      source: 'nowhere',
      fills: { [p]: { color: 'navy' } },
    });
    const r = refresh(b.rosette);
    expect(r.colorings[1]!.source).toBeUndefined();
    expect(colorsOf(r, b.id, p, q)).toEqual(['navy', undefined]);
    // Two following each other.
    const x = addColoring(r0, undefined, { source: 'y' });
    const looped: Rosette = {
      ...x.rosette,
      colorings: [...x.rosette.colorings, { id: 'y', fills: {}, source: x.id }],
    };
    expect(refresh(looped).colorings.every((k) => !k.source)).toBe(true);
    void a;
  });

  it('deleting keeps every other coloring’s look', () => {
    const { r: r0, a, p, q } = twoSquares();
    const b = addColoring(r0, undefined, {
      source: a,
      swaps: [{ from: 'color:red', to: { color: 'yellow' } }],
    });
    const c = addColoring(b.rosette, undefined, { source: b.id, auto: { palette: 'bright' } });
    const r = refresh(c.rosette);
    const before = colorsOf(r, c.id, p, q);
    // B goes: C follows A, now a Palette one with the same picks.
    const noB = refresh(deleteColoring(r, b.id));
    const c2 = noB.colorings.find((k) => k.id === c.id)!;
    expect(c2.source).toBe(a);
    expect(c2.auto).toBeUndefined();
    expect(colorsOf(noB, c.id, p, q)).toEqual(before);
    // A goes (painted): B and C, built on it, are painted as they showed.
    const noA = refresh(deleteColoring(r, a));
    expect(noA.colorings.every((k) => !k.source)).toBe(true);
    expect(colorsOf(noA, c.id, p, q)).toEqual(before);
    expect(colorsOf(noA, b.id, p, q)).toEqual(['yellow', 'green']);
  });

  it('lists each coloring right after the one it follows, the stored order kept', () => {
    const { r: r0, a } = twoSquares();
    // A, then B (painted), C follows B, D follows A, E follows C.
    const b = addColoring(r0, undefined, { name: 'B' });
    const c = addColoring(b.rosette, undefined, { source: b.id, name: 'C' });
    const d = addColoring(c.rosette, undefined, { source: a, name: 'D' });
    const e = addColoring(d.rosette, undefined, { source: c.id, name: 'E' });
    const r = e.rosette;
    const names = (x: Rosette) => listOrder(x).map((k) => (k.id === a ? 'A' : k.name));
    expect(names(r)).toEqual(['A', 'D', 'B', 'C', 'E']);
    expect(r.colorings.map((k) => (k.id === a ? 'A' : k.name))).toEqual(['A', 'B', 'C', 'D', 'E']);
    // A loop (before refresh bakes it) still lists every coloring once.
    const looped: Rosette = {
      ...r,
      colorings: r.colorings.map((k) => (k.id === b.id ? { ...k, source: e.id } : k)),
    };
    expect(names(looped).sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});
