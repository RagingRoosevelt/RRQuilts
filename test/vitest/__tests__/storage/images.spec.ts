import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { sha256Hex } from '@/model/io';
import { resetIdb } from '@/storage/idb';
import { getImage, imageIds, pruneImages, putImage, storeEmbedded } from '@/storage/images';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
});

const bytes = (...b: number[]) => new Uint8Array(b);
const meta = { type: 'image/webp', width: 2, height: 2 };

describe('image store', () => {
  it('stores by hash, once', async () => {
    const a = await putImage(bytes(1, 2, 3), meta);
    const again = await putImage(bytes(1, 2, 3), meta);
    expect(again).toBe(a);
    expect(a).toBe(await sha256Hex(bytes(1, 2, 3)));
    expect(await imageIds()).toEqual([a]);
    expect(new Uint8Array((await getImage(a))!.bytes)).toEqual(bytes(1, 2, 3));
  });

  it('stores an embedded asset only when its hash matches', async () => {
    const data = 'data:image/webp;base64,' + btoa('\x01\x02');
    const sha256 = await sha256Hex(bytes(1, 2));
    expect(await storeEmbedded({ data, sha256, type: 'image/webp' })).toBe(true);
    expect(await storeEmbedded({ data, sha256: '0'.repeat(64), type: 'image/webp' })).toBe(false);
    expect(await storeEmbedded({ sha256, type: 'image/webp' })).toBe(false); // a reference
    expect(await imageIds()).toEqual([sha256]);
  });

  it('prunes what nothing keeps', async () => {
    const a = await putImage(bytes(1), meta);
    const b = await putImage(bytes(2), meta);
    await pruneImages(new Set([a]));
    expect(await imageIds()).toEqual([a]);
    expect(await getImage(b)).toBeUndefined();
  });
});
