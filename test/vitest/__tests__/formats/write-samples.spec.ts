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
import { eppFile, serializeEpp, EPP_VERSION } from '@/model/epp-file';
import { eppStarters } from '@/content/epp';
import { addEppV12, domino, sampleFlower } from './epp-v12';
import { addV13 } from './v13';
import { starterKit } from '@/dev/fill-quilt';

const dir = process.env.FORMAT_SAMPLES;
const app = 'samples';

it.skipIf(!dir)('write format samples', async () => {
  mkdirSync(dir!, { recursive: true });
  const put = (name: string, text: string) => writeFileSync(`${dir}/${name}`, text);

  const parsed = await parseProject(fixtureText());
  if (!parsed.ok) throw new Error(parsed.error);
  // v12 (specs 027, 050): EPP shapes, rosettes, EPP and 3D EPP quilts, rosettes as blocks; v13
  // (0.9.3): colorways in every mode, an EPP quilt cut by hand, followed rosette colorings.
  const doc = addV13(addEppV12(parsed.doc), await starterKit());
  const flower = doc.project.rosettes!.find((r) => r.id === sampleFlower().id)!;
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
    // v8: EPP shapes and rosettes (a rosette carries the library shapes it uses).
    { type: 'epp-shape' as const, data: domino },
    {
      type: 'rosette' as const,
      data: flower,
      shapes: eppStarters().shapes.filter((s) => s.id === 'rrquilts.epp-hexagon'),
    },
  ];
  put(`library-v${LIBRARY_VERSION}.rrqlib`, serializeLibrary(mine, app));

  put(`settings-v${CONF}.rrqconf`, JSON.stringify(toConf(defaults(), app)));

  // One rosette as its own file (.rrqepp; v2: its colorings that follow another): its shapes and
  // colors go with it.
  const hexagon = eppStarters().shapes.find((s) => s.id === 'rrquilts.epp-hexagon');
  const file = eppFile(
    doc,
    sampleFlower().id,
    {
      shape: (id) => (id === hexagon?.id ? hexagon : undefined),
      color: (id) => items.colors.find((c) => c.id === id),
      fabric: () => undefined,
    },
    app,
  );
  if (!file) throw new Error('no .rrqepp for the sample rosette');
  put(`epp-v${EPP_VERSION}.rrqepp`, serializeEpp(file));
});
