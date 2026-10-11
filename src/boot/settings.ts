import { defineBoot } from '#q-app';
import { useLibraryStore } from '@/stores/library';
import { useSettingsStore } from '@/stores/settings';

// Apply persisted settings (theme) and load the built-in library before the first render.
export default defineBoot(async () => {
  useSettingsStore().applyTheme();
  await useLibraryStore().loaded;
});
