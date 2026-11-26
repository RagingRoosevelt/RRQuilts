// The traditional EPP demo (owner, 2026-11-23: "add a demo for traditional epp patterns. do a
// grandma's garden with little groups of four green hexis between the flowers for leaves. do a cut
// border of green blocks", "do an epp diamond lone star", "and then do the optical illusion cube
// corners in the same epp demo", "I believe it's built from half hexis"): public/demo/
// traditional-epp.rrq, opened by /?open_demo=traditional-epp.rrq. EPP_DEMO=<file> writes it.
import { writeFileSync } from 'node:fs';
import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { starterKit } from '@/dev/fill-quilt';
import { applyTool, type ToolState } from '@/editor/actions';
import { DEFAULT_LICENSE } from '@/model/credits';
import { expandAll, lookupEpp, type EppLookup } from '@/model/epp/expand';
import { centroid } from '@/model/epp/geometry';
import { matchShape, piecePose } from '@/model/epp/match';
import { addPiece, newEppQuilt, setEdge } from '@/model/epp/quilt-ops';
import { newRosette } from '@/model/epp/rosette-ops';
import type { Pt } from '@/model/geometry/path';
import { parseProject, serializeProject } from '@/model/io';
import { generateFor } from '@/model/layout/slots';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import type { EppShape, Rosette } from '@/model/schema/epp';
import type { RrqDoc } from '@/model/schema/project';
import type { Border, Quilt } from '@/model/schema/quilt';

const out = process.env.EPP_DEMO;
const AUTHOR = 'RRQuilts contributors';
const S3 = Math.sqrt(3);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const fill = (color: string) => ({ color: `rrquilts.${slug(color)}` });
const deg = (a: number): Pt => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
const add = (...ps: Pt[]): Pt => ps.reduce<Pt>((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]);
const mul = (p: Pt, k: number): Pt => [p[0] * k, p[1] * k];
const neg = (p: Pt): Pt => [-p[0], -p[1]];

type Piece = { pts: Pt[]; color: string };
type Known = (EppShape & { category: string })[];

/** An EPP quilt of `pieces` (outlines in units, y up, counter-clockwise), each a built-in shape. */
function shapesQuilt(name: string, unit: number, pieces: Piece[], known: Known): Quilt {
  let q = newEppQuilt(name, 'in', unit);
  for (const p of pieces) {
    const m = matchShape(
      p.pts.map(([x, y]): Pt => [x, -y]),
      known,
    );
    if (!m) throw new Error(`${name}: no shape for a ${p.pts.length}-sided piece`);
    q = addPiece(q, {
      shape: m.shape.id,
      ...piecePose(m.pose),
      fills: { '': fill(p.color) },
    }).quilt;
  }
  return q;
}

// ---------- Grandmother's Flower Garden ----------
/** Hexagon cells (axial q, r) to centers: the built-in Hexagon has flat tops, so neighbors sit at
 *  30°, 90°, … */
const cell = (q: number, r: number) => add(mul(deg(30), S3 * q), mul(deg(90), S3 * r));
const ring = (q: number, r: number) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
/** 19-hexagon flowers on this grid leave exactly one 4-hexagon diamond between them: a leaf. */
const V1: [number, number] = [1, 4];
const V2: [number, number] = [-5, 3];
const LEAF_AT: [number, number] = [-4, 0];
const LEAF: [number, number][] = [
  [0, 0],
  [1, -1],
  [1, 0],
  [2, -1],
];
/** Flower colorings: name, first ring, outer ring (a yellow middle in all). */
const FLOWERS: [string, string, string][] = [
  ['Red', 'Red', 'Pink'],
  ['Blue', 'Blue', 'Powder Blue'],
  ['Purple', 'Purple', 'Lilac'],
  ['Orange', 'Orange', 'Peach'],
  ['Teal', 'Teal', 'Seafoam'],
  ['Rose', 'Rose', 'Blush'],
];
const GREENS = ['Green', 'Forest', 'Sage'];
const HEX = 'rrquilts.epp-hexagon';

