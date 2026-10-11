<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered>
      <q-toolbar>
        <q-toolbar-title class="row items-center no-wrap q-gutter-sm">
          <router-link to="/" class="text-inherit no-decoration">RRQuilts</router-link>
          <router-link
            v-if="project.doc"
            to="/project"
            class="text-inherit no-decoration text-subtitle1 ellipsis"
          >
            · {{ project.doc.project.name }}
          </router-link>
        </q-toolbar-title>
        <SaveStatus />
        <q-btn flat round icon="collections_bookmark" to="/libraries" aria-label="Libraries" />
        <q-btn flat round icon="settings" to="/settings" aria-label="Settings" />
      </q-toolbar>
      <q-banner v-if="project.readOnly" dense class="bg-grey-3 text-dark">
        <template #avatar><q-icon name="lock" /></template>
        {{
          project.lostToOtherTab
            ? 'Editing moved to another tab. This tab is read-only.'
            : 'This project is open in another tab, so it is read-only here.'
        }}
        <template #action>
          <q-btn
            flat
            no-caps
            label="Continue here anyway"
            :loading="taking"
            @click="continueHere"
          />
        </template>
      </q-banner>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import SaveStatus from '@/components/SaveStatus.vue';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const taking = ref(false);

async function continueHere() {
  taking.value = true;
  try {
    const r = await project.continueHere();
    if (!r.holderAnswered) {
      $q.notify({
        type: 'warning',
        message: "The other tab didn't respond; its most recent edits may be missing.",
      });
    }
  } finally {
    taking.value = false;
  }
}
</script>
