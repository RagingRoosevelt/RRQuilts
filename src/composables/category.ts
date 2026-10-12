import { Dialog } from 'quasar';
import { addCategory } from '@/model/library';
import { useLibraryStore } from '@/stores/library';
import { useAuthor } from './author';

const NEW = '\u0000new';

/**
 * Pick a My-library category, or create one on the spot. Resolves to its id, undefined for
 * Uncategorized, or null when cancelled.
 */
export function useAskCategory() {
  const library = useLibraryStore();
  const askAuthor = useAuthor();
  async function create(name: string) {
    const lib = library.ensureMine(await askAuthor());
    const same = lib.categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (same) return same.id;
    const r = addCategory(lib, name);
    await library.saveMine(r.lib);
    return r.category.id;
  }
  return (title: string, current = ''): Promise<string | undefined | null> =>
    new Promise((resolve) => {
      const cats = library.mine?.categories ?? [];
      Dialog.create({
        title,
        message: 'Category',
        options: {
          type: 'radio',
          model: current,
          items: [
            { label: 'Uncategorized', value: '' },
            ...cats.map((c) => ({ label: c.name, value: c.id })),
            { label: 'New category…', value: NEW },
          ],
        },
        cancel: true,
      })
        .onOk((v: string) => {
          if (v !== NEW) return resolve(v || undefined);
          Dialog.create({
            title: 'New category',
            prompt: { model: '', type: 'text', isValid: (s: string) => !!s.trim() },
            cancel: true,
          })
            .onOk((name: string) => void create(name.trim()).then(resolve))
            .onCancel(() => resolve(null));
        })
        .onCancel(() => resolve(null));
    });
}
