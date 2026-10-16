import { describe, expect, it } from 'vitest';
import { apply, invert } from '@/model/geometry/affine';
import { generateSlots, type Generated } from '@/model/layout/slots';
import { onPointDefaults } from '@/model/io';
import { ensurePlainBlock, ensureSlotContent } from '@/model/plain';
import { quiltPieces } from '@/model/print/pieces';
import { cutFor } from '@/model/print/rotary';
import type { OnPointLayout } from '@/model/schema/quilt';
import { fixture } from './helpers';
import { quiltWith, slotArea } from './layout-helpers';

const op = (o: Partial<OnPointLayout> & { finish?: OnPointLayout['edge']['finish'] } = {}) => {
  const { finish, ...rest } = o;
  const base = onPointDefaults(1);
  return {
    ...base,
    edge: { ...base.edge, finish: finish ?? 'exact' },
    ...rest,
  } as OnPointLayout;
};
const ids = (g: Generated, re: RegExp) => g.slots.filter((s) => re.test(s.id)).map((s) => s.id);
const width = (g: Generated) => g.bounds[2] - g.bounds[0];
const height = (g: Generated) => g.bounds[3] - g.bounds[1];
const covered = (g: Generated) => g.slots.reduce((a, s) => a + slotArea(s), 0);

describe('On-Point layout', () => {
  it('3 across, 4 down: main blocks, blocks between, side and corner setting pieces', () => {
    const g = generateSlots(op({ cols: 3, rows: 4, block: 8 }), []);
    expect(ids(g, /^b:r/)).toHaveLength(12);
    expect(ids(g, /^b:m:/)).toHaveLength(6);
    expect(ids(g, /^set:/)).toHaveLength(2 * 2 + 2 * 3 + 4);
    expect(ids(g, /^set:m:r0c0$/)).toHaveLength(1);
    expect(new Set(g.slots.map((s) => s.id)).size).toBe(g.slots.length);
    const d = 8 * Math.SQRT2;
    expect(width(g)).toBeCloseTo(3 * d, 9);
    expect(height(g)).toBeCloseTo(4 * d, 9);
    expect(covered(g)).toBeCloseTo(width(g) * height(g), 6);
    const byId = new Map(g.slots.map((s) => [s.id, s]));
    expect(byId.get('b:r2c2')!.alt).toBe(0);
    expect(byId.get('b:m:r1c1')!.alt).toBe(1);
    expect(byId.get('b:r1c1')!.size).toEqual([8, 8]);
    expect(slotArea(byId.get('b:r1c1')!)).toBeCloseTo(64, 9);
    // Top point of the first block touches the top edge; between r1c1 sits below and right of it.
    const tf = byId.get('b:r1c1')!.transform;
    expect(tf[4]).toBeCloseTo(d / 2, 9);
    expect(tf[5]).toBeCloseTo(0, 9);
  });

  it('1 × 1 and 1 × R', () => {
    const one = generateSlots(op({ cols: 1, rows: 1 }), []);
    expect(ids(one, /^b:/)).toEqual(['b:r1c1']);
    expect(ids(one, /^set:/).sort()).toEqual([
      'set:m:r0c0',
      'set:m:r0c1',
      'set:m:r1c0',
      'set:m:r1c1',
    ]);
    expect(covered(one)).toBeCloseTo(width(one) * height(one), 6);
    const col = generateSlots(op({ cols: 1, rows: 3 }), []);
    expect(ids(col, /^b:/)).toHaveLength(3);
    expect(ids(col, /^set:/)).toHaveLength(4 + 2 * 2);
    expect(covered(col)).toBeCloseTo(width(col) * height(col), 6);
  });

  it('seam corners split each corner in two', () => {
    const g = generateSlots(op({ cols: 2, rows: 2, corner: 'seam' }), []);
    expect(ids(g, /^set:m:r0c0:/)).toEqual(['set:m:r0c0:1', 'set:m:r0c0:2']);
    expect(ids(g, /^set:/)).toHaveLength(2 + 2 + 8);
    expect(covered(g)).toBeCloseTo(width(g) * height(g), 6);
  });

  it('sashing frames every block with cornerstones; setting pieces meet the frame', () => {
    const g = generateSlots(op({ cols: 3, rows: 2, block: 6, sash: 1.5 }), []);
    const k = Math.SQRT1_2;
    const D = 2 * k * 7.5;
    expect(width(g)).toBeCloseTo(2 * D + 2 * k * 9, 9);
    expect(covered(g)).toBeCloseTo(width(g) * height(g), 6);
    expect(new Set(g.slots.map((s) => s.id)).size).toBe(g.slots.length);
    // Every block has four sashes around it: 6 main + 2 between blocks, sides shared.
    expect(ids(g, /^sash:/).length).toBeGreaterThan(0);
    expect(ids(g, /^cs:/).length).toBeGreaterThan(0);
    for (const s of g.slots.filter((x) => x.kind === 'sash'))
      expect(slotArea(s)).toBeCloseTo(6 * 1.5, 9); // no sash is trimmed in Exact
  });
});

