// 3D EPP designs for the fold tests and the demo project (spec 027 User Story 7), ported from the
// prototype (prototypes/epp3d on branch proto/epp-3d). A design is a net: pieces (outlines in
// units, y up, counter-clockwise) and explicit seams between edges that don't touch.
import type { Pt } from '@/model/geometry/path';
import { cross3, dot3, len3, mean3, mul3, sub3, unit3, type Net, type V3 } from '@/model/epp/fold';
import { expand, type EppLookup } from '@/model/epp/expand';
import { edgeRef } from '@/model/epp/net';
import { matchShape, piecePose } from '@/model/epp/match';
import { addPiece, newEppQuilt, refresh } from '@/model/epp/quilt-ops';
import type { EppSeam } from '@/model/schema/epp';
import type { Quilt } from '@/model/schema/quilt';

type End = [number, number];
export interface Design {
  pieces: { pts: Pt[]; color: string }[];
  seams: { a: End; b: End }[];
  front?: number;
}

const add2 = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const sub2 = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const mul2 = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const dot2 = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const len2 = (a: Pt) => Math.hypot(a[0], a[1]);
const mean2 = (ps: Pt[]): Pt => mul2(ps.reduce(add2, [0, 0]), 1 / ps.length);
const deg = (a: number): Pt => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
const PHI = (1 + Math.sqrt(5)) / 2;

export const toNet = (d: Design): Net => ({
  pieces: d.pieces.map((p) => p.pts),
  seams: d.seams.map((s) => ({
    a: { piece: s.a[0], edge: s.a[1] },
    b: { piece: s.b[0], edge: s.b[1] },
  })),
  ...(d.front !== undefined ? { front: d.front } : {}),
});

// ---------- flat designs ----------
/** Five 60° diamonds in a fan, the last edge sewn to the first (SC-004). */
export function fiveStar(colors = ['Red', 'Orange']): Design {
  const pieces = [0, 1, 2, 3, 4].map((k) => {
    const a = deg(60 * k + 90);
    const b = deg(60 * k + 150);
    return { pts: [[0, 0], a, add2(a, b), b] as Pt[], color: colors[k % colors.length]! };
  });
  return { pieces, seams: [{ a: [4, 3], b: [0, 0] }] };
}
function sixStar(colors: string[]): Design {
  const pieces = Array.from({ length: 6 }, (_, k) => {
    const a = deg(90 + 60 * k);
    const b = deg(150 + 60 * k);
    return { pts: [[0, 0], a, add2(a, b), b] as Pt[], color: colors[k % 2]! };
  });
  return { pieces, seams: [] };
}
function hexFlower(middle: string, petals: string): Design {
  const hex = (c: Pt) => Array.from({ length: 6 }, (_, k) => add2(c, deg(60 * k)));
  const centers: Pt[] = [
    [0, 0],
    ...Array.from({ length: 6 }, (_, k) => mul2(deg(30 + 60 * k), Math.sqrt(3))),
  ];
  return {
    pieces: centers.map((c, i) => ({ pts: hex(c), color: i ? petals : middle })),
    seams: [],
  };
}

/** Where edge p→q and r→s overlap, running opposite ways. */
function touch(p: Pt, q: Pt, r: Pt, s: Pt) {
  const L = len2(sub2(q, p));
  const u = mul2(sub2(q, p), 1 / L);
  const off = (x: Pt) => Math.abs(u[0] * (x[1] - p[1]) - u[1] * (x[0] - p[0]));
  if (off(r) > 1e-6 || off(s) > 1e-6) return false;
  const tr = dot2(sub2(r, p), u);
  const ts = dot2(sub2(s, p), u);
  return ts < tr && Math.min(L, tr) - Math.max(0, ts) > 1e-6;
}
/** A flat assembly's outline, edge by edge in order, from a corner on a mirror line (corners at
 *  matching distances from the middle on both sides of it, all the way round). */
