import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { expandAll, lookupEpp, rosetteLeaves } from '@/model/epp/expand';
import { place, type Poly } from '@/model/epp/geometry';
import {
  addPiece,
  breakAll,
  copyPieces,
  makeRosette,
  newEppQuilt,
  paint,
  pastePieces,
} from '@/model/epp/quilt-ops';
import * as rops from '@/model/epp/rosette-ops';
import {
  boxPick,
  middle,
  moveGroup,
  movePose,
  scaleStep,
  snapGroup,
  toBack,
  toFront,
  type Placed,
} from '@/model/epp/selection';
import { snapPose, type Snap } from '@/model/epp/snap';
import type { Quilt } from '@/model/schema/quilt';

const { shapes, rosettes } = eppStarters();
const lookup = lookupEpp({ eppShapes: shapes, rosettes });
const sqId = 'rrquilts.epp-square';
const jewelId = 'rrquilts.epp-jewel';
const flowerId = rosettes.find((r) => r.notecard.name === 'Hexagon Flower')!.id;
const jewel = shapes.find((s) => s.id === jewelId)!.outline;

/** Corners as a sorted list of rounded strings: the same shape in the same place, any order. */
const key = (polys: readonly Poly[]) =>
  polys
    .map((p) =>
      p
        .map(([x, y]) => `${(x + 0).toFixed(6)},${(y + 0).toFixed(6)}`)
        .sort()
        .join(' '),
    )
    .sort();
const placed = (ps: readonly Placed[]) => ps.map((p) => place(jewel, p));

const two: Placed[] = [
  { id: 'a', at: [0.3, 0.2], turn: 25, scale: 1 },
  { id: 'b', at: [2.1, -0.7], turn: 140, scale: 2, mirror: true },
  { id: 'c', at: [9, 9], turn: 0, scale: 1 },
];
const ab = new Set(['a', 'b']);

describe('EPP selection moves as one', () => {
  it('turns about its middle: each piece lands where the turned drawing has it', () => {
    const pivot: [number, number] = [1, 0.5];
    const out = moveGroup(two, ab, { pivot, turn: 60 });
    const r = Math.PI / 3;
    const turned = placed(two.slice(0, 2)).map((p) =>
      p.map(([x, y]): [number, number] => {
        const [dx, dy] = [x - pivot[0], y - pivot[1]];
        return [
          pivot[0] + dx * Math.cos(r) - dy * Math.sin(r),
          pivot[1] + dx * Math.sin(r) + dy * Math.cos(r),
        ];
      }),
    );
    expect(key(placed(out.slice(0, 2)))).toEqual(key(turned));
    expect(out[2]).toBe(two[2]);
  });

  it('mirrors left to right and up and down (an uneven shape, turned and mirrored already)', () => {
    const pivot: [number, number] = [1, 0];
    for (const flip of ['x', 'y'] as const) {
      const out = moveGroup(two, ab, { pivot, flip });
      const flipped = placed(two.slice(0, 2)).map((p) =>
        p.map(([x, y]): [number, number] =>
          flip === 'x' ? [2 * pivot[0] - x, y] : [x, 2 * pivot[1] - y],
        ),
      );
      expect(key(placed(out.slice(0, 2)))).toEqual(key(flipped));
      expect(!!out[0]!.mirror).toBe(true);
      expect(!!out[1]!.mirror).toBe(false);
    }
  });

  it('scales in whole sizes about the middle, keeping joins; refuses sizes past 1 to 4', () => {
    const k = scaleStep(two, ab, 1)!;
    expect(k).toBe(2);
    const out = moveGroup(two, ab, { pivot: [0, 0], scale: k });
    expect(out.map((p) => p.scale)).toEqual([2, 4, 1]);
    expect(out[1]!.at).toEqual([4.2, -1.4]);
    expect(scaleStep(out, ab, 1)).toBeNull(); // 2 → 3 makes 4 → 6
    expect(scaleStep(out, ab, -1)).toBe(0.5);
    expect(scaleStep(two, ab, -1)).toBeNull(); // 1 → 0
  });

  it('a snap moves every selected piece as snapPose moves one', () => {
    const s: Snap = {
      rot: 0.3,
      move: [1, -2],
      score: 0,
      target: [
        [0, 0],
        [1, 0],
      ],
    };
    const out = snapGroup(two, ab, s);
    for (const i of [0, 1]) {
      const want = snapPose(two[i]!, s);
      expect(out[i]!.at[0]).toBeCloseTo(want.at[0]);
      expect(out[i]!.at[1]).toBeCloseTo(want.at[1]);
      expect(out[i]!.turn).toBeCloseTo((want.turn + 360) % 360);
    }
  });

  it('a move with nothing to do leaves the pose as it was (no mirror flag added)', () => {
    expect(movePose(two[0]!, {})).toEqual(two[0]);
  });
});

describe('EPP selection picking and order', () => {
  const sq = shapes.find((s) => s.id === sqId)!.outline;
  const polys = [
    place(sq, { at: [0.5, 0.5], turn: 0, scale: 1 }),
    place(sq, { at: [1.5, 0.5], turn: 0, scale: 1 }),
    place(sq, { at: [5.5, 0.5], turn: 0, scale: 1 }),
  ];
  it('a box picks pieces wholly inside, or with Alt every piece it touches', () => {
    expect(boxPick(polys, [-0.1, -0.1, 1.2, 1.2])).toEqual([0]);
    expect(boxPick(polys, [-0.1, -0.1, 1.2, 1.2], true)).toEqual([0, 1]);
    const [mx, my] = middle(polys.slice(0, 2));
    expect([mx, my].map((v) => +v.toFixed(9))).toEqual([1, 0.5]);
  });
  it('bring to front and send to back keep the selection’s own order', () => {
    const xs = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
    const ids = new Set(['1', '3']);
    expect(toFront(xs, ids).map((x) => x.id)).toEqual(['2', '4', '1', '3']);
    expect(toBack(xs, new Set(['4', '2'])).map((x) => x.id)).toEqual(['2', '4', '1', '3']);
  });
});

