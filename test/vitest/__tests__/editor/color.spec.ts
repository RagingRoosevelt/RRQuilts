import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { fromHex, fromHsl, nearestColor, toHex, toHsl } from '@/editor/color';
import { colorsUsed, replaceColors } from '@/editor/colors';
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
});
