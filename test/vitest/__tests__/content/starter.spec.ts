import { describe, expect, it } from 'vitest';
import { addStarterContent, builtinItems, builtinLibrary, STARTER_BLOCKS } from '@/content/starter';
import { contentVersion } from '@/model/identity';
import { parseProject, serializeProject } from '@/model/io';
import { allPatches } from '@/model/blocks/patches';
import { createProject } from '@/model/new-project';
import { FIVE_PATCH_BLOCKS } from '@/content/five-patch';
import { FOUR_PATCH_BLOCKS } from '@/content/four-patch';
import { LETTER_BLOCKS, NUMBER_BLOCKS } from '@/content/letters';
import { NINE_PATCH_BLOCKS } from '@/content/nine-patch';
import { SEVEN_PATCH_BLOCKS } from '@/content/seven-patch';
import { LOG_CABIN_BLOCKS, STRIP_BLOCKS } from '@/content/strips';
import { MEDALLION_BLOCKS } from '@/content/medallions';

const expected: Record<string, number> = {
  'Four Patch': 4,
  'Nine Patch': 9,
  'Half-Square Triangle': 2,
  Pinwheel: 8,
  Hourglass: 4,
  'Flying Geese': 6,
  'Square in a Square': 5,
  'Rail Fence': 3,
  'Basic Log Cabin': 13,
  'Churn Dash': 17,
  'Ohio Star': 21,
  "Drunkard's Path": 2,
};

describe('starter content', () => {
  const doc = addStarterContent(createProject());

  it.each(
    [
      ...FOUR_PATCH_BLOCKS,
      ...FIVE_PATCH_BLOCKS,
      ...SEVEN_PATCH_BLOCKS,
      ...NINE_PATCH_BLOCKS,
      ...LETTER_BLOCKS,
      ...NUMBER_BLOCKS,
      ...LOG_CABIN_BLOCKS,
      ...STRIP_BLOCKS,
      ...MEDALLION_BLOCKS,
    ].map((b) => [b.name, b]),
  )('grid block %s: one patch per piece, colored as drawn', (name, fp) => {
    const b = doc.project.blocks.find((x) => x.notecard.name === name)!;
    expect(b.kind === 'seam' && b.unconnected).toBeFalsy();
    expect(b.size).toEqual([fp.size, fp.size]);
    const ids = new Map(doc.project.palette.colors.map((c) => [c.id, c.notecard.name]));
    const fills = Object.values(b.colorings[0]!.fills).map((f) =>
      'color' in f ? ids.get(f.color) : '',
    );
    expect(allPatches(b)).toHaveLength(fp.points.length);
    expect(fills.sort()).toEqual(fp.points.map((p) => p[2]).sort());
  });

  it('Latticed Irish Chain matches its cutting list', () => {
    const lic = FOUR_PATCH_BLOCKS.find((b) => b.name === 'Latticed Irish Chain')!;
    expect(lic.counts).toEqual({ L: 26, K: 11, D: 11, M: 22, S: 24, Q: 24, P: 22 });
  });

  it('gives every starter block a unique name', () => {
    const names = STARTER_BLOCKS.map((b) => b.name.toLowerCase());
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });

  it('adds 76 colors (36 basic + 5 palettes of 8) and every starter block', () => {
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

  it('uses more than one color in every pieced block', () => {
    for (const b of doc.project.blocks) {
      const colors = new Set(
        Object.values(b.colorings[0]!.fills).map((f) => ('color' in f ? f.color : '')),
      );
      expect(colors.size, b.notecard.name).toBeGreaterThan(1);
    }
  });

  it('keeps picked library blocks and palettes through save and open', async () => {
    const d = structuredClone(doc);
    d.project.libraryBlocks = ['rrquilts.ohio-star'];
    const r = await parseProject(serializeProject(d));
    expect(r.ok && r.doc.project.libraryBlocks).toEqual(['rrquilts.ohio-star']);
    expect(r.ok && r.doc.project.libraryPalettes).toEqual(['rrquilts.basic-colors']);
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

describe('renamed built-in blocks', () => {
  it('keep the id their former name gave them', () => {
    const b = builtinItems().blocks.find((x) => x.notecard.name === "King's Crown II")!;
    expect(b.id).toBe('rrquilts.king-s-crown-b');
    expect(b.source?.itemId).toBe(b.id);
  });
});
