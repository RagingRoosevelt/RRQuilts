// EPP multi-select (spec 051): a selection moves, turns, mirrors, scales and snaps as one, keeping
// its arrangement, like a temporary rosette. Pure, over any placed items (quilt or rosette pieces).
import { add, mul, sub, type Pt } from '../geometry/path';
import type { Fill } from '../schema/coloring';
import type { EppPiece, InternalShape } from '../schema/epp';
import { bbox, overlaps, rot, type Poly } from './geometry';
import type { Snap } from './snap';

const RAD = Math.PI / 180;

export interface Placed {
  id: string;
  at: Pt;
  turn: number;
  scale: number;
  mirror?: boolean | undefined;
}

/**
 * A move of the whole selection about `pivot` (default the origin): mirror (`x`: left to right,
 * `y`: up and down), then scale (a factor that keeps scales whole, see `scaleStep`), then turn
 * (degrees), then `move`.
 */
export interface GroupMove {
  pivot?: Pt;
  flip?: 'x' | 'y';
  scale?: number;
  turn?: number;
  move?: Pt;
}

/** One piece's pose after a group move (a piece is placed as turn · mirror · its shape). */
export function movePose<T extends Placed>(p: T, g: GroupMove): T {
  const c = g.pivot ?? [0, 0];
  let at = sub(p.at, c);
  let turn = p.turn;
  let mirror = !!p.mirror;
  let scale = p.scale;
  if (g.flip) {
    // Flip · turn t = turn (−t) · flip, and an up-and-down flip is a half turn of a left-right one.
    at = g.flip === 'x' ? [-at[0], at[1]] : [at[0], -at[1]];
    turn = (g.flip === 'x' ? 0 : 180) - turn;
    mirror = !mirror;
  }
  if (g.scale) {
    at = mul(at, g.scale);
    scale = Math.round(scale * g.scale);
  }
  if (g.turn) {
    at = rot(at, g.turn * RAD);
    turn += g.turn;
  }
  const out: T = { ...p, at: add(add(at, c), g.move ?? [0, 0]), turn: (turn + 360) % 360, scale };
  if (mirror) out.mirror = true;
  else delete out.mirror;
  return out;
}

export const moveGroup = <T extends Placed>(
  items: readonly T[],
  ids: ReadonlySet<string>,
  g: GroupMove,
): T[] => items.map((p) => (ids.has(p.id) ? movePose(p, g) : p));

/** The selection after a snap of its polygons (a turn about the origin, then a move). */
export const snapGroup = <T extends Placed>(
  items: readonly T[],
  ids: ReadonlySet<string>,
  s: Snap,
) => moveGroup(items, ids, { turn: s.rot / RAD, move: s.move });

/**
 * The factor that makes the selection's smallest piece one size bigger (+1) or smaller (−1), the
 * others in proportion; null when a piece would leave whole sizes 1 to 4.
 */
export function scaleStep(
  items: readonly Placed[],
  ids: ReadonlySet<string>,
  dir: 1 | -1,
): number | null {
  const sel = items.filter((p) => ids.has(p.id));
  if (!sel.length) return null;
  const m = Math.min(...sel.map((p) => p.scale));
  const k = (m + dir) / m;
  const ok = (s: number) => Math.abs(s - Math.round(s)) < 1e-9 && s > 0.5 && s < 4.5;
  return sel.every((p) => ok(p.scale * k)) ? k : null;
}

/** The middle of polygons (of their bounds): where a selection turns, mirrors and scales. */
export function middle(polys: readonly Poly[]): Pt {
  const [x0, y0, x1, y1] = bbox(polys);
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

/** Indexes of the polygons a box picks: wholly inside, or (`touched`) any part inside. */
export function boxPick(
  polys: readonly Poly[],
  [x0, y0, x1, y1]: [number, number, number, number],
  touched = false,
): number[] {
  const rect: Poly = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const inside = ([x, y]: Pt) =>
    x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9;
  return polys.flatMap((p, i) =>
    (touched ? p.some(inside) || overlaps(p, rect) : p.every(inside)) ? [i] : [],
  );
}

/** Bring to front / send to back (drawn last / first), keeping the selection's own order. */
export const toFront = <T extends { id: string }>(
  items: readonly T[],
  ids: ReadonlySet<string>,
) => [...items.filter((p) => !ids.has(p.id)), ...items.filter((p) => ids.has(p.id))];
export const toBack = <T extends { id: string }>(items: readonly T[], ids: ReadonlySet<string>) => [
  ...items.filter((p) => ids.has(p.id)),
  ...items.filter((p) => !ids.has(p.id)),
];

/**
 * Copied pieces (session only): as quilt pieces (a shape's fill under ''), the internal shapes they
 * use, and their middle (pasting puts it under the pointer).
 */
export interface Clip {
  pieces: EppPiece[];
  shapes: InternalShape[];
  middle: Pt;
  /** Copied in a rosette: its id and each piece's fill per coloring (pasting back keeps them). */
  from?: { rosette: string; fills: Record<string, Record<string, Fill>> };
}
