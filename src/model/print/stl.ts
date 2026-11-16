// 3D-printed cutting templates (spec 027 stretch goal; owner, 2026-11-13). A piece's outline (mm,
// y up) as an STL solid built the owner's way: extruded `height`, shelled with an open top `floor`
// thick, walls brought in to `wall`, outside corners rounded `rOut`, pocket corners `rIn`, outer
// edges chamfered `cOut`, inner edges `cIn` (the pocket's top edge and its edge on the floor: at half
// the pocket depth they meet in one 45° slope). The floor carries the debossed size and seam
// allowance and a hanging hole. Every step is an offset of the outline, so the solid is rounded rings
// stacked and joined: no CAD kernel.
import type { Pt } from '../geometry/path';
import type { Units } from '../schema/project';
import { STL_FONT } from './stl-font';

export interface StlBuild {
  height: number;
  floor: number;
  wall: number;
  rOut: number;
  rIn: number;
  cOut: number;
  /** Negative: (height − floor) / 2. */
  cIn: number;
  /** Text deboss depth. */
  depth: number;
}
export const STL_BUILD: StlBuild = {
  height: 4,
  floor: 1.2,
  wall: 4,
  rOut: 2,
  /** Owner, 2026-11-14: 2 mm, as the outside corners (was 6). */
  rIn: 2,
  cOut: 0.4,
  cIn: -1,
  depth: 0.6,
};

export type V3 = [number, number, number];
export type Tri = [number, number, number];
export interface StlMesh {
  V: V3[];
  T: Tri[];
  /** The letters' triangles (drawn darker in the preview). */
  textTris: [number, number];
}
export interface StlResult {
  mesh?: StlMesh;
  errors: string[];
  notes: string[];
  /** The hanging hole's size label and middle (mm), and the text size (mm). */
  hole?: string;
  holeAt?: Pt;
  textSize?: number;
}

const RAD = Math.PI / 180;
const area2 = (p: readonly Pt[]) =>
  p.reduce((s, a, i) => {
    const b = p[(i + 1) % p.length]!;
    return s + a[0] * b[1] - b[0] * a[1];
  }, 0);
const ccw = (p: readonly Pt[]): Pt[] => (area2(p) < 0 ? [...p].reverse() : [...p]);

/** A length as quilters write it: inches in sixteenths (1 1/2"), cm projects in mm. */
export function stlLength(v: number, units: Units): string {
  if (units === 'cm') return `${+(v * 10).toFixed(1)}mm`;
  const whole = Math.floor(v + 1e-9);
  const n16 = Math.round((v - whole) * 16);
  if (Math.abs((v - whole) * 16 - n16) > 1e-3) return `${+v.toFixed(3)}"`;
  if (n16 === 0) return `${whole}"`;
  let [n, d] = [n16, 16];
  while (n % 2 === 0) [n, d] = [n / 2, d / 2];
  return `${whole ? `${whole} ` : ''}${n}/${d}"`;
}

/** Convex (straight-through corners allowed): the only outlines templates can be built from. */
export function isConvex(poly: readonly Pt[]): boolean {
  const p = ccw(poly);
  return p.every((b, i) => {
    const a = p[(i + p.length - 1) % p.length]!;
    const c = p[(i + 1) % p.length]!;
    return (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) >= -1e-9;
  });
}

/** Drop repeated and straight-through corners. */
function clean(p: Pt[]): Pt[] {
  const q = p.filter((a, i) => {
    const b = p[(i + p.length - 1) % p.length]!;
    return Math.hypot(a[0] - b[0], a[1] - b[1]) > 1e-4;
  });
  return q.filter((b, i) => {
    const a = q[(i + q.length - 1) % q.length]!;
    const c = q[(i + 1) % q.length]!;
    return Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) > 1e-9;
  });
}

