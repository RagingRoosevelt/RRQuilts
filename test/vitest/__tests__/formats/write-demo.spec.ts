// The demo project sample (test/fixtures/formats/demo-v<N>.rrq): opens the previous version's demo,
// adds a quilt for each layout capability this version added (ADDED), and saves it with this code.
// FORMAT_DEMO=<dir> runs it (skipped otherwise). Kept runnable on old releases' code too, so it only
// uses the editor's Set and Paint tools (fill-quilt.ts), which every release has. See test/fixtures/formats/README.md.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { produce } from 'immer';
import { it } from 'vitest';
import { parseProject, serializeProject } from '@/model/io';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import { VERSION } from '@/model/schema/project';
import * as slots from '@/model/layout/slots';
import { fillQuilt, starterKit } from '@/dev/fill-quilt';

const dir = process.env.FORMAT_DEMO;

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
/** `data`: a data quilt (v9), its block spaces numbered in order with the built-in Month Strip;
 *  `weeks`: a two-value Weeks quilt starting with a single day (v10, spec 046). */
type Add = {
  name: string;
  style?: string;
  layout?: Any;
  borders?: Any[];
  data?: boolean;
  weeks?: boolean;
};

/** Layout capabilities each project format version added (the first is the 3×3 every demo has). */
const ADDED: Record<number, Add[]> = {
  4: [{ name: 'Nine Blocks' }],
  5: [
    { name: 'On Point', style: 'on-point' },
    { name: 'Strips', style: 'horizontal-strip' },
  ],
  6: [
    { name: 'Variable Point', style: 'variable-point' },
    { name: 'One Patch', style: 'one-patch' },
    { name: 'Baby Blocks', style: 'baby-blocks' },
    { name: 'Variable Blocks', style: 'variable-blocks' },
    {
      name: 'Pieced Border',
      borders: [
        { style: 'long-horizontal', sides: [1, 1, 1, 1] },
        { style: 'points-out', sides: [3, 3, 3, 3] },
      ],
    },
  ],
  7: [
    { name: 'Shaped Blocks', style: 'shaped-blocks' },
    { name: 'Hexagons on a Flow', style: 'shaped-blocks', layout: { shape: 'hexagons', flow: 30 } },
    { name: 'Diamond Point', style: 'diamond-point' },
    { name: 'Baby Blocks of Blocks', style: 'baby-blocks' },
  ],
  8: [], // v8 added palette tags, no layouts
  9: [
    { name: 'On Point Half Rows', style: 'on-point', layout: { cols: 3.5, rows: 3.5 } },
    { name: 'Diamond Point Half Rows', style: 'diamond-point', layout: { cols: 4, rows: 3.5 } },
    {
      name: 'Data Quilt',
      style: 'straight-set',
      layout: { cols: 2, rows: 6, block: [15.5, 3], sash: [1, 1], sashBorder: true },
      data: true,
    },
  ],
  10: [
    {
      name: 'Data Weeks, Two Values',
      style: 'straight-set',
      layout: { cols: 8, rows: 4, block: [7, 7], sash: [0, 0], sashBorder: false },
      weeks: true,
    },
  ],
};

it.skipIf(!dir)('write the demo project', async () => {
  const kit = await starterKit();

  const prev = `${dir}/demo-v${VERSION - 1}.rrq`;
  let doc: Any;
  if (existsSync(prev)) {
    const r = await parseProject(readFileSync(prev, 'utf8'));
    if (!r.ok) throw new Error(r.error);
    doc = r.doc;
  } else doc = createProject('Demo', 'in', 'demo');

  const nine = () => doc.project.quilts[0];
  for (const add of ADDED[VERSION] ?? []) {
    const base = !nine()
      ? {
          style: VERSION <= 4 ? 'horizontal' : 'straight-set',
          cols: 3,
          rows: 3,
          block: [10, 10],
          sash: [2, 2],
          sashBorder: true,
        }
      : add.style
        ? (slots as Any).convertLayout(nine().layout, add.style, 'in')
        : nine().layout;
    const layout = { ...base, ...add.layout };
    const borders = add.borders ?? [{ style: 'long-horizontal', sides: [3, 3, 3, 3] }];
    const quilt = createQuilt(add.name, layout, borders as Any);
    doc = produce(doc, (d: Any) => void d.project.quilts.push(quilt));
    doc = fillQuilt(doc, quilt.id, kit);
    if (add.data) doc = await dataQuilt(doc, quilt.id);
    if (add.weeks) doc = await weeksQuilt(doc, quilt.id);
  }
  writeFileSync(`${dir}/demo-v${VERSION}.rrq`, serializeProject(doc));
});

