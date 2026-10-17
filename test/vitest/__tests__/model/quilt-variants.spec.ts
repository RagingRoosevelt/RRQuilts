import { describe, expect, it } from 'vitest';
import type { Quilt } from '@/model/schema/quilt';
import {
  addVariant,
  removeVariant,
  setSwap,
  shownVariant,
  swapColoring,
  swapper,
} from '@/model/quilt-variants';
import { fixture } from './helpers';

const quilt = (): Quilt => structuredClone<Quilt>(fixture().project.quilts[0]!);

describe('quilt color variants (palette swaps)', () => {
  it('a new variant is shown and starts with the quilt’s own colors', () => {
    const q = addVariant(quilt(), 'v1');
    expect(q.shownVariant).toBe('v1');
    expect(shownVariant(q)?.name).toBe('Variant 1');
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
    const q = removeVariant(addVariant(quilt(), 'v1'), 'v1');
    expect(q.shownVariant).toBeUndefined();
    expect(q.variants).toEqual([]);
  });
});