function hexRosette(name: string, cells: [number, number][], colorings: [string, string[]][]) {
  const pieces = cells.map(([q, r], i) => ({
    id: `h${i + 1}`,
    shape: HEX,
    at: cell(q, r),
    turn: 0,
    scale: 1,
  }));
  return {
    ...newRosette(name, AUTHOR, DEFAULT_LICENSE),
    pieces,
    colorings: colorings.map(([cname, colors], k) => ({
      id: `c${k + 1}`,
      name: cname,
      fills: Object.fromEntries(pieces.map((p, i) => [p.id, fill(colors[i]!)])),
    })),
  } satisfies Rosette;
}

/** A flower's hexagons: the middle and two rings. */
const FLOWER: [number, number][] = [];
for (let q = -2; q <= 2; q++)
  for (let r = -2; r <= 2; r++) if (ring(q, r) <= 2) FLOWER.push([q, r]);

const flowerRosette = (): Rosette =>
  hexRosette(
    'Garden Flower',
    FLOWER,
    FLOWERS.map(([name, a, b]) => [name, FLOWER.map(([q, r]) => ['Yellow', a, b][ring(q, r)]!)]),
  );
/** Ends lighter than the middle pair, like a leaf's vein. */
const leafRosette = (): Rosette =>
  hexRosette('Leaf', LEAF, [['Leaf', ['Green', 'Forest', 'Forest', 'Green']]]);

/** The garden's cut, in units (1U = 1 in: 36 × 45 in inside the border). */
const GARDEN: [number, number, number, number] = [0, 0, 36, 45];

function garden(flower: Rosette, leaf: Rosette, lookup: EppLookup): Quilt {
  let q = newEppQuilt('Grandmother’s Flower Garden', 'in', 1);
  const [x0, y0, x1, y1] = GARDEN;
  // Only flowers and leaves with a hexagon reaching into the cut (1U from a hexagon's middle to a
  // corner).
  const inCut = (cells: [number, number][]) =>
    cells.some(([cq, cr]) => {
      const [x, y] = cell(cq, cr);
      return x > x0 - 1 && x < x1 + 1 && y > y0 - 1 && y < y1 + 1;
    });
  const from = (cells: [number, number][], q0: number, r0: number) =>
    cells.map(([a, b]): [number, number] => [q0 + a, r0 + b]);
  for (let i = -12; i <= 12; i++)
    for (let j = -12; j <= 12; j++) {
      const [lq, lr] = [i * V1[0] + j * V2[0], i * V1[1] + j * V2[1]];
      const at = cell(lq, lr);
      if (inCut(from(FLOWER, lq, lr)))
        q = addPiece(q, {
          rosette: flower.id,
          at,
          turn: 0,
          scale: 1,
          coloring: `c${((((i + 2 * j) % 6) + 6) % 6) + 1}`,
        }).quilt;
      const leafCells = from(LEAF, lq + LEAF_AT[0], lr + LEAF_AT[1]);
      const mid = centroid(leafCells.map(([a, b]) => cell(a, b)));
      if (inCut(leafCells)) q = addPiece(q, { rosette: leaf.id, at: mid, turn: 0, scale: 1 }).quilt;
    }
  q = setEdge(q, { kind: 'cut', rect: GARDEN, manual: true }, lookup);
  return { ...q, borders: [{ style: 'blocks', sides: [3, 3, 3, 3] }] };
}

// ---------- Lone Star ----------
/** Center out, one color per ring of diamonds (i + j). */
const STAR_RINGS = [
  'Butter',
  'Yellow',
  'Gold',
  'Orange',
  'Coral',
  'Red',
  'Barn Red',
  'Plum',
  'Purple',
  'Indigo',
  'Navy',
];
/** Eight points of n × n 45° diamonds; Auto-close adds the setting squares and triangles. */
function loneStar(n: number): Piece[] {
  const out: Piece[] = [];
  for (let k = 0; k < 8; k++) {
    const [u, v] = [deg(45 * k), deg(45 * k + 45)];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const p = add(mul(u, i), mul(v, j));
        out.push({ pts: [p, add(p, u), add(p, u, v), add(p, v)], color: STAR_RINGS[i + j]! });
      }
  }
  return out;
}

