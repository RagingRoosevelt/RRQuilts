import { describe, expect, it } from 'vitest';
import { applyTool } from '@/editor/actions';
import { applySeamEdit } from '@/model/blocks/edit';
import { slotColoring } from '@/model/data-quilt';
import { generateFor } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { Quilt } from '@/model/schema/quilt';
import {
  addColorway,
  removeColorway,
  renameColorway,
  setSwap,
  shownColorway,
  startRecolor,
  swapColoring,
  swapper,
  colorwayList,
} from '@/model/colorways';
import { fixture } from './helpers';

const quilt = (): Quilt => structuredClone<Quilt>(fixture().project.quilts[0]!);

describe('Quilt colorways', () => {
  it('a new colorway is shown and starts with the quilt’s own colors', () => {
    const q = addColorway(quilt(), 'v1');
    expect(q.shownColorway).toBe('v1');
    expect(shownColorway(q)?.name).toBe('Colorway 2');
    expect(swapper(shownColorway(q))({ color: 'red' })).toEqual({ color: 'red' });
  });

  it('swaps a color everywhere; swapping it back removes the swap', () => {
    let q = addColorway(quilt(), 'v1');
    q = setSwap(q, 'v1', 'color:red', { color: 'blue' });
    const swap = swapper(shownColorway(q));
    expect(swap({ color: 'red' })).toEqual({ color: 'blue' });
    expect(swap({ color: 'green' })).toEqual({ color: 'green' });
    expect(
      swapColoring({ fills: { a: { color: 'red' }, b: { color: 'green' } } }, shownColorway(q)),
    ).toEqual({ fills: { a: { color: 'blue' }, b: { color: 'green' } } });
    q = setSwap(q, 'v1', 'color:red', { color: 'red' });
    expect(shownColorway(q)!.swaps).toEqual([]);
  });

  it('the original colors show again when the shown colorway is deleted', () => {
    const q = removeColorway(addColorway(quilt(), 'v1'), 'v1', []);
    expect(q.shownColorway).toBeUndefined();
    expect(q.colorways).toEqual([]);
  });

  it('the quilt’s own colors can go: the next colorway becomes them, the others swap from those', () => {
    const base = quilt();
    const slot = Object.values(base.layers[0].slots).find((s) => base.colorings[s.coloring])!;
    base.colorings[slot.coloring] = { fills: { a: { color: 'red' }, b: { color: 'green' } } };
    let q = renameColorway(base, undefined, 'Warm');
    expect(colorwayList(q).map((v) => v.name)).toEqual(['Warm']);
    q = setSwap(addColorway(q, 'v1', 'Cool'), 'v1', 'color:red', { color: 'blue' });
    q = setSwap(addColorway(q, 'v2', 'Dark'), 'v2', 'color:green', { color: 'black' });
    q = removeColorway(q, undefined, []);
    expect(colorwayList(q).map((v) => v.name)).toEqual(['Cool', 'Dark']);
    expect(q.colorings[slot.coloring]!.fills).toEqual({
      a: { color: 'blue' },
      b: { color: 'green' },
    });
    // Dark was red→red, green→black: now blue→red, green→black.
    const dark = swapper(shownColorway(q, 'v2'));
    expect(dark({ color: 'blue' })).toEqual({ color: 'red' });
    expect(dark({ color: 'green' })).toEqual({ color: 'black' });
    expect(q.shownColorway).toBe('v2');
  });
});

type Seam = Extract<Block, { kind: 'seam' }>;

