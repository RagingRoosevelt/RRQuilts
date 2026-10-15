import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { createProject } from '@/model/new-project';
import {
  contentKey,
  linkPalette,
  paletteDiff,
  paletteLinks,
  resolveSync,
  syncPalettes,
} from '@/model/project-palettes';
import type { ColorCollection } from '@/model/schema/library';

const color = (id: string, rgb: [number, number, number] = [1, 2, 3]) => ({
  id,
  notecard: { name: id },
  rgb,
});
const doc = produce(createProject('P'), (d) => {
  d.project.palette.colors.push(color('a'), color('b'));
  syncPalettes(d, () => 'pp');
  linkPalette(d, 'pp', { libraryId: 'my', itemId: 'mine' });
});
const lib = (colors: ReturnType<typeof color>[]): ColorCollection => ({
  id: 'mine',
  notecard: { name: 'Mine' },
  colors,
});

describe('project palettes synced with My library', () => {
  it('match and report whether they differ', () => {
    expect(paletteLinks(doc, [lib([color('a'), color('b')])]).get('pp')?.inSync).toBe(true);
    expect(paletteLinks(doc, [lib([color('a'), color('b', [9, 9, 9])])]).get('pp')?.inSync).toBe(
      false,
    );
    expect(paletteLinks(doc, [lib([color('a')])]).get('pp')?.inSync).toBe(false);
    expect(paletteLinks(doc, [{ ...lib([]), id: 'other' }]).get('pp')).toBeUndefined();
    const broken = produce(doc, (d) => linkPalette(d, 'pp'));
    expect(paletteLinks(broken, [lib([color('a'), color('b')])]).get('pp')).toBeUndefined();
  });
});

describe('synchronizing in both directions', () => {
  const base = contentKey([color('a'), color('b'), color('c')], []);
  const project = {
    colors: [{ ...color('a'), notecard: { name: 'A2' } }, color('b'), color('c')],
    fabrics: [],
  };
  const library = lib([
    color('a'),
    { ...color('b'), notecard: { name: 'B2' } },
    color('c'),
    color('d'),
  ]);

  it("takes each side's own changes without asking", () => {
    const r = resolveSync(paletteDiff(project, library), base);
    expect(r.conflicts).toEqual([]);
    expect(Object.fromEntries(r.auto)).toEqual({ a: 'project', b: 'library', d: 'library' });
  });

  it('asks about what changed on both sides, or everything when the last sync is unknown', () => {
    const both = lib([{ ...color('a'), notecard: { name: 'A3' } }, color('b'), color('c')]);
    expect(resolveSync(paletteDiff(project, both), base).conflicts.map((c) => c.id)).toEqual(['a']);
    expect(resolveSync(paletteDiff(project, library), undefined).conflicts).toHaveLength(3);
  });

  it('removals follow the side that removed', () => {
    const fewer = { colors: [color('a'), color('b')], fabrics: [] };
    const r = resolveSync(paletteDiff(fewer, lib([color('a'), color('b'), color('c')])), base);
    expect(Object.fromEntries(r.auto)).toEqual({ c: 'project' });
  });
});