/** The part of a convex polygon where nx·x + ny·y ≤ c. */
function clipHalf(poly: Pt[], nx: number, ny: number, c: number): Pt[] {
  const out: Pt[] = [];
  poly.forEach((p, j) => {
    const q = poly[(j + 1) % poly.length]!;
    const fp = nx * p[0] + ny * p[1] - c;
    const fq = nx * q[0] + ny * q[1] - c;
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
      const t = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
}

/**
 * A convex outline moved in by d (or d(side's outward normal)): every side moved in, the rest cut
 * away (sides that vanish go), then cut by `extra` half-planes [nx, ny, c].
 */
function inset(
  P: readonly Pt[],
  d: number | ((nx: number, ny: number) => number),
  extra: [number, number, number][] = [],
): Pt[] | null {
  const dist = typeof d === 'function' ? d : () => d;
  let poly: Pt[] = [...P];
  for (let i = 0; i < P.length && poly.length >= 3; i++) {
    const a = P[i]!;
    const b = P[(i + 1) % P.length]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = (b[1] - a[1]) / L;
    const ny = -(b[0] - a[0]) / L;
    poly = clipHalf(poly, nx, ny, nx * a[0] + ny * a[1] - dist(nx, ny));
  }
  for (const [nx, ny, c] of extra) if (poly.length >= 3) poly = clipHalf(poly, nx, ny, c);
  if (poly.length < 3) return null;
  poly = clean(poly);
  return poly.length >= 3 && area2(poly) > 1e-6 ? poly : null;
}

/** The biggest inset that leaves anything. */
function inradius(P: readonly Pt[]): number {
  let lo = 0;
  let hi = Math.max(...P.map((p) => Math.hypot(p[0], p[1]))) * 2;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (inset(P, m)) lo = m;
    else hi = m;
  }
  return lo;
}

interface Corner {
  mid: Pt;
  dirs: number[];
}
/**
 * Where rounded rings take their points, from the outline's corners: at each corner, outward
 * directions from the side before to the side after. Every ring (any inset, any radius) has a point
 * at each, so two rings join by trapezoids with parallel sides, which can't flip or cross.
 */
function directions(P: readonly Pt[], step = 4 * RAD): Corner[] {
  const n = P.length;
  return P.map((c, i) => {
    const p = P[(i + n - 1) % n]!;
    const q = P[(i + 1) % n]!;
    const a0 = Math.atan2(-(c[0] - p[0]), c[1] - p[1]);
    let sweep = Math.atan2(-(q[0] - c[0]), q[1] - c[1]) - a0;
    while (sweep <= 0) sweep += 2 * Math.PI;
    const k = Math.max(1, Math.ceil(sweep / step));
    const m = a0 + sweep / 2;
    return {
      mid: [Math.cos(m), Math.sin(m)],
      dirs: Array.from({ length: k + 1 }, (_, j) => a0 + (sweep * j) / k),
    };
  });
}

/** Inset Q grown by rho with round corners: per outline corner, an arc around Q's corner facing it. */
function roundRing(D: Corner[], Q: Pt[], rho: number): Pt[] {
  const pts: Pt[] = [];
  for (const { mid, dirs } of D) {
    // A side that vanished in Q leaves two outline corners on one Q corner.
    const c = Q.reduce((b, q) =>
      q[0] * mid[0] + q[1] * mid[1] > b[0] * mid[0] + b[1] * mid[1] ? q : b,
    );
    for (const a of dirs) pts.push([c[0] + rho * Math.cos(a), c[1] + rho * Math.sin(a)]);
  }
  return pts;
}

/**
 * Triangles of a flat face, counter-clockwise seen from above: `outer` minus `holes` (vertex ids,
 * all counter-clockwise). Each hole is cut open to the outline from its rightmost point, then ears
 * are clipped. Every ear turns the right way, so the triangles cover the face exactly once.
 * shortcut: O(n²) ear search, fine for a few thousand points.
 */
function faceTris(outer: number[], holes: number[][], V: V3[]): Tri[] | null {
  const X = (id: number) => V[id]![0];
  const Y = (id: number) => V[id]![1];
  const inTri = (p: Pt, a: Pt, b: Pt, c: Pt) => {
    const s = (u: Pt, v: Pt) => (v[0] - u[0]) * (p[1] - u[1]) - (v[1] - u[1]) * (p[0] - u[0]);
    const d = [s(a, b), s(b, c), s(c, a)];
    return d.every((x) => x >= 0) || d.every((x) => x <= 0);
  };
  let poly = [...outer];
  const order = holes
    .map((h) => ({ h, m: h.reduce((b, id) => (X(id) > X(b) ? id : b)) }))
    .sort((a, b) => X(b.m) - X(a.m));
  for (const { h, m } of order) {
    const M: Pt = [X(m), Y(m)];
    let best = Infinity;
    let k = -1;
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length]!;
      if (Y(a) > M[1] === Y(b) > M[1]) return;
      const x = X(a) + ((M[1] - Y(a)) * (X(b) - X(a))) / (Y(b) - Y(a));
      if (x >= M[0] && x < best) [best, k] = [x, i];
    });
    if (k < 0) return null;
    const pt = (i: number): Pt => [X(poly[i]!), Y(poly[i]!)];
    let iP = X(poly[k]!) > X(poly[(k + 1) % poly.length]!) ? k : (k + 1) % poly.length;
    // A point inside the triangle (hole point, ray crossing, P) would block the cut: take the one
    // nearest the ray's direction, and the nearest of those (letters share heights).
    const P0 = pt(iP);
    const tri0: [Pt, Pt, Pt] = [M, [best, M[1]], P0];
    let tan = Math.abs(P0[1] - M[1]) / Math.max(P0[0] - M[0], 1e-12);
    let dist = P0[0] - M[0];
    poly.forEach((v, i) => {
      const q: Pt = [X(v), Y(v)];
      if ((q[0] === P0[0] && q[1] === P0[1]) || q[0] <= M[0] || !inTri(q, ...tri0)) return;
      const t = Math.abs(q[1] - M[1]) / (q[0] - M[0]);
      const dx = q[0] - M[0];
      if (t < tan - 1e-12 || (t <= tan + 1e-12 && dx < dist)) [tan, dist, iP] = [t, dx, i];
    });
    // A point used twice (an earlier cut's end) joins on the copy whose corner opens toward m.
    const ang = (u: Pt, v: Pt) => {
      const t = Math.atan2(v[1], v[0]) - Math.atan2(u[1], u[0]);
      return t < 0 ? t + 2 * Math.PI : t;
    };
    const facesM = (i: number) => {
      const nn = poly.length;
      const [b, a, c] = [pt(i), pt((i + nn - 1) % nn), pt((i + 1) % nn)];
      const out: Pt = [c[0] - b[0], c[1] - b[1]];
      const t = ang(out, [M[0] - b[0], M[1] - b[1]]);
      return t > 0 && t < ang(out, [a[0] - b[0], a[1] - b[1]]);
    };
    const Pp = pt(iP);
    const copies = poly.flatMap((v, i) => (X(v) === Pp[0] && Y(v) === Pp[1] ? [i] : []));
    if (copies.length > 1) iP = copies.find(facesM) ?? iP;
    const j0 = h.indexOf(m);
    const walk = h.map((_, t) => h[(j0 - t + h.length) % h.length]!);
    poly = [...poly.slice(0, iP + 1), ...walk, m, poly[iP]!, ...poly.slice(iP + 1)];
  }
  const n = poly.length;
  const P = poly.map((id): Pt => [X(id), Y(id)]);
  const prev = poly.map((_, i) => (i + n - 1) % n);
  const next = poly.map((_, i) => (i + 1) % n);
  const cr = (a: number, b: number, c: number) =>
    (P[b]![0] - P[a]![0]) * (P[c]![1] - P[a]![1]) - (P[b]![1] - P[a]![1]) * (P[c]![0] - P[a]![0]);
  const same = (a: number, b: number) => P[a]![0] === P[b]![0] && P[a]![1] === P[b]![1];
  const isEar = (b: number) => {
    const a = prev[b]!;
    const c = next[b]!;
    if (cr(a, b, c) <= 1e-10) return false;
    for (let p = next[c]!; p !== a; p = next[p]!) {
      if (same(p, a) || same(p, b) || same(p, c)) continue;
      if (cr(a, b, p) >= 0 && cr(b, c, p) >= 0 && cr(c, a, p) >= 0) return false;
    }
    return true;
  };
  const out: Tri[] = [];
  let left = n;
  let b = 0;
  let miss = 0;
  while (left > 3) {
    if (isEar(b)) {
      const a = prev[b]!;
      const c = next[b]!;
      out.push([poly[a]!, poly[b]!, poly[c]!]);
      next[a] = c;
      prev[c] = a;
      left--;
      miss = 0;
      b = a;
    } else if (++miss > left) return null;
    else b = next[b]!;
  }
  out.push([poly[prev[b]!]!, poly[b]!, poly[next[b]!]!]);
  return out;
}

