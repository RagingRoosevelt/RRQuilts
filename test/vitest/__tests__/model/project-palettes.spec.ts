import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { createProject } from '@/model/new-project';
import {
  addPalette,
  deletePalette,
  fileInto,
  projectPalettes,
  syncPalettes,
} from '@/model/project-palettes';

let n = 0;
const id = () => `p${++n}`;
const color = (cid: string) => ({
  id: cid,
  notecard: { name: cid },
  rgb: [1, 2, 3] as [number, number, number],
});

describe('project palettes (format v3)', () => {
  it('files own colors in no palette into the first, making one if needed', () => {
    const doc = produce(createProject('P'), (d) => {
      d.project.palette.colors.push(color('a'), {
        ...color('lib'),
        source: { libraryId: 'L', itemId: 'lib', revision: 1 },
      });
      syncPalettes(d, id);
    });
    const [p] = projectPalettes(doc);
    expect(p!.palette.notecard.name).toBe('Project palette');
    expect(p!.colors.map((c) => c.id)).toEqual(['a']); // library colors stay out
  });

  it('moves items between palettes and deletes a palette with its items', () => {
    let doc = produce(createProject('P'), (d) => {
      d.project.palette.colors.push(color('a'), color('b'));
      syncPalettes(d, id);
      addPalette(d, 'second', 'Second');
      fileInto(d, 'second', ['b']);
    });
    expect(projectPalettes(doc).map((x) => x.colors.map((c) => c.id))).toEqual([['a'], ['b']]);
    doc = produce(doc, (d) => deletePalette(d, 'second'));
    expect(doc.project.palette.colors.map((c) => c.id)).toEqual(['a']);
    expect(projectPalettes(doc)).toHaveLength(1);
  });

  it('drops ids of colors that are gone', () => {
    const doc = produce(createProject('P'), (d) => {
      d.project.palette.colors.push(color('a'));
      syncPalettes(d, id);
      d.project.palette.colors = [];
      syncPalettes(d, id);
    });
    expect(doc.project.palette.collections![0]!.colors).toEqual([]);
  });
});

describe('project palette tags (format v8)', () => {
  it('keeps a palette’s tags through save and open, and opens v7 files', async () => {
    const { parseProject, serializeProject } = await import('@/model/io');
    const doc = produce(createProject('t', 'in'), (d) => {
      addPalette(d, 'pal', 'Mine');
      d.project.palette.collections!.find((p) => p.id === 'pal')!.notecard.tags = ['Favorite'];
    });
    const r = await parseProject(serializeProject(doc));
    expect(
      r.ok && r.doc.project.palette.collections!.find((p) => p.id === 'pal')!.notecard.tags,
    ).toEqual(['Favorite']);
    const v7 = JSON.parse(serializeProject(doc)) as { version: number };
    v7.version = 7;
    expect((await parseProject(JSON.stringify(v7))).ok).toBe(true);
  });
});
