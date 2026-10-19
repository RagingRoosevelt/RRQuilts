// Built-in shaped blocks (spec 026): triangles, 60° diamonds and hexagons (traditional designs,
// drawn for RRQuilts), drawn as pieces (shaped-kit.ts) and turned into seam lines and color sample
// points for their default coloring.
import { shapeSize, type BlockShape } from '@/model/blocks/shape';
import { COLORS, type P } from './grid';
import type { CurvedDef, ShapedDef } from './shaped-kit';
import { SHAPED_A } from './shaped-a';
import { SHAPED_B } from './shaped-b';
import { SHAPED_C } from './shaped-c';
import { SHAPED_D } from './shaped-d';

export interface ShapedStarter {
  name: string;
  shape: BlockShape;
  size: number;
  category: string;
  /** Seams in the block's unit square (arcs carry their sweep). */
  seams: ([P, P] | [P, P, number])[];
  /** Color sample points in the unit square, with color names. */
  points: [number, number, string][];
}

const key = (p: P) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
const onSeg = (p: P, a: P, b: P) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L);
  const d = Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / L;
  return t > 1e-9 && t < 1 - 1e-9 && d < 1e-7 ? t : null;
};
const inside = (p: P, poly: P[]) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[i]!, poly[j]!];
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      hit = !hit;
  }
  return hit;
};
/** A point well inside a piece: its centroid, or the middle of one of its corner triangles. */
function sample(poly: P[]): P {
  const n = poly.length;
  const c: P = [poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n];
  if (inside(c, poly)) return c;
  for (let i = 0; i < n; i++) {
    const [a, b, d] = [poly[(i + n - 1) % n]!, poly[i]!, poly[(i + 1) % n]!];
    const m: P = [(a[0] + b[0] + d[0]) / 3, (a[1] + b[1] + d[1]) / 3];
    if (inside(m, poly)) return m;
  }
  return c;
}

/** Block coordinates (side 1, centered) → the unit square, flat-top hexagons turned pointy-top. */
function normalizer(shape: BlockShape, flat?: boolean) {
  const turn = (p: P): P => (flat ? [-p[1], p[0]] : p);
  const [w, h] = shapeSize(shape, 'leg', 1);
  const c = shape === 'triangle' ? [0.5, 2 / 3] : [0.5, 0.5];
  return (p: P): P => {
    const [x, y] = turn(p);
    return [x / w + c[0]!, y / h + c[1]!];
  };
}

/** A shaped definition as seams and sample points in the unit square (pointy-top hexagons). */
export function shapedStarter(d: ShapedDef): ShapedStarter {
  const norm = normalizer(d.shape, d.flat);
  const pieces = d.pieces.map((p) => ({ poly: p.poly.map(norm), c: p.c }));
  // Every piece side, split where another piece's corner lies on it, once each.
  const all = pieces.flatMap((p) => p.poly);
  const seams = new Map<string, [P, P]>();
  for (const { poly } of pieces)
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length]!;
      const cuts = all
        .map((p) => ({ p, t: onSeg(p, a, b) }))
        .filter((x): x is { p: P; t: number } => x.t !== null)
        .sort((u, v) => u.t - v.t)
        .map((x) => x.p);
      const run = [a, ...cuts, b];
      for (let k = 0; k + 1 < run.length; k++) {
        const [u, v] = [run[k]!, run[k + 1]!];
        if (key(u) === key(v)) continue;
        const id = [key(u), key(v)].sort().join('|');
        if (!seams.has(id)) seams.set(id, [u, v]);
      }
    });
  return {
    name: d.name,
    shape: d.shape,
    size: d.leg,
    category: d.category,
    seams: [...seams.values()],
    points: pieces.map((p) => {
      const [x, y] = sample(p.poly);
      return [x, y, COLORS[p.c] ?? p.c];
    }),
  };
}

/** A curved definition in the unit square (a turn keeps arc sweeps as they are). */
export function curvedStarter(d: CurvedDef): ShapedStarter {
  const norm = normalizer(d.shape, d.flat);
  return {
    name: d.name,
    shape: d.shape,
    size: d.leg,
    category: d.category,
    seams: d.seams.map(([a, b, s]) =>
      s === undefined ? [norm(a), norm(b)] : [norm(a), norm(b), s],
    ),
    points: d.points.map(([p, c]) => {
      const [x, y] = norm(p);
      return [x, y, COLORS[c] ?? c];
    }),
  };
}

export const SHAPED_BLOCKS: ShapedDef[] = [...SHAPED_A, ...SHAPED_B, ...SHAPED_C, ...SHAPED_D];
