// Session-only editor state: mode, tool, scope, selections, view per quilt.
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { Scope } from '@/editor/scope';
import type { View } from '@/render/draw';

export type Mode = 'layout' | 'borders' | 'design' | 'print';
export type Tool =
  'set' | 'rotate' | 'flip' | 'erase' | 'find' | 'paint' | 'spray' | 'swap' | 'eyedropper' | 'pan';

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
  const views = reactive(new Map<string, View>());
  /** Last flip tap, so tapping the same space again continues the ↔ / ↕ / original cycle. */
  const lastFlip = ref<{ slotId: string; scope: Scope; step: 1 | 2 | 3 } | null>(null);

  function useColor(id: string) {
    color.value = id;
    recentColors.value = [id, ...recentColors.value.filter((c) => c !== id)].slice(0, 12);
  }

  return { mode, tool, scope, block, color, recentColors, outlines, views, lastFlip, useColor };
});