// ---------- Cube corners ----------
/**
 * The cube with a corner cut away: a 2U hexagon whose three faces are L shapes of two half
 * hexagons each (light top, medium left, dark right), around a 1U hole of three 60° diamonds
 * shaded the other way round (each the shade of the face it's parallel to). It reads as a big cube
 * missing a corner or a small cube sitting in a corner.
 */
const SHADES = { top: 'Powder Blue', left: 'Denim', right: 'Navy' };
function cubeCorner(c: Pt): Piece[] {
  const [a, b, d] = [deg(30), deg(150), deg(270)];
  const at = (...ps: Pt[]) => ps.map((p) => add(c, p));
  const face = (p: Pt, q: Pt, color: string): Piece[] => [
    { pts: at(p, mul(p, 2), add(mul(p, 2), mul(q, 2)), add(p, q)), color },
    { pts: at(q, add(p, q), add(mul(p, 2), mul(q, 2)), mul(q, 2)), color },
    { pts: at([0, 0], neg(p), neg(add(p, q)), neg(q)), color },
  ];
  return [...face(a, b, SHADES.top), ...face(b, d, SHADES.left), ...face(d, a, SHADES.right)].map(
    (x) => ({ ...x, pts: ccw(x.pts) }),
  );
}
const area = (pts: Pt[]) =>
  pts.reduce((s, p, i) => {
    const q = pts[(i + 1) % pts.length]!;
    return s + p[0] * q[1] - q[0] * p[1];
  }, 0);
const ccw = (pts: Pt[]) => (area(pts) > 0 ? pts : [...pts].reverse());

/** The cubes' cut, y up, in units (1U = 1.5 in: 39 × 45 in). */
const CUBES = { w: 26, h: 30 };
function cubes(known: Known, lookup: EppLookup): Quilt {
  const pieces: Piece[] = [];
  for (let j = -1; j * 3 <= CUBES.h + 3; j++)
    for (let i = -10; i <= 10; i++) {
      const c = add(mul([2 * S3, 0], i), mul([S3, 3], j));
      // Only cubes reaching into the cut (2U from the middle to a corner, √3 to a side).
      if (c[0] > -S3 && c[0] < CUBES.w + S3 && c[1] > -2 && c[1] < CUBES.h + 2)
        pieces.push(...cubeCorner(c));
    }
  const q = shapesQuilt('Cube corners', 1.5, pieces, known);
  return {
    ...setEdge(q, { kind: 'cut', rect: [0, -CUBES.h, CUBES.w, 0], manual: true }, lookup),
    borders: [plain(1), plain(3)],
  };
}

const plain = (w: number): Border => ({ style: 'long-horizontal', sides: [w, w, w, w] });
/** Border colors: the garden's squares by place, the others by border (inside out). */
const BORDER_COLORS: Record<string, (id: string, i: number) => string> = {
  'Grandmother’s Flower Garden': (_, i) => GREENS[i % GREENS.length]!,
  'Lone Star': (id) => (id.startsWith('border:1:') ? 'Gold' : 'Navy'),
  'Cube corners': (id) => (id.startsWith('border:1:') ? 'Powder Blue' : 'Navy'),
};

