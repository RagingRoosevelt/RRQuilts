// What a tap does with the current tool. Pure: (document, tap, tool state) → new document and/or
// a selection change. The editor page applies the result through project.change (one undo step).
import { shownColorway, swapper } from '@/model/colorways';
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
import type { Quilt, Rotation } from '@/model/schema/quilt';
import { SHAPE_NAME, SHAPE_TURN, shapeOrient, type BlockShape } from '@/model/blocks/shape';
import { mul, orient, type M } from '@/model/geometry/affine';
import type { Hit } from '@/render/hit';
import type { Tool } from '@/stores/editor';
import {
  placementTargets,
  setTargets,
  sprayTargets,
  takesBlock,
  type Scope,
  type Space,
} from './scope';

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
  /** Paint this fill instead of `color`'s (a data paint over its color, spec 025); null clears. */
  fill?: Fill | null;
}

type Orientation = { rotation: Rotation; flip: boolean };
const norm = (r: number) => (((r % 360) + 360) % 360) as Orientation['rotation'];
/** Mirror as seen on screen. Placement = rotate(r) ∘ flip(f), so a screen mirror becomes (−r, !f). */
const mirrorH = (o: Orientation): Orientation => ({ rotation: norm(-o.rotation), flip: !o.flip });
const mirrorV = (o: Orientation): Orientation => ({
  rotation: norm(180 - o.rotation),
  flip: !o.flip,
});

/**
 * A flip as seen on the quilt: the turn and flip that mirror a placed block across the quilt's
 * up-down axis (`h`, left↔right) or left-right axis (`v`), whatever angle its space sits at
 * (On-Point spaces are turned 45°, so the block's own axes run diagonally there). Null when no
 * turn the block allows does it (then it mirrors across its own axis).
 */
function quiltMirror(
  c: Orientation,
  axis: 'h' | 'v',
  t: M | undefined,
  shape: BlockShape | undefined,
): Orientation | null {
  if (!t) return null;
  const o = (r: number, f: boolean) =>
    shape ? shapeOrient(shape, r, f) : orient(r as 0 | 90 | 180 | 270, f);
  const mirror: M = axis === 'h' ? [-1, 0, 0, 1, 0, 0] : [1, 0, 0, -1, 0, 0];
  const want = mul(mirror, mul(t, o(c.rotation, c.flip)));
  const size = Math.max(...want.slice(0, 4).map(Math.abs));
  const step = shape ? SHAPE_TURN[shape] : 90;
  for (let r = 0; r < 360; r += step)
    for (const f of [false, true]) {
      const got = mul(t, o(r, f));
      if (got.slice(0, 4).every((v, i) => Math.abs(v - want[i]!) < 1e-6 * size))
        return { rotation: r as Rotation, flip: f };
    }
  return null;
}

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
      const targets = setTargets(spaces, hit.slotId, s.scope, block.shape ?? null);
      const here = spaces.find((x) => x.id === hit.slotId);
      const spaceShape =
        here?.shape && here.shape in SHAPE_NAME ? (here.shape as BlockShape) : null;
      if (!targets.length && here && takesBlock(here))
        return {
          message: spaceShape
            ? `This space takes ${SHAPE_NAME[spaceShape].toLowerCase()} blocks.`
            : `${SHAPE_NAME[block.shape!]} blocks go in ${SHAPE_NAME[block.shape!].toLowerCase()} spaces (Shaped Blocks, Baby Blocks, Diamond Point).`,
        };
      if (!targets.length)
        return {
          message: hit.slotId.startsWith('p:')
            ? 'Patches take colors and fabrics. Use Paint.'
            : /^strip:[^:]+:u\d/.test(hit.slotId)
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
      const spaceOf = new Map(spaces.map((x) => [x.id, x]));
      return {
        doc: withQuilt(
          doc,
          produce(quilt, (q) => {
            for (const t of targets) {
              const c = q.layers[0].slots[t];
              if (!c) continue;
              const shape = blockOf(c.block)?.shape;
              if (s.tool === 'erase') delete q.layers[0].slots[t];
              // Flip across the quilt's axis; when the block can't (a triangle has no top↕bottom
              // mirror that keeps its outline), across its own, left↔right for a triangle.
              else if (s.tool === 'flip')
                Object.assign(
                  c,
                  quiltMirror(c, s.flipAxis ?? 'h', spaceOf.get(t)?.transform, shape) ??
                    (s.flipAxis === 'v' && shape !== 'triangle' ? mirrorV(c) : mirrorH(c)),
                );
              else c.rotation = norm(c.rotation + (shape ? SHAPE_TURN[shape] : 90));
            }
            pruneColorings(q);
          }),
        ),
      };
    }
    case 'find':
      return content ? { selectBlock: content.block } : {};
    case 'eyedropper': {
      const paint = paintOf(swapper(shownColorway(quilt))(fillAtHit()));
      return paint ? { selectColor: paint } : { message: 'No color or fabric here.' };
    }
    case 'paint':
    case 'spray':
    case 'swap': {
      // Another colorway than the primary: its colors are set in its mapping (the Colors tab).
      if (quilt.shownColorway)
        return {
          message:
            "This colorway's colors are set in the Colors tab. Show the primary colorway to paint.",
        };
      if (!s.color && s.fill === undefined) return { message: 'Pick a color in the tray first.' };
      // An empty block space takes a plain fill, as sashing does (spec 026).
      const plainBlockSpace = group === 'block' && !content;
      if (!content && !isPlainGroup(group) && !plainBlockSpace)
        return { message: 'Set a block here first.' };
      const fill = s.fill !== undefined ? (s.fill ?? undefined) : fillFor(s.color!);
      let next = doc;
      if (isPlainGroup(group) || plainBlockSpace) {
        next = ensurePlainBlock(next);
        const alt = spaces.find((x) => x.id === hit.slotId)?.alt;
        const scopeIds =
          s.scope === 'this'
            ? [hit.slotId]
            : spaces
                .filter((x) => slotGroup(x.id) === group)
                .filter((x) => !plainBlockSpace || s.scope === 'all' || x.alt === alt)
                .map((x) => x.id);
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
