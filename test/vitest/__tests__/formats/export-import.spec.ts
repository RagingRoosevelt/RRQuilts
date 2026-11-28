// Export, then import, keeps everything (owner, 2026-11-25: "add a test for exporting and
// importing the various files from the app … to make sure that the various aspects of content
// survive export and import"). Each file the app writes (a project, one quilt, .rrqbl, .rrqepp,
// .rrqplt, .rrqlib, .rrqconf) is written and read back as the app does it, on another device (an
// empty image store), into a fresh project or library: every item arrives unchanged, fabric images
// included, and each quilt, block and rosette shows the same pieces in the same colors, in every
// colorway and coloring. The projects: the demos, the v12 format demo and the everything fixture,
// each given what rrq v13 added and an own fabric with an image.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { readFileSync } from 'node:fs';
import { castDraft, produce } from 'immer';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { builtinDoc, builtinItems, builtinLibrary } from '@/content/starter';
import { blockFile, fabricIdsOf, parseBlockFile, importBlock } from '@/model/block-file';
import { fillKey } from '@/model/coloring';
import { collectionFile, importPaletteFile, parseCollectionFile } from '@/model/collection-file';
import { addColorway, setSwap, shownColorway, startRecolor, swapper } from '@/model/colorways';
import { effectiveLicense } from '@/model/credits';
import { eppFile, importEpp, parseEppFile, serializeEpp } from '@/model/epp-file';
import { lookupEpp, rosetteLeaves } from '@/model/epp/expand';
import { eppQuiltPieces } from '@/model/epp/print';
import { addPiece, newEppQuilt } from '@/model/epp/quilt-ops';
import { addColoring } from '@/model/epp/rosette-ops';
import { quiltProject } from '@/model/export-quilt';
import { importProjectQuilts } from '@/model/import-quilts';
import { parseProject, serializeProject } from '@/model/io';
import { prettyJson } from '@/model/json';
import {
  addBlock,
  addEpp,
  emptyPersonal,
  lookupOf,
  saveCollection,
  withSources,
  type LibraryView,
} from '@/model/library';
import { backupDoc, packDoc, parseLibrary, restore, serializeLibrary } from '@/model/library-file';
import { isLibraryItem, syncDraft, type LibraryLookup } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { PLAIN_BLOCK } from '@/model/plain';
import { generateFor, spanSpaces } from '@/model/layout/slots';
import { takeBack } from '@/model/data-quilt';
import { spanIndex, spanOf } from '@/model/layout/spans';
import { blockPieces, quiltPieces } from '@/model/print/pieces';
import type { Block } from '@/model/schema/block';
import type { Fill } from '@/model/schema/coloring';
import type { Rosette } from '@/model/schema/epp';
import type { LibraryDoc } from '@/model/schema/library';
import type { Fabric } from '@/model/schema/palette';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { defaults, parseConf, toConf } from '@/settings/settings';
import { absorbFabrics, absorbImages, embedFabrics, prepareForSave } from '@/storage/fabric-files';
import { resetIdb } from '@/storage/idb';
import { getImage, putImage } from '@/storage/images';
import { readLibraryZip, writeLibraryZip } from '@/storage/library-zip';

const SOURCES = [
  'public/demo/block-quilts.rrq',
  'public/demo/temperature.rrq',
  'public/demo/traditional-epp.rrq',
  'public/demo/3d-epp.rrq',
  'test/fixtures/formats/demo-v12.rrq',
  'test/fixtures/everything.rrq',
];
const APP = 'test';
const ME = 'tester';
/** The app's default save size for fabric images. */
const SAVE_SIZE = 512;
const LIBRARY_COLORS = builtinItems().colors;

/** The built-in library, as the app always has it. */
let builtin: LibraryView;
let lib: LibraryLookup;
beforeAll(async () => {
  const doc = builtinDoc(await builtinLibrary());
  builtin = { doc, ...withSources(doc) };
  lib = lookupOf([builtin]);
});
/** Another device: nothing in the image store. */
function newDevice() {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
}
beforeEach(newDevice);

