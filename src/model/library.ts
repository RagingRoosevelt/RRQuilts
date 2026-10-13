// Libraries (spec 011), framework-free: My library edits, linked copies, lookup over every library.
// Library content is in inches; items get their `source` when looked up, not in storage.
import { produce } from 'immer';
import { canonicalContent, contentVersion, itemId, stableStringify } from './identity';
import { creditCopy, settleCredits } from './credits';
import type { LibraryLookup } from './library-items';
import type { Block } from './schema/block';
import {
  LIBRARY_FORMAT,
  LIBRARY_VERSION,
  type Category,
  type ColorCollection,
  type LibraryDoc,
  type LibraryItem,
} from './schema/library';
import type { Color } from './schema/palette';
import type { RrqDoc, Units } from './schema/project';

export const MY_LIBRARY = 'My library';

export function emptyPersonal(me: string): LibraryDoc {
  return {
    format: LIBRARY_FORMAT,
    version: LIBRARY_VERSION,
    units: 'in',
    kind: 'personal',
    id: itemId(me),
    revision: 1,
    name: MY_LIBRARY,
    categories: [],
    items: [],
  };
}

const toInches = (b: Block, units: Units): Block =>
  units === 'cm' ? { ...b, size: [b.size[0] / 2.54, b.size[1] / 2.54] } : b;

/** A project item as library content: credits settled, no project `source`, current version. */
async function asLibraryData<T extends Block | Color | ColorCollection>(
  item: T,
  revision: number,
): Promise<T> {
  const clean = produce(item, (d) => {
    settleCredits(d);
    if (!d.credits?.length) delete d.credits;
    delete d.source;
    d.revision = revision;
  });
  const version = await contentVersion(clean, 'in');
  return produce(clean, (d) => void (d.version = version));
}

/** How a project item refers to the library item it is a linked copy of. */
const link = (lib: LibraryDoc, data: { id: string; version?: string; revision?: number }) => ({
  libraryId: lib.id,
  itemId: data.id,
  revision: data.revision ?? 1,
  ...(data.version ? { version: data.version } : {}),
  library: lib.name,
  derived: true,
});

/**
 * The project's own colors a block uses (library colors are found through their library), plus
 * colors it carried before (`kept`) that it still uses.
 */
async function ownColors(doc: RrqDoc, block: Block, kept: readonly Color[] = []) {
  const used = new Set(
    block.colorings.flatMap((c) =>
      Object.values(c.fills).flatMap((f) => ('color' in f ? [f.color] : [])),
    ),
  );
  const own = doc.project.palette.colors.filter(
    (c) => used.has(c.id) && !(c.source && !c.source.derived),
  );
  const colors = await Promise.all(own.map((c) => asLibraryData(c, c.revision ?? 1)));
  colors.push(...kept.filter((c) => used.has(c.id) && !colors.some((x) => x.id === c.id)));
  return colors.length ? { colors } : {};
}

const findBlock = (lib: LibraryDoc, id: string) =>
  lib.items.find(
    (i): i is Extract<LibraryItem, { type: 'block' }> => i.type === 'block' && i.data.id === id,
  );

// --- Blocks ----------------------------------------------------------------------------------

/**
 * "Add to my library": the library gets the block under the same id; the project's block stays
 * editable, linked to it.
 */
export async function addBlock(
  lib: LibraryDoc,
  doc: RrqDoc,
  blockId: string,
  category?: string,
): Promise<{ lib: LibraryDoc; doc: RrqDoc }> {
  const block = doc.project.blocks.find((b) => b.id === blockId);
  if (!block) return { lib, doc };
  const data = await asLibraryData(toInches(block, doc.units), 1);
  const item: LibraryItem = {
    type: 'block',
    ...(category ? { category } : {}),
    data,
    ...(await ownColors(doc, block)),
  };
  return {
    lib: { ...lib, items: [...lib.items.filter((i) => i.data.id !== data.id), item] },
    doc: produce(doc, (d) => {
      const b = d.project.blocks.find((x) => x.id === blockId)!;
      b.credits ??= []; // credits live in `credits`; a linked `source` isn't an earlier author
      b.source = link(lib, data);
    }),
  };
}

/** The library item a linked copy follows (in My library), if it still exists. */
export const linkedBlock = (lib: LibraryDoc | undefined, b: Block) =>
  lib && b.source?.derived && b.source.libraryId === lib.id
    ? findBlock(lib, b.source.itemId)?.data
    : undefined;

