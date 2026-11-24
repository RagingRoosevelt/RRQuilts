// 3D EPP fold (spec 027 User Story 7; prototype prototypes/epp3d/fold.html on branch proto/epp-3d).
// A net of flat pieces folds into 3D with every seam a hinge about its seam line (owner,
// 2026-11-19). Each piece is a rigid plate (a rotation and a position). Each pass: the two ends of
// every seam move to their meeting point, every hinge turns its plates a share of its fold back
// toward flat (fabric would rather lie flat), each plate takes the rigid pose that best fits where
// its points were sent, then the whole object is put back where it was so it can't drift or spin.
// Net coordinates: units (1 = 1U), y up, outlines counter-clockwise, right side toward +z.
import type { Pt } from '../geometry/path';

export type V3 = [number, number, number];
export type Quat = [number, number, number, number];

// ---------- vectors and quaternions ----------
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const unit3 = (a: V3): V3 => mul3(a, 1 / (len3(a) || 1));
export const cross3 = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const mean3 = (ps: readonly V3[]): V3 =>
  mul3(
    ps.reduce((s, p) => add3(s, p), [0, 0, 0]),
    1 / (ps.length || 1),
  );
const sub2 = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const len2 = (a: Pt) => Math.hypot(a[0], a[1]);
const cross2 = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];
const mean2 = (ps: readonly Pt[]): Pt => [
  ps.reduce((s, p) => s + p[0], 0) / ps.length,
  ps.reduce((s, p) => s + p[1], 0) / ps.length,
];

export const qmul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qunit = (q: Quat): Quat => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};
export function qrot(q: Quat, v: V3): V3 {
  const u: V3 = [q[0], q[1], q[2]];
  const t = mul3(cross3(u, v), 2);
  return add3(add3(v, mul3(t, q[3])), cross3(u, t));
}
const AXES: V3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
/** Best rotation for a 3×3 moment matrix (columns A), warm-started from q (Müller et al. 2016, "A
 *  robust method to extract the rotational part of deformations"). */
function fitRotation(A: V3[], q: Quat, iters: number): Quat {
  for (let i = 0; i < iters; i++) {
    let num: V3 = [0, 0, 0];
    let den = 0;
    for (let k = 0; k < 3; k++) {
      const r = qrot(q, AXES[k]!);
      num = add3(num, cross3(r, A[k]!));
      den += dot3(r, A[k]!);
    }
    const om = mul3(num, 1 / (Math.abs(den) + 1e-9));
    const w = len3(om);
    if (w < 1e-10) break;
    const s = Math.sin(w / 2) / w;
    q = qunit(qmul([om[0] * s, om[1] * s, om[2] * s, Math.cos(w / 2)], q));
  }
  return q;
}
/** Turn of v about unit axis k by ang (Rodrigues). */
function rotAbout(k: V3, ang: number, v: V3): V3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return add3(add3(mul3(v, c), mul3(cross3(k, v), s)), mul3(k, dot3(k, v) * (1 - c)));
}

// ---------- the net ----------
/** One end of an explicit seam: a piece and its edge k (corner k to k + 1). */
export interface NetEnd {
  piece: number;
  edge: number;
}
export interface Net {
  /** Outlines in units, y up, counter-clockwise (right side toward +z). */
  pieces: Pt[][];
  /** Explicit seams: equal edges that don't touch in 2D. */
  seams: { a: NetEnd; b: NetEnd }[];
  /** The piece chosen to face front (a closed shape), if any. */
  front?: number | undefined;
}

interface Plate {
  pts: Pt[];
  c: Pt;
  area: number;
  /** Rest points around the middle: node 0 the middle, then the corners and seam ends. */
  nodes: V3[];
}
export interface Hinge {
  /** The explicit seam's index in the net, or null for a shared edge. */
  seam: number | null;
  A: number;
  B: number;
  /** The seam's ends on each piece (flat), in the order they meet. */
  pa: [Pt, Pt];
  pb: [Pt, Pt];
  na: [number, number];
  nb: [number, number];
}
/** What each edge of each piece is: shared with a neighbor, an explicit seam's index, or free. */
export type EdgeUse = 'shared' | number | null;

export interface Fold {
  net: Net;
  plates: Plate[];
  hinges: Hinge[];
  /** Points that meet: (plate, node) lists. */
  groups: [number, number][][];
  use: EdgeUse[][];
  assemblyOf: number[];
  assemblies: number;
  /** Every edge sewn: a closed shape (it can be stuffed). */
  closed: boolean;
  q: Quat[];
  t: V3[];
  run: {
    phase: 'fold' | 'settle' | 'done';
    iters: number;
    frames: number;
    calm: number;
    settle: number;
    best: number;
    since: number;
  };
}

