// What a block's drawing says about sewing it (spec 029), for filtering: never stored or edited.
// Set-in seams: a straight-seamed block sews without them when it can be split again and again by a
// straight line right across the part being split (each half sewn first, then joined); where no
// such line exists, some seam has to be set in (or sewn as a partial seam).
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

/** Can these pieces be put together with straight seams right across, all the way down? */
function splits(polys: Pt[][]): boolean {
  if (polys.length <= 1) return true;
  const size = Math.max(...polys.flat().map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))), 1);
  const eps = 1e-6 * size;
  const tried = new Set<string>();
  for (const poly of polys)
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!;
      const b = poly[(i + 1) % poly.length]!;
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
      const len = Math.hypot(dx, dy);
      if (len < eps) continue;
      // The line through this edge: unit normal n, offset c (n·p = c), one way round.
      let [nx, ny] = [-dy / len, dx / len];
      if (nx < -1e-9 || (Math.abs(nx) < 1e-9 && ny < 0)) [nx, ny] = [-nx, -ny];
      const c = nx * a[0] + ny * a[1];
      const key = `${nx.toFixed(5)},${ny.toFixed(5)},${(c / size).toFixed(5)}`;
      if (tried.has(key)) continue;
      tried.add(key);
      const left: Pt[][] = [];
      const right: Pt[][] = [];
      let crosses = false;
      for (const p of polys) {
        let lo = 0;
        let hi = 0;
        for (const [x, y] of p) {
          const d = nx * x + ny * y - c;
          lo = Math.min(lo, d);
          hi = Math.max(hi, d);
        }
        if (lo < -eps && hi > eps) {
          crosses = true;
          break;
        }
        (hi > eps ? right : left).push(p);
      }
      if (!crosses && left.length && right.length) return splits(left) && splits(right);
    }
  return false;
}