async function demo(): Promise<RrqDoc> {
  const kit = await starterKit();
  const { shapes } = eppStarters();
  const flower = flowerRosette();
  const leaf = leafRosette();
  const lookup = lookupEpp({ eppShapes: shapes, rosettes: [flower, leaf] });
  const star: Quilt = {
    ...setEdge(
      shapesQuilt('Lone Star', 2, loneStar(6), shapes),
      { kind: 'close', fill: fill('Cream') },
      lookup,
    ),
    borders: [plain(1), plain(4)],
  };
  const NOTES: Record<string, string> = {
    'Grandmother’s Flower Garden':
      'Flowers of 19 hexagons (Garden Flower rosette, six colorings) with a leaf of four green hexagons between them (Leaf rosette), cut straight at 36 × 45 in, with a border of 3 in green squares. 1 in hexagons.',
    'Lone Star':
      'Eight points of 6 × 6 45° diamonds, each ring of diamonds its own color from butter in the middle to navy at the tips. Auto-close fills the setting squares and triangles in cream. 2 in diamonds, 41 in square, with a 1 in gold and a 4 in navy border (51 in square).',
    'Cube corners':
      'An optical illusion in half hexagons: each big hexagon is a cube with a corner cut away (or a small cube in a corner). Its faces are two half hexagons each, light, medium and dark, around three 60° diamonds shaded the other way round. 1½ in edges, cut at 39 × 45 in, with a 1 in powder blue and a 3 in navy border (47 × 53 in).',
  };
  const quilts = [garden(flower, leaf, lookup), star, cubes(shapes, lookup)].map((q): Quilt => ({
    ...q,
    author: AUTHOR,
    license: DEFAULT_LICENSE,
    notecard: { ...q.notecard, notes: NOTES[q.notecard.name]! },
  }));
  let doc = produce(createProject('Traditional EPP demo', 'in', 'demo'), (d) => {
    d.project.license = DEFAULT_LICENSE;
    d.project.author = AUTHOR;
    d.project.rosettes = [flower, leaf];
    d.project.quilts.push(...quilts);
    syncDraft(d, kit.lookup);
  });
  // Borders painted as a quilter would, space by space.
  for (const q of quilts) {
    const spaces = generateFor(q).slots;
    spaces.forEach((s, i) => {
      const tool: ToolState = {
        tool: 'paint',
        scope: 'this',
        block: null,
        color: fill(BORDER_COLORS[q.notecard.name]!(s.id, i)).color,
        library: kit.lookup,
      };
      const r = applyTool(doc, q.id, spaces, { slotId: s.id }, tool);
      if (!r.doc) throw new Error(`${q.notecard.name} border ${s.id}: ${r.message}`);
      doc = produce(r.doc, (x) => void syncDraft(x, kit.lookup));
    });
  }
  return doc;
}

describe('traditional EPP demo', () => {
  it('garden, Lone Star and cube corners, no overlaps or gaps; the file opens clean', async () => {
    const doc = await demo();
    const lookup = lookupEpp(doc.project, [], {
      eppShape: (id) => eppStarters().shapes.find((s) => s.id === id),
    });
    const [g, star, cube] = doc.project.quilts;
    expect(doc.project.quilts.map((q) => q.notecard.name)).toEqual([
      'Grandmother’s Flower Garden',
      'Lone Star',
      'Cube corners',
    ]);
    // Garden: hexagons never overlap, and every cell inside the cut is a piece.
    const centers = new Set(
      expandAll(g!.epp!.pieces, lookup).map((l) =>
        centroid(l.poly)
          .map((x) => x.toFixed(3))
          .join(),
      ),
    );
    expect(centers.size).toBe(expandAll(g!.epp!.pieces, lookup).length);
    for (let q = -40; q <= 40; q++)
      for (let r = -40; r <= 40; r++) {
        const [x, y] = cell(q, r);
        if (x > 0 && x < GARDEN[2] && y > 0 && y < GARDEN[3])
          expect(centers.has([x, y].map((v) => v.toFixed(3)).join()), `${q},${r}`).toBe(true);
      }
    // Every quilt's border spaces painted.
    for (const q of doc.project.quilts) {
      const border = generateFor(q).slots;
      expect(border.length, q.notecard.name).toBeGreaterThan(0);
      for (const s of border) expect(q.layers[0].slots[s.id], s.id).toBeDefined();
    }
    // Lone Star: 8 points of 36 diamonds, 4 setting squares and 4 triangles.
    expect(star!.epp!.pieces).toHaveLength(288);
    expect(star!.epp!.closing).toHaveLength(8);
    // Cube corners: 9 pieces a cube, none on top of another.
    const leaves = expandAll(cube!.epp!.pieces, lookup);
    expect(leaves.length % 9).toBe(0);
    const at = new Set(
      leaves.map((l) =>
        centroid(l.poly)
          .map((x) => x.toFixed(3))
          .join(),
      ),
    );
    expect(at.size).toBe(leaves.length);
    const text = serializeProject(doc);
    const back = await parseProject(text);
    if (!back.ok) throw new Error(back.error);
    expect(back.report).toEqual([]);
    if (out) writeFileSync(out, text);
  });
});
