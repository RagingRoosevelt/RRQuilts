// .rrqlib files (spec 002, amended by spec 011): read untrusted library documents item by item,
// write backups (My library + installed packs) and packs (license-checked).
import type { TSchema } from 'typebox';
import Value from 'typebox/value';
import { authorOf, noSharing, priorCredits, requiredLicense } from './credits';
import { blockIds } from './ids';
import {
  LIBRARY_FORMAT,
  LIBRARY_VERSION,
  LibraryEnvelope,
  LibraryItem,
  type BackupConnection,
  type LibraryBackup,
  type LibraryDoc,
} from './schema/library';
import type { Socials } from './schema/shared';

export type LibraryParse =
  { ok: true; doc: LibraryBackup; skipped: string[] } | { ok: false; error: string };

type Raw = Record<string, unknown>;
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const fail = (error: string) => ({ ok: false as const, error });

function firstError(schema: TSchema, v: unknown) {
  let best: { instancePath: string; message: string } | undefined;
  for (const e of Value.Errors(schema, v))
    if (!best || e.instancePath.split('/').length > best.instancePath.split('/').length) best = e;
  return best ? `${best.instancePath || '/'}: ${best.message}` : 'invalid';
}

const itemName = (x: unknown, i: number) => {
  const name = isObject(x) && isObject(x.data) && isObject(x.data.notecard) && x.data.notecard.name;
  return typeof name === 'string' && name ? `“${name}”` : `Item ${i + 1}`;
};

/** Library sizes are kept in inches (as built-in ones), so adding to a project converts once. */
const inInches = (item: LibraryItem, k: number): LibraryItem =>
  item.type === 'block' && k !== 1
    ? { ...item, data: { ...item.data, size: [item.data.size[0] * k, item.data.size[1] * k] } }
    : item;

/** Validate a parsed document: the envelope must hold; bad items are skipped and listed. */
export function parseLibraryValue(raw: unknown, nested = false): LibraryParse {
  if (!isObject(raw) || raw.format !== LIBRARY_FORMAT) return fail('Not an RRQuilts library file.');
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version) || raw.version < 1)
    return fail('Library file has an invalid version.');
  if (raw.version > LIBRARY_VERSION)
    return fail('This library is from a newer RRQuilts. Update the app to open it.');
  if (!Value.Check(LibraryEnvelope, raw))
    return fail(`Library file is damaged: ${firstError(LibraryEnvelope, raw)}`);
  if (raw.kind === 'pack' && (!raw.author?.name || !raw.license))
    return fail('This pack has no author or license, so it can’t be used.');
  if ((raw.kind === 'pack' || nested) && raw.packs?.length)
    return fail('Library file is damaged: only a backup can hold packs.');

  const { items: rawItems, packs: rawPacks = [], ...head } = raw;
  const k = raw.units === 'cm' ? 1 / 2.54 : 1;
  // Two levels: a parent that's missing or itself a subcategory is dropped.
  const tops = new Set(raw.categories.filter((c) => !c.parent).map((c) => c.id));
  const cats = raw.categories.map(({ parent, ...c }) =>
    parent && parent !== c.id && tops.has(parent) ? { ...c, parent } : c,
  );
  const categories = new Set(cats.map((c) => c.id));
  const skipped: string[] = [];
  const items: LibraryItem[] = [];
  const ids = new Set<string>();
  rawItems.forEach((x, i) => {
    const name = itemName(x, i);
    if (!Value.Check(LibraryItem, x)) {
      skipped.push(`${name}: ${firstError(LibraryItem, x)}`);
      return;
    }
    const inner = x.type === 'block' ? blockIds(x.data) : x.data.colors.map((c) => c.id);
    if (ids.has(x.data.id)) skipped.push(`${name}: another item has the same id`);
    else if (new Set(inner).size !== inner.length) skipped.push(`${name}: duplicate ids inside`);
    else {
      ids.add(x.data.id);
      const { category, ...rest } = x;
      items.push(inInches(category && categories.has(category) ? x : rest, k));
    }
  });

  const packs: LibraryDoc[] = [];
  rawPacks.forEach((p, i) => {
    const r = parseLibraryValue(p, true);
    const label = isObject(p) && typeof p.name === 'string' ? `Pack “${p.name}”` : `Pack ${i + 1}`;
    if (!r.ok) skipped.push(`${label}: ${r.error}`);
    else if (r.doc.kind !== 'pack') skipped.push(`${label}: not a pack`);
    else {
      packs.push(r.doc);
      skipped.push(...r.skipped.map((s) => `${label} · ${s}`));
    }
  });

  const doc: LibraryBackup = {
    ...head,
    categories: cats,
    units: 'in',
    items,
    ...(packs.length ? { packs } : {}),
  };
  return { ok: true, doc, skipped };
}

export function parseLibrary(text: string): LibraryParse {
  try {
    return parseLibraryValue(JSON.parse(text));
  } catch {
    return fail('Not a library file (not valid JSON).');
  }
}

