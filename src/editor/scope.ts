// What a tap applies to: This (one space), All, or Alternate (checkerboard of the same kind).
import { slotGroup } from '@/model/plain';
import type { Quilt } from '@/model/schema/quilt';

export type Scope = 'this' | 'all' | 'alternate';

/** Checkerboard parity from the numbers in a slot id (rows + cols, sash indices, …). */
export const parity = (slotId: string) =>
  (slotId.match(/\d+/g) ?? []).reduce((s, n) => s + Number(n), 0) % 2;

/** Spaces of the same kind as `tapped` (block spaces, sashes, cornerstones, one border). */
function sameKind(slotIds: string[], tapped: string) {
  const g = slotGroup(tapped);
  return slotIds.filter((id) => slotGroup(id) === g);
}

/** Targets for setting a block: block spaces regardless of what's in them. */
export function setTargets(slotIds: string[], tapped: string, scope: Scope): string[] {
  if (scope === 'this') return [tapped];
  const kind = sameKind(slotIds, tapped);
  return scope === 'all' ? kind : kind.filter((id) => parity(id) === parity(tapped));
}

/**
 * Targets for editing what's placed (color, rotate, flip, erase): in block spaces, placements of the
 * same block; in sashes/cornerstones/borders, every piece of that kind.
 */
export function placementTargets(
  quilt: Quilt,
  slotIds: string[],
  tapped: string,
  scope: Scope,
): string[] {
  if (scope === 'this') return [tapped];
  const slots = quilt.layers[0].slots;
  let kind = sameKind(slotIds, tapped);
  if (slotGroup(tapped) === 'block') {
    const block = slots[tapped]?.block;
    kind = kind.filter((id) => slots[id] && slots[id].block === block);
  }
  return scope === 'all' ? kind : kind.filter((id) => parity(id) === parity(tapped));
}
