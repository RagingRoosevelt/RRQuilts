// Pieces to polygons (specs 027, 050): every placed shape and every piece of a placed rosette,
// with the fill it shows. Drawing, overlaps, snapping and printing all work on this.
import type { Fill } from '../schema/coloring';
import type { EppPiece, EppShape, InternalShape, Rosette, RosettePiece } from '../schema/epp';
import type { RrqDoc } from '../schema/project';
import { place, type Poly, type Pose } from './geometry';

export interface Leaf {
  /** The placed piece, and inside a rosette the rosette piece. */
  piece: string;
  part?: string;
  poly: Poly;
  fill?: Fill | undefined;
  /** Shape id (library or internal) and the leaf's own scale and mirror, for template counts. */
  shape: string;
  scale: number;
  mirror: boolean;
  /** Marked edges (not whole units), as indexes into `poly`. */
  marked?: number[] | undefined;
}

export interface EppLookup {
  shape(id: string): EppShape | InternalShape | undefined;
  rosette(id: string): Rosette | undefined;
}

/** Lookups over a project's shapes and rosettes, plus extra internal shapes (a quilt's). */
export function lookupEpp(
  p: Pick<RrqDoc['project'], 'eppShapes' | 'rosettes'>,
  extra: readonly InternalShape[] = [],
  library?: {
    eppShape?(id: string): EppShape | undefined;
    rosette?(id: string): Rosette | undefined;
  },
): EppLookup {
  const shapes = new Map<string, EppShape | InternalShape>();
  for (const s of p.eppShapes ?? []) shapes.set(s.id, s);
  for (const s of extra) shapes.set(s.id, s);
  const rosettes = new Map((p.rosettes ?? []).map((r) => [r.id, r]));
  return {
    shape: (id) => shapes.get(id) ?? library?.eppShape?.(id),
    rosette: (id) => rosettes.get(id) ?? library?.rosette?.(id),
  };
}

/** Marked edges keep their index unless the outline was reversed (a mirror). */
const markedOf = (s: EppShape | InternalShape, mirror: boolean) =>
  s.marked?.length
    ? s.marked.map((i) =>
        mirror ? (s.outline.length - 2 - i + s.outline.length) % s.outline.length : i,
      )
    : undefined;

/** A rosette's pieces in its own units (pose applied by the caller). */
export function rosetteLeaves(
  r: Rosette,
  lookup: EppLookup,
  coloring?: string,
  fills?: Record<string, Fill>,
): Leaf[] {
  const own = new Map((r.shapes ?? []).map((s) => [s.id, s]));
  const c = r.colorings.find((x) => x.id === coloring) ?? r.colorings[0];
  return r.pieces.flatMap((rp: RosettePiece) => {
    const s = own.get(rp.shape) ?? lookup.shape(rp.shape);
    if (!s) return [];
    const mirror = !!rp.mirror;
    return [
      {
        piece: r.id,
        part: rp.id,
        poly: place(s.outline, rp),
        fill: fills?.[rp.id] ?? c?.fills[rp.id],
        shape: rp.shape,
        scale: rp.scale,
        mirror,
        marked: markedOf(s, mirror),
      },
    ];
  });
}

/** Re-place points already placed around the origin by a further pose. */
function transform(poly: Poly, pose: Pose): Poly {
  const r = (pose.turn * Math.PI) / 180;
  const out = poly.map(([x, y]): [number, number] => {
    const mx = pose.mirror ? -x : x;
    const sx = mx * pose.scale;
    const sy = y * pose.scale;
    return [
      sx * Math.cos(r) - sy * Math.sin(r) + pose.at[0],
      sx * Math.sin(r) + sy * Math.cos(r) + pose.at[1],
    ];
  });
  return pose.mirror ? out.reverse() : out;
}

/** A rosette's leaves centered on the rosette's centroid (its own local frame). */
export function rosetteLocal(
  r: Rosette,
  lookup: EppLookup,
  coloring?: string,
  fills?: Record<string, Fill>,
) {
  const leaves = rosetteLeaves(r, lookup, coloring, fills);
  const pts = leaves.flatMap((l) => l.poly);
  const cx = pts.reduce((s, p) => s + p[0], 0) / (pts.length || 1);
  const cy = pts.reduce((s, p) => s + p[1], 0) / (pts.length || 1);
  return leaves.map((l) => ({
    ...l,
    poly: l.poly.map(([x, y]): [number, number] => [x - cx, y - cy]),
  }));
}

/** One placed piece as leaves in quilt units. */
export function expand(piece: EppPiece, lookup: EppLookup): Leaf[] {
  if (piece.shape) {
    const s = lookup.shape(piece.shape);
    if (!s) return [];
    const mirror = !!piece.mirror;
    return [
      {
        piece: piece.id,
        poly: place(s.outline, piece),
        fill: piece.fills?.[''] ?? ('fill' in s ? s.fill : undefined),
        shape: piece.shape,
        scale: piece.scale,
        mirror,
        marked: markedOf(s, mirror),
      },
    ];
  }
  const r = piece.rosette ? lookup.rosette(piece.rosette) : undefined;
  if (!r) return [];
  return rosetteLocal(r, lookup, piece.coloring, piece.fills).map((l) => ({
    ...l,
    piece: piece.id,
    poly: transform(l.poly, piece),
    scale: l.scale * piece.scale,
    mirror: l.mirror !== !!piece.mirror,
    marked:
      piece.mirror && l.marked
        ? l.marked.map((i) => (l.poly.length - 2 - i + l.poly.length) % l.poly.length)
        : l.marked,
  }));
}

export const expandAll = (pieces: readonly EppPiece[], lookup: EppLookup) =>
  pieces.flatMap((p) => expand(p, lookup));
