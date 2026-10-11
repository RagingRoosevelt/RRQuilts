// After a seam-line edit: give re-derived patches stable ids and inherited fills.
//
// Overlap between old and new patches is measured by sampling a 128×128 grid over the block.
// ponytail: grid sampling, not exact clipping; slivers thinner than one cell fall back to an
// interior point. Switch to polygon clipping if mis-assignments ever show up.
import { newId } from '../ids';
import { pointInPolygon, type Pt } from '../geometry/path';
import type { ColoringBody } from '../schema/coloring';
import type { DerivedPatch } from './derive';

const N = 128;

export interface OldPatch {
  id: string;
  poly: Pt[];
}

export interface Assignment {
  id: string;
  /** Old patch whose fill this patch takes (null = nothing overlapped). */
  from: string | null;
}

function labelAt(p: Pt, polys: Pt[][]): number {
  // Last match wins: identical to first for non-overlapping patches.
  let hit = -1;
  polys.forEach((poly, i) => {
    if (pointInPolygon(p, poly)) hit = i;
  });
  return hit;
}

/**
 * Label every sample cell with the (last) polygon containing its center. Each polygon only tests
 * the cells inside its bounding box, so cost ≈ total bbox area instead of cells × polygons.
 */
function rasterize(polys: Pt[][]): Int32Array {
  const labels = new Int32Array(N * N).fill(-1);
  polys.forEach((poly, k) => {
    let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const [x, y] of poly) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    const i0 = Math.max(0, Math.floor(x0 * N - 0.5));
    const i1 = Math.min(N - 1, Math.ceil(x1 * N - 0.5));
    const j0 = Math.max(0, Math.floor(y0 * N - 0.5));
    const j1 = Math.min(N - 1, Math.ceil(y1 * N - 0.5));
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        if (pointInPolygon([(i + 0.5) / N, (j + 0.5) / N], poly)) labels[i * N + j] = k;
      }
    }
  });
  return labels;
}

function interiorPoint(poly: Pt[]): Pt {
  const c: Pt = [
    poly.reduce((s, p) => s + p[0], 0) / poly.length,
    poly.reduce((s, p) => s + p[1], 0) / poly.length,
  ];
  if (pointInPolygon(c, poly)) return c;
  // Concave: midpoint between the first vertex and the centroid, nudged inward.
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 2) % poly.length]!;
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (pointInPolygon(m, poly)) return m;
  }
  return poly[0]!;
}

export function assignIds(oldPatches: OldPatch[], fresh: DerivedPatch[]): Assignment[] {
  const oldPolys = oldPatches.map((p) => p.poly);
  const newPolys = fresh.map((p) => p.poly);
  const counts = new Map<string, number>(); // `${new}:${old}` → samples
  const sampled = new Set<number>();
  const newLabels = rasterize(newPolys);
  const oldLabels = rasterize(oldPolys);
  for (let c = 0; c < N * N; c++) {
    const n = newLabels[c]!;
    if (n < 0) continue;
    sampled.add(n);
    const o = oldLabels[c]!;
    if (o >= 0) counts.set(`${n}:${o}`, (counts.get(`${n}:${o}`) ?? 0) + 1);
  }
  fresh.forEach((_, n) => {
    if (sampled.has(n)) return;
    const o = labelAt(interiorPoint(newPolys[n]!), oldPolys);
    if (o >= 0) counts.set(`${n}:${o}`, 1);
  });

  const pairs = [...counts].map(([k, c]) => {
    const [n, o] = k.split(':').map(Number) as [number, number];
    return { n, o, c };
  });
  // Largest overlaps claim ids first; ties broken deterministically by index.
  pairs.sort((a, b) => b.c - a.c || a.n - b.n || a.o - b.o);
  const out: Assignment[] = fresh.map(() => ({ id: '', from: null }));
  const claimedOld = new Set<number>();
  for (const { n, o } of pairs) {
    if (!out[n]!.from) out[n]!.from = oldPatches[o]!.id;
    if (!out[n]!.id && !claimedOld.has(o)) {
      out[n]!.id = oldPatches[o]!.id;
      claimedOld.add(o);
    }
  }
  const used = new Set(oldPatches.map((p) => p.id));
  for (const a of out) {
    if (a.id) continue;
    do a.id = newId();
    while (used.has(a.id));
    used.add(a.id);
  }
  return out;
}

/**
 * Rewrite a coloring for the new patch set: each patch takes its source patch's fill/thread.
 * Keys that weren't patches of this block (stitch threads, other data) are kept as they are.
 */
export function remapColoring<T extends ColoringBody>(
  c: T,
  assignments: Assignment[],
  oldIds: Set<string>,
): T {
  const fills: ColoringBody['fills'] = {};
  const threads: NonNullable<ColoringBody['threads']> = {};
  for (const [k, v] of Object.entries(c.fills)) if (!oldIds.has(k)) fills[k] = v;
  for (const [k, v] of Object.entries(c.threads ?? {})) if (!oldIds.has(k)) threads[k] = v;
  for (const { id, from } of assignments) {
    if (from && c.fills[from]) fills[id] = c.fills[from];
    if (from && c.threads?.[from]) threads[id] = c.threads[from];
  }
  return { ...c, fills, ...(c.threads ? { threads } : {}) };
}

export interface Section {
  id: string;
  patches: string[];
  needsReview?: boolean;
}

/** Foundation sections: drop vanished patches; flag sections whose patches changed. */
export function remapSections(sections: Section[], assignments: Assignment[]): Section[] {
  const kept = new Set(assignments.map((a) => a.id));
  const changed = new Set(assignments.filter((a) => a.from && a.from !== a.id).map((a) => a.from!));
  return sections.map((s) => {
    const patches = s.patches.filter((p) => kept.has(p));
    const review =
      s.needsReview || patches.length !== s.patches.length || s.patches.some((p) => changed.has(p));
    return { ...s, patches, ...(review ? { needsReview: true } : {}) };
  });
}
