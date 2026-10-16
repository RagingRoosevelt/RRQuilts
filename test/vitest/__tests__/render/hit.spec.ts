import { describe, expect, it } from 'vitest';
import { addStarterContent } from '@/content/starter';
import { generateSlots, type Generated, type Slot } from '@/model/layout/slots';
import { createProject } from '@/model/new-project';
import type { Quilt } from '@/model/schema/quilt';
import { apply, invert, mul, orient } from '@/render/affine';
import { blockPolygons, hitTest } from '@/render/hit';
import { pointInPolygon } from '@/model/geometry/path';

describe('affine helpers', () => {
  it('rotates clockwise on screen and flips left-right in the unit square', () => {
    expect(apply(orient(90, false), [0, 0])).toEqual([1, 0]); // top-left → top-right
    expect(apply(orient(180, false), [0, 0])).toEqual([1, 1]);
    expect(apply(orient(0, true), [0, 0.3])).toEqual([1, 0.3]);
    const m = mul(orient(270, true), [2, 0, 0, 3, 5, 7]);
    const p = apply(invert(m), apply(m, [0.25, 0.75]));
    expect(p[0]).toBeCloseTo(0.25);
    expect(p[1]).toBeCloseTo(0.75);
  });
});

describe('hit-testing', () => {
  const doc = addStarterContent(createProject());
  const hst = doc.project.blocks.find((b) => b.notecard.name === 'Half-Square Triangle')!;
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const quilt = (rotation: 0 | 90): Quilt => ({
    id: 'q',
    notecard: { name: 'q' },
    layout: {
      style: 'straight-set',
      cols: 2,
      rows: 1,
      block: [10, 10],
      sash: [2, 0],
      sashBorder: false,
    },
    borders: [{ style: 'long-horizontal', sides: [1, 1, 1, 1] }],
    colorings: { k: { fills: {} } },
    layers: [
      {
        visible: true,
        slots: { 'b:r1c2': { block: hst.id, coloring: 'k', rotation, flip: false } },
        items: [],
      },
      { visible: true, items: [] },
      { visible: true, items: [] },
    ],
  });
  const patchContaining = (n: [number, number]) =>
    blockPolygons(hst).find((p) => pointInPolygon(n, p.poly))!.id;

  it('finds empty spaces, sashes, and borders', () => {
    const q = quilt(0);
    const g = generateSlots(q.layout, q.borders);
    expect(hitTest(blocks, q, g, [5, 5])).toEqual({ slotId: 'b:r1c1' });
    expect(hitTest(blocks, q, g, [11, 5])).toEqual({ slotId: 'sash:v:r1c1' });
    expect(hitTest(blocks, q, g, [5, -0.5])).toEqual({ slotId: 'border:1:top' });
    expect(hitTest(blocks, q, g, [100, 100])).toBeNull();
  });

  it('maps a point to the right patch through the placement, including rotation', () => {
    // Second block starts at x = 12. Point near its top-right corner.
    const q0 = quilt(0);
    const g = generateSlots(q0.layout, q0.borders);
    expect(hitTest(blocks, q0, g, [21, 1])?.patchId).toBe(patchContaining([0.9, 0.1]));
    // Rotated 90° clockwise: the top-right of the space shows the block's top-left.
    expect(hitTest(blocks, quilt(90), g, [21, 1])?.patchId).toBe(patchContaining([0.1, 0.1]));
  });
});

describe('hit-testing curved outlines', () => {
  // Unit square whose right edge bulges out as a half-circle (clockwise on screen: negative sweep).
  const slot: Slot = {
    id: 'b:r1c1',
    kind: 'block',
    shape: 'piece',
    turns: 360,
    alt: 0,
    outline: [['M', 0, 0], ['L', 1, 0], ['A', 1, 1, -180], ['L', 0, 1], ['Z']],
    transform: [1, 0, 0, 1, 0, 0],
    size: [1, 1],
  };
  const g: Generated = {
    slots: [slot],
    center: [0, 0, 1, 1],
    bounds: [0, 0, 1.5, 1],
    unsupported: [],
    edge: slot.outline,
    trim: false,
  };
  const q = { layers: [{ slots: {} }] } as unknown as Quilt;

  it('hits inside the bulge and misses outside it', () => {
    expect(hitTest(new Map(), q, g, [1.3, 0.5])).toEqual({ slotId: 'b:r1c1' });
    expect(hitTest(new Map(), q, g, [1.3, 0.05])).toBeNull();
    expect(hitTest(new Map(), q, g, [0.5, 0.5])).toEqual({ slotId: 'b:r1c1' });
  });
});
