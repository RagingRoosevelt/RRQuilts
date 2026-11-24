import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { parseProject, serializeProject } from '@/model/io';
import { copyToMine, emptyPersonal, lookupOf, withSources } from '@/model/library';
import { parseLibraryValue } from '@/model/library-file';
import { eppUsed, syncLibraryItems, type LibraryLookup } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { EppShape, Rosette } from '@/model/schema/epp';
import type { LibraryDoc } from '@/model/schema/library';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';

const hex: EppShape = {
  id: 'hex',
  notecard: { name: 'Hexagon' },
  outline: [
    [1, 0],
    [0.5, 0.866],
    [-0.5, 0.866],
    [-1, 0],
    [-0.5, -0.866],
    [0.5, -0.866],
  ],
};
const flower: Rosette = {
  id: 'flower',
  notecard: { name: 'Flower' },
  pieces: [{ id: 'a', shape: 'hex', at: [0, 0], turn: 0, scale: 1 }],
  colorings: [{ id: 'c', fills: {} }],
};

function eppDoc(): RrqDoc {
  const doc = createProject('EPP');
  const q = createQuilt('Garden', { style: 'epp', unit: 1, edge: { kind: 'none' } }, []);
  return produce(doc, (d) => {
    d.project.eppShapes = [hex];
    d.project.rosettes = [flower];
    d.project.quilts.push({
      ...q,
      epp: {
        pieces: [
          { id: 'p1', shape: 'hex', at: [0, 0], turn: 0, scale: 1 },
          { id: 'p2', rosette: 'flower', at: [3, 0], turn: 0, scale: 1 },
        ],
      },
    });
  });
}

describe('rrq v12 EPP', () => {
  it('round-trips shapes, rosettes and an EPP quilt with no report', async () => {
    const r = await parseProject(serializeProject(eppDoc()));
    if (!r.ok) throw new Error(r.error);
    expect(r.report).toEqual([]);
    expect(r.doc.project.quilts[0]!.epp!.pieces).toHaveLength(2);
  });

  // Bug (2026-11-24, found writing the v12 format samples): Auto-close filled a ragged gap with a
  // closing piece of more than 24 corners, which saved but then wouldn't open ("damaged").
  it('opens a quilt whose Auto-close piece has more than 24 corners', async () => {
    const ragged = Array.from({ length: 30 }, (_, i): [number, number] => {
      const a = (i / 30) * 2 * Math.PI;
      const r = i % 2 ? 5 : 4;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
    const doc = produce(eppDoc(), (d) => {
      const q = d.project.quilts[0]!;
      q.layout = { style: 'epp', unit: 1, edge: { kind: 'close' } };
      q.epp!.closing = [{ id: 'gap', outline: ragged, marked: [29] }];
    });
    const r = await parseProject(serializeProject(doc));
    if (!r.ok) throw new Error(r.error);
    expect(r.doc.project.quilts[0]!.epp!.closing![0]!.outline).toHaveLength(30);
  });

  it('reports dangling shapes and rosettes without throwing', async () => {
    const doc = produce(eppDoc(), (d) => {
      d.project.eppShapes = [];
      d.project.rosettes = [];
    });
    const r = await parseProject(serializeProject(doc));
    if (!r.ok) throw new Error(r.error);
    expect(r.report.some((x) => x.includes('missing shape hex'))).toBe(true);
    expect(r.report.some((x) => x.includes('missing rosette flower'))).toBe(true);
  });

  it('refuses outlines over 24 corners', async () => {
    const doc = produce(eppDoc(), (d) => {
      d.project.eppShapes![0]!.outline = Array.from({ length: 25 }, (_, i) => [i, i * i]);
    });
    const r = await parseProject(serializeProject(doc));
    expect(r.ok).toBe(false);
  });

  it('refuses duplicate ids among shapes and rosettes', async () => {
    const doc = produce(eppDoc(), (d) => void (d.project.rosettes![0]!.id = 'hex'));
    const r = await parseProject(serializeProject(doc));
    expect(r.ok).toBe(false);
  });
});

function libWith(items: LibraryDoc['items']): LibraryDoc {
  return { ...emptyPersonal('me.x'), items };
}

describe('rrqlib v8 EPP items', () => {
  it('parses shapes and rosettes without making palettes of them', () => {
    const r = parseLibraryValue(
      libWith([
        { type: 'epp-shape', data: hex },
        { type: 'rosette', data: flower, shapes: [hex] },
      ]),
    );
    if (!r.ok) throw new Error(r.error);
    expect(r.skipped).toEqual([]);
    const v = withSources(r.doc);
    expect(v.collections).toEqual([]);
    expect(v.eppShapes.map((s) => s.id)).toEqual(['hex']);
    expect(v.rosettes.map((x) => x.id)).toEqual(['flower']);
    const lookup = lookupOf([{ ...v, doc: r.doc }]);
    expect(lookup.rosette?.('flower')?.notecard.name).toBe('Flower');
  });

  it('copies a rosette to My library with its shapes and the source credited', async () => {
    const lib = await copyToMine(
      emptyPersonal('me.x'),
      { type: 'rosette', data: flower, shapes: [hex] },
      'me.x',
    );
    const item = lib.items[0]!;
    expect(item.type).toBe('rosette');
    if (item.type !== 'rosette') return;
    expect(item.shapes?.map((s) => s.id)).toEqual(['hex']);
    expect(item.data.id).not.toBe('flower');
  });
});

describe('embedding EPP library items', () => {
  it('embeds a used library rosette and its shapes, and drops them when unused', () => {
    const libDoc = libWith([{ type: 'rosette', data: flower, shapes: [hex] }]);
    const lib = lookupOf([{ ...withSources(libDoc), doc: libDoc }]);
    let doc = produce(eppDoc(), (d) => {
      d.project.eppShapes = [];
      d.project.rosettes = [];
      d.project.quilts[0]!.epp!.pieces = [
        { id: 'p2', rosette: 'flower', at: [0, 0], turn: 0, scale: 1 },
      ];
    });
    doc = syncLibraryItems(doc, lib);
    expect(doc.project.rosettes?.map((r) => r.id)).toEqual(['flower']);
    expect(doc.project.eppShapes?.map((s) => s.id)).toEqual(['hex']);
    expect(eppUsed(doc.project).shapes.has('hex')).toBe(true);
    doc = syncLibraryItems(
      produce(doc, (d) => void (d.project.quilts[0]!.epp!.pieces = [])),
      lib,
    );
    expect(doc.project.rosettes).toEqual([]);
    expect(doc.project.eppShapes).toEqual([]);
  });

  // Bug (2026-11-23, found building the traditional EPP demo): a library color used only as the
  // Auto-close fill wasn't embedded, so cards drew the closing pieces white.
  it('embeds a library color used only as the Auto-close fill', () => {
    const cream: Color = { id: 'cream', notecard: { name: 'Cream' }, rgb: [244, 236, 216] };
    const lib: LibraryLookup = {
      block: () => undefined,
      color: (id: string) => (id === 'cream' ? cream : undefined),
    };
    const close = (fill?: { color: string }) =>
      produce(eppDoc(), (d) => {
        d.project.quilts[0]!.layout = {
          style: 'epp',
          unit: 1,
          edge: { kind: 'close', ...(fill ? { fill } : {}) },
        };
      });
    const ids = (doc: RrqDoc) => syncLibraryItems(doc, lib).project.palette.colors.map((c) => c.id);
    expect(ids(close({ color: 'cream' }))).toEqual(['cream']);
    expect(ids(close())).toEqual([]);
  });
});