// --- Text: Noto Sans Bold outlines ---
interface Glyph {
  adv: number;
  shapes: { outer: Pt[]; holes: Pt[][] }[];
}
const glyphs = new Map<string, Glyph | null>();
function glyph(ch: string): Glyph | null {
  if (!glyphs.has(ch)) {
    const g = STL_FONT.glyphs[ch];
    const pts = (s: string) => s.split(' ').map((q) => q.split(',').map(Number) as Pt);
    glyphs.set(
      ch,
      g
        ? {
            adv: g.adv,
            shapes: g.shapes.map(([o, ...h]) => ({ outer: pts(o!), holes: h.map(pts) })),
          }
        : null,
    );
  }
  return glyphs.get(ch)!;
}

interface TextShape {
  shapes: { outer: Pt[]; holes: Pt[][] }[];
  w: number;
  h: number;
}
/** Lines of text as outlines in mm, centred, the block's lower-left corner (margin in) at 0, 0. */
function textShape(lines: readonly string[], fontMM: number, marginMM: number): TextShape {
  const k = fontMM / STL_FONT.upm;
  const gap = fontMM * 0.3;
  const move = (pts: Pt[], dx: number, dy: number) => pts.map(([x, y]): Pt => [x + dx, y + dy]);
  const laid = lines.map((t) => {
    let x = 0;
    const shapes: TextShape['shapes'] = [];
    for (const ch of t) {
      const g = glyph(ch);
      if (!g) continue;
      const at = (pts: Pt[]) => pts.map(([a, b]): Pt => [x + a * k, b * k]);
      for (const sh of g.shapes) shapes.push({ outer: at(sh.outer), holes: sh.holes.map(at) });
      x += g.adv * k;
    }
    const pts = shapes.flatMap((sh) => sh.outer);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return xs.length
      ? {
          shapes,
          x0: Math.min(...xs),
          x1: Math.max(...xs),
          y0: Math.min(...ys),
          y1: Math.max(...ys),
        }
      : { shapes, x0: 0, x1: 0, y0: 0, y1: 0 };
  });
  const w = Math.max(...laid.map((l) => l.x1 - l.x0));
  const h = laid.reduce((sum, l) => sum + l.y1 - l.y0, 0) + gap * (laid.length - 1);
  const shapes: TextShape['shapes'] = [];
  let top = marginMM + h;
  for (const l of laid) {
    const dx = marginMM + (w - (l.x1 - l.x0)) / 2 - l.x0;
    const dy = top - l.y1;
    for (const sh of l.shapes)
      shapes.push({ outer: move(sh.outer, dx, dy), holes: sh.holes.map((hh) => move(hh, dx, dy)) });
    top -= l.y1 - l.y0 + gap;
  }
  return { shapes, w: w + 2 * marginMM, h: h + 2 * marginMM };
}

