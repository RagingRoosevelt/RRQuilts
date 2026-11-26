// What a paint selection puts in a patch (spec 014): the editor's selected id is a color id, or
// `fabric:<id>` for a fabric.
import { dataKey, fillKey } from '@/model/coloring';
import type { Fill } from '@/model/schema/coloring';

const FABRIC = 'fabric:';

export const fabricPaint = (fabricId: string) => FABRIC + fabricId;

const DATA = /^data:(\d+)(?:\.(\d))?$/;

/** A data paint id (spec 025, `dataKey`) as its fill. */
export const dataFillFor = (paint: string): Fill | undefined => {
  const m = DATA.exec(paint);
  if (!m) return undefined;
  const slot = Number(m[2] ?? 0);
  return { data: { n: Number(m[1]), ...(slot ? { slot } : {}) } };
};

export const fillFor = (paint: string): Fill =>
  paint.startsWith(FABRIC)
    ? { fabric: paint.slice(FABRIC.length), offset: [0, 0], rotation: 0 }
    : (dataFillFor(paint) ?? { color: paint });

/** Lit colors (`editor.spotPaints`) as the fill keys a canvas's `spot` matches (none: undefined). */
export const spotKeys = (paints: readonly string[]) =>
  paints.length ? new Set(paints.map((p) => fillKey(fillFor(p)))) : undefined;

/** The paint id that picks up an existing fill (eyedropper). */
export const paintOf = (f: Fill | undefined) =>
  !f ? undefined : 'data' in f ? dataKey(f.data) : 'color' in f ? f.color : fabricPaint(f.fabric);
