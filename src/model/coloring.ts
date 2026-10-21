// Coloring placements in a quilt. Layer-1 slots reference entries in the quilt's coloring table;
// editing a set of slots first gives them private copies of any coloring also used outside the
// set (copy-on-write), so nothing else changes. Which slots an edit targets (This / All /
// Alternate) is decided by the caller (src/editor/scope.ts).
import { current, isDraft, produce, type Draft } from 'immer';
import { newId } from './ids';
import type { Block } from './schema/block';
import type { ColoringBody, DataPaint, Fill, PlainFill } from './schema/coloring';
import type { RrqDoc } from './schema/project';
import type { Quilt } from './schema/quilt';

/** Block by id (for colorings that follow a block coloring). */
export type BlockOf = (blockId: string) => Block | undefined;

const resolved = new WeakMap<ColoringBody, WeakMap<Block, ColoringBody>>();

/** Effective fills of a quilt coloring: its block coloring (`base`) under its own overrides. */
export function resolveColoring(c: ColoringBody | undefined, block: Block | undefined) {
  if (!c?.base || !block) return c;
  let m = resolved.get(c);
  if (!m) resolved.set(c, (m = new WeakMap()));
  let r = m.get(block);
  if (!r) {
    const base = block.colorings.find((x) => x.id === c.base);
    const fills = { ...base?.fills, ...c.fills };
    for (const p of c.cleared ?? []) delete fills[p];
    r = { fills, ...(c.threads ? { threads: c.threads } : {}) };
    m.set(block, r);
  }
  return r;
}

/** Turn quilt colorings following `coloringId` of `blockId` into plain ones (before deleting it). */
export const detachColoring = (doc: RrqDoc, blockId: string, coloringId: string) => {
  const block = doc.project.blocks.find((b) => b.id === blockId);
  return produce(doc, (d) => {
    for (const q of d.project.quilts) {
      const users = new Set(
        Object.values(q.layers[0].slots).flatMap((s) => (s.block === blockId ? [s.coloring] : [])),
      );
      for (const id of users) {
        const c = q.colorings[id];
        if (c?.base !== coloringId) continue;
        q.colorings[id] = {
          ...resolveColoring(c, block)!,
          fills: { ...resolveColoring(c, block)!.fills },
        };
      }
    }
  });
};

/** Patch ids of a block (to recolor unfilled patches, which have no fill entry). */
export type PatchesOf = (blockId: string) => string[];

/** A data paint's id (spec 025): `data:` + `y` for a year day + the number + `.slot` past A. */
export const dataKey = (p: DataPaint) =>
  `data:${p.year ? 'y' : ''}${p.n}${p.slot ? `.${p.slot}` : ''}`;

export const fillKey = (f: Fill | undefined) =>
  !f
    ? 'none'
    : 'data' in f
      ? dataKey(f.data)
      : 'color' in f
        ? `color:${f.color}`
        : `fabric:${f.fabric}`;

/** The color or fabric a fill shows by itself (a data paint: the one painted under it). */
export const plainFill = (f: Fill | undefined): PlainFill | undefined =>
  f && 'data' in f ? f.under : f;

/** Set a patch's fill as an override; clearing one the base fills records it in `cleared`. */
const setFill = (
  c: Draft<ColoringBody>,
  patchId: string,
  fill: Fill | undefined,
  base: ColoringBody | undefined,
) => {
  const cleared = new Set(c.cleared ?? []);
  if (fill) {
    c.fills[patchId] = fill;
    cleared.delete(patchId);
  } else {
    delete c.fills[patchId];
    if (base?.fills[patchId]) cleared.add(patchId);
  }
  if (cleared.size) c.cleared = [...cleared];
  else delete c.cleared;
};

const baseOf = (c: ColoringBody, block: Block | undefined) =>
  c.base ? block?.colorings.find((x) => x.id === c.base) : undefined;

/** Give `slotIds` private copies of colorings shared outside the set; returns their coloring ids. */
function privatize(q: Draft<Quilt>, slotIds: string[]): Set<string> {
  const slots = q.layers[0].slots;
  const chosen = new Set(slotIds.filter((id) => slots[id]));
  const usedOutside = new Set<string>();
  for (const [id, s] of Object.entries(slots)) if (!chosen.has(id)) usedOutside.add(s.coloring);
  for (const item of q.layers.flatMap((l) => l.items))
    if (item.coloring) usedOutside.add(item.coloring);

  const copies = new Map<string, string>();
  for (const id of chosen) {
    const s = slots[id]!;
    if (!usedOutside.has(s.coloring)) continue;
    let copy = copies.get(s.coloring);
    if (!copy) {
      do copy = newId();
      while (copy in q.colorings);
      const src = q.colorings[s.coloring];
      q.colorings[copy] = src
        ? {
            ...src,
            fills: { ...src.fills },
            ...(src.threads ? { threads: { ...src.threads } } : {}),
            ...(src.cleared ? { cleared: [...src.cleared] } : {}),
          }
        : { fills: {} };
      copies.set(s.coloring, copy);
    }
    s.coloring = copy;
  }
  return new Set([...chosen].map((id) => slots[id]!.coloring));
}

function removeUnused(q: Draft<Quilt>) {
  const used = new Set<string>(Object.values(q.layers[0].slots).map((s) => s.coloring));
  for (const item of q.layers.flatMap((l) => l.items)) if (item.coloring) used.add(item.coloring);
  for (const id of Object.keys(q.colorings)) if (!used.has(id)) delete q.colorings[id];
}

/** Set (or clear) one patch's fill in the given slots. */
export const paint = (
  quilt: Quilt,
  slotIds: string[],
  patchId: string,
  fill: Fill | undefined,
  blockOf: BlockOf = () => undefined,
) =>
  produce(quilt, (q) => {
    const blockOfColoring = new Map(
      Object.values(q.layers[0].slots).map((s) => [s.coloring, s.block]),
    );
    for (const id of privatize(q, slotIds)) {
      const c = (q.colorings[id] ??= { fills: {} });
      setFill(c, patchId, fill, baseOf(c, blockOf(blockOfColoring.get(id) ?? '')));
    }
    removeUnused(q);
  });

/** In the given slots, every patch whose fill matches `match` gets `fill`. */
export const spray = (
  quilt: Quilt,
  slotIds: string[],
  match: Fill | undefined,
  fill: Fill | undefined,
  patchesOf: PatchesOf,
  blockOf: BlockOf = () => undefined,
) =>
  produce(quilt, (q) => {
    const key = fillKey(match);
    const slots = q.layers[0].slots;
    privatize(q, slotIds);
    const done = new Set<string>();
    for (const id of slotIds) {
      const s = slots[id];
      if (!s || done.has(s.coloring)) continue;
      done.add(s.coloring);
      const c = (q.colorings[s.coloring] ??= { fills: {} });
      const block = blockOf(s.block);
      const base = baseOf(c, block);
      const fills = resolveColoring(isDraft(c) ? current(c) : c, block)!.fills;
      for (const p of patchesOf(s.block)) if (fillKey(fills[p]) === key) setFill(c, p, fill, base);
    }
    removeUnused(q);
  });

/** Everywhere in the quilt, every patch whose fill matches `match` gets `fill`. */
export const swap = (
  quilt: Quilt,
  match: Fill | undefined,
  fill: Fill | undefined,
  patchesOf: PatchesOf,
  blockOf?: BlockOf,
) => spray(quilt, Object.keys(quilt.layers[0].slots), match, fill, patchesOf, blockOf);
