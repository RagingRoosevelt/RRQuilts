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

describe('sha256 fallback', () => {
  it('matches Web Crypto for empty, short, and multi-block inputs', async () => {
    const { sha256Hex, sha256HexJs } = await import('@/model/io');
    for (const n of [0, 3, 55, 56, 64, 1000]) {
      const bytes = Uint8Array.from({ length: n }, (_, i) => (i * 31) & 255);
      expect(sha256HexJs(bytes)).toBe(await sha256Hex(bytes));
    }
    expect(sha256HexJs(new TextEncoder().encode('abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});
