// Every released file format version (test/fixtures/formats) still opens with today's code.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseProject } from '@/model/io';
import { parseLibrary } from '@/model/library-file';
import { parseBlockFile } from '@/model/block-file';
import { parseCollectionFile } from '@/model/collection-file';
import { parseConf } from '@/settings/settings';

const dir = 'test/fixtures/formats';
const files = readdirSync(dir).filter((f) => /-v\d+\.rrq/.test(f));
const read = (f: string) => readFileSync(`${dir}/${f}`, 'utf8');

describe('format samples', () => {
  it('has one for each format', () => {
    const kinds = new Set(files.map((f) => f.split('-v')[0]));
    expect([...kinds].sort()).toEqual(['block', 'library', 'palette', 'project', 'settings']);
  });

  it.each(files)('%s opens', async (f) => {
    const text = read(f);
    const r = f.endsWith('.rrq')
      ? await parseProject(text)
      : f.endsWith('.rrqlib')
        ? parseLibrary(text)
        : f.endsWith('.rrqbl')
          ? parseBlockFile(text)
          : f.endsWith('.rrqplt')
            ? parseCollectionFile(text)
            : parseConf(text);
    expect(r.ok ? '' : r.error).toBe('');
    if ('skipped' in r) expect(r.skipped).toEqual([]);
    if ('invalid' in r) expect(r.invalid).toEqual([]);
    if ('report' in r) expect(r.report).toEqual([]);
  });
});
