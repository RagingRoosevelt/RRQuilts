// Coloring placements in a quilt. Layer-1 slots reference entries in the quilt's coloring table;
// editing a set of slots first gives them private copies of any coloring also used outside the
// set (copy-on-write), so nothing else changes. Which slots an edit targets (This / All /
// Alternate) is decided by the caller (src/editor/scope.ts).
import { produce, type Draft } from 'immer';
import { newId } from './ids';
import type { Fill } from './schema/coloring';
import type { Quilt } from './schema/quilt';

/** Patch ids of a block (to recolor unfilled patches, which have no fill entry). */
export type PatchesOf = (blockId: string) => string[];

export const fillKey = (f: Fill | undefined) =>
  !f ? 'none' : 'color' in f ? `color:${f.color}` : `fabric:${f.fabric}`;

const setFill = (fills: Record<string, Fill>, patchId: string, fill: Fill | undefined) => {
  if (fill) fills[patchId] = fill;
  else delete fills[patchId];
};

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
export const paint = (quilt: Quilt, slotIds: string[], patchId: string, fill: Fill | undefined) =>
  produce(quilt, (q) => {
    for (const c of privatize(q, slotIds))
      setFill((q.colorings[c] ??= { fills: {} }).fills, patchId, fill);
    removeUnused(q);
  });

/** In the given slots, every patch whose fill matches `match` gets `fill`. */
export const spray = (
  quilt: Quilt,
  slotIds: string[],
  match: Fill | undefined,
  fill: Fill | undefined,
  patchesOf: PatchesOf,
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
      const fills = (q.colorings[s.coloring] ??= { fills: {} }).fills;
      for (const p of patchesOf(s.block)) if (fillKey(fills[p]) === key) setFill(fills, p, fill);
    }
    removeUnused(q);
  });

/** Everywhere in the quilt, every patch whose fill matches `match` gets `fill`. */
export const swap = (
  quilt: Quilt,
  match: Fill | undefined,
  fill: Fill | undefined,
  patchesOf: PatchesOf,
) => spray(quilt, Object.keys(quilt.layers[0].slots), match, fill, patchesOf);
