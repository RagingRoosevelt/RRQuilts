// Quilts from another project (.rrq) into this one, with the blocks, colors, fabrics and threads
// they use. Items already here are reused; an own block with the same id but another design comes
// in as a copy, and the quilts point at the copy.
import { produce, type Draft } from 'immer';
import { canonicalContent, itemId, stableStringify } from './identity';
import { isLibraryItem } from './library-items';
import { variationName } from './new-quilt';
import { newId } from './ids';
import type { RrqDoc } from './schema/project';
import { convertUnits } from './units';

/** Every string anywhere inside `v` (ids are found wherever they're referenced). */
function strings(v: unknown, out: Set<string>): Set<string> {
  if (typeof v === 'string') out.add(v);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) strings(x, out);
  return out;
}

/** A copy of `v` with each string found in `map` replaced. */
function remap<T>(v: T, map: ReadonlyMap<string, string>): T {
  if (typeof v === 'string') return (map.get(v) ?? v) as T;
  if (Array.isArray(v)) return v.map((x) => remap(x, map)) as T;
  if (v && typeof v === 'object')
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, remap(x, map)])) as T;
  return v;
}

const LISTS = ['colors', 'fabrics', 'threads'] as const;

/** Import the chosen quilts (`ids`) of another (parsed) project. `me`: author for copied blocks. */
export function importProjectQuilts(
  doc: RrqDoc,
  from0: RrqDoc,
  me: string,
  ids: Iterable<string>,
): { doc: RrqDoc; added: number } {
  const from = from0.units === doc.units ? from0 : convertUnits(from0, doc.units);
  const chosen = new Set(ids);
  const quilts = from.project.quilts.filter((q) => chosen.has(q.id));
  if (!quilts.length) return { doc, added: 0 };

  // What the quilts use, and what that uses in turn (blocks' colorings name colors and fabrics).
  const pool = new Map<string, unknown>([
    ...from.project.blocks.map((b) => [b.id, b] as const),
    ...LISTS.flatMap((k) => from.project.palette[k].map((x) => [x.id, x] as const)),
  ]);
  const need = new Set<string>();
  const queue = [...strings(quilts, new Set())];
  while (queue.length) {
    const s = queue.pop()!;
    if (need.has(s) || !pool.has(s)) continue;
    need.add(s);
    queue.push(...strings(pool.get(s), new Set()));
  }

  const same = (a: object, b: object) =>
    stableStringify(canonicalContent(a, doc.units)) ===
    stableStringify(canonicalContent(b, doc.units));
  const map = new Map<string, string>();
  const next = produce(doc, (d) => {
    const p = d.project;
    for (const k of LISTS) {
      const have = new Set(p.palette[k].map((x) => x.id));
      // ponytail: same id = same item (ids are random per item); a recolored twin isn't detected.
      for (const x of from.project.palette[k])
        if (need.has(x.id) && !have.has(x.id)) (p.palette[k] as unknown[]).push(structuredClone(x));
    }
    for (const b of from.project.blocks) {
      if (!need.has(b.id)) continue;
      const here = p.blocks.find((x) => x.id === b.id);
      if (!here) {
        p.blocks.push(structuredClone(b));
        continue;
      }
      // Library blocks and the plain block: the copy here is used (library sync keeps it current).
      if (isLibraryItem(here) || here.notecard.tags?.includes('system') || same(here, b)) continue;
      const copy = structuredClone(b) as Draft<typeof b>;
      copy.id = itemId(me);
      copy.notecard.name = variationName(
        b.notecard.name,
        p.blocks.map((x) => x.notecard.name),
      );
      delete copy.version;
      delete copy.revision;
      // A library block's twin under a new id is the quilter's own, as an edited copy is.
      if (copy.source) copy.source.derived = true;
      map.set(b.id, copy.id);
      p.blocks.push(copy);
    }
    for (const q of quilts) {
      const copy = remap(structuredClone(q), map);
      if (p.quilts.some((x) => x.id === copy.id)) copy.id = newId();
      if (p.quilts.some((x) => x.notecard.name === copy.notecard.name))
        copy.notecard.name = variationName(
          copy.notecard.name,
          p.quilts.map((x) => x.notecard.name),
        );
      p.quilts.push(copy);
    }
  });
  return { doc: next, added: quilts.length };
}
