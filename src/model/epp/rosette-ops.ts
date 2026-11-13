// Rosette operations (spec 050): pieces added, rosettes copied in (never nested), gaps closed,
// colorings like a block's. Pure: rosette in, rosette out.
import { DEFAULT_LICENSE } from '../credits';
import { itemId } from '../identity';
import { newId } from '../ids';
import type { Fill } from '../schema/coloring';
import type { EppPiece, InternalShape, Rosette, RosettePiece } from '../schema/epp';
import { add, sub, type Pt } from '../geometry/path';
import { rosetteLocal, type EppLookup } from './expand';
import { centroid, type Pose, type Poly } from './geometry';
import { gapAt } from './faces';
import { pieceFor, piecePose } from './match';
import type { Clip } from './selection';

export function newRosette(name: string, author = '', license = DEFAULT_LICENSE): Rosette {
  return {
    id: itemId(author),
    notecard: { name },
    pieces: [],
    colorings: [{ id: newId(), name: 'Coloring 1', fills: {} }],
    ...(author ? { author } : {}),
    license,
  };
}

/** A shape placed in the rosette; `fill` goes into every coloring (the shape's default fill). */
export function addPiece(r: Rosette, shape: string, pose: Pose, fill?: Fill): Rosette {
  const piece: RosettePiece = {
    id: newId(),
    shape,
    at: pose.at,
    turn: pose.turn,
    scale: pose.scale,
    ...(pose.mirror ? { mirror: true } : {}),
  };
  return {
    ...r,
    pieces: [...r.pieces, piece],
    colorings: fill
      ? r.colorings.map((c) => ({ ...c, fills: { ...c.fills, [piece.id]: fill } }))
      : r.colorings,
  };
}

export const movePiece = (r: Rosette, id: string, pose: Partial<Pose>): Rosette => ({
  ...r,
  pieces: r.pieces.map((p) =>
    p.id !== id
      ? p
      : {
          ...p,
          ...(pose.at ? { at: pose.at } : {}),
          ...(pose.turn !== undefined ? { turn: pose.turn } : {}),
          ...(pose.scale !== undefined ? { scale: pose.scale } : {}),
          ...(pose.mirror !== undefined
            ? pose.mirror
              ? { mirror: true }
              : { mirror: false }
            : {}),
        },
  ),
});

/** Pieces removed, with their fills; internal shapes nothing uses any more go too. */
export function removePieces(r: Rosette, ids: ReadonlySet<string>): Rosette {
  const pieces = r.pieces.filter((p) => !ids.has(p.id));
  const used = new Set(pieces.map((p) => p.shape));
  const shapes = r.shapes?.filter((s) => used.has(s.id));
  const out: Rosette = {
    ...r,
    pieces,
    colorings: r.colorings.map((c) => ({
      ...c,
      fills: Object.fromEntries(Object.entries(c.fills).filter(([k]) => !ids.has(k))),
    })),
  };
  if (shapes?.length) out.shapes = shapes;
  else delete out.shapes;
  return out;
}

/**
 * Another rosette placed into this one becomes its pieces (spec 050 FR-005): fresh ids, its internal
 * shapes copied, the fills of its current coloring in every coloring here. No link back.
 */
export function copyIn(
  r: Rosette,
  other: Rosette,
  lookup: EppLookup,
  pose: Pose,
  coloring?: string,
): Rosette {
  const shapeIds = new Map((other.shapes ?? []).map((s) => [s.id, newId()]));
  const shapes: InternalShape[] = (other.shapes ?? []).map((s) => ({
    ...s,
    id: shapeIds.get(s.id)!,
  }));
  const leaves = rosetteLocal(other, lookup, coloring);
  const r0 = (pose.turn * Math.PI) / 180;
  const fills: Record<string, Fill> = {};
  const pieces: RosettePiece[] = [];
  for (const l of leaves) {
    const src = other.pieces.find((p) => p.id === l.part)!;
    // The leaf's centroid, carried through the pose, is where the copy sits.
    const c = centroid(l.poly);
    const mx = pose.mirror ? -c[0] : c[0];
    const at: Pt = [
      (mx * Math.cos(r0) - c[1] * Math.sin(r0)) * pose.scale + pose.at[0],
      (mx * Math.sin(r0) + c[1] * Math.cos(r0)) * pose.scale + pose.at[1],
    ];
    const id = newId();
    const mirror = !!src.mirror !== !!pose.mirror;
    pieces.push({
      id,
      shape: shapeIds.get(src.shape) ?? src.shape,
      at,
      turn: (pose.mirror ? -src.turn : src.turn) + pose.turn,
      scale: src.scale * pose.scale,
      ...(mirror ? { mirror: true } : {}),
    });
    if (l.fill) fills[id] = l.fill;
  }
  const out: Rosette = {
    ...r,
    pieces: [...r.pieces, ...pieces],
    colorings: r.colorings.map((c) => ({ ...c, fills: { ...c.fills, ...fills } })),
  };
  if (shapes.length) out.shapes = [...(r.shapes ?? []), ...shapes];
  return out;
}

type Known = readonly { id: string; outline: Poly }[];

/** Close space (spec 050): the gap under p becomes a piece. Null: no gap there. */
export function closeSpace(
  r: Rosette,
  polys: readonly Poly[],
  p: Pt,
  /** Shapes to use when the gap is one of them (yours, then the libraries'). */
  known: Known = [],
): Rosette | null {
  const gap = gapAt(polys, p);
  return gap ? fillGap(r, gap, known) : null;
}

