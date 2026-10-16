// Small helpers shared by layout tests.
import { flattenLoop, pathToSegs, signedArea } from '@/model/geometry/path';
import { generateSlots, type Slot } from '@/model/layout/slots';
import type { Border, Layout, Quilt } from '@/model/schema/quilt';
import { fixture } from './helpers';

/** A quilt with the given layout and borders and no placed blocks. */
export const quiltWith = (layout: Layout, borders: Border[]): Quilt => {
  const q = structuredClone(fixture().project.quilts[0]!);
  q.layout = layout;
  q.borders = borders;
  q.layers[0].slots = {};
  return q;
};

/** Generated slots as plain JSON (for snapshots and oracle comparison). */
export const slotsJson = (layout: Layout, borders: Border[]) =>
  JSON.parse(JSON.stringify(generateSlots(layout, borders)));

/** Area of a slot's visible outline, in square quilt units. */
export const slotArea = (slot: Slot) =>
  Math.abs(signedArea(flattenLoop(pathToSegs(slot.outline, [1, 1]), 1e-4)));
