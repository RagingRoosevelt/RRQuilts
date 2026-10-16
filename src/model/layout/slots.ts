// Slots: the spaces of a quilt layout that blocks are set into. Generated deterministically from
// the stored layout/border parameters; ids are derived from position (contracts/slot-ids.md).
// Coordinates are quilt units with the origin at the top-left of the quilt center (borders are
// at negative coordinates / beyond the center size).
import { produce } from 'immer';
import type { PathCommand } from '../schema/shared';
import type { Border, Layout, Quilt, SlotContent } from '../schema/quilt';
import { borderSlots } from './borders';
import { onPointDefaults } from '../io';
import { PLAIN_BLOCK } from '../plain';
import { tile } from './engine';
import { horizontal, onPoint } from './presets';

export type SlotKind = 'block' | 'sash' | 'cs' | 'set' | 'border';
/** `piece` = setting, partial, or irregular space: plain fill only. */
export type SpaceShape =
  'rect' | 'triangle' | 'diamond60' | 'hexagon' | 'clamshell' | 'spool' | 'piece';

export interface Slot {
  id: string;
  kind: SlotKind;
  shape: SpaceShape;
  /** Degrees between allowed block turns (90 square, 180 rectangle, 360 none). */
  turns: number;
  /** Alternate-scope class (checkerboard: 0/1). */
  alt: number;
  /** Visible outline in quilt units (lines and arcs); block content is clipped to it. */
  outline: PathCommand[];
  /** Affine map [a, b, c, d, e, f] from the block's unit square to quilt units (SVG order). The
   *  whole space, even when `outline` is trimmed. */
  transform: [number, number, number, number, number, number];
  /** Finished size of the whole space, in its own axes. */
  size: [number, number];
  /** Shape to cut when larger than `outline` (floating setting pieces). */
  cut?: PathCommand[];
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
  /** The quilt's outer edge (binding runs along it). */
  edge: PathCommand[];
  /** Pieces are cut larger than the edge (trim the quilt top after piecing). */
  trim: boolean;
}

/** Checkerboard class from the numbers in an id (rows + cols, sash indices, …). */
export const digitParity = (id: string) =>
  (id.match(/\d+/g) ?? []).reduce((s, n) => s + Number(n), 0) % 2;

export const rectPath = (x: number, y: number, w: number, h: number): PathCommand[] => [
  ['M', x, y],
  ['L', x + w, y],
  ['L', x + w, y + h],
  ['L', x, y + h],
  ['Z'],
];

const kindOf = (id: string): SlotKind =>
  id.startsWith('b:')
    ? 'block'
    : id.startsWith('sash:')
      ? 'sash'
      : id.startsWith('cs:')
        ? 'cs'
        : id.startsWith('set:')
          ? 'set'
          : 'border';

export const rectSlot = (id: string, x: number, y: number, w: number, h: number): Slot => ({
  id,
  kind: kindOf(id),
  shape: 'rect',
  turns: w === h ? 90 : 180,
  alt: digitParity(id),
  outline: rectPath(x, y, w, h),
  transform: [w, 0, 0, h, x, y],
  size: [w, h],
});

/** A plain piece with a polygon outline; the block square maps to its bounding box. */
export function polySlot(id: string, pts: [number, number][]): Slot {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const [w, h] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
  const outline: PathCommand[] = [
    ['M', ...pts[0]!],
    ...pts.slice(1).map((p): PathCommand => ['L', ...p]),
    ['Z'],
  ];
  return {
    id,
    kind: kindOf(id),
    shape: 'piece',
    turns: 360,
    alt: digitParity(id),
    outline,
    transform: [w, 0, 0, h, x0, y0],
    size: [w, h],
  };
}

export function generateSlots(layout: Layout, borders: Border[]): Generated {
  const unsupported: string[] = [];
  let slots: Slot[] = [];
  let center: Bounds = [0, 0, 0, 0];
  let trim = false;
  if (layout.style === 'horizontal') {
    const h = horizontal(layout);
    slots = tile(h.tiling);
    center = h.center;
  } else if (layout.style === 'on-point') {
    const o = onPoint(layout);
    // No fill: the uneven edge is the quilt's edge, so borders are set aside (kept in the file).
    if (layout.edge.finish === 'none')
      return {
        slots: o.slots,
        center: o.center,
        bounds: o.center,
        unsupported,
        edge: o.edge,
        trim: false,
      };
    ({ slots, center, trim } = o);
  } else unsupported.push(`layout ${layout.style}`);

  const b = borderSlots(borders, center);
  unsupported.push(...b.unsupported);
  const [x0, y0, x1, y1] = b.bounds;
  return {
    slots: [...slots, ...b.slots],
    center,
    bounds: b.bounds,
    unsupported,
    edge: rectPath(x0, y0, x1 - x0, y1 - y0),
    trim,
  };
}

export interface Reconciled {
  slots: Record<string, SlotContent>;
  /** Slot ids whose content would be lost (warn before applying, FR-057). */
  dropped: string[];
}

/** Which placed content survives a layout/border change. */
export function reconcile(quilt: Quilt, layout: Layout, borders: Border[]): Reconciled {
  const ids = new Set(generateSlots(layout, borders).slots.map((s) => s.id));
  // Borders set aside by No fill keep their pieces' colors for when they come back.
  const setAside = layout.style === 'on-point' && layout.edge.finish === 'none';
  const slots: Record<string, SlotContent> = {};
  const dropped: string[] = [];
  for (const [id, content] of Object.entries(quilt.layers[0].slots)) {
    if (ids.has(id) || (setAside && id.startsWith('border:'))) slots[id] = content;
    else {
      // An edge position is a setting piece or a trimmed block depending on the finish: a block
      // set there moves with it (a seam corner's first half stands for the whole corner).
      const pos = /^(?:set|b):(m:r\d+c\d+)(?::1)?$/.exec(id)?.[1];
      const twin =
        pos &&
        content.block !== PLAIN_BLOCK &&
        [`b:${pos}`, `set:${pos}`, `set:${pos}:1`].find((t) => ids.has(t));
      if (twin && !quilt.layers[0].slots[twin]) slots[twin] = content;
      else dropped.push(id);
    }
  }
  return { slots, dropped };
}

/** Apply a new layout/borders, keeping content in slots that still exist. Returns a copy. */
export function applyLayout(quilt: Quilt, layout: Layout, borders: Border[]): Quilt {
  const { slots } = reconcile(quilt, layout, borders);
  return produce(quilt, (q) => {
    q.layout = layout;
    q.borders = borders;
    q.layers[0].slots = slots;
  });
}

/** The layout in another style, keeping counts, block size, and sashing (spec 016 US4). */
export function convertLayout(
  layout: Layout,
  style: 'horizontal' | 'on-point',
  units: 'in' | 'cm',
): Layout {
  if (layout.style === style) return layout;
  if (style === 'on-point') {
    const d = onPointDefaults(units === 'cm' ? 2.5 : 1);
    return layout.style === 'horizontal'
      ? { ...d, cols: layout.cols, rows: layout.rows, block: layout.block[0], sash: layout.sash[0] }
      : d;
  }
  if (layout.style === 'on-point')
    return {
      style: 'horizontal',
      cols: layout.cols,
      rows: layout.rows,
      block: [layout.block, layout.block],
      sash: [layout.sash, layout.sash],
      sashBorder: false,
    };
  const k = units === 'cm' ? 2.5 : 1;
  return {
    style: 'horizontal',
    cols: 3,
    rows: 3,
    block: [12 * k, 12 * k],
    sash: [0, 0],
    sashBorder: false,
  };
}
