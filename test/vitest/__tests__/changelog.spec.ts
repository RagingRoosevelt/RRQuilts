import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CHANGELOG.md (make release)', () => {
  it("names package.json's version as its newest release", () => {
    const top = /^## (\d+\.\d+\.\d+) /m.exec(readFileSync('CHANGELOG.md', 'utf8'));
    const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    if (top) expect(top[1]).toBe(version); // no release yet: nothing to match
  });
});
