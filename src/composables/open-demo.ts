// Open a demo project (public/demo): from a /?open_url= link, the welcome wizard, or the home page.
// Opened like a picked file with no place to save back to: Save asks where.
import { useQuasar } from 'quasar';
import { useOpenProject } from '@/composables/open-project';
import { demoText } from '@/storage/demo';
import { useProjectStore } from '@/stores/project';

export function useOpenDemo() {
  const $q = useQuasar();
  const project = useProjectStore();
  const { openWith } = useOpenProject();
  return async (name: string) => {
    const done = $q.notify({
      group: false,
      timeout: 0,
      spinner: true,
      message: `Opening ${name}…`,
    });
    try {
      const text = await demoText(name);
      await openWith(() => project.openFile({ file: new File([text], name) }));
    } catch (e) {
      $q.notify({ type: 'negative', message: e instanceof Error ? e.message : String(e) });
    } finally {
      done();
    }
  };
}
