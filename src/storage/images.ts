// Device-wide image store (spec 014 FR-010): fabric images kept once, keyed by their SHA-256, as
// bytes (not base64). Library packs, My library, and projects all point here by hash.
import { dataUriBytes, sha256Hex } from '@/model/io';
import type { Asset } from '@/model/schema/shared';
import { idb } from './idb';

export interface StoredImage {
  /** SHA-256 of the bytes. */
  id: string;
  bytes: ArrayBuffer;
  type: string;
  width: number;
  height: number;
}

/** Store image bytes (if new); returns the hash they're stored under. */
export async function putImage(
  bytes: Uint8Array<ArrayBuffer>,
  meta: { type: string; width: number; height: number },
): Promise<string> {
  const id = await sha256Hex(bytes);
  if (!(await idb.get<StoredImage>('images', id)))
    await idb.put<StoredImage>('images', { id, bytes: bytes.slice().buffer, ...meta });
  return id;
}

export const getImage = (sha256: string) => idb.get<StoredImage>('images', sha256);
export const deleteImage = (sha256: string) => idb.delete('images', sha256);
export const imageIds = () => idb.keys('images');

/**
 * Put an embedded asset's image into the store, checked against its hash. Returns false when the
 * data doesn't match (the asset is then ignored, spec 002 FR-012).
 */
export async function storeEmbedded(asset: Asset): Promise<boolean> {
  if (!asset.data) return false;
  const bytes = dataUriBytes(asset.data);
  if ((await sha256Hex(bytes)) !== asset.sha256) return false;
  await putImage(bytes, { type: asset.type, width: asset.width ?? 0, height: asset.height ?? 0 });
  return true;
}

/** Remove stored images nothing needs any more (`keep`: hashes still in use). */
export async function pruneImages(keep: ReadonlySet<string>) {
  for (const id of await imageIds()) if (!keep.has(id)) await deleteImage(id);
}
