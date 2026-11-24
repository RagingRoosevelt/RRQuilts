// The block and patch quilts demo (owner, 2026-11-23: "let's add a demo project with a handful of
// basic block and patch quilts"): public/demo/block-quilts.rrq, opened by
// /?open_demo=block-quilts.rrq. Medallions on point with sashing (a Queen bed's outline over it),
// diamond blocks in Diamond Point with sashing and a border, pieced strips without sashing (a men's
// XL shirt back's outline), and Variable Patch cubes. Both overlays inverted: the shirt back black at
// full strength, the bed #757575 at 15% (owner, 2026-11-23). Filled with the editor's Set and Paint tools.
// BLOCKS_DEMO=<file> writes it.
import { writeFileSync } from 'node:fs';
import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import { starterKit } from '@/dev/fill-quilt';
import { applyTool, type ToolState } from '@/editor/actions';
import { DEFAULT_LICENSE } from '@/model/credits';
import { layoutDefaults, onPointDefaults, parseProject, serializeProject } from '@/model/io';
import { generateSlots, type Slot } from '@/model/layout/slots';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { RrqDoc } from '@/model/schema/project';
import type { Border, Layout, Quilt, Strip } from '@/model/schema/quilt';
import { resolveTarget, startChoice, type TargetInput } from '@/model/targets';

const out = process.env.BLOCKS_DEMO;
const AUTHOR = 'RRQuilts contributors';

const items = builtinItems();
const block = (name: string) => items.blocks.find((b) => b.notecard.name === name)!.id;
const color = (name: string) => items.colors.find((c) => c.notecard.name === name)!.id;

/** What goes in a space: a block (by name) or a color (by name). */
type Fill = { block: string } | { color: string };

interface Plan {
  name: string;
  notes: string;
  layout: Layout;
  borders: Border[];
  /** The target and its overlay's look (always inverted: the quilt outside the shape shaded). */
  target?: { input: TargetInput; tint: string; opacity: number };
  fill: (s: Slot) => Fill;
}

const strip = (id: string, style: Strip['style'], width: number, along: number, across = 1) => ({
  id,
  style,
  width,
  along,
  across,
});

/** Strip colors: [pattern, background] by strip id. */
const STRIP_COLORS: Record<string, [string, string]> = {
  a: ['Gold', 'Midnight'],
  b: ['Barn Red', 'Cream'],
  c: ['Teal', 'Cream'],
  d: ['Gold', 'Midnight'],
  e: ['Rust', 'Cream'],
  f: ['Teal', 'Midnight'],
  g: ['Barn Red', 'Cream'],
};