/** An area (in rosette units) placed as a piece: a known shape, or a new internal one. */
export function fillGap(r: Rosette, gap: Poly, known: Known = []): Rosette {
  const { shape, pose, added } = pieceFor(gap, known);
  return addPiece(added ? { ...r, shapes: [...(r.shapes ?? []), added] } : r, shape, pose);
}

/**
 * Close space's line across a piece: the piece becomes `parts` (each a known shape or a new
 * internal one), each part in the piece's fill in every coloring.
 */
export function splitPiece(
  r: Rosette,
  id: string,
  parts: readonly Poly[],
  known: Known = [],
): Rosette {
  const old = r.pieces.find((p) => p.id === id);
  if (!old) return r;
  const made = parts.map((poly) => ({ id: newId(), ...pieceFor(poly, known) }));
  const pieces: RosettePiece[] = made.map((m) => ({
    id: m.id,
    shape: m.shape,
    ...piecePose(m.pose),
  }));
  const rest = r.pieces.filter((p) => p.id !== id);
  // The old piece's own shape goes when nothing else uses it.
  const shapes = [
    ...(r.shapes ?? []).filter((s) => s.id !== old.shape || rest.some((p) => p.shape === s.id)),
    ...made.flatMap((m) => (m.added ? [m.added] : [])),
  ];
  const out: Rosette = {
    ...r,
    pieces: [...rest, ...pieces],
    colorings: r.colorings.map((c) => {
      const { [id]: fill, ...fills } = c.fills;
      if (fill) for (const m of made) fills[m.id] = fill;
      return { ...c, fills };
    }),
  };
  if (shapes.length) out.shapes = shapes;
  else delete out.shapes;
  return out;
}

// --- Colorings (as a block's) ---

export function paintPiece(
  r: Rosette,
  coloring: string,
  piece: string,
  fill: Fill | null,
): Rosette {
  return {
    ...r,
    colorings: r.colorings.map((c) => {
      if (c.id !== coloring) return c;
      const fills = { ...c.fills };
      if (fill) fills[piece] = fill;
      else delete fills[piece];
      return { ...c, fills };
    }),
  };
}

export function addColoring(r: Rosette, copyOf?: string): { rosette: Rosette; id: string } {
  const from = r.colorings.find((c) => c.id === copyOf);
  const id = newId();
  const name = `Coloring ${r.colorings.length + 1}`;
  return {
    rosette: { ...r, colorings: [...r.colorings, { id, name, fills: { ...(from?.fills ?? {}) } }] },
    id,
  };
}

export const deleteColoring = (r: Rosette, id: string): Rosette =>
  r.colorings.length <= 1 ? r : { ...r, colorings: r.colorings.filter((c) => c.id !== id) };

export const renameColoring = (r: Rosette, id: string, name: string): Rosette => ({
  ...r,
  colorings: r.colorings.map((c) => (c.id === id ? { ...c, name } : c)),
});

/** Copy (spec 051): the pieces as quilt pieces, each with its fill in `coloring`; their shapes. */
export function copyPieces(r: Rosette, ids: ReadonlySet<string>, mid: Pt, coloring?: string): Clip {
  const c = r.colorings.find((x) => x.id === coloring) ?? r.colorings[0];
  const pieces: EppPiece[] = r.pieces
    .filter((p) => ids.has(p.id))
    .map((p) => {
      const f = c?.fills[p.id];
      return { ...p, ...(f ? { fills: { '': f } } : {}) };
    });
  const used = new Set(pieces.map((p) => p.shape));
  const fills = Object.fromEntries(
    pieces.map((p) => [
      p.id,
      Object.fromEntries(
        r.colorings.flatMap((k) => (k.fills[p.id] ? [[k.id, k.fills[p.id]!]] : [])),
      ),
    ]),
  );
  return {
    pieces,
    shapes: (r.shapes ?? []).filter((s) => used.has(s.id)),
    middle: mid,
    from: { rosette: r.id, fills },
  };
}

/**
 * Paste: copied shapes as pieces (their fill in every coloring), copied rosettes as their pieces
 * (never nested), the middle at `at`; the new pieces' ids.
 */
export function pastePieces(
  r: Rosette,
  clip: Clip,
  lookup: EppLookup,
  at: Pt,
): { rosette: Rosette; ids: string[] } {
  const d = sub(at, clip.middle);
  const have = new Set((r.shapes ?? []).map((s) => s.id));
  const extra = clip.shapes.filter((s) => !have.has(s.id));
  let out: Rosette = extra.length ? { ...r, shapes: [...(r.shapes ?? []), ...extra] } : r;
  for (const p of clip.pieces) {
    const pose: Pose = { at: add(p.at, d), turn: p.turn, scale: p.scale, mirror: !!p.mirror };
    const same = clip.from?.rosette === r.id ? clip.from.fills[p.id] : undefined;
    if (p.shape && same) {
      // Back into the rosette it came from: each coloring keeps its own fill.
      out = addPiece(out, p.shape, pose);
      const id = out.pieces.at(-1)!.id;
      out = {
        ...out,
        colorings: out.colorings.map((k) =>
          same[k.id] ? { ...k, fills: { ...k.fills, [id]: same[k.id]! } } : k,
        ),
      };
    } else if (p.shape) out = addPiece(out, p.shape, pose, p.fills?.['']);
    else {
      const other = p.rosette ? lookup.rosette(p.rosette) : undefined;
      if (other) out = copyIn(out, other, lookup, pose, p.coloring);
    }
  }
  const before = new Set(r.pieces.map((p) => p.id));
  return { rosette: out, ids: out.pieces.filter((p) => !before.has(p.id)).map((p) => p.id) };
}
