import { describe, expect, it } from 'vitest';
import { quiltProject } from '@/model/export-quilt';
import { blocksUsed } from '@/model/library-items';
import { parseProject, serializeProject } from '@/model/io';
import { fixture } from './helpers';

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
});