function outline(pieces: Design['pieces']): End[] {
  const edges: { p: number; e: number; a: Pt; b: Pt }[] = [];
  pieces.forEach((P, p) =>
    P.pts.forEach((a, e) => {
      const b = P.pts[(e + 1) % P.pts.length]!;
      const shared = pieces.some(
        (Q, q) => q !== p && Q.pts.some((r, f) => touch(a, b, r, Q.pts[(f + 1) % Q.pts.length]!)),
      );
      if (!shared) edges.push({ p, e, a, b });
    }),
  );
  const loop: typeof edges = [];
  let cur = edges[0];
  while (cur && loop.length < edges.length) {
    loop.push(cur);
    const end = cur.b;
    cur = edges.find((x) => len2(sub2(x.a, end)) < 1e-6);
  }
  const mid = mean2(pieces.flatMap((P) => P.pts));
  const r = loop.map((e) => len2(sub2(e.a, mid)));
  const m = loop.length;
  const start = r.findIndex((_, s) =>
    r.every((_, k) => Math.abs(r[(s + k) % m]! - r[(s - k + m * 2) % m]!) < 1e-6),
  );
  return loop.map((_, k) => loop[(Math.max(0, start) + k) % m]!).map((e) => [e.p, e.e]);
}
/**
 * Two copies of a flat assembly sewn round their outlines, right sides out (a pillow). The rim
 * starts at a corner on a mirror line, so the copies are each other's mirror image: edge i of one
 * meets edge (-i - 1 + twist) of the other. An odd twist turns one side half a step, so a corner of
 * one meets the middle of a notch of the other.
 */
function twoSided(base: Design, colorB: (i: number) => string, twist = 0): Design {
  const xs = base.pieces.flatMap((p) => p.pts.map((q) => q[0]));
  const shift = Math.max(...xs) - Math.min(...xs) + 1;
  const n = base.pieces.length;
  const copy = base.pieces.map((p, i) => ({
    pts: p.pts.map((q) => add2(q, [shift, 0])),
    color: colorB(i),
  }));
  const rim = outline(base.pieces);
  const m = rim.length;
  const seams = rim.map(([p, e], i) => {
    const [q, f] = rim[(2 * m - i - 1 + twist) % m]!;
    return { a: [p, e] as End, b: [q + n, f] as End };
  });
  return { pieces: [...base.pieces, ...copy], seams };
}