describe('On-Point edge finishes', () => {
  const area = (g: Generated) => width(g) * height(g);

  it('Floating grows the quilt by the float on every side; setting pieces are cut larger', () => {
    const exact = generateSlots(op({ cols: 3, rows: 3 }), []);
    const g = generateSlots(op({ cols: 3, rows: 3, finish: 'float' }), []);
    expect(width(g)).toBeCloseTo(width(exact) + 2, 9);
    expect(covered(g)).toBeCloseTo(area(g), 6);
    expect(g.trim).toBe(true);
    for (const s of g.slots.filter((x) => x.kind === 'set')) {
      expect(s.cut).toBeDefined();
      expect(slotArea({ ...s, outline: s.cut! })).toBeGreaterThan(slotArea(s) - 1e-9);
    }
    const zero = generateSlots(
      op({ cols: 3, rows: 3, finish: 'float', edge: { finish: 'float', float: 0 } }),
      [],
    );
    expect(zero.slots.map((s) => s.id)).toEqual(exact.slots.map((s) => s.id));
  });

  it('Trimmed blocks: partial blocks at the edge, no setting pieces', () => {
    const g = generateSlots(op({ cols: 3, rows: 3, finish: 'trim' }), []);
    expect(ids(g, /^set:/)).toEqual([]);
    expect(ids(g, /^b:m:/)).toHaveLength(4 + 4 * 2 + 4);
    const half = g.slots.find((s) => s.id === 'b:m:r0c1')!;
    expect(slotArea(half)).toBeCloseTo(144 / 2, 6);
    expect(half.transform[0]).toBeCloseTo(12 * Math.SQRT1_2, 9); // the whole block maps to it
    expect(covered(g)).toBeCloseTo(area(g), 6);
    expect(g.trim).toBe(true);
  });

  it('No fill: no outer ring, zigzag edge, borders set aside', () => {
    const borders = [
      {
        style: 'long-horizontal' as const,
        sides: [2, 2, 2, 2] as [number, number, number, number],
      },
    ];
    const g = generateSlots(op({ cols: 3, rows: 2, finish: 'none' }), borders);
    expect(ids(g, /^set:|^border:/)).toEqual([]);
    expect(ids(g, /^b:/)).toHaveLength(6 + 2);
    expect(g.edge.filter((c) => c[0] === 'L')).toHaveLength(2 * (3 + 2 + 2 + 1) - 1);
    expect(g.bounds).toEqual(g.center);
    const exact = generateSlots(op({ cols: 3, rows: 2 }), borders);
    expect(ids(exact, /^border:/)).toHaveLength(4);
  });
});

describe('On-Point cutting (SC-003)', () => {
  it('8″ blocks: side triangles cut from 12⅝″ squares twice, corners from 6⅝″ squares once', () => {
    const doc = ensurePlainBlock(fixture());
    const q = ensureSlotContent(
      quiltWith(op({ cols: 3, rows: 3, block: 8 }), []),
      generateSlots(op({ cols: 3, rows: 3, block: 8 }), []).slots.map((s) => s.id),
    );
    const cuts = quiltPieces(doc, q).map((p) => cutFor(p, 0.25, 0.125));
    const side = cuts.filter((c) => c.kind === 'qst');
    const corner = cuts.filter((c) => c.kind === 'hst');
    expect(side).toHaveLength(8);
    expect(corner).toHaveLength(4);
    expect(side[0]!.cut).toEqual([12.625, 12.625]);
    expect(corner[0]!.cut).toEqual([6.625, 6.625]);
  });

  it('Floating cuts larger triangles', () => {
    const l = op({ cols: 3, rows: 3, block: 8, finish: 'float' });
    const doc = ensurePlainBlock(fixture());
    const q = ensureSlotContent(
      quiltWith(l, []),
      generateSlots(l, []).slots.map((s) => s.id),
    );
    const cuts = quiltPieces(doc, q).map((p) => cutFor(p, 0.25, 0.125));
    // Side: hypotenuse 8√2 + 2·1 → 13.31 + 1.21 → 14⅝″; corner: the hypotenuse line
    // meets both moved edges, so each leg grows by 2 · 1: 7.66 + 0.85 → 8⅝″.
    expect(cuts.filter((c) => c.kind === 'qst')[0]!.cut).toEqual([14.625, 14.625]);
    expect(cuts.filter((c) => c.kind === 'hst')[0]!.cut).toEqual([8.625, 8.625]);
  });
});

