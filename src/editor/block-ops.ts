// Block-level operations for the block editor (pure; results go through project.change).
import { produce } from 'immer';
import {
  DEFAULT_LICENSE,
  creditCopy,
  licenseName,
  needsCredit,
  priorCredits,
} from '@/model/credits';
import { deriveSeamPatches } from '@/model/blocks/derive';
import { newId } from '@/model/ids';
import { itemId } from '@/model/identity';
import { variationName } from '@/model/new-quilt';
import type { BlockShape } from '@/model/blocks/shape';
import type { Block, SeamBlock } from '@/model/schema/block';
import type { Units } from '@/model/schema/project';
import type { Guide, NodeMode } from './draw-ops';
import { defaultSnap, snapGrid, type SnapSettings } from './snap';

export interface BlockEditorSettings {
  snap: SnapSettings;
  graph: { show: boolean; step: number };
  guides: Guide[];
  showPatches: boolean;
}

/** Saved editor settings with defaults for anything missing. */
export function editorSettings(block: Block, units: Units): BlockEditorSettings {
  const e = (block.editor ?? {}) as Partial<BlockEditorSettings>;
  return {
    snap: snapGrid(e.snap ?? {}, units, block.shape),
    graph: { show: false, step: units === 'cm' ? 1 : 0.5, ...e.graph },
    guides: e.guides ?? [],
    showPatches: e.showPatches ?? true,
  };
}

export function newBlock(
  name: string,
  size: [number, number],
  units: Units,
  author = '',
  license = DEFAULT_LICENSE,
  shape?: BlockShape,
): SeamBlock {
  const drawing = { nodes: [], segments: [] };
  const patches = deriveSeamPatches(drawing, size, shape).patches;
  return {
    id: itemId(author),
    kind: 'seam',
    size,
    ...(shape ? { shape } : {}),
    notecard: { name },
    drawing,
    patches: patches.map((p) => ({ id: newId(), path: p.path })),
    colorings: [{ id: newId(), name: 'Coloring 1', fills: {} }],
    editor: { snap: defaultSnap(units, shape) },
    ...(author ? { author } : {}),
    license,
  };
}

/** Copy for "Edit a copy": the author's own id, "(2)" name, everyone before credited. */
export function copyBlock(
  block: Block,
  takenNames: string[],
  author = '',
  projectLicense?: string,
): Block {
  return produce(block, (b) => {
    creditCopy(b, author, projectLicense);
    b.id = itemId(author);
    b.notecard.name = variationName(block.notecard.name, takenNames);
    delete b.version; // stamped on save; revisions restart for the new item
    delete b.revision;
  });
}

/** After a drawing edit, others' work becomes a derived work credited to them (Principle VI). */
export const markDerived = (block: Block, me = '', projectLicense?: string): Block =>
  needsCredit(block, me) ? produce(block, (b) => creditCopy(b, me, projectLicense)) : block;

/** "From Ohio Star by …" for library items, "Based on Ohio Star by A, B" for derived work, or null. */
export function attribution(block: Block): string | null {
  const s = block.source;
  if (s && !s.derived) {
    const lib = [s.library, s.license && licenseName(s.license)].filter(Boolean).join(', ');
    return `From ${s.name ?? s.itemId}${s.author ? ` by ${s.author}` : ''}${lib ? ` (${lib})` : ''}`;
  }
  const credits = priorCredits(block);
  if (!credits.length) return null;
  const authors = [...new Set(credits.map((c) => c.author ?? 'anonymous'))].join(', ');
  return `Based on ${credits[0]!.name ?? 'earlier work'} by ${authors}`;
}

export function saveColoringAs(block: Block, fromId: string): { block: Block; id: string } {
  const id = newId();
  const next = produce(block, (b) => {
    const src = b.colorings.find((c) => c.id === fromId) ?? b.colorings[0];
    const n = b.colorings.length + 1;
    b.colorings.push({ id, name: `Coloring ${n}`, fills: { ...(src?.fills ?? {}) } });
  });
  return { block: next, id };
}

export const renameColoring = (block: Block, id: string, name: string) =>
  produce(block, (b) => {
    const c = b.colorings.find((x) => x.id === id);
    if (c) c.name = name;
  });

/** Delete a coloring; the last one is kept. */
export const deleteColoring = (block: Block, id: string) =>
  block.colorings.length <= 1
    ? block
    : produce(block, (b) => void (b.colorings = b.colorings.filter((c) => c.id !== id)));

/** Operations the inspector asks for on the selected seams. */
export type SelectionOp =
  | { kind: 'delete' | 'clone' | 'guides' }
  | { kind: 'rotate'; deg: number; about: 'block' | 'selection' }
  | { kind: 'flip'; axis: 'h' | 'v' | 'd1' | 'd2'; about: 'block' | 'selection' }
  | { kind: 'resize'; pct: number; about: 'block' | 'selection' }
  | { kind: 'nodes'; mode: NodeMode };
