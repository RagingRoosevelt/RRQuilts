import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { expandAll, lookupEpp } from '@/model/epp/expand';
import {
  buildFold,
  folds,
  foldReport,
  frontPiece,
  openEdges,
  solveFold,
  turnToFront,
  facing,
} from '@/model/epp/fold';
import { edgeLength, edges } from '@/model/epp/geometry';
import { edgeRef, endAt, quiltNet } from '@/model/epp/net';
import {
  addPiece,
  addSeam,
  breakIntoPatches,
  is3d,
  newEppQuilt,
  refresh,
  removePieces,
} from '@/model/epp/quilt-ops';
import { buildCloth, clothStretch, pieceMesh, solveCloth } from '@/model/epp/stuff';
import type { Quilt } from '@/model/schema/quilt';
import {
  cube,
  designQuilt,
  dodecahedron,
  fiveStar,
  squarePillow,
  starPillow,
  toNet,
  trapezohedron,
  twistedPincushion,
  type Design,
} from './designs3d';

const { shapes, rosettes } = eppStarters();
const lookup = lookupEpp({ eppShapes: shapes, rosettes });
const DEG = 180 / Math.PI;
const fold = (d: Design) => solveFold(buildFold(toNet(d)));
const stuff = (m: ReturnType<typeof fold>) =>
  solveCloth(
    buildCloth(
      m,
      m.plates.map((P) => pieceMesh(P.pts, P.c)),
    ),
  );

describe('3D EPP fold', () => {
  it('folds the five-diamond star: every hinge 42°, every seam closed (SC-004)', () => {
    const m = fold(fiveStar());
    expect(foldReport(m).open).toEqual([]);
    for (const f of folds(m)) expect(Math.abs(f * DEG)).toBeCloseTo(42, 0);
    expect(m.closed).toBe(false);
  });

  it('an unsewn fan lies flat', () => {
    const m = fold({ ...fiveStar(), seams: [] });
    for (const f of folds(m)) expect(Math.abs(f)).toBeLessThan(1e-3);
  });

  it('folds a cube from a cross, right side out, volume 1', () => {
    const m = fold(cube());
    const r = foldReport(m);
    expect(r.open).toEqual([]);
    expect(m.closed).toBe(true);
    expect(openEdges(m)).toBe(0);
    expect(r.volume).toBeCloseTo(1, 3);
    for (const f of folds(m)) expect(Math.abs(f * DEG)).toBeCloseTo(90, 0);
  });

  it('folds the pentagon ball from two rosettes (volume 7.663 for unit edges)', () => {
    const m = fold(dodecahedron());
    expect(m.assemblies).toBe(2);
    expect(foldReport(m).volume).toBeCloseTo(7.663, 2);
  });

  it('folds the d10’s kites shut', () => {
    const d = trapezohedron();
    expect(d.pieces).toHaveLength(10);
    const m = fold(d);
    expect(foldReport(m).open).toEqual([]);
    expect(foldReport(m).volume).toBeGreaterThan(0);
  });

  it('turns a closed shape so its front piece faces the viewer', () => {
    const m = fold(cube());
    while (turnToFront(m) > 0);
    const f = frontPiece(m);
    expect(f).not.toBeNull();
    expect(facing(m).front[2]).toBeCloseTo(1, 3);
  });

  it('a pillow folds flat, then stuffing fills it', () => {
    const m = fold(squarePillow());
    const r = foldReport(m);
    expect(m.closed).toBe(true);
    expect(r.flat).toBe(true);
    const c = stuff(m);
    // Two unit squares sewn round hold about 0.2 at most.
    expect(c.vol).toBeGreaterThan(0.15);
    expect(c.vol).toBeLessThan(0.21);
    expect(clothStretch(c)).toBeLessThan(0.02);
  });

  it('interlocking star pillow and twisted pincushion: no flat fold closes them, stuffing does', () => {
    for (const d of [starPillow(), twistedPincushion()]) {
      const m = fold(d);
      expect(m.closed).toBe(true);
      expect(foldReport(m).open.length).toBeGreaterThan(0);
      const c = stuff(m);
      expect(c.vol).toBeGreaterThan(0.5);
      expect(clothStretch(c)).toBeLessThan(0.03);
    }
  });
});

describe('3D EPP quilt', () => {
  const fill = (color: string) => ({ color: `rrquilts.${color.toLowerCase()}` });

  it('a design placed as a quilt folds the same (edge references survive the y flip)', () => {
    const q = designQuilt(cube(), 'Cube', shapes, lookup, fill);
    expect(is3d(q)).toBe(true);
    expect(q.epp!.seams).toHaveLength(7);
    const { net } = quiltNet(q, lookup);
    expect(net.seams).toHaveLength(7);
    const m = solveFold(buildFold(net));
    expect(foldReport(m).volume).toBeCloseTo(1, 3);
  });

  it('a seam end names the shape’s edge, so it stays on it when the piece mirrors', () => {
    const half = 'rrquilts.epp-half-square';
    for (const mirror of [false, true]) {
      const q = addPiece(newEppQuilt('Q', 'in', 2, true), {
        shape: half,
        at: [0, 0],
        turn: 30,
        scale: 1,
        ...(mirror ? { mirror: true } : {}),
      }).quilt;
      const [leaf] = expandAll(q.epp!.pieces, lookup);
      const long = edges(leaf!.poly).findIndex((e) => edgeLength(e) > 1.2);
      const ref = edgeRef(leaf!, long);
      // The long edge is edge 2 of the shape's outline, mirrored or not.
      expect(ref.edge).toBe(2);
      expect(endAt([leaf!], ref)).toEqual([0, long]);
    }
  });

  it('seams go with deleted pieces, and move to the loose pieces when a rosette breaks', () => {
    const flower = rosettes.find((r) => r.notecard.name === 'Hexagon Flower')!;
    let q: Quilt = newEppQuilt('Q', 'in', 2, true);
    const a = addPiece(q, { rosette: flower.id, at: [0, 0], turn: 0, scale: 1 });
    const b = addPiece(a.quilt, { shape: 'rrquilts.epp-hexagon', at: [10, 0], turn: 0, scale: 1 });
    q = addSeam(
      b.quilt,
      { piece: a.id, part: flower.pieces[1]!.id, edge: 0 },
      { piece: b.id, edge: 3 },
    );
    const broken = breakIntoPatches(q, lookup, a.id);
    const s = broken.epp!.seams![0]!;
    expect(s.a.part).toBeUndefined();
    expect(broken.epp!.pieces.some((p) => p.id === s.a.piece)).toBe(true);
    expect(quiltNet(broken, lookup).net.seams).toHaveLength(1);
    const gone = refresh(removePieces(q, new Set([b.id])), lookup);
    expect(gone.epp!.seams).toBeUndefined();
  });
});
