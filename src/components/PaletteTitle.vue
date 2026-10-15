<template>
  <!-- A palette's name; its manufacturer and designer; then its license. -->
  <div>
    <div class="text-h6">{{ palette.notecard.name }}</div>
    <div v-if="makers" class="text-caption text-grey-7">{{ makers }}</div>
    <div v-if="license" class="text-caption text-grey-7">{{ licenseName(license) }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { authorOf, licenseName } from '@/model/credits';
import type { ColorCollection } from '@/model/schema/library';

const props = defineProps<{
  palette: Pick<ColorCollection, 'notecard' | 'colors' | 'fabrics' | 'author' | 'source'>;
  license?: string | undefined;
}>();

const makers = computed(() => {
  const p = props.palette;
  const made = (p.fabrics ?? []).flatMap((x) => (x.manufacturer ? [x.manufacturer] : []));
  return [...new Set(made), authorOf(p)].filter(Boolean).join(' · ');
});
</script>
