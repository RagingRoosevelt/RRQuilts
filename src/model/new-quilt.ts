import { newId } from './ids';
import type { Border, Layout, Quilt } from './schema/quilt';

export const createQuilt = (name: string, layout: Layout, borders: Border[]): Quilt => ({
  id: newId(),
  notecard: { name },
  layout,
  borders,
  colorings: {},
  layers: [
    { visible: true, slots: {}, items: [] },
    { visible: true, items: [] },
    { visible: true, items: [] },
  ],
});

/** "Name (2)", "Name (3)", … not already used. */
export function variationName(name: string, taken: string[]): string {
  const base = name.replace(/ \(\d+\)$/, '');
  for (let n = 2; ; n++) if (!taken.includes(`${base} (${n})`)) return `${base} (${n})`;
}
