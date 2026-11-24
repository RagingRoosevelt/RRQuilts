// 3D EPP stuffing (spec 027 User Story 7; prototype prototypes/epp3d/stuff.html). Fold first, then
// stuff (owner, 2026-11-19): each piece becomes fabric, the mesh it's drawn with (even triangles,
// MESH_PER_U points per unit along each edge, so seams line up). Seams are
// sewn by sharing points, so a seam the rigid fold couldn't close is closed by the fabric bending.
// Each step: stuffing pushes every bit of fabric outward (pressure × area, along the right side), the
// fabric moves (with damping), then every mesh edge is put back to its length a few times over
// (fabric hardly stretches): position-based dynamics. Firmness is the prototype's firmest (owner,
// 2026-11-23: "firmness to the max of the slider").
import type { Pt } from '../geometry/path';
import { add3, cross3, dot3, len3, mean3, qrot, sub3, type Fold, type V3 } from './fold';

const MESH_PER_U = 6;
const RINGS = 6;
const SUBSTEPS = 4;
const PASSES = 12;
const DAMP = 0.94;
/** Pressure per substep. */
const PRESSURE = 0.03;
/** Fabric bunches up far more easily than it stretches (it wrinkles at a pillow's corners), so a
 *  squashed edge is pushed back only this share as hard as a stretched one is pulled. */
const SQUASH = 0.03;

/** A piece's mesh, flat, around the piece's middle: points `xy` (the outline's `n` points last, in
 *  order, MESH_PER_U per unit of edge so neighbors' seams share points) and triangles `tris`,
 *  counter-clockwise. */
export interface PieceMesh {
  xy: Pt[];
  n: number;
  tris: number[];
}

/**
 * An even mesh: a triangular lattice of points inside the piece (as far apart as the outline's) and
 * the outline, joined by Delaunay triangles. Owner, 2026-11-23: rings shrunk from the outline lined
 * their corners up on spokes from the middle to the corners, and stuffing folded the fabric along
 * those, all meeting in the middle (a pinch). A concave piece (a Close space shape) keeps the rings.
 */
export function pieceMesh(pts: readonly Pt[], c: Pt): PieceMesh {
  const rim: Pt[] = [];
  pts.forEach((a, k) => {
    const b = pts[(k + 1) % pts.length]!;
    const steps = Math.max(1, Math.round(MESH_PER_U * Math.hypot(b[0] - a[0], b[1] - a[1])));
    for (let i = 0; i < steps; i++)
      rim.push([
        a[0] - c[0] + ((b[0] - a[0]) * i) / steps,
        a[1] - c[1] + ((b[1] - a[1]) * i) / steps,
      ]);
  });
  const convex = pts.every((a, k) => {
    const b = pts[(k + 1) % pts.length]!;
    const d = pts[(k + 2) % pts.length]!;
    return (b[0] - a[0]) * (d[1] - b[1]) - (b[1] - a[1]) * (d[0] - b[0]) > 1e-9;
  });
  const even = convex && evenMesh(rim);
  return even || ringMesh(rim);
}

function evenMesh(rim: Pt[]): PieceMesh | null {
  const h = 1 / MESH_PER_U;
  const n = rim.length;
  // Inside every edge by at least half a step (no slivers along the outline).
  const room = (p: Pt) =>
    Math.min(
      ...rim.map((a, k) => {
        const b = rim[(k + 1) % n]!;
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        return ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / L;
      }),
    );
  const xs = rim.map((p) => p[0]);
  const ys = rim.map((p) => p[1]);
  const inner: Pt[] = [];
  const dy = (h * Math.sqrt(3)) / 2;
  // A lattice through the middle, rows along x, so a regular piece's mesh is symmetric.
  for (let j = Math.floor(Math.min(...ys) / dy); j * dy <= Math.max(...ys); j++)
    for (let i = Math.floor(Math.min(...xs) / h) - 1; i * h <= Math.max(...xs) + h; i++) {
      const p: Pt = [(i + (j % 2 ? 0.5 : 0)) * h, j * dy];
      if (room(p) >= 0.5 * h) inner.push(p);
    }
  const xy = [...inner, ...rim];
  const tris = delaunay(xy);
  // Every outline step must be a triangle's edge (a seam runs along them).
  const has = new Set<string>();
  for (let t = 0; t < tris.length; t += 3)
    for (let k = 0; k < 3; k++) has.add(`${tris[t + k]},${tris[t + ((k + 1) % 3)]}`);
  const m = inner.length;
  for (let k = 0; k < n; k++) if (!has.has(`${m + k},${m + ((k + 1) % n)}`)) return null;
  return { xy, n, tris };
}

