import { Dialog } from 'quasar';
import { useSettingsStore } from '@/stores/settings';

/** The user's author name, asking once the first time they create something (spec 008). */
export function useAuthor() {
  const store = useSettingsStore();
  return (): Promise<string> =>
    new Promise((resolve) => {
      const s = store.settings;
      if (s.authorAsked) return resolve(s.author);
      const done = (name: string) => {
        s.author = name.trim().slice(0, 100);
        s.authorAsked = true;
        resolve(s.author);
      };
      Dialog.create({
        title: 'Your name',
        message:
          'How should you be credited? It appears in projects and blocks you share, and in the ids of things you create. You can change it in Settings.',
        prompt: { model: '', type: 'text', placeholder: 'anonymous' },
        ok: 'Save',
        cancel: 'Skip',
        persistent: true,
      })
        .onOk((name: string) => done(name))
        .onCancel(() => done(''))
        // Closed with the X: no name for now, asked again next time.
        .onDismiss(() => resolve(s.author));
    });
}
