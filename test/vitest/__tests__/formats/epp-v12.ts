// What project format v12 added (specs 027, 050), for the format samples and the demo project: a
// project EPP shape and rosette, an EPP quilt (rosettes and loose shapes, Auto-close, a border), a 3D
// EPP quilt (a cube, its seams sewn by folding) and rosettes as blocks in a block quilt.
import { produce } from 'immer';
import { builtinItems } from '@/content/starter';
import { eppStarters } from '@/content/epp';
import { applyTool } from '@/editor/actions';
import { rosetteBlockId } from '@/model/epp/as-block';
import { lookupEpp } from '@/model/epp/expand';
import { orient } from '@/model/epp/geometry';
import { addPiece, newEppQuilt, setEdge } from '@/model/epp/quilt-ops';
import { generateSlots } from '@/model/layout/slots';
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

  // EPP quilt: three flowers (one in its second coloring), loose dominoes and a hexagon repainted,
  // Auto-close in cream, a border.
  let epp = newEppQuilt('EPP Quilt', 'in', 1);
  for (const [k, x] of [0, 6, 12].entries())
    epp = addPiece(epp, {
      rosette: flower.id,
      at: [x, 0],
      turn: 0,
      scale: 1,
      ...(k === 1 ? { coloring: 'c2' } : {}),
    }).quilt;
  for (const [x, y, turn] of [
    [3, 4, 0],
    [9, 4, 90],
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
  const spaces = generateSlots(layout, held.borders).slots;
  let out = produce(doc, (d) => {
    d.project.eppShapes = [...(d.project.eppShapes ?? []), domino];
    d.project.rosettes = [...(d.project.rosettes ?? []), flower];
    const q = { ...held, colorings: { ...held.colorings, r: { fills: {} } } };
    spaces
      .filter((s) => s.shape === 'hexagon')
      .forEach((s, i) => {
        if (i % 2 === 0)
          q.layers[0].slots[s.id] = {
            block: rosetteBlockId(tumbling.id),
            coloring: 'r',
            rotation: 0,
            flip: false,
          };
      });
    d.project.quilts.push(epp, threeD, q);
    syncDraft(d, v12Library);
  });
  const id = out.project.quilts.at(-1)!.id;
  for (const s of spaces) {
    if (out.project.quilts.at(-1)!.layers[0].slots[s.id]) continue;
    const r = applyTool(
      out,
      id,
      spaces,
      { slotId: s.id },
      {
        tool: 'paint',
        scope: 'this',
        block: null,
        color: color(s.kind === 'border' ? 'Navy' : 'Cream'),
        library: v12Library,
      },
    );
    if (r.doc) out = produce(r.doc, (d) => void syncDraft(d, v12Library));
  }
  return out;
}
