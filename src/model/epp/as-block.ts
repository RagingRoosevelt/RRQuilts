// Rosettes in block quilts (spec 027 FR-015): a rosette whose outline is exactly a block space's
// shape (square, triangle, 60° diamond, hexagon) fills block spaces through a hidden block made from
// it, rebuilt on every change like a data block's variants. Owner, 2026-11-12: "require that the
// edges are actually the required shape, not the required shape only after cutting. so for example
// if it counts as a hexagon, it needs a perimeter with 6 fully straight edges."
import { ASPECT, SHAPE_OUTLINE, type BlockShape } from '../blocks/shape';
import type { Pt } from '../geometry/path';
import type { Block, Node, Patch, Segment } from '../schema/block';
import type { Rosette } from '../schema/epp';
import { rosetteLocal, type EppLookup } from './expand';
import { overlapping, type Poly } from './geometry';

export type FitShape = BlockShape | 'square';

/** The hidden block of rosette `id`, and back. */
export const rosetteBlockId = (id: string) => `${id}-epp`;
export const rosetteOfBlockId = (id: string) => (id.endsWith('-epp') ? id.slice(0, -4) : null);

const area = (p: readonly Pt[]) =>
  Math.abs(
    p.reduce(
      (s, a, i) => s + a[0] * p[(i + 1) % p.length]![1] - p[(i + 1) % p.length]![0] * a[1],
      0,
    ),
  ) / 2;

/** Convex hull, counter-clockwise in raw coordinates, without points along its edges. */
function hull(points: readonly Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out.at(-2)!, out.at(-1)!, p) <= 1e-9) out.pop();
      out.push(p);
    }
    return out.slice(0, -1);
  };
  return [...half(pts), ...half(pts.reverse())];
}

const angleAt = (p: readonly Pt[], i: number) => {
  const n = p.length;
  const [a, b, c] = [p[(i - 1 + n) % n]!, p[i]!, p[(i + 1) % n]!];
  const u: Pt = [a[0] - b[0], a[1] - b[1]];
  const v: Pt = [c[0] - b[0], c[1] - b[1]];
  return (
    (Math.acos((u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v)) * 180) / Math.PI
  );
};

/**
 * Which block space shape these pieces make exactly (their union is the shape: no gap, no overlap,
 * every side one straight edge), and the pieces turned upright in the unit square of the shape's
 * box (as a shaped block's drawing), with the box's size in units. Null when they make none.
 */
export function rosetteFit(
  polys: readonly Poly[],
): { shape: FitShape; polys: Poly[]; size: [number, number] } | null {
  if (!polys.length || overlapping(polys).size) return null;
  const h = hull(polys.flat());
  const ha = area(h);
  if (ha < 1e-9 || Math.abs(polys.reduce((s, p) => s + area(p), 0) - ha) > 1e-6 * ha) return null;
  const sides = h.map((a, i) =>
    Math.hypot(h[(i + 1) % h.length]![0] - a[0], h[(i + 1) % h.length]![1] - a[1]),
  );
  if (Math.max(...sides) - Math.min(...sides) > 1e-6 * Math.max(...sides)) return null;
  const angles = h.map((_, i) => angleAt(h, i));
  const all = (deg: number) => angles.every((a) => Math.abs(a - deg) < 1e-4);
  const shape: FitShape | null =
    h.length === 3 && all(60)
      ? 'triangle'
      : h.length === 6 && all(120)
        ? 'hexagon'
        : h.length === 4 && all(90)
          ? 'square'
          : h.length === 4 &&
              angles.every((a) => Math.abs(a - 60) < 1e-4 || Math.abs(a - 120) < 1e-4)
            ? 'diamond60'
            : null;
  if (!shape) return null;
  // Upright as block shapes stand: a corner straight up (a diamond's sharp one), a square's sides level.
  const c: Pt = [
    h.reduce((s, p) => s + p[0], 0) / h.length,
    h.reduce((s, p) => s + p[1], 0) / h.length,
  ];
  const top = shape === 'diamond60' ? angles.findIndex((a) => a < 90) : 0;
  const t =
    shape === 'square'
      ? -Math.atan2(h[1]![1] - h[0]![1], h[1]![0] - h[0]![0])
      : -Math.PI / 2 - Math.atan2(h[top]![1] - c[1], h[top]![0] - c[0]);
  const turn = ([x, y]: Pt): Pt => {
    const [dx, dy] = [x - c[0], y - c[1]];
    return [dx * Math.cos(t) - dy * Math.sin(t), dx * Math.sin(t) + dy * Math.cos(t)];
  };
  const up = h.map(turn);
  const [x0, y0] = [Math.min(...up.map((p) => p[0])), Math.min(...up.map((p) => p[1]))];
  const [w, ht] = [Math.max(...up.map((p) => p[0])) - x0, Math.max(...up.map((p) => p[1])) - y0];
  const aspect = shape === 'square' ? 1 : ASPECT[shape];
  if (Math.abs(ht / w - aspect) > 1e-6) return null;
  const unit = ([x, y]: Pt): Pt => [(x - x0) / w, (y - y0) / ht];
  return { shape, polys: polys.map((p) => p.map((q) => unit(turn(q)))), size: [w, ht] };
}