/**
 * Delaunay triangles of points (Bowyer-Watson), counter-clockwise. Fine for the points of a convex
 * piece: points along a straight edge never make a flat triangle, since a circle through two of them
 * holds no third point of their line.
 */
function delaunay(P: readonly Pt[]): number[] {
  const N = P.length;
  const xs = P.map((p) => p[0]);
  const ys = P.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const d = 10 * Math.max(x1 - x0, y1 - y0, 1e-9);
  const [mx, my] = [(x0 + x1) / 2, (y0 + y1) / 2];
  const V: Pt[] = [...P, [mx - 2 * d, my - d], [mx + 2 * d, my - d], [mx, my + 2 * d]];
  type Tri = { v: [number, number, number]; cx: number; cy: number; r2: number };
  const tri = (a: number, b: number, e: number): Tri => {
    const [A, B, C] = [V[a]!, V[b]!, V[e]!];
    const D = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
    const a2 = A[0] ** 2 + A[1] ** 2;
    const b2 = B[0] ** 2 + B[1] ** 2;
    const c2 = C[0] ** 2 + C[1] ** 2;
    const cx = (a2 * (B[1] - C[1]) + b2 * (C[1] - A[1]) + c2 * (A[1] - B[1])) / D;
    const cy = (a2 * (C[0] - B[0]) + b2 * (A[0] - C[0]) + c2 * (B[0] - A[0])) / D;
    return { v: [a, b, e], cx, cy, r2: (A[0] - cx) ** 2 + (A[1] - cy) ** 2 };
  };
  let tris: Tri[] = [tri(N, N + 1, N + 2)];
  for (let i = 0; i < N; i++) {
    const [px, py] = V[i]!;
    const bad = tris.filter((t) => (px - t.cx) ** 2 + (py - t.cy) ** 2 < t.r2 * (1 - 1e-12));
    // The hole's rim: edges of exactly one bad triangle.
    const rimEdges = new Map<string, [number, number]>();
    for (const t of bad)
      for (let k = 0; k < 3; k++) {
        const [a, b] = [t.v[k]!, t.v[(k + 1) % 3]!];
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        if (rimEdges.has(key)) rimEdges.delete(key);
        else rimEdges.set(key, [a, b]);
      }
    const gone = new Set(bad);
    tris = tris.filter((t) => !gone.has(t));
    for (const [a, b] of rimEdges.values()) tris.push(tri(a, b, i));
  }
  const out: number[] = [];
  for (const { v } of tris) {
    if (v.some((x) => x >= N)) continue;
    const [A, B, C] = v.map((x) => V[x]!) as [Pt, Pt, Pt];
    const area = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
    if (Math.abs(area) < 1e-12) continue;
    out.push(...(area > 0 ? v : [v[0], v[2], v[1]]));
  }
  return out;
}

/** Rings from the middle out to the outline (concave pieces). */
function ringMesh(rim: Pt[]): PieceMesh {
  const n = rim.length;
  const xy: Pt[] = [[0, 0]];
  for (let r = 1; r <= RINGS; r++)
    for (const q of rim) xy.push([(q[0] * r) / RINGS, (q[1] * r) / RINGS]);
  const tris: number[] = [];
  const at = (r: number, k: number) => 1 + (r - 1) * n + (k % n);
  for (let k = 0; k < n; k++) {
    tris.push(0, at(1, k), at(1, k + 1));
    for (let r = 1; r < RINGS; r++)
      tris.push(at(r, k), at(r + 1, k), at(r + 1, k + 1), at(r, k), at(r + 1, k + 1), at(r, k + 1));
  }
  return { xy, n, tris };
}

