import { describe, expect, it } from 'vitest';
import { layoutDefaults, onPointDefaults } from '@/model/io';
import { generateFor, generateSlots, reconcile, spanSpaces } from '@/model/layout/slots';
import {
  maxSpan,
  spanAt,
  spanGrow,
  spanIndex,
  spanNear,
  spanOf,
  spannable,
} from '@/model/layout/spans';
import type { HorizontalLayout, Layout, Quilt } from '@/model/schema/quilt';
import { fixture } from './helpers';

const straight = (cols: number, rows: number, sash = 0): HorizontalLayout => ({
  style: 'straight-set',
  cols,
  rows,
  block: [9, 9],
  sash: [sash, sash],
  sashBorder: false,
});
const slotsOf = (l: Layout) => generateSlots(l, []).slots;
const quiltOf = (l: Layout): Quilt => {
  const q = structuredClone(fixture().project.quilts[0]!);
  q.layout = l;
  q.borders = [];
  q.layers[0].slots = {};
  return q;
};
const place = { block: 'seam1', coloring: 'qk1', rotation: 0 as const, flip: false };

describe('spanning blocks (spec 057)', () => {
  it('a 2U span in a straight set covers a 2 × 2 of spaces at twice the size', () => {
    const slots = slotsOf(straight(6, 6));
    const ix = spanIndex(slots);
    const sp = spanOf(ix, ix.byId.get('b:r2c2')!, 2)!;
    expect(sp.cells.sort()).toEqual(['b:r2c2', 'b:r2c3', 'b:r3c2', 'b:r3c3']);
    expect(sp.slot.size).toEqual([18, 18]);
    expect(sp.slot.transform).toEqual([18, 0, 0, 18, 9, 9]);
    expect(maxSpan(slots)).toBe(6);
    // A span can't run off the quilt.
    expect(spanOf(ix, ix.byId.get('b:r6c6')!, 2)).toBeNull();
  });

  it('takes the sashing and cornerstone inside it, and spans the sashing’s width too', () => {
    const slots = slotsOf(straight(4, 4, 2));
    const ix = spanIndex(slots);
    const sp = spanOf(ix, ix.byId.get('b:r1c1')!, 2)!;
    expect(sp.cells).toHaveLength(4);
    // Two sash pieces each way between the four blocks, one cornerstone where they cross.
    expect(sp.covers.filter((id) => id.startsWith('sash:'))).toHaveLength(4);
    expect(sp.covers.filter((id) => id.startsWith('cs:'))).toHaveLength(1);
    expect(sp.slot.size).toEqual([20, 20]);
    expect(maxSpan(slots)).toBe(4);
    // Its sashing crossing in the middle is part of it.
    expect(spanAt([sp], [10, 10])).toBe(sp);
    expect(spanAt([sp], [25, 25])).toBeNull();
  });

  it('works on point, in triangles and diamonds; hexagons stay 1U', () => {
    const onPoint = slotsOf(onPointDefaults(1));
    expect(maxSpan(onPoint)).toBeGreaterThan(1);
    const shaped = (shape: 'triangles' | 'diamonds' | 'hexagons') => ({
      ...(layoutDefaults('shaped-blocks', 1) as Layout & { style: 'shaped-blocks' }),
      shape,
    });
    const tri = slotsOf(shaped('triangles'));
    expect(maxSpan(tri)).toBeGreaterThan(1);
    const ix = spanIndex(tri);
    const first = tri.find((s) => spannable(s) && spanOf(ix, s, 2))!;
    // A triangle of four triangles, twice the size, its first space in its tip.
    expect(spanOf(ix, first, 2)!.cells).toHaveLength(4);
    expect(spanOf(ix, first, 2)!.cells).toContain(first.id);
    const [x0, y0] = [first.transform[4] + first.transform[0] / 2, first.transform[5]];
    const tip = spanOf(ix, first, 2)!.slot.transform;
    expect(tip[4] + tip[0] / 2).toBeCloseTo(x0);
    expect(tip[5]).toBeCloseTo(y0);
    expect(spanOf(ix, first, 2)!.slot.size).toEqual([first.size[0] * 2, first.size[1] * 2]);
    // Diamonds: most whole diamonds start a 2U one (a 6 × 6 grid's rows less the trimmed edges).
    const dia = slotsOf(shaped('diamonds'));
    const dx = spanIndex(dia);
    expect(dia.filter((s) => spanOf(dx, s, 2)).length).toBeGreaterThan(10);
    expect(maxSpan(slotsOf(shaped('hexagons')))).toBe(1);
    // Baby Blocks: no four diamonds of one cube face make a bigger diamond, so none span.
    expect(maxSpan(slotsOf(layoutDefaults('baby-blocks', 1) as Layout))).toBe(1);
  });

  it('on point, takes in partial blocks at the edge, its first space one of them too', () => {
    const l = onPointDefaults(1);
    if (l.style !== 'on-point') throw new Error('on point expected');
    const g = generateSlots({ ...l, edge: { ...l.edge, finish: 'trim' } }, []);
    const ix = spanIndex(g.slots, g.center);
    const whole = (s: { transform: number[] }) =>
      Math.abs(s.transform[0]! * s.transform[3]! - s.transform[1]! * s.transform[2]!);
    const trimmed = g.slots.filter((s) => spannable(s) && ix.areas.get(s.id)! < whole(s) * 0.999);
    expect(trimmed.length).toBeGreaterThan(0);
    const firsts = trimmed.flatMap((s) => spanOf(ix, s, 2) ?? []);
    expect(firsts.length).toBeGreaterThan(0);
    for (const sp of firsts) {
      // Cut to the quilt like its spaces: its outline holds just what's left of them.
      const left = sp.covers.reduce((t, id) => t + ix.areas.get(id)!, 0);
      const out = spanIndex([sp.slot]).areas.get(sp.at)!;
      expect(out).toBeCloseTo(left);
      expect(out).toBeLessThan(sp.slot.size[0] * sp.slot.size[1]);
    }
    // Without the quilt's edge to cut to, a span running off it isn't one.
    expect(
      spanOf(spanIndex(slotsOf({ ...l, edge: { ...l.edge, finish: 'trim' } })), trimmed[0]!, 2),
    ).toBeNull();
    // Setting triangles (an exact finish) take no blocks, so no span reaches them.
    const exact = generateSlots(l, []);
    const ex = spanIndex(exact.slots, exact.center);
    for (const s of exact.slots.filter(spannable))
      for (let k = 2; k <= 3; k++)
        expect(spanOf(ex, s, k)?.covers.some((id) => !/^(b|sash|cs):/.test(id)) ?? false).toBe(
          false,
        );
  });

  it('on point with setting triangles, takes them in as the blocks they hold, first space too', () => {
    const q = quiltOf(onPointDefaults(1));
    const spaces = spanSpaces(q);
    const g0 = generateFor(q);
    const ix = spanIndex(spaces, g0.center);
    const first = spaces.find((s) => s.id.startsWith('set:') && spanOf(ix, s, 2));
    expect(first).toBeDefined();
    q.layers[0].slots[first!.id] = { ...place, span: 2 };
    const g = generateFor(q);
    expect(g.spans!.map((s) => [s.at, s.k])).toEqual([[first!.id, 2]]);
    // The setting pieces it takes now hold its parts: none left as setting pieces under it.
    expect(g.spans![0]!.cells.length).toBe(4);
    expect(g.slots.filter((s) => g.spans![0]!.covers.includes(s.id) && s.id !== first!.id)).toEqual(
      [],
    );
    expect(reconcile(q, q.layout, []).split).toEqual([]);
  });

  it('merges a span into the quilt’s spaces, under its first space’s id', () => {
    const q = quiltOf(straight(4, 4));
    q.layers[0].slots['b:r1c1'] = { ...place, span: 2 };
    const g = generateFor(q);
    expect(g.slots.filter((s) => s.id.startsWith('b:'))).toHaveLength(16 - 3);
    expect(g.slots.find((s) => s.id === 'b:r1c1')!.size).toEqual([18, 18]);
    expect(g.slots.some((s) => s.id === 'b:r2c2')).toBe(false);
    expect(g.spans).toHaveLength(1);
    expect(g.unspanned).toHaveLength(16);
  });

  it('leaves out a span overlapping an earlier one, and one that no longer fits', () => {
    const q = quiltOf(straight(4, 4));
    q.layers[0].slots['b:r1c1'] = { ...place, span: 2 };
    q.layers[0].slots['b:r2c2'] = { ...place, span: 2 };
    expect(generateFor(q).spans!.map((s) => s.at)).toEqual(['b:r1c1']);
    // The quilt shrinks to 3 × 3: a 3U span from r2c2 can't fit, it goes back to one space.
    q.layers[0].slots = { 'b:r2c2': { ...place, span: 3 }, 'b:r1c1': place };
    const r = reconcile(q, straight(3, 3), []);
    expect(r.split).toEqual(['b:r2c2']);
    expect(r.slots['b:r2c2']).toEqual(place);
    expect(r.slots['b:r1c1']).toEqual(place);
  });

  it('finds the span nearest a point, and grows one from the space pressed', () => {
    const ix = spanIndex(slotsOf(straight(6, 6)));
    // Pointer on r3c3's lower right: the 2U span there runs right and down.
    expect(spanNear(ix, 'b:r3c3', 2, [26, 26])!.at).toBe('b:r3c3');
    // …and on its upper left, the one up and left.
    expect(spanNear(ix, 'b:r3c3', 2, [19, 19])!.at).toBe('b:r2c2');
    expect(spanGrow(ix, 'b:r2c2', 'b:r2c2')!.k).toBe(1);
    expect(spanGrow(ix, 'b:r2c2', 'b:r3c3')!.at).toBe('b:r2c2');
    // Dragging up-left from r4c4 keeps r4c4 a corner.
    const up = spanGrow(ix, 'b:r4c4', 'b:r2c2')!;
    expect(up.k).toBe(3);
    expect(up.at).toBe('b:r2c2');
  });

  it('a dragged triangle faces the way of the one pressed, through rows of the other way', () => {
    const tri = slotsOf({
      ...(layoutDefaults('shaped-blocks', 1) as Layout & { style: 'shaped-blocks' }),
      shape: 'triangles',
    });
    const ix = spanIndex(tri);
    const axes = (id: string) =>
      ix.byId
        .get(id)!
        .transform.slice(0, 4)
        .map((v) => Math.round(v * 1e4));
    const cells = tri.filter(spannable).map((s) => s.id);
    let grew = 0;
    for (const from of cells.slice(0, 20))
      for (const to of cells) {
        const sp = spanGrow(ix, from, to);
        if (!sp) continue;
        expect(axes(sp.at), `${from} → ${to}`).toEqual(axes(from));
        if (sp.k > 1) grew++;
      }
    expect(grew).toBeGreaterThan(0);
  });

  it('keeps clear of a spanning block already placed, but for its own spaces', () => {
    const ix = spanIndex(slotsOf(straight(6, 6)));
    const there = spanOf(ix, ix.byId.get('b:r3c3')!, 2)!;
    const free = (s: { at: string; k: number; cells: string[] }) =>
      (s.at === there.at && s.k === there.k) || !s.cells.some((c) => there.cells.includes(c));
    // On r2c2's lower right the nearest 2U (from r2c2) would run into it: one clear of it instead.
    expect(spanNear(ix, 'b:r2c2', 2, [17, 17])!.at).toBe('b:r2c2');
    const near = spanNear(ix, 'b:r2c2', 2, [17, 17], free)!;
    expect(near.at).not.toBe('b:r2c2');
    expect(free(near)).toBe(true);
    // A drag from r2c2 to r3c3 can't take part of it, nor all of it in a 3U.
    expect(spanGrow(ix, 'b:r2c2', 'b:r3c3', 6, free)).toBeNull();
    // Inside it, a drag finds only it.
    expect(spanGrow(ix, 'b:r3c3', 'b:r4c4', 6, free)).toMatchObject({ at: 'b:r3c3', k: 2 });
  });
});
