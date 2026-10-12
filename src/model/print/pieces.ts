// The pieces to cut: every patch of a block at a finished size, or of a whole quilt as placed.
import { placementMatrix } from '@/render/placement';
import { allPatches } from '../blocks/patches';
import { resolveColoring, fillKey } from '../coloring';
import {
  derivative,
  flattenLoop,
  pathToSegs,
  pointAt,
  pointInPolygon,
  type Pt,
} from '../geometry/path';
import { generateSlots } from '../layout/slots';
import type { Block } from '../schema/block';
import type { ColoringBody } from '../schema/coloring';
import type { RrqDoc } from '../schema/project';
import type { Quilt } from '../schema/quilt';
import { shapeKey, simplify } from './polygon';

export interface Piece {
  /** Finished outline in project units. */
  poly: Pt[];
  /** Has arcs or curves: templates only. */
  curved: boolean;
  /** Fill key (`fillKey`): "color:<id>", "fabric:<id>", or "none". */
  fill: string;
  /** Alignment marks: the middle of each curved edge, with its outward normal. */
  marks: { p: Pt; n: Pt }[];
}

const isCurved = (path: readonly (readonly (string | number)[])[]) =>
  path.some((c) => c[0] === 'A' || c[0] === 'C');

/** A block's patches at `size` (block design space scaled), colored by `coloring`. */
export function blockPieces(
  block: Block,
  size: [number, number],
  coloring?: ColoringBody,
): Piece[] {
  return allPatches(block).map((p) => {
    const tol = 1e-3 * Math.max(...size);
    const segs = pathToSegs(p.path, size);
    const poly = simplify(flattenLoop(segs, tol), 1e-4);
    const marks = segs
      .filter((s) => s.kind !== 'line')
      .map((s) => {
        const at = pointAt(s, 0.5);
        const [dx, dy] = derivative(s, 0.5);
        const l = Math.hypot(dx, dy) || 1;
        let n: Pt = [dy / l, -dx / l];
        const probe: Pt = [at[0] + n[0] * tol * 10, at[1] + n[1] * tol * 10];
        if (pointInPolygon(probe, poly)) n = [-n[0], -n[1]];
        return { p: at, n };
      });
    return { poly, curved: isCurved(p.path), fill: fillKey(coloring?.fills[p.id]), marks };
  });
}

/** Every piece of a quilt as placed (optionally only slots holding `blockId`). */
export function quiltPieces(doc: RrqDoc, quilt: Quilt, blockId?: string): Piece[] {
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  return generateSlots(quilt.layout, quilt.borders).slots.flatMap((slot) => {
    const content = quilt.layers[0].slots[slot.id];
    const block = content && blocks.get(content.block);
    if (!content || !block || (blockId && block.id !== blockId)) return [];
    const [a, b, c, d, e, f] = placementMatrix(slot, content, block);
    const coloring = resolveColoring(quilt.colorings[content.coloring], block);
    const at = ([x, y]: Pt): Pt => [a * x + c * y + e, b * x + d * y + f];
    const dir = ([x, y]: Pt): Pt => {
      const v: Pt = [a * x + c * y, b * x + d * y];
      const l = Math.hypot(...v) || 1;
      return [v[0] / l, v[1] / l];
    };
    return blockPieces(block, block.size, coloring).map((piece) => ({
      ...piece,
      poly: piece.poly.map(at),
      marks: piece.marks.map((m) => ({ p: at(m.p), n: dir(m.n) })),
    }));
  });
}

/** A template laid out for printing, in its own box (0…w, 0…h), project units. */
export interface PlacedPiece {
  key: string;
  letter: string;
  /** Cutting line and sewing line. */
  cut: Pt[];
  sew: Pt[];
  center: Pt;
  /** Room for labels: radius of the largest circle around `center` inside the sewing line. */
  room: number;
  /** Grain direction (unit vector) and arrow length. */
  grain: Pt;
  grainLength: number;
  /** "Cut 4 Cream, 2 Navy" */
  note: string;
  /** "3″ square" */
  size: string;
  /** Pale wash of its fabric (one fabric only). */
  tint?: string | undefined;
  marks: { p: Pt; n: Pt }[];
  x: number;
  y: number;
  w: number;
}

export interface Template {
  letter: string;
  /** Outline of the first such piece. */
  poly: Pt[];
  curved: boolean;
  marks: { p: Pt; n: Pt }[];
  /** How many to cut, by fill key. */
  counts: Map<string, number>;
}

const letterOf = (i: number): string =>
  i < 26 ? String.fromCharCode(65 + i) : letterOf(Math.floor(i / 26) - 1) + letterOf(i % 26);

/**
 * Distinct shapes, lettered in order of first appearance (after `prefix`, e.g. the block's number
 * in a quilt: 2A, 2B…), with counts per fill.
 */
export function templates(pieces: Piece[], prefix = ''): Template[] {
  const byKey = new Map<string, Template>();
  for (const p of pieces) {
    const key = shapeKey(p.poly);
    let t = byKey.get(key);
    if (!t) {
      t = {
        letter: prefix + letterOf(byKey.size),
        poly: p.poly,
        curved: p.curved,
        marks: p.marks,
        counts: new Map(),
      };
      byKey.set(key, t);
    }
    t.counts.set(p.fill, (t.counts.get(p.fill) ?? 0) + 1);
  }
  return [...byKey.values()];
}