/** Two unit squares sewn round. */
export const squarePillow = (): Design =>
  twoSided(
    {
      pieces: [
        {
          pts: [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
          color: 'Red',
        },
      ],
      seams: [],
    },
    () => 'Blue',
  );
/** Two six-diamond stars, one turned half a point so the points interlock (owner, 2026-11-23). */
export const starPillow = (): Design =>
  twoSided(sixStar(['Red', 'Rose']), (i) => (i % 2 ? 'Lavender' : 'Purple'), 1);
/** Two hexagon flowers sewn one edge round: no flat fold closes it, the fabric does. */
export const twistedPincushion = (): Design =>
  twoSided(hexFlower('Gold', 'Sky'), (i) => (i ? 'Coral' : 'Gold'), 1);

// ---------- solids ----------
interface Face {
  v: number[];
  n: V3;
}
/** Faces of a convex polyhedron from its corners: each face counter-clockwise from outside. */
function hullFaces(V: V3[]): Face[] {
  const faces: Face[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < V.length; i++)
    for (let j = i + 1; j < V.length; j++)
      for (let k = j + 1; k < V.length; k++) {
        let n = cross3(sub3(V[j]!, V[i]!), sub3(V[k]!, V[i]!));
        if (len3(n) < 1e-9) continue;
        n = unit3(n);
        let pos = 0;
        let neg = 0;
        for (const v of V) {
          const s = dot3(n, sub3(v, V[i]!));
          if (s > 1e-7) pos++;
          else if (s < -1e-7) neg++;
        }
        if (pos && neg) continue;
        if (pos) n = mul3(n, -1);
        const on = V.map((_, x) => x).filter((x) => Math.abs(dot3(n, sub3(V[x]!, V[i]!))) < 1e-7);
        const key = on.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        const c = mean3(on.map((x) => V[x]!));
        const e1 = unit3(sub3(V[on[0]!]!, c));
        const e2 = cross3(n, e1);
        const ang = (x: number) => Math.atan2(dot3(sub3(V[x]!, c), e2), dot3(sub3(V[x]!, c), e1));
        on.sort((a, b) => ang(a) - ang(b));
        faces.push({ v: on, n });
      }
  return faces;
}
/** Two convex polygons overlap (touching along an edge or at a corner doesn't count). */
function overlaps(P: Pt[], Q: Pt[]) {
  for (const poly of [P, Q])
    for (let i = 0; i < poly.length; i++) {
      const e = sub2(poly[(i + 1) % poly.length]!, poly[i]!);
      const n: Pt = [-e[1], e[0]];
      const a = P.map((x) => dot2(x, n));
      const b = Q.map((x) => dot2(x, n));
      if (Math.max(...a) <= Math.min(...b) + 1e-6 || Math.max(...b) <= Math.min(...a) + 1e-6)
        return false;
    }
  return true;
}
interface Unfold {
  groups?: number[][];
  seeds?: number[];
  maxSize?: number;
}
/**
 * Unfold a polyhedron into assemblies laid flat on a grid; every polyhedron edge not used inside an
 * assembly becomes an explicit seam. Assemblies are given (`groups`, each grown from its first
 * face) or grown one after another (from `seeds` first, the seed with the most faces still free
 * around it, at most `maxSize` faces each). A face that would overlap its assembly waits for a
 * later one.
 */
function unfold(
  V: V3[],
  faces: Face[],
  colorOf: (face: number, group: number, root: boolean) => string,
  { groups, seeds = [], maxSize = Infinity }: Unfold = {},
): Design {
  const edgeFace = new Map<string, [number, number]>();
  faces.forEach((f, fi) =>
    f.v.forEach((a, k) => edgeFace.set(`${a}>${f.v[(k + 1) % f.v.length]}`, [fi, k])),
  );
  // Each face in its own plane, its first edge along x (so a root face sits level).
  const flat = (fi: number): Pt[] => {
    const f = faces[fi]!;
    const c = mean3(f.v.map((x) => V[x]!));
    const e1 = unit3(sub3(V[f.v[1]!]!, V[f.v[0]!]!));
    const e2 = cross3(f.n, e1);
    return f.v.map((x) => [dot3(sub3(V[x]!, c), e1), dot3(sub3(V[x]!, c), e2)]);
  };
  const done = new Set<number>();
  const free = (fi: number) =>
    faces[fi]!.v.filter(
      (a, k) => !done.has(edgeFace.get(`${faces[fi]!.v[(k + 1) % faces[fi]!.v.length]}>${a}`)![0]),
    ).length;
  const tree = new Set<string>();
  const ekey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const placedGroups: Map<number, Pt[]>[] = [];
  const roots: number[] = [];
  for (let gi = 0; done.size < faces.length; gi++) {
    let root: number;
    let allowed: Set<number> | null = null;
    if (groups) {
      if (gi >= groups.length) break;
      root = groups[gi]![0]!;
      allowed = new Set(groups[gi]);
    } else {
      const open = seeds.filter((f) => !done.has(f));
      root = open.length
        ? open.reduce((b, f) => (free(f) > free(b) ? f : b))
        : faces.findIndex((_, f) => !done.has(f));
    }
    const placed = new Map([[root, flat(root)]]);
    done.add(root);
    roots.push(root);
    const queue = [root];
    while (queue.length) {
      const fi = queue.shift()!;
      const f = faces[fi]!;
      const P = placed.get(fi)!;
      f.v.forEach((a, k) => {
        const b = f.v[(k + 1) % f.v.length]!;
        const [fj, kj] = edgeFace.get(`${b}>${a}`)!;
        if (done.has(fj) || (allowed && !allowed.has(fj)) || placed.size >= maxSize) return;
        const Q = flat(fj);
        const qb = Q[kj]!;
        const qa = Q[(kj + 1) % Q.length]!;
        const pa = P[k]!;
        const pb = P[(k + 1) % P.length]!;
        const turn =
          Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) - Math.atan2(qb[1] - qa[1], qb[0] - qa[0]);
        const [cs, sn] = [Math.cos(turn), Math.sin(turn)];
        const R = Q.map((x): Pt => {
          const d = sub2(x, qa);
          return add2(pa, [d[0] * cs - d[1] * sn, d[0] * sn + d[1] * cs]);
        });
        if ([...placed.values()].some((S) => overlaps(S, R))) return;
        placed.set(fj, R);
        done.add(fj);
        tree.add(ekey(a, b));
        queue.push(fj);
      });
    }
    placedGroups.push(placed);
  }
  // Lay the assemblies out on a grid, each centered in its cell.
  const boxes = placedGroups.map((pl) => {
    const ps = [...pl.values()].flat();
    const xs = ps.map((q) => q[0]);
    const ys = ps.map((q) => q[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const;
  });
  const cw = Math.max(...boxes.map((b) => b[2] - b[0])) + 0.8;
  const ch = Math.max(...boxes.map((b) => b[3] - b[1])) + 0.8;
  const cols = Math.ceil(Math.sqrt(placedGroups.length));
  const pieces: Design['pieces'] = [];
  const pieceOf = new Map<number, number>();
  placedGroups.forEach((pl, gi) => {
    const b = boxes[gi]!;
    const off: Pt = [
      (gi % cols) * cw - (b[0] + b[2]) / 2,
      -Math.floor(gi / cols) * ch - (b[1] + b[3]) / 2,
    ];
    for (const [fi, P] of pl) {
      pieceOf.set(fi, pieces.length);
      pieces.push({ pts: P.map((q) => add2(q, off)), color: colorOf(fi, gi, fi === roots[gi]) });
    }
  });
  const seams: Design['seams'] = [];
  faces.forEach((f, fi) =>
    f.v.forEach((a, k) => {
      const b = f.v[(k + 1) % f.v.length]!;
      if (a > b || tree.has(ekey(a, b))) return;
      const [fj, kj] = edgeFace.get(`${b}>${a}`)!;
      seams.push({ a: [pieceOf.get(fi)!, k], b: [pieceOf.get(fj)!, kj] });
    }),
  );
  return { pieces, seams };
}

const perms = ([a, b, c]: V3): V3[] => [
  [a, b, c],
  [a, c, b],
  [b, a, c],
  [b, c, a],
  [c, a, b],
  [c, b, a],
];
const cyclic = ([a, b, c]: V3): V3[] => [
  [a, b, c],
  [b, c, a],
  [c, a, b],
];
const signs = (v: V3): V3[] =>
  v.reduce<number[][]>(
    (out, x) =>
      out.flatMap((o) =>
        x
          ? [
              [...o, x],
              [...o, -x],
            ]
          : [[...o, 0]],
      ),
    [[]],
  ) as V3[];
/** Unique corners, scaled so the shortest edge is 1U. */
function corners(vs: V3[]): V3[] {
  const m = new Map(vs.map((v) => [v.map((x) => x.toFixed(6)).join(','), v]));
  const V = [...m.values()];
  let e = Infinity;
  for (let i = 0; i < V.length; i++)
    for (let j = i + 1; j < V.length; j++) e = Math.min(e, len3(sub3(V[i]!, V[j]!)));
  return V.map((v) => mul3(v, 1 / e));
}
/** Two shades per kind of piece (by number of sides), alternating by assembly. */
const SIDE_COLORS: Record<number, [string, string]> = {
  3: ['Orange', 'Gold'],
  4: ['Blue', 'Sky'],
  5: ['Navy', 'Indigo'],
  6: ['White', 'Pale Gray'],
};
function solid(vs: V3[], opts: (F: Face[]) => Unfold = () => ({}), colors = SIDE_COLORS): Design {
  const V = corners(vs);
  const F = hullFaces(V);
  return unfold(V, F, (fi, gi) => colors[F[fi]!.v.length]![gi % 2]!, opts(F));
}
const kinds = (F: Face[], n: number) => F.flatMap((f, i) => (f.v.length === n ? [i] : []));
const nearest = (faces: Face[], dir: V3) =>
  faces.reduce((best, f, i) => (dot3(f.n, dir) > dot3(faces[best]!.n, dir) ? i : best), 0);
const cubeCorners = (): V3[] =>
  [-0.5, 0.5].flatMap((x) => [-0.5, 0.5].flatMap((y) => [-0.5, 0.5].map((z): V3 => [x, y, z])));

/** d6: a cube, one assembly (a cross). */
export function cube(): Design {
  const V = cubeCorners();
  const F = hullFaces(V);
  const f = (d: V3) => nearest(F, d);
  const group = [
    f([0, -1, 0]),
    f([0, 0, 1]),
    f([0, 0, -1]),
    f([-1, 0, 0]),
    f([1, 0, 0]),
    f([0, 1, 0]),
  ];
  const colors = ['Blue', 'Green', 'Yellow', 'Red', 'Purple', 'Orange'];
  return unfold(V, F, (fi) => colors[fi % colors.length]!, { groups: [group] });
}
/** d4. */
export const tetrahedron = () =>
  solid([
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ]);
/** d8. */
export const octahedron = () => solid(perms([1, 0, 0]).flatMap(signs));
/** d20. */
export const icosahedron = () => solid(cyclic([0, 1, PHI]).flatMap(signs));
/** d12: two pentagon rosettes (a middle and five petals each), the classic EPP ball. */
export function dodecahedron(): Design {
  const vs: V3[] = [];
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      for (const c of [-1, 1]) vs.push([a, b, c]);
      vs.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [a * PHI, 0, b / PHI]);
    }
  const V = corners(vs);
  const F = hullFaces(V);
  const ring = (fi: number) =>
    F.map((_, j) => j).filter(
      (j) => j !== fi && Math.abs(dot3(F[j]!.n, F[fi]!.n) - 1 / Math.sqrt(5)) < 1e-6,
    );
  const bottom = nearest(F, mul3(F[0]!.n, -1));
  const g1 = [0, ...ring(0)];
  const g2 = [bottom, ...ring(bottom)];
  return unfold(
    V,
    F,
    (fi, gi, root) =>
      root
        ? 'Gold'
        : gi === 0
          ? g1.indexOf(fi) % 2
            ? 'Blue'
            : 'Sky'
          : g2.indexOf(fi) % 2
            ? 'Red'
            : 'Coral',
    { groups: [g1, g2] },
  );
}
/** d10: a pentagonal trapezohedron (ten kites), the dual of the pentagonal antiprism with unit
 *  edges: each antiprism face's plane gives a corner. */