export interface Cloth {
  /** Points x, y, z, and where they were a step ago. */
  X: Float64Array;
  prev: Float64Array;
  tris: Int32Array;
  /** Mesh edges: a, b, rest length. */
  E: Float64Array;
  /** Each piece's mesh points (as `pieceMesh` lists them) as cloth points. */
  pieceIds: Int32Array[];
  /** Each hinge's seam as cloth points from its first end to its second. */
  paths: number[][];
  frames: number;
  calm: number;
  vol: number;
  settled: boolean;
}

/** Fabric from the folded pieces: shared points where seams are sewn, rest lengths from the flat
 *  pieces, each point starting where the fold put it (the middle of a seam's gap). */
export function buildCloth(m: Fold, meshes: readonly PieceMesh[]): Cloth {
  const P = meshes.map((mesh, p) => ({
    ...mesh,
    world: mesh.xy.map(([x, y]) => add3(qrot(m.q[p]!, [x, y, 0]), m.t[p]!)),
    base: 0,
  }));
  let total = 0;
  for (const c of P) {
    c.base = total;
    total += c.xy.length;
  }
  const parent = Int32Array.from({ length: total }, (_, i) => i);
  const find = (x: number) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]!]!;
    return x;
  };
  // Outline points of piece p on the segment u to v (its own flat coordinates), in order.
  const along = (p: number, u: Pt, v: Pt) => {
    const c = P[p]!;
    const d: Pt = [v[0] - u[0], v[1] - u[1]];
    const L = Math.hypot(d[0], d[1]);
    const out: [number, number][] = [];
    for (let i = c.xy.length - c.n; i < c.xy.length; i++) {
      const w: Pt = [c.xy[i]![0] - u[0], c.xy[i]![1] - u[1]];
      const t = (w[0] * d[0] + w[1] * d[1]) / (L * L);
      if (t > -1e-6 && t < 1 + 1e-6 && Math.abs(d[0] * w[1] - d[1] * w[0]) / L < 1e-6)
        out.push([t, c.base + i]);
    }
    return out.sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  };
  const local = (p: number, q: Pt): Pt => [q[0] - m.plates[p]!.c[0], q[1] - m.plates[p]!.c[1]];
  const paths = m.hinges.map((h) => {
    const a = along(h.A, local(h.A, h.pa[0]), local(h.A, h.pa[1]));
    const b = along(h.B, local(h.B, h.pb[0]), local(h.B, h.pb[1]));
    if (a.length === b.length) a.forEach((x, i) => (parent[find(x)] = find(b[i]!)));
    return a;
  });
  const id = new Int32Array(total).fill(-1);
  let count = 0;
  for (let i = 0; i < total; i++) {
    const r = find(i);
    if (id[r]! < 0) id[r] = count++;
    id[i] = id[r]!;
  }
  const X = new Float64Array(count * 3);
  const hits = new Float64Array(count);
  for (const c of P)
    c.world.forEach((w, i) => {
      const k = id[c.base + i]!;
      for (let d = 0; d < 3; d++) X[3 * k + d]! += w[d]!;
      hits[k]!++;
    });
  for (let k = 0; k < count; k++) for (let d = 0; d < 3; d++) X[3 * k + d]! /= hits[k]!;
  const edges = new Map<string, [number, number, number]>();
  const tris: number[] = [];
  for (const c of P)
    for (let t = 0; t < c.tris.length; t += 3) {
      const v = [c.tris[t]!, c.tris[t + 1]!, c.tris[t + 2]!];
      tris.push(...v.map((i) => id[c.base + i]!));
      for (let e = 0; e < 3; e++) {
        const i = v[e]!;
        const j = v[(e + 1) % 3]!;
        const a = id[c.base + i]!;
        const b = id[c.base + j]!;
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        if (a !== b && !edges.has(key))
          edges.set(key, [a, b, Math.hypot(c.xy[i]![0] - c.xy[j]![0], c.xy[i]![1] - c.xy[j]![1])]);
      }
    }
  return {
    X,
    prev: X.slice(),
    tris: Int32Array.from(tris),
    E: Float64Array.from([...edges.values()].flat()),
    pieceIds: P.map((c) => Int32Array.from(c.xy.map((_, i) => id[c.base + i]!))),
    paths: paths.map((a) => a.map((i) => id[i]!)),
    frames: 0,
    calm: 0,
    vol: 0,
    settled: false,
  };
}

