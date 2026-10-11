import { defineBoot } from '#q-app';
import { useSettingsStore } from '@/stores/settings';

// Apply persisted settings (theme) before the first render.
export default defineBoot(() => {
  useSettingsStore().applyTheme();
});
