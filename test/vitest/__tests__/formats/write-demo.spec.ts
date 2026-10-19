// The demo project sample (test/fixtures/formats/demo-v<N>.rrq): opens the previous version's demo,
// adds a quilt for each layout capability this version added (ADDED), and saves it with this code.
// FORMAT_DEMO=<dir> runs it (skipped otherwise). Kept runnable on old releases' code too, so it only
// uses the editor's Set and Paint tools, which every release has. See test/fixtures/formats/README.md.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { produce } from 'immer';
import { it } from 'vitest';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { applyTool } from '@/editor/actions';
import { parseProject, serializeProject } from '@/model/io';
import { syncDraft } from '@/model/library-items';
import { lookupOf, withSources } from '@/model/library';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import { isPlainGroup, slotGroup } from '@/model/plain';
import { VERSION } from '@/model/schema/project';
import * as slots from '@/model/layout/slots';

const dir = process.env.FORMAT_DEMO;

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Add = { name: string; style?: string; layout?: Any; borders?: Any[] };

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
};

const BLOCKS = [
  'Ohio Star',
  'Churn Dash',
  'Basic Log Cabin',
  'Pinwheel',
  'Flying Geese',
  'Square in a Square',
  'Hourglass',
  'Nine Patch',
  'Rail Fence',
];
const COLORS = ['Midnight', 'Cream', 'Barn Red', 'Gold', 'Teal', 'Sage', 'Rust', 'Periwinkle'];

it.skipIf(!dir)('write the demo project', async () => {
  const lib = builtinDoc(await builtinLibrary());
  const view = { doc: lib, ...withSources(lib) };
  const lookup = lookupOf([view]);
  const named = (n: string) => view.blocks.find((b: Any) => b.notecard.name === n);
  const ninePicks = BLOCKS.map(named).filter(Boolean);
  const anyBlocks: Any[] = view.blocks;
  const colors = COLORS.map((n) => view.colors.find((c: Any) => c.notecard.name === n))
    .filter(Boolean)
    .map((c: Any) => c.id as string);

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
    doc = fill(doc, quilt.id);
  }
  writeFileSync(`${dir}/demo-v${VERSION}.rrq`, serializeProject(doc));

  /** Blocks in block spaces (a different one in each, where it fits), colors on the rest. */
  function fill(d0: Any, quiltId: string) {
    let d = d0;
    const q = d.project.quilts.find((x: Any) => x.id === quiltId);
    const gen = slots.generateSlots(q.layout, q.borders);
    const all: Any[] = gen.slots;
    // Releases before spaces had kinds took slot ids.
    const spaces: Any = all[0]?.kind === undefined ? all.map((s) => s.id) : all;
    const isBlock = (s: Any) => (s.kind ? s.kind === 'block' : !isPlainGroup(slotGroup(s.id)));
    const tool = (s: Any, t: Any) => {
      const r = applyTool(
        d,
        quiltId,
        spaces,
        { slotId: s.id },
        {
          scope: 'this',
          block: null,
          color: null,
          library: lookup,
          ...t,
        },
      );
      if (r.doc) d = produce(r.doc, (x: Any) => void syncDraft(x, lookup));
      return !!r.doc;
    };
    // Each block space takes the next block that fits it (shapes), so neighbors differ.
    const order = [...ninePicks, ...anyBlocks];
    let next = 0;
    const groups = new Map<string, number>();
    all.forEach((s, i) => {
      if (isBlock(s)) {
        for (let k = 0; k < order.length; k++) {
          const j = (next + k) % order.length;
          if (tool(s, { tool: 'set', block: order[j].id })) {
            next = j + 1;
            break;
          }
        }
      } else {
        // Few spaces in a group (sashing, borders): one color each. Many (patches): scrappy.
        const g = slotGroup(s.id);
        if (!groups.has(g)) groups.set(g, groups.size);
        const many = all.filter((x) => slotGroup(x.id) === g).length > 12;
        const c = colors[(many ? i : groups.get(g)!) % colors.length];
        tool(s, { tool: 'paint', color: c });
      }
    });
    return d;
  }
});
