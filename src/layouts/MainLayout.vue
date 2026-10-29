<template>
  <q-layout view="hHh lpR fFf">
    <q-header ref="header" bordered>
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
        <!-- A new version the quilter put off (spec 054): reopens the update dialog. -->
        <q-btn
          v-if="update.phase !== 'none' && !update.open"
          flat
          dense
          no-caps
          icon="system_update"
          :label="update.phase === 'ready' ? 'Update ready' : 'Update'"
          @click="update.open = true"
        />
        <ImageStatus />
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

    <!-- Settings fly-over: under the header (its gear closes it), over a darkened, blurred app. -->
    <Transition name="fly">
      <div
        v-if="settingsOpen"
        class="settings-fly"
        :style="{ top: `${headerHeight}px` }"
        @click.self="settingsOpen = false"
      >
        <div class="settings-sheet" role="dialog" aria-label="Settings">
          <SettingsPanel />
        </div>
      </div>
    </Transition>

    <q-page-container>
      <router-view />
    </q-page-container>
    <WelcomeWizard />
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { update } from '@/session/update';
import ImageStatus from '@/components/ImageStatus.vue';
import SaveStatus from '@/components/SaveStatus.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';
import WelcomeWizard from '@/components/WelcomeWizard.vue';
import { settingsOpen } from '@/composables/settings-open';
import { useProjectStore } from '@/stores/project';

const $q = useQuasar();
const project = useProjectStore();
const taking = ref(false);
const route = useRoute();
const header = ref<{ $el: HTMLElement }>();
const headerHeight = ref(0);
const measure = () => (headerHeight.value = header.value?.$el.offsetHeight ?? 0);
watch(settingsOpen, measure, { flush: 'post' });
onMounted(measure);
const closeOnEsc = (e: KeyboardEvent) => e.key === 'Escape' && (settingsOpen.value = false);
onMounted(() => window.addEventListener('keydown', closeOnEsc));
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEsc));
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
  { to: '/help', icon: 'help_outline', label: 'Help' },
  // Testing aids: dev server only (routes.ts).
  ...(import.meta.env.DEV ? [{ to: '/dev', icon: 'science', label: 'Tests' }] : []),
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
.settings-fly {
  position: fixed;
  inset: 0;
  z-index: 1999; /* under the header (2000), so the gear stays clickable */
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}
.settings-sheet {
  width: 100%; /* phones and tablets: the whole page */
  height: 100%;
  overflow-y: auto;
  background: #fff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.25);
}
@media (min-width: 1024px) {
  .settings-sheet {
    width: 50%;
  }
}
.body--dark .settings-sheet {
  background: var(--q-dark-page);
}
.fly-enter-active,
.fly-leave-active {
  transition:
    background-color 0.25s,
    backdrop-filter 0.25s;
}
.fly-enter-active .settings-sheet,
.fly-leave-active .settings-sheet {
  transition: transform 0.25s ease-out;
}
.fly-enter-from,
.fly-leave-to {
  background-color: transparent;
  backdrop-filter: blur(0);
}
.fly-enter-from .settings-sheet,
.fly-leave-to .settings-sheet {
  transform: translateX(100%);
}
.nav-active {
  background: rgba(255, 255, 255, 0.15);
}
</style>