const EDGE_EPS = 1e-6;
/** A seam counts as closed within 2% of a unit. */
export const CLOSED = 0.02;
/** How hard each hinge springs back toward flat, per pass. */
const BEND = 0.05;

/** Where edge p→q of one piece and r→s of another overlap, running opposite ways. */
function overlap(p: Pt, q: Pt, r: Pt, s: Pt): [Pt, Pt] | null {
  const L = len2(sub2(q, p));
  const u: Pt = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
  if (Math.abs(cross2(u, sub2(r, p))) > EDGE_EPS || Math.abs(cross2(u, sub2(s, p))) > EDGE_EPS)
    return null;
  const tr = (r[0] - p[0]) * u[0] + (r[1] - p[1]) * u[1];
  const ts = (s[0] - p[0]) * u[0] + (s[1] - p[1]) * u[1];
  if (ts >= tr) return null;
  const lo = Math.max(0, ts);
  const hi = Math.min(L, tr);
  return hi - lo > EDGE_EPS
    ? [
        [p[0] + u[0] * lo, p[1] + u[1] * lo],
        [p[0] + u[0] * hi, p[1] + u[1] * hi],
      ]
    : null;
}
const edgeOf = (pts: Pt[], e: number): [Pt, Pt] => [pts[e]!, pts[(e + 1) % pts.length]!];
export const edgeLen = (pts: Pt[], e: number) => len2(sub2(...edgeOf(pts, e)));

/** The fold of a net, flat and curled, ready to run (`foldFrame`, `solveFold`). */
export function buildFold(net: Net): Fold {
  const plates: Plate[] = net.pieces.map((pts) => ({
    pts,
    c: mean2(pts),
    area: pts.reduce((a, q, k) => a + cross2(q, pts[(k + 1) % pts.length]!) / 2, 0),
    nodes: [],
  }));
  const keys = plates.map(() => new Map<string, number>());
  const nodeOf = (pi: number, pt: Pt) => {
    const P = plates[pi]!;
    const key = `${Math.round(pt[0] * 1e5)},${Math.round(pt[1] * 1e5)}`;
    let k = keys[pi]!.get(key);
    if (k === undefined) {
      k = P.nodes.length;
      keys[pi]!.set(key, k);
      P.nodes.push([pt[0] - P.c[0], pt[1] - P.c[1], 0]);
    }
    return k;
  };
  plates.forEach((P, i) => {
    nodeOf(i, P.c);
    P.pts.forEach((pt) => nodeOf(i, pt));
  });
  const use: EdgeUse[][] = plates.map((P) => P.pts.map(() => null));
  const hinges: Omit<Hinge, 'na' | 'nb'>[] = [];
  for (let i = 0; i < plates.length; i++)
    for (let j = i + 1; j < plates.length; j++)
      plates[i]!.pts.forEach((p, ea) => {
        const q = plates[i]!.pts[(ea + 1) % plates[i]!.pts.length]!;
        plates[j]!.pts.forEach((r, eb) => {
          const o = overlap(p, q, r, plates[j]!.pts[(eb + 1) % plates[j]!.pts.length]!);
          if (!o) return;
          hinges.push({ seam: null, A: i, B: j, pa: o, pb: o });
          use[i]![ea] = use[j]![eb] = 'shared';
        });
      });
  net.seams.forEach((s, k) => {
    const [a0, a1] = edgeOf(net.pieces[s.a.piece]!, s.a.edge);
    const [b0, b1] = edgeOf(net.pieces[s.b.piece]!, s.b.edge);
    hinges.push({ seam: k, A: s.a.piece, B: s.b.piece, pa: [a0, a1], pb: [b1, b0] });
    use[s.a.piece]![s.a.edge] = use[s.b.piece]![s.b.edge] = k;
  });
  const full: Hinge[] = hinges.map((h) => ({
    ...h,
    na: [nodeOf(h.A, h.pa[0]), nodeOf(h.A, h.pa[1])],
    nb: [nodeOf(h.B, h.pb[0]), nodeOf(h.B, h.pb[1])],
  }));
  // Points that meet: union-find over (plate, node).
  const base: number[] = [];
  let total = 0;
  for (const P of plates) {
    base.push(total);
    total += P.nodes.length;
  }
  const parent = Array.from({ length: total }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x]!)));
  for (const h of full)
    for (const k of [0, 1]) parent[find(base[h.A]! + h.na[k]!)] = find(base[h.B]! + h.nb[k]!);
  const byRoot = new Map<number, [number, number][]>();
  plates.forEach((P, p) =>
    P.nodes.forEach((_, n) => {
      const r = find(base[p]! + n);
      byRoot.set(r, [...(byRoot.get(r) ?? []), [p, n]]);
    }),
  );
  // Assemblies: pieces linked by shared edges.
  const asm = plates.map((_, i) => i);
  const af = (x: number): number => (asm[x] === x ? x : (asm[x] = af(asm[x]!)));
  for (const h of full) if (h.seam === null) asm[af(h.A)] = af(h.B);
  const assemblyOf = plates.map((_, i) => af(i));
  const perimeter = plates.reduce(
    (s, P) => s + P.pts.reduce((t, _, k) => t + edgeLen(P.pts, k), 0),
    0,
  );
  const sewn = full.reduce((s, h) => s + 2 * len2(sub2(h.pa[1], h.pa[0])), 0);
  const m: Fold = {
    net,
    plates,
    hinges: full,
    groups: [...byRoot.values()].filter((g) => g.length > 1),
    use,
    assemblyOf,
    assemblies: new Set(assemblyOf).size,
    closed: plates.length > 0 && Math.abs(perimeter - sewn) < 1e-6,
    q: [],
    t: [],
    run: { phase: 'fold', iters: 0, frames: 0, calm: 0, settle: 0, best: Infinity, since: 0 },
  };
  startPoses(m);
  return m;
}

