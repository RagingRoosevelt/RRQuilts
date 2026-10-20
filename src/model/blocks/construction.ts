// What a block's drawing says about sewing it (spec 029), for filtering: never stored or edited.
// Set-in seams: a straight-seamed block sews without them when it comes apart again and again into a
// unit and the rest joined by one straight seam (each sewn first, then joined); where no such order
// exists, some seam has to be set in (or sewn as a partial seam).
import { pathPolygon, type Pt } from '../geometry/path';
import type { Block } from '../schema/block';
import type { Units } from '../schema/project';
import { allPatches } from './patches';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export interface Construction {
  curved: boolean;
  /** Needs a set-in or partial seam (straight-seamed blocks only; curved ones aren't checked). */
  setIn: boolean;
  pieces: number;
  /** Narrowest piece, in inches: 4 × area ÷ perimeter (a square's side, a strip's width). */
  smallest: number;
  difficulty: Difficulty;
}

export const DIFFICULTIES: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export type SeamKind = 'straight' | 'curved' | 'set-in';
export const SEAM_KINDS: Record<SeamKind, string> = {
  straight: 'Straight seams only',
  curved: 'Curved seams',
  'set-in': 'Set-in seams',
};
export const seamKinds = (c: Construction): SeamKind[] =>
  c.curved || c.setIn
    ? [...(c.curved ? (['curved'] as const) : []), ...(c.setIn ? (['set-in'] as const) : [])]
    : ['straight'];

/** The Construction filters (Seams, Difficulty): a block matches when it has any picked value. */
export function constructionMatches(
  block: Block,
  picked: { seams: readonly string[]; difficulty: readonly string[] },
  units: Units = 'in',
) {
  if (!picked.seams.length && !picked.difficulty.length) return true;
  const c = blockConstruction(block, units);
  return (
    (!picked.seams.length || seamKinds(c).some((k) => picked.seams.includes(k))) &&
    (!picked.difficulty.length || picked.difficulty.includes(c.difficulty))
  );
}
/** The filters' choices, as FilterSelect options. */
export const CONSTRUCTION_FILTERS = [
  {
    key: 'seams' as const,
    label: 'Seams',
    options: Object.entries(SEAM_KINDS).map(([value, label]) => ({ value, label })),
  },
  {
    key: 'difficulty' as const,
    label: 'Difficulty',
    options: Object.entries(DIFFICULTIES).map(([value, label]) => ({ value, label })),
  },
];

/** Per block object, per units (a library block is in inches, a project's in its units). */
const cache = { in: new WeakMap<Block, Construction>(), cm: new WeakMap<Block, Construction>() };

export function blockConstruction(block: Block, units: Units = 'in'): Construction {
  const hit = cache[units].get(block);
  if (hit) return hit;
  const patches = allPatches(block);
  const curved = patches.some((p) => p.path.some((c) => c[0] === 'A' || c[0] === 'C'));
  const k = units === 'cm' ? 1 / 2.54 : 1;
  const [w, h] = [block.size[0] * k, block.size[1] * k];
  const polys = patches.map((p) =>
    pathPolygon(p.path, block.size).map(([x, y]) => [x * w, y * h] as Pt),
  );
  const smallest = Math.min(...polys.map(across));
  const setIn = !curved && block.kind !== 'applique' && !splits(polys);
  const pieces = patches.length;
  const difficulty: Difficulty =
    curved || setIn || pieces > 49 || smallest < 0.75
      ? 'advanced'
      : pieces <= 16 && smallest >= 1.5
        ? 'beginner'
        : 'intermediate';
  const out = { curved, setIn, pieces, smallest, difficulty };
  cache[units].set(block, out);
  return out;
}

function across(poly: Pt[]) {
  let area = 0;
  let perimeter = 0;
  poly.forEach(([x0, y0], i) => {
    const [x1, y1] = poly[(i + 1) % poly.length]!;
    area += x0 * y1 - x1 * y0;
    perimeter += Math.hypot(x1 - x0, y1 - y0);
  });
  return perimeter ? (2 * Math.abs(area)) / perimeter : 0;
}

/**
 * Can these pieces be sewn with straight seams only? They can when some unit (touching pieces on one
 * side of a seam's line) meets the rest along that line alone, in one unbroken stretch, and the unit
 * and the rest can each be sewn the same way. A seam right across, a strip sewn on last, and a
 * star's wedges sewn into halves are all cases of it.
 */
