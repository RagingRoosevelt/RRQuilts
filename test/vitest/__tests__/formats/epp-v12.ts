// What project format v12 added (specs 027, 050), for the format samples and the demo project: a
// project EPP shape and rosette, an EPP quilt (rosettes and loose shapes, Auto-close, a border), a 3D
// EPP quilt (a cube, its seams sewn by folding) and rosettes as blocks in a block quilt.
import { produce } from 'immer';
import { builtinItems } from '@/content/starter';
import { eppStarters } from '@/content/epp';
import { applyTool } from '@/editor/actions';
import { rosetteBlock } from '@/model/epp/as-block';
import { lookupEpp } from '@/model/epp/expand';
import { orient } from '@/model/epp/geometry';
import { addPiece, newEppQuilt, setEdge } from '@/model/epp/quilt-ops';
import { generateFor } from '@/model/layout/slots';
import { syncDraft, type LibraryLookup } from '@/model/library-items';
import { createQuilt } from '@/model/new-quilt';
import type { Pt } from '@/model/geometry/path';
import type { EppShape, Rosette } from '@/model/schema/epp';
import type { RrqDoc } from '@/model/schema/project';
import type { Layout } from '@/model/schema/quilt';
import { cube, designQuilt } from '../model/epp/designs3d';

const AUTHOR = 'Sample Author';
const LICENSE = 'CC-BY-SA-4.0';
const color = (name: string) => `rrquilts.${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const fill = (name: string) => ({ color: color(name) });

const { shapes, rosettes } = eppStarters();
const items = builtinItems();

/** The built-in library as the app looks items up (blocks, colors, EPP shapes and rosettes). */
export const v12Library: LibraryLookup = {
  block: (id) => items.blocks.find((b) => b.id === id),
  color: (id) => items.colors.find((c) => c.id === id),
  eppShape: (id) => shapes.find((s) => s.id === id),
  rosette: (id) => rosettes.find((r) => r.id === id),
};

/** A project shape: a 2 × 1 domino. */
export const domino: EppShape = {
  id: 'sample-author.domino',
  notecard: { name: 'Domino' },
  author: AUTHOR,
  license: LICENSE,
  outline: orient([
    [-1, -0.5],
    [1, -0.5],
    [1, 0.5],
    [-1, 0.5],
  ] as Pt[]),
};

/** A project rosette: the built-in Hexagon Flower's pieces, in two colorings of its own. */
export function sampleFlower(): Rosette {
  const base = rosettes.find((r) => r.notecard.name === 'Hexagon Flower')!;
  const ids = base.pieces.map((p) => p.id);
  const coloring = (k: number, middle: string, petals: string) => ({
    id: `c${k}`,
    name: `${petals} petals`,
    fills: Object.fromEntries(ids.map((id, i) => [id, fill(i ? petals : middle)])),
  });
  return {
    id: 'sample-author.flower',
    notecard: { name: 'Sample Flower' },
    author: AUTHOR,
    license: LICENSE,
    pieces: base.pieces,
    colorings: [coloring(1, 'Gold', 'Rose'), coloring(2, 'Yellow', 'Teal')],
  };
}

/** `doc` with the v12 additions: project shape and rosette, and three quilts. */
export function addEppV12(doc: RrqDoc): RrqDoc {
  const flower = sampleFlower();
  const lookup = lookupEpp({ eppShapes: [...shapes, domino], rosettes: [...rosettes, flower] });

  // EPP quilt: three flowers (one in its second coloring), dominoes sewn under two of them, a
  // hexagon repainted, Auto-close in cream, a border. (Auto-close covers a piece touching nothing:
  // every piece here touches another or the edge.)
  let epp = newEppQuilt('EPP Quilt', 'in', 1);
  for (const [k, x] of [0, 6, 12].entries())
    epp = addPiece(epp, {
      rosette: flower.id,
      at: [x, 0],
      turn: 0,
      scale: 1,
      ...(k === 1 ? { coloring: 'c2' } : {}),
    }).quilt;
  const below = Math.sqrt(3) * 1.5; // a flower's lowest edge
  for (const [x, y, turn] of [
    [0, below + 0.5, 0],
    [6, below + 1, 90],
  ] as const)
    epp = addPiece(epp, {
      shape: domino.id,
      at: [x, y],
      turn,
      scale: 1,
      fills: { '': fill('Navy') },
    }).quilt;
  epp = addPiece(epp, {
    shape: 'rrquilts.epp-hexagon',
    at: [15, 4],
    turn: 0,
    scale: 2,
    fills: { '': fill('Sage') },
  }).quilt;
  epp = setEdge(epp, { kind: 'close', fill: fill('Cream') }, lookup);
  epp = { ...epp, borders: [{ style: 'long-horizontal', sides: [2, 2, 2, 2] }] };

  // 3D EPP: a cube, turned in the printout.
  const known = [...shapes, domino];
  const box = designQuilt(cube(), '3D EPP Cube', known, lookup, (c) => ({ color: color(c) }));
  const threeD = { ...box, epp: { ...box.epp!, printView: { theta: 0.8, phi: 1.0 } } };

  // Rosettes as blocks: a Tumbling Block in every other hexagon space, the rest painted.
  const layout: Layout = {
    style: 'shaped-blocks',
    shape: 'hexagons',
    cols: 4,
    rows: 3,
    width: 3,
    edge: 'trim',
  };
  const held = createQuilt('Rosette Blocks', layout, [
    { style: 'long-horizontal', sides: [2, 2, 2, 2] },
  ]);
  const tumbling = rosettes.find((r) => r.notecard.name === 'Tumbling Block')!;
  // As the app's block tray offers it: a rosette that fits a space is a block (`<id>-epp`).
  const tumblingBlock = rosetteBlock(tumbling, lookup)!;
  const library: LibraryLookup = {
    ...v12Library,
    block: (id) => (id === tumblingBlock.id ? tumblingBlock : v12Library.block(id)),
  };
  let out = produce(doc, (d) => {
    d.project.eppShapes = [...(d.project.eppShapes ?? []), domino];
    d.project.rosettes = [...(d.project.rosettes ?? []), flower];
    d.project.quilts.push(epp, threeD, held);
    syncDraft(d, library);
  });
  // Set and Paint, space by space: Tumbling Blocks in every other hexagon, cream in the rest, navy
  // borders (both quilts').
  for (const q of [epp, held]) {
    const spaces = generateFor(out.project.quilts.find((x) => x.id === q.id)!).slots;
    let hex = 0;
    for (const s of spaces) {
      const set = s.shape === 'hexagon' && hex++ % 2 === 0;
      const r = applyTool(
        out,
        q.id,
        spaces,
        { slotId: s.id },
        set
          ? { tool: 'set', scope: 'this', block: tumblingBlock.id, color: null, library }
          : {
              tool: 'paint',
              scope: 'this',
              block: null,
              color: color(s.kind === 'border' ? 'Navy' : 'Cream'),
              library,
            },
      );
      if (!r.doc) throw new Error(`${q.notecard.name} ${s.id}: ${r.message}`);
      out = produce(r.doc, (d) => void syncDraft(d, library));
    }
  }
  return out;
}
