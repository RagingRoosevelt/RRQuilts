// Picking a block coloring whose colors come from a library palette the project hasn't turned on:
// offer to turn that palette on, so its colors show in the color trays.
import { useQuasar } from 'quasar';
import type { Block } from '@/model/schema/block';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

export function usePaletteOffer() {
  const $q = useQuasar();
  const project = useProjectStore();
  const library = useLibraryStore();
  const declined = new Set<string>(); // ponytail: per screen visit, so a "No" isn't asked again

  return (block: Block, coloringId: string) => {
    const doc = project.doc;
    const coloring = block.colorings.find((k) => k.id === coloringId);
    if (!doc || !coloring || project.readOnly) return;
    const picked = new Set(doc.project.libraryPalettes ?? []);
    const collections = library.views.flatMap((v) => v.collections);
    const offered = new Set([
      ...doc.project.palette.colors.filter((c) => !c.source || c.source.derived).map((c) => c.id),
      ...collections.filter((c) => picked.has(c.id)).flatMap((c) => c.colors.map((x) => x.id)),
    ]);
    const missing = new Set(
      Object.values(coloring.fills).flatMap((f) =>
        'color' in f && !offered.has(f.color) ? [f.color] : [],
      ),
    );
    if (!missing.size) return;
    // The palette covering most of the missing colors.
    const best = collections
      .filter((c) => !picked.has(c.id) && !declined.has(c.id))
      .map((c) => ({ c, n: c.colors.filter((x) => missing.has(x.id)).length }))
      .sort((a, b) => b.n - a.n)[0];
    if (!best?.n) return;
    $q.dialog({
      title: `Turn on "${best.c.notecard.name}"?`,
      message: `This coloring uses colors from the ${best.c.notecard.name} palette, which isn't on for this project. Turn it on to show its colors in the color trays?`,
      cancel: { label: 'Not now', flat: true },
      ok: { label: 'Turn on', flat: true },
    })
      .onOk(() =>
        project.change((d) => {
          d.project.libraryPalettes = [...(d.project.libraryPalettes ?? []), best.c.id];
        }),
      )
      .onCancel(() => declined.add(best.c.id));
  };
}
