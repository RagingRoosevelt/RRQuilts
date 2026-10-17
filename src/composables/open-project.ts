import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { draftText, UnreadableDraft } from '@/storage/drafts';
import { exportFile } from '@/storage/files';

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
      // Unsaved work that can't be opened: kept, and offered as a file to fix by hand.
      const d = e instanceof UnreadableDraft ? e.draft : undefined;
      $q.notify({
        type: 'negative',
        message: (e as Error).message,
        ...(d
          ? {
              caption: 'The unsaved changes are kept. Download them to fix the file by hand.',
              timeout: 0,
              actions: [
                {
                  label: 'Download',
                  color: 'white',
                  handler: () =>
                    void exportFile(`${d.name} (unsaved changes)`, draftText(d), 'rrq'),
                },
                { label: 'Close', color: 'white' },
              ],
            }
          : {}),
      });
    }
  }
  return { openWith };
}