/** 'synced' | 'changed' (offer Sync) | 'gone' (offer Add again) | undefined (not linked). */
export function linkState(lib: LibraryDoc | undefined, b: Block, units: Units) {
  if (!lib || !b.source?.derived || b.source.libraryId !== lib.id) return undefined;
  const l = linkedBlock(lib, b);
  if (!l) return 'gone' as const;
  const same =
    stableStringify(canonicalContent(b, units)) === stableStringify(canonicalContent(l, 'in'));
  return same ? ('synced' as const) : ('changed' as const);
}

/** The library moved on since this copy was made (another project synced first). */
export const syncConflict = (lib: LibraryDoc, b: Block) => {
  const l = linkedBlock(lib, b);
  return !!l && !!b.source?.version && !!l.version && b.source.version !== l.version;
};

/**
 * "Sync to my library": the copy's design becomes the library item's next version (same id and
 * notecard — a copy's "(2)" name stays in the project) and stays linked to it.
 */
export async function syncBlock(
  lib: LibraryDoc,
  doc: RrqDoc,
  blockId: string,
): Promise<{ lib: LibraryDoc; doc: RrqDoc }> {
  const block = doc.project.blocks.find((b) => b.id === blockId);
  const item = block && findBlock(lib, block.source?.itemId ?? '');
  if (!block || !item) return { lib, doc };
  const data = await asLibraryData(
    { ...toInches(block, doc.units), id: item.data.id, notecard: item.data.notecard },
    (item.data.revision ?? 1) + 1,
  );
  const next: LibraryItem = {
    type: 'block',
    ...(item.category ? { category: item.category } : {}),
    data,
    ...(await ownColors(doc, block, item.colors)),
  };
  return {
    lib: { ...lib, items: lib.items.map((i) => (i === item ? next : i)) },
    doc: produce(doc, (d) => {
      const b = d.project.blocks.find((x) => x.id === blockId)!;
      b.credits ??= [];
      b.source = link(lib, data);
    }),
  };
}

// --- Colors ----------------------------------------------------------------------------------

const findCollection = (lib: LibraryDoc, colorId: string) =>
  lib.items.find(
    (i): i is Extract<LibraryItem, { type: 'colors' }> =>
      i.type === 'colors' && i.data.colors.some((c) => c.id === colorId),
  );

const linkColors = (doc: RrqDoc, lib: LibraryDoc, colors: readonly Color[]) =>
  produce(doc, (d) => {
    for (const c of colors) {
      const x = d.project.palette.colors.find((y) => y.id === c.id);
      if (!x) continue;
      x.credits ??= [];
      x.source = link(lib, c);
    }
  });

/** "Save to my library" as a new collection: the chosen project colors become a new collection; they stay linked. */
export async function saveCollection(
  lib: LibraryDoc,
  doc: RrqDoc,
  name: string,
  colorIds: string[],
  me: string,
  category?: string,
) {
  const picked = doc.project.palette.colors.filter((c) => colorIds.includes(c.id));
  const colors = await Promise.all(picked.map((c) => asLibraryData(c, 1)));
  const data = await asLibraryData<ColorCollection>(
    {
      id: itemId(me),
      notecard: { name },
      ...(me ? { author: me } : {}),
      ...(doc.project.license ? { license: doc.project.license } : {}),
      colors,
    },
    1,
  );
  const item: LibraryItem = { type: 'colors', ...(category ? { category } : {}), data };
  return { lib: { ...lib, items: [...lib.items, item] }, doc: linkColors(doc, lib, colors) };
}

async function nextCollection(c: ColorCollection, colors: Color[]) {
  return asLibraryData({ ...c, colors }, (c.revision ?? 1) + 1);
}

/** "Save to my library" into an existing collection: the chosen colors join it (its next version); they stay linked. */
export async function addToCollection(
  lib: LibraryDoc,
  doc: RrqDoc,
  collectionId: string,
  colorIds: string[],
) {
  const item = lib.items.find((i) => i.type === 'colors' && i.data.id === collectionId);
  if (item?.type !== 'colors') return { lib, doc };
  const have = new Set(item.data.colors.map((c) => c.id));
  const added = await Promise.all(
    doc.project.palette.colors
      .filter((c) => colorIds.includes(c.id) && !have.has(c.id))
      .map((c) => asLibraryData(c, 1)),
  );
  const data = await nextCollection(item.data, [...item.data.colors, ...added]);
  return {
    lib: { ...lib, items: lib.items.map((i) => (i === item ? { ...item, data } : i)) },
    doc: linkColors(doc, lib, added),
  };
}

