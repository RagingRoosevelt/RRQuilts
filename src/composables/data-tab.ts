// The Data Quilts nav tab (spec 041): hidden at first, shown once a data quilt is opened or made;
// once the quilter hides it, going to Data Quilts asks whether to show it again.
import { useQuasar } from 'quasar';
import { useSettingsStore } from '@/stores/settings';

export function useDataTab() {
  const $q = useQuasar();
  const app = useSettingsStore();

  /** A data quilt was opened or made: the tab shows (unless the quilter hid it). */
  function seen() {
    if (app.settings.dataTab === 'auto') app.settings.dataTab = 'on';
  }

  /** Going to Data Quilts: when the tab was hidden on purpose, offer to show it. Resolves either way. */
  function ask(): Promise<void> {
    if (app.settings.dataTab !== 'off') {
      seen();
      return Promise.resolve();
    }
    return new Promise((done) => {
      $q.dialog({
        title: 'The Data Quilts tab is hidden',
        message: 'You turned the Data Quilts tab off in Settings. Show it again?',
        ok: { label: 'Show it', unelevated: true, noCaps: true },
        cancel: { label: 'Keep it hidden', flat: true, noCaps: true },
      })
        .onOk(() => (app.settings.dataTab = 'on'))
        .onDismiss(done);
    });
  }

  return { seen, ask };
}
