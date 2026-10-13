<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered>
      <q-toolbar>
        <q-btn-dropdown
          v-if="$q.screen.xs"
          flat
          no-caps
          :icon="current.icon"
          :label="current.label"
          aria-label="Go to"
        >
          <q-list>
            <q-item
              v-for="n in nav"
              :key="n.to"
              v-close-popup
              clickable
              :to="n.to"
              :active="n === current"
            >
              <q-item-section avatar><q-icon :name="n.icon" /></q-item-section>
              <q-item-section>{{ n.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <template v-else>
          <q-btn
            v-for="n in nav"
            :key="n.to"
            flat
            no-caps
            :icon="n.icon"
            :label="n.label"
            :to="n.to"
            :class="{ 'nav-active': n === current }"
          />
        </template>
        <q-space />
        <SaveStatus />
        <q-btn
          flat
          round
          icon="settings"
          aria-label="Settings"
          :class="{ 'nav-active': settingsOpen }"
          @click="settingsOpen = !settingsOpen"
        />
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

    <q-drawer v-model="settingsOpen" side="right" overlay bordered behavior="desktop" :width="420">
      <SettingsPanel />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SaveStatus from '@/components/SaveStatus.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';
import { settingsOpen } from '@/composables/settings-open';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const taking = ref(false);
const route = useRoute();
watch(
  () => route.redirectedFrom?.path,
  (from) => from === '/settings' && (settingsOpen.value = true),
  { immediate: true },
);

const HOME = { to: '/', icon: 'home', label: 'RRQuilts' };
const nav = computed(() => [
  HOME,
  ...(project.isOpen ? [{ to: '/project', icon: 'grid_view', label: 'Project' }] : []),
  { to: '/libraries', icon: 'collections_bookmark', label: 'Libraries' },
]);
// Settings and unknown pages show Home in the compact menu.
const current = computed(
  () => nav.value.find((n) => n !== HOME && route.path.startsWith(n.to)) ?? HOME,
);

// Undo/redo everywhere except while typing in a field (fields keep their own undo).
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (t?.closest('input, textarea, [contenteditable="true"]')) return;
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) project.undo();
  else if ((k === 'z' && e.shiftKey) || k === 'y') project.redo();
  else return;
  e.preventDefault();
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

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

<style scoped>
.nav-active {
  background: rgba(255, 255, 255, 0.15);
}
</style>