/** A linked color differs from its library color. */
export function colorChanged(lib: LibraryDoc | undefined, c: Color) {
  if (!lib || !c.source?.derived || c.source.libraryId !== lib.id) return false;
  const l = findCollection(lib, c.source.itemId)?.data.colors.find(
    (x) => x.id === c.source!.itemId,
  );
  return !!l && (l.rgb.join() !== c.rgb.join() || l.notecard.name !== c.notecard.name);
}

/** "Sync to my library" for a color: it replaces its library color (the collection's next version). */
export async function syncColor(lib: LibraryDoc, doc: RrqDoc, colorId: string) {
  const color = doc.project.palette.colors.find((c) => c.id === colorId);
  const itemKey = color?.source?.itemId ?? '';
  const item = color && findCollection(lib, itemKey);
  if (!color || !item) return { lib, doc };
  const old = item.data.colors.find((c) => c.id === itemKey)!;
  const next = await asLibraryData({ ...color, id: itemKey }, (old.revision ?? 1) + 1);
  const data = await nextCollection(
    item.data,
    item.data.colors.map((c) => (c.id === itemKey ? next : c)),
  );
  return {
    lib: { ...lib, items: lib.items.map((i) => (i === item ? { ...item, data } : i)) },
    doc: linkColors(doc, lib, [next]),
  };
}

// --- Managing My library ---------------------------------------------------------------------

const mapItem = (lib: LibraryDoc, id: string, fn: (i: LibraryItem) => LibraryItem): LibraryDoc => ({
  ...lib,
  items: lib.items.map((i) => (i.data.id === id ? fn(i) : i)),
});

export const removeItem = (lib: LibraryDoc, id: string): LibraryDoc => ({
  ...lib,
  items: lib.items.filter((i) => i.data.id !== id),
});

/** Name, notes, tags, styles: not part of the content version. */
export const setNotecard = (
  lib: LibraryDoc,
  id: string,
  patch: Partial<LibraryItem['data']['notecard']>,
) =>
  mapItem(lib, id, (i) =>
    produce(i, (d) => {
      Object.assign(d.data.notecard, patch);
      for (const k of ['notes', 'tags', 'styles'] as const) {
        const v = d.data.notecard[k];
        if (v === undefined || v === '' || (Array.isArray(v) && !v.length))
          delete d.data.notecard[k];
      }
    }),
  );

export const setCategory = (lib: LibraryDoc, id: string, category: string | undefined) =>
  mapItem(lib, id, (i) => {
    const next = { ...i };
    if (category) next.category = category;
    else delete next.category;
    return next;
  });

export function addCategory(
  lib: LibraryDoc,
  name: string,
  parent?: string,
): { lib: LibraryDoc; category: Category } {
  const category = { id: itemId(''), name, ...(parent ? { parent } : {}) };
  return { lib: { ...lib, categories: [...lib.categories, category] }, category };
}

/**
 * The category at `path` ("Stars" or "Stars/Eight-point stars"), created when missing (names match
 * case-insensitively; levels past the second are kept in the subcategory's name).
 */
export function ensureCategory(lib: LibraryDoc, path: string): { lib: LibraryDoc; id: string } {
  const [top, ...rest] = path.split('/').map((s) => s.trim());
  const sub = rest.join('/').trim();
  const find = (name: string, parent?: string) =>
    lib.categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && (c.parent ?? '') === (parent ?? ''),
    );
  let parent = find(top!);
  if (!parent) ({ lib, category: parent } = addCategory(lib, top!));
  if (!sub) return { lib, id: parent.id };
  let child = find(sub, parent.id);
  if (!child) ({ lib, category: child } = addCategory(lib, sub, parent.id));
  return { lib, id: child.id };
}

/** Top-level categories, each followed by its subcategories (in the library's order). */
export function categoryTree(cats: readonly Category[]) {
  return cats
    .filter((c) => !c.parent)
    .flatMap((t) => [
      { ...t, depth: 0, label: t.name },
      ...cats
        .filter((c) => c.parent === t.id)
        .map((c) => ({ ...c, depth: 1, label: `${t.name} / ${c.name}` })),
    ]);
}

