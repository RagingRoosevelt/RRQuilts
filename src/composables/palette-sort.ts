// A palette's swatches in the order the quilter picked for it (spec 032), shared by every place a
// palette's swatches are listed. The sort is a device setting by palette id; the palette is unchanged.
import type { Color, Fabric } from '@/model/schema/palette';
import { sortSwatches, type SortPref } from '@/model/palette-sort';
import { useSettingsStore } from '@/stores/settings';

export type Swatch =
  { kind: 'color'; item: Color; i: number } | { kind: 'fabric'; item: Fabric; i: number };

export function usePaletteSort() {
  const app = useSettingsStore();
  const prefOf = (id: string): SortPref | undefined => app.settings.paletteSorts[id];
  function setPref(id: string, pref: SortPref | undefined) {
    const { [id]: _old, ...rest } = app.settings.paletteSorts;
    void _old;
    app.settings.paletteSorts =
      pref && (pref.key !== 'saved' || pref.reverse) ? { ...rest, [id]: pref } : rest;
  }
  /** Forget the sorts of palettes that are gone (spec 032 FR-008). */
  function forget(ids: readonly string[]) {
    if (!ids.some((id) => id in app.settings.paletteSorts)) return;
    const gone = new Set(ids);
    app.settings.paletteSorts = Object.fromEntries(
      Object.entries(app.settings.paletteSorts).filter(([id]) => !gone.has(id)),
    );
  }
  /** Colors then fabrics as stored, sorted as picked for palette `id`; `i` = index in its own list. */
  function swatches(
    id: string,
    colors: readonly Color[] = [],
    fabrics: readonly Fabric[] = [],
  ): Swatch[] {
    const all: Swatch[] = [
      ...colors.map((item, i) => ({ kind: 'color' as const, item, i })),
      ...fabrics.map((item, i) => ({ kind: 'fabric' as const, item, i })),
    ];
    return sortSwatches(
      all,
      prefOf(id),
      (s) => (s.kind === 'color' ? s.item.rgb : s.item.average),
      (s) => s.item.notecard.name,
    );
  }
  return { prefOf, setPref, forget, swatches };
}
