import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { ref, watch } from 'vue';
import { display, imagesTick } from '@/render/fabric-images';
import { loadSettings, saveSettings, type Settings } from '@/settings/settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(loadSettings());
  // False when this browser won't keep settings (private mode, blocked storage).
  const persisted = ref(true);

  const applyTheme = () => {
    Dark.set(settings.value.theme === 'auto' ? 'auto' : settings.value.theme === 'dark');
    document.documentElement.classList.toggle('os-accent', settings.value.osAccent);
    // Fabric image display (spec 014); a change redraws everything that shows fabrics.
    const { fabricImages, imageSize } = settings.value;
    if (display.mode !== fabricImages || display.size !== imageSize) {
      Object.assign(display, { mode: fabricImages, size: imageSize });
      imagesTick.value++;
    }
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
