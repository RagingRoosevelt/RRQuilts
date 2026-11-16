import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { parseProject, serializeProject } from '@/model/io';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import { projectSeams, SEAM_DEFAULTS, setSeam } from '@/model/seams';
import { convertUnits } from '@/model/units';

describe('project seam allowances (owner, 2026-11-14)', () => {
  it('default to 1/4 in or 6 mm for piecing and 3/8 in or 10 mm for EPP', () => {
    expect(SEAM_DEFAULTS).toEqual({
      in: { piecing: 0.25, epp: 0.375 },
      cm: { piecing: 0.6, epp: 1 },
    });
    const doc = createProject('P');
    expect(projectSeams(doc)).toEqual({ piecing: 0.25, epp: 0.375 });
    expect(projectSeams(null, 'cm')).toEqual({ piecing: 0.6, epp: 1 });
  });

  it('save with the project; a default is stored as unset', async () => {
    let doc = produce(createProject('P'), (d) => void setSeam(d, 'epp', 0.5));
    expect(doc.project.seams).toEqual({ epp: 0.5 });
    const r = await parseProject(serializeProject(doc));
    expect(r.ok && projectSeams(r.doc)).toEqual({ piecing: 0.25, epp: 0.5 });
    doc = produce(doc, (d) => void setSeam(d, 'epp', 0.375));
    expect(doc.project.seams).toBeUndefined();
  });

  it('change units: a default stays the default, other values scale', () => {
    const doc = produce(createProject('P'), (d) => void setSeam(d, 'epp', 0.5));
    const cm = convertUnits(doc, 'cm');
    expect(projectSeams(cm)).toEqual({ piecing: 0.6, epp: 1.27 });
  });

  it('a development v12 file’s EPP quilt seam allowance becomes the project’s', async () => {
    const doc = produce(createProject('P'), (d) => {
      d.project.quilts.push(
        createQuilt('E', { style: 'epp', unit: 2, edge: { kind: 'none' } }, []),
      );
    });
    const raw = JSON.parse(serializeProject(doc));
    raw.project.quilts[0].layout.seam = 0.5;
    const r = await parseProject(JSON.stringify(raw));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.doc.project.seams).toEqual({ epp: 0.5 });
    expect(r.doc.project.quilts[0]!.layout).not.toHaveProperty('seam');
  });
});
