// The Set tool's spanning blocks (spec 057, owner's pick of prototype D): a Block size slider (1U,
// 2U …) whose block lights the spaces it would cover under the pointer, and a drag that grows the
// block from the space pressed, the slider following the drag, then going back to its own size
// once the block is placed.
import { computed, ref } from 'vue';
import type { CanvasOverlay, World } from '@/composables/viewport';
import type { Generated } from '@/model/layout/slots';
import { cellAt, maxSpan, spanGrow, spanIndex, spanNear, type Span } from '@/model/layout/spans';
import { useEditorStore } from '@/stores/editor';

export function useSpanSet(o: {
  generated: () => Generated;
  /** The Set tool is on with a block chosen, in a quilt that can be edited. */
  active: () => boolean;
  place: (span: Span) => void;
}) {
  const editor = useEditorStore();
  const ix = computed(() => {
    const g = o.generated();
    return spanIndex(g.unspanned ?? g.slots);
  });
  /** The largest block the layout has room for (1: no spanning here). */
  const maxK = computed(() => maxSpan(ix.value.slots));
  /** The slider, kept within what fits. */
  const size = computed({
    get: () => Math.max(1, Math.min(editor.spanSize, maxK.value)),
    set: (k: number) => (editor.spanSize = k),
  });
  /** The span the block would fill: under the pointer, or the one a drag has grown to. */
  const lit = ref<Span | null>(null);
  let drag: { from: string; k: number } | null = null;

  /** The span of the slider's size nearest p (one the pointer is on). */
  function near(p: World): Span | null {
    const cell = cellAt(ix.value, p);
    return cell ? spanNear(ix.value, cell, size.value, p) : null;
  }

  const overlay = computed((): CanvasOverlay | undefined => {
    if (!o.active() || maxK.value < 2) return undefined;
    // A new overlay each time the lit span changes, so the canvas redraws.
    void lit.value;
    return {
      decorate: () => {},
      claim(p) {
        const cell = cellAt(ix.value, p);
        if (!cell) return false;
        drag = { from: cell, k: size.value };
        lit.value = spanNear(ix.value, cell, 1, p);
        return true;
      },
      drag(p) {
        const cell = drag && cellAt(ix.value, p);
        const sp = cell && spanGrow(ix.value, drag!.from, cell, maxK.value);
        if (!sp) return;
        lit.value = sp;
        editor.spanSize = sp.k;
      },
      end() {
        const sp = lit.value;
        if (drag) editor.spanSize = drag.k;
        drag = null;
        lit.value = null;
        if (sp) o.place(sp);
      },
      cursor: () => null,
      hover(p) {
        if (drag) return;
        const next = p && size.value > 1 ? near(p) : null;
        if (next?.at !== lit.value?.at || next?.k !== lit.value?.k) lit.value = next;
      },
    };
  });

  return { overlay, lit, maxK, size, near, index: ix };
}
