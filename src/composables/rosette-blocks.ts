// Rosettes in block quilts (spec 027 FR-015): every rosette (the project's, then the libraries')
// whose outline is exactly a block space shape, as the hidden block that places it.
import { computed } from 'vue';
import { rosetteBlock } from '@/model/epp/as-block';
import { lookupEpp } from '@/model/epp/expand';
import type { Block } from '@/model/schema/block';
import type { Rosette } from '@/model/schema/epp';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

// Unchanged rosettes stay the same object (Immer), so their block (and its thumbnail) is reused.
const made = new WeakMap<Rosette, Block | null>();

export function useRosetteBlocks() {
  const project = useProjectStore();
  const library = useLibraryStore();
  const blocks = computed<Block[]>(() => {
    const p = project.doc?.project;
    if (!p) return [];
    const lookup = lookupEpp(p, [], library.lookup);
    const seen = new Set<string>();
    return [...(p.rosettes ?? []), ...library.items.rosettes].flatMap((r) => {
      if (seen.has(r.id)) return [];
      seen.add(r.id);
      if (!made.has(r)) made.set(r, rosetteBlock(r, lookup));
      const b = made.get(r);
      return b ? [b] : [];
    });
  });
  return { blocks, block: (id: string) => blocks.value.find((b) => b.id === id) };
}
