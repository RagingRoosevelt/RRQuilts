import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { builtinItems } from '@/content/starter';
import { rosetteBlockId } from '@/model/epp/as-block';
import { generateFor } from '@/model/layout/slots';
import { blockEdgeItems, blockSize, niceLengths, scaleBlockSize } from '@/model/layout/even-edge';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { Layout, Quilt } from '@/model/schema/quilt';

const blocks = builtinItems().blocks;
const { shapes, rosettes } = eppStarters();
const lib = {
  block: (x: string) => blocks.find((b) => b.id === x),
  color: () => undefined,
  eppShape: (x: string) => shapes.find((s) => s.id === x),
  rosette: (x: string) => rosettes.find((s) => s.id === x),
};
const tumbling = rosettes.find((r) => r.notecard.name === 'Tumbling Block')!;
const diamond = blocks.find((b) => b.shape === 'diamond60')!;

/** A quilt with `block` in the first space of its shape. */
function placed(layout: Layout, block: string, shape: string) {
  const quilt = createQuilt('Q', layout, []);
  const slot = generateFor(quilt).slots.find((s) => s.kind === 'block' && s.shape === shape)!;
  quilt.layers[0].slots[slot.id] = { block, coloring: 'k', rotation: 0, flip: false };
  quilt.colorings = { k: { fills: {} } };
  return produce(createProject('P', 'in'), (d) => {
    d.project.quilts.push(quilt);
    syncDraft(d, lib);
  });
}

describe('even edge length', () => {
  it('offers every 1/8 in (1 mm) from the whole inch (cm) below to the one above', () => {
    const eighths = (a: number, b: number) =>
      Array.from({ length: (b - a) * 8 + 1 }, (_, i) => a + i / 8);
    expect(niceLengths(3.536, 'in')).toEqual(eighths(3, 4));
    expect(niceLengths(3.5, 'in')).toEqual(eighths(3, 4));
    expect(niceLengths(2, 'in')).toEqual(eighths(1, 3));
    expect(niceLengths(0.3, 'in')).toEqual(eighths(0, 1).slice(1));
    expect(niceLengths(8.84, 'cm')).toEqual([8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9]);
  });

  const cases: [string, Layout, string, string][] = [
    [
      'straight set, 9 × 6 blocks',
      { style: 'straight-set', cols: 2, rows: 2, block: [9, 6], sash: [1, 1], sashBorder: false },
      'rrquilts.ohio-star',
      'rect',
    ],
    [
      'on point',
      {
        style: 'on-point',
        cols: 2,
        rows: 2,
        block: 8,
        sash: 0,
        corner: 'triangle',
        edge: { finish: 'exact', float: 0 },
      },
      'rrquilts.ohio-star',
      'rect',
    ],
    [
      'strips',
      {
        style: 'horizontal-strip',
        length: 40,
        strips: [
          { id: 's1', style: 'blocks', width: 8, along: 5, across: 1 },
          { id: 's2', style: 'plain', width: 3, along: 1, across: 1 },
        ],
      },
      'rrquilts.ohio-star',
      'rect',
    ],
    [
      'baby blocks',
      {
        style: 'baby-blocks',
        cols: 3,
        rows: 3,
        width: 3 * Math.sqrt(3),
        top: 3,
        side: 3,
        edge: 'none',
      },
      diamond.id,
      'diamond60',
    ],
    [
      'a rosette in shaped blocks',
      { style: 'shaped-blocks', shape: 'hexagons', cols: 3, rows: 3, width: 3, edge: 'none' },
      rosetteBlockId(tumbling.id),
      'hexagon',
    ],
  ];
  it.each(cases)('%s: scaling makes the picked edge the nice length', (_, layout, id, shape) => {
    const doc = placed(layout, id, shape);
    const quilt = doc.project.quilts[0]!;
    const [item] = blockEdgeItems(doc, quilt);
    expect(item).toBeDefined();
    const patch = item!.patches.find((p) => p.edges.length)!;
    const edge = patch.edges.at(-1)!;
    const target = niceLengths(edge.len, 'in').at(-1)!;
    const k = target / edge.len;
    const scaled: Quilt = { ...quilt, layout: scaleBlockSize(quilt.layout, k) };
    const doc2 = produce(doc, (d) => {
      d.project.quilts[0] = scaled;
    });
    const [after] = blockEdgeItems(doc2, scaled);
    const i = item!.patches.indexOf(patch);
    expect(after!.patches[i]!.edges.at(-1)!.len).toBeCloseTo(target, 9);
    // Every patch keeps its shape: all edges grow by the same factor.
    after!.patches.forEach((p, j) =>
      p.edges.forEach((e, n) => expect(e.len).toBeCloseTo(item!.patches[j]!.edges[n]!.len * k, 9)),
    );
    blockSize(scaled.layout).forEach((v, n) =>
      expect(v).toBeCloseTo(blockSize(quilt.layout)[n]! * k, 9),
    );
  });

  it('a block in two sizes says which', () => {
    const quilt = createQuilt(
      'Q',
      {
        style: 'horizontal-strip',
        length: 40,
        strips: [
          { id: 's1', style: 'blocks', width: 8, along: 5, across: 1 },
          { id: 's2', style: 'blocks', width: 10, along: 4, across: 1 },
        ],
      },
      [],
    );
    for (const s of generateFor(quilt).slots)
      if (s.kind === 'block')
        quilt.layers[0].slots[s.id] = {
          block: 'rrquilts.ohio-star',
          coloring: 'k',
          rotation: 0,
          flip: false,
        };
    quilt.colorings = { k: { fills: {} } };
    const doc = produce(createProject('P', 'in'), (d) => {
      d.project.quilts.push(quilt);
      syncDraft(d, lib);
    });
    expect(blockEdgeItems(doc, doc.project.quilts[0]!).map((i) => i.label)).toEqual([
      'Ohio Star (8″)',
      'Ohio Star (10″)',
    ]);
  });

  it('the rosette shows its shapes, and plain spaces are no block', () => {
    const doc = placed(cases[4]![1], rosetteBlockId(tumbling.id), 'hexagon');
    const items = blockEdgeItems(doc, doc.project.quilts[0]!);
    expect(items.map((i) => i.label)).toEqual(['Tumbling Block']);
    expect(items[0]!.patches).toHaveLength(3);
    // A diamond's 4 sides, each the 3 in side of the hexagon space.
    for (const p of items[0]!.patches) {
      expect(p.edges).toHaveLength(4);
      for (const e of p.edges) expect(e.len).toBeCloseTo(3, 9);
    }
  });
});
