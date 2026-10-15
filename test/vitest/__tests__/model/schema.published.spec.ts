import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RrqDoc } from '@/model/schema/project';
import { BundledLibraries } from '@/model/schema/bundled';
import Value from 'typebox/value';

// The published JSON Schema is the TypeBox schema serialized. `npm run schema` rewrites the files.
const targets = [
  'public/schemas/rrq.v2.json',
  'specs/003-project-format/contracts/rrq.schema.json',
];
const generated = JSON.stringify(RrqDoc, null, 2) + '\n';

describe('published schema', () => {
  if (process.env.WRITE_SCHEMA) for (const t of targets) writeFileSync(t, generated);

  it.each(targets)('%s matches the model', (t) => {
    expect(readFileSync(t, 'utf8')).toBe(generated);
  });
});

describe('bundled libraries', () => {
  const target = 'public/schemas/bundled_libraries.v1.json';
  const schema = JSON.stringify(BundledLibraries, null, 2) + '\n';
  if (process.env.WRITE_SCHEMA) writeFileSync(target, schema);
  it('publishes its schema', () => expect(readFileSync(target, 'utf8')).toBe(schema));
  // The file is optional (renamed or removed: no bundled libraries).
  it.skipIf(!existsSync('bundled_libraries.json'))('bundled_libraries.json is valid', () => {
    const file: unknown = JSON.parse(readFileSync('bundled_libraries.json', 'utf8'));
    expect([...Value.Errors(BundledLibraries, file)].map((e) => e.message)).toEqual([]);
  });
});

describe('published format versions (template repositories check these)', () => {
  it('match the app', async () => {
    const { VERSION } = await import('@/model/schema/project');
    const { LIBRARY_VERSION } = await import('@/model/schema/library');
    expect(JSON.parse(readFileSync('public/schemas/formats.json', 'utf8'))).toEqual({
      rrq: VERSION,
      rrqlib: LIBRARY_VERSION,
      'rrqlib-index': 1,
    });
  });
});
