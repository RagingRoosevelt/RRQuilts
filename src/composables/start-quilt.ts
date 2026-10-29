import { useRouter } from 'vue-router';
import { newDataPlan } from '@/model/data-quilt';
import type { DataPlan } from '@/model/schema/data-quilt';
import { DEFAULT_LICENSE } from '@/model/credits';
import { takesBlock } from '@/editor/scope';
import { generateFor } from '@/model/layout/slots';
import { createQuilt } from '@/model/new-quilt';
import type { Border, Layout, QuiltTarget } from '@/model/schema/quilt';
import { useEditorStore } from '@/stores/editor';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

/** Add a quilt (to a new project when `fresh` or none is open) and open it in Design mode. */
export function useStartQuilt() {
  const router = useRouter();
  const project = useProjectStore();
  const editor = useEditorStore();
  return async (
    layout: Layout,
    borders: Border[],
    target?: QuiltTarget,
    fresh = false,
    data?: DataPlan['plan'],
  ) => {
    if (fresh || !project.isOpen) await project.newProject();
    const n = project.doc!.project.quilts.length + 1;
    const author = useSettingsStore().settings.author;
    const quilt = {
      ...createQuilt(`Quilt ${n}`, layout, borders),
      ...(target ? { target } : {}),
      ...(author ? { author } : {}),
      license: project.doc!.project.license ?? DEFAULT_LICENSE,
      // A data quilt (spec 025): next year's plan, set up in the Design tab.
      ...(data
        ? {
            data: { ...newDataPlan(project.doc!.units, new Date().getFullYear() + 1), plan: data },
          }
        : {}),
    };
    project.change((d) => void d.project.quilts.push(quilt));
    editor.mode = 'design';
    // Layouts without block spaces (patches, pieced strips) start on Colors with Paint.
    editor.tool = generateFor(quilt).slots.some((s) => takesBlock(s)) ? 'set' : 'paint';
    editor.block =
      project.doc!.project.blocks.find((b) => !b.notecard.tags?.includes('system'))?.id ??
      useLibraryStore().items.blocks[0]?.id ??
      null;
    if (data) {
      editor.tool = 'number';
      editor.dataNext = 1;
    }
    await router.push(`/project/quilt/${quilt.id}`);
  };
}
