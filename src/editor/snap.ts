// Snapping for the block editor (design space: normalized × block size).
// Priority: existing nodes → points on seams (incl. the outline) → lining up with nodes → snap-grid
// points. Which targets pull, and how far, are the quilter's settings (spec 031); the grid itself is
// the block's.
import { project } from '@/model/geometry/intersect';
import { dist, pointAt, type Pt, type Seg } from '@/model/geometry/path';
import { lattice, SHAPE_OUTLINE, type BlockShape } from '@/model/blocks/shape';
import type { Drawing } from '@/model/schema/block';
import { segGeom, type Endpoint, type Size } from './draw-ops';

export interface SnapSettings {
  mode: 'step' | 'divisions';
  /** Grid step in project units (mode "step"). */
  step: number;
  /** Columns × rows (mode "divisions"). */
  divisions: [number, number];
  /** Shaped blocks (spec 026): triangle grid steps per side (step and divisions don't apply). */
  perSide: number;
}

export const defaultSnap = (units: 'in' | 'cm', shape?: BlockShape): SnapSettings => ({
  mode: 'step',
  step: units === 'cm' ? 0.5 : 0.25,
  divisions: [3, 3],
  perSide: shape === 'hexagon' ? 2 : 4,
});

/** The grid part of a block's saved snap settings (older blocks also saved on/off toggles, which
 *  the quilter's settings replace). */
export const snapGrid = (s: Partial<SnapSettings>, units: 'in' | 'cm', shape?: BlockShape) => {
  const d = defaultSnap(units, shape);
  return {
    mode: s.mode ?? d.mode,
    step: s.step ?? d.step,
    divisions: s.divisions ?? d.divisions,
    perSide: s.perSide ?? d.perSide,
  };
};

/** Snap targets (spec 031), each with its own pull. */
export type SnapTarget = 'nodes' | 'seams' | 'align' | 'grid';
export const SNAP_TARGETS: SnapTarget[] = ['nodes', 'seams', 'align', 'grid'];
export type Gravity = 'gentle' | 'normal' | 'strong';
/** How far each step pulls, in screen pixels (mouse and pen). */
export const GRAVITY_PX: Record<Gravity, number> = { gentle: 4, normal: 8, strong: 16 };
/** How far each target pulls, in design units; 0 = off. */
export type Reach = Record<SnapTarget, number>;
/** Every target but line up at `d` (line up off, as by default). */
export const reachOf = (d: number, align = 0): Reach => ({ nodes: d, seams: d, grid: d, align });

export interface Snapped {
  /** Design-space point. */
  p: Pt;
  endpoint: Endpoint;
  kind: 'node' | 'seam' | 'align' | 'grid' | 'free';
  /** Lined up: the corners it lines up with (for the guide lines). */
  to?: Pt[];
}

/** Grid spacing in design units for each axis. */
export const gridSpacing = (s: SnapSettings, size: Size): [number, number] =>
  s.mode === 'step' ? [s.step, s.step] : [size[0] / s.divisions[0], size[1] / s.divisions[1]];

/** `reach` is in design units (screen distance ÷ zoom). `from`: the start of the seam being drawn,
 *  a corner to line up with. */