describe('Re-color colorways', () => {
  /** A project whose first quilt has two spaces holding the same block in one coloring (patch p red). */
  function setup() {
    const doc = fixture();
    const q = doc.project.quilts.find((x) => !x.data && x.layout.style !== 'epp')!;
    const block = doc.project.blocks.find(
      (b): b is Seam => b.kind === 'seam' && b.patches.length > 1,
    )!;
    const other: Block = { ...structuredClone(block), id: 'other' };
    const spaces = generateFor(q).slots.filter((s) => s.kind === 'block');
    const [a, b] = spaces.map((s) => s.id);
    const p = block.patches[0]!.id;
    q.colorings = { c: { fills: { [p]: { color: 'red' } } } };
    q.layers[0].slots = {
      [a!]: { block: block.id, coloring: 'c', rotation: 0, flip: false },
      [b!]: { block: block.id, coloring: 'c', rotation: 0, flip: false },
    };
    delete q.colorways;
    delete q.shownColorway;
    return { doc, q, block, other, a: a!, b: b!, p };
  }
  const fillAt = (q: Quilt, slot: string, block: Block, p: string) =>
    slotColoring(q, slot, block)?.fills[p];

  it('starts from the colors the colorway shows; the primary keeps its own', () => {
    const { q, block, a, p } = setup();
    let r = setSwap(addColorway(q, 'v1'), 'v1', 'color:red', { color: 'blue' });
    r = startRecolor(r, 'v1', [block]);
    expect(fillAt(r, a, block, p)).toEqual({ color: 'blue' });
    const primary = { ...r };
    delete primary.shownColorway;
    expect(fillAt(primary, a, block, p)).toEqual({ color: 'red' });
    // The swaps stay, for going back, but don't apply on top.
    expect(swapper(shownColorway(r))({ color: 'red' })).toEqual({ color: 'red' });
  });

  it('Paint sets one patch in one space of the re-color only', () => {
    const { doc, q, block, a, b, p } = setup();
    const r = startRecolor(addColorway(q, 'v1'), 'v1', [block]);
    doc.project.quilts = doc.project.quilts.map((x) => (x.id === q.id ? r : x));
    const spaces = generateFor(r).slots;
    const out = applyTool(
      doc,
      q.id,
      spaces,
      { slotId: a, patchId: p },
      { tool: 'paint', scope: 'this', block: null, color: 'green' },
    );
    const painted = out.doc!.project.quilts.find((x) => x.id === q.id)!;
    expect(fillAt(painted, a, block, p)).toEqual({ color: 'green' });
    expect(fillAt(painted, b, block, p)).toEqual({ color: 'red' });
    expect(painted.colorings).toEqual(q.colorings);
    // The eyedropper reads the re-color's paint.
    const picked = applyTool(
      out.doc!,
      q.id,
      spaces,
      { slotId: a, patchId: p },
      { tool: 'eyedropper', scope: 'this', block: null, color: null },
    );
    expect(picked.selectColor).toBe('green');
  });

  it('a space whose block changes in the primary shows the primary’s colors', () => {
    const { q, block, other, a, b, p } = setup();
    const r = startRecolor(
      setSwap(addColorway(q, 'v1'), 'v1', 'color:red', { color: 'blue' }),
      'v1',
      [block],
    );
    const changed = structuredClone(r);
    changed.colorings.d = { fills: { x: { color: 'gold' } } };
    changed.layers[0].slots[b] = { block: other.id, coloring: 'd', rotation: 0, flip: false };
    expect(fillAt(changed, a, block, p)).toEqual({ color: 'blue' });
    expect(slotColoring(changed, b, other)?.fills).toEqual({ x: { color: 'gold' } });
  });

  it('deleting the primary makes a re-color the quilt’s colors', () => {
    const { q, block, a, p } = setup();
    let r = startRecolor(
      setSwap(addColorway(q, 'v1', 'Cool'), 'v1', 'color:red', { color: 'blue' }),
      'v1',
      [block],
    );
    r = removeColorway(r, undefined, [block]);
    expect(r.colorways).toEqual([]);
    expect(r.primaryName).toBe('Cool');
    expect(r.shownColorway).toBeUndefined();
    expect(fillAt(r, a, block, p)).toEqual({ color: 'blue' });
  });

  it('keeps up when the block’s patches are redrawn, and Save as new colorway copies it', () => {
    const { doc, q, block, a, p } = setup();
    const r = startRecolor(addColorway(q, 'v1'), 'v1', [block]);
    doc.project.quilts = doc.project.quilts.map((x) => (x.id === q.id ? r : x));
    const edited = applySeamEdit(doc, block.id, block.drawing).doc;
    const after = edited.project.quilts.find((x) => x.id === q.id)!;
    const nb = edited.project.blocks.find((x): x is Seam => x.id === block.id)!;
    const same = nb.patches.find((x) => x.id === p) ?? nb.patches[0]!;
    expect(fillAt(after, a, nb, same.id)).toEqual({ color: 'red' });
    const copy = addColorway(after, 'v2', undefined, shownColorway(after));
    expect(shownColorway(copy)?.recolor).toEqual(shownColorway(after)?.recolor);
  });

  // A Palette or Auto mapping colorway follows another (owner, 2026-11-25): its picks stay keyed by
  // the primary's colors, unless a re-color is reached, whose painting it then maps.
  describe('following a colorway', () => {
    /** As shown in colorway `id` (none: the primary). */
    const shownAt = (q: Quilt, id: string | undefined, slot: string, block: Block, p: string) => {
      const x: Quilt = { ...q };
      if (id) x.shownColorway = id;
      else delete x.shownColorway;
      return swapper(shownColorway(x))(fillAt(x, slot, block, p));
    };
    const follow = (q: Quilt, id: string, source: string): Quilt => ({
      ...q,
      colorways: q.colorways!.map((v) => (v.id === id ? { ...v, source } : v)),
    });
    /** v1: a re-color painting space `a` green; v2: Palette, red → blue, on the primary. */
    function painted() {
      const s = setup();
      const r = structuredClone(startRecolor(addColorway(s.q, 'v1'), 'v1', [s.block]));
      const rc = r.colorways![0]!.recolor!;
      rc.colorings.g = { fills: { [s.p]: { color: 'green' } } };
      rc.slots[s.a] = { block: s.block.id, coloring: 'g' };
      return { ...s, r: setSwap(addColorway(r, 'v2'), 'v2', 'color:red', { color: 'blue' }) };
    }
    const blue = { color: 'blue' };
    const green = { color: 'green' };

    it('following another colorway changes no pick; following a re-color maps its painting', () => {
      const { r, block, a, b, p } = painted();
      const at = (q: Quilt, id: string, s: string) => shownAt(q, id, s, block, p);
      const v3 = follow(setSwap(addColorway(r, 'v3'), 'v3', 'color:red', blue), 'v3', 'v2');
      expect([at(v3, 'v3', a), at(v3, 'v3', b)]).toEqual([blue, blue]);
      const onV1 = follow(r, 'v2', 'v1');
      expect(shownColorway(onV1)!.swaps).toEqual(shownColorway(r)!.swaps);
      expect([at(onV1, 'v2', a), at(onV1, 'v2', b)]).toEqual([green, blue]);
    });

    it('deleting a re-color leaves those painted as it looking the same', () => {
      const { r, block, a, b, p } = painted();
      const on = follow(r, 'v2', 'v1');
      const gone = removeColorway(on, 'v1', [block]);
      expect(gone.colorways!.map((v) => v.id)).toEqual(['v2']);
      expect(shownColorway(gone)!.source).toBeUndefined();
      expect(shownColorway(gone)!.recolor).toBeDefined();
      expect([a, b].map((s) => shownAt(gone, 'v2', s, block, p))).toEqual([green, blue]);
    });

    it('deleting the primary keeps every colorway’s look', () => {
      const { r, block, a, b, p } = painted();
      // v2 (first) follows the re-color v1; v3 maps the primary, red → gold.
      let q = follow(r, 'v2', 'v1');
      q = setSwap(addColorway(q, 'v3'), 'v3', 'color:red', { color: 'gold' });
      q = { ...q, colorways: [q.colorways![1]!, q.colorways![0]!, q.colorways![2]!] };
      const looks = (x: Quilt, ids: (string | undefined)[]) =>
        ids.map((id) => [a, b].map((s) => shownAt(x, id, s, block, p)));
      const before = looks(q, ['v2', 'v1', 'v3']);
      const after = removeColorway(q, undefined, [block]);
      expect(after.colorways!.map((v) => v.id)).toEqual(['v1', 'v3']);
      expect(looks(after, [undefined, 'v1', 'v3'])).toEqual(before);
    });
  });
});
