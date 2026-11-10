// EPP quilt edits (spec 027 US1-3): pieces placed, moved, painted, broken into patches; the quilt's
// 1U length, seam allowance and edge. `refresh` keeps the derived box and closing pieces current.
import type { Fill } from '../schema/coloring';
import type { EppEdge, EppLayout, EppPiece, InternalShape } from '../schema/epp';
import type { Quilt } from '../schema/quilt';
import type { Units } from '../schema/project';
import { createQuilt } from '../new-quilt';
import { newId } from '../ids';
import { expand, expandAll, rosetteLocal, type EppLookup } from './expand';
import { centroid, type Pose } from './geometry';
import { autoClose, cutRect, type Box } from './edge';
import { bbox } from './geometry';

/** Defaults (owner, 2026-11-10): 1U = 2 in (5 cm), seam allowance 3/8 in (1 cm). */
export const eppDefaults = (units: Units) =>
  units === 'cm' ? { unit: 5, seam: 1 } : { unit: 2, seam: 0.375 };

export function newEppQuilt(name: string, units: Units, unit?: number, seam?: number): Quilt {
  const d = eppDefaults(units);
  const layout: EppLayout = {
    style: 'epp',
    unit: unit ?? d.unit,
    seam: seam ?? d.seam,
    edge: { kind: 'none' },
  };
  return { ...createQuilt(name, layout, []), epp: { pieces: [] } };
}

export const isEpp = (q: Quilt): q is Quilt & { layout: EppLayout } => q.layout.style === 'epp';

/** The quilt's pieces as polygons in units (closing pieces not included). */
export const piecePolys = (q: Quilt, lookup: EppLookup) =>
  expandAll(q.epp?.pieces ?? [], lookup).map((l) => l.poly);

/**
 * Bring the derived parts up to date after an edit: the box (pieces' bounds, or the cut) and, with
 * Auto-close, the closing pieces. Call inside the same change as the edit.
 */
export function refresh(q: Quilt, lookup: EppLookup): Quilt {
  if (!isEpp(q) || !q.epp) return q;
  const polys = piecePolys(q, lookup);
  const edge = q.layout.edge;
  const closing = edge.kind === 'close' ? autoClose(polys) : [];
  const box: Box | undefined =
    edge.kind === 'cut' ? edge.rect : polys.length ? bbox(polys) : undefined;
  const epp = { ...q.epp };
  if (box) epp.box = box;
  else delete epp.box;
  if (closing.length) epp.closing = closing;
  else delete epp.closing;
  return { ...q, epp };
}

export function setEdge(q: Quilt, edge: EppEdge, lookup: EppLookup): Quilt {
  if (!isEpp(q)) return q;
  // Cut to size starts as the largest rectangle the pieces fill.
  const e: EppEdge =
    edge.kind === 'cut' && !edge.rect.some(Boolean)
      ? { kind: 'cut', rect: cutRect(piecePolys(q, lookup)) ?? [0, 0, 1, 1] }
      : edge;
  return refresh({ ...q, layout: { ...q.layout, edge: e } }, lookup);
}

export function addPiece(q: Quilt, piece: Omit<EppPiece, 'id'>): { quilt: Quilt; id: string } {
  const id = newId();
  return {
    quilt: { ...q, epp: { ...q.epp!, pieces: [...(q.epp?.pieces ?? []), { ...piece, id }] } },
    id,
  };
}

export const movePiece = (q: Quilt, id: string, pose: Partial<Pose>): Quilt => ({
  ...q,
  epp: {
    ...q.epp!,
    pieces: q.epp!.pieces.map((p) => {
      if (p.id !== id) return p;
      const out: EppPiece = { ...p };
      if (pose.at) out.at = pose.at;
      if (pose.turn !== undefined) out.turn = pose.turn;
      if (pose.scale !== undefined) out.scale = pose.scale;
      if (pose.mirror !== undefined) {
        if (pose.mirror) out.mirror = true;
        else delete out.mirror;
      }
      return out;
    }),
  },
});

