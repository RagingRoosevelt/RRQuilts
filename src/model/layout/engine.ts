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

/** Slots in emission order: band, piece, then j, then i. */
export function tile(t: Tiling): Slot[] {
  const map = t.map ?? IDENTITY;
  const out: Slot[] = [];
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
          let outline = mapPath(piece.outline ?? UNIT, transform);
          if (t.clip) {
            const tol = 1e-4 * Math.max(...piece.size);
            const rel = relation(polyOf(outline, tol), t.clip);
            if (rel === 'out') continue;
            if (rel === 'cross') {
              const clipped = clipOutline(outline, t.clip);
              if (!clipped) continue;
              outline = clipped;
            }
          }
          out.push({
            id,
            kind: piece.kind,
            shape: piece.shape,
            turns: piece.turns,
            alt: piece.alt(i, j),
            outline,
            transform,
            size: piece.size,
            ...(piece.cut ? { cut: mapPath(piece.cut, transform) } : {}),
          });
        }
  return out;
}
