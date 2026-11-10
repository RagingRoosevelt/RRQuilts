// Shape editor operations (spec 027 FR-006a): corners dragged on a 1U grid, edges moved or split,
// corner angles dragged, corners locked, edges marked as not whole units. Pure: shape in, shape out.
import { itemId } from '../identity';
import { DEFAULT_LICENSE } from '../credits';
import { add, dist, signedArea, sub, type Pt } from '../geometry/path';
import type { EppShape } from '../schema/epp';
import { cornerAngles, rot, type Poly } from './geometry';

export type VertexGrid = 'free' | 'square' | 'triangle';
const S3 = Math.sqrt(3);
type Outlined = Pick<EppShape, 'outline' | 'locked' | 'marked'>;

export function newShape(name: string, author = '', license = DEFAULT_LICENSE): EppShape {
  return {
    id: itemId(author),
    notecard: { name },
    // Counter-clockwise on screen (y down): right, then up.
    outline: [
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ],
    ...(author ? { author } : {}),
    license,
  };
}

/** The grid point nearest p: whole units (square), a triangle lattice of side 1, or p itself. */
export function snapToGrid(p: Pt, grid: VertexGrid, origin: Pt = [0, 0]): Pt {
  if (grid === 'free') return p;
  const q = sub(p, origin);
  if (grid === 'square') return add([Math.round(q[0]), Math.round(q[1])], origin);
  // Lattice basis (1, 0) and (1/2, √3/2): try the four corners of the cell p is in.
  const b = (q[1] * 2) / S3;
  const a = q[0] - b / 2;
  let best: Pt = origin;
  let d = Infinity;
  for (const i of [Math.floor(a), Math.ceil(a)])
    for (const j of [Math.floor(b), Math.ceil(b)]) {
      const c: Pt = [i + j / 2, (j * S3) / 2];
      const e = dist(c, q);
      if (e < d) [best, d] = [c, e];
    }
  return add(best, origin);
}

const locked = (s: Outlined, i: number) => !!s.locked?.includes(i);

export function moveVertex<T extends Outlined>(s: T, i: number, p: Pt, grid: VertexGrid): T {
  if (locked(s, i)) return s;
  const outline = s.outline.map((v, k): Pt => (k === i ? snapToGrid(p, grid) : v));
  return { ...s, outline };
}

/** Move edge i (both corners) so its first corner lands on the grid point nearest p. */
export function moveEdge<T extends Outlined>(s: T, i: number, p: Pt, grid: VertexGrid): T {
  const j = (i + 1) % s.outline.length;
  if (locked(s, i) || locked(s, j)) return s;
  const d = sub(snapToGrid(p, grid), s.outline[i]!);
  return { ...s, outline: s.outline.map((v, k) => (k === i || k === j ? add(v, d) : v)) };
}

