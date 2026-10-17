import { describe, expect, it } from 'vitest';
import type { Quilt } from '@/model/schema/quilt';
import {
  addVariant,
  removeVariant,
  renameVariant,
  setSwap,
  shownVariant,
  swapColoring,
  swapper,
  variantList,
} from '@/model/quilt-variants';
import { fixture } from './helpers';

const quilt = (): Quilt => structuredClone<Quilt>(fixture().project.quilts[0]!);

describe('quilt color variants (palette swaps)', () => {
  it('a new variant is shown and starts with the quilt’s own colors', () => {
    const q = addVariant(quilt(), 'v1');
    expect(q.shownVariant).toBe('v1');
    expect(shownVariant(q)?.name).toBe('Variant 2');
    expect(swapper(shownVariant(q))({ color: 'red' })).toEqual({ color: 'red' });
  });

  it('swaps a color everywhere; swapping it back removes the swap', () => {
    let q = addVariant(quilt(), 'v1');
    q = setSwap(q, 'v1', 'color:red', { color: 'blue' });
    const swap = swapper(shownVariant(q));
    expect(swap({ color: 'red' })).toEqual({ color: 'blue' });
    expect(swap({ color: 'green' })).toEqual({ color: 'green' });
    expect(
      swapColoring({ fills: { a: { color: 'red' }, b: { color: 'green' } } }, shownVariant(q)),
    ).toEqual({ fills: { a: { color: 'blue' }, b: { color: 'green' } } });
    q = setSwap(q, 'v1', 'color:red', { color: 'red' });
    expect(shownVariant(q)!.swaps).toEqual([]);
  });

  it('the original colors show again when the shown variant is deleted', () => {
    const q = removeVariant(addVariant(quilt(), 'v1'), 'v1', []);
    expect(q.shownVariant).toBeUndefined();
    expect(q.variants).toEqual([]);
  });

  it('the quilt’s own colors can go: the next variant becomes them, the others swap from those', () => {
    const base = quilt();
    const slot = Object.values(base.layers[0].slots).find((s) => base.colorings[s.coloring])!;
    base.colorings[slot.coloring] = { fills: { a: { color: 'red' }, b: { color: 'green' } } };
    let q = renameVariant(base, undefined, 'Warm');
    expect(variantList(q).map((v) => v.name)).toEqual(['Warm']);
    q = setSwap(addVariant(q, 'v1', 'Cool'), 'v1', 'color:red', { color: 'blue' });
    q = setSwap(addVariant(q, 'v2', 'Dark'), 'v2', 'color:green', { color: 'black' });
    q = removeVariant(q, undefined, []);
    expect(variantList(q).map((v) => v.name)).toEqual(['Cool', 'Dark']);
    expect(q.colorings[slot.coloring]!.fills).toEqual({
      a: { color: 'blue' },
      b: { color: 'green' },
    });
    // Dark was red→red, green→black: now blue→red, green→black.
    const dark = swapper(shownVariant(q, 'v2'));
    expect(dark({ color: 'blue' })).toEqual({ color: 'red' });
    expect(dark({ color: 'green' })).toEqual({ color: 'black' });
    expect(q.shownVariant).toBe('v2');
  });
});
