// Seam-line drawing operations. Pure functions over a Drawing (normalized 0…1 coordinates);
// geometry that depends on proportions (rotation, arcs) is computed in design space (× size).
// The block editor applies results with applySeamEdit (stable patch ids) inside project.change.
import { arcGeom, pointAt, split, type Pt, type Seg } from '@/model/geometry/path';
import { intersect } from '@/model/geometry/intersect';
import { newId } from '@/model/ids';
import type { Drawing, Node, Segment } from '@/model/schema/block';

export type Size = readonly [number, number];
/** A point to draw to: an existing node (reused, so node drags move every seam there) or a new spot. */
export type Endpoint = { node: string } | { x: number; y: number };
type M = [number, number, number, number, number, number];

const nodeMap = (d: Drawing) => new Map(d.nodes.map((n) => [n.id, n]));

function ensureNode(nodes: Node[], e: Endpoint): string {
  if ('node' in e) return e.node;
  const id = newId();
  nodes.push({ id, x: e.x, y: e.y });
  return id;
}

/** Drop nodes no segment uses. */
const prune = (d: Drawing): Drawing => {
  const used = new Set(d.segments.flatMap((s) => [s.from, s.to]));
  return { nodes: d.nodes.filter((n) => used.has(n.id)), segments: d.segments };
};

export function addLine(d: Drawing, a: Endpoint, b: Endpoint): Drawing {
  const nodes = [...d.nodes];
  const from = ensureNode(nodes, a);
  const to = ensureNode(nodes, b);
  if (from === to) return d;
  return { nodes, segments: [...d.segments, { id: newId(), kind: 'line', from, to }] };
}

export function addArc(d: Drawing, a: Endpoint, b: Endpoint, sweep: number): Drawing {
  const nodes = [...d.nodes];
  const from = ensureNode(nodes, a);
  const to = ensureNode(nodes, b);
  if (from === to) return d;
  return { nodes, segments: [...d.segments, { id: newId(), kind: 'arc', from, to, sweep }] };
}

/** Rectangle from a to b split into cols × rows (outline + interior seams). */
export function addGrid(d: Drawing, a: Pt, b: Pt, cols: number, rows: number): Drawing {
  const [x0, x1] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
  const [y0, y1] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])];
  if (x1 - x0 <= 0 || y1 - y0 <= 0) return d;
  let out = d;
  const line = (p: Pt, q: Pt) => (out = addLine(out, { x: p[0], y: p[1] }, { x: q[0], y: q[1] }));
  for (let i = 0; i <= cols; i++) {
    const x = x0 + ((x1 - x0) * i) / cols;
    line([x, y0], [x, y1]);
  }
  for (let j = 0; j <= rows; j++) {
    const y = y0 + ((y1 - y0) * j) / rows;
    line([x0, y], [x1, y]);
  }
  return out;
}

export function deleteSegments(d: Drawing, ids: Set<string>): Drawing {
  return prune({ nodes: d.nodes, segments: d.segments.filter((s) => !ids.has(s.id)) });
}

// --- transforms (rotate / flip / resize / move) ---

const apply = (m: M, [x, y]: Pt): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const det = (m: M) => m[0] * m[3] - m[1] * m[2];

/** Design-space matrices about a center point. */
export const transforms = {
  rotate(deg: number, c: Pt): M {
    const r = (deg * Math.PI) / 180;
    const [cos, sin] = [Math.cos(r), Math.sin(r)];
    // Clockwise on screen (y down) for positive degrees.
    return [cos, sin, -sin, cos, c[0] - cos * c[0] + sin * c[1], c[1] - sin * c[0] - cos * c[1]];
  },
  flip(axis: 'h' | 'v' | 'd1' | 'd2', c: Pt): M {
    // h: mirror left↔right; v: top↕bottom; d1: across the "\" diagonal; d2: across "/".
    const m: Record<typeof axis, [number, number, number, number]> = {
      h: [-1, 0, 0, 1],
      v: [1, 0, 0, -1],
      d1: [0, 1, 1, 0],
      d2: [0, -1, -1, 0],
    };
    const [a, b, cc, dd] = m[axis];
    return [a, b, cc, dd, c[0] - a * c[0] - cc * c[1], c[1] - b * c[0] - dd * c[1]];
  },
  scale(sx: number, sy: number, c: Pt): M {
    return [sx, 0, 0, sy, c[0] * (1 - sx), c[1] * (1 - sy)];
  },
  translate(dx: number, dy: number): M {
    return [1, 0, 0, 1, dx, dy];
  },
};

/**
 * Transform the selected segments by `m` (design space). Nodes shared with unselected segments are
 * duplicated so the rest of the drawing stays put. Mirrors reverse arc direction.
 */
