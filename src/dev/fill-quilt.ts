// Fills a quilt the way a quilter would with the editor's Set and Paint tools: blocks in block
// spaces, colors on the rest. Shared by the format demo (write-demo.spec.ts, which also runs on old
// releases' code, so only APIs every release has) and the layout gallery.
import { produce } from 'immer';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { applyTool } from '@/editor/actions';
import { syncDraft } from '@/model/library-items';
import { lookupOf, withSources } from '@/model/library';
import { isPlainGroup, slotGroup } from '@/model/plain';
import * as slots from '@/model/layout/slots';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** blocks: a different block in each space; one: the same block everywhere; mix: blocks and
 *  solids alternating; solids: block spaces painted too. */
export type FillMode = 'blocks' | 'one' | 'mix' | 'solids';

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

/** The built-in library as the editor sees it, with the blocks and colors fills draw from. */
export async function starterKit() {
  const lib = builtinDoc(await builtinLibrary());
  const view = { doc: lib, ...withSources(lib) };
  const named = (n: string) => view.blocks.find((b: Any) => b.notecard.name === n);
  return {
    lookup: lookupOf([view]),
    blocks: [...BLOCKS.map(named).filter(Boolean), ...view.blocks] as Any[],
    colors: COLORS.map((n) => view.colors.find((c: Any) => c.notecard.name === n))
      .filter(Boolean)
      .map((c: Any) => c.id as string),
  };
}
export type Kit = Awaited<ReturnType<typeof starterKit>>;

/** Murmur3's finalizer: neighboring i get unrelated values. */
function scatter(i: number) {
  let h = Math.imul(i ^ (i >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** `turns`: every third block turned once and every third flipped, to test placement. */
export function fillQuilt(
  d0: Any,
  quiltId: string,
  kit: Kit,
  mode: FillMode = 'blocks',
  opts: { turns?: boolean } = {},
) {
  let d = d0;
  const q = d.project.quilts.find((x: Any) => x.id === quiltId);
  const all: Any[] = slots.generateSlots(q.layout, q.borders).slots;
  // Releases before spaces had kinds took slot ids.
  const spaces: Any = all[0]?.kind === undefined ? all.map((s) => s.id) : all;
  const isBlock = (s: Any) => (s.kind ? s.kind === 'block' : !isPlainGroup(slotGroup(s.id)));
  const tool = (s: Any, t: Any) => {
    const r = applyTool(
      d,
      quiltId,
      spaces,
      { slotId: s.id },
      { scope: 'this', block: null, color: null, library: kit.lookup, ...t },
    );
    if (r.doc) d = produce(r.doc, (x: Any) => void syncDraft(x, kit.lookup));
    return !!r.doc;
  };
  // Each block space takes the next block that fits it (shapes), so neighbors differ.
  const order = kit.blocks;
  let next = 0;
  let nth = 0;
  const groups = new Map<string, number>();
  const sizes = new Map<string, number>();
  for (const s of all) sizes.set(slotGroup(s.id), (sizes.get(slotGroup(s.id)) ?? 0) + 1);
  // Huge quilts are filled the way a quilter would: All and Alternate, not space by space (which
  // takes minutes over thousands of spaces).
  const HUGE = 400;
  const once = new Set<string>();
  all.forEach((s, i) => {
    if (isBlock(s)) {
      const k0 = nth++;
      if (mode === 'one' && !opts.turns) {
        if (once.has('one')) return;
        for (const b of order)
          if (tool(s, { tool: 'set', block: b.id, scope: 'all' })) return void once.add('one');
        return;
      }
      const solid = mode === 'solids' || (mode === 'mix' && (s.alt ?? k0) % 2 === 1);
      if (solid) {
        tool(s, { tool: 'paint', color: kit.colors[k0 % kit.colors.length] });
        return;
      }
      for (let k = 0; k < order.length; k++) {
        const j = (next + k) % order.length;
        if (tool(s, { tool: 'set', block: order[j].id })) {
          if (mode !== 'one') next = j + 1;
          if (opts.turns && k0 % 3 === 1) tool(s, { tool: 'rotate' });
          if (opts.turns && k0 % 3 === 2) tool(s, { tool: 'flip', flipAxis: 'h' });
          break;
        }
      }
    } else {
      // Few spaces in a group (borders): one color each. Many (patches, pieced borders): scrappy.
      const g = slotGroup(s.id);
      if (!groups.has(g)) groups.set(g, groups.size);
      // Sashing and cornerstones stay one color however many there are.
      const plain = s.kind === 'sash' || s.kind === 'cs';
      const size = sizes.get(g)!;
      if (!plain && size > HUGE) {
        if (once.has(g)) return;
        once.add(g);
        tool(s, { tool: 'paint', color: kit.colors[0], scope: 'all' });
        tool(s, { tool: 'paint', color: kit.colors[2], scope: 'alternate' });
        return;
      }
      const many = !plain && size > 12;
      // Scattered (hashed), not cycled: a cycle in step with the row length paints stripes.
      const k = many ? scatter(i) : groups.get(g)!;
      tool(s, { tool: 'paint', color: kit.colors[k % kit.colors.length] });
    }
  });
  return d;
}
