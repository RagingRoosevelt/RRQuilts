// A data quilt's data blocks (spec 025, 046): the data blocks of a kind, from the project and
// libraries, and the brush: the one picked to place, with its series map.
import { computed } from 'vue';
import { blockLetters, takesKind } from '@/model/data-quilt';
import type { Block, DataKind } from '@/model/schema/block';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

/** A block's series map when it's picked: a single-value block reads qA, a several-value one its
 *  own letters. */
export function defaultSeries(b: Block): (number | null)[] {
  const letters = blockLetters(b);
  const out: (number | null)[] = [null, null, null, null];
  for (const l of letters) out[l] = letters.length === 1 ? 0 : l;
  return out;
}

export function useDataTypes() {
  const project = useProjectStore();
  const library = useLibraryStore();
  const editor = useEditorStore();
  const all = computed(() => {
    const seen = new Set<string>();
    return [...(project.doc?.project.blocks ?? []), ...library.items.blocks].filter((b) => {
      if (!b.data || b.data.of || seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  });
  /** Blocks that can show a number of this kind (a single day: day blocks, and week or month
   *  blocks with a 1-day variant). */
  const ofKind = (k: DataKind): Block[] => all.value.filter((b) => takesKind(b, k));
  const block = (id: string | undefined) => all.value.find((b) => b.id === id);
  /** The picked block, when it is still there. */
  const picked = computed(() => {
    const p = editor.dataPick;
    const b = p ? block(p.id) : undefined;
    return p && b ? { block: b, kind: p.kind } : undefined;
  });
  function pick(b: Block, kind: DataKind) {
    editor.dataPick = { id: b.id, kind };
    editor.dataSeries = defaultSeries(b);
  }
  /** The block placed for a kind when filling numbers: the picked one when it takes it, else the
   *  first that does. */
  const typeFor = (k: DataKind): string | undefined => {
    const p = picked.value;
    return p && takesKind(p.block, k) ? p.block.id : ofKind(k)[0]?.id;
  };
  return { ofKind, typeFor, block, picked, pick };
}
