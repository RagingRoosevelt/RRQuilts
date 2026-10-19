import { readFileSync } from 'node:fs';
import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { importProjectQuilts } from '@/model/import-quilts';
import { parseProject, serializeProject } from '@/model/io';
import { createProject } from '@/model/new-project';
import type { RrqDoc } from '@/model/schema/project';

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
});
