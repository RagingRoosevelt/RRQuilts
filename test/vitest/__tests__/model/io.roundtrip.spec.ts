import { describe, expect, it } from 'vitest';
import { parseProject, serializeProject } from '@/model/io';
import { VERSION } from '@/model/schema/project';
import { fixture, fixtureText } from './helpers';

describe('round-trip', () => {
  it('parses the everything fixture without errors or reports', async () => {
    const r = await parseProject(fixtureText());
    if (!r.ok) throw new Error(r.error);
    expect(r.report).toEqual([]);
  });

  it('save → reopen is identical, including unknown keys', async () => {
    const first = await parseProject(fixtureText());
    if (!first.ok) throw new Error(first.error);
    const second = await parseProject(serializeProject(first.doc));
    if (!second.ok) throw new Error(second.error);
    expect(second.doc).toEqual({ ...fixture(), version: VERSION }); // fixture stays v4 as migration coverage
    const text = serializeProject(second.doc);
    for (const key of ['futureTopLevel', 'futureProjectKey', 'futureQuiltKey', 'futureEditorKey']) {
      expect(text).toContain(key);
    }
  });

  it('keeps circular arcs and Béziers as their own kinds', async () => {
    const r = await parseProject(fixtureText());
    if (!r.ok) throw new Error(r.error);
    const seam = r.doc.project.blocks.find((b) => b.id === 'seam1');
    if (seam?.kind !== 'seam') throw new Error('fixture');
    const kinds = seam.patches.flatMap((p) => p.path.map((c) => c[0]));
    expect(kinds).toContain('A');
    expect(kinds).toContain('C');
    expect(seam.drawing.segments.map((s) => s.kind)).toEqual(['line', 'arc', 'bezier']);
  });
});