function splits(polys: Pt[][]): boolean {
  if (polys.length <= 1) return true;
  const size = Math.max(...polys.flat().map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))), 1);
  const eps = 1e-6 * size;
  // Where each pair of pieces meets.
  const seams = polys.map((p, i) => polys.map((q, j) => (i === j ? [] : shared(p, [q], eps))));
  // Every seam's line (unit normal n, offset c: n·p = c), with which side of it each piece is on.
  const lines = new Map<string, { n: Pt; c: number; side: number[] }>();
  for (const poly of polys)
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length]!;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < eps) return;
      let n: Pt = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
      if (n[0] < -1e-9 || (Math.abs(n[0]) < 1e-9 && n[1] < 0)) n = [-n[0], -n[1]];
      const c = n[0] * a[0] + n[1] * a[1];
      const key = `${n[0].toFixed(5)},${n[1].toFixed(5)},${(c / size).toFixed(5)}`;
      if (lines.has(key)) return;
      const side = polys.map((q) => {
        const d = q.map(([x, y]) => n[0] * x + n[1] * y - c);
        return Math.min(...d) > -eps ? 1 : Math.max(...d) < eps ? -1 : 0;
      });
      lines.set(key, { n, c, side });
    });
  const parts = (set: number[]) => {
    const group = new Map(set.map((i) => [i, i]));
    const find = (i: number): number => (group.get(i) === i ? i : find(group.get(i)!));
    for (const i of set)
      for (const j of set) if (i < j && seams[i]![j]!.length) group.set(find(i), find(j));
    const out = new Map<number, number[]>();
    for (const i of set) out.set(find(i), [...(out.get(find(i)) ?? []), i]);
    return [...out.values()];
  };
  /** The unit meets the rest along line `L` only, in one unbroken stretch. */
  const along = (unit: number[], rest: number[], L: { n: Pt; c: number }) => {
    const u: Pt = [-L.n[1], L.n[0]];
    const spans: [number, number][] = [];
    for (const i of unit)
      for (const j of rest)
        for (const [a, b] of seams[i]![j]!) {
          const off = (q: Pt) => Math.abs(L.n[0] * q[0] + L.n[1] * q[1] - L.c);
          if (off(a) > eps || off(b) > eps) return false;
          const [x, y] = [a, b].map((q) => q[0] * u[0] + q[1] * u[1]) as [number, number];
          spans.push([Math.min(x, y), Math.max(x, y)]);
        }
    if (!spans.length) return false;
    spans.sort((m, k) => m[0] - k[0]);
    let end = spans[0]![1];
    for (const [lo, hi] of spans.slice(1)) {
      if (lo > end + eps) return false;
      end = Math.max(end, hi);
    }
    return true;
  };
  const memo = new Map<string, boolean>();
  // ponytail: a blocks with no straight-seam order is searched until this budget runs out (then
  // counted as needing a set-in seam); raise it if a big sewable block is ever misjudged.
  let budget = 20000;
  const go = (set: number[]): boolean => {
    if (set.length <= 1) return true;
    const key = set.join(',');
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    if (--budget < 0) return false;
    let ok = false;
    const groups = parts(set);
    // Pieces that don't touch (one side of a seam) each join the other side on their own.
    if (groups.length > 1) ok = groups.every(go);
    else
      search: for (const L of lines.values())
        for (const s of [1, -1]) {
          const mine = set.filter((i) => L.side[i] === s);
          if (!mine.length || mine.length === set.length) continue;
          for (const unit of parts(mine)) {
            const rest = set.filter((i) => !unit.includes(i));
            if (along(unit, rest, L) && go(unit) && go(rest)) {
              ok = true;
              break search;
            }
          }
        }
    memo.set(key, ok);
    return ok;
  };
  return go(polys.map((_, i) => i));
}

/** The stretches of `p`'s sides that lie along a side of a piece in `rest`. */
function shared(p: Pt[], rest: Pt[][], eps: number): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < eps) continue;
    const u: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    const off = (q: Pt) => Math.abs((q[0] - a[0]) * u[1] - (q[1] - a[1]) * u[0]);
    const at = (q: Pt) => (q[0] - a[0]) * u[0] + (q[1] - a[1]) * u[1];
    for (const r of rest)
      for (let j = 0; j < r.length; j++) {
        const [c, d] = [r[j]!, r[(j + 1) % r.length]!];
        if (off(c) > eps || off(d) > eps) continue;
        const lo = Math.max(0, Math.min(at(c), at(d)));
        const hi = Math.min(len, Math.max(at(c), at(d)));
        if (hi - lo > eps)
          out.push([
            [a[0] + u[0] * lo, a[1] + u[1] * lo],
            [a[0] + u[0] * hi, a[1] + u[1] * hi],
          ]);
      }
  }
  return out;
}
