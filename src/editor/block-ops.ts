// Block-level operations for the block editor (pure; results go through project.change).
import { produce } from 'immer';
import { deriveSeamPatches } from '@/model/blocks/derive';
import { newId } from '@/model/ids';
import { itemId } from '@/model/identity';
import { variationName } from '@/model/new-quilt';
import type { Block, SeamBlock } from '@/model/schema/block';
import type { Units } from '@/model/schema/project';
import type { Guide, NodeMode } from './draw-ops';
import { defaultSnap, type SnapSettings } from './snap';

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
    snap: { ...defaultSnap(units), ...e.snap },
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
): SeamBlock {
  const drawing = { nodes: [], segments: [] };
  return {
    id: itemId(author),
    kind: 'seam',
    size,
    notecard: { name },
    drawing,
    patches: deriveSeamPatches(drawing, size).patches.map((p) => ({ id: newId(), path: p.path })),
    colorings: [{ id: newId(), name: 'Coloring 1', fills: {} }],
    editor: { snap: defaultSnap(units) },
  };
}

/** Copy for "Edit a copy": the author's own id, "(2)" name, attribution kept and marked derived. */
export function copyBlock(block: Block, takenNames: string[], author = ''): Block {
  return produce(block, (b) => {
    b.id = itemId(author);
    b.notecard.name = variationName(block.notecard.name, takenNames);
    delete b.version; // stamped on save; revisions restart for the new item
    delete b.revision;
    if (b.source) b.source.derived = true;
  });
}

/** After a drawing edit, library items become derived works (constitution Principle VI). */
export const markDerived = (block: Block): Block =>
  block.source && !block.source.derived
    ? produce(block, (b) => void (b.source!.derived = true))
    : block;

/** "Based on Ohio Star by RRQuilts contributors (CC-BY-4.0)" or null. */
export function attribution(block: Block): string | null {
  const s = block.source;
  if (!s) return null;
  const what = s.derived ? 'Based on' : 'From';
  const name = s.name ?? s.itemId;
  const by = s.author ? ` by ${s.author}` : '';
  const lib = s.library
    ? ` (${s.library}${s.license ? `, ${s.license}` : ''})`
    : s.license
      ? ` (${s.license})`
      : '';
  return `${what} ${name}${by}${lib}`;
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
