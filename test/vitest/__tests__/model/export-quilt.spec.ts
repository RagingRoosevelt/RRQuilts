import { describe, expect, it } from 'vitest';
import { quiltProject } from '@/model/export-quilt';
import { blocksUsed } from '@/model/library-items';
import { parseProject, serializeProject } from '@/model/io';
import { fixture } from './helpers';
import { createProject } from '@/model/new-project';
import { addEppV12 } from '../formats/epp-v12';

describe('Export quilt', () => {
  it('a project with just that quilt and what it uses, which opens cleanly', async () => {
    const doc = fixture();
    const q = doc.project.quilts[0]!;
    const out = quiltProject(doc, q.id, 'exported')!;
    expect(out.project.quilts.map((x) => x.id)).toEqual([q.id]);
    expect(out.project.name).toBe(q.notecard.name);
    expect(out.project.id).toBe('exported');
    const used = blocksUsed(out.project);
    expect(out.project.blocks.every((b) => used.has(b.id))).toBe(true);
    expect(out.project.palette.colors.length).toBeLessThanOrEqual(
      doc.project.palette.colors.length,
    );
    const r = await parseProject(serializeProject(out));
    expect(r.ok && r.report).toEqual([]);
    expect(quiltProject(doc, 'nope', 'x')).toBeUndefined();
  });

  // Bug (owner, 2026-11-24: "exporting an epp / 3d epp quilt doesn't seem to have the contents in
  // the export"): the colors its pieces and rosettes are painted with were left out, and every
  // shape and rosette of the project went along.
  it('an EPP or 3D EPP quilt takes its colors, and only its shapes and rosettes', async () => {
    const doc = addEppV12(createProject('EPP', 'in'));
    const name = (n: string) => doc.project.quilts.find((q) => q.notecard.name === n)!;
    const epp = quiltProject(doc, name('EPP Quilt').id, 'a')!;
    expect(epp.project.rosettes?.map((r) => r.notecard.name)).toEqual(['Sample Flower']);
    expect(epp.project.eppShapes?.map((s) => s.notecard.name).sort()).toEqual([
      'Domino',
      'Hexagon',
    ]);
    const colors = epp.project.palette.colors.map((c) => c.notecard.name).sort();
    for (const c of ['Cream', 'Gold', 'Navy', 'Rose', 'Sage', 'Teal', 'Yellow'])
      expect(colors).toContain(c);
    const cube = quiltProject(doc, name('3D EPP Cube').id, 'b')!;
    expect(cube.project.rosettes).toEqual([]);
    expect(cube.project.palette.colors.length).toBeGreaterThan(0);
    for (const out of [epp, cube]) {
      const r = await parseProject(serializeProject(out));
      expect(r.ok && r.report).toEqual([]);
    }
  });
});
