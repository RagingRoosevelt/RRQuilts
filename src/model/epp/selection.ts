// EPP multi-select (spec 051): a selection moves, turns, mirrors, scales and snaps as one, keeping
// its arrangement, like a temporary rosette; Duplicate makes it one to place. Pure, over any placed
// items (quilt or rosette pieces).
import { add, mul, sub, type Pt } from '../geometry/path';
import type { Fill } from '../schema/coloring';
import type { EppPiece, InternalShape } from '../schema/epp';
import { edges, overlaps, rot, type Poly } from './geometry';

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
 * `y`: up and down), then scale (a factor that keeps scales whole, see `scaleTo`), then turn
 * (degrees), then `move`.
 */
export interface GroupMove {
  pivot?: Pt;
  flip?: 'x' | 'y' | undefined;
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
  const out: T = {
    ...p,
    at: add(add(at, c), g.move ?? [0, 0]),
    turn: ((turn % 360) + 360) % 360,
    scale,
  };
  if (mirror) out.mirror = true;
  else delete out.mirror;
  return out;
}

export const moveGroup = <T extends Placed>(
  items: readonly T[],
  ids: ReadonlySet<string>,
  g: GroupMove,
): T[] => items.map((p) => (ids.has(p.id) ? movePose(p, g) : p));

/** Mirror on picked pieces (owner, 2026-11-12): each one flips where it is, not the group. */
export const flipEach = <T extends Placed>(
  items: readonly T[],
  ids: ReadonlySet<string>,
  flip: 'x' | 'y',
): T[] => items.map((p) => (ids.has(p.id) ? movePose(p, { pivot: p.at, flip }) : p));

const gcd = (a: number, b: number): number => (b < 1e-3 ? a : gcd(b, a % b));

/**
 * Stops in a full turn for one item (a shape, or a rosette's pieces together): 360° over the
 * largest angle that steps between all its edge directions (as lines). Hexagon 6, octagon 8, square
 * 4, triangles and 60° diamonds 6, the Hexi Kite 12.
 * shortcut: a shape whose edges meet at odd angles (finer than 15°) counts its corners instead.
 */
export function turnStops(polys: readonly Poly[]): number {
  const dirs = polys
    .flatMap((p) => edges(p))
    .filter(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]) > 1e-9)
    .map(([a, b]) => Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD);
  if (!dirs.length) return 1;
  let g = 180;
  for (const d of dirs) {
    const diff = Math.round(((((d - dirs[0]!) % 180) + 180) % 180) * 1000) / 1000;
    if (diff > 1e-3 && diff < 180 - 1e-3) g = gcd(g, diff);
  }
  const n = Math.round(360 / g);
  return n > 24 ? polys[0]!.length : n;
}

/**
 * Turn on picked pieces (owner, 2026-11-12: "rotate should be based on the least common multiple
 * among the rosettes / shapes in the group"): degrees per step, 360° over the lcm of each item's
 * `turnStops`.
 */
export function turnStep(items: readonly (readonly Poly[])[]): number {
  let n = 1;
  for (const polys of items) {
    const k = turnStops(polys);
    n = Math.min(360, (n / Math.round(gcd(n, k))) * k);
  }
  return 360 / n;
}

/** The selection's size: its smallest piece's scale (the sidebar's Scale shows it). */
export function scaleOf(items: readonly Placed[], ids: ReadonlySet<string>): number | null {
  const sel = items.filter((p) => ids.has(p.id));
  return sel.length ? Math.min(...sel.map((p) => p.scale)) : null;
}

/**
 * The factor that brings the selection's smallest piece to `size`, the others in proportion; null
 * when a piece would leave whole sizes 1 to 4.
 */
export function scaleTo(
  items: readonly Placed[],
  ids: ReadonlySet<string>,
  size: number,
): number | null {
  const m = scaleOf(items, ids);
  if (m === null) return null;
  const k = size / m;
  const ok = (s: number) => Math.abs(s - Math.round(s)) < 1e-9 && s > 0.5 && s < 4.5;
  return items.every((p) => !ids.has(p.id) || ok(p.scale * k)) ? k : null;
}

/** The mean of polygons' corners: where a placed rosette, and so a duplicate, is centered. */
export function centre(polys: readonly Poly[]): Pt {
  const pts = polys.flat();
  return mul(
    pts.reduce((s, p) => add(s, p), [0, 0] as Pt),
    1 / (pts.length || 1),
  );
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

/** The picker's id for the duplicate: shown and placed like a rosette, never saved. */
export const DUPLICATE_ID = 'rrquilts.session-duplicate';

/**
 * Duplicate (owner, 2026-11-12: "a temporary virtual rosette in the sidebar that can then be placed
 * (until a new temporary virtual rosette is made)"): the selected pieces as quilt pieces (a shape's
 * fill under ''), the internal shapes they use, and their `centre` (where a placed rosette sits).
 */
export interface Clip {
  pieces: EppPiece[];
  shapes: InternalShape[];
  middle: Pt;
  /** Made in a rosette: its id and each piece's fill per coloring (placing it there keeps them). */
  from?: { rosette: string; fills: Record<string, Record<string, Fill>> };
}

/** The duplicate's pieces where a rosette placed at `pose` would put them (about their centre). */
export const clipAt = (clip: Clip, pose: { at: Pt; turn: number; mirror?: boolean | undefined }) =>
  moveGroup(clip.pieces, new Set(clip.pieces.map((p) => p.id)), {
    pivot: clip.middle,
    flip: pose.mirror ? 'x' : undefined,
    turn: pose.turn,
    move: sub(pose.at, clip.middle),
  });
