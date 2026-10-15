import { Dialog } from 'quasar';
import { categoryTree, ensureCategory } from '@/model/library';
import type { LibraryDoc } from '@/model/schema/library';

type Kind = 'block' | 'colors';
import { useLibraryStore } from '@/stores/library';
import CategoryPicker, { type PickerItem } from '@/components/CategoryPicker.vue';
import { useAuthor } from './author';

const NEW = '\u0000new';
/** A category another library uses, by path ("Stars/Eight-point stars"): made in My library when picked. */
const PATH = '\u0000path:';

/**
 * Pick a My-library category, take one another library uses (copied into My library), or create
 * one on the spot. Resolves to its id, undefined for Uncategorized, or null when cancelled.
 */
export function useAskCategory() {
  const library = useLibraryStore();
  const askAuthor = useAuthor();
  async function create(path: string) {
    const lib = library.ensureMine(await askAuthor());
    const r = ensureCategory(lib, path);
    if (r.lib !== lib) await library.saveMine(r.lib);
    return r.id;
  }
  /**
   * Whether category `id` of `doc` suits items of `kind`: some item of that kind is in it (or in one
   * of its subcategories). With `unusedOk`, a category nothing is in yet suits too.
   */
  function suits(doc: LibraryDoc, id: string, kind: Kind | undefined, unusedOk: boolean) {
    if (!kind) return true;
    const ids = new Set([id, ...doc.categories.filter((c) => c.parent === id).map((c) => c.id)]);
    const inIt = doc.items.filter((i) => i.category && ids.has(i.category));
    return inIt.some((i) => i.type === kind) || (unusedOk && !inIt.length);
  }
  /** Categories other libraries use that My library lacks (by path), A–Z, subcategories indented. */
  function fromOthers(kind: Kind | undefined): PickerItem[] {
    const mine = new Set(
      categoryTree(library.mine?.categories ?? []).map((c) => c.label.toLowerCase()),
    );
    const tree = new Map<string, Set<string>>();
    for (const v of library.views)
      if (v.doc.kind !== 'personal')
        for (const c of categoryTree(v.doc.categories)) {
          if (!suits(v.doc, c.id, kind, false)) continue;
          const [top, sub] = c.label.split(' / ');
          const subs = tree.get(top!) ?? new Set<string>();
          if (sub) subs.add(sub);
          tree.set(top!, subs);
        }
    const byName = (a: string, b: string) => a.localeCompare(b);
    return [...tree.keys()].sort(byName).flatMap((top) => {
      const subs = [...tree.get(top)!]
        .filter((s) => !mine.has(`${top} / ${s}`.toLowerCase()))
        .sort(byName);
      if (mine.has(top.toLowerCase()) && !subs.length) return [];
      return [
        { label: top, value: `${PATH}${top}`, depth: 0 },
        ...subs.map((s) => ({ label: s, value: `${PATH}${top}/${s}`, depth: 1 })),
      ];
    });
  }
  /** `kind`: what is being categorized; categories only the other kind uses aren't offered. */
  return (title: string, current = '', kind?: Kind): Promise<string | undefined | null> =>
    new Promise((resolve) => {
      const mineDoc = library.mine;
      const mine = categoryTree(mineDoc?.categories ?? [])
        .filter((c) => !mineDoc || c.id === current || suits(mineDoc, c.id, kind, true))
        .map((c) => ({ label: c.name, value: c.id, depth: c.depth }));
      const others = fromOthers(kind);
      const items: PickerItem[] = [
        { label: 'Uncategorized', value: '', depth: 0 },
        ...mine,
        ...(others.length
          ? [
              { label: '', value: '', depth: 0, rule: true },
              { label: 'From other libraries', value: '', depth: 0, header: true },
              ...others,
            ]
          : []),
        { label: '', value: '', depth: 0, rule: true },
        { label: 'New category…', value: NEW, depth: 0 },
      ];
      Dialog.create({ component: CategoryPicker, componentProps: { title, items, current } })
        .onOk((v: string) => {
          if (v.startsWith(PATH)) return void create(v.slice(PATH.length)).then(resolve);
          if (v !== NEW) return resolve(v || undefined);
          Dialog.create({
            title: 'New category',
            message: 'For a subcategory, write its category first: Stars/Eight-point stars',
            prompt: { model: '', type: 'text', isValid: (s: string) => !!s.trim() },
            cancel: true,
          })
            .onOk((name: string) => void create(name.trim()).then(resolve))
            .onCancel(() => resolve(null));
        })
        .onCancel(() => resolve(null));
    });
}
