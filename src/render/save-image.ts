// "Save image" for quilts and blocks: a PNG at a good size, drawn once fabric images have loaded.
import type { Block } from '@/model/schema/block';
import type { Color } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { exportFile } from '@/storage/files';
import { bitmap, imageStatus } from './fabric-images';
import { blockThumbnail, quiltThumbnail } from './thumbnail';

/** Start loading the project's fabric images, and wait (up to 5 s) until they're in. */
async function fabricsReady(doc: RrqDoc) {
  for (const f of doc.project.palette.fabrics) bitmap(f);
  for (let t = 0; t < 50 && imageStatus.value.loading > 0; t++)
    await new Promise((r) => setTimeout(r, 100));
}

const pngBytes = async (dataUrl: string) =>
  new Uint8Array(await (await fetch(dataUrl)).arrayBuffer());

export async function saveQuiltImage(doc: RrqDoc, quilt: Quilt) {
  await fabricsReady(doc);
  // A fresh object, so the thumbnail cache draws it anew (with the images now loaded).
  const url = quiltThumbnail(doc, { ...quilt }, 2048, false);
  await exportFile(quilt.notecard.name, await pngBytes(url), 'png');
}

export async function saveBlockImage(
  doc: RrqDoc,
  block: Block,
  coloring: string | undefined,
  libraryColors: readonly Color[],
) {
  await fabricsReady(doc);
  const url = blockThumbnail(doc, { ...block }, 1024, false, coloring, libraryColors);
  await exportFile(block.notecard.name, await pngBytes(url), 'png');
}
