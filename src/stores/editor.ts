// Session-only editor state: mode, tool, scope, selections, view per quilt/block.
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { Scope } from '@/editor/scope';
import type { View } from '@/render/draw';

export type Mode = 'layout' | 'borders' | 'design' | 'print';
export type Tool =
  'set' | 'rotate' | 'flip' | 'erase' | 'find' | 'paint' | 'spray' | 'swap' | 'eyedropper' | 'pan';

export type BlockMode = 'draw' | 'color' | 'print';
export type BlockTool =
  'select' | 'node' | 'line' | 'arc' | 'grid' | 'pan' | 'paint' | 'spray' | 'eyedropper';

export const BLOCK_TOOLS: Tool[] = ['set', 'rotate', 'flip', 'erase', 'find'];
export const COLOR_TOOLS: Tool[] = ['paint', 'spray', 'swap', 'eyedropper'];

export const useEditorStore = defineStore('editor', () => {
  const mode = ref<Mode>('design');
  const tool = ref<Tool>('set');
  const scope = ref<Scope>('this');
  const block = ref<string | null>(null);
  const color = ref<string | null>(null);
  const recentColors = ref<string[]>([]);
  const outlines = ref(true);
  const labels = ref(false);
  const views = reactive(new Map<string, View>());
  /** Flip direction; tapping the Flip tool while it's active switches it. */
  const flipAxis = ref<'h' | 'v'>('h');

  // Block editor
  const blockMode = ref<BlockMode>('draw');
  const blockTool = ref<BlockTool>('line');
  /** Arc direction for the next arc (Space flips it). */
  const arcSign = ref<1 | -1>(-1);
  const grid = ref<[number, number]>([3, 3]);
  /** Current coloring per block (block editor + which coloring "Set" uses in quilts). */
  const coloringOf = reactive(new Map<string, string>());

  function useColor(id: string) {
    color.value = id;
    recentColors.value = [id, ...recentColors.value.filter((c) => c !== id)].slice(0, 12);
  }

  return {
    mode,
    tool,
    scope,
    block,
    color,
    recentColors,
    outlines,
    labels,
    views,
    flipAxis,
    blockMode,
    blockTool,
    arcSign,
    grid,
    coloringOf,
    useColor,
  };
});