export function transformSegments(d: Drawing, ids: Set<string>, m: M, size: Size): Drawing {
  const toD = (n: { x: number; y: number }): Pt => [n.x * size[0], n.y * size[1]];
  const toN = (p: Pt) => ({ x: p[0] / size[0], y: p[1] / size[1] });
  const sharedOutside = new Set(
    d.segments.filter((s) => !ids.has(s.id)).flatMap((s) => [s.from, s.to]),
  );
  const nodes = nodeMap(d);
  const moved = new Map<string, string>(); // old node id → id of the transformed node
  const outNodes = [...d.nodes];
  const target = (id: string) => {
    let t = moved.get(id);
    if (t) return t;
    const n = nodes.get(id)!;
    const p = toN(apply(m, toD(n)));
    if (sharedOutside.has(id)) {
      t = newId();
      outNodes.push({ ...n, id: t, ...p });
    } else {
      t = id;
      const i = outNodes.findIndex((x) => x.id === id);
      outNodes[i] = { ...n, ...p };
    }
    moved.set(id, t);
    return t;
  };
  const mirror = det(m) < 0;
  const segments = d.segments.map((s): Segment => {
    if (!ids.has(s.id)) return s;
    const from = target(s.from);
    const to = target(s.to);
    if (s.kind === 'arc') return { ...s, from, to, sweep: mirror ? -s.sweep : s.sweep };
    if (s.kind === 'bezier') {
      const c = (p: [number, number]): [number, number] => {
        const q = apply(m, [p[0] * size[0], p[1] * size[1]]);
        return [q[0] / size[0], q[1] / size[1]];
      };
      return { ...s, from, to, c1: c(s.c1), c2: c(s.c2) };
    }
    return { ...s, from, to };
  });
  return prune({ nodes: outNodes, segments });
}

/** Copies of the selected segments offset by (dx, dy) normalized; returns the drawing and new ids. */
export function cloneSegments(d: Drawing, ids: Set<string>, dx: number, dy: number) {
  const nodes = nodeMap(d);
  const copyOf = new Map<string, string>();
  const outNodes = [...d.nodes];
  const copy = (id: string) => {
    let c = copyOf.get(id);
    if (!c) {
      const n = nodes.get(id)!;
      c = newId();
      outNodes.push({ ...n, id: c, x: n.x + dx, y: n.y + dy });
      copyOf.set(id, c);
    }
    return c;
  };
  const added: Segment[] = d.segments
    .filter((s) => ids.has(s.id))
    .map((s) => ({ ...s, id: newId(), from: copy(s.from), to: copy(s.to) }));
  for (const s of added) {
    if (s.kind === 'bezier') {
      s.c1 = [s.c1[0] + dx, s.c1[1] + dy];
      s.c2 = [s.c2[0] + dx, s.c2[1] + dy];
    }
  }
  return {
    drawing: { nodes: outNodes, segments: [...d.segments, ...added] },
    ids: new Set(added.map((s) => s.id)),
  };
}

export function moveNode(d: Drawing, nodeId: string, x: number, y: number): Drawing {
  return {
    nodes: d.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    segments: d.segments,
  };
}

// --- splitting and nodes ---

/** Segment geometry in design space. */
export function segGeom(d: Drawing, s: Segment, size: Size): Seg {
  const nodes = nodeMap(d);
  const P = (id: string): Pt => {
    const n = nodes.get(id)!;
    return [n.x * size[0], n.y * size[1]];
  };
  const a = P(s.from);
  const b = P(s.to);
  if (s.kind === 'line') return { kind: 'line', a, b };
  if (s.kind === 'arc') return { kind: 'arc', a, b, sweep: s.sweep };
  return {
    kind: 'bezier',
    a,
    b,
    c1: [s.c1[0] * size[0], s.c1[1] * size[1]],
    c2: [s.c2[0] * size[0], s.c2[1] * size[1]],
  };
}

/** Split segments at parameters (0 < t < 1); new nodes join the two halves. */
export function splitSegments(d: Drawing, at: Map<string, number[]>, size: Size): Drawing {
  const nodes = [...d.nodes];
  const segments: Segment[] = [];
  for (const s of d.segments) {
    const ts = [...new Set(at.get(s.id) ?? [])]
      .filter((t) => t > 1e-6 && t < 1 - 1e-6)
      .sort((a, b) => a - b);
    if (!ts.length) {
      segments.push(s);
      continue;
    }
    let rest = segGeom(d, s, size);
    let from = s.from;
    let consumed = 0;
    for (const t of ts) {
      const local = (t - consumed) / (1 - consumed);
      const [head, tail] = split(rest, local);
      const id = newId();
      nodes.push({ id, x: head.b[0] / size[0], y: head.b[1] / size[1] });
      segments.push(fromGeom(head, from, id, size));
      from = id;
      rest = tail;
      consumed = t;
    }
    segments.push(fromGeom(rest, from, s.to, size, s.id));
  }
  return { nodes, segments };
}