export function trapezohedron(): Design {
  const R = 1 / (2 * Math.sin(Math.PI / 5));
  const a = Math.sqrt((1 - 2 * R * R * (1 - Math.cos(Math.PI / 5))) / 4);
  const anti: V3[] = Array.from({ length: 10 }, (_, i) => {
    const t = (i * Math.PI) / 5;
    return [R * Math.cos(t), R * Math.sin(t), i % 2 ? -a : a];
  });
  const dual = hullFaces(anti).map((f) => mul3(f.n, 1 / dot3(f.n, anti[f.v[0]!]!)));
  return solid(dual, () => ({}), { 4: ['Teal', 'Aqua'] });
}
export const hexagonalPrism = () =>
  solid(
    Array.from({ length: 12 }, (_, i): V3 => [
      Math.cos((i * Math.PI) / 3),
      Math.sin((i * Math.PI) / 3),
      i < 6 ? 0.5 : -0.5,
    ]),
  );
export const truncatedTetrahedron = () =>
  solid(
    perms([3, 1, 1])
      .flatMap(signs)
      .filter((v) => v.filter((x) => x < 0).length % 2 === 0),
    (F) => ({ seeds: kinds(F, 6) }),
  );
/** 12 dark pentagons, 20 white hexagons, in pentagon rosettes of up to 6 pieces. */
export const soccerBall = () =>
  solid(
    (
      [
        [0, 1, 3 * PHI],
        [1, 2 + PHI, 2 * PHI],
        [PHI, 2, 2 * PHI + 1],
      ] as V3[]
    )
      .flatMap(cyclic)
      .flatMap(signs),
    (F) => ({ seeds: kinds(F, 5), maxSize: 6 }),
  );