const HOLES: [number, string][] = [
  [19.05, '3/4"'],
  [9.525, '3/8"'],
];
/** How small the text may get to make room for a hanging hole (owner, 2026-11-13). */
const TEXT_FOR_HOLE = 0.75;
/** Text sizes to try: the target, then 5% smaller each step, down to 2.5 mm. */
function textSizes(target: number): number[] {
  const out: number[] = [];
  for (let f = target; f > 2.5; f *= 0.95) out.push(+f.toFixed(2));
  return [...out, 2.5];
}

interface Marks {
  hole: { c: Pt; r: number; label: string } | null;
  text: (TextShape & { font: number; x0: number; y0: number }) | null;
}
interface HoleSpot {
  c: Pt;
  r: number;
  /** Unit direction from the middle of the face toward the hole. */
  u: Pt;
}

/** A polygon's area centroid. */
function centroid(p: readonly Pt[]): Pt {
  let a = 0;
  let x = 0;
  let y = 0;
  p.forEach((s, i) => {
    const t = p[(i + 1) % p.length]!;
    const cr = s[0] * t[1] - t[0] * s[1];
    a += cr;
    x += (s[0] + t[0]) * cr;
    y += (s[1] + t[1]) * cr;
  });
  return Math.abs(a) < 1e-12 ? p[0]! : [x / (3 * a), y / (3 * a)];
}

