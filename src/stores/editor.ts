// Session-only editor state: mode, tool, scope, selections, view per quilt/block.
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import type { Scope } from '@/editor/scope';
import type { DataKind } from '@/model/schema/block';
import type { StripStyle } from '@/model/schema/quilt';
import type { View } from '@/render/draw';

export type Mode = 'layout' | 'borders' | 'design' | 'print' | 'details';
/** `number`: a data quilt's brush, placing numbers on block spaces; `entry`: its Data tab, a tap
 *  on a day's piece opens that day's entry (spec 025). */
export type Tool =
  | 'set'
  | 'rotate'
  | 'flip'
  | 'erase'
  | 'find'
  | 'paint'
  | 'spray'
  | 'swap'
  | 'eyedropper'
  | 'pan'
  | 'number'
  | 'entry';

export type BlockMode = 'draw' | 'color' | 'print' | 'details';
export type BlockTool =
  'select' | 'node' | 'line' | 'arc' | 'grid' | 'pan' | 'paint' | 'spray' | 'eyedropper';

export type LayoutTool = 'swap-strips' | 'strip-style';

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
  /** Quilt and block canvases drawn in grayscale (to check values). */
  const gray = ref(false);
  /** Editor sidebar (inspector) shown; the hamburger button toggles it. */
  const sidebar = ref(true);
  /** Print preview scale (1 = true size); null = fit the page width. `printFit` is that fit. */
  const printZoom = ref<number | null>(null);
  const printFit = ref(1);
  const printScale = computed(() => printZoom.value ?? printFit.value);
  const zoomPrint = (k: number) =>
    (printZoom.value = Math.min(4, Math.max(0.1, printScale.value * k)));
  const views = reactive(new Map<string, View>());
  /** Flip direction; tapping the Flip tool while it's active switches it. */
  const flipAxis = ref<'h' | 'v'>('h');

  // Strip quilts (spec 017)
  const selectedStrip = ref<string | null>(null);
  const layoutTool = ref<LayoutTool | null>(null);
  /** Style the Strip style tool applies (picked from its menu). */
  const stripStyle = ref<StripStyle>('plain');
  /** First strip chosen by Swap strips, waiting for the second. */
  const swapFirst = ref<string | null>(null);

  // Block editor
  const blockMode = ref<BlockMode>('draw');
  const blockTool = ref<BlockTool>('line');
  /** Arc direction for the next arc (Space flips it). */
  const arcSign = ref<1 | -1>(-1);
  const grid = ref<[number, number]>([3, 3]);
  /** Current coloring per block (block editor + which coloring "Set" uses in quilts). */
  const coloringOf = reactive(new Map<string, string>());
  /** A data block's numerals (spec 025): numbering on (a tap puts the picked numeral on instead of
   *  a color), the numeral and value, moving on after each tap, and the overlay. */
  const data = reactive({
    on: false,
    numeral: 1,
    slot: 0,
    advance: true,
    numbers: true,
    line: true,
  });
  /** The month data block variant shown in the block editor (days; null: its own, the 31). */
  const blockVariant = ref<number | null>(null);
  /** A data quilt's next number to place (1-based, spec 025). */
  const dataNext = ref(1);
  /** The block space of the number being dragged in the list, highlighted on the quilt. */
  const dataHot = ref<string | null>(null);
  /** The block space of the card last clicked in the list (stays highlighted). */
  const dataSel = ref<string | null>(null);
  /** The data block type picked to place, per kind. */
  const dataType = reactive<Record<DataKind, string | null>>({
    day: null,
    week: null,
    month: null,
  });

  function useColor(id: string) {
    color.value = id;
    data.on = false; // a color picked: painting colors again
    // Most recent first; the tray sorts by it only when the setting asks (recentColorsFirst).
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
    gray,
    sidebar,
    printZoom,
    printFit,
    printScale,
    zoomPrint,
    views,
    flipAxis,
    selectedStrip,
    layoutTool,
    stripStyle,
    swapFirst,
    blockMode,
    blockTool,
    arcSign,
    grid,
    coloringOf,
    data,
    blockVariant,
    dataNext,
    dataHot,
    dataSel,
    dataType,
    useColor,
  };
});
