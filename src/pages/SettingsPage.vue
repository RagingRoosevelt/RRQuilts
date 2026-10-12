<template>
  <q-page padding>
    <div class="q-gutter-lg" style="max-width: 520px">
      <h1 class="text-h5">Settings</h1>

      <q-banner v-if="!store.persisted" class="bg-warning text-dark" rounded>
        This browser isn't keeping settings (private mode or blocked storage). Export them to keep a
        copy.
      </q-banner>

      <div>
        <div class="text-subtitle1">Theme</div>
        <q-btn-toggle
          v-model="store.settings.theme"
          no-caps
          :options="[
            { label: 'Auto', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]"
        />
      </div>

      <div>
        <div class="text-subtitle1">Units for new projects</div>
        <q-btn-toggle
          v-model="store.settings.units"
          no-caps
          :options="[
            { label: 'Inches', value: 'in' },
            { label: 'Centimeters', value: 'cm' },
          ]"
        />
        <div class="text-caption text-grey-7 q-mt-xs">
          An open project's units are in its Details tab.
        </div>
      </div>

      <div>
        <div class="text-subtitle1">Your name</div>
        <q-input
          v-model.trim="store.settings.author"
          outlined
          dense
          maxlength="100"
          placeholder="anonymous"
          :hint="`Shown in projects, blocks, and packs you share. Ids of items you create start with “${slug}.” (existing items keep theirs).`"
          @update:model-value="store.settings.authorAsked = true"
        />
      </div>

      <div class="text-caption text-grey-7">RRQuilts {{ version }} · build {{ build }}</div>

      <div class="q-gutter-sm">
        <div class="text-subtitle1">Settings file (.rrq_conf)</div>
        <q-btn outline icon="download" label="Export" @click="exportConf" />
        <q-btn outline icon="upload" label="Import" @click="fileInput?.click()" />
        <input
          ref="fileInput"
          type="file"
          accept=".rrq_conf,application/json"
          hidden
          @change="importConf"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { authorSlug } from '@/model/identity';
import { parseConf, toConf } from '@/settings/settings';
import { useSettingsStore } from '@/stores/settings';

const $q = useQuasar();
const store = useSettingsStore();
const fileInput = ref<HTMLInputElement>();
const slug = computed(() => authorSlug(store.settings.author));
const version = import.meta.env.APP_VERSION;
// The main bundle's hashed file name changes with every build (dev server shows "dev").
const mainScript = document.querySelector<HTMLScriptElement>(
  'script[type="module"][src*="/assets/index-"]',
);
const build = /index-([\w-]+)\.js$/.exec(mainScript?.src ?? '')?.[1] ?? 'dev';

function exportConf() {
  const doc = toConf(store.settings, import.meta.env.APP_VERSION);
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'settings.rrq_conf';
  a.click();
  URL.revokeObjectURL(url);
}

async function importConf(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  const result = parseConf(await file.text());
  if (!result.ok) {
    $q.notify({ type: 'negative', message: result.error });
    return;
  }
  store.replace(result.settings);
  $q.notify({
    type: result.invalid.length ? 'warning' : 'positive',
    message: result.invalid.length
      ? `Settings imported; reset to defaults: ${result.invalid.join(', ')}`
      : 'Settings imported.',
  });
}
</script>
