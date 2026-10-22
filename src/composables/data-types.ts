// A data quilt's block types (spec 025): data blocks of a kind, from the project and libraries, and
// the one picked to place for each kind (else the first).
import { computed } from 'vue';
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
  const ofKind = (k: DataKind): Block[] => all.value.filter((b) => b.data!.kind === k);
  const typeFor = (k: DataKind): string | undefined => {
    const list = ofKind(k);
    const id = editor.dataType[k];
    return list.some((b) => b.id === id) ? id! : list[0]?.id;
  };
  const block = (id: string | undefined) => all.value.find((b) => b.id === id);
  return { ofKind, typeFor, block };
}
