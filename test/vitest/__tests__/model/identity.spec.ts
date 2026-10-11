import { describe, expect, it } from 'vitest';
import { addLine } from '@/editor/draw-ops';
import { newBlock } from '@/editor/block-ops';
import { applySeamEdit } from '@/model/blocks/edit';
import { authorSlug, contentVersion, itemId, stampVersions } from '@/model/identity';
import { createProject } from '@/model/new-project';
import type { RrqDoc } from '@/model/schema/project';

describe('item identity', () => {
  it('slugs author names and builds namespaced ids', () => {
    expect(authorSlug('Jane Doe')).toBe('jane-doe');
    expect(authorSlug('  Zoë’s Quilts!! ')).toBe('zoe-s-quilts');
    expect(authorSlug('')).toBe('anonymous');
    expect(itemId('Jane Doe')).toMatch(/^jane-doe\.[a-z0-9]{10}$/);
  });

  it('versions ignore names, notes, attribution, and editor settings', async () => {
    const b = newBlock('A', [10, 10], 'in');
    const renamed = { ...b, notecard: { name: 'B', notes: 'x' }, editor: { other: 1 } };
    expect(await contentVersion(renamed)).toBe(await contentVersion(b));
    expect(await contentVersion({ ...b, size: [12, 10] as [number, number] })).not.toBe(
      await contentVersion(b),
    );
    expect(await contentVersion(b)).toMatch(/^[a-f0-9]{12}$/);
  });

  it('stamping bumps the revision only when the design changes', async () => {
    const b = newBlock('A', [10, 10], 'in');
    let doc: RrqDoc = { ...createProject(), project: { ...createProject().project, blocks: [b] } };
    doc = await stampVersions(doc);
    const first = doc.project.blocks[0]!;
    expect(first.revision).toBe(1);
    doc = await stampVersions(doc);
    expect(doc.project.blocks[0]!.revision).toBe(1);
    const drawn = addLine(b.drawing, { x: 0, y: 0.5 }, { x: 1, y: 0.5 });
    doc = await stampVersions(applySeamEdit(doc, b.id, drawn).doc);
    expect(doc.project.blocks[0]!.revision).toBe(2);
    expect(doc.project.blocks[0]!.version).not.toBe(first.version);
  });
});