/** A project to export: opened as the app opens a file, given what rrq v13 added and an own
 *  fabric (its image in this device's store), then synced as every edit is. */
async function source(path: string): Promise<RrqDoc> {
  const r = await parseProject(readFileSync(path, 'utf8'));
  if (!r.ok) throw new Error(`${path}: ${r.error}`);
  const doc = withV13(await absorbImages(r.doc), await ownFabric());
  return produce(doc, (d) => void syncDraft(d, lib));
}

async function ownFabric(): Promise<Fabric> {
  const meta = { type: 'image/webp', width: 256, height: 256 };
  const sha256 = await putImage(new Uint8Array([7, 3, 1, 9, 4]), meta);
  return {
    id: 'tester.own-fabric',
    notecard: { name: 'Own fabric' },
    image: { sha256, ...meta },
    size: [8, 8],
    average: [140, 70, 40],
    sizes: [{ px: 256, sha256, ...meta }],
  };
}

/**
 * Where the project has room for them: colorways in every mode (one following another, an auto
 * mapping, a re-color) on the first plain block quilt, a Manual cut with an aspect ratio on EPP
 * quilts, rosette colorings that follow another, and spanning blocks (inside a quilt, at an
 * On-Point edge, and a data block); the own fabric used in each.
 */
function withV13(doc0: RrqDoc, fabric: Fabric): RrqDoc {
  const doc = structuredClone(doc0);
  const p = doc.project;
  p.palette.fabrics.push(fabric);
  const colors = p.palette.colors.map((c) => c.id);
  const color = (i: number): Fill => ({ color: colors[i % colors.length]! });
  const own: Fill = { fabric: fabric.id, offset: [0, 0], rotation: 0 };
  let colorways = false;
  p.quilts = p.quilts.map((q) => {
    const l = q.layout;
    if (l.style === 'epp')
      return l.edge.kind === 'cut'
        ? { ...q, layout: { ...l, edge: { ...l.edge, manual: true, ratio: [4, 3] } } }
        : q;
    if (colorways || q.data?.on || q.colorways?.length) return q;
    const keys = [...new Set(quiltPieces(doc, q).map((x) => x.fill))].filter((k) =>
      k.startsWith('color:'),
    );
    if (keys.length < 2) return q;
    colorways = true;
    let v = setSwap(addColorway(q, 'cwswap', 'Swapped'), 'cwswap', keys[0]!, own);
    v = addColorway(v, 'cwfollow', 'Follows');
    v = addColorway(v, 'cwauto', 'Auto');
    v = startRecolor(addColorway(v, 'cwpaint', 'Painted'), 'cwpaint', p.blocks);
    v = structuredClone(v);
    for (const w of v.colorways!) {
      if (w.id === 'cwfollow')
        Object.assign(w, { source: 'cwswap', swaps: [{ from: keys[1]!, to: color(3) }] });
      if (w.id === 'cwauto')
        Object.assign(w, { source: 'cwswap', auto: { palette: 'rrquilts.basic-colors' } });
      const painted = w.recolor && Object.values(w.recolor.colorings)[0];
      const patch = painted && Object.keys(painted.fills)[0];
      if (patch) painted.fills[patch] = color(5);
    }
    return { ...v, shownColorway: 'cwfollow' };
  });
  // v14 (spec 057): a block spanning 2 × 2 spaces in the first quilt with room for one.
  for (const q of p.quilts) {
    if (q.data?.on) continue;
    const ix = spanIndex(generateFor(q).slots);
    const sp = Object.keys(q.layers[0].slots)
      .map((id) => ix.byId.get(id))
      .map((at) => at && spanOf(ix, at, 2))
      .find((x) => x);
    if (!sp) continue;
    for (const id of sp.covers) if (id !== sp.at) delete q.layers[0].slots[id];
    q.layers[0].slots[sp.at]!.span = 2;
    break;
  }
  // …one at the quilt's edge: On-Point setting triangles taken in (held, then cut to the edge)…
  for (const q of p.quilts) {
    if (q.data?.on || q.layout.style !== 'on-point' || q.layout.edge.finish !== 'exact') continue;
    const content = Object.values(q.layers[0].slots).find(
      (c) => c.block !== PLAIN_BLOCK && !c.span,
    );
    const ix = spanIndex(spanSpaces(q), generateFor(q).center);
    const taken = new Set((generateFor(q).spans ?? []).flatMap((x) => x.covers));
    const sp = ix.slots
      .filter((s) => s.id.startsWith('set:'))
      .map((s) => spanOf(ix, s, 2))
      .find((x) => x && !x.covers.some((id) => taken.has(id)));
    if (!sp || !content) continue;
    for (const id of sp.covers) delete q.layers[0].slots[id];
    q.layers[0].slots[sp.at] = { ...content, span: 2 };
    break;
  }
  // …and a data block over 2 × 2 spaces, holding one number: the others give theirs back.
  for (const q of p.quilts) {
    const plan = q.data;
    if (!plan?.on) continue;
    const ix = spanIndex(generateFor(q).slots, generateFor(q).center);
    const sp = plan.places
      .map((x) => ix.byId.get(x.space))
      .map((at) => at && spanOf(ix, at, 2))
      .find((x) => x);
    if (!sp) continue;
    const others = sp.cells.filter((id) => id !== sp.at);
    q.data = others.reduce((pl, id) => takeBack(pl, id), plan);
    for (const id of others) delete q.layers[0].slots[id];
    q.layers[0].slots[sp.at]!.span = 2;
    break;
  }
  if (p.rosettes)
    p.rosettes = p.rosettes.map((r) => {
      const base = r.colorings[0];
      const key = base && Object.values(base.fills).map(fillKey)[0];
      if (isLibraryItem(r) || !key) return r;
      const a = addColoring(r, undefined, {
        name: 'Follows',
        source: base.id,
        swaps: [{ from: key, to: own }],
      });
      const b = addColoring(a.rosette, undefined, {
        name: 'Auto',
        source: a.id,
        auto: { palette: 'rrquilts.basic-colors' },
      });
      return b.rosette;
    });
  // An own block painted with the fabric (a .rrqbl carries its image).
  const block = shownBlocks(doc).find((b) => !isLibraryItem(b));
  const patch = block && Object.keys(block.colorings[0]?.fills ?? {})[0];
  if (patch) block.colorings[0]!.fills[patch] = own;
  return doc;
}