/** A new corner part way along edge i; a marked edge becomes two marked edges. */
export function splitEdge<T extends Outlined>(s: T, i: number, t = 0.5): T {
  if (s.outline.length >= 24) return s;
  const a = s.outline[i]!;
  const b = s.outline[(i + 1) % s.outline.length]!;
  const outline = [...s.outline];
  outline.splice(i + 1, 0, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  const shift = (list?: number[]) => list?.map((k) => (k > i ? k + 1 : k));
  const marked = shift(s.marked);
  if (s.marked?.includes(i)) marked!.push(i + 1);
  return withLists({ ...s, outline }, shift(s.locked), marked);
}

export function removeVertex<T extends Outlined>(s: T, i: number): T {
  if (s.outline.length <= 3 || locked(s, i)) return s;
  const n = s.outline.length;
  const outline = s.outline.filter((_, k) => k !== i);
  const fix = (list?: number[]) =>
    list?.filter((k) => k !== i).map((k) => (k > i ? k - 1 : k)) ?? undefined;
  // The two edges at corner i become one, marked if either was.
  const prev = (i - 1 + n) % n;
  const wasMarked = s.marked?.includes(prev) || s.marked?.includes(i);
  const marked = fix(s.marked?.filter((k) => k !== prev));
  const joined = i === 0 ? outline.length - 1 : prev;
  if (wasMarked && marked && !marked.includes(joined)) marked.push(joined);
  return withLists({ ...s, outline }, fix(s.locked), wasMarked ? (marked ?? [joined]) : marked);
}

function withLists<T extends Outlined>(s: T, lockedList?: number[], marked?: number[]): T {
  const out = { ...s };
  if (lockedList?.length) out.locked = [...new Set(lockedList)].sort((a, b) => a - b);
  else delete out.locked;
  if (marked?.length) out.marked = [...new Set(marked)].sort((a, b) => a - b);
  else delete out.marked;
  return out;
}

const toggle = (list: number[] | undefined, i: number) =>
  list?.includes(i) ? list.filter((k) => k !== i) : [...(list ?? []), i];
export const toggleMarked = <T extends Outlined>(s: T, i: number): T =>
  withLists(s, s.locked, toggle(s.marked, i));
export const toggleLocked = <T extends Outlined>(s: T, i: number): T =>
  withLists(s, toggle(s.locked, i), s.marked);

/**
 * Give corner i the interior angle `deg`, keeping edge lengths: the next corner turns around it (or
 * the previous one when the next is locked). Unchanged when both neighbors are locked.
 */
export function setAngle<T extends Outlined>(s: T, i: number, deg: number): T {
  const n = s.outline.length;
  const q = s.outline[i]!;
  const next = (i + 1) % n;
  const prev = (i - 1 + n) % n;
  const k = !locked(s, next) ? next : !locked(s, prev) ? prev : -1;
  if (k < 0 || deg <= 0 || deg >= 360) return s;
  const now = cornerAngles(orientOf(s.outline))[i]!;
  const delta = ((deg - now) * Math.PI) / 180;
  for (const sign of [1, -1]) {
    const moved = add(rot(sub(s.outline[k]!, q), sign * delta), q);
    const outline = s.outline.map((v, j): Pt => (j === k ? moved : v));
    if (Math.abs(cornerAngles(orientOf(outline))[i]! - deg) < 1e-6) return { ...s, outline };
  }
  return s;
}

/** Angles read the same whichever way the outline was drawn. */
const orientOf = (poly: Poly): Poly => (signedArea(poly) < 0 ? reverseKeepIndex(poly) : poly);
// Reversing changes indexes; mirror the points instead (angles are the same), keeping index i at i.
const reverseKeepIndex = (poly: Poly): Poly => poly.map(([x, y]): Pt => [-x, y]);

/** Counter-clockwise on screen, with locked and marked lists re-indexed to match. */
export function normalize<T extends Outlined>(s: T): T {
  if (signedArea(s.outline) >= 0) return s;
  const n = s.outline.length;
  const outline = [...s.outline].reverse();
  // Corner i moves to n-1-i; edge i (i → i+1) becomes edge n-2-i.
  const corner = (i: number) => n - 1 - i;
  const edge = (i: number) => (n - 2 - i + n) % n;
  return withLists({ ...s, outline }, s.locked?.map(corner), s.marked?.map(edge));
}

const FRACTIONS: [number, string][] = [
  [1 / 2, '1/2'],
  [1 / 3, '1/3'],
  [2 / 3, '2/3'],
  [1 / 4, '1/4'],
  [3 / 4, '3/4'],
];
/** An edge length as people read it: 2, 1 1/2, 3/4, or 1.41. */
export function lengthLabel(n: number): string {
  const whole = Math.floor(n + 1e-6);
  const rest = n - whole;
  if (rest < 1e-6) return String(whole);
  const f = FRACTIONS.find(([v]) => Math.abs(rest - v) < 1e-6);
  if (f) return whole ? `${whole} ${f[1]}` : f[1];
  return n.toFixed(2);
}
