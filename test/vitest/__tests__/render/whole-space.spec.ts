import { describe, expect, it } from 'vitest';
import type { Slot } from '@/model/layout/slots';
import { isWholeBlockSpace } from '@/render/data-overlay';

const rect = (w: number): Slot['outline'] =>
  [['M', 0, 0], ['L', w, 0], ['L', w, 10], ['L', 0, 10], ['Z']] as Slot['outline'];
const slot = (outline: Slot['outline']): Slot => ({
  id: 'b:1',
  kind: 'block',
  shape: 'rect',
  turns: 90,
  alt: 0,
  outline,
  transform: [10, 0, 0, 10, 0, 0],
  size: [10, 10],
});

describe('whole block spaces (data quilts)', () => {
  it('a space cut down at the edge does not take a data block', () => {
    expect(isWholeBlockSpace(slot(rect(10)))).toBe(true);
    expect(isWholeBlockSpace(slot(rect(5)))).toBe(false);
    expect(isWholeBlockSpace({ ...slot(rect(10)), kind: 'sash' })).toBe(false);
  });
});
