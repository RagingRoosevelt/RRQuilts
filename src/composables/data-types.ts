// A data quilt's block types (spec 025): data blocks of a kind, from the project and libraries, and
// the one picked to place for each kind (else the first).
import { computed } from 'vue';
import { takesKind } from '@/model/data-quilt';
import type { Block, DataKind } from '@/model/schema/block';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

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
  const ofKindOnly = (k: DataKind): Block[] => all.value.filter((b) => b.data!.kind === k);
  const typeFor = (k: DataKind): string | undefined => {
    const list = ofKind(k);
    const pick = (id: string | null) => (list.some((b) => b.id === id) ? id! : undefined);
    // A day with none picked: the week or month type in use, when it has a 1-day variant.
    const inUse = (o: DataKind) => {
      const l = ofKindOnly(o);
      return l.some((b) => b.id === editor.dataType[o]) ? editor.dataType[o] : l[0]?.id;
    };
    return (
      pick(editor.dataType[k]) ??
      (k === 'day' ? (pick(inUse('week') ?? null) ?? pick(inUse('month') ?? null)) : undefined) ??
      list[0]?.id
    );
  };
  const block = (id: string | undefined) => all.value.find((b) => b.id === id);
  return { ofKind, typeFor, block };
}
