// A 3D EPP quilt's net (spec 027 User Story 7): its pieces as fold outlines and its explicit seams.
// Seam ends name a shape edge (`EppEdgeRef.edge`, corner i to i + 1 of the shape's outline), so a
// seam stays on its edge when the piece turns or mirrors (a mirror reverses the placed outline).
// Placed outlines are y down, the fold's y up: flipped, both run counter-clockwise on screen.
import type { EppEdgeRef, EppSeam } from '../schema/epp';
import type { Quilt } from '../schema/quilt';
import type { Pt } from '../geometry/path';
import { expandAll, type EppLookup, type Leaf } from './expand';
import type { Net } from './fold';

/** Edge i of an outline once the outline is reversed (the map is its own inverse). */
const reversed = (n: number, i: number) => (2 * n - 2 - i) % n;

/** A shape edge's index in a leaf's placed outline, and back (the same map). */
export const polyEdge = (leaf: Leaf, edge: number) =>
  leaf.mirror ? reversed(leaf.poly.length, edge) : edge;

/** The seam end for edge `k` of a leaf's placed outline. */
export const edgeRef = (leaf: Leaf, k: number): EppEdgeRef => ({
  piece: leaf.piece,
  ...(leaf.part ? { part: leaf.part } : {}),
  edge: polyEdge(leaf, k),
});

export const leafOf = (
  leaves: readonly Leaf[],
  ref: { piece: string; part?: string | undefined },
) => leaves.findIndex((l) => l.piece === ref.piece && l.part === ref.part);

const lengthOf = (poly: Pt[], k: number) => {
  const a = poly[k]!;
  const b = poly[(k + 1) % poly.length]!;
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
};

/** A seam end as (leaf index, edge of the leaf's placed outline), or null when it no longer fits. */
export function endAt(leaves: readonly Leaf[], ref: EppEdgeRef): [number, number] | null {
  const i = leafOf(leaves, ref);
  const leaf = leaves[i];
  if (!leaf || ref.edge >= leaf.poly.length) return null;
  return [i, polyEdge(leaf, ref.edge)];
}

/** The seams that still fit (both pieces there, equal edges, no edge sewn twice), placed. */
export function seamsAt(
  leaves: readonly Leaf[],
  seams: readonly EppSeam[],
): { seam: EppSeam; a: [number, number]; b: [number, number] }[] {
  const used = new Set<string>();
  return seams.flatMap((seam) => {
    const a = endAt(leaves, seam.a);
    const b = endAt(leaves, seam.b);
    if (!a || !b || a[0] === b[0]) return [];
    const la = lengthOf(leaves[a[0]]!.poly, a[1]);
    const lb = lengthOf(leaves[b[0]]!.poly, b[1]);
    const ka = a.join(':');
    const kb = b.join(':');
    if (Math.abs(la - lb) > 1e-6 || used.has(ka) || used.has(kb)) return [];
    used.add(ka);
    used.add(kb);
    return [{ seam, a, b }];
  });
}

/** The quilt's pieces as a net to fold, with the leaves they came from. */
export function quiltNet(q: Quilt, lookup: EppLookup): { net: Net; leaves: Leaf[] } {
  const leaves = expandAll(q.epp?.pieces ?? [], lookup);
  const pieces = leaves.map((l) => l.poly.map(([x, y]): Pt => [x, -y]));
  const toNet = ([piece, edge]: [number, number]) => ({ piece, edge });
  const seams = seamsAt(leaves, q.epp?.seams ?? []).map((s) => ({ a: toNet(s.a), b: toNet(s.b) }));
  const f = q.epp?.front ? leafOf(leaves, q.epp.front) : -1;
  return { net: { pieces, seams, ...(f >= 0 ? { front: f } : {}) }, leaves };
}

/** Seam k's color in the 2D view and printouts. */
export const seamColor = (k: number) => `hsl(${(k * 47 + 200) % 360} 70% 42%)`;

/**
 * Each explicit seam's two edges with its number beside each, outside the piece (outlines run
 * counter-clockwise on screen, so outside is to an edge's right), `off` units out: for the Design
 * tab and the printed assembly picture. Two edges meeting at a corner (petals of a rosette) get
 * one number between them (`label` null on the second).
 */
export function seamMarks(leaves: readonly Leaf[], seams: readonly EppSeam[], off: number) {
  return seamsAt(leaves, seams).flatMap((s, k) => {
    const [ma, mb] = [s.a, s.b].map(([i, e]) => {
      const poly = leaves[i]!.poly;
      const a = poly[e]!;
      const b = poly[(e + 1) % poly.length]!;
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const label: Pt | null = [
        (a[0] + b[0]) / 2 + ((a[1] - b[1]) / L) * off,
        (a[1] + b[1]) / 2 + ((b[0] - a[0]) / L) * off,
      ];
      return { n: k + 1, color: seamColor(k), edge: [a, b] as [Pt, Pt], label };
    }) as [SeamMark, SeamMark];
    const [p, q] = [ma.label!, mb.label!];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 3 * off) {
      ma.label = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      mb.label = null;
    }
    return [ma, mb];
  });
}
interface SeamMark {
  n: number;
  color: string;
  edge: [Pt, Pt];
  label: Pt | null;
}
