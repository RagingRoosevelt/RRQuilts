import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RrqDoc } from '@/model/schema/project';

// The published JSON Schema is the TypeBox schema serialized. `npm run schema` rewrites the files.
const targets = [
  'public/schemas/rrq.v1.json',
  'specs/003-project-format/contracts/rrq.schema.json',
];
const generated = JSON.stringify(RrqDoc, null, 2) + '\n';

describe('published schema', () => {
  if (process.env.WRITE_SCHEMA) for (const t of targets) writeFileSync(t, generated);

  it.each(targets)('%s matches the model', (t) => {
    expect(readFileSync(t, 'utf8')).toBe(generated);
  });
});