/** The unit-square outline of a fitted shape (a square: the unit square). */
export const fitOutline = (shape: FitShape): Pt[] =>
  shape === 'square'
    ? [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ]
    : SHAPE_OUTLINE[shape];

/**
 * The hidden block a rosette fills block spaces with: its pieces as patches (ids = the rosette's
 * piece ids, so its colorings carry over), sized 1 project unit per U. Null when it fits no shape.
 */
export function rosetteBlock(r: Rosette, lookup: EppLookup): Block | null {
  const leaves = rosetteLocal(r, lookup);
  if (leaves.length !== r.pieces.length) return null;
  const fit = rosetteFit(leaves.map((l) => l.poly));
  if (!fit) return null;
  const nodes: Node[] = [];
  const at = new Map<string, string>();
  const node = ([x, y]: Pt) => {
    const k = `${x.toFixed(6)},${y.toFixed(6)}`;
    if (!at.has(k)) {
      const id = `n${nodes.length + 1}`;
      at.set(k, id);
      nodes.push({ id, x, y });
    }
    return at.get(k)!;
  };
  const segments: Segment[] = [];
  const seen = new Set<string>();
  for (const poly of fit.polys)
    poly.forEach((a, i) => {
      const [from, to] = [node(a), node(poly[(i + 1) % poly.length]!)];
      const k = [from, to].sort().join(' ');
      if (from === to || seen.has(k)) return;
      seen.add(k);
      segments.push({ id: `s${segments.length + 1}`, from, to, kind: 'line' });
    });
  const patches: Patch[] = fit.polys.map((poly, i) => ({
    id: leaves[i]!.part!,
    path: [
      ['M', poly[0]![0], poly[0]![1]],
      ...poly.slice(1).map((p): ['L', number, number] => ['L', p[0], p[1]]),
      ['Z'],
    ],
  }));
  return {
    id: rosetteBlockId(r.id),
    notecard: { name: r.notecard.name, tags: ['system'] },
    ...(r.author ? { author: r.author } : {}),
    ...(r.license ? { license: r.license } : {}),
    ...(r.credits ? { credits: r.credits } : {}),
    size: fit.size,
    ...(fit.shape === 'square' ? {} : { shape: fit.shape }),
    colorings: r.colorings,
    rosette: r.id,
    kind: 'seam',
    drawing: { nodes, segments },
    patches,
  };
}

/**
 * The project's blocks with the hidden rosette blocks its quilts place (`used`) made or rebuilt from
 * their rosettes, and unused ones gone. A rosette that no longer fits keeps the block it had. Null:
 * nothing changes.
 */
export function syncRosetteBlocks(
  blocks: readonly Block[],
  used: ReadonlySet<string>,
  rosette: (id: string) => Rosette | undefined,
  lookup: EppLookup,
): Block[] | null {
  let changed = false;
  const out = blocks.filter((b) => {
    const keep = !b.rosette || used.has(b.id);
    changed ||= !keep;
    return keep;
  });
  for (const id of used) {
    const rid = rosetteOfBlockId(id);
    const r = rid ? rosette(rid) : undefined;
    const made = r && rosetteBlock(r, lookup);
    if (!made) continue;
    const i = out.findIndex((b) => b.id === id);
    if (i < 0) out.push(made);
    else if (JSON.stringify(out[i]) !== JSON.stringify(made)) out[i] = made;
    else continue;
    changed = true;
  }
  return changed ? out : null;
}
