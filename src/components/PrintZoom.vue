<template>
  <q-btn flat dense icon="add" aria-label="Zoom in" @click="editor.zoomPrint(1.25)">
    <q-tooltip anchor="center right" self="center left">Zoom in (Ctrl+wheel, pinch)</q-tooltip>
  </q-btn>
  <q-btn flat dense no-caps class="text-caption" aria-label="Fit" @click="editor.printZoom = null">
    {{ Math.round(editor.printScale * 100) }}%
    <q-tooltip anchor="center right" self="center left">Fit to width (100% = true size)</q-tooltip>
  </q-btn>
  <q-btn flat dense icon="remove" aria-label="Zoom out" @click="editor.zoomPrint(0.8)">
    <q-tooltip anchor="center right" self="center left">Zoom out</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
// Print preview zoom buttons for the editor tool rail (the preview itself handles wheel + pinch).
import { useEditorStore } from '@/stores/editor';

const editor = useEditorStore();
</script>
