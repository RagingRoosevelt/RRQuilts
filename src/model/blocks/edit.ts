// Apply a seam-line drawing change to a block in a project, keeping patch ids and colors stable.
import { produce } from 'immer';
import { pathPolygon } from '../geometry/path';
import type { Drawing } from '../schema/block';
import type { RrqDoc } from '../schema/project';
import { deriveSeamPatches } from './derive';
import { assignIds, remapColoring, remapSections } from './remap';

export interface SeamEditResult {
  doc: RrqDoc;
  /** Segments not connected to the outline (shown to the user). */
  unconnected: string[];
}

/** Returns an updated copy of the document; the input is not modified. */
export function applySeamEdit(doc: RrqDoc, blockId: string, drawing: Drawing): SeamEditResult {
  const original = doc.project.blocks.find((b) => b.id === blockId);
  if (original?.kind !== 'seam') throw new Error(`Block ${blockId} is not a seam-line block.`);
  const size = original.size;
  const derived = deriveSeamPatches(drawing, size, original.shape);
  const old = original.patches.map((p) => ({ id: p.id, poly: pathPolygon(p.path, size) }));
  const oldIds = new Set(old.map((p) => p.id));
  const assignments = assignIds(old, derived.patches);

  const out = produce(doc, (draft) => {
    const block = draft.project.blocks.find((b) => b.id === blockId);
    if (block?.kind !== 'seam') return;

    block.drawing = drawing;
    block.patches = derived.patches.map((p, i) => ({ id: assignments[i]!.id, path: p.path }));
    if (derived.unconnected.length) block.unconnected = derived.unconnected;
    else delete block.unconnected;
    block.colorings = block.colorings.map((c) => remapColoring(c, assignments, oldIds));
    if (block.foundation) {
      block.foundation.sections = remapSections(block.foundation.sections, assignments);
    }

    // Quilt colorings used by placements of this block follow the same mapping.
    for (const q of draft.project.quilts) {
      const used = new Set<string>();
      for (const s of Object.values(q.layers[0].slots))
        if (s.block === blockId) used.add(s.coloring);
      for (const item of q.layers.flatMap((l) => l.items)) {
        if (item.ref === blockId && item.coloring) used.add(item.coloring);
      }
      for (const id of used) {
        const c = q.colorings[id];
        if (c) q.colorings[id] = remapColoring(c, assignments, oldIds);
      }
    }
  });
  return { doc: out, unconnected: derived.unconnected };
}
