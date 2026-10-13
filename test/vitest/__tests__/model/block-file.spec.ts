import { describe, expect, it } from 'vitest';
import { addStarterContent, STARTER_BLOCKS } from '@/content/starter';
import {
  importBlock,
  importProjectBlocks,
  parseBlockFile,
  projectBlockChoices,
  serializeBlock,
} from '@/model/block-file';
import { createProject } from '@/model/new-project';
import { newBlock } from '@/editor/block-ops';
import { produce } from 'immer';

describe('.rrqbl block files', () => {
  it('round-trips a block with just the colors it uses, into a cm project as my own block', () => {
    const src = addStarterContent(createProject());
    const star = src.project.blocks.find((b) => b.id === 'rrquilts.ohio-star')!;
    const text = serializeBlock(star, 'in', src.project.palette.colors, 'Jane Doe');
    const parsed = parseBlockFile(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    // Every coloring's colors (the default and one per themed palette).
    const used = new Set(
      star.colorings.flatMap((k) =>
        Object.values(k.fills).flatMap((f) => ('color' in f ? [f.color] : [])),
      ),
    );
    expect(parsed.file.colors.map((c) => c.id).sort()).toEqual([...used].sort());
    expect(used.has('rrquilts.navy')).toBe(true);
    const { doc, blockId } = importBlock(createProject('x', 'cm'), parsed.file, 'Sam');
    const b = doc.project.blocks.find((x) => x.id === blockId)!;
    expect(b.size).toEqual([25.4, 25.4]);
    expect(b.source?.derived).toBe(true); // editable, still credited
    expect(b.author).toBe('RRQuilts contributors');
    expect(doc.project.palette.colors).toHaveLength(used.size);
  });

  it('credits the exporter of an own block; a clashing id with a different design becomes a copy', () => {
    const mine = newBlock('Mine', [10, 10], 'in', 'Jane Doe');
    const src = produce(createProject(), (d) => void d.project.blocks.push(mine));
    const parsed = parseBlockFile(
      serializeBlock(mine, 'in', src.project.palette.colors, 'Jane Doe'),
    );
    if (!parsed.ok) throw new Error(parsed.error);
    const once = importBlock(createProject(), parsed.file, 'Sam');
    expect(once.blockId).toBe(mine.id);
    expect(once.doc.project.blocks[0]!.author).toBe('Jane Doe');
    expect(importBlock(once.doc, parsed.file, 'Sam').doc).toBe(once.doc); // same design: no-op
    const changed = {
      ...parsed.file,
      block: { ...parsed.file.block, size: [12, 12] as [number, number] },
    };
    const twice = importBlock(once.doc, changed, 'Sam');
    expect(twice.blockId).toMatch(/^sam\./);
    expect(twice.doc.project.blocks.map((b) => b.notecard.name)).toEqual(['Mine', 'Mine (2)']);
  });

  it('imports only the blocks of another project, skipping library blocks I already have', () => {
    const mine = newBlock('Mine', [10, 10], 'in', 'Jane Doe');
    const from = produce(addStarterContent(createProject('src', 'in')), (d) => {
      d.project.blocks.push(mine);
      d.project.author = 'Jane Doe';
    });
    const into = createProject('dst', 'cm');
    const skip = (id: string) => id.startsWith('rrquilts.');
    const choices = projectBlockChoices(into, from, skip);
    expect(choices.map((c) => [c.block.id, c.here])).toEqual([[mine.id, false]]);
    const r = importProjectBlocks(into, from, 'Sam', [mine.id]);
    expect(r.added).toBe(1);
    expect(r.doc.project.blocks.map((b) => [b.id, b.size[0]])).toEqual([[mine.id, 25.4]]);
    expect(r.doc.project.quilts).toHaveLength(0);
    expect(projectBlockChoices(r.doc, from, skip)[0]!.here).toBe(true); // already there
    expect(projectBlockChoices(into, from)).toHaveLength(STARTER_BLOCKS.length + 1); // starter blocks too
    expect(importProjectBlocks(into, from, 'Sam', []).added).toBe(0); // only what's picked
  });

  it('rejects other files and damaged blocks', () => {
    expect(parseBlockFile('nope').ok).toBe(false);
    expect(parseBlockFile('{"format":"rrq"}').ok).toBe(false);
    expect(
      parseBlockFile('{"format":"rrqbl","version":1,"units":"in","block":{},"colors":[]}').ok,
    ).toBe(false);
  });
});
