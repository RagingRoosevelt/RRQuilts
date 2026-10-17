// Slots: the spaces of a quilt layout that blocks are set into. Generated deterministically from
// the stored layout/border parameters; ids are derived from position (contracts/slot-ids.md).
// Coordinates are quilt units with the origin at the top-left of the quilt center (borders are
// at negative coordinates / beyond the center size).
import { produce } from 'immer';
import type { PathCommand } from '../schema/shared';
import type { Border, Layout, Quilt, SlotContent } from '../schema/quilt';
import { borderSlots } from './borders';
import { layoutDefaults, onPointDefaults, stripDefaults } from '../io';
import { PLAIN_BLOCK } from '../plain';
import { flattenLoop, pathToSegs, signedArea, type Pt } from '../geometry/path';
import { toPath } from './clip';
import { tile } from './engine';
import { horizontal, onePatch, onPoint, strips, tumbling, variablePoint } from './presets';

export type SlotKind = 'block' | 'sash' | 'cs' | 'set' | 'border' | 'strip' | 'patch';
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

export function generateSlots(
  layout: Layout,
  borders: Border[],
  /** On-Point: edge positions holding blocks (`edgeBlocks`); they move that side's edge in. */
  held?: ReadonlyMap<string, string>,
): Generated {
  const unsupported: string[] = [];
  let slots: Slot[] = [];
  let center: Bounds = [0, 0, 0, 0];
  let trim = false;
  if (layout.style === 'straight-set') {
    const h = horizontal(layout);
    slots = tile(h.tiling);
    center = h.center;
  } else if (layout.style === 'horizontal-strip' || layout.style === 'vertical-strip') {
    const t = strips(layout);
    slots = tile(t.tiling);
    center = t.center;
  } else if (layout.style === 'on-point') {
    const o = onPoint(layout, held);
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
  } else if (layout.style === 'variable-point') {
    const o = variablePoint(layout);
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
  } else if (
    layout.style === 'one-patch' ||
    layout.style === 'baby-blocks' ||
    layout.style === 'variable-blocks'
  ) {
    const t = layout.style === 'one-patch' ? onePatch(layout) : tumbling(layout);
    slots = tile(t.tiling);
    if (!t.center) {
      // No fill: whole patches; their outline is the quilt's edge and borders are set aside.
      const box = boundsOf(slots);
      return {
        slots,
        center: box,
        bounds: box,
        unsupported,
        edge: outerEdge(slots, box),
        trim: false,
      };
    }
    center = t.center;
    trim = true;
  } else unsupported.push(`layout ${layout.style}`);

  const b = borderSlots(
    borders,
    center,
    layout.style === 'straight-set' ? [layout.cols, layout.rows] : undefined,
  );
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

/** On-Point edge positions (setting pieces) holding a block: position → the id it's under. */
export function edgeBlocks(quilt: Quilt): Map<string, string> {
  const out = new Map<string, string>();
  for (const [id, c] of Object.entries(quilt.layers[0].slots)) {
    const at = /^set:(m:r\d+c\d+)(?::[12])?$/.exec(id)?.[1];
    if (at && c.block !== PLAIN_BLOCK && !out.has(at)) out.set(at, id);
  }
  return out;
}

/** The quilt's spaces, given what's placed in it. */
export const generateFor = (quilt: Quilt) =>
  generateSlots(quilt.layout, quilt.borders, edgeBlocks(quilt));

export interface Reconciled {
  slots: Record<string, SlotContent>;
  /** Slot ids whose content would be lost (warn before applying, FR-057). */
  dropped: string[];
}

/** Which placed content survives a layout/border change. */
export function reconcile(quilt: Quilt, layout: Layout, borders: Border[]): Reconciled {
  const ids = new Set(generateSlots(layout, borders, edgeBlocks(quilt)).slots.map((s) => s.id));
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
export type LayoutStyle =
  | 'straight-set'
  | 'on-point'
  | 'horizontal-strip'
  | 'vertical-strip'
  | 'variable-point'
  | 'one-patch'
  | 'baby-blocks'
  | 'variable-blocks';

/** The layout in another style: counts, block size, and sashing carry over between Horizontal and
 *  On-Point (spec 016 US4); strips keep everything when only their direction changes. */
export function convertLayout(layout: Layout, style: LayoutStyle, units: 'in' | 'cm'): Layout {
  if (layout.style === style) return layout;
  const k = units === 'cm' ? 2.5 : 1;
  if (style === 'horizontal-strip' || style === 'vertical-strip')
    return 'strips' in layout ? { ...layout, style } : { ...stripDefaults(k), style };
  // On-Point and Variable Point keep counts, sashing, corners, and edge (a square on point is
  // `block`·√2 across and as tall).
  if (style === 'variable-point' && layout.style === 'on-point') {
    const d = layout.block * Math.SQRT2;
    const { cols, rows, sash, corner, edge } = layout;
    return { style, cols, rows, sash, corner, edge, width: d, height: d };
  }
  if (style === 'on-point' && layout.style === 'variable-point') {
    const { cols, rows, sash, corner, edge, width } = layout;
    return { style, cols, rows, sash, corner, edge, block: width * Math.SQRT1_2 };
  }
  // Baby Blocks and Variable Blocks keep counts and sizes.
  if (
    (style === 'baby-blocks' || style === 'variable-blocks') &&
    (layout.style === 'baby-blocks' || layout.style === 'variable-blocks')
  )
    return { ...layout, style };
  const fresh = layoutDefaults(style, k);
  if (fresh) return fresh;
  if (style === 'on-point') {
    const d = onPointDefaults(k);
    return layout.style === 'straight-set'
      ? { ...d, cols: layout.cols, rows: layout.rows, block: layout.block[0], sash: layout.sash[0] }
      : d;
  }
  if (layout.style === 'on-point')
    return {
      style: 'straight-set',
      cols: layout.cols,
      rows: layout.rows,
      block: [layout.block, layout.block],
      sash: [layout.sash, layout.sash],
      sashBorder: false,
    };
  return {
    style: 'straight-set',
    cols: 3,
    rows: 3,
    block: [12 * k, 12 * k],
    sash: [0, 0],
    sashBorder: false,
  };
}

const pointsOf = (s: Slot) => flattenLoop(pathToSegs(s.outline, [1, 1]), 1e-3);

function boundsOf(slots: Slot[]): Bounds {
  const pts = slots.flatMap(pointsOf);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/**
 * The outline around straight-edged patches (edges shared by two patches cancel out); the bounding
 * rectangle when any patch is curved. ponytail: one outer loop, the longest.
 */
function outerEdge(slots: Slot[], box: Bounds): PathCommand[] {
  const [x0, y0, x1, y1] = box;
  if (slots.some((s) => s.outline.some((c) => c[0] === 'A' || c[0] === 'C')))
    return rectPath(x0, y0, x1 - x0, y1 - y0);
  const key = (p: readonly number[]) => `${p[0]!.toFixed(5)},${p[1]!.toFixed(5)}`;
  // Every outline turned the same way round, so a shared side runs opposite ways and cancels.
  const polys = slots.map((s) => {
    const pts = s.outline.flatMap((c): Pt[] =>
      c[0] === 'M' || c[0] === 'L' ? [[c[1], c[2]]] : [],
    );
    return signedArea(pts) < 0 ? pts.reverse() : pts;
  });
  const eps = 1e-6 * Math.max(x1 - x0, y1 - y0, 1);
  // Corners bucketed on a grid about one patch wide, so each side only checks nearby corners.
  const cell = Math.max(
    eps,
    polys.reduce((m, p) => {
      const xs = p.map((q) => q[0]);
      return Math.max(m, Math.max(...xs) - Math.min(...xs));
    }, 0),
  );
  const grid = new Map<string, Pt[]>();
  const at = (x: number, y: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  for (const p of polys.flat()) {
    const k = at(p[0], p[1]);
    grid.set(k, [...(grid.get(k) ?? []), p]);
  }
  const near = (a: Pt, b: Pt) => {
    const out: Pt[] = [];
    const [gx0, gx1] = [
      Math.floor(Math.min(a[0], b[0]) / cell),
      Math.floor(Math.max(a[0], b[0]) / cell),
    ];
    const [gy0, gy1] = [
      Math.floor(Math.min(a[1], b[1]) / cell),
      Math.floor(Math.max(a[1], b[1]) / cell),
    ];
    for (let gx = gx0; gx <= gx1; gx++)
      for (let gy = gy0; gy <= gy1; gy++) out.push(...(grid.get(`${gx},${gy}`) ?? []));
    return out;
  };
  const edges = new Map<string, [Pt, Pt]>();
  for (const pts of polys)
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length]!;
      // Split the side at every patch corner lying on it, so partly shared sides cancel too.
      const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
      const cuts = near(a, b)
        .map((p) => ({
          p,
          t: ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / L2,
        }))
        .filter(
          ({ p, t }) =>
            t > 1e-9 &&
            t < 1 - 1e-9 &&
            Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) /
              Math.sqrt(L2) <
              eps,
        )
        .sort((u, v) => u.t - v.t)
        .map((c) => c.p);
      const run = [a, ...cuts, b];
      for (let k = 0; k + 1 < run.length; k++) {
        const [u, v] = [run[k]!, run[k + 1]!];
        if (key(u) === key(v)) continue;
        const back = `${key(v)}>${key(u)}`;
        if (edges.has(back)) edges.delete(back);
        else edges.set(`${key(u)}>${key(v)}`, [u, v]);
      }
    });
  const next = new Map([...edges.values()].map(([a, b]) => [key(a), b]));
  let best: Pt[] = [];
  const seen = new Set<string>();
  for (const [a] of edges.values()) {
    if (seen.has(key(a))) continue;
    const loop: Pt[] = [a];
    seen.add(key(a));
    for (let p = next.get(key(a)); p && !seen.has(key(p)); p = next.get(key(p))) {
      loop.push(p);
      seen.add(key(p));
    }
    if (loop.length > best.length) best = loop;
  }
  return best.length >= 3 ? toPath(best) : rectPath(x0, y0, x1 - x0, y1 - y0);
}
