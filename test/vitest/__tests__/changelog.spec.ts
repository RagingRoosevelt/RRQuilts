import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  changelogMarkdown,
  changesSince,
  compareVersions,
  parseChangelog,
  parseVersionInfo,
} from '@/model/changelog';

describe('CHANGELOG.md (make release)', () => {
  it("names package.json's version as its newest release", () => {
    const top = /^## (\d+\.\d+\.\d+) /m.exec(readFileSync('CHANGELOG.md', 'utf8'));
    const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    if (top) expect(top[1]).toBe(version); // no release yet: nothing to match
  });
});

const raw = `# Changelog

Intro.

## 0.2.0 (2026-10-30)

### New features

- Small thing.
- [major] Big thing that wraps
  onto a second line.

### Fixes

- A fix.

## 0.1.0 (2026-10-15)

### New features

- [major] First.
`;

describe('changelog parsing (spec 054)', () => {
  it('reads versions, sections and major marks, joining wrapped lines', () => {
    const v = parseChangelog(raw);
    expect(v.map((x) => [x.version, x.date])).toEqual([
      ['0.2.0', '2026-10-30'],
      ['0.1.0', '2026-10-15'],
    ]);
    expect(v[0]!.sections[0]!.changes).toEqual([
      { text: 'Small thing.', major: false },
      { text: 'Big thing that wraps onto a second line.', major: true },
    ]);
    expect(v[0]!.sections[1]).toEqual({
      title: 'Fixes',
      changes: [{ text: 'A fix.', major: false }],
    });
  });

  it('shows Help major changes first, without the marker', () => {
    const md = changelogMarkdown(raw.replace(/^# .*\n/, ''));
    expect(md).not.toContain('[major]');
    expect(md).toContain('Intro.');
    expect(md.indexOf('Big thing')).toBeLessThan(md.indexOf('Small thing'));
  });

  it('keeps every line of the real changelog', () => {
    const text = readFileSync('CHANGELOG.md', 'utf8');
    const n = parseChangelog(text).flatMap((v) => v.sections.flatMap((s) => s.changes)).length;
    expect(n).toBe(text.split('\n').filter((l) => l.startsWith('- ')).length);
  });
});

describe('update dialog data (spec 054)', () => {
  it('compares versions by number', () => {
    expect(compareVersions('0.7.10', '0.7.9')).toBe(1);
    expect(compareVersions('0.7.2', '0.7.2')).toBe(0);
    expect(compareVersions('0.6.1', '0.7.0')).toBe(-1);
  });

  it('lists newer versions with their major changes and a count of the rest', () => {
    const info = parseVersionInfo({ version: '0.2.0', versions: parseChangelog(raw) })!;
    expect(changesSince(info, '0.1.0')).toEqual([
      {
        version: '0.2.0',
        date: '2026-10-30',
        major: ['Big thing that wraps onto a second line.'],
        minor: 2,
      },
    ]);
    expect(changesSince(info, '0.2.0')).toEqual([]);
  });

  it('rejects a malformed version.json', () => {
    expect(parseVersionInfo(null)).toBeNull();
    expect(parseVersionInfo({ version: 1 })).toBeNull();
    expect(
      parseVersionInfo({ version: '1.0.0', versions: [{ version: '1.0.0' }] })?.versions,
    ).toEqual([]);
  });
});
