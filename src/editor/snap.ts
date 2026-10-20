// Snapping for the block editor (design space: normalized × block size).
// Priority: existing nodes → points on seams (incl. the outline) → snap-grid points.
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
  grid: boolean;
  nodes: boolean;
  seams: boolean;
}

export const defaultSnap = (units: 'in' | 'cm', shape?: BlockShape): SnapSettings => ({
  mode: 'step',
  step: units === 'cm' ? 0.5 : 0.25,
  divisions: [3, 3],
  perSide: shape === 'hexagon' ? 2 : 4,
  grid: true,
  nodes: true,
  seams: true,
});

export interface Snapped {
  /** Design-space point. */
  p: Pt;
  endpoint: Endpoint;
  kind: 'node' | 'seam' | 'grid' | 'free';
}

/** Grid spacing in design units for each axis. */
export const gridSpacing = (s: SnapSettings, size: Size): [number, number] =>
  s.mode === 'step' ? [s.step, s.step] : [size[0] / s.divisions[0], size[1] / s.divisions[1]];

/** `radius` is in design units (screen snap distance ÷ zoom). */
export function snap(
  p: Pt,
  drawing: Drawing,
  size: Size,
  s: SnapSettings,
  radius: number,
  shape?: BlockShape,
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

  if (s.nodes) {
    let best: { id: string; q: Pt; d: number } | undefined;
    for (const n of drawing.nodes) {
      const q: Pt = [n.x * w, n.y * h];
      const d = dist(p, q);
      if (d <= radius && (!best || d < best.d)) best = { id: n.id, q, d };
    }
    // Block corners behave like nodes.
    for (const q of corners) {
      const d = dist(p, q);
      if (d <= radius && (!best || d < best.d)) best = { id: '', q, d };
    }
    if (best)
      return { p: best.q, endpoint: best.id ? { node: best.id } : norm(best.q), kind: 'node' };
  }

  // Grid point candidate.
  let grid: Pt | undefined;
  if (s.grid) {
    const [gx, gy] = gridSpacing(s, size);
    const q: Pt = shape
      ? lattice(shape, size, s.perSide).nearest(p)
      : [
          Math.min(w, Math.max(0, Math.round(p[0] / gx) * gx)),
          Math.min(h, Math.max(0, Math.round(p[1] / gy) * gy)),
        ];
    if (dist(p, q) <= radius) grid = q;
  }

  // Seam candidate. Ending on a seam wins over a nearby grid point — unless that grid point is
  // itself on the seam (then use it: it's both exact and on the grid).
  if (s.seams) {
    const outline = corners.map((a, i): Seg => ({
      kind: 'line',
      a,
      b: corners[(i + 1) % corners.length]!,
    }));
    let best: { q: Pt; d: number; g: Seg } | undefined;
    for (const g of [...outline, ...drawing.segments.map((x) => segGeom(drawing, x, size))]) {
      const r = project(g, p);
      if (r.d <= radius && (!best || r.d < best.d)) best = { q: pointAt(g, r.t), d: r.d, g };
    }
    if (best) {
      const onSeam = grid && project(best.g, grid).d <= 1e-6 * Math.max(w, h);
      if (onSeam) return { p: grid!, endpoint: norm(grid!), kind: 'grid' };
      return { p: best.q, endpoint: norm(best.q), kind: 'seam' };
    }
  }
  if (grid) return { p: grid, endpoint: norm(grid), kind: 'grid' };

  const q: Pt = [Math.min(w, Math.max(0, p[0])), Math.min(h, Math.max(0, p[1]))];
  return { p: q, endpoint: norm(q), kind: 'free' };
}
