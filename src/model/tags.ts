// Tags and techniques (spec 029). Tags are the quilter's own words: on items they own they're part
// of the item; on others' (built-in, packs) they're kept in My library by item id (`annotations`).
// The tag list is never stored: it's whatever tags are in use.
import type { Technique } from './schema/shared';

/** The app's own tags (the hidden plain block): never shown, offered, or filtered on. */
export const INTERNAL_TAGS = new Set(['system']);

type Raw = Record<string, unknown>;
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Upgrade (raw JSON, any format): every notecard's free-text `styles` (the quilter's own words, before
 * spec 029) become tags on the same item. Leaves data without styles as it is, so it's safe to run
 * on anything, any number of times.
 */
export function stylesToTags<T>(raw: T): T {
  if (Array.isArray(raw)) return raw.map(stylesToTags) as T;
  if (!isObject(raw)) return raw;
  const out: Raw = {};
  for (const [k, v] of Object.entries(raw)) out[k] = stylesToTags(v);
  const n = out.notecard;
  if (isObject(n) && 'styles' in n) {
    const { styles, ...rest } = n;
    const tags = cleanTags([
      ...(Array.isArray(rest.tags) ? rest.tags : []),
      ...(Array.isArray(styles) ? styles : []),
    ]);
    out.notecard = { ...rest, ...(tags.length ? { tags } : {}) };
  }
  return out as T;
}

/**
 * Tags as kept: trimmed, empty ones dropped, one of each ignoring case. A tag matching one in `known`
 * (ignoring case) takes that spelling, so "christmas" joins an existing "Christmas".
 */
export function cleanTags(tags: readonly unknown[], known: Iterable<string> = []): string[] {
  const spelling = new Map<string, string>();
  for (const k of known) spelling.set(k.toLowerCase(), k);
  const out = new Map<string, string>();
  for (const t of tags) {
    if (typeof t !== 'string') continue;
    const v = t.trim();
    if (!v || out.has(v.toLowerCase())) continue;
    out.set(v.toLowerCase(), spelling.get(v.toLowerCase()) ?? v);
  }
  return [...out.values()];
}

/** The item without the quilter's tags (spec 029: shared packs and block files leave them out). */
export function withoutTags<T extends { notecard: { tags?: string[] | undefined } }>(x: T): T {
  if (!x.notecard.tags) return x;
  const { tags: _drop, ...notecard } = x.notecard;
  void _drop;
  return { ...x, notecard };
}

/** Tags a quilter sees and filters on (internal ones left out). */
export const visibleTags = (tags: readonly string[] | undefined) =>
  (tags ?? []).filter((t) => !INTERNAL_TAGS.has(t));

/** What the Tags dialog edits. */
export interface TagTarget {
  name: string;
  tags: readonly string[];
  techniques: readonly Technique[];
  /** The quilter's own block: its technique can be changed (it's the author's). */
  editTechniques: boolean;
}

export type Annotations = readonly { id: string; tags: readonly string[] }[];

/**
 * The quilter's tags on an item: its own notecard tags (items they own, and any a pack came with),
 * plus those kept in My library for it by id (`ids`: the item's id, and its library source's).
 */
export function tagsFor(
  notecardTags: readonly string[] | undefined,
  ids: readonly (string | undefined)[],
  kept: ReadonlyMap<string, readonly string[]>,
): string[] {
  return cleanTags([
    ...visibleTags(notecardTags),
    ...ids.flatMap((id) => (id ? (kept.get(id) ?? []) : [])),
  ]);
}

/** My library's kept tags as a lookup. */
export const keptTags = (annotations: Annotations | undefined) =>
  new Map((annotations ?? []).map((a) => [a.id, a.tags]));

/** Kept tags with one item's set replaced (none: its entry removed). */
export function setKept(
  annotations: Annotations | undefined,
  id: string,
  tags: readonly string[],
): { id: string; tags: string[] }[] {
  const rest = (annotations ?? [])
    .filter((a) => a.id !== id)
    .map((a) => ({ ...a, tags: [...a.tags] }));
  return tags.length ? [...rest, { id, tags: [...tags] }] : rest;
}
