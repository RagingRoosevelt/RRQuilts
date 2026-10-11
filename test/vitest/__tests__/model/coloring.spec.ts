import { describe, expect, it } from 'vitest';
import { paint, spray, swap } from '@/model/coloring';
import type { Quilt } from '@/model/schema/quilt';
import { fixture } from './helpers';

/** 2×2 quilt: block A (patches p,q) at r1c1, r1c2, r2c2 sharing coloring "ka"; B at r2c1. */
function quilt(): Quilt {
  const q = structuredClone(fixture().project.quilts[0]!);
  const slot = (block: string, coloring: string) => ({
    block,
    coloring,
    rotation: 0 as const,
    flip: false,
  });
  q.colorings = { ka: { fills: { p: { color: 'c1' }, q: { color: 'c1' } } }, kb: { fills: {} } };
  q.layers[0].slots = {
    'b:r1c1': slot('A', 'ka'),
    'b:r1c2': slot('A', 'ka'),
    'b:r2c2': slot('A', 'ka'),
    'b:r2c1': slot('B', 'kb'),
  };
  q.layers[1].items = [];
  q.layers[2].items = [];
  return q;
}
const patchesOf = (b: string) => (b === 'A' ? ['p', 'q'] : ['p']);
const red = { color: 'c2' };
const fills = (q: Quilt, slot: string) => q.colorings[q.layers[0].slots[slot]!.coloring]!.fills;

describe('copy-on-write quilt coloring', () => {
  it('painting some placements gives them their own copy', () => {
    const before = quilt();
    const q = paint(before, ['b:r1c1'], 'p', red);
    expect(fills(q, 'b:r1c1').p).toEqual(red);
    expect(fills(q, 'b:r1c2').p).toEqual({ color: 'c1' });
    expect(fills(before, 'b:r1c1').p).toEqual({ color: 'c1' }); // input untouched
  });

  it('painting every placement of a shared coloring edits it in place', () => {
    const q = paint(quilt(), ['b:r1c1', 'b:r1c2', 'b:r2c2'], 'p', red);
    expect(q.layers[0].slots['b:r1c1']!.coloring).toBe('ka');
    for (const s of ['b:r1c1', 'b:r1c2', 'b:r2c2']) expect(fills(q, s).p).toEqual(red);
  });

  it('targets in one edit share one copy; clearing removes the fill; unused colorings dropped', () => {
    let q = paint(quilt(), ['b:r1c1', 'b:r2c2'], 'p', red);
    expect(q.layers[0].slots['b:r1c1']!.coloring).toBe(q.layers[0].slots['b:r2c2']!.coloring);
    q = paint(q, ['b:r1c2'], 'p', undefined);
    expect(fills(q, 'b:r1c2').p).toBeUndefined();
    expect(Object.keys(q.colorings)).toHaveLength(3);
  });

  it('spray recolors every patch with the same fill in the targets, including unfilled', () => {
    let q = spray(quilt(), ['b:r1c1'], { color: 'c1' }, red, patchesOf);
    expect(fills(q, 'b:r1c1')).toEqual({ p: red, q: red });
    expect(fills(q, 'b:r1c2')).toEqual({ p: { color: 'c1' }, q: { color: 'c1' } });
    q = spray(q, ['b:r2c1'], undefined, red, patchesOf);
    expect(fills(q, 'b:r2c1')).toEqual({ p: red });
  });

  it('swap recolors a fill everywhere in the quilt', () => {
    const q = swap(quilt(), { color: 'c1' }, red, patchesOf);
    for (const s of ['b:r1c1', 'b:r1c2', 'b:r2c2']) expect(fills(q, s)).toEqual({ p: red, q: red });
  });
});
