import { describe, expect, it } from 'vitest';
import { paint } from '@/model/coloring';
import type { Quilt } from '@/model/schema/quilt';
import { fixture } from './helpers';

/** 2×2 quilt: blocks A at r1c1, r2c2 and r1c2; B at r2c1; A placements share coloring "ka". */
function quilt(): Quilt {
  const q = structuredClone(fixture().project.quilts[0]!);
  const slot = (block: string, coloring: string) => ({
    block,
    coloring,
    rotation: 0 as const,
    flip: false,
  });
  q.colorings = { ka: { fills: { p: { color: 'col1' } } }, kb: { fills: {} } };
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
const red = { color: 'col2' };
const fillOf = (q: Quilt, slot: string) => q.colorings[q.layers[0].slots[slot]!.coloring]!.fills.p;

describe('copy-on-write quilt coloring', () => {
  it('"this" gives the edited placement its own copy', () => {
    const before = quilt();
    const q = paint(before, 'b:r1c1', 'p', red, 'this');
    expect(fillOf(q, 'b:r1c1')).toEqual(red);
    expect(fillOf(q, 'b:r1c2')).toEqual({ color: 'col1' });
    expect(q.layers[0].slots['b:r1c1']!.coloring).not.toBe('ka');
    expect(fillOf(before, 'b:r1c1')).toEqual({ color: 'col1' }); // input untouched
  });

  it('"all identical" edits the shared coloring for every placement of that block', () => {
    const q = paint(quilt(), 'b:r1c1', 'p', red, 'allIdentical');
    for (const s of ['b:r1c1', 'b:r1c2', 'b:r2c2']) expect(fillOf(q, s)).toEqual(red);
    expect(q.colorings.kb).toEqual({ fills: {} });
    expect(q.layers[0].slots['b:r1c1']!.coloring).toBe('ka'); // no copy needed
  });

  it('"alternate" edits same-block placements on the same checkerboard color only', () => {
    const q = paint(quilt(), 'b:r1c1', 'p', red, 'alternate');
    expect(fillOf(q, 'b:r1c1')).toEqual(red);
    expect(fillOf(q, 'b:r2c2')).toEqual(red);
    expect(fillOf(q, 'b:r1c2')).toEqual({ color: 'col1' });
    // r1c1 and r2c2 share one new copy.
    expect(q.layers[0].slots['b:r1c1']!.coloring).toBe(q.layers[0].slots['b:r2c2']!.coloring);
  });

  it('clearing a fill removes it, and unused colorings are dropped', () => {
    let q = paint(quilt(), 'b:r2c1', 'p', red, 'this');
    q = paint(q, 'b:r1c1', 'p', undefined, 'allIdentical');
    expect(fillOf(q, 'b:r1c1')).toBeUndefined();
    q = paint(q, 'b:r1c1', 'p', red, 'this');
    expect(Object.keys(q.colorings)).toHaveLength(3); // ka (r1c2, r2c2), r1c1's copy, kb
  });
});
