// What a tap applies to: This (one space), All, or Alternate (spaces of the same alternate class).
import type { BlockShape } from '@/model/blocks/shape';
import type { Slot } from '@/model/layout/slots';
import { slotGroup } from '@/model/plain';
import type { Quilt } from '@/model/schema/quilt';

export type Scope = 'this' | 'all' | 'alternate';
export type Space = Pick<Slot, 'id' | 'alt'> & Partial<Pick<Slot, 'kind' | 'size' | 'shape'>>;

const SHAPED = new Set(['triangle', 'diamond60', 'hexagon', 'clamshell', 'spool']);

/**
 * Whether a block may be set here: block spaces, setting pieces (the block is trimmed there), and
 * square cornerstones (the strips on both sides the same width). Sashing and borders take fabric.
 * A shaped space takes only blocks of its shape, and a shaped block only those spaces (spec 026);
 * with no `shape` given, any block that fits.
 */
export const takesBlock = (s: Space, shape?: BlockShape | null) => {
  const kindOk =
    s.kind === 'cs'
      ? !!s.size && Math.abs(s.size[0] - s.size[1]) < 1e-9 * Math.max(1, ...s.size)
      : s.kind === undefined || s.kind === 'block' || s.kind === 'set';
  if (!kindOk || shape === undefined) return kindOk;
  return shape ? s.shape === shape : !SHAPED.has(s.shape ?? 'rect');
};

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

/** Targets for setting a block (`shape`: the block's, null for square): spaces that take it. */
export function setTargets(
  spaces: readonly Space[],
  tapped: string,
  scope: Scope,
  shape: BlockShape | null = null,
): string[] {
  const here = spaces.find((s) => s.id === tapped);
  if (here && !takesBlock(here, shape)) return [];
  if (scope === 'this') return [tapped];
  const fits = sameKind(spaces, tapped).filter((s) => takesBlock(s, shape));
  return scoped(fits, spaces, tapped, scope);
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
