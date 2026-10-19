// Helpers for drawing built-in shaped blocks (spec 026): the definition types and geometry. Each
// block is a list of pieces in its own coordinates: origin at the shape's center, y down, one unit =
// one side (leg). Hexagons may be drawn flat-top (`flat`); they are turned to pointy-top.
import { SHAPE_OUTLINE, shapeSize, type BlockShape } from '@/model/blocks/shape';
import type { P } from './grid';

export type { P };

export interface ShapedPiece {
  poly: P[];
  /** Color letter (grid.ts `COLORS`). */
  c: string;
}

export interface ShapedDef {
  name: string;
  shape: BlockShape;
  /** Finished side in inches. */
  leg: number;
  category: string;
  /** Hexagons only: pieces drawn flat-top (turned 90° to pointy-top). */
  flat?: boolean;
  pieces: ShapedPiece[];
}

/** A block drawn as seams (lines, or arcs with a sweep in degrees, + = counterclockwise on screen)
 *  and color points instead of pieces: for curves. Same coordinates as pieces. */
export interface CurvedDef {
  name: string;
  shape: BlockShape;
  leg: number;
  category: string;
  flat?: boolean;
  seams: ([P, P] | [P, P, number])[];
  /** Color sample points, one inside each patch. */
  points: [P, string][];
}

/** √3 ÷ 2: the height of a triangle of side 1. */
export const H = Math.sqrt(3) / 2;

/** Corner `k` (0 = right, then clockwise on screen) of a flat-top hexagon of side `r` at the origin. */
export const hexV = (k: number, r = 1): P => {
  const t = (Math.PI / 3) * k;
  return [r * Math.cos(t), r * Math.sin(t)];
};
/** Point `t` (0…1) of the way from `a` to `b`. */
export const lerp = (a: P, b: P, t: number): P => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/** Shape corners in the block's own coordinates (side 1, centered; hexagon flat-top if `flat`). */
export function corners(shape: BlockShape, flat = false): P[] {
  if (shape === 'hexagon' && flat) return [0, 1, 2, 3, 4, 5].map((k) => hexV(k));
  const [w, h] = shapeSize(shape, 'leg', 1);
  const c = shape === 'triangle' ? [0.5, 2 / 3] : [0.5, 0.5];
  return SHAPE_OUTLINE[shape].map(([x, y]): P => [(x - c[0]!) * w, (y - c[1]!) * h]);
}