/** A file read back as the app opens it: parsed, its fabric images stored on this device. */
async function reopen(text: string): Promise<RrqDoc> {
  const r = await parseProject(text);
  if (!r.ok) throw new Error(r.error);
  expect(r.report).toEqual([]);
  return absorbImages(r.doc);
}

const round = (v: number) => Math.round(v * 1e6) / 1e6 || 0;
/** Pieces as they show: outline, and the color (name and RGB) or fabric (name and image). */
function shown(
  doc: RrqDoc,
  pieces: readonly { poly: readonly (readonly number[])[]; fill: string }[],
  l: LibraryLookup = lib,
) {
  const p = doc.project;
  const what = (key: string) => {
    const id = key.slice(key.indexOf(':') + 1);
    if (key.startsWith('color:')) {
      const c = p.palette.colors.find((x) => x.id === id) ?? l.color(id);
      return c ? `${c.notecard.name} ${c.rgb.join(',')}` : `missing ${key}`;
    }
    if (key.startsWith('fabric:')) {
      const f = p.palette.fabrics.find((x) => x.id === id) ?? l.fabric?.(id);
      return f ? `${f.notecard.name} ${f.image.sha256}` : `missing ${key}`;
    }
    return key;
  };
  return pieces.map((x) => ({ poly: x.poly.map((pt) => pt.map(round)), fill: what(x.fill) }));
}

