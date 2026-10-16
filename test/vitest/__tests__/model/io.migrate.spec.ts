import { describe, expect, it } from 'vitest';
import { migrate, onPointDefaults, parseProject } from '@/model/io';
import { VERSION } from '@/model/schema/project';
import { fixture } from './helpers';

describe('migrations', () => {
  it('runs each step in order and stamps the new version', () => {
    const calls: number[] = [];
    const out = migrate(
      { version: 1, a: 1 },
      {
        1: (d) => (calls.push(1), { ...d, b: d.a }),
        2: (d) => (calls.push(2), { ...d, c: d.b }),
      },
      3,
    );
    expect(calls).toEqual([1, 2]);
    expect(out).toEqual({ version: 3, a: 1, b: 1, c: 1 });
  });

  it('fails clearly when a migration step is missing', async () => {
    const r = await parseProject(JSON.stringify({ ...fixture(), version: 1 }), {
      target: 2,
      migrations: {},
    });
    expect(r).toMatchObject({
      ok: false,
      error: expect.stringMatching(/No migration from version 1/),
    });
  });
});

describe('v1 → v2 (spec 014)', () => {
  it('opens a version 1 project unchanged apart from its version', async () => {
    const r = await parseProject(JSON.stringify({ ...fixture(), version: 1 }));
    expect(r.ok && r.doc).toEqual({ ...fixture(), version: VERSION });
  });
});

describe('v2 → v3 (project palettes)', () => {
  it("puts a version 2 project's own colors and fabrics into one palette", async () => {
    const f = structuredClone(fixture());
    const want = f.project.palette.collections;
    delete f.project.palette.collections;
    const r = await parseProject(JSON.stringify({ ...f, version: 2 }));
    expect(r.ok && r.doc.project.palette.collections).toEqual(want);
  });
});

describe('v4 → v5 (On-Point layout)', () => {
  const layoutOf = async (doc: unknown) => {
    const r = await parseProject(JSON.stringify(doc));
    if (!r.ok) throw new Error(r.error);
    return r.doc.project.quilts[0]!.layout;
  };
  const withLayout = (layout: unknown, units = 'in') => {
    const f = structuredClone(fixture());
    f.project.quilts[0]!.layout = layout as never;
    return { ...f, units, version: 4 };
  };

  it('opens Horizontal layouts as Straight Set, otherwise unchanged apart from the version', async () => {
    const old = withLayout({ ...fixture().project.quilts[0]!.layout, style: 'horizontal' });
    const r = await parseProject(JSON.stringify(old));
    expect(r.ok && r.doc).toEqual({ ...fixture(), version: VERSION });
  });

  it('gives the placeholder On-Point layout defaults in the project units', async () => {
    expect(await layoutOf(withLayout({ style: 'on-point' }))).toEqual(onPointDefaults(1));
    expect(await layoutOf(withLayout({ style: 'on-point' }, 'cm'))).toEqual(onPointDefaults(2.5));
  });

  it('keeps On-Point parameters that are already there', async () => {
    const own = { ...onPointDefaults(1), cols: 5, rows: 4, sash: 2 };
    expect(await layoutOf(withLayout(own))).toEqual(own);
  });
});
