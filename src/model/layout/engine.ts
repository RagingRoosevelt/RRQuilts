// The layout engine (spec 016): every layout is bands of a repeating cell. A band steps its cell's
// pieces by vectors `a` (index i) and `b` (index j); one affine `map` turns or shears the whole; an
// optional `clip` trims it to the quilt. Layout styles are presets (presets.ts) that build a Tiling.
import { apply, IDENTITY, mul, type M } from '../geometry/affine';
import { flattenLoop, pathToSegs, type Pt } from '../geometry/path';
import type { PathCommand } from '../schema/shared';
import { clipOutline, relation } from './clip';
import type { Bounds, Slot, SlotKind, SpaceShape } from './slots';

export interface CellPiece {
  kind: SlotKind;
  shape: SpaceShape;
  turns: number;
  /** Finished size of the whole space (its own axes). */
  size: [number, number];
  /** Unit square (the block) → cell coordinates. */
  transform: M;
  /** Outline in the unit square's coordinates; default the unit square. */
  outline?: PathCommand[];
  /** Shape to cut, unit coordinates (floating setting pieces). */
  cut?: PathCommand[];
  /** Position-based id; null leaves this position out. */
  id: (i: number, j: number) => string | null;
  alt: (i: number, j: number) => number;
}

export interface Band {
  cell: CellPiece[];
  a: Pt;
  b: Pt;
  /** Inclusive index ranges. */
  i: [number, number];
  j: [number, number];
}

export interface Tiling {
  bands: Band[];
  /** Applied to everything after stepping (turn, shear, offset). */
  map?: M;
  /** Trim to this rectangle (quilt units, after `map`). */
  clip?: Bounds;
  /** Spaces joined into one before trimming (triangle grids). */
  merges?: Merge[];
}

// Literal, not rectPath(): slots.ts imports this module (cycle).
const UNIT: PathCommand[] = [['M', 0, 0], ['L', 1, 0], ['L', 1, 1], ['L', 0, 1], ['Z']];

/** `path` through `m`. Arcs stay circular under turns and uniform scales (not shears). */
export function mapPath(path: PathCommand[], m: M): PathCommand[] {
  const flip = m[0] * m[3] - m[1] * m[2] < 0;
  const P = (x: number, y: number) => apply(m, [x, y]);
  return path.map((c): PathCommand => {
    if (c[0] === 'M' || c[0] === 'L') return [c[0], ...P(c[1], c[2])];
    if (c[0] === 'A') return ['A', ...P(c[1], c[2]), flip ? -c[3] : c[3]];
    if (c[0] === 'C') return ['C', ...P(c[1], c[2]), ...P(c[3], c[4]), ...P(c[5], c[6])];
    return c;
  });
}

const polyOf = (path: PathCommand[], tol: number): Pt[] =>
  path.every((c) => c[0] !== 'A' && c[0] !== 'C')
    ? path.flatMap((c): Pt[] => (c[0] === 'M' || c[0] === 'L' ? [[c[1], c[2]]] : []))
    : flattenLoop(pathToSegs(path, [1, 1]), tol);

/** Slots in emission order: band, piece, then j, then i; merged, then trimmed to `clip`. */
export function tile(t: Tiling): Slot[] {
  const map = t.map ?? IDENTITY;
  let out: Slot[] = [];
  for (const band of t.bands)
    for (const piece of band.cell)
      for (let j = band.j[0]; j <= band.j[1]; j++)
        for (let i = band.i[0]; i <= band.i[1]; i++) {
          const id = piece.id(i, j);
          if (id === null) continue;
          const step: M = [
            1,
            0,
            0,
            1,
            i * band.a[0] + j * band.b[0],
            i * band.a[1] + j * band.b[1],
          ];
          const transform = mul(map, mul(step, piece.transform));
          out.push({
            id,
            kind: piece.kind,
            shape: piece.shape,
            turns: piece.turns,
            alt: piece.alt(i, j),
            outline: mapPath(piece.outline ?? UNIT, transform),
            transform,
            size: piece.size,
            ...(piece.cut ? { cut: mapPath(piece.cut, transform) } : {}),
          });
        }
  if (t.merges) out = merge(out, t.merges);
  const clip = t.clip;
  if (!clip) return out;
  return out.flatMap((s) => {
    const rel = relation(polyOf(s.outline, 1e-4 * Math.max(...s.size)), clip);
    if (rel === 'in') return [s];
    if (rel === 'out') return [];
    const outline = clipOutline(s.outline, clip);
    return outline ? [{ ...s, outline }] : [];
  });
}

/** Spaces joined into one (triangle-grid layouts, spec 001 FR-029d): which spaces it covers. */
export interface Merge {
  shape: SpaceShape;
  covers: string[];
}

const key = (p: Pt) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;

/**
 * Replace each merge's covered spaces with one space: the union's outline, id
 * `{shape}:{first covered id in emission order}`, the block mapped to the union's bounding box.
 * ponytail: straight-edged spaces only (triangle grids); curved merges would need arrange().
 */
export function merge(slots: Slot[], merges: Merge[]): Slot[] {
  const byId = new Map(slots.map((s, i) => [s.id, i]));
  const replaced = new Map<number, Slot | null>();
  for (const m of merges) {
    const idx = m.covers
      .flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []))
      .sort((a, b) => a - b);
    if (!idx.length) continue;
    // Directed edges of every covered outline; an edge shared by two cancels out.
    const edges = new Map<string, [Pt, Pt]>();
    for (const i of idx) {
      const pts = polyOf(slots[i]!.outline, 0);
      pts.forEach((a, n) => {
        const b = pts[(n + 1) % pts.length]!;
        const back = `${key(b)}>${key(a)}`;
        if (edges.has(back)) edges.delete(back);
        else edges.set(`${key(a)}>${key(b)}`, [a, b]);
      });
    }
    const next = new Map([...edges.values()].map(([a, b]) => [key(a), b]));
    const start = [...edges.values()][0]![0];
    const loop: Pt[] = [start];
    for (let p = next.get(key(start))!; key(p) !== key(start); p = next.get(key(p))!) loop.push(p);
    const xs = loop.map((p) => p[0]);
    const ys = loop.map((p) => p[1]);
    const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const [w, h] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
    const first = slots[idx[0]!]!;
    replaced.set(idx[0]!, {
      ...first,
      id: `${m.shape}:${first.id}`,
      shape: m.shape,
      turns: TURNS[m.shape],
      outline: [['M', ...loop[0]!], ...loop.slice(1).map((p): PathCommand => ['L', ...p]), ['Z']],
      transform: [w, 0, 0, h, x0, y0],
      size: [w, h],
    });
    for (const i of idx.slice(1)) replaced.set(i, null);
  }
  return slots.flatMap((s, i) => {
    const r = replaced.get(i);
    return r === undefined ? [s] : r ? [r] : [];
  });
}

/** Degrees between the turns a block may take in a space of each shape (spec 001 FR-060a). */
export const TURNS: Record<SpaceShape, number> = {
  rect: 90,
  triangle: 120,
  diamond60: 180,
  hexagon: 60,
  clamshell: 360,
  spool: 180,
  piece: 360,
};