/** Every piece of a quilt as it shows, in each colorway. */
function quiltLook(doc: RrqDoc, q: Quilt, l: LibraryLookup = lib) {
  return [undefined, ...(q.colorways ?? []).map((c) => c.id)].map((id) => {
    const { shownColorway: _s, ...rest } = q;
    void _s;
    const v: Quilt = id ? { ...rest, shownColorway: id } : rest;
    const pieces =
      v.layout.style === 'epp'
        ? eppQuiltPieces(
            v,
            lookupEpp(doc.project, v.epp?.shapes ?? [], l),
            swapper(shownColorway(v)),
          ).pieces
        : quiltPieces(doc, v);
    return shown(doc, pieces, l);
  });
}

/** An EPP quilt with rosette `r` placed once in each of its colorings. */
function eppQuiltWith(r: Rosette): Quilt {
  let q = newEppQuilt('Placed', 'in');
  r.colorings.forEach((c, i) => {
    q = addPiece(q, { rosette: r.id, coloring: c.id, at: [i * 20, 0], turn: 0, scale: 1 }).quilt;
  });
  return q;
}

const blockLook = (doc: RrqDoc, b: Block) =>
  b.colorings.map((c) => shown(doc, blockPieces(b, b.size, c)));

function rosetteLook(doc: RrqDoc, id: string) {
  const r = doc.project.rosettes?.find((x) => x.id === id);
  if (!r) return undefined;
  const look = lookupEpp(doc.project, [], lib);
  return r.colorings.map((c) =>
    shown(
      doc,
      rosetteLeaves(r, look, c.id).map((l) => ({ poly: l.poly, fill: fillKey(l.fill) })),
    ),
  );
}

/** What changes when an item becomes the importer's own: its credits and library link, and the
 *  tags (the quilter's own filing, never shared, spec 029). */
function content<T extends { notecard: { tags?: string[] } }>(x: T) {
  const {
    source: _s,
    author: _a,
    license: _l,
    credits: _c,
    ...rest
  } = x as T & {
    source?: unknown;
    author?: unknown;
    license?: unknown;
    credits?: unknown;
  };
  const { tags: _t, ...notecard } = x.notecard;
  void [_s, _a, _l, _c, _t];
  return { ...rest, notecard };
}
/** Blocks a quilter sees and can export (not the hidden plain, rosette and data variant ones). */
const shownBlocks = (doc: RrqDoc) =>
  doc.project.blocks.filter(
    (b) => b.id !== PLAIN_BLOCK && !b.rosette && !b.notecard.tags?.includes('system'),
  );

/** Every own fabric's image is in this device's store. */
async function expectImages(doc: RrqDoc) {
  for (const f of doc.project.palette.fabrics.filter((x) => !isLibraryItem(x)))
    expect(await getImage(f.image.sha256), `${f.notecard.name}'s image`).toBeDefined();
}

