// A new quilt colorway from a palette (spec 019, spec 024): the palette swap dialog, from the quilt
// card's menu (sketchbook) or the Design tab's Colorways section. Manual makes a one-time copy;
// Auto mapping keeps following the primary colorway's colors and the palette. Both always start
// from the primary colorway, whichever colorway is shown.
import { castDraft } from 'immer';
import { useQuasar } from 'quasar';
import type PaletteSwapDialog from '@/components/PaletteSwapDialog.vue';
import { useSwapOptions } from '@/composables/swap-options';
import { quiltPaints } from '@/editor/colors';
import { fillFor } from '@/editor/paint';
import { fillKey } from '@/model/coloring';
import { addColorway, colorwayList, setSwap } from '@/model/colorways';
import { newId } from '@/model/ids';
import type { Quilt } from '@/model/schema/quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { useProjectStore } from '@/stores/project';

export function useColorwaySwap() {
  const $q = useQuasar();
  const project = useProjectStore();
  const { paintOpt } = useSwapOptions();

  /** The quilt with a new colorway: the primary colors swapped by `map` (paint → paint). */
  function swappedQuilt(q: Quilt, map: Record<string, string>, name?: string): Quilt {
    const id = newId();
    let next = addColorway(q, id, name);
    for (const p of quiltPaints(project.doc!, q))
      if (map[p] && map[p] !== p) next = setSwap(next, id, fillKey(fillFor(p)), fillFor(map[p]));
    return next;
  }

  /** The quilt with a new auto-mapped colorway (its picks are worked out as the change is made). */
  function autoQuilt(
    q: Quilt,
    palette: string,
    overrides: Record<string, string>,
    name?: string,
  ): Quilt {
    const id = newId();
    const next = addColorway(q, id, name);
    const over = [...quiltPaints(project.doc!, q)].flatMap((p) => {
      const to = overrides[p];
      return to ? [{ from: fillKey(fillFor(p)), to: fillFor(to) }] : [];
    });
    next.colorways = next.colorways!.map((v) =>
      v.id !== id
        ? v
        : {
            ...v,
            auto: {
              palette,
              ...(over.length ? { overrides: over } : {}),
            },
          },
    );
    return next;
  }

  function put(q: Quilt, next: Quilt) {
    project.change((d) => {
      const i = d.project.quilts.findIndex((x) => x.id === q.id);
      if (i >= 0) d.project.quilts[i] = castDraft(next);
    });
  }

  function startSwapColorway(dialog: InstanceType<typeof PaletteSwapDialog> | undefined, q: Quilt) {
    const now = quiltPaints(project.doc!, q);
    const name = colorwayList(q)[0]?.name;
    const primary = { ...q };
    delete primary.shownColorway;
    dialog?.show({
      heading: 'New colorway from palette',
      title: `${q.notecard.name} (${name})`,
      okLabel: 'Add colorway',
      used: [...now].flatMap((p) => paintOpt(p) ?? []),
      before: quiltThumbnail(project.doc!, primary, 500, $q.dark.isActive, true, true),
      preview: (map, n, doc) =>
        quiltThumbnail(doc, swappedQuilt(q, map, n), 500, $q.dark.isActive, true, true),
      done: (map, n) => put(q, swappedQuilt(q, map, n)),
      auto: { done: (palette, overrides, n) => put(q, autoQuilt(q, palette, overrides, n)) },
    });
  }

  return { startSwapColorway };
}