/** The farthest point from `o` along unit direction `u` that's inside convex counter-clockwise `Q`. */
function farthestAlong(Q: readonly Pt[], o: Pt, u: Pt): Pt | null {
  let lo = 0;
  let hi = Infinity;
  for (let i = 0; i < Q.length; i++) {
    const a = Q[i]!;
    const b = Q[(i + 1) % Q.length]!;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = (b[1] - a[1]) / L;
    const ny = -(b[0] - a[0]) / L;
    const s = nx * (o[0] - a[0]) + ny * (o[1] - a[1]);
    const du = nx * u[0] + ny * u[1];
    if (Math.abs(du) < 1e-12) {
      if (s > 1e-9) return null;
    } else if (du > 0) hi = Math.min(hi, -s / du);
    else lo = Math.max(lo, -s / du);
  }
  return hi === Infinity || hi < lo - 1e-9 ? null : [o[0] + hi * u[0], o[1] + hi * u[1]];
}

/**
 * Where a hole of diameter `d` can go, best first (owner, 2026-11-13): on a line from the middle of
 * the face out to a corner of the piece, as far out as it fits; the corner that leaves it farthest
 * from the middle first (ties: the higher, then the further left). Then the old spots, the middle
 * of the top and of the bottom.
 */
function holeSpots(face: Pt[], corners: readonly Pt[], d: number, clr: number): HoleSpot[] {
  const Q = inset(face, d / 2 + clr);
  if (!Q) return [];
  const r = d / 2;
  const o = centroid(face);
  const out: (HoleSpot & { k: number })[] = [];
  for (const v of corners) {
    const L = Math.hypot(v[0] - o[0], v[1] - o[1]);
    if (L < 1e-9) continue;
    const u: Pt = [(v[0] - o[0]) / L, (v[1] - o[1]) / L];
    const c = farthestAlong(Q, o, u);
    if (c) out.push({ c, r, u, k: Math.hypot(c[0] - o[0], c[1] - o[1]) });
  }
  // Rounded corners are drawn in steps, so equal corners can differ by a hair.
  const near = (a: number, b: number) => Math.abs(a - b) < 0.05;
  out.sort((a, b) =>
    !near(a.k, b.k) ? b.k - a.k : !near(a.c[1], b.c[1]) ? b.c[1] - a.c[1] : a.c[0] - b.c[0],
  );
  const ys = Q.map((p) => p[1]);
  for (const up of [true, false]) {
    const y = up ? Math.max(...ys) : Math.min(...ys);
    const t = Q.filter((p) => Math.abs(p[1] - y) < 1e-6);
    const c: Pt = [t.reduce((s, p) => s + p[0], 0) / t.length, y];
    out.push({ c, r, u: [0, up ? 1 : -1], k: 0 });
  }
  return out.map(({ c, u }) => ({ c, r, u }));
}

/**
 * Where the text and the hanging hole go on a flat convex face (owner, 2026-11-13): the biggest text
 * up to `target` mm first, then the biggest hole that still fits, on a line from the middle out to
 * one of the piece's `corners` (`holeSpots`), the text clear of it. No hole fits: the text shrinks,
 * down to `TEXT_FOR_HOLE` of its size, until one does (else the text alone). No room for text: the
 * hole alone.
 */
