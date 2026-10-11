// Coloring blocks placed in a quilt. Placements reference entries in the quilt's coloring table;
// edits copy an entry first when it's shared with placements outside the edit (copy-on-write).
import { newId } from './ids';
import type { Fill } from './schema/coloring';
import type { Quilt } from './schema/quilt';

export type Scope = 'this' | 'allIdentical' | 'alternate';

const SLOT_RC = /^b:r(\d+)c(\d+)$/;

/** Layer-1 slots the edit applies to. `alternate` = same block, same checkerboard parity. */
function targets(quilt: Quilt, slotId: string, scope: Scope): string[] {
  const slots = quilt.layers[0].slots;
  const origin = slots[slotId];
  if (!origin) throw new Error(`No block in slot ${slotId}.`);
  if (scope === 'this') return [slotId];
  const same = Object.keys(slots).filter((id) => slots[id]!.block === origin.block);
  if (scope === 'allIdentical') return same;
  const parity = (id: string) => {
    const m = SLOT_RC.exec(id);
    return m ? (Number(m[1]) + Number(m[2])) % 2 : -1;
  };
  const p = parity(slotId);
  return same.filter((id) => parity(id) === p);
}

/**
 * Set (or clear, with `fill` undefined) one patch's fill for the targeted placements.
 * Returns an updated copy of the quilt.
 */
export function paint(
  quilt: Quilt,
  slotId: string,
  patchId: string,
  fill: Fill | undefined,
  scope: Scope = 'this',
): Quilt {
  const q = structuredClone(quilt);
  const slots = q.layers[0].slots;
  const chosen = new Set(targets(q, slotId, scope));

  // Colorings also used by placements outside the edit get a private copy for the targets.
  const usedOutside = new Set<string>();
  for (const [id, s] of Object.entries(slots)) if (!chosen.has(id)) usedOutside.add(s.coloring);
  for (const item of q.layers.flatMap((l) => l.items))
    if (item.coloring) usedOutside.add(item.coloring);

  const copies = new Map<string, string>();
  for (const id of chosen) {
    const s = slots[id]!;
    if (usedOutside.has(s.coloring)) {
      let copy = copies.get(s.coloring);
      if (!copy) {
        do copy = newId();
        while (copy in q.colorings);
        q.colorings[copy] = structuredClone(q.colorings[s.coloring] ?? { fills: {} });
        copies.set(s.coloring, copy);
      }
      s.coloring = copy;
    }
  }

  for (const coloringId of new Set([...chosen].map((id) => slots[id]!.coloring))) {
    const c = (q.colorings[coloringId] ??= { fills: {} });
    if (fill) c.fills[patchId] = fill;
    else delete c.fills[patchId];
  }
  return removeUnusedColorings(q);
}

/** Drop coloring-table entries no placement references (in place; returns the quilt). */
export function removeUnusedColorings(q: Quilt): Quilt {
  const used = new Set<string>(Object.values(q.layers[0].slots).map((s) => s.coloring));
  for (const item of q.layers.flatMap((l) => l.items)) if (item.coloring) used.add(item.coloring);
  for (const id of Object.keys(q.colorings)) if (!used.has(id)) delete q.colorings[id];
  return q;
}
