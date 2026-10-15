import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { produce } from 'immer';
import { beforeEach, describe, expect, it } from 'vitest';
import { PERSONAL_USE } from '@/model/credits';
import { libraryRefs } from '@/model/library-refs';
import { createProject } from '@/model/new-project';
import type { Fabric } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import { absorbImages, prepareForSave } from '@/storage/fabric-files';
import { resetIdb } from '@/storage/idb';
import { getImage, putImage } from '@/storage/images';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
});

async function setup() {
  const meta = (px: number) => ({ type: 'image/webp', width: px, height: px });
  const s256 = await putImage(new Uint8Array([2, 5, 6]), meta(256));
  const s512 = await putImage(new Uint8Array([5, 1, 2]), meta(512));
  const sizes = [
    { px: 256, sha256: s256, ...meta(256) },
    { px: 512, sha256: s512, ...meta(512) },
  ];
  const fabric = (id: string, extra: Partial<Fabric> = {}): Fabric => ({
    id,
    notecard: { name: id },
    image: { sha256: s512, ...meta(512) },
    size: [8, 8],
    average: [1, 2, 3],
    sizes,
    ...extra,
  });
  const lib = { libraryId: 'cloud9', itemId: 'x', revision: 1, library: 'Cloud9', author: 'Me' };
  const base = createProject('P');
  const doc: RrqDoc = produce(base, (d) => {
    d.project.palette.fabrics = [
      fabric('me.own'),
      fabric('lib.cc', { source: { ...lib, license: 'CC-BY-4.0' } }),
      fabric('lib.pu', { source: { ...lib, license: PERSONAL_USE } }),
    ];
  });
  return { doc, s256, s512 };
}
const byId = (d: RrqDoc, id: string) => d.project.palette.fabrics.find((f) => f.id === id)!;

describe('fabric images in saved projects (spec 014)', () => {
  it('embeds own fabrics at the save size and references library ones', async () => {
    const { doc, s256, s512 } = await setup();
    const big = await prepareForSave(doc, 512);
    expect(byId(big, 'me.own').image).toMatchObject({
      sha256: s512,
      data: expect.stringMatching(/^data:image\/webp;base64,/),
    });
    expect(byId(big, 'lib.cc').image.data).toBeUndefined();
    const small = await prepareForSave(doc, 256);
    expect(byId(small, 'me.own').image.sha256).toBe(s256);
  });

  it('includes library images at 256 when asked, unless their license forbids sharing', async () => {
    const { doc, s256 } = await setup();
    const out = await prepareForSave(
      produce(doc, (d) => void (d.project.includeLibraryImages = true)),
      512,
    );
    expect(byId(out, 'lib.cc').image).toMatchObject({ sha256: s256, data: expect.any(String) });
    expect(byId(out, 'lib.pu').image.data).toBeUndefined();
  });

  it('opening moves embedded images into the store', async () => {
    const { doc, s512 } = await setup();
    const saved = await prepareForSave(doc, 512);
    globalThis.indexedDB = new IDBFactory(); // another device
    resetIdb();
    const opened = await absorbImages(saved);
    expect(byId(opened, 'me.own').image.data).toBeUndefined();
    expect(await getImage(s512)).toBeDefined();
  });

  it('lists the libraries a project uses', async () => {
    const { doc } = await setup();
    expect(libraryRefs(doc)).toEqual([
      { id: 'cloud9', name: 'Cloud9', author: 'Me', packs: ['cloud9'] },
    ]);
  });

  it('groups packs under their connected library, with its address', async () => {
    const { doc } = await setup();
    const where = () => ({
      library: { id: 'makers', name: 'Makers' },
      url: 'https://github.com/a/b',
    });
    expect(libraryRefs(doc, where)).toEqual([
      { id: 'makers', name: 'Makers', url: 'https://github.com/a/b', packs: ['cloud9'] },
    ]);
  });
});
