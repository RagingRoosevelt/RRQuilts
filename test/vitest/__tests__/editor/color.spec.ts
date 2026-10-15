import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { fromHex, fromHsl, nearestColor, toHex, toHsl } from '@/editor/color';
import { colorsPainted, colorsUsed, paintsUsed, quiltColors, replaceColors } from '@/editor/colors';
import { addStarterContent } from '@/content/starter';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import { fixture } from '../model/helpers';

describe('color conversions', () => {
  it('hex round-trips', () => {
    expect(toHex([196, 40, 44])).toBe('#c4282c');
    expect(fromHex('#c4282c')).toEqual([196, 40, 44]);
    expect(fromHex('fff')).toEqual([255, 255, 255]);
    expect(fromHex('nope')).toBeNull();
  });
  it('hsl round-trips within rounding', () => {
    for (const rgb of [
      [196, 40, 44],
      [48, 104, 176],
      [250, 236, 160],
      [24, 24, 26],
    ] as const) {
      const back = fromHsl(toHsl([...rgb]));
      back.forEach((v, i) => expect(Math.abs(v - rgb[i]!)).toBeLessThanOrEqual(3));
    }
    expect(toHsl([255, 0, 0])).toEqual([0, 100, 50]);
  });
});

describe('swapping colors when a palette is unpicked', () => {
  it('suggests the nearest color', () => {
    const near = nearestColor(
      [150, 20, 30],
      [
        { id: 'navy', rgb: [28, 36, 72] },
        { id: 'red', rgb: [196, 40, 44] },
        { id: 'gold', rgb: [218, 168, 40] },
      ],
    );
    expect(near?.id).toBe('red');
    expect(nearestColor([0, 0, 0], [])).toBeUndefined();
  });

  it('recolors own blocks and quilts, not library blocks', () => {
    const doc = structuredClone(fixture());
    const own = doc.project.blocks.find((b) => !b.source)!;
    const fill = Object.values(own.colorings[0]!.fills).find((f) => 'color' in f) as {
      color: string;
    };
    const old = fill.color;
    expect(colorsUsed(doc).has(old)).toBe(true);
    const next = produce(doc, (d) => replaceColors(d, new Map([[old, 'rrquilts.red']])));
    expect(colorsUsed(next).has(old)).toBe(false);
    expect(colorsUsed(next).has('rrquilts.red')).toBe(true);
  });

  it('swaps colors for fabrics and back (paint ids)', () => {
    const doc = structuredClone(fixture());
    const own = doc.project.blocks.find((b) => !b.source)!;
    const fill = Object.values(own.colorings[0]!.fills).find((f) => 'color' in f) as {
      color: string;
    };
    const old = fill.color;
    const toFabric = produce(doc, (d) => replaceColors(d, new Map([[old, 'fabric:f1']])));
    expect(paintsUsed(toFabric).has('fabric:f1')).toBe(true);
    expect(paintsUsed(toFabric).has(old)).toBe(false);
    const back = produce(toFabric, (d) => replaceColors(d, new Map([['fabric:f1', old]])));
    expect(paintsUsed(back).has(old)).toBe(true);
    expect(paintsUsed(back).has('fabric:f1')).toBe(false);
  });

  it("remaps a library block's designer colors in the quilt, leaving the block unchanged", () => {
    const doc = addStarterContent(createProject());
    const star = doc.project.blocks.find((b) => b.id === 'rrquilts.ohio-star')!;
    const red = Object.values(star.colorings[0]!.fills)
      .map((f) => ('color' in f ? f.color : ''))
      .find((c) => c === 'rrquilts.red')!;
    const withQuilt = produce(doc, (d) => {
      const q = structuredClone(
        createQuilt(
          'Q',
          {
            style: 'horizontal',
            cols: 1,
            rows: 1,
            block: [10, 10],
            sash: [0, 0],
            sashBorder: false,
          },
          [],
        ),
      );
      q.colorings = { c: { base: star.colorings[0]!.id, fills: {} } };
      q.layers[0].slots['b:r1c1'] = { block: star.id, coloring: 'c', rotation: 0, flip: false };
      d.project.quilts.push(q);
    });
    const q0 = withQuilt.project.quilts[0]!;
    expect(colorsUsed(withQuilt).has(red)).toBe(true);
    expect(colorsPainted(withQuilt).has(red)).toBe(false);
    const next = produce(withQuilt, (d) => replaceColors(d, new Map([[red, 'rrquilts.navy']])));
    expect(quiltColors(next, next.project.quilts[0]!).has(red)).toBe(false);
    expect(next.project.blocks.find((b) => b.id === star.id)).toEqual(star);
    expect(Object.keys(next.project.quilts[0]!.colorings.c!.fills).length).toBeGreaterThan(0);
    expect(q0.colorings.c!.fills).toEqual({});
  });
});
