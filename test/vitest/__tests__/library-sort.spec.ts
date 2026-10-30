import { describe, expect, it } from 'vitest';
import { blockSections, byShapeAndName } from '@/model/library';
import type { Block } from '@/model/schema/block';
import type { LibraryDoc } from '@/model/schema/library';

const blk = (id: string, name: string, shape?: Block['shape']) =>
  ({ id, notecard: { name }, ...(shape ? { shape } : {}) }) as Block;
const names = (bs: Block[]) => bs.map((b) => b.notecard.name);

const blocks = [
  blk('h', 'Hex', 'hexagon'),
  blk('t2', 'b triangle', 'triangle'),
  blk('s10', 'Block 10'),
  blk('t1', 'A triangle', 'triangle'),
  blk('s2', 'Block 2'),
  blk('d', 'Diamond', 'diamond60'),
  blk('a', 'apple'),
  blk('a2', 'Apple'),
];

describe('library blocks by shape, then name (spec 049)', () => {
  it('square first, then triangle, 60° diamond, hexagon; names A to Z, numbers in order', () => {
    expect(names(byShapeAndName(blocks))).toEqual([
      'apple',
      'Apple',
      'Block 2',
      'Block 10',
      'A triangle',
      'b triangle',
      'Diamond',
      'Hex',
    ]);
  });
  it("doesn't change the input", () => {
    const copy = [...blocks];
    byShapeAndName(blocks);
    expect(blocks).toEqual(copy);
  });
  it('groups by shape, empty shapes left out', () => {
    const doc = { items: [], categories: [] } as unknown as LibraryDoc;
    const secs = blockSections(doc, blocks, 'shape');
    expect(secs.map((s) => [s.label, s.count])).toEqual([
      ['Square and rectangle', 4],
      ['Triangle', 2],
      ['60° diamond', 1],
      ['Hexagon', 1],
    ]);
    expect(names(secs[1]!.blocks)).toEqual(['A triangle', 'b triangle']);
    expect(blockSections(doc, [blocks[0]!], 'shape').map((s) => s.label)).toEqual(['Hexagon']);
  });
  it('sorts inside other groupings too', () => {
    const doc = { items: [], categories: [] } as unknown as LibraryDoc;
    expect(names(blockSections(doc, blocks, 'none')[0]!.blocks)[0]).toBe('apple');
  });
});
