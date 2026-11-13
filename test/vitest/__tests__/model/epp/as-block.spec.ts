import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { SHAPE_OUTLINE } from '@/model/blocks/shape';
import { rosetteBlock, rosetteBlockId, rosetteFit, syncRosetteBlocks } from '@/model/epp/as-block';
import { lookupEpp } from '@/model/epp/expand';
import * as rops from '@/model/epp/rosette-ops';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { newEppQuilt } from '@/model/epp/quilt-ops';
import type { Poly } from '@/model/epp/geometry';
import type { Pt } from '@/model/geometry/path';
import type { Layout } from '@/model/schema/quilt';
import { createQuilt } from '@/model/new-quilt';
import { generateSlots } from '@/model/layout/slots';
import { flattenLoop, pathToSegs } from '@/model/geometry/path';
import { quiltPieces } from '@/model/print/pieces';
import { takesBlock } from '@/editor/scope';

const { shapes, rosettes } = eppStarters();
const lookup = lookupEpp({ eppShapes: shapes, rosettes });
const named = (n: string) => rosettes.find((r) => r.notecard.name === n)!;
const sqId = 'rrquilts.epp-square';
const S3 = Math.sqrt(3);

const square = (x: number, y: number, s = 1): Poly => [
  [x, y],
  [x + s, y],
  [x + s, y + s],
  [x, y + s],
];
/** Corners as a sorted list of rounded strings. */
const key = (p: readonly Pt[]) =>
  p
    .map(([x, y]) => `${(x + 0).toFixed(6)},${(y + 0).toFixed(6)}`)
    .sort()
    .join(' ');

describe('rosettes that fit block spaces (owner: the outline is the shape, straight edges)', () => {
  it('four squares make a square; three (a gap) or overlapping ones make none', () => {
    const four = [square(0, 0), square(1, 0), square(0, 1), square(1, 1)];
    expect(rosetteFit(four)?.shape).toBe('square');
    expect(rosetteFit(four.slice(0, 3))).toBeNull();
    expect(rosetteFit([square(0, 0, 2), square(0.5, 0.5)])).toBeNull();
  });

  it('two triangles make a 60° diamond, four a triangle, six a hexagon (any turn)', () => {
    const tri = (a: Pt, b: Pt, c: Pt): Poly => [a, b, c];
    const h = S3 / 2;
    expect(
      rosetteFit([tri([0, 0], [1, 0], [0.5, h]), tri([1, 0], [1.5, h], [0.5, h])])?.shape,
    ).toBe('diamond60');
    expect(
      rosetteFit([
        tri([0, 0], [1, 0], [0.5, h]),
        tri([1, 0], [2, 0], [1.5, h]),
        tri([0.5, h], [1.5, h], [1, 2 * h]),
        tri([1, 0], [1.5, h], [0.5, h]),
      ])?.shape,
    ).toBe('triangle');
    const hex = Array.from({ length: 6 }, (_, k): Poly => {
      const at = (i: number): Pt => [
        Math.cos(((60 * i + 17) * Math.PI) / 180),
        Math.sin(((60 * i + 17) * Math.PI) / 180),
      ];
      return [[0, 0], at(k), at(k + 1)];
    });
    expect(rosetteFit(hex)?.shape).toBe('hexagon');
  });

  it('a rectangle, or a square only after cutting, is no fit', () => {
    expect(rosetteFit([square(0, 0), square(1, 0)])).toBeNull();
    // The Hexagon Flower's outline is jagged; the Six-Diamond Star's a star.
    for (const n of ['Hexagon Flower', 'Six-Diamond Star', 'Octagon and Square'])
      expect(rosetteBlock(named(n), lookup)).toBeNull();
  });

  it('the Tumbling Block is a hexagon: a hidden block upright in the unit square', () => {
    const r = named('Tumbling Block');
    const b = rosetteBlock(r, lookup)!;
    expect(b).toMatchObject({ id: rosetteBlockId(r.id), shape: 'hexagon', rosette: r.id });
    expect(b.notecard.tags).toEqual(['system']);
    expect(b.size[1] / b.size[0]).toBeCloseTo(2 / S3);
    if (b.kind !== 'seam') throw new Error('seam');
    expect(b.patches.map((p) => p.id)).toEqual(r.pieces.map((p) => p.id));
    expect(b.colorings).toEqual(r.colorings);
    // The pieces' corners on the outline are the hexagon's.
    const corners = b.patches.flatMap((p) =>
      p.path.flatMap((c) => (c[0] === 'Z' ? [] : [[c[1], c[2]] as Pt])),
    );
    const outline = key(SHAPE_OUTLINE.hexagon);
    const onOutline = corners.filter((c) =>
      outline.includes(`${(c[0] + 0).toFixed(6)},${(c[1] + 0).toFixed(6)}`),
    );
    expect(key([...new Map(onOutline.map((c) => [key([c]), c])).values()])).toBe(outline);
  });

  it('a square rosette (four squares) is a block without a shape', () => {
    let r = rops.newRosette('Four patch');
    for (const at of [
      [0.5, 0.5],
      [1.5, 0.5],
      [0.5, 1.5],
      [1.5, 1.5],
    ] as Pt[])
      r = rops.addPiece(r, sqId, { at, turn: 0, scale: 1 });
    const b = rosetteBlock(r, lookup)!;
    expect(b.shape).toBeUndefined();
    expect(b.size).toEqual([2, 2]);
  });
});