export function snap(
  p: Pt,
  drawing: Drawing,
  size: Size,
  s: SnapSettings,
  reach: Reach,
  shape?: BlockShape,
  from?: Pt,
): Snapped {
  const norm = (q: Pt): Endpoint => ({ x: q[0] / size[0], y: q[1] / size[1] });
  const [w, h] = size;
  const corners: Pt[] = shape
    ? SHAPE_OUTLINE[shape].map(([x, y]): Pt => [x * w, y * h])
    : [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ];

  if (reach.nodes > 0) {
    let best: { id: string; q: Pt; d: number } | undefined;
    for (const n of drawing.nodes) {
      const q: Pt = [n.x * w, n.y * h];
      const d = dist(p, q);
      if (d <= reach.nodes && (!best || d < best.d)) best = { id: n.id, q, d };
    }
    // Block corners behave like nodes.
    for (const q of corners) {
      const d = dist(p, q);
      if (d <= reach.nodes && (!best || d < best.d)) best = { id: '', q, d };
    }
    if (best)
      return { p: best.q, endpoint: best.id ? { node: best.id } : norm(best.q), kind: 'node' };
  }

  // Grid point candidate.
  let grid: Pt | undefined;
  const [gx, gy] = gridSpacing(s, size);
  const lat = shape ? lattice(shape, size, s.perSide) : undefined;
  if (reach.grid > 0) {
    const q: Pt = lat
      ? lat.nearest(p)
      : [
          Math.min(w, Math.max(0, Math.round(p[0] / gx) * gx)),
          Math.min(h, Math.max(0, Math.round(p[1] / gy) * gy)),
        ];
    if (dist(p, q) <= reach.grid) grid = q;
  }

  // Seam candidate. Ending on a seam wins over a nearby grid point — unless that grid point is
  // itself on the seam (then use it: it's both exact and on the grid).
  if (reach.seams > 0) {
    const outline = corners.map((a, i): Seg => ({
      kind: 'line',
      a,
      b: corners[(i + 1) % corners.length]!,
    }));
    let best: { q: Pt; d: number; g: Seg } | undefined;
    for (const g of [...outline, ...drawing.segments.map((x) => segGeom(drawing, x, size))]) {
      const r = project(g, p);
      if (r.d <= reach.seams && (!best || r.d < best.d)) best = { q: pointAt(g, r.t), d: r.d, g };
    }
    if (best) {
      const onSeam = grid && project(best.g, grid).d <= 1e-6 * Math.max(w, h);
      if (onSeam) return { p: grid!, endpoint: norm(grid!), kind: 'grid' };
      return { p: best.q, endpoint: norm(best.q), kind: 'seam' };
    }
  }

  if (reach.align > 0) {
    const anchors = [...drawing.nodes.map((n): Pt => [n.x * w, n.y * h]), ...corners];
    // The same corners in block coordinates, so a lined-up point stores its corner's x or y exactly.
    const exact: Pt[] = [
      ...drawing.nodes.map((n): Pt => [n.x, n.y]),
      ...corners.map((c) => [c[0] / w, c[1] / h] as Pt),
    ];
    if (from) {
      anchors.push(from);
      exact.push([from[0] / w, from[1] / h]);
    }
    // The grid lines a lined-up point may also sit on: the triangle grid's, or the square grid's
    // columns and rows nearest the pointer.
    const gridLines = (): [Pt, Pt][] => {
      if (lat) return lat.lines();
      const [cx, cy] = [Math.round(p[0] / gx) * gx, Math.round(p[1] / gy) * gy];
      return [
        [
          [cx, 0],
          [cx, h],
        ],
        [
          [0, cy],
          [w, cy],
        ],
      ];
    };
    const r = lineUp(p, anchors, lat ? lat.axes : SQUARE_AXES, reach.align, reach.grid, gridLines);
    if (r) {
      const q = clampTo(r.q, w, h);
      const e = norm(q) as { x: number; y: number };
      for (const a of r.to) {
        const i = anchors.indexOf(a);
        if (Math.abs(a[0] - q[0]) < 1e-9) e.x = exact[i]![0];
        if (Math.abs(a[1] - q[1]) < 1e-9) e.y = exact[i]![1];
      }
      return { p: q, endpoint: e, kind: 'align', to: r.to };
    }
  }

  if (grid) return { p: grid, endpoint: norm(grid), kind: 'grid' };

  const q: Pt = [Math.min(w, Math.max(0, p[0])), Math.min(h, Math.max(0, p[1]))];
  return { p: q, endpoint: norm(q), kind: 'free' };
}

const clampTo = (p: Pt, w: number, h: number): Pt => [
  Math.min(w, Math.max(0, p[0])),
  Math.min(h, Math.max(0, p[1])),
];

const SQUARE_AXES: Pt[] = [
  [1, 0],
  [0, 1],
];

const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];

/** Where the lines through `a` along `u` and through `b` along `v` cross (none if parallel). */
function crossing(a: Pt, u: Pt, b: Pt, v: Pt): Pt | undefined {
  const den = cross(u, v);
  if (Math.abs(den) < 1e-9) return undefined;
  const t = cross(sub(b, a), v) / den;
  return [a[0] + u[0] * t, a[1] + u[1] * t];
}

/**
 * Line up (spec 031 User Story 5): for each axis (unit vectors), the nearest line through an anchor
 * along it within `reach`; two axes meet where their lines cross; one axis alone may then meet the
 * nearest grid line within `gridReach`. Ties go to the anchor nearest the pointer.
 */
export function lineUp(
  p: Pt,
  anchors: Pt[],
  axes: Pt[],
  reach: number,
  gridReach: number,
  gridLines: () => [Pt, Pt][],
): { q: Pt; to: Pt[] } | undefined {
  const found: { u: Pt; a: Pt; d: number }[] = [];
  for (const u of axes) {
    const n: Pt = [-u[1], u[0]];
    let best: { a: Pt; d: number; far: number } | undefined;
    for (const a of anchors) {
      const d = Math.abs(dot(sub(p, a), n));
      if (d > reach) continue;
      const far = dist(p, a);
      if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) <= 1e-9 && far < best.far))
        best = { a, d, far };
    }
    if (best) found.push({ u, a: best.a, d: best.d });
  }
  if (!found.length) return undefined;
  found.sort((x, y) => x.d - y.d);
  const [f, g] = found as [(typeof found)[0], (typeof found)[0] | undefined];
  // Two lines from one corner would cross on the corner itself: that is Corners' job, not line up's.
  if (g && dist(f.a, g.a) > 1e-9) {
    const q = crossing(f.a, f.u, g.a, g.u);
    if (q) return { q, to: [f.a, g.a] };
  }
  // One line: the pointer moved onto it, then onto a grid line crossing it, if one is near.
  const q: Pt = [f.a[0] + f.u[0] * dot(sub(p, f.a), f.u), f.a[1] + f.u[1] * dot(sub(p, f.a), f.u)];
  let best: { c: Pt; d: number } | undefined;
  if (gridReach > 0)
    for (const [s0, s1] of gridLines()) {
      const v = sub(s1, s0);
      const c = crossing(f.a, f.u, s0, v);
      if (!c) continue;
      const t = dot(sub(c, s0), v) / dot(v, v);
      if (t < -1e-9 || t > 1 + 1e-9) continue;
      const d = dist(c, q);
      if (d <= gridReach && (!best || d < best.d)) best = { c, d };
    }
  return { q: best?.c ?? q, to: [f.a] };
}
