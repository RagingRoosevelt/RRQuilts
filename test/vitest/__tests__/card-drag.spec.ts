import { describe, expect, it } from 'vitest';
import { gapAt } from '@/composables/card-drag';

// Two rows of three 100×100 cards, 20 apart; the last row has two cards.
const rect = (l: number, t: number) =>
  ({ left: l, top: t, right: l + 100, bottom: t + 100, width: 100, height: 100 }) as DOMRect;
const rects = [rect(0, 0), rect(120, 0), rect(240, 0), rect(0, 120), rect(120, 120)];

describe('gapAt (spec 037)', () => {
  it('lands before or after the card under the point', () => {
    expect(gapAt(rects, 10, 50)).toBe(0);
    expect(gapAt(rects, 90, 50)).toBe(1);
    expect(gapAt(rects, 130, 150)).toBe(3 + 1);
    expect(gapAt(rects, 230, 150)).toBe(5);
  });
  it('a point in a gap between cards goes to the nearer card', () => {
    expect(gapAt(rects, 105, 50)).toBe(1);
    expect(gapAt(rects, 115, 50)).toBe(1);
  });
  it('past the last card or below the list is the end', () => {
    expect(gapAt(rects, 400, 150)).toBe(5);
    expect(gapAt(rects, 10, 600)).toBe(5);
    expect(gapAt(rects, 400, 50)).toBe(3);
  });
  it('before the first card is the start', () => {
    expect(gapAt(rects, -50, 10)).toBe(0);
  });
  it('skips cards not laid out', () => {
    expect(gapAt([null, rect(120, 0)], 10, 50)).toBe(1);
    expect(gapAt([], 0, 0)).toBeNull();
  });
});
