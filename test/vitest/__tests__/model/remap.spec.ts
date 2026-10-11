import { describe, expect, it } from 'vitest';
import { applySeamEdit } from '@/model/blocks/edit';
import { pathPolygon } from '@/model/geometry/path';
import { pointInPolygon } from '@/model/geometry/path';
import type { Drawing, SeamBlock } from '@/model/schema/block';
import type { RrqDoc } from '@/model/schema/project';
import { fixture } from './helpers';

const t = 1 / 3;
let n = 0;
const line = (a: [number, number], b: [number, number]) => {
  const i = n++;
  return {
    nodes: [
      { id: `a${i}`, x: a[0], y: a[1] },
      { id: `b${i}`, x: b[0], y: b[1] },
    ],
    segment: { id: `s${i}`, kind: 'line' as const, from: `a${i}`, to: `b${i}` },
  };
};
function drawing(lines: ReturnType<typeof line>[]): Drawing {
  return { nodes: lines.flatMap((l) => l.nodes), segments: lines.map((l) => l.segment) };
}
const grid = () => [
  line([t, 0], [t, 1]),
  line([2 * t, 0], [2 * t, 1]),
  line([0, t], [1, t]),
  line([0, 2 * t], [1, 2 * t]),
];

/** A project with one uncolored seam block placed in one quilt slot. */
function setup() {
  const doc = fixture() as RrqDoc;
  doc.project.palette.colors = Array.from({ length: 9 }, (_, i) => ({
    id: `c${i}`,
    notecard: { name: `c${i}` },
    rgb: [i, i, i] as [number, number, number],
  }));
  const block: SeamBlock = {
    id: 'np',
    kind: 'seam',
    size: [9, 9],
    notecard: { name: 'Nine patch' },
    drawing: { nodes: [], segments: [] },
    patches: [],
    colorings: [{ id: 'k', fills: {} }],
  };
  doc.project.blocks = [block];
  const q = doc.project.quilts[0]!;
  q.colorings = { qk: { fills: {} } };
  q.layers = [
    {
      visible: true,
      slots: { 'b:r1c1': { block: 'np', coloring: 'qk', rotation: 0, flip: false } },
      items: [],
    },
    { visible: true, items: [] },
    { visible: true, items: [] },
  ];
  return applySeamEdit(doc, 'np', drawing(grid())).doc;
}

const seam = (doc: RrqDoc) => doc.project.blocks[0] as SeamBlock;
const patchAt = (doc: RrqDoc, p: [number, number]) =>
  seam(doc)
    .patches.filter((x) => pointInPolygon(p, pathPolygon(x.path, [9, 9])))
    .map((x) => x.id);

describe('stable ids and fills after seam edits', () => {
  it('splitting the center of a colored nine-patch keeps the other 8 patches', () => {
    let doc = setup();
    const before = seam(doc);
    expect(before.patches).toHaveLength(9);
    // Color each patch differently in the block coloring and the quilt coloring.
    before.patches.forEach((p, i) => {
      before.colorings[0]!.fills[p.id] = { color: `c${i}` };
      doc.project.quilts[0]!.colorings.qk!.fills[p.id] = { color: `c${8 - i}` };
    });
    const center = patchAt(doc, [0.5, 0.5])[0]!;
    before.foundation = { sections: [{ id: 'sec', patches: [center] }] };
    const fillsBefore = structuredClone(before.colorings[0]!.fills);
    const quiltBefore = structuredClone(doc.project.quilts[0]!.colorings.qk!.fills);

    doc = applySeamEdit(doc, 'np', drawing([...grid(), line([t, t], [2 * t, 2 * t])])).doc;
    const after = seam(doc);
    expect(after.patches).toHaveLength(10);

    const outer = before.patches.map((p) => p.id).filter((id) => id !== center);
    for (const id of outer) {
      expect(after.patches.map((p) => p.id)).toContain(id);
      expect(after.colorings[0]!.fills[id]).toEqual(fillsBefore[id]);
      expect(doc.project.quilts[0]!.colorings.qk!.fills[id]).toEqual(quiltBefore[id]);
    }
    // Both halves of the old center inherit its fill; one of them keeps its id.
    const halves = [...patchAt(doc, [0.6, 0.4]), ...patchAt(doc, [0.4, 0.6])];
    expect(halves).toHaveLength(2);
    expect(halves).toContain(center);
    for (const id of halves) {
      expect(after.colorings[0]!.fills[id]).toEqual(fillsBefore[center]);
      expect(doc.project.quilts[0]!.colorings.qk!.fills[id]).toEqual(quiltBefore[center]);
    }
    // Foundation section touching the changed patch is flagged.
    expect(after.foundation!.sections[0]!.needsReview).toBe(true);
  });

  it('an edit that changes nothing keeps every id and fill', () => {
    const doc = setup();
    const ids = seam(doc)
      .patches.map((p) => p.id)
      .sort();
    const again = applySeamEdit(doc, 'np', drawing(grid())).doc;
    expect(
      seam(again)
        .patches.map((p) => p.id)
        .sort(),
    ).toEqual(ids);
  });

  it('reports unconnected segments and leaves the drawing as drawn', () => {
    const doc = setup();
    const d = drawing([...grid(), line([0.4, 0.45], [0.45, 0.4])]);
    const r = applySeamEdit(doc, 'np', d);
    expect(r.unconnected).toEqual([d.segments.at(-1)!.id]);
    expect(seam(r.doc).drawing).toEqual(d);
    expect(seam(r.doc).patches).toHaveLength(9);
  });
});
