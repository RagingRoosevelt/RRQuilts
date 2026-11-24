<template>
  <q-list bordered separator class="rounded-borders">
    <q-item v-for="d in DEMOS" :key="d.file" clickable @click="emit('open', d.file)">
      <q-item-section avatar><q-icon :name="d.icon" /></q-item-section>
      <q-item-section>
        <q-item-label>{{ d.title }}</q-item-label>
        <q-item-label caption>{{ d.about }}</q-item-label>
      </q-item-section>
      <q-item-section side><q-icon name="chevron_right" /></q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
// The demo projects to pick from (welcome wizard, home page's Open a demo).
import { DEMOS } from '@/storage/demo';

const emit = defineEmits<{ open: [file: string] }>();
</script>