/** Two squares side by side and a placed Hexagon Flower to their right. */
function sample(): { q: Quilt; ids: string[] } {
  let q = newEppQuilt('S', 'in');
  const ids: string[] = [];
  for (const p of [
    {
      shape: sqId,
      at: [0.5, 0.5] as [number, number],
      turn: 0,
      scale: 1,
      fills: { '': { color: 'x' } },
    },
    { shape: sqId, at: [1.5, 0.5] as [number, number], turn: 0, scale: 1 },
    { rosette: flowerId, at: [6, 0] as [number, number], turn: 0, scale: 1 },
  ]) {
    const r = addPiece(q, p);
    q = r.quilt;
    ids.push(r.id);
  }
  return { q, ids };
}
const polysOf = (q: Quilt, look = lookup) => expandAll(q.epp!.pieces, look).map((l) => l.poly);

describe('EPP selection in a quilt', () => {
  it('Make rosette: the pieces become a rosette, placed where they were (rosettes copied in)', () => {
    const { q, ids } = sample();
    const before = key(polysOf(q));
    const blank = rops.newRosette('Mine');
    const out = makeRosette(q, lookup, new Set(ids), blank);
    expect(out.quilt.epp!.pieces).toHaveLength(1);
    expect(out.quilt.epp!.pieces[0]).toMatchObject({ rosette: blank.id, turn: 0, scale: 1 });
    expect(out.rosette.pieces).toHaveLength(2 + 7);
    expect(out.rosette.pieces.every((p) => p.shape)).toBe(true);
    const look = lookupEpp({ eppShapes: shapes, rosettes: [...rosettes, out.rosette] });
    expect(key(polysOf(out.quilt, look))).toEqual(before);
    // The fills shown become the first coloring.
    const leaves = rosetteLeaves(out.rosette, look);
    expect(leaves.filter((l) => l.fill && 'color' in l.fill && l.fill.color === 'x')).toHaveLength(
      1,
    );
  });

  it('Break into patches on a selection keeps the shapes and returns all the loose pieces', () => {
    const { q, ids } = sample();
    const out = breakAll(q, lookup, new Set(ids));
    expect(out.ids).toHaveLength(2 + 7);
    expect(out.quilt.epp!.pieces.every((p) => p.shape)).toBe(true);
  });

  it('copy and paste: fresh ids, the middle under the pointer, rosettes still linked', () => {
    const { q, ids } = sample();
    const clip = copyPieces(q, new Set(ids), [3, 0]);
    const out = pastePieces(q, clip, [3, 10]);
    expect(out.ids).toHaveLength(3);
    const added = out.quilt.epp!.pieces.slice(3);
    expect(added.map((p) => p.at)).toEqual([
      [0.5, 10.5],
      [1.5, 10.5],
      [6, 10],
    ]);
    expect(added[2]!.rosette).toBe(flowerId);
    expect(new Set(added.map((p) => p.id)).size).toBe(3);
    expect(ids.some((i) => out.ids.includes(i))).toBe(false);
  });

  it('paint scope Selection paints every piece of the selected ones', () => {
    const { q, ids } = sample();
    const sel = new Set([ids[1]!, ids[2]!]);
    const out = paint(q, lookup, ids[1]!, undefined, { color: 'y' }, 'selection', sel);
    const [a, b, c] = out.epp!.pieces;
    expect(a!.fills).toEqual({ '': { color: 'x' } });
    expect(b!.fills).toEqual({ '': { color: 'y' } });
    expect(Object.keys(c!.fills ?? {})).toHaveLength(7);
  });
});

describe('EPP selection in a rosette', () => {
  it('copies across rosettes in the shown coloring, and back into its own with every coloring', () => {
    let r = rops.newRosette('R');
    r = rops.addPiece(r, sqId, { at: [0.5, 0.5], turn: 0, scale: 1 }, { color: 'red' });
    const { rosette: r2, id: k2 } = rops.addColoring(r);
    r = rops.paintPiece(r2, k2, r2.pieces[0]!.id, { color: 'blue' });
    const clip = rops.copyPieces(r, new Set([r.pieces[0]!.id]), [0.5, 0.5], k2);
    expect(clip.pieces[0]!.fills).toEqual({ '': { color: 'blue' } });

    const other = rops.pastePieces(rops.newRosette('O'), clip, lookup, [5, 5]);
    expect(other.rosette.pieces[0]!.at).toEqual([5, 5]);
    expect(other.rosette.colorings[0]!.fills[other.ids[0]!]).toEqual({ color: 'blue' });

    const back = rops.pastePieces(r, clip, lookup, [1.5, 0.5]);
    const id = back.ids[0]!;
    expect(back.rosette.colorings.map((k) => k.fills[id])).toEqual([
      { color: 'red' },
      { color: 'blue' },
    ]);
  });

  it('a copied placed rosette pastes into a rosette as its pieces', () => {
    const { q, ids } = sample();
    const clip = copyPieces(q, new Set([ids[2]!]), [6, 0]);
    const out = rops.pastePieces(rops.newRosette('O'), clip, lookup, [0, 0]);
    expect(out.ids).toHaveLength(7);
  });
});