/** Curl the flat design away from the viewer, so the right side (toward you) ends up outside. From
 *  flat a seam can't lift pieces out of the plane, so every fold starts here. */
function startPoses(m: Fold) {
  const all = m.plates.flatMap((P) => P.pts);
  if (!all.length) return;
  const C = mean2(all);
  const R = Math.max(...all.map((p) => len2(sub2(p, C)))) || 1;
  let seed = 7;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.004;
  m.plates.forEach((P, p) => {
    const target = P.nodes.map((n): V3 => {
      const x = n[0] + P.c[0] - C[0];
      const y = n[1] + P.c[1] - C[1];
      return [x, y, (-0.45 * (x * x + y * y)) / R + noise()];
    });
    fitPose(m, p, P.nodes, target, [0, 0, 0, 1], 60);
  });
}

/** Plate p's rigid pose that best carries its rest points onto `target`. */
function fitPose(m: Fold, p: number, rest: V3[], target: V3[], q0: Quat, iters: number) {
  const rc = mean3(rest);
  const tc = mean3(target);
  const A: V3[] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  rest.forEach((r, i) => {
    const d = sub3(target[i]!, tc);
    const rr = sub3(r, rc);
    for (let k = 0; k < 3; k++) A[k] = add3(A[k]!, mul3(d, rr[k]!));
  });
  m.q[p] = fitRotation(A, q0, iters);
  m.t[p] = sub3(tc, qrot(m.q[p], rc));
}

/** Every plate's points where they are now. */
export const world = (m: Fold): V3[][] =>
  m.plates.map((P, p) => P.nodes.map((r) => add3(qrot(m.q[p]!, r), m.t[p]!)));

/** One pass; returns how far the plates moved. */
function relax(m: Fold, bend: number): number {
  const W = world(m);
  const T = W.map((ns) => ns.map((x): V3 => [...x]));
  for (const g of m.groups) {
    const c = mean3(g.map(([p, n]) => W[p]![n]!));
    for (const [p, n] of g) T[p]![n] = add3(T[p]![n]!, sub3(c, W[p]![n]!));
  }
  // Each hinge turns both plates a share of its fold back toward flat, about the seam line.
  if (bend)
    for (const h of m.hinges) {
      const h0 = W[h.A]![h.na[0]]!;
      const e = unit3(sub3(W[h.A]![h.na[1]]!, h0));
      const fold = foldAngle(m, h, e);
      const turn = (p: number, ang: number) =>
        W[p]!.forEach((w, n) => {
          T[p]![n] = add3(T[p]![n]!, sub3(add3(h0, rotAbout(e, ang, sub3(w, h0))), w));
        });
      turn(h.B, (-bend * fold) / 2);
      turn(h.A, (bend * fold) / 2);
    }
  const before = m.plates.map((_, p) => [m.q[p]!, m.t[p]!] as const);
  m.plates.forEach((P, p) => fitPose(m, p, P.nodes, T[p]!, m.q[p]!, 3));
  // Those turns don't balance, so take back any drift or spin of the whole object.
  pin(m, W.flat());
  return Math.max(
    0,
    ...before.map(([q, t], p) => {
      const dq = m.q[p]!.map((x, i) => x - q[i]!);
      return len3(sub3(m.t[p]!, t)) + Math.hypot(...dq);
    }),
  );
}