function fromGeom(g: Seg, from: string, to: string, size: Size, keepId?: string): Segment {
  const id = keepId ?? newId();
  if (g.kind === 'arc') return { id, kind: 'arc', from, to, sweep: g.sweep };
  if (g.kind === 'bezier') {
    const n = (p: Pt): [number, number] => [p[0] / size[0], p[1] / size[1]];
    return { id, kind: 'bezier', from, to, c1: n(g.c1), c2: n(g.c2) };
  }
  return { id, kind: 'line', from, to };
}

export type NodeMode =
  { kind: 'mid' } | { kind: 'thirds' } | { kind: 'parts'; n: number } | { kind: 'crossings' };

/** Add nodes to the given segments. */
export function addNodes(d: Drawing, ids: Set<string>, mode: NodeMode, size: Size): Drawing {
  const at = new Map<string, number[]>();
  if (mode.kind === 'crossings') {
    const eps = 1e-6 * Math.max(...size);
    for (const s of d.segments) {
      if (!ids.has(s.id)) continue;
      const g = segGeom(d, s, size);
      const ts: number[] = [];
      for (const o of d.segments) {
        if (o.id === s.id) continue;
        for (const h of intersect(g, segGeom(d, o, size), eps)) ts.push(h.t1);
      }
      at.set(s.id, ts);
    }
  } else {
    const n =
      mode.kind === 'mid' ? 2 : mode.kind === 'thirds' ? 3 : Math.max(2, Math.round(mode.n));
    for (const id of ids)
      at.set(
        id,
        Array.from({ length: n - 1 }, (_, i) => (i + 1) / n),
      );
  }
  return splitSegments(d, at, size);
}

/** Remove a node: two collinear lines merge into one; otherwise its seams are deleted. */
export function deleteNode(d: Drawing, nodeId: string, size: Size): Drawing {
  const touching = d.segments.filter((s) => s.from === nodeId || s.to === nodeId);
  if (touching.length === 2 && touching.every((s) => s.kind === 'line')) {
    const nodes = nodeMap(d);
    const [s1, s2] = touching as [Segment, Segment];
    const a = s1.from === nodeId ? s1.to : s1.from;
    const b = s2.from === nodeId ? s2.to : s2.from;
    const [pa, pn, pb] = [nodes.get(a)!, nodes.get(nodeId)!, nodes.get(b)!];
    const cross =
      (pn.x - pa.x) * size[0] * ((pb.y - pa.y) * size[1]) -
      (pn.y - pa.y) * size[1] * ((pb.x - pa.x) * size[0]);
    if (Math.abs(cross) < 1e-9 * size[0] * size[1]) {
      return prune({
        nodes: d.nodes,
        segments: [
          ...d.segments.filter((s) => s !== s1 && s !== s2),
          { id: s1.id, kind: 'line', from: a, to: b },
        ],
      });
    }
  }
  return deleteSegments(d, new Set(touching.map((s) => s.id)));
}

// --- arcs ---

export function setArcSweep(d: Drawing, segId: string, sweep: number): Drawing {
  const clamped = Math.sign(sweep || 1) * Math.min(359, Math.max(1, Math.abs(sweep)));
  return {
    nodes: d.nodes,
    segments: d.segments.map((s) =>
      s.id === segId && s.kind === 'arc' ? { ...s, sweep: clamped } : s,
    ),
  };
}

/**
 * Sweep (degrees, + = counter-clockwise on screen) of the arc from a to b whose bulge passes
 * through `handle` — all in design space. Uses the sagitta: sweep = 4·atan(2s / chord).
 */
export function sweepFromHandle(a: Pt, b: Pt, handle: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const c = Math.hypot(dx, dy);
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const s = ((handle[0] - m[0]) * -dy + (handle[1] - m[1]) * dx) / c;
  return (4 * Math.atan((2 * s) / c) * 180) / Math.PI;
}

/** Point at the middle of an arc (where its bulge handle sits), design space. */
export const arcMidpoint = (a: Pt, b: Pt, sweep: number): Pt =>
  pointAt({ kind: 'arc', a, b, sweep }, 0.5);

/** Radius of an arc (design units), for display. */
export const arcRadius = (a: Pt, b: Pt, sweep: number) => arcGeom(a, b, sweep).r;

// --- guides ---

export interface Guide {
  a: Pt;
  b: Pt;
  sweep?: number;
}

/** Move selected segments out of the drawing into guides (normalized). */
export function toGuides(d: Drawing, ids: Set<string>): { drawing: Drawing; guides: Guide[] } {
  const nodes = nodeMap(d);
  const P = (id: string): Pt => [nodes.get(id)!.x, nodes.get(id)!.y];
  const guides = d.segments
    .filter((s) => ids.has(s.id))
    .map((s): Guide => ({
      a: P(s.from),
      b: P(s.to),
      ...(s.kind === 'arc' ? { sweep: s.sweep } : {}),
    }));
  return { drawing: deleteSegments(d, ids), guides };
}
