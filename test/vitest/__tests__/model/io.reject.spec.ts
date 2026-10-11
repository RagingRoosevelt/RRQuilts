import { describe, expect, it } from 'vitest';
import { parseProject } from '@/model/io';
import { fixture } from './helpers';

const parse = (doc: unknown) => parseProject(JSON.stringify(doc));

describe('rejections', () => {
  it('rejects non-JSON, other formats, bad and newer versions', async () => {
    expect((await parseProject('{oops')).ok).toBe(false);
    expect((await parse({ ...fixture(), format: 'rrq_conf' })).ok).toBe(false);
    expect((await parse({ ...fixture(), version: 0 })).ok).toBe(false);
    const newer = await parse({ ...fixture(), version: 2 });
    expect(newer).toMatchObject({ ok: false, error: expect.stringMatching(/newer/) });
  });

  it('rejects a malformed path with a readable location', async () => {
    const doc = fixture();
    const block = doc.project.blocks[0] as unknown as { patches: { path: unknown[] }[] };
    block.patches[0]!.path[1] = ['A', 1, 1, 400];
    const r = await parse(doc);
    expect(r).toMatchObject({
      ok: false,
      error: expect.stringMatching(/blocks\/0\/patches\/0\/path/),
    });
  });

  it('rejects zero-sweep arcs', async () => {
    const doc = fixture();
    const block = doc.project.blocks[0] as unknown as { patches: { path: unknown[] }[] };
    block.patches[0]!.path[2] = ['A', 0, 1, 0];
    expect((await parse(doc)).ok).toBe(false);
  });

  it('rejects duplicate ids within a scope, allows reuse across blocks', async () => {
    const doc = fixture();
    doc.project.palette.colors[1]!.id = 'col1';
    expect(await parse(doc)).toMatchObject({
      ok: false,
      error: expect.stringMatching(/duplicate id "col1"/),
    });
    // "pa" is used in several blocks and "p" in two: fine (block-scoped).
    expect((await parse(fixture())).ok).toBe(true);
  });

  it('loads dangling references but reports them', async () => {
    const doc = fixture();
    doc.project.palette.colors = doc.project.palette.colors.filter((c) => c.id !== 'col2');
    const r = await parse(doc);
    expect(r).toMatchObject({ ok: true, report: [expect.stringMatching(/missing color col2/)] });
  });

  it('reports corrupted image data', async () => {
    const doc = fixture();
    doc.project.photos[0]!.image.sha256 = '0'.repeat(64);
    const r = await parse(doc);
    expect(r).toMatchObject({
      ok: true,
      report: [expect.stringMatching(/photo pho1: image data is corrupted/)],
    });
  });
});