function placeMarks(
  face: Pt[],
  corners: readonly Pt[],
  lines: readonly string[],
  target: number,
  clr = 1,
): Marks {
  const textAt = (font: number, hole: HoleSpot | null) => {
    if (!lines.length) return null;
    const tg = textShape(lines, font, 0.6);
    const support = (nx: number, ny: number) =>
      (Math.abs(nx) * tg.w) / 2 + (Math.abs(ny) * tg.h) / 2;
    // The text stays on the far side of a line past the hole: across `u`, or level or upright
    // (below, above or beside it), whichever leaves room first.
    const across: (Pt | null)[] = hole
      ? ([hole.u, [0, 1], [0, -1], [1, 0], [-1, 0]] as Pt[]).filter(
          (n, i) => i === 0 || n[0] * hole.u[0] + n[1] * hole.u[1] > 1e-6,
        )
      : [null];
    for (const n of across) {
      const extra: [number, number, number][] =
        hole && n
          ? [[n[0], n[1], n[0] * hole.c[0] + n[1] * hole.c[1] - hole.r - clr - support(n[0], n[1])]]
          : [];
      const room = inset(face, (nx, ny) => clr + support(nx, ny), extra);
      if (!room) continue;
      const c = room.reduce<Pt>(
        (s, p) => [s[0] + p[0] / room.length, s[1] + p[1] / room.length],
        [0, 0],
      );
      return { ...tg, font, x0: c[0] - tg.w / 2, y0: c[1] - tg.h / 2 };
    }
    return null;
  };
  const sizes = textSizes(target);
  for (const [i, best] of sizes.entries()) {
    const alone = textAt(best, null);
    if (!alone) continue;
    // The biggest text that fits, made up to a quarter smaller if that makes room for a hole.
    for (const f of sizes.slice(i).filter((f) => f >= best * TEXT_FOR_HOLE - 1e-9))
      for (const [d, label] of HOLES)
        for (const hole of holeSpots(face, corners, d, clr)) {
          const text = textAt(f, hole);
          if (text) return { hole: { c: hole.c, r: hole.r, label }, text };
        }
    return { hole: null, text: alone };
  }
  for (const [d, label] of HOLES) {
    const hole = holeSpots(face, corners, d, clr)[0];
    if (hole) return { hole: { c: hole.c, r: hole.r, label }, text: null };
  }
  return { hole: null, text: null };
}

/**
 * The template for a convex outline (mm, y up, any turn): the solid, or why not. `lines` are
 * debossed in the floor (a solid template's top), aiming for `textSize` mm.
 */
