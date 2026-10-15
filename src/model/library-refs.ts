// Which libraries a project uses (spec 014 FR-032), so a device without one can offer to add it.
import { isLibraryItem } from './library-items';
import type { LibraryRef, RrqDoc } from './schema/project';

/** Where a library can be found again, as known on this device. */
export interface LibraryWhere {
  url?: string;
  ref?: string;
  file?: string;
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
    const ref = refs.get(s.libraryId) ?? {
      id: s.libraryId,
      name: s.library ?? s.libraryId,
      ...(s.author ? { author: s.author } : {}),
      ...where(s.libraryId),
      packs: [s.libraryId],
    };
    refs.set(s.libraryId, ref);
  }
  return [...refs.values()];
}