// ---------- designs as quilts ----------
const flip = ([x, y]: Pt): Pt => [x, -y];

/**
 * A design as a 3D EPP quilt: each piece placed as the first `known` shape it is (placed outlines
 * are y down, so each is flipped), filled by `fill(color)`, its explicit seams as edge references.
 */
export function designQuilt(
  d: Design,
  name: string,
  known: readonly { id: string; outline: Pt[] }[],
  lookup: EppLookup,
  fill: (color: string) => { color: string },
): Quilt {
  let q = newEppQuilt(name, 'in', 2, true);
  const ids: string[] = [];
  for (const p of d.pieces) {
    const target = p.pts.map(flip);
    const m = matchShape(target, known);
    if (!m) throw new Error(`${name}: no shape for a ${p.pts.length}-sided piece`);
    const out = addPiece(q, {
      shape: m.shape.id,
      ...piecePose(m.pose),
      fills: { '': fill(p.color) },
    });
    q = out.quilt;
    ids.push(out.id);
  }
  const leaves = q.epp!.pieces.map((piece) => expand(piece, lookup)[0]!);
  const end = ([p, e]: End) => {
    const pts = d.pieces[p]!.pts;
    const [a, b] = [flip(pts[e]!), flip(pts[(e + 1) % pts.length]!)];
    const poly = leaves[p]!.poly;
    const near = (x: Pt, y: Pt) => len2(sub2(x, y)) < 1e-5;
    const k = poly.findIndex((x, i) => near(x, a) && near(poly[(i + 1) % poly.length]!, b));
    if (k < 0) throw new Error(`${name}: edge ${e} of piece ${p} not found`);
    return edgeRef(leaves[p]!, k);
  };
  const seams: EppSeam[] = d.seams.map((s) => ({ a: end(s.a), b: end(s.b) }));
  // The box (pieces' bounds), as every edit in the app keeps it.
  return refresh(
    {
      ...q,
      epp: {
        ...q.epp!,
        ...(seams.length ? { seams } : {}),
        ...(d.front !== undefined ? { front: { piece: ids[d.front]! } } : {}),
      },
    },
    lookup,
  );
}