/** A category and its subcategories (picking a top-level category matches both levels). */
export const withSubcategories = (cats: readonly Category[], ids: readonly string[]) => [
  ...ids,
  ...cats.filter((c) => c.parent && ids.includes(c.parent)).map((c) => c.id),
];
export const renameCategory = (lib: LibraryDoc, id: string, name: string): LibraryDoc => ({
  ...lib,
  categories: lib.categories.map((c) => (c.id === id ? { ...c, name } : c)),
});
/** Its subcategories go too; their items become uncategorized. */
export function deleteCategory(lib: LibraryDoc, id: string): LibraryDoc {
  const gone = withSubcategories(lib.categories, [id]);
  return {
    ...lib,
    categories: lib.categories.filter((c) => !gone.includes(c.id)),
    items: lib.items.map(({ category, ...rest }) =>
      category && !gone.includes(category) ? { ...rest, category } : rest,
    ),
  };
}

/** Collection edits on the Libraries page (rename / reorder / remove colors) → next version. */
export async function setCollectionColors(lib: LibraryDoc, id: string, colors: Color[]) {
  const item = lib.items.find((i) => i.type === 'colors' && i.data.id === id);
  if (item?.type !== 'colors') return lib;
  const data = await nextCollection(item.data, colors);
  return mapItem(lib, id, () => ({ ...item, data }));
}

/** Add or replace (same id) an imported color collection, kept as the file has it (credits too). */
export async function putCollection(lib: LibraryDoc, c: ColorCollection): Promise<LibraryDoc> {
  const colors = await Promise.all(c.colors.map((x) => asLibraryData(x, x.revision ?? 1)));
  const data = await asLibraryData({ ...c, colors }, c.revision ?? 1);
  const item: LibraryItem = { type: 'colors', data };
  return lib.items.some((i) => i.data.id === c.id)
    ? mapItem(lib, c.id, (i) => ({ ...item, ...(i.category ? { category: i.category } : {}) }))
    : { ...lib, items: [...lib.items, item] };
}

/** "Copy to my library" from a pack or built-in: the user's own copy, earlier work credited. */
export async function copyToMine(
  lib: LibraryDoc,
  item: LibraryItem,
  me: string,
  license?: string,
): Promise<LibraryDoc> {
  const fresh = <T extends Block | Color | ColorCollection>(x: T): T =>
    produce(x, (d) => {
      creditCopy(d, me, license);
      d.id = itemId(me);
      delete d.version;
      delete d.revision;
    });
  const data =
    item.type === 'block'
      ? await asLibraryData(fresh(item.data), 1)
      : await asLibraryData(
          {
            ...fresh(item.data),
            colors: await Promise.all(item.data.colors.map((c) => asLibraryData(fresh(c), 1))),
          },
          1,
        );
  const colors = item.type === 'block' && item.colors ? { colors: item.colors } : {};
  const copy = { type: item.type, data, ...colors } as LibraryItem;
  return { ...lib, items: [...lib.items, copy] };
}

// --- Reading libraries -----------------------------------------------------------------------

/** Items as projects see them: library items (read-only) attributed to their library. */
export function withSources(lib: LibraryDoc) {
  const source = (x: { id: string; revision?: number; version?: string; author?: string }) => ({
    libraryId: lib.id,
    itemId: x.id,
    revision: x.revision ?? 1,
    ...(x.version ? { version: x.version } : {}),
    library: lib.name,
    ...(x.author || lib.author?.name ? { author: x.author ?? lib.author!.name } : {}),
    ...(lib.license ? { license: lib.license } : {}),
  });
  const stamp = <T extends Block | Color>(x: T): T =>
    x.source && !x.source.derived && x.source.libraryId === lib.id
      ? x
      : { ...x, source: { ...source(x), name: x.notecard.name } };
  const blocks: Block[] = [];
  const collections: ColorCollection[] = [];
  const blockColors: Color[] = [];
  for (const i of lib.items) {
    if (i.type === 'block') {
      blocks.push(stamp(i.data));
      blockColors.push(...(i.colors ?? []).map(stamp));
    } else collections.push({ ...i.data, colors: i.data.colors.map(stamp) });
  }
  // Collection colors first: they win when a block carries the same color.
  return { blocks, collections, colors: [...collections.flatMap((c) => c.colors), ...blockColors] };
}
export type LibraryView = ReturnType<typeof withSources> & { doc: LibraryDoc };

