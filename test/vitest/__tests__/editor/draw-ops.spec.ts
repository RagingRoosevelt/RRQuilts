import { describe, expect, it } from 'vitest';
import {
  addArc,
  addGrid,
  addLine,
  addNodes,
  arcMidpoint,
  cloneSegments,
  deleteNode,
  deleteSegments,
  moveNode,
  setArcSweep,
  sweepFromHandle,
  toGuides,
  transformSegments,
  transforms,
} from '@/editor/draw-ops';
import { deriveSeamPatches } from '@/model/blocks/derive';
import type { Drawing } from '@/model/schema/block';

const empty: Drawing = { nodes: [], segments: [] };
const size = [9, 9] as const;
const patches = (d: Drawing) => deriveSeamPatches(d, [9, 9]).patches.length;
const pt = (x: number, y: number) => ({ x, y });
const t = 1 / 3;

describe('drawing operations', () => {
  it('grid draws a nine-patch in one step', () => {
    const d = addGrid(empty, [0, 0], [1, 1], 3, 3);
    expect(patches(d)).toBe(9);
  });

  it('lines reuse a snapped node so dragging it moves every seam there', () => {
    let d = addLine(empty, pt(0, 0), pt(0.5, 0.5));
    const center = d.nodes[1]!.id;
    d = addLine(d, { node: center }, pt(1, 0));
    expect(d.nodes).toHaveLength(3);
    d = moveNode(d, center, 0.5, 0.25);
    const n = d.nodes.find((x) => x.id === center)!;
    expect([n.x, n.y]).toEqual([0.5, 0.25]);
    expect(d.segments.filter((s) => s.from === center || s.to === center)).toHaveLength(2);
  });

  it('delete removes seams and their orphaned nodes', () => {
    let d = addLine(empty, pt(0, 0.5), pt(1, 0.5));
    d = addLine(d, pt(0.5, 0), pt(0.5, 1));
    d = deleteSegments(d, new Set([d.segments[0]!.id]));
    expect(d.segments).toHaveLength(1);
    expect(d.nodes).toHaveLength(2);
  });

  it('rotate 90° about the center turns a horizontal seam vertical; flips mirror arcs', () => {
    let d = addLine(empty, pt(0, 0.25), pt(1, 0.25));
    d = transformSegments(d, new Set([d.segments[0]!.id]), transforms.rotate(90, [4.5, 4.5]), size);
    const xs = d.nodes.map((n) => +n.x.toFixed(6));
    expect(xs).toEqual([0.75, 0.75]);
    let a = addArc(empty, pt(0.5, 0), pt(0, 0.5), -90);
    a = transformSegments(a, new Set([a.segments[0]!.id]), transforms.flip('h', [4.5, 4.5]), size);
    expect(a.segments[0]).toMatchObject({ kind: 'arc', sweep: 90 });
  });

  it('transforming part of a drawing detaches shared nodes instead of dragging neighbors', () => {
    let d = addLine(empty, pt(0, 0.5), pt(0.5, 0.5));
    const mid = d.nodes[1]!.id;
    d = addLine(d, { node: mid }, pt(1, 0.5));
    const moved = transformSegments(
      d,
      new Set([d.segments[1]!.id]),
      transforms.translate(0, 1),
      size,
    );
    const kept = moved.segments[0]!;
    const keptMid = moved.nodes.find((n) => n.id === kept.to)!;
    expect(keptMid.y).toBe(0.5);
  });

  it('clone copies selected seams with new ids', () => {
    const d = addLine(empty, pt(0.1, 0.1), pt(0.2, 0.2));
    const r = cloneSegments(d, new Set([d.segments[0]!.id]), 0.1, 0);
    expect(r.drawing.segments).toHaveLength(2);
    expect(r.ids.size).toBe(1);
  });

  it('adds nodes at midpoints, thirds, N parts, and crossings', () => {
    const base = addLine(empty, pt(0, 0.5), pt(1, 0.5));
    const id = new Set([base.segments[0]!.id]);
    expect(addNodes(base, id, { kind: 'mid' }, size).segments).toHaveLength(2);
    expect(addNodes(base, id, { kind: 'thirds' }, size).segments).toHaveLength(3);
    expect(addNodes(base, id, { kind: 'parts', n: 5 }, size).segments).toHaveLength(5);
    const crossed = addLine(base, pt(t, 0), pt(t, 1));
    expect(addNodes(crossed, id, { kind: 'crossings' }, size).segments).toHaveLength(3);
    // Splitting doesn't change the patches.
    expect(patches(addNodes(crossed, id, { kind: 'parts', n: 4 }, size))).toBe(patches(crossed));
  });

  it('splitting an arc keeps true arcs whose sweeps add up', () => {
    const a = addArc(empty, pt(0.5, 0), pt(0, 0.5), -90);
    const s = addNodes(a, new Set([a.segments[0]!.id]), { kind: 'mid' }, size);
    expect(s.segments.map((x) => x.kind === 'arc' && x.sweep)).toEqual([-45, -45]);
  });

  it('deleting a node between two collinear lines merges them', () => {
    const base = addLine(empty, pt(0, 0.5), pt(1, 0.5));
    const split = addNodes(base, new Set([base.segments[0]!.id]), { kind: 'mid' }, size);
    const mid = split.nodes.find((n) => n.x === 0.5)!.id;
    const merged = deleteNode(split, mid, size);
    expect(merged.segments).toHaveLength(1);
    expect(merged.nodes).toHaveLength(2);
  });

  it('bulge handle ↔ sweep round-trips; sweep stays within 1–359°', () => {
    const a: [number, number] = [4.5, 0];
    const b: [number, number] = [0, 4.5];
    for (const sweep of [-90, -30, 45, 170]) {
      expect(sweepFromHandle(a, b, arcMidpoint(a, b, sweep))).toBeCloseTo(sweep, 6);
    }
    const d = addArc(empty, pt(0.5, 0), pt(0, 0.5), -90);
    expect(setArcSweep(d, d.segments[0]!.id, 0).segments[0]).toMatchObject({ sweep: 1 });
    expect(setArcSweep(d, d.segments[0]!.id, -400).segments[0]).toMatchObject({ sweep: -359 });
  });

  it('converting seams to guides removes them from the drawing', () => {
    const d = addLine(addLine(empty, pt(0, 0.5), pt(1, 0.5)), pt(0.5, 0), pt(0.5, 1));
    const r = toGuides(d, new Set([d.segments[0]!.id]));
    expect(r.drawing.segments).toHaveLength(1);
    expect(r.guides).toEqual([{ a: [0, 0.5], b: [1, 0.5] }]);
  });
});