export const serializeLibrary = (doc: LibraryBackup, app: string) =>
  JSON.stringify({ ...doc, format: LIBRARY_FORMAT, version: LIBRARY_VERSION, app });

/** One backup of everything in Libraries (repository links join with spec 012). */
export function backupDoc(
  mine: LibraryDoc,
  packs: LibraryDoc[],
  include: { mine: boolean; packs: boolean },
  web: { connections: BackupConnection[]; packsOff: string[] } = { connections: [], packsOff: [] },
): LibraryBackup {
  // Packs from web libraries travel as their connection (re-downloaded on restore), not copies.
  const fromWeb = new Set(web.connections.flatMap((c) => c.packs));
  const copies = packs.filter((p) => !fromWeb.has(p.id));
  const backedUp = new Set([...copies.map((p) => p.id), ...fromWeb]);
  const off = web.packsOff.filter((id) => backedUp.has(id));
  return {
    ...mine,
    ...(include.mine ? {} : { items: [], categories: [] }),
    ...(include.packs && copies.length ? { packs: copies } : {}),
    ...(include.packs && web.connections.length ? { connections: web.connections } : {}),
    ...(include.packs && off.length ? { packsOff: off } : {}),
  };
}

export interface PackMeta {
  name: string;
  description?: string;
  author: string;
  socials?: Socials;
  license: string;
}

/**
 * My library as a pack. Items by someone else that are all rights reserved stay out; the pack
 * license is at least as strict as its items require; everyone credited is listed.
 */
export function packDoc(mine: LibraryDoc, me: string, meta: PackMeta) {
  const excluded: string[] = [];
  const items = mine.items.filter((i) => {
    const theirs = (authorOf(i.data) ?? '') !== me;
    const keep = !(theirs && noSharing(i.data.license));
    if (!keep) excluded.push(i.data.notecard.name);
    return keep;
  });
  const sources = items.flatMap((i) => [
    { ...(i.data.license ? { license: i.data.license } : {}), name: i.data.notecard.name },
    ...priorCredits(i.data),
  ]);
  const lock = requiredLicense([{ license: meta.license, name: meta.name }, ...sources]);
  const credits = [
    ...new Map(
      items
        .flatMap((i) => [
          ...priorCredits(i.data),
          ...((authorOf(i.data) ?? '') !== me
            ? [{ name: i.data.notecard.name, author: authorOf(i.data), license: i.data.license }]
            : []),
        ])
        .map((c) => {
          const credit = {
            name: c.name ?? 'Earlier work',
            ...(c.author ? { author: c.author } : {}),
            ...(c.license ? { license: c.license } : {}),
          };
          return [JSON.stringify(credit), credit] as const;
        }),
    ).values(),
  ];
  const doc: LibraryDoc = {
    format: LIBRARY_FORMAT,
    version: LIBRARY_VERSION,
    units: 'in',
    kind: 'pack',
    id: `${mine.id}-pack`,
    revision: 1,
    name: meta.name,
    ...(meta.description ? { description: meta.description } : {}),
    author: {
      name: meta.author || 'anonymous',
      ...(meta.socials?.length ? { socials: meta.socials } : {}),
    },
    license: lock && lock.license !== meta.license ? lock.license : meta.license,
    changelog: [],
    ...(credits.length ? { credits } : {}),
    // Used categories, and the parents of used subcategories.
    categories: mine.categories.filter((c) =>
      items.some(
        (i) =>
          i.category === c.id ||
          mine.categories.some((s) => s.id === i.category && s.parent === c.id),
      ),
    ),
    items,
  };
  return { doc, excluded, lock: lock?.license === meta.license ? undefined : lock };
}

/**
 * Restore a backup. My library: `replace` takes the backup's; `merge` keeps the current one and adds
 * the backup's items and categories it lacks (same item: the higher revision wins). Packs: same id
 * already installed → `keep` it unless the choice says `replace`.
 */
export function restore(
  current: { mine: LibraryDoc; packs: LibraryDoc[] },
  backup: LibraryBackup,
  choice: { mine: 'merge' | 'replace'; packs: Record<string, 'keep' | 'replace'> },
) {
  const { packs: backupPacks = [], ...backupMine } = backup;
  let mine = current.mine;
  if (choice.mine === 'replace') mine = backupMine;
  else {
    const byId = new Map(mine.items.map((i) => [i.data.id, i]));
    for (const i of backupMine.items) {
      const have = byId.get(i.data.id);
      if (!have || (i.data.revision ?? 1) > (have.data.revision ?? 1)) byId.set(i.data.id, i);
    }
    const cats = new Map(mine.categories.map((c) => [c.id, c]));
    for (const c of backupMine.categories) if (!cats.has(c.id)) cats.set(c.id, c);
    mine = { ...mine, items: [...byId.values()], categories: [...cats.values()] };
  }
  const packs = new Map(current.packs.map((p) => [p.id, p]));
  for (const p of backupPacks)
    if (!packs.has(p.id) || choice.packs[p.id] === 'replace') packs.set(p.id, p);
  return { mine, packs: [...packs.values()] };
}
