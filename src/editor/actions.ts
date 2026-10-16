// What a tap does with the current tool. Pure: (document, tap, tool state) → new document and/or
// a selection change. The editor page applies the result through project.change (one undo step).
import { fillFor, paintOf } from './paint';
import { produce } from 'immer';
import { allPatches } from '@/model/blocks/patches';
import type { LibraryLookup } from '@/model/library-items';
import { fillKey, paint, resolveColoring, spray, swap } from '@/model/coloring';
import { newId } from '@/model/ids';
import {
  ensurePlainBlock,
  ensureSlotContent,
  isPlainGroup,
  PLAIN_PATCH,
  slotGroup,
} from '@/model/plain';
import type { Fill } from '@/model/schema/coloring';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import type { Hit } from '@/render/hit';
import type { Tool } from '@/stores/editor';
import { placementTargets, setTargets, sprayTargets, type Scope, type Space } from './scope';

export interface ToolState {
  tool: Tool;
  scope: Scope;
  block: string | null;
  color: string | null;
  /** Flip direction: 'h' mirrors left↔right, 'v' top↕bottom (as seen on screen). */
  flipAxis?: 'h' | 'v';
  /** Which of a block's colorings "Set" uses (default: its first). */
  coloringOf?: ReadonlyMap<string, string>;
  /** Library blocks can be set without being in the project yet (they embed on change). */
  library?: LibraryLookup;
}

type Orientation = { rotation: 0 | 90 | 180 | 270; flip: boolean };
const norm = (r: number) => (((r % 360) + 360) % 360) as Orientation['rotation'];
/** Mirror as seen on screen. Placement = rotate(r) ∘ flip(f), so a screen mirror becomes (−r, !f). */
const mirrorH = (o: Orientation): Orientation => ({ rotation: norm(-o.rotation), flip: !o.flip });
const mirrorV = (o: Orientation): Orientation => ({
  rotation: norm(180 - o.rotation),
  flip: !o.flip,
});

export interface Result {
  doc?: RrqDoc;
  selectBlock?: string;
  selectColor?: string;
  message?: string;
}

const withQuilt = (doc: RrqDoc, quilt: Quilt): RrqDoc =>
  produce(doc, (d) => {
    const i = d.project.quilts.findIndex((q) => q.id === quilt.id);
    d.project.quilts[i] = quilt;
  });

export function applyTool(
  doc: RrqDoc,
  quiltId: string,
  spaces: readonly Space[],
  hit: Hit,
  s: ToolState,
): Result {
  let quilt = doc.project.quilts.find((q) => q.id === quiltId);
  if (!quilt) return {};
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const patchesOf = (id: string) =>
    blocks.get(id) ? allPatches(blocks.get(id)!).map((p) => p.id) : [];
  const content = quilt.layers[0].slots[hit.slotId];
  const group = slotGroup(hit.slotId);
  const fillAtHit = (): Fill | undefined =>
    content
      ? resolveColoring(quilt!.colorings[content.coloring], blocks.get(content.block))?.fills[
          hit.patchId ?? PLAIN_PATCH
        ]
      : undefined;
  const blockOf = (id: string) => blocks.get(id);

  switch (s.tool) {
    case 'set': {
      const block = s.block ? (blocks.get(s.block) ?? s.library?.block(s.block)) : undefined;
      if (!block) return { message: 'Pick a block in the tray first.' };
      const targets = setTargets(spaces, hit.slotId, s.scope);
      if (!targets.length)
        return {
          message: /^strip:[^:]+:u\d/.test(hit.slotId)
            ? 'This is a pieced strip, so it takes fabric. Make it a block strip in the Layout tab to set blocks.'
            : hit.slotId.startsWith('strip:')
              ? 'Strip patterns take fabric, not blocks. Use Paint.'
              : group === 'cs'
                ? "This cornerstone isn't square, so it takes fabric. Use Paint."
                : 'Sashing and borders take fabric, not blocks. Use Paint.',
        };
      return {
        doc: withQuilt(
          doc,
          produce(quilt, (q) => {
            let coloring: string;
            do coloring = newId();
            while (coloring in q.colorings);
            const chosen = s.coloringOf?.get(block.id);
            const src = block.colorings.find((c) => c.id === chosen) ?? block.colorings[0];
            // Follows the block's coloring; recoloring in the quilt adds overrides.
            q.colorings[coloring] = src ? { base: src.id, fills: {} } : { fills: {} };
            for (const t of targets)
              q.layers[0].slots[t] = { block: block.id, coloring, rotation: 0, flip: false };
            pruneColorings(q);
          }),
        ),
      };
    }
    case 'rotate':
    case 'flip':
    case 'erase': {
      if (!content) return {};
      const targets = placementTargets(quilt, spaces, hit.slotId, s.scope);
      return {
        doc: withQuilt(
          doc,
          produce(quilt, (q) => {
            for (const t of targets) {
              const c = q.layers[0].slots[t];
              if (!c) continue;
              if (s.tool === 'erase') delete q.layers[0].slots[t];
              else if (s.tool === 'flip')
                Object.assign(c, s.flipAxis === 'v' ? mirrorV(c) : mirrorH(c));
              else c.rotation = ((c.rotation + 90) % 360) as typeof c.rotation;
            }
            pruneColorings(q);
          }),
        ),
      };
    }
    case 'find':
      return content ? { selectBlock: content.block } : {};
    case 'eyedropper': {
      const paint = paintOf(fillAtHit());
      return paint ? { selectColor: paint } : { message: 'No color or fabric here.' };
    }
    case 'paint':
    case 'spray':
    case 'swap': {
      if (!s.color) return { message: 'Pick a color in the tray first.' };
      if (!content && !isPlainGroup(group)) return { message: 'Set a block here first.' };
      const fill: Fill = fillFor(s.color);
      let next = doc;
      if (isPlainGroup(group)) {
        next = ensurePlainBlock(next);
        const scopeIds =
          s.scope === 'this'
            ? [hit.slotId]
            : spaces.filter((x) => slotGroup(x.id) === group).map((x) => x.id);
        quilt = ensureSlotContent(quilt, scopeIds);
      }
      const match = fillAtHit();
      if (s.tool === 'swap') {
        quilt = swap(quilt, match, fill, patchesOf, blockOf);
      } else if (s.tool === 'spray') {
        const targets = sprayTargets(quilt, spaces, hit.slotId, s.scope);
        quilt = spray(quilt, targets, match, fill, patchesOf, blockOf);
      } else {
        const targets = placementTargets(quilt, spaces, hit.slotId, s.scope);
        quilt = paint(quilt, targets, hit.patchId ?? PLAIN_PATCH, fill, blockOf);
      }
      if (fillKey(match) === fillKey(fill) && s.tool !== 'paint') return {};
      return { doc: withQuilt(next, quilt) };
    }
    default:
      return {};
  }
}

function pruneColorings(q: { layers: Quilt['layers']; colorings: Quilt['colorings'] }) {
  const used = new Set(Object.values(q.layers[0].slots).map((s) => s.coloring));
  for (const item of q.layers.flatMap((l) => l.items)) if (item.coloring) used.add(item.coloring);
  for (const id of Object.keys(q.colorings)) if (!used.has(id)) delete q.colorings[id];
}
