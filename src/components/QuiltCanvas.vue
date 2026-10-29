<template>
  <div ref="host" class="quilt-canvas" :class="panOnly ? 'cursor-grab' : 'cursor-pointer'">
    <canvas
      ref="canvas"
      @pointerdown="vp.handlers.pointerdown"
      @mousedown.middle.prevent
      @pointermove="vp.handlers.pointermove"
      @pointerup="vp.handlers.pointerup"
      @pointercancel="vp.handlers.pointercancel"
      @pointerleave="vp.handlers.pointerleave"
      @wheel.prevent="vp.handlers.wheel"
      @contextmenu.prevent
    />
    <div class="zoom column" style="gap: 4px">
      <q-btn round dense size="sm" icon="add" aria-label="Zoom in" @click="vp.zoomBy(1.25)" />
      <q-btn round dense size="sm" icon="remove" aria-label="Zoom out" @click="vp.zoomBy(0.8)" />
      <q-btn round dense size="sm" icon="fit_screen" aria-label="Fit" @click="vp.fit()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { imagesTick } from '@/render/fabric-images';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useViewport } from '@/composables/viewport';
import type { Generated } from '@/model/layout/slots';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { boundsWithTarget, drawQuilt, type View } from '@/render/draw';
import { hitTest, type Hit } from '@/render/hit';
import type { Pt } from '@/model/geometry/path';
import { drawDataOverlay, drawDayArrows, type DataMark } from '@/render/data-overlay';

const props = defineProps<{
  doc: RrqDoc;
  quilt: Quilt;
  generated: Generated;
  view: View | undefined;
  hover: string | null;
  outlines: boolean;
  labels: boolean;
  /** Slots to outline (e.g. every placement of the block being found). */
  selected?: Set<string> | undefined;
  /** Spaces given a slight glow. */
  soft?: Set<string> | undefined;
  panOnly: boolean;
  /** Data quilt marks and order lines (spec 025, Data tab). */
  dataMarks?: readonly DataMark[] | null;
  /** Each data block's days in order, drawn as light arrows. */
  dayPaths?: readonly Pt[][] | null;
}>();
const emit = defineEmits<{
  tap: [hit: Hit];
  /** A middle click: pick up what's there. */
  pick: [hit: Hit];
  hover: [hit: Hit | null];
  'update:view': [view: View];
}>();

const $q = useQuasar();
const host = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const blocks = computed(() => new Map(props.doc.project.blocks.map((b) => [b.id, b])));
const hitAt = (p: [number, number]) => hitTest(blocks.value, props.quilt, props.generated, p);

const vp = useViewport({
  host,
  canvas,
  getView: () => props.view,
  setView: (v) => emit('update:view', v),
  bounds: () => boundsWithTarget(props.quilt, props.generated.bounds, props.generated.anchor),
  panOnly: () => props.panOnly,
  draw(ctx, view, dpr) {
    const c = canvas.value!;
    ctx.fillStyle = $q.dark.isActive ? '#3c3c3c' : '#9e9e9e'; // neutral gray (spec 004 FR-015)
    ctx.fillRect(0, 0, c.width, c.height);
    drawQuilt(ctx, props.doc, props.quilt, props.generated, {
      target: true,
      dpr,
      view,
      outlines: props.outlines,
      labels: props.labels,
      ...(props.selected ? { selected: props.selected } : {}),
      ...(props.soft ? { soft: props.soft } : {}),
      hover: props.hover,
      dark: $q.dark.isActive,
    });
    if (props.dataMarks?.length || props.dayPaths?.length) {
      const k = dpr * view.scale;
      ctx.setTransform(k, 0, 0, k, dpr * view.tx, dpr * view.ty);
      drawDayArrows(ctx, props.dayPaths ?? [], 1 / view.scale, $q.dark.isActive);
      drawDataOverlay(ctx, props.dataMarks ?? [], 1 / view.scale, {
        line: true,
        dark: $q.dark.isActive,
      });
    }
  },
  onTap: (p) => {
    const hit = hitAt(p);
    if (hit) emit('tap', hit);
  },
  onMiddle: (p) => {
    const hit = hitAt(p);
    if (hit) emit('pick', hit);
  },
  onHover: (p) => emit('hover', p ? hitAt(p) : null),
});

watch(
  () => [
    props.doc,
    props.quilt,
    props.generated,
    props.view,
    props.hover,
    props.outlines,
    props.labels,
    props.selected,
    props.soft,
    props.dataMarks,
    props.dayPaths,
    $q.dark.isActive,
    imagesTick.value, // fabric images arriving (spec 014)
  ],
  vp.schedule,
);
defineExpose({ fit: vp.fit });
</script>

<style scoped>
.quilt-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
}
.zoom {
  position: absolute;
  right: 12px;
  bottom: 12px;
}
</style>
