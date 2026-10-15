import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { sha256Hex } from '@/model/io';
import { writeZip } from '@/model/zip';
import { resetIdb } from '@/storage/idb';
import { getImage } from '@/storage/images';
import { isZip, readLibraryZip, writeLibraryZip } from '@/storage/library-zip';
import { putImage } from '@/storage/images';
import { serializeLibrary } from '@/model/library-file';
import { addFabrics, emptyPersonal } from '@/model/library';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
});

const text = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));

async function libraryZip(opts: { badHash?: boolean; missingPack?: boolean } = {}) {
  const img = new Uint8Array([9, 8, 7, 6]);
  const sha = await sha256Hex(img);
  const size = {
    px: 256,
    sha256: opts.badHash ? '0'.repeat(64) : sha,
    type: 'image/webp',
    width: 256,
    height: 256,
    path: '256/a.webp',
  };
  const pack = {
    format: 'rrqlib',
    version: 2,
    units: 'in',
    kind: 'pack',
    id: 'cloud9-fabrics-pond-days',
    revision: 1,
    name: 'Pond Days',
    author: { name: 'Jayme' },
    license: 'LicenseRef-Personal-Use',
    categories: [],
    items: [
      {
        type: 'colors',
        data: {
          id: 'cloud9-fabrics.pond-days',
          notecard: { name: 'Pond Days' },
          colors: [],
          fabrics: [
            {
              id: 'cloud9-fabrics.229834',
              notecard: { name: 'Pond Days 229834' },
              image: { sha256: sha, type: 'image/webp', width: 256, height: 256 },
              size: [8, 8],
              approximate: true,
              average: [1, 2, 3],
              sizes: [size],
            },
          ],
        },
      },
    ],
  };
  const index = {
    format: 'rrqlib-index',
    version: 1,
    id: 'cloud9-fabrics',
    name: 'Cloud9 Fabrics',
    packs: [
      { path: 'packs/pond/rrqlib.json' },
      ...(opts.missingPack ? [{ path: 'packs/gone/rrqlib.json' }] : []),
    ],
  };
  return {
    sha,
    zip: writeZip([
      { name: 'library.json', bytes: text(index) },
      { name: 'packs/pond/rrqlib.json', bytes: text(pack) },
      { name: 'packs/pond/256/a.webp', bytes: img },
    ]),
  };
}

describe('zipped .rrqlib (spec 014)', () => {
  it('reads the index and packs, and stores their images', async () => {
    const { zip, sha } = await libraryZip();
    expect(isZip(zip)).toBe(true);
    const r = await readLibraryZip(zip);
    expect(r.library).toEqual({ id: 'cloud9-fabrics', name: 'Cloud9 Fabrics' });
    expect(r.packs.map((p) => [p.id, p.library?.id])).toEqual([
      ['cloud9-fabrics-pond-days', 'cloud9-fabrics'],
    ]);
    expect(r.skipped).toEqual([]);
    expect(await getImage(sha)).toBeDefined();
  });

  it('reports images that don’t match and packs that are missing', async () => {
    const { zip } = await libraryZip({ badHash: true, missingPack: true });
    const r = await readLibraryZip(zip);
    expect(r.packs).toHaveLength(1);
    expect(r.skipped).toEqual([
      "Pond Days: Pond Days 229834: image doesn't match",
      'packs/gone/rrqlib.json: missing from the zip',
    ]);
  });

  it('backs up My library with its fabric images and restores them elsewhere', async () => {
    const sha = await putImage(new Uint8Array([4, 4, 4]), {
      type: 'image/webp',
      width: 256,
      height: 256,
    });
    const size = { px: 256, sha256: sha, type: 'image/webp', width: 256, height: 256 };
    const { lib } = await addFabrics(
      emptyPersonal('Me'),
      { name: 'Stash' },
      [
        {
          id: 'me.dots',
          notecard: { name: 'Dots' },
          image: { sha256: sha, type: 'image/webp', width: 256, height: 256 },
          size: [8, 8],
          average: [1, 2, 3],
          sizes: [size],
        },
      ],
      'Me',
    );
    const zip = await writeLibraryZip(lib, (d) => serializeLibrary(d, 'test'));
    expect(zip && isZip(zip)).toBe(true);
    globalThis.indexedDB = new IDBFactory(); // another device
    resetIdb();
    const r = await readLibraryZip(zip!);
    expect(r.backup?.kind).toBe('personal');
    expect(r.skipped).toEqual([]);
    expect(await getImage(sha)).toBeDefined();
    // Without fabric images there's nothing to zip.
    expect(
      await writeLibraryZip(emptyPersonal('Me'), (d) => serializeLibrary(d, 'test')),
    ).toBeUndefined();
  });
});
