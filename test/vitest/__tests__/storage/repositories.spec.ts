import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sha256Hex } from '@/model/io';
import { resetIdb } from '@/storage/idb';
import { getImage } from '@/storage/images';
import { fetchIndex, fetchPack, rawBase, type Connection } from '@/storage/repositories';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
});
afterEach(() => vi.unstubAllGlobals());

/** A fake web server: path → JSON or bytes. */
function serve(files: Record<string, unknown>) {
  const calls: string[] = [];
  vi.stubGlobal('fetch', (url: string) => {
    calls.push(url);
    const f = files[url];
    if (f === undefined) return Promise.resolve(new Response('nope', { status: 404 }));
    const body = f instanceof Uint8Array ? new Blob([f.slice()]) : JSON.stringify(f);
    return Promise.resolve(new Response(body, { status: 200 }));
  });
  return calls;
}

const B = 'https://raw.githubusercontent.com/me/lib/main/';

describe('connected libraries (spec 002, 014)', () => {
  it('turns repository addresses into raw file addresses', () => {
    expect(rawBase('https://github.com/me/lib')).toBe(B);
    expect(rawBase('https://github.com/me/lib.git', 'dev')).toBe(
      'https://raw.githubusercontent.com/me/lib/dev/',
    );
    expect(rawBase('https://github.com/me/lib/tree/v2')).toBe(
      'https://raw.githubusercontent.com/me/lib/v2/',
    );
    expect(rawBase('https://example.org/quilts/')).toBe('https://example.org/quilts/');
    expect(() => rawBase('http://example.org')).toThrow(/https/);
  });

  it('reads a single-pack repository as a one-pack library', async () => {
    serve({
      [B + 'rrqlib.json']: {
        format: 'rrqlib',
        version: 2,
        units: 'in',
        kind: 'pack',
        id: 'solo',
        revision: 3,
        name: 'Solo',
        author: { name: 'A' },
        license: 'CC0-1.0',
        categories: [],
        items: [],
      },
    });
    const ix = await fetchIndex(B);
    expect(ix).toMatchObject({
      id: 'solo',
      revision: 3,
      packs: [{ id: 'solo', path: 'rrqlib.json' }],
    });
  });

  it('downloads a pack with its images up to the screen size, checked', async () => {
    const img = (n: number) => new Uint8Array([n, n, n]);
    const s = async (px: number, n: number) => ({
      px,
      sha256: await sha256Hex(img(n)),
      type: 'image/webp',
      width: px,
      height: px,
      path: `${px}/a.webp`,
    });
    const sizes = [await s(256, 1), await s(512, 2), await s(1024, 3)];
    const calls = serve({
      [B + 'packs/p/rrqlib.json']: {
        format: 'rrqlib',
        version: 2,
        units: 'in',
        kind: 'pack',
        id: 'p',
        revision: 1,
        name: 'P',
        author: { name: 'A' },
        license: 'CC0-1.0',
        categories: [],
        items: [
          {
            type: 'colors',
            data: {
              id: 'a.p',
              notecard: { name: 'P' },
              colors: [],
              fabrics: [
                {
                  id: 'a.f',
                  notecard: { name: 'F' },
                  image: { sha256: sizes[1]!.sha256, type: 'image/webp' },
                  size: [8, 8],
                  average: [1, 2, 3],
                  sizes,
                },
              ],
            },
          },
        ],
      },
      [B + 'packs/p/256/a.webp']: img(1),
      [B + 'packs/p/512/a.webp']: img(2),
      [B + 'packs/p/1024/a.webp']: img(3),
    });
    const c = {
      id: 'repo:lib',
      url: 'https://github.com/me/lib',
      base: B,
      pinned: 1,
      index: { format: 'rrqlib-index', version: 1, id: 'lib', name: 'Lib', revision: 1, packs: [] },
    } as Connection;
    const r = await fetchPack(c, { id: 'p', name: 'P', path: 'packs/p/rrqlib.json' }, 512);
    expect(r.doc.library).toEqual({ id: 'lib', name: 'Lib' });
    expect(r.skipped).toEqual([]);
    expect(await getImage(sizes[0]!.sha256)).toBeDefined();
    expect(await getImage(sizes[1]!.sha256)).toBeDefined();
    expect(await getImage(sizes[2]!.sha256)).toBeUndefined(); // 1024: for printing only
    expect(calls.some((u) => u.includes('/1024/'))).toBe(false);
  });
});
