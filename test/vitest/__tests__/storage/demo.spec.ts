import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseProject } from '@/model/io';
import { DEMOS, demoName } from '@/storage/demo';

// The shipped files themselves (each demo's own test checks the project it builds): every file in
// public/demo is listed and every listed demo has its file, and each opens with no report.
describe('demo projects', () => {
  it('lists every file in public/demo, and each opens clean', async () => {
    const files = readdirSync('public/demo').filter((f) => f.endsWith('.rrq'));
    expect(DEMOS.map((d) => d.file).sort()).toEqual(files.sort());
    for (const f of files) {
      const r = await parseProject(readFileSync(`public/demo/${f}`, 'utf8'));
      if (!r.ok) throw new Error(`${f}: ${r.error}`);
      expect(r.report, f).toEqual([]);
      expect(r.doc.project.author, f).toBe('RRQuilts contributors');
    }
  });
});

describe('demo links (/?open_demo=)', () => {
  const at = (v: string) => demoName(v, 'https://ragingroosevelt.github.io', '/RRQuilts/');
  it('take a file in the app’s demo folder', () => {
    expect(at('3d-epp.rrq')).toBe('3d-epp.rrq');
    expect(at('demo/3d-epp.rrq')).toBe('3d-epp.rrq');
    expect(at('https://ragingroosevelt.github.io/RRQuilts/demo/3d-epp.rrq')).toBe('3d-epp.rrq');
  });
  it('refuse anything else: other sites, other folders, other files, climbing out', () => {
    expect(at('https://example.com/RRQuilts/demo/3d-epp.rrq')).toBeNull();
    expect(at('https://ragingroosevelt.github.io/RRQuilts/schemas/x.rrq')).toBeNull();
    expect(at('https://ragingroosevelt.github.io/RRQuilts/demo/sub/x.rrq')).toBeNull();
    expect(at('../secret.rrq')).toBeNull();
    expect(at('demo/../x.rrq')).toBeNull();
    expect(at('3d-epp.json')).toBeNull();
    expect(at('javascript:alert(1)')).toBeNull();
    expect(at('')).toBeNull();
  });
});
