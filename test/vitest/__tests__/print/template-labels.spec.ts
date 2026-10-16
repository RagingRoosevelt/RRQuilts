import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TemplatePiece from '@/components/TemplatePiece.vue';
import type { Pt } from '@/model/geometry/path';
import type { PlacedPiece } from '@/model/print/pieces';

const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const look = {
  stroke: 0.01,
  font: 0.16,
  cutLine: 'solid',
  sewLine: 'dashed',
  grain: true,
  shade: false,
  marks: false,
  markLength: 0.1,
  labels: { letter: true, counts: true, size: true, color: true },
  tint: false,
};
/** A finished `w` × `h` rectangle with a ¼″ seam allowance, labelled at its middle. */
const piece = (w: number, h: number): PlacedPiece => ({
  key: 'A',
  letter: 'A',
  cut: rect(0, 0, w + 0.5, h + 0.5),
  sew: rect(0.25, 0.25, w + 0.25, h + 0.25),
  center: [w / 2 + 0.25, h / 2 + 0.25],
  room: Math.min(w, h) / 2,
  grain: [1, 0],
  grainLength: Math.min(w, h) * 0.5,
  note: 'Cut 24',
  size: `${w}″ × ${h}″`,
  marks: [],
  fabrics: [],
  x: 0,
  y: 0,
  w: w + 0.5,
});
const labels = (p: PlacedPiece) =>
  mount(TemplatePiece, { props: { piece: p, look } })
    .findAll('text')
    .filter((t) => ['A', 'Finished', 'Cut'].some((s) => t.text().startsWith(s)))
    .map((t) => ({
      text: t.text(),
      x: Number(t.attributes('x')),
      y: Number(t.attributes('y')),
      size: Number(t.attributes('font-size')),
      anchor: t.attributes('text-anchor'),
      up: !!t.attributes('transform'),
    }));

describe('template labels', () => {
  it('stack on roomy pieces', () => {
    const l = labels(piece(4, 4));
    expect(l.map((x) => x.anchor)).toEqual(['middle', 'middle', 'middle']);
    expect(new Set(l.map((x) => x.x)).size).toBe(1);
  });

  it('lie in a row on long low pieces: letter left, size middle, count right', () => {
    const l = labels(piece(4, 0.5));
    expect(l.map((x) => x.text)).toEqual(['A', 'Finished 4″ × 0.5″', 'Cut 24']);
    expect(l.map((x) => x.anchor)).toEqual(['start', 'middle', 'end']);
    expect(new Set(l.map((x) => x.y)).size).toBe(1);
    expect(l[0]!.x).toBeLessThan(l[1]!.x);
    expect(l[1]!.x).toBeLessThan(l[2]!.x);
    // Bigger than a stack could be, and inside the cutting line (seam allowance allowed).
    expect(l[1]!.size).toBeGreaterThan(0.16 * 0.9 * 0.5);
    expect(l[0]!.x).toBeGreaterThanOrEqual(0);
    expect(l[2]!.x).toBeLessThanOrEqual(4.5);
  });

  it('read upward on tall thin pieces', () => {
    const l = labels(piece(0.5, 4));
    expect(l.every((x) => x.up)).toBe(true);
    expect(new Set(l.map((x) => x.x)).size).toBe(1);
    expect(l[0]!.y).toBeGreaterThan(l[2]!.y); // starts at the bottom
  });
});
