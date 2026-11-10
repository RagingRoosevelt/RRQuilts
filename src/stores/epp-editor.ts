// Session-only state of the EPP editors (specs 027, 050): tools, the picked shape or rosette, scale,
// selection, grid offset, views. Lasting preferences (vertex grid, angle step, placement mode,
// ungrouped, sync grid) are in settings `epp`.
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { View } from '@/render/draw';

export type ShapeTool = 'vertex' | 'edge' | 'angle' | 'lock' | 'delete' | 'line';
export type RosetteTool = 'place' | 'turn' | 'mirror' | 'erase' | 'close' | 'paint';

export const useEppEditorStore = defineStore('epp-editor', () => {
  const shapeTool = ref<ShapeTool>('vertex');
  const rosetteTool = ref<RosetteTool>('place');
  /** Shape editor: one outline, or an outline with lines across it (Multi-shape). */
  const multi = ref(false);
  /** The shape or rosette the picker has picked (item id). */
  const picked = ref<string | null>(null);
  const scale = ref(1);
  const selection = ref(new Set<string>());
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
    gridOrigin,
    draggingGrid,
    views,
  };
});
