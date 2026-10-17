import { ref } from 'vue';

/** The settings fly-over (MainLayout) is open. */
export const settingsOpen = ref(false);

/** The welcome wizard (MainLayout) is open: first visit, or asked for again in Settings. */
export const welcomeOpen = ref(false);
