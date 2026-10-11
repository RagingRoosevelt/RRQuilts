// Item identity (spec 008): `<author>.<random>` ids, content-hash versions, display revisions.
import { produce } from 'immer';
import { sha256Hex } from './io';
import { newId } from './ids';
import type { Block } from './schema/block';
import type { RrqDoc, Units } from './schema/project';

/** "Jane Doe" → "jane-doe"; empty → "anonymous". */
export function authorSlug(name: string): string {
  const s = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return s || 'anonymous';
}

/** New shareable item id for an author. */
export const itemId = (author: string) => `${authorSlug(author)}.${newId()}`;

/** JSON with object keys sorted, so equal content always hashes the same. */
export function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v);
}

/**
 * The design content a version describes: no names, notes, attribution, or editor settings.
 * Sizes are expressed in inches (rounded to 1e-6) so unit conversion doesn't change the version.
 */
export function canonicalContent(item: object, units: Units = 'in'): unknown {
  const EXCLUDED = ['id', 'notecard', 'source', 'version', 'revision', 'editor', 'unconnected'];
  const rest = Object.fromEntries(
    Object.entries(item as Record<string, unknown>).filter(([k]) => !EXCLUDED.includes(k)),
  );
  if (Array.isArray(rest.size)) {
    const k = units === 'cm' ? 1 / 2.54 : 1;
    rest.size = (rest.size as number[]).map((n) => Math.round(n * k * 1e6) / 1e6);
  }
  if ('colorings' in rest && Array.isArray(rest.colorings)) {
    rest.colorings = (rest.colorings as Block['colorings']).map((c) => ({
      fills: c.fills,
      threads: c.threads,
    }));
  }
  return rest;
}

export async function contentVersion(item: object, units: Units = 'in'): Promise<string> {
  const bytes = new TextEncoder().encode(stableStringify(canonicalContent(item, units)));
  return (await sha256Hex(bytes)).slice(0, 12);
}

const isLibraryItem = (x: { source?: { derived?: boolean } }) => !!x.source && !x.source.derived;

/**
 * Before saving: give the user's own blocks and colors a current `version`, bumping `revision`
 * when the design changed. Library items keep the version they came with.
 */
export async function stampVersions(doc: RrqDoc): Promise<RrqDoc> {
  const p = doc.project;
  const own = [...p.blocks, ...p.palette.colors].filter((x) => !isLibraryItem(x));
  const versions = new Map<string, string>();
  for (const x of own) versions.set(x.id, await contentVersion(x, doc.units));
  return produce(doc, (d) => {
    for (const x of [...d.project.blocks, ...d.project.palette.colors]) {
      const v = versions.get(x.id);
      if (!v || v === x.version) continue;
      x.version = v;
      x.revision = (x.revision ?? 0) + 1;
    }
  });
}
