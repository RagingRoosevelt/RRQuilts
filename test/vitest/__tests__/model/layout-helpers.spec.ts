import { describe, expect, it } from 'vitest';
import { generateSlots } from '@/model/layout/slots';
import { quiltWith, slotArea, slotsJson } from './layout-helpers';

describe('layout test helpers', () => {
  it('builds a 2x2 horizontal layout whose block slots have the block area', () => {
    const q = quiltWith(
      { style: 'straight-set', cols: 2, rows: 2, block: [4, 6], sash: [0, 0], sashBorder: false },
      [],
    );
    expect(q.layers[0].slots).toEqual({});
    const blocks = slotsJson(q.layout, q.borders).slots.filter(
      (s: { kind: string }) => s.kind === 'block',
    );
    expect(blocks).toHaveLength(4);
    for (const s of generateSlots(q.layout, q.borders).slots.filter((s) => s.kind === 'block'))
      expect(slotArea(s)).toBeCloseTo(24);
  });
});
