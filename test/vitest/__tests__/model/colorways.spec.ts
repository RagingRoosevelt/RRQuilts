import { describe, expect, it } from 'vitest';
import type { Quilt } from '@/model/schema/quilt';
import {
  addColorway,
  removeColorway,
  renameColorway,
  setSwap,
  shownColorway,
  swapColoring,
  swapper,
  colorwayList,
} from '@/model/colorways';
import { fixture } from './helpers';

const quilt = (): Quilt => structuredClone<Quilt>(fixture().project.quilts[0]!);

describe('Quilt colorways', () => {
  it('a new colorway is shown and starts with the quilt’s own colors', () => {
    const q = addColorway(quilt(), 'v1');
    expect(q.shownColorway).toBe('v1');
    expect(shownColorway(q)?.name).toBe('Colorway 2');
    expect(swapper(shownColorway(q))({ color: 'red' })).toEqual({ color: 'red' });
  });

  it('swaps a color everywhere; swapping it back removes the swap', () => {
    let q = addColorway(quilt(), 'v1');
    q = setSwap(q, 'v1', 'color:red', { color: 'blue' });
    const swap = swapper(shownColorway(q));
    expect(swap({ color: 'red' })).toEqual({ color: 'blue' });
    expect(swap({ color: 'green' })).toEqual({ color: 'green' });
    expect(
      swapColoring({ fills: { a: { color: 'red' }, b: { color: 'green' } } }, shownColorway(q)),
    ).toEqual({ fills: { a: { color: 'blue' }, b: { color: 'green' } } });
    q = setSwap(q, 'v1', 'color:red', { color: 'red' });
    expect(shownColorway(q)!.swaps).toEqual([]);
  });

  it('the original colors show again when the shown colorway is deleted', () => {
    const q = removeColorway(addColorway(quilt(), 'v1'), 'v1', []);
    expect(q.shownColorway).toBeUndefined();
    expect(q.colorways).toEqual([]);
  });

  it('the quilt’s own colors can go: the next colorway becomes them, the others swap from those', () => {
    const base = quilt();
    const slot = Object.values(base.layers[0].slots).find((s) => base.colorings[s.coloring])!;
    base.colorings[slot.coloring] = { fills: { a: { color: 'red' }, b: { color: 'green' } } };
    let q = renameColorway(base, undefined, 'Warm');
    expect(colorwayList(q).map((v) => v.name)).toEqual(['Warm']);
    q = setSwap(addColorway(q, 'v1', 'Cool'), 'v1', 'color:red', { color: 'blue' });
    q = setSwap(addColorway(q, 'v2', 'Dark'), 'v2', 'color:green', { color: 'black' });
    q = removeColorway(q, undefined, []);
    expect(colorwayList(q).map((v) => v.name)).toEqual(['Cool', 'Dark']);
    expect(q.colorings[slot.coloring]!.fills).toEqual({
      a: { color: 'blue' },
      b: { color: 'green' },
    });
    // Dark was red→red, green→black: now blue→red, green→black.
    const dark = swapper(shownColorway(q, 'v2'));
    expect(dark({ color: 'blue' })).toEqual({ color: 'red' });
    expect(dark({ color: 'green' })).toEqual({ color: 'black' });
    expect(q.shownColorway).toBe('v2');
  });
});
