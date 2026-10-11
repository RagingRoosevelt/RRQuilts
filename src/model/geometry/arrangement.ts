// Planar arrangement: turn crossing seam lines into the faces (patches) they enclose.
//
// 1. Split every segment where it meets another (intersections + endpoints lying on it).
// 2. Merge endpoints within eps into vertices; drop zero-length and duplicate pieces (overlaps).
// 3. Keep the component containing the block outline; prune dangling edges. Everything removed is
//    reported as unconnected (by source segment id) — the user's drawing is never changed.
// 4. Walk faces with half-edges sorted by tangent angle (ties by curvature); bounded faces are the
//    loops that turn counter-clockwise on screen.
import { intersect, project } from './intersect';
import {
  curvature,
  derivative,
  dist,
  flattenLoop,
  pointAt,
  reverse,
  signedArea,
  subSegment,
  type Pt,
  type Seg,
} from './path';

export interface InputSeg {
  id: string;
  seg: Seg;
  outline?: boolean;
}

export interface Face {
  /** Boundary in order, counter-clockwise on screen. */
  segs: Seg[];
  /** Flattened boundary (for area / point-in-polygon). */
  poly: Pt[];
  area: number;
}

export interface Arrangement {
  faces: Face[];
  unconnected: string[];
}

interface Edge {
  u: number;
  v: number;
  seg: Seg;
  sources: string[];
  outline: boolean;
}

interface Half {
  from: number;
  to: number;
  seg: Seg;
  edge: number;
  angle: number;
  curv: number;
}

export function arrange(input: InputSeg[], eps: number): Arrangement {
  // 1. Split parameters.
  const params: number[][] = input.map(() => []);
  for (let i = 0; i < input.length; i++) {
    for (let j = i + 1; j < input.length; j++) {
      for (const h of intersect(input[i]!.seg, input[j]!.seg, eps)) {
        params[i]!.push(h.t1);
        params[j]!.push(h.t2);
      }
    }
  }
  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input.length; j++) {
      if (i === j) continue;
      for (const p of [input[j]!.seg.a, input[j]!.seg.b]) {
        const pr = project(input[i]!.seg, p);
        if (pr.d <= eps) params[i]!.push(pr.t);
      }
    }
  }

  // 2. Pieces, vertices, edges.
  const verts: Pt[] = [];
  const vertexOf = (p: Pt) => {
    const k = verts.findIndex((q) => dist(p, q) <= eps);
    if (k >= 0) return k;
    verts.push(p);
    return verts.length - 1;
  };
  const edges: Edge[] = [];
  input.forEach(({ id, seg, outline }, i) => {
    const cuts = [...new Set(params[i])]
      .filter((t) => dist(pointAt(seg, t), seg.a) > eps && dist(pointAt(seg, t), seg.b) > eps)
      .sort((a, b) => a - b)
      .filter((t, k, arr) => k === 0 || dist(pointAt(seg, t), pointAt(seg, arr[k - 1]!)) > eps);
    const bounds = [0, ...cuts, 1];
    for (let k = 0; k < bounds.length - 1; k++) {
      const piece = subSegment(seg, bounds[k]!, bounds[k + 1]!);
      const u = vertexOf(piece.a);
      const v = vertexOf(piece.b);
      if (u === v) continue;
      const mid = pointAt(piece, 0.5);
      const dup = edges.find(
        (e) =>
          ((e.u === u && e.v === v) || (e.u === v && e.v === u)) &&
          dist(pointAt(e.seg, 0.5), mid) <= eps * 10,
      );
      if (dup) {
        dup.sources.push(id);
        dup.outline ||= !!outline;
      } else {
        edges.push({ u, v, seg: piece, sources: [id], outline: !!outline });
      }
    }
  });

  // 3. Keep the outline's component, then prune dangling edges.
  const alive = new Set(edges.map((_, k) => k));
  const adjacency = () => {
    const adj = verts.map(() => [] as number[]);
    for (const k of alive) {
      adj[edges[k]!.u]!.push(k);
      adj[edges[k]!.v]!.push(k);
    }
    return adj;
  };
  let adj = adjacency();
  const start = edges.findIndex((e) => e.outline);
  const reached = new Set<number>();
  const stack = start >= 0 ? [edges[start]!.u] : [];
  while (stack.length) {
    const v = stack.pop()!;
    if (reached.has(v)) continue;
    reached.add(v);
    for (const k of adj[v]!) stack.push(edges[k]!.u, edges[k]!.v);
  }
  for (const k of [...alive]) if (!reached.has(edges[k]!.u)) alive.delete(k);
  for (let changed = true; changed;) {
    changed = false;
    adj = adjacency();
    for (const k of [...alive]) {
      const e = edges[k]!;
      if (adj[e.u]!.length === 1 || adj[e.v]!.length === 1) {
        alive.delete(k);
        changed = true;
      }
    }
  }
  const unconnected = new Set<string>();
  edges.forEach((e, k) => {
    if (!alive.has(k)) for (const s of e.sources) unconnected.add(s);
  });
  for (const { id, outline } of input) if (outline) unconnected.delete(id);
  // A segment is only unconnected if none of its pieces survived.
  for (const k of alive) for (const s of edges[k]!.sources) unconnected.delete(s);

  // 4. Faces.
  const out: Half[][] = verts.map(() => []);
  const halves: Half[] = [];
  for (const k of alive) {
    const e = edges[k]!;
    for (const [from, to, seg] of [
      [e.u, e.v, e.seg],
      [e.v, e.u, reverse(e.seg)],
    ] as const) {
      const d = derivative(seg, 0);
      const h: Half = {
        from,
        to,
        seg,
        edge: k,
        angle: Math.atan2(d[1], d[0]),
        curv: curvature(seg, 0),
      };
      halves.push(h);
      out[from]!.push(h);
    }
  }
  for (const list of out) {
    list.sort((a, b) => (Math.abs(a.angle - b.angle) > 1e-9 ? a.angle - b.angle : a.curv - b.curv));
  }
  const next = (h: Half) => {
    const list = out[h.to]!;
    const twin = list.findIndex((x) => x.edge === h.edge && x.to === h.from);
    return list[(twin + 1) % list.length]!;
  };

  const faces: Face[] = [];
  const seen = new Set<Half>();
  const flatTol = eps * 1e3;
  for (const h0 of halves) {
    if (seen.has(h0)) continue;
    const segs: Seg[] = [];
    let h = h0;
    do {
      seen.add(h);
      segs.push(h.seg);
      h = next(h);
    } while (h !== h0 && segs.length <= halves.length);
    const poly = flattenLoop(segs, flatTol);
    const area = signedArea(poly);
    if (area > eps * eps) faces.push({ segs, poly, area });
  }
  return { faces, unconnected: [...unconnected] };
}
