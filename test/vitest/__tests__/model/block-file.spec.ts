import { describe, expect, it } from 'vitest';
import { addStarterContent } from '@/content/starter';
import { importBlock, parseBlockFile, serializeBlock } from '@/model/block-file';
import { createProject } from '@/model/new-project';
import { newBlock } from '@/editor/block-ops';
import { produce } from 'immer';

describe('.rrqb block files', () => {
  it('round-trips a block with just the colors it uses, into a cm project as my own block', () => {
    const src = addStarterContent(createProject());
    const text = serializeBlock(src, 'rrquilts.ohio-star', 'Jane Doe');
    const parsed = parseBlockFile(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.file.colors.map((c) => c.id).sort()).toEqual([
      'rrquilts.cream',
      'rrquilts.navy',
      'rrquilts.red',
    ]);
    const { doc, blockId } = importBlock(createProject('x', 'cm'), parsed.file, 'Sam');
    const b = doc.project.blocks.find((x) => x.id === blockId)!;
    expect(b.size).toEqual([25.4, 25.4]);
    expect(b.source?.derived).toBe(true); // editable, still credited
    expect(doc.project.palette.colors).toHaveLength(3);
  });

  it('credits the exporter of an own block; a clashing id with a different design becomes a copy', () => {
    const mine = newBlock('Mine', [10, 10], 'in', 'Jane Doe');
    const src = produce(createProject(), (d) => void d.project.blocks.push(mine));
    const parsed = parseBlockFile(serializeBlock(src, mine.id, 'Jane Doe'));
    if (!parsed.ok) throw new Error(parsed.error);
    const once = importBlock(createProject(), parsed.file, 'Sam');
    expect(once.blockId).toBe(mine.id);
    expect(once.doc.project.blocks[0]!.source?.author).toBe('Jane Doe');
    const twice = importBlock(once.doc, parsed.file, 'Sam');
    expect(twice.blockId).toMatch(/^sam\./);
    expect(twice.doc.project.blocks.map((b) => b.notecard.name)).toEqual(['Mine', 'Mine (2)']);
  });

  it('rejects other files and damaged blocks', () => {
    expect(parseBlockFile('nope').ok).toBe(false);
    expect(parseBlockFile('{"format":"rrq"}').ok).toBe(false);
    expect(
      parseBlockFile('{"format":"rrqb","version":1,"units":"in","block":{},"colors":[]}').ok,
    ).toBe(false);
  });
});
