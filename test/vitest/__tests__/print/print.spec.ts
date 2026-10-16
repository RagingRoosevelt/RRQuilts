import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import type { Pt } from '@/model/geometry/path';
import { fmtFabric, fmtLen, roundUp } from '@/model/print/format';
import { pack, splitFlow, tiles } from '@/model/print/pack';
import { generateSlots } from '@/model/layout/slots';
import { ensurePlainBlock, ensureSlotContent } from '@/model/plain';
import { blockPieces, quiltPieces, templates, type Piece } from '@/model/print/pieces';
import { area, offset, roomiest, shapeKey, simplify } from '@/model/print/polygon';
import { cutFor, cutPlan } from '@/model/print/rotary';
import { fixture } from '../model/helpers';
import { backing, binding, fabricNeeds } from '@/model/print/yardage';

const sq = (s: number, x = 0, y = 0): Pt[] => [
  [x, y],
  [x + s, y],
  [x + s, y + s],
  [x, y + s],
];
const piece = (poly: Pt[], fill = 'color:a'): Piece => ({ poly, curved: false, fill, marks: [] });
const star = () => builtinItems().blocks.find((b) => b.id === 'rrquilts.ohio-star')!;

describe('print geometry', () => {
  it('formats lengths like a quilter', () => {
    expect(fmtLen(3.5, 'in')).toBe('3½″');
    expect(fmtLen(3.875, 'in')).toBe('3⅞″');
    expect(fmtLen(3.3125, 'in')).toBe('3 5/16″');
    expect(fmtLen(0.25, 'in')).toBe('¼″');
    expect(fmtLen(9.5, 'cm')).toBe('9.5 cm');
    expect(fmtLen(1 / 3, 'in')).toBe('0.333″ (~ 5/16″)');
    expect(fmtLen(10 / 3, 'in')).toBe('3.333″ (~ 3 5/16″)');
    expect(fmtLen(2 / 3, 'in')).toBe('0.667″ (~ 11/16″)');
    expect(fmtFabric(49.5, 'in')).toBe('1⅜ yd');
    expect(roundUp(3.854, 0.125)).toBe(3.875);
  });

  it('offsets outward by the seam allowance and matches shapes in any rotation', () => {
    const o = offset(sq(3), 0.25);
    expect(area(o)).toBeCloseTo(3.5 * 3.5);
    const tri: Pt[] = [
      [0, 0],
      [2, 0],
      [0, 2],
    ];
    const turned: Pt[] = tri.map(([x, y]) => [-y + 5, x + 1]);
    const mirrored: Pt[] = tri.map(([x, y]) => [-x, y]);
    expect(shapeKey(turned)).toBe(shapeKey(tri));
    expect(shapeKey(sq(2))).not.toBe(shapeKey(tri));
    expect(shapeKey(mirrored)).toBe(shapeKey(tri)); // a right isosceles triangle is its own mirror
    expect(
      simplify([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 2],
        [0, 2],
      ]),
    ).toHaveLength(4);
    // Trimmed points: the two 45° tips are cut off; the square corner stays.
    const trimmed = offset(tri, 0.25, true);
    expect(trimmed).toHaveLength(5);
    expect(area(trimmed)).toBeLessThan(area(offset(tri, 0.25)));
    expect(area(offset(sq(3), 0.25, true))).toBeCloseTo(3.5 * 3.5); // nothing sharp to trim
  });

  it('finds room for labels inside a piece', () => {
    expect(roomiest(sq(4)).r).toBeCloseTo(2, 1);
    // A triangle's roomiest spot is its incenter, not its bounding-box middle.
    const { p, r } = roomiest([
      [0, 0],
      [6, 0],
      [3, 3],
    ]);
    expect(r).toBeCloseTo(3 * (Math.SQRT2 - 1), 1);
    expect(p[1]).toBeCloseTo(r, 1);
  });

  it('marks the middle of curved edges, pointing out of the piece', () => {
    const path = builtinItems().blocks.find((b) => b.id === 'rrquilts.drunkard-s-path')!;
    const marks = blockPieces(path, [10, 10]).flatMap((p) => p.marks);
    expect(marks).toHaveLength(2); // the arc, seen from each side
    expect(marks[0]!.n[0] * marks[1]!.n[0] + marks[0]!.n[1] * marks[1]!.n[1]).toBeCloseTo(-1);
  });
});

