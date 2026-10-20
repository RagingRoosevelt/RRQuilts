// Writes one sample file per format at this code's versions into $FORMAT_SAMPLES (skipped
// otherwise). Run on each release that bumps a format; see test/fixtures/formats/README.md.
import { mkdirSync, writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { parseProject, serializeProject } from '@/model/io';
import { VERSION as RRQ } from '@/model/schema/project';
import { serializeBlock, BLOCK_VERSION } from '@/model/block-file';
import { collectionFile, COLLECTION_VERSION } from '@/model/collection-file';
import { serializeLibrary } from '@/model/library-file';
import { LIBRARY_VERSION } from '@/model/schema/library';
import { emptyPersonal } from '@/model/library';
import { builtinItems } from '@/content/starter';
import { defaults, toConf, VERSION as CONF } from '@/settings/settings';
import { fixtureText } from '../model/helpers';

const dir = process.env.FORMAT_SAMPLES;
const app = 'samples';

it.skipIf(!dir)('write format samples', async () => {
  mkdirSync(dir!, { recursive: true });
  const put = (name: string, text: string) => writeFileSync(`${dir}/${name}`, text);

  const parsed = await parseProject(fixtureText());
  if (!parsed.ok) throw new Error(parsed.error);
  const doc = parsed.doc;
  put(`project-v${RRQ}.rrq`, serializeProject(doc));

  // A few starter blocks (a shaped one too, where the format has them) and a palette.
  const items = builtinItems();
  const blocks = [
    ...items.blocks.slice(0, 3),
    ...items.blocks.filter((b) => (b as { shape?: string }).shape).slice(0, 1),
  ];
  const palette = items.colors;
  const last = blocks[blocks.length - 1]!;
  put(`block-v${BLOCK_VERSION}.rrqbl`, serializeBlock(last, 'in', palette, 'Sample Author'));

  // A project palette holds color ids; a palette file holds the colors themselves.
  const { id, notecard } = doc.project.palette.collections![0]!;
  const collection = { id, notecard, colors: palette.slice(0, 8) };
  put(`palette-v${COLLECTION_VERSION}.rrqplt`, JSON.stringify(collectionFile(collection, app)));

  const mine = emptyPersonal('sample-author');
  mine.items = [
    ...blocks.map((data) => ({ type: 'block' as const, data })),
    { type: 'colors' as const, data: collection },
  ];
  put(`library-v${LIBRARY_VERSION}.rrqlib`, serializeLibrary(mine, app));

  put(`settings-v${CONF}.rrqconf`, JSON.stringify(toConf(defaults(), app)));
});
