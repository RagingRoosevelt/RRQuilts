import { describe, expect, it } from 'vitest';
import { migrate, parseProject } from '@/model/io';
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
    const r = await parseProject(JSON.stringify(fixture()), { target: 2, migrations: {} });
    expect(r).toMatchObject({
      ok: false,
      error: expect.stringMatching(/No migration from version 1/),
    });
  });
});
