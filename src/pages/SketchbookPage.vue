<template>
  <q-page v-if="project.doc" padding>
    <div class="q-gutter-md" style="max-width: 520px">
      <q-input
        :model-value="project.doc.project.name"
        label="Project name"
        :readonly="project.readOnly"
        debounce="300"
        @update:model-value="rename"
      />
      <div class="text-body2 text-grey-7">
        {{ counts }}
      </div>
      <p class="text-grey-7">The sketchbook (quilts, blocks, fabrics) arrives with the editors.</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '@/stores/project';

const project = useProjectStore();

const counts = computed(() => {
  const p = project.doc!.project;
  return `${p.quilts.length} quilts · ${p.blocks.length} blocks · ${p.palette.fabrics.length} fabrics`;
});

function rename(value: string | number | null) {
  const name = String(value ?? '').trim();
  if (name) project.change((d) => void (d.project.name = name));
}
</script>
