<template>
  <q-page padding>
    <div class="q-gutter-md column" style="max-width: 420px">
      <h1 class="text-h4">RRQuilts</h1>
      <q-btn color="primary" size="lg" icon="add" label="Start a quilt" disable />
      <q-btn outline icon="folder_open" label="Open a project file" disable />
      <q-btn outline icon="auto_awesome_mosaic" label="Sample projects" disable />
      <q-btn flat icon="collections_bookmark" label="Libraries" to="/libraries" />
      <q-btn flat icon="settings" label="Settings" to="/settings" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (route.query.notice === 'open-project') {
    $q.notify({ message: 'Open a project first.', color: 'warning', textColor: 'dark' });
    void router.replace({ path: '/' });
  }
});
</script>