export function buildTemplate(
  outline: readonly Pt[],
  b: StlBuild,
  lines: readonly string[],
  textSize: number,
): StlResult {
  const P = clean(ccw(outline));
  const { height: H, floor: F, wall: W, rOut, rIn: rIn0, cOut, depth } = b;
  const cIn = b.cIn < 0 ? (H - F) / 2 : b.cIn;
  const errors: string[] = [];
  const notes: string[] = [];
  if (P.length < 3 || !isConvex(P))
    return { errors: ['Concave pieces can’t be made into 3D templates yet.'], notes };
  if (![H, F, W, rOut, rIn0, cOut, cIn, depth].every((v) => Number.isFinite(v) && v >= 0))
    errors.push('Every size must be a number, 0 or more.');
  if (!(F > 0 && F < H)) errors.push('The floor must be thinner than the height.');
  if (!(cOut < rOut))
    errors.push('The outer chamfer must be smaller than the outer corner radius.');
  if (!(2 * cOut < H)) errors.push('The outer chamfers are too big for the height.');
  if (!(2 * cIn <= H - F + 1e-9))
    errors.push('The inner chamfers can be at most half the pocket depth.');
  if (!(rIn0 > cIn)) errors.push('The inner corner radius must be bigger than the inner chamfer.');
  if (!(W - cIn > cOut)) errors.push('The wall is too thin for its chamfers (no flat top left).');
  if (!(depth > 0 && depth <= F - 0.2))
    errors.push('The text depth must leave at least 0.2 mm of floor.');
  if (errors.length) return { errors, notes };
  const Qo = inset(P, rOut);
  if (!Qo) return { errors: ['The piece is too small for the outer corner radius.'], notes };
  const room = inradius(P) - W - 0.25;
  let pocket: { Q: Pt[]; rIn: number } | null = null;
  if (room > cIn + 0.2) {
    const rIn = Math.min(rIn0, room);
    if (rIn < rIn0)
      notes.push(`Inner corner radius cut to ${rIn.toFixed(2)} mm so the pocket fits.`);
    pocket = { Q: inset(P, W + rIn)!, rIn };
  } else notes.push('Too small for a pocket: the template is solid.');

  const D = directions(P);
  const V: V3[] = [];
  const T: Tri[] = [];
  /** A ring's vertex per direction; points that fall together share a vertex. */
  const ring = (Q: Pt[], rho: number, z: number) => {
    const idx: number[] = [];
    roundRing(D, Q, rho).forEach(([x, y], k) => {
      const prev = k ? V[idx[k - 1]!]! : null;
      if (prev && Math.hypot(prev[0] - x, prev[1] - y) < 1e-7) idx.push(idx[k - 1]!);
      else idx.push(V.push([x, y, z]) - 1);
    });
    const L = idx[idx.length - 1]!;
    const f = V[idx[0]!]!;
    const l = V[L]!;
    if (L !== idx[0] && Math.hypot(f[0] - l[0], f[1] - l[1]) < 1e-7) {
      V.pop();
      return idx.map((i) => (i === L ? idx[0]! : i));
    }
    return idx;
  };
  const tri = (a: number, b: number, c: number) => {
    if (a !== b && b !== c && a !== c) T.push([a, b, c]);
  };
  // Levels at the same height are one ring (no chamfer there).
  const levels = (list: [number, number][]) =>
    list.filter((l, i) => i === 0 || Math.abs(l[0] - list[i - 1]![0]) > 1e-9);
  /** Band from an outer or lower ring `a` to `b`: a wall facing out (or in), or the flat top. */
  const stitch = (a: number[], b: number[], out: boolean) => {
    for (let i = 0; i < a.length; i++) {
      const j = (i + 1) % a.length;
      const [p, q, r, s] = [a[i]!, a[j]!, b[j]!, b[i]!];
      if (out) {
        tri(p, q, r);
        tri(p, r, s);
      } else {
        tri(p, r, q);
        tri(p, s, r);
      }
    }
  };
  const uniq = (idx: number[]) =>
    idx.filter((v, k) => v !== idx[(k + idx.length - 1) % idx.length]);
  let faceOk = true;
  /** A flat face facing up (or down) with holes. */
  const face = (outerIds: number[], holes: number[][], up: boolean) => {
    const ts = faceTris(uniq(outerIds), holes, V);
    if (!ts) return (faceOk = false);
    for (const [a, b2, c] of ts) {
      if (up) tri(a, b2, c);
      else tri(a, c, b2);
    }
    return true;
  };
  const circle = (c: Pt, r: number, z: number) =>
    Array.from(
      { length: 64 },
      (_, k) =>
        V.push([
          c[0] + r * Math.cos((k * Math.PI) / 32),
          c[1] + r * Math.sin((k * Math.PI) / 32),
          z,
        ]) - 1,
    );
  let textFrom: number;
  /** Letters sunk `depth` from zTop: their outlines are holes in the face, their holes islands. */
  const deboss = (t: NonNullable<Marks['text']>, zTop: number) => {
    const loop = (pts: Pt[], z: number) => pts.map(([x, y]) => V.push([t.x0 + x, t.y0 + y, z]) - 1);
    const parts = t.shapes.map((sh) => ({
      top: loop(sh.outer, zTop),
      low: loop(sh.outer, zTop - depth),
      holes: sh.holes.map((hh) => ({ top: loop(hh, zTop), low: loop(hh, zTop - depth) })),
    }));
    for (const p of parts) for (const hh of p.holes) face(hh.top, [], true);
    textFrom = T.length;
    for (const p of parts) {
      stitch(p.low, p.top, false);
      for (const hh of p.holes) stitch(hh.low, hh.top, true);
      face(
        p.low,
        p.holes.map((hh) => hh.low),
        true,
      );
    }
    return parts.map((p) => p.top);
  };

  const outer = levels([
    [0, rOut - cOut],
    [cOut, rOut],
    [H - cOut, rOut],
    [H, rOut - cOut],
  ]).map(([z, r]) => ring(Qo, r, z));
  for (let k = 0; k + 1 < outer.length; k++) stitch(outer[k]!, outer[k + 1]!, true);
  let inner: number[][] = [];
  if (pocket) {
    const { Q, rIn } = pocket;
    inner = levels([
      [H, rIn + cIn],
      [H - cIn, rIn],
      [F + cIn, rIn],
      [F, rIn - cIn],
    ]).map(([z, r]) => ring(Q, r, z));
    for (let k = 0; k + 1 < inner.length; k++) stitch(inner[k + 1]!, inner[k]!, false);
    stitch(outer[outer.length - 1]!, inner[0]!, true);
  }
  // The floor (or a solid template's top) carries the text and the hanging hole.
  const zTop = pocket ? F : H;
  const flat = pocket ? inner[inner.length - 1]! : outer[outer.length - 1]!;
  const marks = placeMarks(
    uniq(flat).map((i): Pt => [V[i]![0], V[i]![1]]),
    P,
    lines,
    textSize,
  );
  const holes: number[][] = [];
  textFrom = T.length;
  if (marks.text) holes.push(...deboss(marks.text, zTop));
  else if (lines.length) notes.push('No room for the text.');
  const textTris: [number, number] = [textFrom, T.length];
  let low: number[] | null = null;
  if (marks.hole) {
    low = circle(marks.hole.c, marks.hole.r, 0);
    const top = circle(marks.hole.c, marks.hole.r, zTop);
    stitch(low, top, false);
    holes.push(top);
  } else notes.push('No room for a hanging hole.');
  face(flat, holes, true);
  face(outer[0]!, low ? [low] : [], false);
  if (!faceOk) return { errors: ['Could not cut a flat face into triangles.'], notes };
  return {
    mesh: { V, T, textTris },
    errors,
    notes,
    ...(marks.hole ? { hole: marks.hole.label, holeAt: marks.hole.c } : {}),
    ...(marks.text ? { textSize: marks.text.font } : {}),
  };
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Closed and consistently turned: every edge used once each way. Volume > 0: faces point out. Flat
 * faces: tops up, bottom down.
 */
export function checkMesh({ V, T }: StlMesh) {
  const dir = new Map<string, number>();
  let degenerate = 0;
  let flipped = 0;
  let volume = 0;
  for (const t of T) {
    for (let k = 0; k < 3; k++) {
      const key = `${t[k]},${t[(k + 1) % 3]}`;
      dir.set(key, (dir.get(key) ?? 0) + 1);
    }
    const [a, b, c] = t.map((i) => V[i]!) as [V3, V3, V3];
    const n = cross(sub(b, a), sub(c, a));
    if (Math.hypot(...n) < 1e-9) degenerate++;
    if (a[2] === b[2] && b[2] === c[2] && n[2] * (a[2] < 1e-9 ? -1 : 1) <= 0) flipped++;
    volume += dot(a, cross(b, c)) / 6;
  }
  let badEdges = 0;
  for (const [key, n] of dir) {
    const [a, b] = key.split(',');
    if (n !== 1 || dir.get(`${b},${a}`) !== 1) badEdges++;
  }
  return { badEdges, degenerate, flipped, volume };
}

/** Binary STL (mm). */
export function stlBytes({ V, T }: StlMesh, name: string): ArrayBuffer {
  const buf = new ArrayBuffer(84 + 50 * T.length);
  const dv = new DataView(buf);
  const head = `RRQuilts ${name}`.slice(0, 80);
  for (let i = 0; i < head.length; i++) dv.setUint8(i, head.charCodeAt(i) & 0x7f);
  dv.setUint32(80, T.length, true);
  let o = 84;
  for (const t of T) {
    const [a, b, c] = t.map((i) => V[i]!) as [V3, V3, V3];
    const n = cross(sub(b, a), sub(c, a));
    const L = Math.hypot(...n) || 1;
    for (const v of [n.map((x) => x / L), a, b, c])
      for (const x of v) {
        dv.setFloat32(o, x, true);
        o += 4;
      }
    o += 2;
  }
  return buf;
}