it('the projects carry what rrq v13 and v14 added', async () => {
  const docs = await Promise.all(SOURCES.map(source));
  const quilts = docs.flatMap((d) => d.project.quilts);
  const colorways = quilts.flatMap((q) => q.colorways ?? []);
  expect(colorways.some((c) => c.recolor)).toBe(true);
  expect(colorways.some((c) => c.source && c.auto)).toBe(true);
  expect(colorways.some((c) => c.source && !c.auto && c.swaps.length)).toBe(true);
  const edges = quilts.flatMap((q) => (q.layout.style === 'epp' ? [q.layout.edge] : []));
  expect(edges.some((e) => e.kind === 'cut' && e.manual && e.ratio)).toBe(true);
  const colorings = docs.flatMap((d) => d.project.rosettes ?? []).flatMap((r) => r.colorings);
  expect(colorings.some((c) => c.source && c.auto)).toBe(true);
  expect(colorings.some((c) => c.source && c.swaps?.length)).toBe(true);
  // v14 (spec 057): spanning blocks, merged into their quilts' spaces: inside a quilt, at an
  // On-Point edge over setting triangles, and a data block.
  const spanned = quilts.filter((q) => Object.values(q.layers[0].slots).some((c) => c.span));
  expect(spanned.length).toBeGreaterThan(0);
  const stored = (q: Quilt) => Object.values(q.layers[0].slots).filter((c) => c.span).length;
  expect(spanned.every((q) => generateFor(q).spans?.length === stored(q))).toBe(true);
  const spans = spanned.flatMap((q) => generateFor(q).spans!.map((x) => ({ q, x })));
  expect(spans.some(({ x }) => x.at.startsWith('set:'))).toBe(true);
  expect(
    spans.some(({ q, x }) => q.data?.on && q.data.places.some((pl) => pl.space === x.at)),
  ).toBe(true);
});

