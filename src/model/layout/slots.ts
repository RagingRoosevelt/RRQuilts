// Slots: the spaces of a quilt layout that blocks are set into. Generated deterministically from
// the stored layout/border parameters; ids are derived from position (contracts/slot-ids.md).
// Coordinates are quilt units with the origin at the top-left of the quilt center (borders are
// at negative coordinates / beyond the center size).
import type { PathCommand } from '../schema/shared';
import type { Border, Layout, Quilt, SlotContent } from '../schema/quilt';
import { borderSlots } from './borders';
import { horizontalSlots } from './horizontal';

export interface Slot {
  id: string;
  /** Closed outline in quilt units; block content is clipped to it. */
  outline: PathCommand[];
  /** Affine map [a, b, c, d, e, f] from the block's unit square to quilt units (SVG order). */
  transform: [number, number, number, number, number, number];
}

export type Bounds = [x0: number, y0: number, x1: number, y1: number];

export interface Generated {
  slots: Slot[];
  /** Quilt center (without borders). */
  center: Bounds;
  /** Whole quilt including borders. */
  bounds: Bounds;
  /** Styles stored in the file whose generators aren't available yet. */
  unsupported: string[];
}

export const rectSlot = (id: string, x: number, y: number, w: number, h: number): Slot => ({
  id,
  outline: [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']],
  transform: [w, 0, 0, h, x, y],
});

export function generateSlots(layout: Layout, borders: Border[]): Generated {
  const unsupported: string[] = [];
  let slots: Slot[] = [];
  let center: Bounds = [0, 0, 0, 0];
  if (layout.style === 'horizontal') ({ slots, center } = horizontalSlots(layout));
  else unsupported.push(`layout ${layout.style}`);

  const b = borderSlots(borders, center);
  unsupported.push(...b.unsupported);
  return { slots: [...slots, ...b.slots], center, bounds: b.bounds, unsupported };
}

export interface Reconciled {
  slots: Record<string, SlotContent>;
  /** Slot ids whose content would be lost (warn before applying, FR-057). */
  dropped: string[];
}

/** Which placed content survives a layout/border change. */
export function reconcile(quilt: Quilt, layout: Layout, borders: Border[]): Reconciled {
  const ids = new Set(generateSlots(layout, borders).slots.map((s) => s.id));
  const slots: Record<string, SlotContent> = {};
  const dropped: string[] = [];
  for (const [id, content] of Object.entries(quilt.layers[0].slots)) {
    if (ids.has(id)) slots[id] = content;
    else dropped.push(id);
  }
  return { slots, dropped };
}

/** Apply a new layout/borders, keeping content in slots that still exist. Returns a copy. */
export function applyLayout(quilt: Quilt, layout: Layout, borders: Border[]): Quilt {
  const q = structuredClone(quilt);
  q.layout = structuredClone(layout);
  q.borders = structuredClone(borders);
  q.layers[0].slots = reconcile(quilt, layout, borders).slots;
  return q;
}