export const removePieces = (q: Quilt, ids: ReadonlySet<string>): Quilt => ({
  ...q,
  epp: { ...q.epp!, pieces: q.epp!.pieces.filter((p) => !ids.has(p.id)) },
});

export type PaintScope = 'this' | 'all' | 'shape' | 'fill';

/**
 * Paint a piece (or one piece of a placed rosette): `this` that one; `all` every placement of the
 * same shape or rosette piece; `shape` every piece of that shape anywhere (rosettes too); `fill`
 * every piece showing the same fill now.
 */
export function paint(
  q: Quilt,
  lookup: EppLookup,
  pieceId: string,
  part: string | undefined,
  fill: Fill | null,
  scope: PaintScope,
): Quilt {
  const pieces = q.epp?.pieces ?? [];
  const target = pieces.find((p) => p.id === pieceId);
  if (!target) return q;
  const leaves = expandAll(pieces, lookup);
  const hit = leaves.find((l) => l.piece === pieceId && l.part === part);
  const key = (f: Fill | undefined) => JSON.stringify(f ?? null);
  const picks = leaves.filter((l) =>
    scope === 'this'
      ? l === hit
      : scope === 'fill'
        ? key(l.fill) === key(hit?.fill)
        : scope === 'shape'
          ? l.shape === hit?.shape
          : // all: the same piece of every placement of this shape or rosette
            target.rosette
            ? pieces.find((p) => p.id === l.piece)?.rosette === target.rosette && l.part === part
            : pieces.find((p) => p.id === l.piece)?.shape === target.shape,
  );
  const byPiece = new Map<string, Set<string>>();
  for (const l of picks) {
    const set = byPiece.get(l.piece) ?? new Set<string>();
    set.add(l.part ?? '');
    byPiece.set(l.piece, set);
  }
  return {
    ...q,
    epp: {
      ...q.epp!,
      pieces: pieces.map((p) => {
        const parts = byPiece.get(p.id);
        if (!parts) return p;
        const fills = { ...(p.fills ?? {}) };
        for (const k of parts) {
          if (fill) fills[k] = fill;
          else delete fills[k];
        }
        const out: EppPiece = { ...p, fills };
        if (!Object.keys(fills).length) delete out.fills;
        return out;
      }),
    },
  };
}

/** Break into patches: a placed rosette becomes its pieces as shape pieces (fills kept). */
export function breakIntoPatches(q: Quilt, lookup: EppLookup, id: string): Quilt {
  const p = q.epp?.pieces.find((x) => x.id === id);
  const r = p?.rosette ? lookup.rosette(p.rosette) : undefined;
  if (!p || !r) return q;
  // The rosette's own shapes come into the quilt's shapes.
  const own = new Map((r.shapes ?? []).map((s) => [s.id, s]));
  const added: InternalShape[] = [];
  const ids = new Map<string, string>();
  const leaves = expand(p, lookup);
  const local = rosetteLocal(r, lookup, p.coloring, p.fills);
  const pieces: EppPiece[] = leaves.map((l, i) => {
    const src = r.pieces.find((x) => x.id === l.part)!;
    let shape = src.shape;
    if (own.has(shape)) {
      if (!ids.has(shape)) {
        const nid = newId();
        ids.set(shape, nid);
        added.push({ ...own.get(shape)!, id: nid });
      }
      shape = ids.get(shape)!;
    }
    const mirror = !!src.mirror !== !!p.mirror;
    const fill = local[i]?.fill;
    return {
      id: newId(),
      shape,
      at: centroid(l.poly),
      turn: (p.mirror ? -src.turn : src.turn) + p.turn,
      scale: src.scale * p.scale,
      ...(mirror ? { mirror: true } : {}),
      ...(fill ? { fills: { '': fill } } : {}),
    };
  });
  const epp = {
    ...q.epp!,
    pieces: q.epp!.pieces.flatMap((x) => (x.id === id ? pieces : [x])),
  };
  if (added.length) epp.shapes = [...(q.epp?.shapes ?? []), ...added];
  return { ...q, epp };
}
