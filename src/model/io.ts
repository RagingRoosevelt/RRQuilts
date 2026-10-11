// Load/save .rrq files. Input is untrusted: parse, migrate, validate, then check integrity.
import Value from 'typebox/value';
import { findDuplicateIds } from './ids';
import type { Asset } from './schema/shared';
import type { ColoringBody } from './schema/coloring';
import { FORMAT, RrqDoc, VERSION } from './schema/project';

type Raw = Record<string, unknown>;
/** `migrations[n]` upgrades a version-n document to version n+1 (raw JSON, before validation). */
export type Migrations = Record<number, (doc: Raw) => Raw>;
// ponytail: empty until v2; the mechanism is exercised by tests.
export const migrations: Migrations = {};

export type ParseResult =
  { ok: true; doc: RrqDoc; report: string[] } | { ok: false; error: string };

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

export function migrate(doc: Raw, table: Migrations = migrations, target = VERSION): Raw {
  let version = doc.version as number;
  while (version < target) {
    const step = table[version];
    if (!step) throw new Error(`No migration from version ${version}.`);
    doc = { ...step(doc), version: version + 1 };
    version++;
  }
  return doc;
}

/** The most specific validation error (deepest path), readable for users and bug reports. */
function firstError(doc: unknown): string {
  let best: { instancePath: string; message: string } | undefined;
  for (const e of Value.Errors(RrqDoc, doc)) {
    if (!best || e.instancePath.split('/').length > best.instancePath.split('/').length) best = e;
  }
  return best ? `${best.instancePath || '/'}: ${best.message}` : 'unknown validation error';
}

export async function parseProject(
  text: string,
  options: { migrations?: Migrations; target?: number } = {},
): Promise<ParseResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not a project file (not valid JSON).' };
  }
  if (!isObject(raw) || raw.format !== FORMAT) {
    return { ok: false, error: 'Not an RRQuilts project file.' };
  }
  const target = options.target ?? VERSION;
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version) || raw.version < 1) {
    return { ok: false, error: 'Project file has an invalid version.' };
  }
  if (raw.version > target) {
    return {
      ok: false,
      error: 'This project is from a newer RRQuilts. Update the app to open it.',
    };
  }
  try {
    raw = migrate(raw, options.migrations, target);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  if (!Value.Check(RrqDoc, raw)) {
    return { ok: false, error: `Project file is damaged: ${firstError(raw)}` };
  }
  const doc = raw;
  const duplicates = findDuplicateIds(doc);
  if (duplicates.length) return { ok: false, error: `Project file is damaged: ${duplicates[0]}` };

  const report = [...danglingReferences(doc), ...(await badAssets(doc))];
  return { ok: true, doc, report };
}

export function serializeProject(doc: RrqDoc): string {
  return JSON.stringify({ ...doc, version: VERSION });
}

/** Missing references don't block loading; they're shown as "missing" and reported once. */
export function danglingReferences(doc: RrqDoc): string[] {
  const p = doc.project;
  const has = (list: { id: string }[]) => new Set(list.map((x) => x.id));
  const fabrics = has(p.palette.fabrics);
  const colors = has(p.palette.colors);
  const threads = has(p.palette.threads);
  const blocks = has(p.blocks);
  const photos = has(p.photos);
  const embroidery = has(p.embroidery);
  const fonts = has(p.fonts);
  const out: string[] = [];

  const checkColoring = (c: ColoringBody, where: string) => {
    for (const fill of Object.values(c.fills)) {
      if ('fabric' in fill && !fabrics.has(fill.fabric))
        out.push(`${where}: missing fabric ${fill.fabric}`);
      if ('color' in fill && !colors.has(fill.color))
        out.push(`${where}: missing color ${fill.color}`);
    }
    for (const t of Object.values(c.threads ?? {})) {
      if (!threads.has(t.thread)) out.push(`${where}: missing thread ${t.thread}`);
    }
  };

  for (const b of p.blocks) for (const c of b.colorings) checkColoring(c, `block ${b.id}`);
  for (const e of p.embroidery) {
    for (const t of e.threads)
      if (!threads.has(t)) out.push(`embroidery ${e.id}: missing thread ${t}`);
  }
  for (const q of p.quilts) {
    const where = `quilt ${q.id}`;
    for (const c of Object.values(q.colorings)) checkColoring(c, where);
    for (const [slot, s] of Object.entries(q.layers[0].slots)) {
      if (!blocks.has(s.block)) out.push(`${where} ${slot}: missing block ${s.block}`);
      if (!(s.coloring in q.colorings))
        out.push(`${where} ${slot}: missing coloring ${s.coloring}`);
    }
    for (const item of q.layers.flatMap((l) => l.items)) {
      const refs =
        item.kind === 'photo' ? photos : item.kind === 'embroidery' ? embroidery : blocks;
      if (item.ref && !refs.has(item.ref))
        out.push(`${where} item ${item.id}: missing ${item.kind} ${item.ref}`);
      if (item.coloring && !(item.coloring in q.colorings)) {
        out.push(`${where} item ${item.id}: missing coloring ${item.coloring}`);
      }
      if (item.text && !fonts.has(item.text.font))
        out.push(`${where} item ${item.id}: missing font ${item.text.font}`);
    }
  }
  return out;
}

export async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function dataUriBytes(data: string): Uint8Array<ArrayBuffer> {
  const bin = atob(data.slice(data.indexOf(',') + 1));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function badAssets(doc: RrqDoc): Promise<string[]> {
  const p = doc.project;
  const assets: [string, Asset][] = [
    ...p.palette.fabrics.map((f): [string, Asset] => [`fabric ${f.id}`, f.image]),
    ...p.photos.map((x): [string, Asset] => [`photo ${x.id}`, x.image]),
    ...p.embroidery.map((x): [string, Asset] => [`embroidery ${x.id}`, x.file]),
    ...p.fonts.flatMap((x): [string, Asset][] => (x.asset ? [[`font ${x.id}`, x.asset]] : [])),
  ];
  const out: string[] = [];
  for (const [where, asset] of assets) {
    try {
      if ((await sha256Hex(dataUriBytes(asset.data))) !== asset.sha256)
        out.push(`${where}: image data is corrupted`);
    } catch {
      out.push(`${where}: image data is unreadable`);
    }
  }
  return out;
}
