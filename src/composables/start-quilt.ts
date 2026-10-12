import { useRouter } from 'vue-router';
import { DEFAULT_LICENSE } from '@/model/credits';
import { createQuilt } from '@/model/new-quilt';
import type { Border, Layout } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

/** Add a quilt (to a new project when `fresh` or none is open) and open it in Design mode. */
export function useStartQuilt() {
  const router = useRouter();
  const project = useProjectStore();
  const editor = useEditorStore();
  return async (layout: Layout, borders: Border[], fresh = false) => {
    if (fresh || !project.isOpen) await project.newProject();
    const n = project.doc!.project.quilts.length + 1;
    const author = useSettingsStore().settings.author;
    const quilt = {
      ...createQuilt(`Quilt ${n}`, layout, borders),
      ...(author ? { author } : {}),
      license: project.doc!.project.license ?? DEFAULT_LICENSE,
    };
    project.change((d) => void d.project.quilts.push(quilt));
    editor.mode = 'design';
    editor.tool = 'set';
    editor.block =
      project.doc!.project.blocks.find((b) => !b.notecard.tags?.includes('system'))?.id ??
      useLibraryStore().items.blocks[0]?.id ??
      null;
    await router.push(`/project/quilt/${quilt.id}`);
  };
}
