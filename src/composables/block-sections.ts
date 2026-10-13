// Collapsible block sections (components/BlockSections.vue): remembered open/closed keys, heading
// anchors, and revealing a section from elsewhere (table of contents, "show the original").
import { nextTick } from 'vue';
import type { BlockSection } from '@/model/library';
import { useSettingsStore } from '@/stores/settings';

/** The library-level header of a block list (BlockSections' `title`). */
export const ROOT = '\u0000library';
/** `settings.collapsedSections` entry for a collapsed section. */
export const sectionKey = (lib: string, k: string) => `libsec:${lib}:${k}`;
/** DOM id of a section's heading. */
export const sectionAnchor = (lib: string, k: string) => `sec-${lib}-${k}`.replace(/[^\w-]/g, '-');

/** Open the library header, `sec` and its category, then scroll to `id` (default: the heading). */
export function revealSection(lib: string, sec?: BlockSection, id?: string) {
  const settings = useSettingsStore();
  const open = [ROOT, sec?.key, sec?.parent].flatMap((k) =>
    k === undefined ? [] : [sectionKey(lib, k)],
  );
  settings.settings.collapsedSections = settings.settings.collapsedSections.filter(
    (k) => !open.includes(k),
  );
  return nextTick(() =>
    document
      .getElementById(id ?? sectionAnchor(lib, sec?.key ?? ROOT))
      ?.scrollIntoView({ behavior: 'smooth', block: id ? 'center' : 'start' }),
  );
}
