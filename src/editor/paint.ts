// What a paint selection puts in a patch (spec 014): the editor's selected id is a color id, or
// `fabric:<id>` for a fabric.
import type { Fill } from '@/model/schema/coloring';

const FABRIC = 'fabric:';

export const fabricPaint = (fabricId: string) => FABRIC + fabricId;

export const fillFor = (paint: string): Fill =>
  paint.startsWith(FABRIC)
    ? { fabric: paint.slice(FABRIC.length), offset: [0, 0], rotation: 0 }
    : { color: paint };

/** The paint id that picks up an existing fill (eyedropper). */
export const paintOf = (f: Fill | undefined) =>
  !f ? undefined : 'color' in f ? f.color : fabricPaint(f.fabric);
