import { describe, expect, it } from 'vitest';
import { addStarterContent, builtinLibrary, STARTER_BLOCKS } from '@/content/starter';
import { contentVersion } from '@/model/identity';
import { parseProject, serializeProject } from '@/model/io';
import { allPatches } from '@/model/blocks/patches';
import { createProject } from '@/model/new-project';

const expected: Record<string, number> = {
  'Four Patch': 4,
  'Nine Patch': 9,
  'Half-Square Triangle': 2,
  Pinwheel: 8,
  Hourglass: 4,
  'Flying Geese': 6,
  'Square in a Square': 5,
  'Rail Fence': 3,
  'Log Cabin': 13,
  'Churn Dash': 17,
  'Ohio Star': 21,
  "Drunkard's Path": 2,
  'Super S': 7,
};

describe('starter content', () => {
  const doc = addStarterContent(createProject());

  it('adds 76 colors (36 basic + 5 palettes of 8) and 13 blocks', () => {
    expect(doc.project.palette.colors).toHaveLength(76);
    expect(doc.project.blocks.map((b) => b.notecard.name)).toEqual(
      STARTER_BLOCKS.map((b) => b.name),
    );
  });

  it.each(Object.entries(expected))('%s derives %i patches, every one colored', (name, count) => {
    const b = doc.project.blocks.find((x) => x.notecard.name === name)!;
    expect(b.kind === 'seam' && b.unconnected).toBeFalsy();
    expect(allPatches(b)).toHaveLength(count);
    expect(Object.keys(b.colorings[0]!.fills).sort()).toEqual(
      allPatches(b)
        .map((p) => p.id)
        .sort(),
    );
  });

  it('uses more than one color in every block', () => {
    for (const b of doc.project.blocks) {
      const colors = new Set(
        Object.values(b.colorings[0]!.fills).map((f) => ('color' in f ? f.color : '')),
      );
      expect(colors.size, b.notecard.name).toBeGreaterThan(1);
    }
  });

  it('is a valid project that round-trips', async () => {
    const r = await parseProject(serializeProject(doc));
    expect(r.ok && r.report).toEqual([]);
  });

  it('sizes blocks for the project units', () => {
    expect(addStarterContent(createProject('x', 'cm')).project.blocks[0]!.size).toEqual([
      25.4, 25.4,
    ]);
  });

  it('the built-in library has namespaced ids and stable versions', async () => {
    const a = await builtinLibrary();
    const b = await builtinLibrary();
    expect(a.blocks.map((x) => x.id)).toContain('rrquilts.ohio-star');
    expect(a.colors.map((x) => x.id)).toContain('rrquilts.barn-red');
    expect(a.blocks.map((x) => x.version)).toEqual(b.blocks.map((x) => x.version));
    for (const x of [...a.blocks, ...a.colors]) expect(x.version).toMatch(/^[a-f0-9]{12}$/);
  });

  it('converting a library block to cm keeps its version', async () => {
    const lib = await builtinLibrary();
    const star = lib.blocks.find((x) => x.id === 'rrquilts.ohio-star')!;
    const inCm = { ...star, size: [25.4, 25.4] as [number, number] };
    expect(await contentVersion(inCm, 'cm')).toBe(star.version);
  });
});