/** Move the whole object rigidly so its points sit as close as they can to `was`. */
function pin(m: Fold, was: V3[]) {
  const now = world(m).flat();
  const cn = mean3(now);
  const cw = mean3(was);
  const A: V3[] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  now.forEach((p, i) => {
    const d = sub3(was[i]!, cw);
    const r = sub3(p, cn);
    for (let k = 0; k < 3; k++) A[k] = add3(A[k]!, mul3(d, r[k]!));
  });
  const R = fitRotation(A, [0, 0, 0, 1], 50);
  m.plates.forEach((_, p) => {
    m.q[p] = qunit(qmul(R, m.q[p]!));
    m.t[p] = add3(qrot(R, sub3(m.t[p]!, cn)), cw);
  });
}

/** How far a hinge is folded: the turn from plate A's right side to plate B's about axis e. */
function foldAngle(m: Fold, h: Hinge, e: V3) {
  const nA = qrot(m.q[h.A]!, [0, 0, 1]);
  const nB = qrot(m.q[h.B]!, [0, 0, 1]);
  return Math.atan2(dot3(e, cross3(nA, nB)), dot3(nA, nB));
}

/** Every hinge's fold, in radians. */
export function folds(m: Fold): number[] {
  const W = world(m);
  return m.hinges.map((h) => foldAngle(m, h, unit3(sub3(W[h.A]![h.na[1]]!, W[h.A]![h.na[0]]!))));
}

/** How far apart each hinge's two edges still are. */
export function gaps(m: Fold): number[] {
  const W = world(m);
  return m.hinges.map((h) =>
    Math.max(...[0, 1].map((k) => len3(sub3(W[h.A]![h.na[k]!]!, W[h.B]![h.nb[k]!]!)))),
  );
}

/** Signed volume of a closed fold: below zero, the paper side is outside. */
export function volume(m: Fold): number {
  let v = 0;
  m.plates.forEach((P, p) => {
    const ps = P.pts.map((pt) => add3(qrot(m.q[p]!, [pt[0] - P.c[0], pt[1] - P.c[1], 0]), m.t[p]!));
    for (let k = 1; k + 1 < ps.length; k++) v += dot3(ps[0]!, cross3(ps[k]!, ps[k + 1]!)) / 6;
  });
  return v;
}

/**
 * One animation frame of folding: a few passes (slow at first so the pieces can be seen coming
 * together), then a last round without the flat-pull that closes the seams exactly. A fold that
 * keeps moving without settling (a ruffle's wave rolling round, every position as good) counts as
 * settled once its movement stops shrinking for 400 passes. True once the fold is done.
 */
export function foldFrame(m: Fold): boolean {
  const run = m.run;
  if (run.phase === 'done' || !m.plates.length) return ((run.phase = 'done'), true);
  const passes = Math.min(8, 1 + Math.floor(run.frames / 20));
  const bend = run.phase === 'fold' ? BEND : 0;
  let moved = 0;
  for (let i = 0; i < passes; i++) moved = relax(m, bend);
  run.iters += passes;
  run.frames++;
  if (run.phase === 'fold') {
    run.calm = moved < 1e-7 ? run.calm + 1 : 0;
    if (moved < run.best * 0.5) {
      run.best = moved;
      run.since = 0;
    } else run.since += passes;
    if (run.calm > 8 || run.since > 400 || run.iters > 8000) {
      run.phase = 'settle';
      run.settle = 0;
    }
  } else {
    run.settle += passes;
    if (moved < 1e-7 || run.settle > 2000) run.phase = 'done';
  }
  return run.phase === 'done';
}

/** Fold to the end at once (tests, the demo). */
export function solveFold(m: Fold): Fold {
  while (!foldFrame(m));
  return m;
}

export interface FoldReport {
  /** Hinges whose edges are still apart, and the widest gap. */
  open: number[];
  worst: number;
  /** A closed fold's volume (U³), else 0. */
  volume: number;
  /** Closed but with no room inside (a pillow before stuffing). */
  flat: boolean;
}
export function foldReport(m: Fold): FoldReport {
  const g = gaps(m);
  const open = g.flatMap((x, i) => (x > CLOSED ? [i] : []));
  const v = m.closed ? volume(m) : 0;
  const area = m.plates.reduce((a, P) => a + P.area, 0);
  return {
    open,
    worst: Math.max(0, ...open.map((i) => g[i]!)),
    volume: v,
    flat: m.closed && Math.abs(v) < 0.02 * area ** 1.5,
  };
}

