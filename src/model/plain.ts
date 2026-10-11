// Plain pieces: sashes, cornerstones, and border sides are colored as a built-in single-patch
// block, created in the project the first time one is painted.
import { produce } from 'immer';
import { newId } from './ids';
import type { RrqDoc } from './schema/project';
import type { Quilt } from './schema/quilt';

export const PLAIN_BLOCK = 'plain';
export const PLAIN_PATCH = 'p';

export type SlotGroup = 'block' | 'sash' | 'cs' | `border:${number}` | 'other';

export function slotGroup(slotId: string): SlotGroup {
  if (slotId.startsWith('b:')) return 'block';
  if (slotId.startsWith('sash:')) return 'sash';
  if (slotId.startsWith('cs:')) return 'cs';
  const m = /^border:(\d+):/.exec(slotId);
  return m ? `border:${Number(m[1])}` : 'other';
}

export const isPlainGroup = (g: SlotGroup) => g !== 'block' && g !== 'other';

export const hasPlainBlock = (doc: RrqDoc) => doc.project.blocks.some((b) => b.id === PLAIN_BLOCK);

export const ensurePlainBlock = (doc: RrqDoc) =>
  hasPlainBlock(doc)
    ? doc
    : produce(doc, (d) => {
        d.project.blocks.push({
          id: PLAIN_BLOCK,
          kind: 'grid',
          size: [1, 1],
          notecard: { name: 'Plain', tags: ['system'] },
          grid: { type: 'rectangle', params: {} },
          patches: [
            { id: PLAIN_PATCH, path: [['M', 0, 0], ['L', 1, 0], ['L', 1, 1], ['L', 0, 1], ['Z']] },
          ],
          colorings: [],
        });
      });

/** Place the plain block in empty plain-piece slots (sharing one new empty coloring). */
export const ensureSlotContent = (quilt: Quilt, slotIds: string[]) => {
  const empty = slotIds.filter((id) => isPlainGroup(slotGroup(id)) && !quilt.layers[0].slots[id]);
  if (!empty.length) return quilt;
  return produce(quilt, (q) => {
    let coloring: string;
    do coloring = newId();
    while (coloring in q.colorings);
    q.colorings[coloring] = { fills: {} };
    for (const id of empty) {
      q.layers[0].slots[id] = { block: PLAIN_BLOCK, coloring, rotation: 0, flip: false };
    }
  });
};
