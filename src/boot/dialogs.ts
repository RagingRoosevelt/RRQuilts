import { defineBoot } from '#q-app';
import { Dialog } from 'quasar';
import AppDialog from '@/components/AppDialog.vue';

// Quick dialogs ($q.dialog, Dialog.create) open as AppDialog: Quasar's, with an X to close them.
export default defineBoot(({ app }) => {
  const create = Dialog.create.bind(Dialog);
  const withClose: typeof Dialog.create = (opts) =>
    opts.component ? create(opts) : create({ component: AppDialog, componentProps: opts });
  Dialog.create = withClose;
  app.config.globalProperties.$q.dialog = withClose;
});
