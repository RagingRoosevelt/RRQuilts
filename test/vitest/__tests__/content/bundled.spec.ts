import { describe, expect, it } from 'vitest';
import { bundledLibraries, sameUrl } from '@/content/bundled';

describe('bundled libraries (bundled_libraries.json)', () => {
  it('are none when the file is missing or unreadable', () => {
    expect(bundledLibraries(null)).toEqual([]);
    expect(bundledLibraries('nonsense')).toEqual([]);
    expect(bundledLibraries({ format: 'rrq-bundled-libraries', version: 1 })).toEqual([]);
  });

  it('keeps the entries that fit, leaving out the rest', () => {
    const ok = { name: 'A', url: 'https://github.com/a/b' };
    const file = {
      format: 'rrq-bundled-libraries',
      version: 1,
      libraries: [ok, { name: 'Plain web', url: 'http://example.org' }, { url: 'https://x' }],
    };
    expect(bundledLibraries(file)).toEqual([ok]);
  });

  it('compares addresses loosely', () => {
    expect(sameUrl('https://github.com/A/b.git/', 'https://github.com/a/b')).toBe(true);
  });
});
