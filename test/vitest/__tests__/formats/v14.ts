// What project format v14 added (0.10.0), for the v14 demo and the format samples: blocks spanning
// several block spaces (spec 057, `SlotContent.span`): a Straight Set with sashing holding a 2U and
// a 3U, a triangle grid with a 2U, an On-Point quilt with a 2U over its setting triangles at the
// edge, and, where the project has a data quilt, a copy of it with a 2U data block.
import { produce } from 'immer';
import { fillQuilt, type Kit } from '@/dev/fill-quilt';
import { takeBack } from '@/model/data-quilt';
import { layoutDefaults, onPointDefaults } from '@/model/io';
import { syncDraft } from '@/model/library-items';
import { generateFor, spanSpaces } from '@/model/layout/slots';
import { spanIndex, spanOf, type Span } from '@/model/layout/spans';
import { createQuilt } from '@/model/new-quilt';
import { PLAIN_BLOCK } from '@/model/plain';
import type { RrqDoc } from '@/model/schema/project';
import type { Layout, Quilt } from '@/model/schema/quilt';

const border = [
  { style: 'long-horizontal' as const, sides: [3, 3, 3, 3] as [number, number, number, number] },
];

/** Set span `sp` on its quilt: its first space keeps (or takes) a block, the others are emptied
 *  and give back their data numbers. */
function setSpan(q: Quilt, sp: Span, block?: Quilt['layers'][0]['slots'][string]): Quilt {
  const out = structuredClone(q);
  const slots = out.layers[0].slots;
  const first = slots[sp.at] ?? block;
  if (!first) throw new Error(`${q.notecard.name}: nothing to span from ${sp.at}`);
  for (const id of sp.covers) delete slots[id];
  if (out.data) out.data = sp.cells.filter((id) => id !== sp.at).reduce(takeBack, out.data);
  slots[sp.at] = { ...first, span: sp.k };
  return out;
}

/** The first kU span (in space order) clear of the quilt's spans, among `from`'s spaces. */
function firstSpan(
  q: Quilt,
  k: number,
  spaces = generateFor(q).unspanned ?? generateFor(q).slots,
  from: (id: string) => boolean = () => true,
) {
  const ix = spanIndex(spaces, generateFor(q).center);
  const taken = new Set((generateFor(q).spans ?? []).flatMap((s) => s.covers));
  const sp = ix.slots
    .filter((s) => from(s.id))
    .map((s) => spanOf(ix, s, k))
    .find((x) => x && !x.covers.some((id) => taken.has(id)));
  if (!sp) throw new Error(`${q.notecard.name}: no ${k}U span`);
  return sp;
}

export function addV14(doc0: RrqDoc, kit: Kit): RrqDoc {
  let doc = doc0;
  const add = (name: string, layout: Layout) => {
    const q = createQuilt(name, layout, border);
    doc = produce(doc, (d) => void d.project.quilts.push(q));
    doc = fillQuilt(doc, q.id, kit) as RrqDoc;
    return q.id;
  };
  const get = (id: string) => doc.project.quilts.find((x) => x.id === id)!;
  const put = (q: Quilt) =>
    (doc = produce(doc, (d) => {
      const i = d.project.quilts.findIndex((x) => x.id === q.id);
      d.project.quilts[i] = q;
    }));

  // A Straight Set with sashing: a 2U and a 3U, over the sashing and cornerstones inside them.
  const straight = add('Spanning Blocks', {
    style: 'straight-set',
    cols: 6,
    rows: 6,
    block: [6, 6],
    sash: [1, 1],
    sashBorder: true,
  });
  put(setSpan(get(straight), firstSpan(get(straight), 2)));
  put(setSpan(get(straight), firstSpan(get(straight), 3)));

  // Triangles: a triangle of four.
  const tri = add('Spanning Triangles', {
    ...(layoutDefaults('shaped-blocks', 1) as Layout & { style: 'shaped-blocks' }),
    shape: 'triangles',
  });
  put(setSpan(get(tri), firstSpan(get(tri), 2)));

  // On-Point, setting triangles cut exact: a 2U from a setting triangle, which then holds it.
  const point = add('Spanning at the Edge', onPointDefaults(1));
  const pq = get(point);
  const block = Object.values(pq.layers[0].slots).find((c) => c.block !== PLAIN_BLOCK);
  put(
    setSpan(
      pq,
      firstSpan(pq, 2, spanSpaces(pq), (id) => id.startsWith('set:')),
      block,
    ),
  );

  // A data quilt's copy with a 2U data block, holding one number.
  const data = doc.project.quilts.find((x) => x.data?.on);
  if (data) {
    const copy: Quilt = {
      ...structuredClone(data),
      id: 'spandata',
      notecard: { name: 'Spanning Data' },
    };
    const placed = new Set(copy.data!.places.map((x) => x.space));
    doc = produce(doc, (d) => void d.project.quilts.push(copy));
    put(
      setSpan(
        copy,
        firstSpan(copy, 2, undefined, (id) => placed.has(id)),
      ),
    );
  }

  return produce(doc, (d) => void syncDraft(d, kit.lookup));
}
