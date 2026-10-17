// Colors and palettes to swap to: the swap dialogs (removing colors, a block coloring or quilt
// variant from a palette swap) map colors in use onto these.
import { computed } from 'vue';
import { projectPalettes } from '@/model/project-palettes';
import type { Color, Fabric } from '@/model/schema/palette';
import { swatchStyle } from '@/render/fabric-images';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';

/** A color, or a fabric standing in as one (`fabric:<id>`, its average color), with where it's from. */
export type Opt = Color & { from: string; fabric?: Fabric };
export const fabricOpt = (f: Fabric, from: string): Opt => ({
  id: `fabric:${f.id}`,
  notecard: f.notecard,
  rgb: f.average,
  from,
  fabric: f,
});
export const rgbCss = (rgb?: readonly number[]) => (rgb ? `rgb(${rgb.join(',')})` : 'transparent');
/** A swatch's CSS: a fabric's print, else the color. */
export const optStyle = (o?: Color & { fabric?: Fabric }) =>
  o?.fabric ? swatchStyle(o.fabric) : { background: rgbCss(o?.rgb) };

/** What's going away: a library palette (`palette`, `palettes`), My colors (`mine`), one color, one
 *  of the project's own palettes (with its colors and fabrics), or one fabric. */
export type Drop = {
  palette?: string;
  palettes?: string[];
  mine?: boolean;
  color?: string;
  projectPalette?: string;
  fabric?: string;
};

export function useSwapOptions() {
  const project = useProjectStore();
  const library = useLibraryStore();
  const ownPalettes = computed(() => projectPalettes(project.doc!));
  const pickedPalettes = computed(() => project.doc!.project.libraryPalettes ?? []);

  /** Colors and fabrics available after `drop` goes. */
  function remaining(drop: Drop): Opt[] {
    const all = library.views.flatMap((v) => v.collections.map((c) => ({ v, c })));
    const going = new Set([drop.palette, ...(drop.palettes ?? [])]);
    return [
      // The project's own palettes (but not the one, or the color or fabric, going away).
      ...(drop.mine ? [] : ownPalettes.value)
        .filter((pp) => pp.palette.id !== drop.projectPalette)
        .flatMap((pp) => [
          ...pp.colors
            .filter((c) => c.id !== drop.color)
            .map((c) => ({ ...c, from: pp.palette.notecard.name })),
          ...pp.fabrics
            .filter((f) => f.id !== drop.fabric)
            .map((f) => fabricOpt(f, pp.palette.notecard.name)),
        ]),
      ...all
        .filter((x) => pickedPalettes.value.includes(x.c.id) && !going.has(x.c.id))
        .flatMap((x) => {
          const from = `${x.c.notecard.name} · ${x.v.doc.library?.name ?? x.v.doc.name}`;
          return [
            ...x.c.colors.map((c) => ({ ...c, from })),
            ...(x.c.fabrics ?? []).map((f) => fabricOpt(f, from)),
          ];
        }),
    ].filter((c, i, a) => a.findIndex((o) => o.id === c.id) === i);
  }

  /** Palettes to map onto: the project's own palettes, then every palette in use in the libraries. */
  const swapPalettes = computed(() => [
    ...ownPalettes.value
      .filter((pp) => pp.colors.length || pp.fabrics.length)
      .map((pp) => {
        const from = `${pp.palette.notecard.name} · this project`;
        return {
          id: `project:${pp.palette.id}`,
          label: from,
          colors: [
            ...pp.colors.map((c) => ({ ...c, from })),
            ...pp.fabrics.map((f) => fabricOpt(f, from)),
          ] as Opt[],
        };
      }),
    ...library.views.flatMap((v) =>
      v.collections.map((c) => {
        const from = `${c.notecard.name} · ${v.doc.library?.name ?? v.doc.name}`;
        return {
          id: c.id,
          label: from,
          colors: [
            ...c.colors.map((x) => ({ ...x, from })),
            ...(c.fabrics ?? []).map((f) => fabricOpt(f, from)),
          ] as Opt[],
        };
      }),
    ),
  ]);

  /** What colors can be swapped to: the project's colors and fabrics, and its palettes'. */
  const swapOptions = () =>
    [
      ...remaining({}),
      ...project.doc!.project.palette.fabrics.map((f) => fabricOpt(f, 'Project fabrics')),
    ].filter((o, i, a) => a.findIndex((x) => x.id === o.id) === i);

  /** A paint id (a color, or `fabric:<id>`) as a swatch option. */
  function paintOpt(id: string): Opt | undefined {
    const f = project.doc!.project.palette.fabrics.find((x) => `fabric:${x.id}` === id);
    if (f) return fabricOpt(f, '');
    const c =
      project.doc!.project.palette.colors.find((x) => x.id === id) ?? library.lookup.color(id);
    return c && { ...c, from: '' };
  }

  return { ownPalettes, pickedPalettes, remaining, swapPalettes, swapOptions, paintOpt };
}