describe('rotary cutting', () => {
  it('matches standard charts', () => {
    expect(cutFor(piece(sq(3)), 0.25, 0.125)).toMatchObject({ kind: 'square', cut: [3.5, 3.5] });
    const hst: Pt[] = [
      [0, 0],
      [3, 0],
      [0, 3],
    ];
    expect(cutFor(piece(hst), 0.25, 0.125)).toMatchObject({
      kind: 'hst',
      cut: [3.875, 3.875],
      yields: 2,
    });
    const qst: Pt[] = [
      [0, 0],
      [6, 0],
      [3, 3],
    ];
    expect(cutFor(piece(qst), 0.25, 0.125)).toMatchObject({
      kind: 'qst',
      cut: [7.25, 7.25],
      yields: 4,
    });
    expect(cutFor(piece(sq(10 / 3)), 0.25, 0.125).distorted).toBe(true);
    expect(cutFor({ ...piece(sq(3)), curved: true }, 0.25, 0.125).kind).toBe('template');
  });

  it('mitered border sides: trapezoids cut from strips with 45° ends', () => {
    const side: Pt[] = [
      [0, 0],
      [60, 0],
      [57, 3],
      [3, 3],
    ];
    // Long edge + 2·¼″·(1 + √2) = 61.207 → 61¼″.
    expect(cutFor(piece(side), 0.25, 0.125)).toMatchObject({
      kind: 'miter',
      finished: [60, 3],
      cut: [61.25, 3.5],
    });
    expect(cutFor(piece(side), 0.25, 0.125, 2).cut).toEqual([63.25, 3.5]);
    // One 45° end only: not a miter.
    const half: Pt[] = [
      [0, 0],
      [60, 0],
      [60, 3],
      [3, 3],
    ];
    expect(cutFor(piece(half), 0.25, 0.125).kind).toBe('template');

    const doc = ensurePlainBlock(structuredClone(fixture()));
    const q = structuredClone(doc.project.quilts[0]!);
    q.borders = [{ style: 'mitered', sides: [3, 3, 3, 3] }];
    const ids = generateSlots(q.layout, q.borders).slots.map((s) => s.id);
    const quilt = ensureSlotContent(q, ids);
    const border = quiltPieces(doc, quilt).filter((p) => p.poly.length === 4);
    expect(border.filter((p) => cutFor(p, 0.25, 0.125).kind === 'miter')).toHaveLength(4);
  });

  it('Ohio Star: 4 squares + center, 8 QSTs; strips across the fabric', () => {
    const lines = cutPlan(blockPieces(star(), [9, 9], star().colorings[0]), 0.25, 0.125, 40);
    const kinds = lines.map((l) => `${l.cut.kind}:${l.count}`).sort();
    expect(kinds).toEqual(['qst:8', 'qst:8', 'square:1', 'square:4'].sort());
    const corners = lines.find((l) => l.cut.kind === 'square' && l.count === 4)!;
    expect(corners).toMatchObject({ stripWidth: 3.5, perStrip: 11, strips: 1 });
    const t = templates(blockPieces(star(), [9, 9]));
    expect(t.map((x) => [x.letter, [...x.counts.values()][0]])).toEqual([
      ['A', 5],
      ['B', 16],
    ]);
    expect(templates(blockPieces(star(), [9, 9]), '2').map((x) => x.letter)).toEqual(['2A', '2B']);
  });
});

describe('page splitting', () => {
  it('fills pages, repeats table headings, gives oversize items their own page', () => {
    const items = [
      { key: 'cap', cost: 0.2 },
      { key: 't>', cost: 0.1 },
      ...[1, 2, 3, 4, 5].map((i) => ({ key: `t>${i}`, cost: 0.2 })),
      { key: 'big', cost: 1.5 },
      { key: 'end', cost: 0.1 },
    ];
    expect(splitFlow(items)).toEqual([
      ['cap', 't>', 't>1', 't>2', 't>3'],
      ['t>', 't>4', 't>5'],
      ['big'],
      ['end'],
    ]);
  });
});

describe('yardage', () => {
  it('never under-estimates and rounds up', () => {
    const lines = cutPlan([piece(sq(3)), piece(sq(3))], 0.25, 0.125, 40);
    expect(fabricNeeds(lines, { usable: 40 }, 4.5)).toEqual([{ fill: 'color:a', length: 4.5 }]);
    const fq = fabricNeeds(lines, { usable: 20, fatQuarter: { depth: 18 } }, 4.5);
    expect(fq[0]!.fatQuarters).toBe(1);
    // 60×80 quilt + 4" each side: 68 wide → 2 panels of 88" (176") beats 3 panels of 68" (204").
    expect(backing(60, 80, 4, 40, 4.5)).toBe(180);
    expect(binding(280, 2.5, 10, 40, 4.5)).toEqual({ strips: 8, length: 22.5 });
  });

  it('packs pieces on pages and tiles big ones', () => {
    const { pages, oversize } = pack(
      [
        { w: 4, h: 4 },
        { w: 4, h: 4 },
        { w: 9, h: 2 },
        { w: 20, h: 20 },
      ],
      7.5,
      9,
      0.25,
    );
    expect(oversize).toEqual([3]);
    expect(pages.flat()).toHaveLength(3);
    expect(pages[0]!.find((p) => p.index === 2)!.turned).toBe(true); // 9 wide only fits turned
    expect(tiles(20, 20, 7.5, 9, 0.5)).toMatchObject({ cols: 3, rows: 3 });
  });
});
