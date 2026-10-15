// Which libraries a project uses (spec 014 FR-032), so a device without one can offer to add it.
import { isLibraryItem } from './library-items';
import type { LibraryRef, RrqDoc } from './schema/project';

/** Where a library can be found again, as known on this device. */
export interface LibraryWhere {
  url?: string;
  ref?: string;
  file?: string;
  /** The library a pack belongs to: refs are grouped under it. */
  library?: { id: string; name: string };
}

/** The project's library references, rebuilt from its items' sources (`where`: per library id). */
export function libraryRefs(
  doc: RrqDoc,
  where: (libraryId: string) => LibraryWhere | undefined = () => undefined,
): LibraryRef[] {
  const p = doc.project;
  const refs = new Map<string, LibraryRef>();
  for (const x of [...p.blocks, ...p.palette.colors, ...p.palette.fabrics]) {
    if (!isLibraryItem(x) || !x.source) continue;
    const s = x.source;
    const { library, ...at } = where(s.libraryId) ?? {};
    const id = library?.id ?? s.libraryId;
    const ref = refs.get(id) ?? {
      id,
      name: library?.name ?? s.library ?? s.libraryId,
      ...(s.author && !library ? { author: s.author } : {}),
      ...at,
      packs: [],
    };
    if (!ref.packs.includes(s.libraryId)) ref.packs.push(s.libraryId);
    refs.set(id, ref);
  }
  return [...refs.values()];
}
