import { describe, expect, it } from 'vitest';
import { placementTargets, setTargets } from '@/editor/scope';
import { generateSlots } from '@/model/layout/slots';
import { ensurePlainBlock, ensureSlotContent, slotGroup } from '@/model/plain';
import type { Quilt } from '@/model/schema/quilt';
import { fixture } from '../model/helpers';

const quilt = (): Quilt => {
  const q = structuredClone(fixture().project.quilts[0]!);
  q.layout = {
    style: 'straight-set',
    cols: 2,
    rows: 2,
    block: [5, 5],
    sash: [1, 1],
    sashBorder: false,
  };
  q.borders = [{ style: 'long-horizontal', sides: [2, 2, 2, 2] }];
  const s = (block: string) => ({ block, coloring: 'k', rotation: 0 as const, flip: false });
  q.colorings = { k: { fills: {} } };
  q.layers[0].slots = { 'b:r1c1': s('A'), 'b:r1c2': s('A'), 'b:r2c1': s('B'), 'b:r2c2': s('A') };
  return q;
};
const ids = (q: Quilt) => generateSlots(q.layout, q.borders).slots;

describe('scope resolution', () => {
  it('setting a block targets block spaces', () => {
    const q = quilt();
    expect(setTargets(ids(q), 'b:r1c1', 'all').sort()).toEqual([
      'b:r1c1',
      'b:r1c2',
      'b:r2c1',
      'b:r2c2',
    ]);
    expect(setTargets(ids(q), 'b:r1c1', 'alternate').sort()).toEqual(['b:r1c1', 'b:r2c2']);
  });

  it('editing placements targets the same block; alternate uses checkerboard parity', () => {
    const q = quilt();
    expect(placementTargets(q, ids(q), 'b:r1c1', 'all').sort()).toEqual([
      'b:r1c1',
      'b:r1c2',
      'b:r2c2',
    ]);
    expect(placementTargets(q, ids(q), 'b:r1c1', 'alternate').sort()).toEqual(['b:r1c1', 'b:r2c2']);
  });

  it('plain pieces group by kind: every sash, every cornerstone, every side of one border', () => {
    const q = quilt();
    const all = (t: string) => placementTargets(q, ids(q), t, 'all');
    expect(all('sash:v:r1c1').every((id) => slotGroup(id) === 'sash')).toBe(true);
    expect(all('sash:v:r1c1')).toHaveLength(4); // 2 vertical + 2 horizontal
    expect(all('cs:r1c1')).toEqual(['cs:r1c1']);
    expect(all('border:1:top').sort()).toEqual([
      'border:1:bottom',
      'border:1:left',
      'border:1:right',
      'border:1:top',
    ]);
  });

  it('empty plain pieces get the plain block before painting', () => {
    const doc = ensurePlainBlock(fixture());
    expect(doc.project.blocks.filter((b) => b.id === 'plain')).toHaveLength(1);
    expect(ensurePlainBlock(doc)).toBe(doc);
    const q = ensureSlotContent(quilt(), ['sash:v:r1c1', 'b:r1c1']);
    expect(q.layers[0].slots['sash:v:r1c1']?.block).toBe('plain');
  });

  it('alt matches the old digit-sum parity, so Alternate selects the same spaces', () => {
    const q = quilt();
    q.layout = { ...q.layout, sashBorder: true } as typeof q.layout;
    q.borders = [
      { style: 'long-horizontal', sides: [2, 2, 2, 2] },
      { style: 'long-horizontal', sides: [1, 1, 1, 1] },
    ];
    const slots = ids(q);
    const parity = (id: string) => (id.match(/\d+/g) ?? []).reduce((s, n) => s + Number(n), 0) % 2;
    for (const s of slots) expect(s.alt, s.id).toBe(parity(s.id));
    for (const group of ['block', 'sash', 'cs']) {
      const tapped = slots.find((s) => slotGroup(s.id) === group)!.id;
      const expected = slots
        .filter((s) => slotGroup(s.id) === group && parity(s.id) === parity(tapped))
        .map((s) => s.id);
      // Every space filled with plain fabric, so Alternate paints by class.
      const filled = {
        ...q,
        layers: [
          {
            ...q.layers[0],
            slots: Object.fromEntries(
              slots.map((x) => [
                x.id,
                { block: 'plain', coloring: 'k', rotation: 0 as const, flip: false },
              ]),
            ),
          },
          q.layers[1],
          q.layers[2],
        ],
      } as Quilt;
      expect(placementTargets(filled, slots, tapped, 'alternate').sort()).toEqual(expected.sort());
    }
  });
});