const PLANS: Plan[] = [
  {
    name: 'Medallions on point',
    notes:
      'Three medallion blocks set on point, 14 in, with 2½ in sashing and red cornerstones between them and dark setting triangles. Big enough for a Queen bed with a 14 in drop (the outline).',
    layout: { ...onPointDefaults(1), cols: 4, rows: 4, block: 14, sash: 2.5 },
    borders: [],
    target: {
      input: startChoice('Queen', { choice: null, region: 'us' }, 'in'),
      tint: '#757575',
      opacity: 0.15,
    },
    fill: (s) => {
      if (s.kind === 'block') {
        if (s.alt === 1) return { block: 'Framed Diamond' };
        const [, r, c] = /r(\d+)c(\d+)/.exec(s.id)!.map(Number);
        return { block: (r! + c!) % 2 ? 'Pinwheel Corners Medallion' : 'Sawtooth Medallion' };
      }
      return { color: s.kind === 'sash' ? 'Cream' : s.kind === 'cs' ? 'Barn Red' : 'Midnight' };
    },
  },
  {
    name: 'Diamonds with sashing',
    notes:
      'Diamond Point: two 60° diamond blocks, 6 in across, set on point with 1 in gold sashing, teal setting pieces and a 3 in border.',
    layout: { ...layoutDefaults('diamond-point', 1), cols: 5, rows: 3, sash: 1 } as Layout,
    borders: [{ style: 'long-horizontal', sides: [3, 3, 3, 3] }],
    fill: (s) =>
      s.kind === 'block'
        ? {
            block: s.alt ? 'Symmetrical 60-Degree Diamond' : 'Round and Round 60-Degree Diamond',
          }
        : { color: s.kind === 'sash' ? 'Gold' : s.kind === 'border' ? 'Midnight' : 'Teal' },
  },
  {
    name: 'Pieced strips',
    notes:
      'Horizontal strips of pieced patterns, edge to edge with no plain strips between: points, checkerboards, diamonds, spaced squares and double diamonds. Sized for the back of a men’s XL shirt (the outline).',
    layout: {
      style: 'horizontal-strip',
      length: 28,
      strips: [
        strip('a', 'points-a', 4, 7),
        strip('b', 'checker-board', 4, 14, 2),
        strip('c', 'diamonds', 5, 5),
        strip('d', 'spaced-squares', 3, 7),
        strip('e', 'double-diamonds', 5, 4),
        strip('f', 'points-b', 4, 7),
        strip('g', 'checker-board', 4, 14, 2),
      ],
    },
    borders: [],
    target: {
      input: {
        ...startChoice('top', { choice: null, region: 'us', fit: 'men' }, 'in'),
        size: 'XL',
        piece: 'back',
      },
      tint: '#000000',
      opacity: 1,
    },
    fill: (s) => {
      const [, id, part] = s.id.split(':') as [string, string, string];
      const [main, bg] = STRIP_COLORS[id]!;
      const check = /^c(\d+)\.(\d+)$/.exec(part);
      if (check) return { color: (+check[1]! + +check[2]!) % 2 ? bg : main };
      return { color: part.startsWith('f') ? main : bg };
    },
  },
  {
    name: 'Tumbling cubes',
    notes:
      'Variable Patch: cubes of three diamonds, 6 in across with 3 in tops and 4 in sides, light tops and two darker sides so they read as blocks in 3D. Trimmed straight, no sashing.',
    layout: { ...layoutDefaults('variable-blocks', 1), cols: 7, rows: 7 } as Layout,
    borders: [],
    fill: (s) => ({
      color: s.id.endsWith('t') ? 'Butter' : s.id.endsWith('l') ? 'Teal' : 'Midnight',
    }),
  },
];

/** The quilt `p` describes, filled space by space with the editor's Set and Paint tools. */
async function demo(): Promise<RrqDoc> {
  const kit = await starterKit();
  let d = produce(createProject('Block and patch quilts demo', 'in', 'demo'), (x) => {
    x.project.license = DEFAULT_LICENSE;
  });
  for (const p of PLANS) {
    const q0 = createQuilt(p.name, p.layout, p.borders);
    const t = p.target && resolveTarget(p.target.input, 'in');
    const q: Quilt = {
      ...q0,
      author: AUTHOR,
      license: DEFAULT_LICENSE,
      notecard: { ...q0.notecard, notes: p.notes },
      ...(t ? { target: { visible: true, invert: true, ...p.target!, ...t } } : {}),
    };
    d = produce(d, (x) => void x.project.quilts.push(q));
    const spaces = generateSlots(q.layout, q.borders).slots;
    for (const s of spaces) {
      const f = p.fill(s);
      const tool: ToolState =
        'block' in f
          ? { tool: 'set', scope: 'this', block: block(f.block), color: null, library: kit.lookup }
          : {
              tool: 'paint',
              scope: 'this',
              block: null,
              color: color(f.color),
              library: kit.lookup,
            };
      const r = applyTool(d, q.id, spaces, { slotId: s.id }, tool);
      if (!r.doc) throw new Error(`${p.name} ${s.id}: ${r.message}`);
      d = produce(r.doc, (x) => void syncDraft(x, kit.lookup));
    }
  }
  return d;
}

describe('block and patch quilts demo', () => {
  it('four quilts, every space filled, targets on two; the file opens clean', async () => {
    const doc = await demo();
    expect(doc.project.quilts.map((q) => q.layout.style)).toEqual([
      'on-point',
      'diamond-point',
      'horizontal-strip',
      'variable-blocks',
    ]);
    for (const q of doc.project.quilts) {
      const spaces = generateSlots(q.layout, q.borders).slots;
      expect(Object.keys(q.layers[0].slots).sort(), q.notecard.name).toEqual(
        spaces.map((s) => s.id).sort(),
      );
    }
    expect(doc.project.quilts.map((q) => q.target?.label ?? null)).toEqual([
      'Queen with drop',
      null,
      "Top back, men's XL",
      null,
    ]);
    const text = serializeProject(doc);
    const back = await parseProject(text);
    if (!back.ok) throw new Error(back.error);
    expect(back.report).toEqual([]);
    if (out) writeFileSync(out, text);
  });
});