describe('On-Point sweep', () => {
  it('every combination covers the quilt exactly, with unique ids', () => {
    const edgeArea = (g: Generated) => slotArea({ outline: g.edge } as never);
    for (let cols = 1; cols <= 4; cols++)
      for (let rows = 1; rows <= 4; rows++)
        for (const sash of [0, 1.5])
          for (const finish of ['exact', 'float', 'trim', 'none'] as const)
            for (const corner of ['triangle', 'seam'] as const) {
              const g = generateSlots(op({ cols, rows, sash, finish, corner, block: 5 }), []);
              const at = `${cols}x${rows} sash ${sash} ${finish} ${corner}`;
              expect(new Set(g.slots.map((s) => s.id)).size, at).toBe(g.slots.length);
              expect(covered(g), at).toBeCloseTo(edgeArea(g), 6);
              // Sashing maps its whole strip; setting pieces map the turned block square of their
              // lattice cell (placed whole, then cut), like every block on point.
              for (const x of g.slots.filter((x) => x.kind === 'set'))
                expect(
                  x.transform.slice(0, 4).map((v) => Math.abs(v)),
                  `${at} ${x.id}`,
                ).toEqual(Array(4).fill(5 * Math.SQRT1_2));
              for (const x of g.slots.filter((x) => x.kind === 'sash' || x.kind === 'cs')) {
                const inv = invert(x.transform);
                for (const c of x.outline)
                  if (c[0] === 'M' || c[0] === 'L') {
                    const [u, v] = apply(inv, [c[1], c[2]]);
                    expect(Math.min(u, v, 1 - u, 1 - v), `${at} ${x.id}`).toBeGreaterThan(-1e-9);
                  }
              }
            }
  });
});

describe('On-Point printing', () => {
  const polyArea = (poly: [number, number][]) =>
    Math.abs(poly.reduce((a, p, i) => a + cross(p, poly[(i + 1) % poly.length]!), 0) / 2);
  const cross = (p: [number, number], q: [number, number]) => p[0] * q[1] - p[1] * q[0];

  it('Trimmed blocks: a partial block is cut and counted whole', () => {
    const l = op({ cols: 3, rows: 3, block: 9, finish: 'trim' });
    const q = quiltWith(l, []);
    q.layers[0].slots['b:m:r0c1'] = { block: 'seam1', coloring: 'qk1', rotation: 0, flip: false };
    const whole = structuredClone(q);
    whole.layers[0].slots = { 'b:r1c1': q.layers[0].slots['b:m:r0c1'] };
    const sum = (x: typeof q) =>
      quiltPieces(fixture(), x).reduce((a, p) => a + polyArea(p.poly), 0);
    expect(sum(q)).toBeGreaterThan(0);
    expect(sum(q)).toBeCloseTo(sum(whole), 6);
  });

  it('Floating: setting pieces are cut larger than they show', () => {
    const l = op({ cols: 2, rows: 2, block: 8, finish: 'float' });
    const doc = ensurePlainBlock(fixture());
    const q = ensureSlotContent(
      quiltWith(l, []),
      generateSlots(l, []).slots.map((s) => s.id),
    );
    for (const p of quiltPieces(doc, q)) {
      expect(p.shown).toBeDefined();
      expect(polyArea(p.poly)).toBeGreaterThan(polyArea(p.shown!));
    }
  });

  it('No fill: the edge runs along the zigzag (binding length)', () => {
    const g = generateSlots(op({ cols: 3, rows: 2, block: 10, finish: 'none' }), []);
    const pts = g.edge.flatMap((c) =>
      c[0] === 'M' || c[0] === 'L' ? [[c[1], c[2]] as const] : [],
    );
    const length = pts.reduce(
      (a, p, i) =>
        a + Math.hypot(p[0] - pts[(i + 1) % pts.length]![0], p[1] - pts[(i + 1) % pts.length]![1]),
      0,
    );
    expect(length).toBeCloseTo((4 * (3 + 2) - 4) * 10, 9);
  });
});
