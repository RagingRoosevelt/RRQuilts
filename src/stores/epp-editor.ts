// Session-only state of the EPP editors (specs 027, 050): tools, the picked shape or rosette, scale,
// selection, grid offset, views. Lasting preferences (vertex grid, angle step, placement mode,
// ungrouped, sync grid) are in settings `epp`.
import { defineStore } from 'pinia';
import { reactive, ref, shallowRef } from 'vue';
import type { Clip } from '@/model/epp/selection';
import type { View } from '@/render/draw';

export type ShapeTool = 'vertex' | 'edge' | 'angle' | 'lock' | 'delete' | 'line';
export type RosetteTool =
  'select' | 'place' | 'turn' | 'mirror' | 'mirrorY' | 'erase' | 'close' | 'paint';

export const useEppEditorStore = defineStore('epp-editor', () => {
  const shapeTool = ref<ShapeTool>('vertex');
  const rosetteTool = ref<RosetteTool>('place');
  /** Shape editor: one outline, or an outline with lines across it (Multi-shape). */
  const multi = ref(false);
  /** The shape or rosette the picker has picked (item id). */
  const picked = ref<string | null>(null);
  const scale = ref(1);
  /** Selected pieces (spec 051), replaced, never mutated in place. */
  const selection = shallowRef<ReadonlySet<string>>(new Set());
  /** Copied pieces, pasted into any EPP quilt or rosette. */
  const clip = shallowRef<Clip | null>(null);
  /** Grid mode: where the grid starts, moved by Drag grid. */
  const gridOrigin = ref<[number, number]>([0, 0]);
  const draggingGrid = ref(false);
  const views = reactive(new Map<string, View>());
  /** The coloring picked per rosette in the picker (shown on its card, used when placing). */
  const coloringOf = reactive(new Map<string, string>());
  return {
    coloringOf,
    shapeTool,
    rosetteTool,
    multi,
    picked,
    scale,
    selection,
    clip,
    gridOrigin,
    draggingGrid,
    views,
  };
});
