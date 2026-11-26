import { readFileSync } from 'node:fs';
import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { addColorway, startRecolor } from '@/model/colorways';
import { quiltProject } from '@/model/export-quilt';
import { importProjectQuilts } from '@/model/import-quilts';
import { parseProject, serializeProject } from '@/model/io';
import { createProject } from '@/model/new-project';
import type { RrqDoc } from '@/model/schema/project';
import { addEppV12 } from '../formats/epp-v12';
import { fixture } from './helpers';

const demo = async () => {
  const r = await parseProject(readFileSync('test/fixtures/formats/demo-v6.rrq', 'utf8'));
  if (!r.ok) throw new Error(r.error);
  return r.doc;
};
const reopen = async (doc: RrqDoc) => {
  const r = await parseProject(serializeProject(doc));
  if (!r.ok) throw new Error(r.error);
  return r;
};
const blocksOf = (doc: RrqDoc) =>
  new Set(doc.project.quilts.flatMap((q) => Object.values(q.layers[0].slots).map((s) => s.block)));

describe('import quilts from a project', () => {
  it('brings the picked quilts and only what they use, into a cm project', async () => {
    const from = await demo();
    const pick = from.project.quilts[1]!;
    const { doc, added } = importProjectQuilts(createProject('x', 'cm'), from, 'Sam', [pick.id]);
    expect(added).toBe(1);
    expect(doc.project.quilts.map((q) => q.notecard.name)).toEqual([pick.notecard.name]);
    expect(new Set(doc.project.blocks.map((b) => b.id))).toEqual(blocksOf(doc));
    const r = await reopen(doc);
    expect(r.report).toEqual([]);
    expect(doc.project.quilts[0]!.layout).not.toEqual(pick.layout); // lengths in cm
  });

  it('into the same project: new ids and names, nothing duplicated', async () => {
    const from = await demo();
    const { doc } = importProjectQuilts(
      from,
      from,
      'Sam',
      from.project.quilts.map((q) => q.id),
    );
    expect(doc.project.quilts).toHaveLength(2 * from.project.quilts.length);
    expect(doc.project.blocks).toHaveLength(from.project.blocks.length);
    expect(doc.project.quilts.at(-1)!.notecard.name).toMatch(/\(2\)$/);
    expect((await reopen(doc)).report).toEqual([]);
  });

  it('an own block with the same id but another design comes in as a copy', async () => {
    const from = await demo();
    const q = from.project.quilts[0]!;
    const id = Object.values(q.layers[0].slots)[0]!.block;
    const mine = produce(from, (d) => {
      d.project.quilts = [];
      const b = d.project.blocks.find((x) => x.id === id)!;
      delete b.source;
      b.size = [b.size[0] + 1, b.size[1]];
    });
    const { doc } = importProjectQuilts(mine, from, 'Sam', [q.id]);
    const used = [...blocksOf(doc)];
    expect(used).not.toContain(id);
    expect(
      doc.project.blocks.filter((b) => used.includes(b.id) && b.id.startsWith('sam.')),
    ).toHaveLength(1);
    expect((await reopen(doc)).report).toEqual([]);
  });

  it('replaces a quilt in place when the quilter chose the file’s', async () => {
    const from = await demo();
    const q = from.project.quilts[1]!;
    const renamed = produce(from, (d) => {
      d.project.quilts[1]!.notecard.name = 'From the file';
    });
    const { doc } = importProjectQuilts(from, renamed, 'Sam', [q.id], new Set([q.id]));
    expect(doc.project.quilts).toHaveLength(from.project.quilts.length);
    expect(doc.project.quilts[1]!.id).toBe(q.id);
    expect(doc.project.quilts[1]!.notecard.name).toBe('From the file');
  });

  // Owner, 2026-11-24 (export bug): an EPP quilt's own shapes and rosettes, and the colors only a
  // rosette uses, came along neither way.
  it('an EPP quilt brings its shapes, rosettes and their colors', async () => {
    const from = addEppV12(createProject('EPP', 'in'));
    const q = from.project.quilts.find((x) => x.notecard.name === 'EPP Quilt')!;
    const { doc } = importProjectQuilts(createProject('Here', 'in'), from, 'me', [q.id]);
    expect(doc.project.rosettes?.map((r) => r.notecard.name)).toEqual(['Sample Flower']);
    expect(doc.project.eppShapes?.map((s) => s.notecard.name)).toContain('Domino');
    const colors = doc.project.palette.colors.map((c) => c.notecard.name);
    for (const c of ['Gold', 'Rose', 'Teal', 'Yellow']) expect(colors).toContain(c);
    const r = await parseProject(serializeProject(doc));
    expect(r.ok && r.report).toEqual([]);
  });
});

// Owner, 2026-11-25: "make sure that export / import work for the change, too" (re-color, spec 019
// FR-007).
describe('a re-color colorway through export and import', () => {
  it('goes along with the colors only it uses, and follows a block that comes in as a copy', async () => {
    const doc = fixture();
    const q = doc.project.quilts.find((x) => !x.data && x.layout.style !== 'epp')!;
    const [sid, slot] = Object.entries(q.layers[0].slots).find(([, s]) => s.block !== 'plain')!;
    doc.project.palette.colors.push({
      ...structuredClone(doc.project.palette.colors[0]!),
      id: 'only-recolor',
      notecard: { name: 'Only in the re-color' },
    });
    const r = structuredClone(startRecolor(addColorway(q, 'v1'), 'v1', doc.project.blocks));
    const own = r.colorways![0]!.recolor!;
    own.colorings[own.slots[sid]!.coloring]!.fills.extra = { color: 'only-recolor' };
    doc.project.quilts = doc.project.quilts.map((x) => (x.id === q.id ? r : x));

    const exported = quiltProject(doc, q.id, 'exported')!;
    expect(exported.project.palette.colors.map((c) => c.id)).toContain('only-recolor');
    const file = await reopen(exported);
    expect(file.report).toEqual([]);
    expect(file.doc.project.quilts[0]!.colorways![0]!.recolor).toEqual(own);

    // Into a project whose own block of that id has another design: the quilt points at a copy.
    const mine = produce(doc, (d) => {
      d.project.quilts = [];
      const b = d.project.blocks.find((x) => x.id === slot.block)!;
      delete b.source;
      b.size = [b.size[0] + 1, b.size[1]];
    });
    const { doc: into } = importProjectQuilts(mine, file.doc, 'Sam', [q.id]);
    const got = into.project.quilts[0]!;
    const copy = got.layers[0].slots[sid]!.block;
    expect(copy).not.toBe(slot.block);
    expect(got.colorways![0]!.recolor!.slots[sid]!.block).toBe(copy);
    expect(into.project.palette.colors.map((c) => c.id)).toContain('only-recolor');
    expect((await reopen(into)).report).toEqual([]);
  });
});