/** A data quilt (spec 025): next year's months plan, its block spaces numbered in order, each
 *  showing the built-in Month Strip's variant for its month, in the sample year's colors. */
async function dataQuilt(doc: Any, id: string): Promise<Any> {
  const { builtinItems } = await import('@/content/starter');
  const { newDataPlan } = await import('@/model/data-quilt');
  const { syncDraft } = await import('@/model/library-items');
  const items = builtinItems();
  const strip = items.blocks.find((b) => b.id === 'rrquilts.month-strip')!;
  // As the app does: library blocks and colors in use (the scales' built-in colors) come in.
  const lib = {
    block: (x: string) => items.blocks.find((b) => b.id === x),
    color: (x: string) => items.colors.find((c) => c.id === x),
  };
  return produce(doc, (d: Any) => {
    const q = d.project.quilts.find((x: Any) => x.id === id);
    const spaces = slots
      .generateFor(q)
      .slots.filter((s: Any) => s.kind === 'block')
      .map((s: Any) => s.id)
      .slice(0, 12);
    // v9 kept a numbered list and a type per space; v10 (spec 046) placements.
    q.data =
      VERSION >= 10
        ? {
            ...newDataPlan('in', 2027),
            places: spaces.map((space: string, i: number) => ({
              space,
              n: i + 1,
              block: strip.id,
            })),
          }
        : {
            ...newDataPlan('in', 2027),
            order: spaces,
            types: Object.fromEntries(spaces.map((s: string) => [s, strip.id])),
          };
    syncDraft(d, lib);
  });
}

/** A Weeks data quilt with two values (spec 046): Jan 1 as a single day (Day Square), then each
 *  week twice, the Week Strip showing High on one and Low on the other, in reading order. */
async function weeksQuilt(doc: Any, id: string): Promise<Any> {
  const { builtinItems } = await import('@/content/starter');
  const { newDataPlan, presetSlot } = await import('@/model/data-quilt');
  const { syncDraft } = await import('@/model/library-items');
  const items = builtinItems();
  const week = items.blocks.find((b) => b.id === 'rrquilts.week-strip')!;
  const day = items.blocks.find((b) => b.id === 'rrquilts.day-square')!;
  const lib = {
    block: (x: string) => items.blocks.find((b) => b.id === x),
    color: (x: string) => items.colors.find((c) => c.id === x),
  };
  return produce(doc, (d: Any) => {
    const q = d.project.quilts.find((x: Any) => x.id === id);
    const spaces: string[] = slots
      .generateFor(q)
      .slots.filter((s: Any) => s.kind === 'block')
      .map((s: Any) => s.id);
    const plan = newDataPlan('in', 2027);
    const places: Any[] = [{ space: spaces[0], n: 1, block: day.id }];
    spaces.slice(1).forEach((space, i) => {
      const n = 2 + Math.floor(i / 2); // Wk 1, Wk 1, Wk 2, Wk 2…
      places.push({ space, n, block: week.id, ...(i % 2 ? { series: [1] } : {}) });
    });
    q.data = {
      ...plan,
      plan: 'weeks',
      lead: true,
      slots: [presetSlot('temperature', 'in'), presetSlot('temperature', 'in', 'Low')],
      sim: { source: 'builtin', set: 'sample', series: ['high', 'low'] },
      places,
    };
    syncDraft(d, lib);
  });
}
