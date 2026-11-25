// A new quilt colorway from a palette (spec 019, spec 024): the palette swap dialog, from the quilt
// card's menu (sketchbook) or the Design tab's Colorways section. Palette makes a one-time copy;
// Auto mapping keeps following the colors and the palette; Re-color starts from the copy, then is
// painted. The new colorway follows the colorway shown, from its colors (owner, 2026-11-25).
import { castDraft } from 'immer';
import { useQuasar } from 'quasar';
import type PaletteSwapDialog from '@/components/PaletteSwapDialog.vue';
import { useSwapOptions } from '@/composables/swap-options';
import { quiltPaints } from '@/editor/colors';
import { fillFor, paintOf } from '@/editor/paint';
import { fillKey } from '@/model/coloring';
import {
  addColorway,
  baseView,
  colorwayList,
  setSwap,
  shownColorway,
  startRecolor,
  swapper,
} from '@/model/colorways';
import { newId } from '@/model/ids';
import type { Colorway, Quilt } from '@/model/schema/quilt';
import { quiltThumbnail } from '@/render/thumbnail';
import { useProjectStore } from '@/stores/project';

export function useColorwaySwap() {
  const $q = useQuasar();
  const project = useProjectStore();
  const { paintOpt } = useSwapOptions();

  /** Colorway swaps for quilt `q`, following the colorway it shows. */
  function swaps(q: Quilt) {
    const source = shownColorway(q);
    const shown = swapper(source);
    /** Each base color (paint id) and how the colorway shown has it: the dialog maps the latter. */
    const base = [...quiltPaints(project.doc!, baseView(q, source))].map(
      (p) => [p, paintOf(shown(fillFor(p)))!] as const,
    );
    /** A new colorway following the one shown, shown itself. */
    const fresh = (name: string | undefined, more: Partial<Colorway> = {}) => {
      const id = newId();
      const next = addColorway(q, id, name);
      next.colorways = next.colorways!.map((v) =>
        v.id === id ? { ...v, ...(source ? { source: source.id } : {}), ...more } : v,
      );
      return { id, next };
    };
    /** The quilt with a new colorway: the colors shown swapped by `map` (paint → paint). */
    function swappedQuilt(map: Record<string, string>, name?: string): Quilt {
      const { id, next } = fresh(name);
      return base.reduce(
        (x, [p, from]) => setSwap(x, id, fillKey(fillFor(p)), fillFor(map[from] ?? from)),
        next,
      );
    }
    /** The quilt with a new auto-mapped colorway (its picks are worked out as the change is made). */
    function autoQuilt(palette: string, overrides: Record<string, string>, name?: string): Quilt {
      const over = base.flatMap(([p, from]) => {
        const to = overrides[from];
        return to ? [{ from: fillKey(fillFor(p)), to: fillFor(to) }] : [];
      });
      return fresh(name, { auto: { palette, ...(over.length ? { overrides: over } : {}) } }).next;
    }
    return { source, used: [...new Set(base.map(([, from]) => from))], swappedQuilt, autoQuilt };
  }

  function put(q: Quilt, next: Quilt) {
    project.change((d) => {
      const i = d.project.quilts.findIndex((x) => x.id === q.id);
      if (i >= 0) d.project.quilts[i] = castDraft(next);
    });
  }

  function startSwapColorway(dialog: InstanceType<typeof PaletteSwapDialog> | undefined, q: Quilt) {
    const { source, used, swappedQuilt, autoQuilt } = swaps(q);
    const name = colorwayList(q).find((c) => c.id === source?.id)?.name;
    dialog?.show({
      heading: 'New colorway from palette',
      title: `${q.notecard.name} (${name})`,
      okLabel: 'Add colorway',
      used: used.flatMap((p) => paintOpt(p) ?? []),
      before: quiltThumbnail(project.doc!, q, 500, $q.dark.isActive, true, true),
      preview: (map, n, doc) =>
        quiltThumbnail(doc, swappedQuilt(map, n), 500, $q.dark.isActive, true, true),
      done: (map, n) => put(q, swappedQuilt(map, n)),
      auto: { done: (palette, overrides, n) => put(q, autoQuilt(palette, overrides, n)) },
      // Re-color paints block spaces: not for data quilts or English paper piecing quilts.
      ...(q.data?.on || q.layout.style === 'epp'
        ? {}
        : {
            recolor: {
              done: (map: Record<string, string>, n: string | undefined) => {
                const next = swappedQuilt(map, n);
                put(q, startRecolor(next, next.shownColorway!, project.doc!.project.blocks));
              },
            },
          }),
    });
  }

  return { startSwapColorway };
}
