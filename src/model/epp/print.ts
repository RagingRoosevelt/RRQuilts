// EPP printing (spec 050 FR-006a, spec 027 US6): a rosette (or a shape, as a rosette of one piece) as
// print pieces at a 1U length. Templates then come out per shape, size, mirror and fill; paper
// templates are the pieces, fabric templates the pieces grown by the seam allowance.
import { fillKey } from '../coloring';
import type { Pt } from '../geometry/path';
import type { Piece } from '../print/pieces';
import type { EppShape, Rosette } from '../schema/epp';
import type { Quilt } from '../schema/quilt';
import type { Fill } from '../schema/coloring';
import { bbox } from './geometry';
import { expandAll, rosetteLocal, type EppLookup } from './expand';

/** A shape as a rosette of one piece (its fill in the one coloring). */
export const shapeAsRosette = (shape: EppShape): Rosette => ({
  ...shape,
  pieces: [{ id: 'p1', shape: shape.id, at: [0, 0], turn: 0, scale: 1 }],
  colorings: [{ id: 'c1', fills: shape.fill ? { p1: shape.fill } : {} }],
});

/** One rosette's pieces at `unit` project units per 1U, starting at 0, 0, and its size. */
export function rosettePieces(r: Rosette, lookup: EppLookup, unit: number, coloring?: string) {
  const leaves = rosetteLocal(r, lookup, coloring);
  const scaled = leaves.map((l) => l.poly.map(([x, y]): Pt => [x * unit, y * unit]));
  const xs = scaled.flat().map((p) => p[0]);
  const ys = scaled.flat().map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const pieces: Piece[] = scaled.map((poly, i) => ({
    poly: poly.map(([x, y]): Pt => [x - x0, y - y0]),
    curved: false,
    fill: fillKey(leaves[i]!.fill),
    marks: [],
  }));
  return { pieces, size: [Math.max(...xs) - x0, Math.max(...ys) - y0] as [number, number] };
}

/**
 * An EPP quilt's pieces to cut (spec 027 US6), in project units: every piece and closing piece,
 * through the shown colorway (`swap`); pieces wholly outside a Cut to size are left out (counted).
 */
export function eppQuiltPieces(
  q: Quilt,
  lookup: EppLookup,
  swap: (f: Fill | undefined) => Fill | undefined = (f) => f,
) {
  if (q.layout.style !== 'epp' || !q.epp) return { pieces: [] as Piece[], outside: 0 };
  const u = q.layout.unit;
  const edge = q.layout.edge;
  const close = edge.kind === 'close' ? edge.fill : undefined;
  const all = [
    ...expandAll(q.epp.pieces, lookup).map((l) => ({ poly: l.poly, fill: l.fill })),
    ...(q.epp.closing ?? []).map((c) => ({ poly: c.outline, fill: close })),
  ];
  const inside = (poly: Pt[]) => {
    if (edge.kind !== 'cut') return true;
    const [x0, y0, x1, y1] = bbox([poly]);
    const [a, b, c, d] = edge.rect;
    return x1 > a && x0 < c && y1 > b && y0 < d;
  };
  const kept = all.filter((p) => inside(p.poly));
  const pieces: Piece[] = kept.map((p) => ({
    poly: p.poly.map(([x, y]): Pt => [x * u, y * u]),
    curved: false,
    fill: fillKey(swap(p.fill)),
    marks: [],
  }));
  return { pieces, outside: all.length - kept.length };
}
