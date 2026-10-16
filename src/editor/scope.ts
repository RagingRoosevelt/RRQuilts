// What a tap applies to: This (one space), All, or Alternate (spaces of the same alternate class).
import type { Slot } from '@/model/layout/slots';
import { slotGroup } from '@/model/plain';
import type { Quilt } from '@/model/schema/quilt';

export type Scope = 'this' | 'all' | 'alternate';
export type Space = Pick<Slot, 'id' | 'alt'>;

/** Spaces of the same kind as `tapped` (block spaces, sashes, cornerstones, one border). */
function sameKind(spaces: readonly Space[], tapped: string) {
  const g = slotGroup(tapped);
  return spaces.filter((s) => slotGroup(s.id) === g);
}

const altOf = (spaces: readonly Space[], id: string) => spaces.find((s) => s.id === id)?.alt;

/** `kind` narrowed by scope; ids out. */
function scoped(kind: readonly Space[], spaces: readonly Space[], tapped: string, scope: Scope) {
  const alt = altOf(spaces, tapped);
  return (scope === 'all' ? kind : kind.filter((s) => s.alt === alt)).map((s) => s.id);
}

/** Targets for setting a block: block spaces regardless of what's in them. */
export function setTargets(spaces: readonly Space[], tapped: string, scope: Scope): string[] {
  if (scope === 'this') return [tapped];
  return scoped(sameKind(spaces, tapped), spaces, tapped, scope);
}

/**
 * Targets for editing what's placed (color, rotate, flip, erase): in block spaces, placements of the
 * same block; in sashes/cornerstones/borders, every piece of that kind.
 */
export function placementTargets(
  quilt: Quilt,
  spaces: readonly Space[],
  tapped: string,
  scope: Scope,
): string[] {
  if (scope === 'this') return [tapped];
  const slots = quilt.layers[0].slots;
  let kind = sameKind(spaces, tapped);
  if (slotGroup(tapped) === 'block') {
    const block = slots[tapped]?.block;
    kind = kind.filter((s) => slots[s.id] && slots[s.id]!.block === block);
  }
  return scoped(kind, spaces, tapped, scope);
}

/** Filled spaces for spray: all, or those in the tapped space's alternate class. */
export function sprayTargets(
  quilt: Quilt,
  spaces: readonly Space[],
  tapped: string,
  scope: Scope,
): string[] {
  if (scope === 'this') return [tapped];
  const filled = spaces.filter((s) => quilt.layers[0].slots[s.id]);
  return scoped(filled, spaces, tapped, scope);
}