describe.each(SOURCES)('export and import: %s', (path) => {
  it('project file: saved, opened on another device, the same project', async () => {
    const doc = await source(path);
    const text = serializeProject(await prepareForSave(doc, SAVE_SIZE));
    newDevice();
    const back = await reopen(text);
    expect(back).toEqual(doc);
    await expectImages(back);
  });

  it('each quilt exported, imported into another project: the same quilt, pieces and colors', async () => {
    const doc = await source(path);
    const files = await Promise.all(
      doc.project.quilts.map(async (q) => {
        const out = quiltProject(doc, q.id, 'exported')!;
        return { q, out, text: serializeProject(await prepareForSave(out, SAVE_SIZE)) };
      }),
    );
    newDevice();
    for (const { q, out, text } of files) {
      const from = await reopen(text);
      const res = importProjectQuilts(createProject('Here', doc.units), from, ME, [q.id]);
      const here = produce(res.doc, (d) => void syncDraft(d, lib));
      const got = here.project.quilts[0]!;
      expect(got, q.notecard.name).toEqual(q);
      expect(quiltLook(here, got), q.notecard.name).toEqual(quiltLook(doc, q));
      // Everything the file carries arrives as it was.
      const p = here.project;
      for (const [list, items] of [
        [p.blocks, out.project.blocks],
        [p.palette.colors, out.project.palette.colors],
        [p.palette.fabrics, out.project.palette.fabrics],
        [p.palette.threads, out.project.palette.threads],
        [p.eppShapes ?? [], out.project.eppShapes ?? []],
        [p.rosettes ?? [], out.project.rosettes ?? []],
      ] as const)
        for (const x of items)
          expect(
            (list as readonly { id: string }[]).find((y) => y.id === x.id),
            `${q.notecard.name}: ${x.id}`,
          ).toEqual(x);
      await expectImages(here);
    }
  });

  it('each block as a block file, imported into another project: the same drawing and colors', async () => {
    const doc = await source(path);
    const blocks = shownBlocks(doc);
    const palette = [...doc.project.palette.colors, ...LIBRARY_COLORS];
    // As Sketchbook's Export: the license it shows, the fabrics it uses with their images.
    const files = await Promise.all(
      blocks.map(async (b) => {
        const used = fabricIdsOf(b);
        const fabrics = await embedFabrics(
          doc.project.palette.fabrics.filter((f) => used.has(f.id)),
          SAVE_SIZE,
        );
        const stamped = { ...b, license: effectiveLicense(b, doc) };
        return prettyJson(blockFile(stamped, doc.units, palette, ME, [], fabrics));
      }),
    );
    newDevice();
    for (const [i, b] of blocks.entries()) {
      const r = parseBlockFile(files[i]!);
      if (!r.ok) throw new Error(`${b.notecard.name}: ${r.error}`);
      const file = r.file.fabrics
        ? { ...r.file, fabrics: await absorbFabrics(r.file.fabrics) }
        : r.file;
      const res = importBlock(createProject('Here', doc.units), file, ME);
      const got = res.doc.project.blocks.find((x) => x.id === res.blockId)!;
      expect(content(got), b.notecard.name).toEqual(content(b));
      expect(blockLook(res.doc, got), b.notecard.name).toEqual(blockLook(doc, b));
      await expectImages(res.doc);
    }
  });

  it('each EPP shape and rosette as an .rrqepp file, imported into another project: the same', async () => {
    const doc = await source(path);
    const items = [...(doc.project.eppShapes ?? []), ...(doc.project.rosettes ?? [])];
    // As the EPP tab's Export: its fabrics with their images.
    const files = await Promise.all(
      items.map(async (x) => {
        const f = eppFile(
          doc,
          x.id,
          {
            shape: (id) => lib.eppShape?.(id),
            color: (id) => lib.color(id),
            fabric: (id) => lib.fabric?.(id),
          },
          APP,
        );
        if (!f) throw new Error(`no file for ${x.notecard.name}`);
        const fabrics = f.fabrics && (await embedFabrics(f.fabrics, SAVE_SIZE));
        return serializeEpp(fabrics ? { ...f, fabrics } : f);
      }),
    );
    newDevice();
    for (const [i, x] of items.entries()) {
      const r = parseEppFile(files[i]!);
      if (!r.ok) throw new Error(`${x.notecard.name}: ${r.error}`);
      const file = r.file.fabrics
        ? { ...r.file, fabrics: await absorbFabrics(r.file.fabrics) }
        : r.file;
      const res = importEpp(createProject('Here', doc.units), file, ME);
      const here = produce(res.doc, (d) => void syncDraft(d, lib));
      const p = here.project;
      const got = [...(p.eppShapes ?? []), ...(p.rosettes ?? [])].find((y) => y.id === res.id)!;
      expect(content(got), x.notecard.name).toEqual(content(x));
      expect(rosetteLook(here, x.id), x.notecard.name).toEqual(rosetteLook(doc, x.id));
      await expectImages(here);
    }
  });

  it('each palette as a palette file, imported into another project: the same colors and fabrics', async () => {
    const doc = await source(path);
    const p = doc.project;
    const palettes = (p.palette.collections ?? []).filter(
      (c) => c.colors.length + c.fabrics.length,
    );
    // As Sketchbook's Export: the palette's colors and fabrics, fabric images embedded.
    const files = await Promise.all(
      palettes.map(async (pp) => {
        const colors = pp.colors.map((id) => p.palette.colors.find((c) => c.id === id)!);
        const fabrics = pp.fabrics.map((id) => p.palette.fabrics.find((f) => f.id === id)!);
        const c = { id: pp.id, notecard: pp.notecard, colors, fabrics };
        const out = { ...c, fabrics: await embedFabrics(fabrics, SAVE_SIZE) };
        return { c, text: prettyJson(collectionFile(out, APP)) };
      }),
    );
    newDevice();
    for (const { c, text } of files) {
      const r = parseCollectionFile(text);
      if (!r.ok) throw new Error(`${c.notecard.name}: ${r.error}`);
      const fabrics = await absorbFabrics(r.file.collection.fabrics ?? []);
      const res = importPaletteFile(
        createProject('Here', doc.units),
        r.file.collection,
        fabrics,
        'pal',
      );
      const q = res!.doc.project;
      const pal = q.palette.collections!.find((x) => x.id === 'pal')!;
      expect(pal.notecard.name).toBe(c.notecard.name);
      expect(pal.colors).toEqual(c.colors.map((x) => x.id));
      expect(pal.fabrics).toEqual(c.fabrics.map((x) => x.id));
      expect(q.palette.colors.map(content)).toEqual(c.colors.map(content));
      expect(q.palette.fabrics.map(content)).toEqual(c.fabrics.map(content));
      await expectImages(res!.doc);
    }
  });

  it('My library with its items, as a backup (plain and zipped with images) and a pack: the same items', async () => {
    const doc0 = await source(path);
    let mine: LibraryDoc = emptyPersonal(ME);
    let doc = doc0;
    const p = doc0.project;
    for (const b of shownBlocks(doc0).filter((x) => !isLibraryItem(x)))
      ({ lib: mine, doc } = await addBlock(mine, doc, b.id));
    for (const x of [...(p.eppShapes ?? []), ...(p.rosettes ?? [])].filter(
      (y) => !isLibraryItem(y),
    ))
      ({ lib: mine, doc } = await addEpp(mine, doc, x.id));
    for (const pp of p.palette.collections ?? [])
      if (pp.colors.length)
        ({ lib: mine, doc } = await saveCollection(mine, doc, pp.notecard.name, pp.colors, ME));
    if (!mine.items.length) return;

    const backup = backupDoc(mine, [], { mine: true, packs: true });
    const text = serializeLibrary(backup, APP);
    const zip = await writeLibraryZip(backup, (d) => serializeLibrary(d, APP));
    const pack = packDoc(mine, ME, { name: 'Pack', author: ME, license: 'CC-BY-4.0' }).doc;
    const packText = serializeLibrary(pack, APP);
    newDevice();

    const r = parseLibrary(text);
    if (!r.ok) throw new Error(r.error);
    expect(r.skipped).toEqual([]);
    const back = restore({ mine: emptyPersonal(ME), packs: [] }, r.doc, {
      mine: 'replace',
      packs: {},
    });
    expect(back.mine.items).toEqual(mine.items);
    expect(back.mine.categories).toEqual(mine.categories);
    // Its rosettes, placed from the library in another project, show their colors.
    const fromLib = lookupOf([builtin, { doc: back.mine, ...withSources(back.mine) }]);
    for (const r of (p.rosettes ?? []).filter((x) => !isLibraryItem(x))) {
      const here = produce(createProject('Here', doc0.units), (d) => {
        d.project.quilts.push(castDraft(eppQuiltWith(r)));
        syncDraft(d, fromLib);
      });
      const q = here.project.quilts[0]!;
      const fills = quiltLook(here, q, fromLib)[0]!.map((x) => x.fill);
      expect(fills.length, r.notecard.name).toBeGreaterThan(0);
      expect(
        fills.filter((f) => f.startsWith('missing')),
        r.notecard.name,
      ).toEqual([]);
    }

    // With an own fabric on a block, the backup is a zip carrying the image.
    if (zip) {
      const z = await readLibraryZip(zip);
      expect(z.skipped).toEqual([]);
      // Sizes keep the zip's path to their image: no change to what shows.
      const unzipped = JSON.parse(JSON.stringify(z.backup?.items), (k, v: unknown) =>
        k === 'path' && typeof v === 'string' ? undefined : v,
      ) as unknown;
      expect(unzipped).toEqual(mine.items);
      for (const i of z.backup?.items ?? [])
        for (const f of 'fabrics' in i ? (i.fabrics ?? []) : [])
          expect(await getImage(f.image.sha256), f.notecard.name).toBeDefined();
    }

    const rp = parseLibrary(packText);
    if (!rp.ok) throw new Error(rp.error);
    expect(rp.skipped).toEqual([]);
    expect(rp.doc.items).toEqual(pack.items);
    expect(rp.doc.items.map((i) => i.data.id)).toEqual(mine.items.map((i) => i.data.id));
  });
});

it('settings file: exported and imported, the same settings', () => {
  const s = defaults();
  s.units = 'cm';
  s.theme = 'dark';
  s.author = 'Tester';
  s.eppCutSnap = { vertex: false, edge: true };
  const r = parseConf(JSON.stringify(toConf(s, APP)));
  if (!r.ok) throw new Error(r.error);
  expect(r.settings).toEqual(s);
});
