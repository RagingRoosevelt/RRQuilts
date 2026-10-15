// Load/save .rrq files. Input is untrusted: parse, migrate, validate, then check integrity.
import Value from 'typebox/value';
import { findDuplicateIds } from './ids';
import type { Asset } from './schema/shared';
import type { ColoringBody } from './schema/coloring';
import { FORMAT, RrqDoc, VERSION } from './schema/project';

type Raw = Record<string, unknown>;
/** `migrations[n]` upgrades a version-n document to version n+1 (raw JSON, before validation). */
export type Migrations = Record<number, (doc: Raw) => Raw>;
export const migrations: Migrations = {
  // v2 (spec 014): fabric image references, fabric sizes, library refs. All additive.
  1: (doc) => doc,
  // v3: project palettes. The project's own colors and fabrics (not from a library) become one.
  2: (doc) => {
    const project = isObject(doc.project) ? doc.project : undefined;
    const palette = project && isObject(project.palette) ? project.palette : undefined;
    if (!palette || palette.collections !== undefined) return doc;
    const own = (xs: unknown) =>
      (Array.isArray(xs) ? xs : []).flatMap((x) =>
        isObject(x) &&
        typeof x.id === 'string' &&
        (!isObject(x.source) || x.source.derived === true)
          ? [x.id]
          : [],
      );
    const colors = own(palette.colors);
    const fabrics = own(palette.fabrics);
    if (!colors.length && !fabrics.length) return doc;
    const collections = [
      { id: 'project-palette', notecard: { name: 'Project palette' }, colors, fabrics },
    ];
    return { ...doc, project: { ...project, palette: { ...palette, collections } } };
  },
  // v4: a project palette may record the My library palette it's synced with. Additive.
  3: (doc) => doc,
};

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
  // crypto.subtle only exists in secure contexts (https/localhost); plain-http LAN testing lacks it.
  if (!globalThis.crypto?.subtle) return sha256HexJs(bytes);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const K = Uint32Array.from(
  '428a2f98 71374491 b5c0fbcf e9b5dba5 3956c25b 59f111f1 923f82a4 ab1c5ed5 d807aa98 12835b01 243185be 550c7dc3 72be5d74 80deb1fe 9bdc06a7 c19bf174 e49b69c1 efbe4786 0fc19dc6 240ca1cc 2de92c6f 4a7484aa 5cb0a9dc 76f988da 983e5152 a831c66d b00327c8 bf597fc7 c6e00bf3 d5a79147 06ca6351 14292967 27b70a85 2e1b2138 4d2c6dfc 53380d13 650a7354 766a0abb 81c2c92e 92722c85 a2bfe8a1 a81a664b c24b8b70 c76c51a3 d192e819 d6990624 f40e3585 106aa070 19a4c116 1e376c08 2748774c 34b0bcb5 391c0cb3 4ed8aa4a 5b9cca4f 682e6ff3 748f82ee 78a5636f 84c87814 8cc70208 90befffa a4506ceb bef9a3f7 c67178f2'
    .split(' ')
    .map((h) => parseInt(h, 16)),
);

/** Plain SHA-256 (FIPS 180-4) for when Web Crypto isn't available. */
export function sha256HexJs(bytes: Uint8Array): string {
  const len = bytes.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(len / 0x20000000));
  view.setUint32(padded.length - 4, len * 8);
  const H = Uint32Array.from([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const W = new Uint32Array(64);
  const rot = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = W[i - 15]!,
        b = W[i - 2]!;
      const s0 = rot(a, 7) ^ rot(a, 18) ^ (a >>> 3);
      const s1 = rot(b, 17) ^ rot(b, 19) ^ (b >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H as unknown as number[];
    for (let i = 0; i < 64; i++) {
      const t1 =
        (h! + (rot(e!, 6) ^ rot(e!, 11) ^ rot(e!, 25)) + ((e! & f!) ^ (~e! & g!)) + K[i]! + W[i]!) |
        0;
      const t2 =
        ((rot(a!, 2) ^ rot(a!, 13) ^ rot(a!, 22)) + ((a! & b!) ^ (a! & c!) ^ (b! & c!))) | 0;
      [h, g, f, e, d, c, b, a] = [g, f, e, (d! + t1) | 0, c, b, a, (t1 + t2) | 0];
    }
    [a, b, c, d, e, f, g, h].forEach((v, i) => (H[i] = (H[i]! + v!) | 0));
  }
  return Array.from(H, (x) => x.toString(16).padStart(8, '0')).join('');
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
    if (!asset.data) continue; // a reference (library fabric image), resolved by hash elsewhere
    try {
      if ((await sha256Hex(dataUriBytes(asset.data))) !== asset.sha256)
        out.push(`${where}: image data is corrupted`);
    } catch {
      out.push(`${where}: image data is unreadable`);
    }
  }
  return out;
}
