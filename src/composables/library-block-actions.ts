// Library blocks are read-only (spec 008): the quilter makes their own copy to change the drawing,
// or a color variant to recolor it. Shared by the sketchbook and the block editor's read-only view.
import { produce } from 'immer';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthor } from '@/composables/author';
import { copyBlock } from '@/editor/block-ops';
import { isLibraryItem, toUnits, useMyCopy } from '@/model/library-items';
import type { Block } from '@/model/schema/block';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';

export function useLibraryBlockActions() {
  const $q = useQuasar();
  const router = useRouter();
  const project = useProjectStore();
  const editor = useEditorStore();
  const askAuthor = useAuthor();
  /** The quilter's own block names (new copies get the next free "Name (2)"). */
  const names = () =>
    project.doc!.project.blocks.filter((b) => !isLibraryItem(b)).map((b) => b.notecard.name);
  const quiltsUsing = (id: string) =>
    project.doc!.project.quilts.filter((q) =>
      [
        ...Object.values(q.layers[0].slots).map((s) => s.block),
        ...q.layers.flatMap((l) => l.items.map((i) => i.ref)),
      ].includes(id),
    );

  /** Your copy, optionally used in its place in the quilts that use it; opens it to draw. */
  async function editLibrary(lib: Block) {
    const copy = copyBlock(
      toUnits(lib, project.doc!.units),
      names(),
      await askAuthor(),
      project.doc!.project.license,
    );
    const users = quiltsUsing(lib.id);
    const go = (replace: boolean) => {
      project.change(() => useMyCopy(project.doc!, lib.id, copy, replace));
      editor.blockMode = 'draw';
      void router.push(`/project/block/${copy.id}`);
    };
    if (!users.length) return go(false);
    $q.dialog({
      title: `Use your copy of "${lib.notecard.name}"?`,
      message: `It's used in ${users.map((q) => `"${q.notecard.name}"`).join(', ')}. Your copy can replace it there (colors are kept).`,
      persistent: true,
      ok: { label: 'Use my copy there', flat: true },
      cancel: { label: 'Keep the library block', flat: true },
    })
      .onOk(() => go(true))
      .onCancel(() => go(false));
  }

  /** A color variant: the library block's drawing with colorings of your own; opens it to color.
   *  One per library block in a project: if there is one, it opens (new colorings go there). */
  async function colorVariant(lib: Block) {
    const have = project.doc!.project.blocks.find(
      (b) => b.colorVariant && !isLibraryItem(b) && b.source?.itemId === lib.id,
    );
    if (have) {
      editor.blockMode = 'color';
      void router.push(`/project/block/${have.id}`);
      return;
    }
    const v = produce(
      copyBlock(
        toUnits(lib, project.doc!.units),
        names(),
        await askAuthor(),
        project.doc!.project.license,
      ),
      (c) => {
        c.colorVariant = true;
        c.notecard.name = lib.notecard.name; // same name as its original; the badge tells them apart
      },
    );
    project.change((d) => void d.project.blocks.push(v));
    editor.blockMode = 'color';
    void router.push(`/project/block/${v.id}`);
  }

  return { editLibrary, colorVariant };
}