/** One frame of stuffing: SUBSTEPS × (push, move, put lengths back). The pressure eases in over the
 *  first 90 frames. Settled once the volume stops growing (40 frames under 0.01% change): a flat
 *  pillow starts slowly, so movement alone would call it done too early. */
export function stuffFrame(c: Cloth) {
  const { X, prev, tris, E } = c;
  const n = X.length;
  const push = (PRESSURE * Math.min(1, c.frames / 90)) / 6;
  const F = new Float64Array(n);
  for (let step = 0; step < SUBSTEPS; step++) {
    F.fill(0);
    for (let t = 0; t < tris.length; t += 3) {
      const a = 3 * tris[t]!;
      const b = 3 * tris[t + 1]!;
      const d = 3 * tris[t + 2]!;
      const ux = X[b]! - X[a]!;
      const uy = X[b + 1]! - X[a + 1]!;
      const uz = X[b + 2]! - X[a + 2]!;
      const vx = X[d]! - X[a]!;
      const vy = X[d + 1]! - X[a + 1]!;
      const vz = X[d + 2]! - X[a + 2]!;
      // (u × v) is twice the triangle's area along its right side.
      const nx = (uy * vz - uz * vy) * push;
      const ny = (uz * vx - ux * vz) * push;
      const nz = (ux * vy - uy * vx) * push;
      for (const k of [a, b, d]) {
        F[k]! += nx;
        F[k + 1]! += ny;
        F[k + 2]! += nz;
      }
    }
    for (let i = 0; i < n; i++) {
      const v = (X[i]! - prev[i]!) * DAMP;
      prev[i] = X[i]!;
      X[i]! += v + F[i]!;
    }
    for (let pass = 0; pass < PASSES; pass++)
      for (let e = 0; e < E.length; e += 3) {
        const a = 3 * E[e]!;
        const b = 3 * E[e + 1]!;
        const L = E[e + 2]!;
        const dx = X[b]! - X[a]!;
        const dy = X[b + 1]! - X[a + 1]!;
        const dz = X[b + 2]! - X[a + 2]!;
        const d = Math.hypot(dx, dy, dz) || 1e-12;
        const k = ((d - L) / d) * (d < L ? 0.5 * SQUASH : 0.5);
        X[a]! += dx * k;
        X[a + 1]! += dy * k;
        X[a + 2]! += dz * k;
        X[b]! -= dx * k;
        X[b + 1]! -= dy * k;
        X[b + 2]! -= dz * k;
      }
  }
  const v = clothVolume(c);
  const grew = Math.abs(v - c.vol) / Math.max(1e-6, Math.abs(v));
  c.vol = v;
  c.frames++;
  c.calm = grew < 1e-4 ? c.calm + 1 : 0;
  c.settled = (c.frames > 90 && c.calm > 40) || c.frames > 3000;
}

/** Stuff to the end at once (tests, the demo). */
export function solveCloth(c: Cloth): Cloth {
  while (!c.settled) stuffFrame(c);
  return c;
}

export const clothPt = (c: Cloth, i: number): V3 => [c.X[3 * i]!, c.X[3 * i + 1]!, c.X[3 * i + 2]!];

/** The volume inside (U³); below zero, the paper side is outside. */
export function clothVolume(c: Cloth): number {
  let v = 0;
  const { tris } = c;
  for (let t = 0; t < tris.length; t += 3)
    v += dot3(clothPt(c, tris[t]!), cross3(clothPt(c, tris[t + 1]!), clothPt(c, tris[t + 2]!))) / 6;
  return v;
}

/** The most any bit of fabric is stretched, as a share of its length. */
export function clothStretch(c: Cloth): number {
  let most = 0;
  for (let e = 0; e < c.E.length; e += 3)
    most = Math.max(
      most,
      len3(sub3(clothPt(c, c.E[e + 1]!), clothPt(c, c.E[e]!))) / c.E[e + 2]! - 1,
    );
  return most;
}

/** The middle of the stuffed object. */
export const clothMiddle = (c: Cloth): V3 =>
  mean3(Array.from({ length: c.X.length / 3 }, (_, i) => clothPt(c, i)));