/** Edges sewn to nothing (a closed shape has none). */
export const openEdges = (m: Fold) =>
  m.use.reduce((n, es) => n + es.filter((u) => u === null).length, 0);

// ---------- front (owner, 2026-11-19) ----------
/**
 * The piece that faces front: the chosen one, else for a closed shape the piece nearest the middle
 * of the largest assembly; an open shape (null) faces the way its right side faces overall.
 */
export function frontPiece(m: Fold): number | null {
  const f = m.net.front;
  if (f !== undefined && f >= 0 && f < m.plates.length) return f;
  if (!m.closed) return null;
  const count = new Map<number, number>();
  for (const a of m.assemblyOf) count.set(a, (count.get(a) ?? 0) + 1);
  const big = [...count].reduce((b, x) => (x[1] > b[1] ? x : b))[0];
  const members = m.plates.map((_, i) => i).filter((i) => m.assemblyOf[i] === big);
  const area = members.reduce((a, i) => a + m.plates[i]!.area, 0);
  const mid = members.reduce<Pt>(
    (c, i) => {
      const P = m.plates[i]!;
      return [c[0] + (P.c[0] * P.area) / area, c[1] + (P.c[1] * P.area) / area];
    },
    [0, 0],
  );
  const d = (i: number) => len2(sub2(m.plates[i]!.c, mid));
  return members.reduce((b, i) => (d(i) < d(b) ? i : b));
}

/** Which way the object faces and which way is up (the 2D design's up). */
export function facing(m: Fold): { front: V3; up: V3 } {
  const f = frontPiece(m);
  const pick = f === null ? m.plates.map((_, i) => i) : [f];
  const sum = (v: V3) =>
    pick.reduce<V3>((a, p) => add3(a, mul3(qrot(m.q[p]!, v), m.plates[p]!.area)), [0, 0, 0]);
  let front = sum([0, 0, 1]);
  front = len3(front) < 1e-9 ? [0, 0, 1] : unit3(front);
  let up = sum([0, 1, 0]);
  up = sub3(up, mul3(front, dot3(up, front)));
  if (len3(up) < 1e-9) up = Math.abs(front[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  return { front, up: unit3(sub3(up, mul3(front, dot3(up, front)))) };
}

/** The rotation taking unit vectors x, y, z (orthonormal, right-handed) onto the axes. */
function quatToAxes(x: V3, y: V3, z: V3): Quat {
  // Rows of the rotation matrix are x, y, z.
  const [m00, m01, m02] = x;
  const [m10, m11, m12] = y;
  const [m20, m21, m22] = z;
  const tr = m00 + m11 + m22;
  if (tr > 0) {
    const s = 0.5 / Math.sqrt(tr + 1);
    return [(m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s, 0.25 / s];
  }
  if (m00 > m11 && m00 > m22) {
    const s = 2 * Math.sqrt(1 + m00 - m11 - m22);
    return [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s];
  }
  if (m11 > m22) {
    const s = 2 * Math.sqrt(1 + m11 - m00 - m22);
    return [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s];
  }
  const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
  return [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
}

/** The object's middle and radius. */
export function bounds(points: readonly V3[]): { c: V3; r: number } {
  const c = mean3(points);
  return { c, r: Math.max(0.5, ...points.map((p) => len3(sub3(p, c)))) };
}

/**
 * Turn the whole object a share of the way toward its front facing the viewer (+z) with up up
 * (+y). Returns the turn still left (radians).
 */
export function turnToFront(m: Fold, share = 0.15): number {
  if (!m.plates.length) return 0;
  const { front, up } = facing(m);
  let Q = quatToAxes(cross3(up, front), up, front);
  if (Q[3] < 0) Q = [-Q[0], -Q[1], -Q[2], -Q[3]];
  const angle = 2 * Math.acos(Math.min(1, Q[3]));
  if (angle < 1e-4) return 0;
  const t = angle < 0.01 ? 1 : share;
  const s = Math.sin((t * angle) / 2) / Math.sin(angle / 2);
  const step = qunit([Q[0] * s, Q[1] * s, Q[2] * s, Math.cos((t * angle) / 2)]);
  const { c } = bounds(world(m).flat());
  m.plates.forEach((_, p) => {
    m.q[p] = qunit(qmul(step, m.q[p]!));
    m.t[p] = add3(qrot(step, sub3(m.t[p]!, c)), c);
  });
  return angle * (1 - t);
}