/** One lookup over every library; earlier libraries win (My library, packs, built-in). */
export function lookupOf(views: readonly LibraryView[]): LibraryLookup {
  const blocks = new Map<string, Block>();
  const colors = new Map<string, Color>();
  for (const v of [...views].reverse()) {
    for (const b of v.blocks) blocks.set(b.id, b);
    for (const c of [...v.colors].reverse()) colors.set(c.id, c);
  }
  return { block: (id) => blocks.get(id), color: (id) => colors.get(id) };
}

/**
 * Library entries in a project's lists, grouped by where they come from: blocks by library, colors
 * by collection (block-only colors by library), in library order.
 */
export function libraryGroups<
  T extends { id: string; source?: { library?: string | undefined } | undefined },
>(items: readonly T[], views: readonly LibraryView[], kind: 'blocks' | 'colors') {
  const label = new Map<string, string>();
  const groups = new Map<string, T[]>();
  for (const v of views) {
    if (kind === 'blocks') {
      groups.set(v.doc.name, []);
      for (const b of v.blocks) if (!label.has(b.id)) label.set(b.id, v.doc.name);
    } else
      for (const c of v.collections) {
        groups.set(c.notecard.name, []);
        for (const x of c.colors) if (!label.has(x.id)) label.set(x.id, c.notecard.name);
      }
  }
  for (const x of items) {
    const l = label.get(x.id) ?? x.source?.library ?? 'Other libraries';
    groups.set(l, [...(groups.get(l) ?? []), x]);
  }
  return [...groups].filter(([, xs]) => xs.length).map(([label, items]) => ({ label, items }));
}

export type GroupBy = 'none' | 'category' | 'tags' | 'styles';
export interface BlockSection {
  /** Unique within the library; a subcategory's is "Parent / Child". */
  key: string;
  label: string;
  blocks: Block[];
  /** Blocks in it, its subcategories' included. */
  count: number;
  /** A subcategory: its top-level category's key. */
  parent?: string;
}

/**
 * A library's blocks in sections: categories in the library's order, each top-level one holding
 * its own blocks then its subcategories (then Uncategorized); or tags/styles A–Z (then None; a
 * block with several shows under each). `none`: one unlabelled section.
 */
export function blockSections(doc: LibraryDoc, blocks: Block[], by: GroupBy): BlockSection[] {
  const sec = (key: string, label: string, bs: Block[], parent?: string): BlockSection => ({
    key,
    label,
    blocks: bs,
    count: bs.length,
    ...(parent ? { parent } : {}),
  });
  if (by === 'none' || !blocks.length) return [sec('', '', blocks)];
  if (by === 'category') {
    const catOf = new Map(doc.items.map((i) => [i.data.id, i.category]));
    const inCat = (id: string) => blocks.filter((b) => catOf.get(b.id) === id);
    const known = new Set(doc.categories.map((c) => c.id));
    const out = doc.categories
      .filter((t) => !t.parent)
      .flatMap((t) => {
        const subs = doc.categories
          .filter((c) => c.parent === t.id)
          .map((c) => sec(`${t.name} / ${c.name}`, c.name, inCat(c.id), t.name))
          .filter((x) => x.count);
        const top = sec(t.name, t.name, inCat(t.id));
        top.count += subs.reduce((n, x) => n + x.count, 0);
        return top.count ? [top, ...subs] : [];
      });
    const none = blocks.filter((b) => !known.has(catOf.get(b.id) ?? ''));
    return none.length ? [...out, sec('Uncategorized', 'Uncategorized', none)] : out;
  }
  const keysOf = (b: Block) => b.notecard[by] ?? [];
  const keys = [...new Set(blocks.flatMap(keysOf))].sort();
  const none = `No ${by}`;
  return [
    ...keys.map((k) =>
      sec(
        k,
        k,
        blocks.filter((b) => keysOf(b).includes(k)),
      ),
    ),
    sec(
      none,
      none,
      blocks.filter((b) => !keysOf(b).length),
    ),
  ].filter((x) => x.count);
}

/** Search names, notes, tags, and styles (all words must match), optionally in one category. */
export function searchItems(items: readonly LibraryItem[], text: string, category?: string) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((i) => {
    if (category !== undefined && (i.category ?? '') !== category) return false;
    if (!words.length) return true;
    const n = i.data.notecard;
    const hay = [n.name, n.notes, ...(n.tags ?? []), ...(n.styles ?? [])].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
