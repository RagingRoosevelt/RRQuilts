import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { ref, watch } from 'vue';
import { loadSettings, saveSettings, type Settings } from '@/settings/settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(loadSettings());
  // False when this browser won't keep settings (private mode, blocked storage).
  const persisted = ref(true);

  const applyTheme = () => {
    Dark.set(settings.value.theme === 'auto' ? 'auto' : settings.value.theme === 'dark');
    document.documentElement.classList.toggle('os-accent', settings.value.osAccent);
  };

  watch(
    settings,
    (s) => {
      persisted.value = saveSettings(s);
      applyTheme();
    },
    { deep: true },
  );

  function replace(next: Settings) {
    settings.value = next;
  }

  return { settings, persisted, applyTheme, replace };
});
