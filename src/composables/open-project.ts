import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

/** Run an open action, report problems, and go to the project. */
export function useOpenProject() {
  const $q = useQuasar();
  const router = useRouter();

  async function openWith(action: () => Promise<string[]>) {
    try {
      const report = await action();
      if (report.length) {
        $q.notify({
          type: 'warning',
          message: `Opened with ${report.length} problem(s): ${report.slice(0, 3).join('; ')}`,
          timeout: 8000,
        });
      }
      await router.push('/project');
    } catch (e) {
      $q.notify({ type: 'negative', message: (e as Error).message });
    }
  }
  return { openWith };
}
