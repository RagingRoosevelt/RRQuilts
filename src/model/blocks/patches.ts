import type { Block, Patch } from '../schema/block';

/** Every patch of a block in drawing order (bottom first), whatever its kind. */
export function allPatches(block: Block): Patch[] {
  if (block.kind === 'combo') {
    const a = block.applique;
    return [...block.pieced.patches, ...(a.background ? [a.background] : []), ...a.patches];
  }
  if (block.kind === 'applique') return [block.background, ...block.patches];
  return block.patches;
}