describe('hidden rosette blocks follow use', () => {
  const r = named('Tumbling Block');
  const id = rosetteBlockId(r.id);
  it('made when a quilt places one, rebuilt when the rosette changes, gone when unused', () => {
    const made = syncRosetteBlocks([], new Set([id]), () => r, lookup)!;
    expect(made.map((b) => b.id)).toEqual([id]);
    expect(syncRosetteBlocks(made, new Set([id]), () => r, lookup)).toBeNull();
    const renamed = { ...r, notecard: { name: 'Box' } };
    expect(syncRosetteBlocks(made, new Set([id]), () => renamed, lookup)![0]!.notecard.name).toBe(
      'Box',
    );
    expect(syncRosetteBlocks(made, new Set(), () => r, lookup)).toEqual([]);
  });

  it('syncDraft makes the block and embeds the library rosette a block quilt uses', () => {
    const doc = createProject('P', 'in');
    const quilt = newEppQuilt('Q', 'in');
    quilt.layers[0].slots['b:0:0'] = { block: id, coloring: 'c1', rotation: 0, flip: false };
    const lib = {
      block: () => undefined,
      color: () => undefined,
      eppShape: (x: string) => shapes.find((s) => s.id === x),
      rosette: (x: string) => rosettes.find((s) => s.id === x),
    };
    const out = produce(doc, (d) => {
      d.project.quilts.push(quilt);
      syncDraft(d, lib);
    });
    expect(out.project.blocks.find((b) => b.id === id)?.rosette).toBe(r.id);
    expect(out.project.rosettes?.map((x) => x.id)).toContain(r.id);
    const gone = produce(out, (d) => {
      d.project.quilts[0]!.layers[0].slots = {};
      syncDraft(d, lib);
    });
    expect(gone.project.blocks.some((b) => b.id === id)).toBe(false);
  });
});

describe('rosettes in a block quilt', () => {
  const lib = {
    block: () => undefined,
    color: () => undefined,
    eppShape: (x: string) => shapes.find((s) => s.id === x),
    rosette: (x: string) => rosettes.find((s) => s.id === x),
  };
  it('a Tumbling Block fills a hexagon space exactly and its patches print as EPP', () => {
    const r = named('Tumbling Block');
    const layout = {
      style: 'shaped-blocks',
      shape: 'hexagons',
      cols: 3,
      rows: 3,
      width: 3,
      edge: 'none',
    } as Layout;
    const slot = generateSlots(layout, []).slots.find((s) => s.shape === 'hexagon')!;
    const quilt = createQuilt('H', layout, []);
    quilt.layers[0].slots[slot.id] = {
      block: rosetteBlockId(r.id),
      coloring: 'k',
      rotation: 0,
      flip: false,
    };
    quilt.colorings = { k: { fills: {} } };
    const doc = produce(createProject('P', 'in'), (d) => {
      d.project.quilts.push(quilt);
      syncDraft(d, lib);
    });
    const pieces = quiltPieces(doc, doc.project.quilts[0]!);
    expect(pieces).toHaveLength(3);
    expect(pieces.every((p) => p.epp)).toBe(true);
    // Together they are the space: the space's corners are among the patches' corners, and the
    // patches' area is the space's.
    const space = flattenLoop(pathToSegs(slot.outline, [1, 1]), 1e-6);
    const corners = new Set(pieces.flatMap((p) => p.poly.map((q) => key([q]))));
    expect(space.every((q) => corners.has(key([q])))).toBe(true);
    const area = (p: readonly Pt[]) =>
      Math.abs(
        p.reduce(
          (s, a, i) => s + a[0] * p[(i + 1) % p.length]![1] - p[(i + 1) % p.length]![0] * a[1],
          0,
        ),
      ) / 2;
    expect(pieces.reduce((s, p) => s + area(p.poly), 0)).toBeCloseTo(area(space), 6);
  });

  it('a square rosette goes only in square spaces (never stretched)', () => {
    const sq = {
      id: 'a',
      alt: 0,
      kind: 'block' as const,
      shape: 'rect' as const,
      size: [3, 3] as [number, number],
    };
    const rect = { ...sq, size: [3, 4] as [number, number] };
    expect(takesBlock(sq, null, true)).toBe(true);
    expect(takesBlock(rect, null, true)).toBe(false);
    expect(takesBlock(rect, null)).toBe(true);
  });
});
