import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { lookupEpp } from '@/model/epp/expand';
import { rosettePieces, shapeAsRosette } from '@/model/epp/print';
import { area, offset } from '@/model/print/polygon';
import { templates } from '@/model/print/pieces';

const { shapes, rosettes } = eppStarters();
const lookup = lookupEpp({ eppShapes: shapes, rosettes });
const flower = rosettes.find((r) => r.notecard.name === 'Hexagon Flower')!;

describe('EPP print pieces', () => {
  it('a flower at 1U = 1 in, four of them: 28 hexagons in two fills', () => {
    const { pieces } = rosettePieces(flower, lookup, 1);
    const all = Array.from({ length: 4 }, () => pieces).flat();
    const t = templates(all);
    expect(t).toHaveLength(1);
    expect([...t[0]!.counts.values()].reduce((a, b) => a + b, 0)).toBe(28);
    expect(t[0]!.counts.size).toBe(2);
  });

  it('the 1U length scales the pieces; the fabric template is one seam allowance larger', () => {
    const { pieces } = rosettePieces(flower, lookup, 2);
    const hex = pieces[0]!.poly;
    const edge = Math.hypot(hex[1]![0] - hex[0]![0], hex[1]![1] - hex[0]![1]);
    expect(edge).toBeCloseTo(2);
    const fabric = offset(hex, 0.25);
    // A hexagon grown by d gains perimeter × d plus 6 corner pieces (2√3·d² in all).
    expect(area(fabric)).toBeCloseTo(area(hex) + 12 * 0.25 + 2 * Math.sqrt(3) * 0.0625, 6);
  });

  it('a shape prints as one piece', () => {
    const tri = shapes.find((s) => s.notecard.name === 'Triangle')!;
    expect(rosettePieces(shapeAsRosette(tri), lookup, 1).pieces).toHaveLength(1);
  });
});
