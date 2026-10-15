// Libraries every copy of the app offers, from bundled_libraries.json at the project root (built in).
// The file is optional: renamed or missing, there are none. Entries that don't fit the schema are
// left out rather than breaking the app.
import Value from 'typebox/value';
import { BundledLibraries, BundledLibrary } from '@/model/schema/bundled';

const files = import.meta.glob<unknown>('/bundled_libraries.json', {
  eager: true,
  import: 'default',
});

export function bundledLibraries(raw: unknown = Object.values(files)[0]): BundledLibrary[] {
  if (!raw || typeof raw !== 'object') return [];
  const list = (raw as { libraries?: unknown }).libraries;
  if (!Array.isArray(list)) return [];
  if (!Value.Check(BundledLibraries, raw))
    console.warn('bundled_libraries.json has problems; using the entries that fit.');
  return list.filter((x): x is BundledLibrary => Value.Check(BundledLibrary, x));
}

/** Addresses compared loosely (case, trailing slash, .git). */
export const sameUrl = (a: string, b: string) => {
  const n = (u: string) =>
    u
      .trim()
      .toLowerCase()
      .replace(/\/+$/, '')
      .replace(/\.git$/, '');
  return n(a) === n(b);
};
