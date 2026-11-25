// Quilt colorways: a colorway swaps colors and fabrics over the whole quilt
// (every piece colored `from` shows `to`), so the design's edits show in every colorway. The quilt
// remembers which colorway it shows (none: its own colors). The quilt's own colors are the first
// colorway (named `primaryName`): any colorway can go while another is left, as a block's colorings.
// A re-color (`recolor`) is instead a colorway painted patch by patch, as the primary is: each block
// space has its own coloring there (owner, 2026-11-25).
import type { Draft } from 'immer';
import { fillKey, plainFill, resolveColoring } from './coloring';
import type { Block } from './schema/block';
import type { ColoringBody, Fill, PlainFill } from './schema/coloring';
import type { Quilt, Colorway } from './schema/quilt';

type Recolor = NonNullable<Colorway['recolor']>;

/** The colorway a quilt shows (undefined: its own colors). */
export const shownColorway = (
  q: Pick<Quilt, 'colorways' | 'shownColorway'>,
  id = q.shownColorway,
) => (id ? q.colorways?.find((v) => v.id === id) : undefined);

/** Every colorway to pick: the quilt's own colors (no id) first. */
export const colorwayList = (
  q: Pick<Quilt, 'colorways' | 'primaryName'>,
): { id: string | undefined; name: string }[] => [
  { id: undefined, name: q.primaryName ?? 'Colorway 1' },
  ...(q.colorways ?? []).map((v) => ({ id: v.id, name: v.name })),
];

/** A fill as a colorway shows it (the fill itself when nothing swaps it, or in a re-color). */
export function swapper(v: Colorway | undefined): (f: Fill | undefined) => Fill | undefined {
  if (!v?.swaps.length || v.recolor) return (f) => f;
  const map = new Map(v.swaps.map((s) => [s.from, s.to]));
  return (f) => (f ? (map.get(fillKey(f)) ?? f) : f);
}

/** A coloring as a colorway shows it. */
export function swapColoring(
  c: ColoringBody | undefined,
  v: Colorway | undefined,
): ColoringBody | undefined {
  if (!c || !v?.swaps.length || v.recolor) return c;
  const swap = swapper(v);
  const fills: ColoringBody['fills'] = {};
  for (const [k, f] of Object.entries(c.fills)) fills[k] = swap(f) ?? f;
  return { ...c, fills };
}

/** A block space's coloring as the shown colorway has it: a re-color's own while the space holds the
 *  block it had when painted, else the quilt's. */
export function spaceColoring(q: Quilt, slotId: string): ColoringBody | undefined {
  const s = q.layers[0].slots[slotId];
  if (!s) return undefined;
  const r = shownColorway(q)?.recolor;
  const own = r?.slots[slotId];
  return own && own.block === s.block ? r.colorings[own.coloring] : q.colorings[s.coloring];
}

/** A new colorway, shown at once: the quilt's own colors, or a copy of `from`. */
export function addColorway(q: Quilt, id: string, name?: string, from?: Colorway): Quilt {
  const colorways = q.colorways ?? [];
  const swaps = from ? from.swaps.map((s) => ({ ...s })) : [];
  const v: Colorway = { id, name: name ?? `Colorway ${colorways.length + 2}`, swaps };
  if (from?.recolor) v.recolor = structuredClone(from.recolor);
  return { ...q, colorways: [...colorways, v], shownColorway: id };
}

/** Make colorway `id` a re-color, starting from the colors it shows (`blocks`: the placed blocks). */
export function startRecolor(q: Quilt, id: string, blocks: readonly Block[]): Quilt {
  const v = q.colorways?.find((x) => x.id === id);
  if (!v || v.recolor) return q;
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const swap = swapper(v);
  const recolor: Recolor = { slots: {}, colorings: {} };
  for (const [sid, s] of Object.entries(q.layers[0].slots)) {
    recolor.slots[sid] = { block: s.block, coloring: s.coloring };
    if (s.coloring in recolor.colorings) continue;
    const r = resolveColoring(q.colorings[s.coloring], byId.get(s.block));
    if (!r) continue;
    const fills: ColoringBody['fills'] = {};
    for (const [patch, f] of Object.entries(r.fills)) fills[patch] = swap(f) ?? f;
    recolor.colorings[s.coloring] = { fills, ...(r.threads ? { threads: r.threads } : {}) };
  }
  return { ...q, colorways: q.colorways!.map((x) => (x.id === id ? { ...x, recolor } : x)) };
}

/** The quilt as its shown re-color has it, with no colorway shown, to paint with the primary's tools
 *  (`keepRecolor` stores what changed). Any other quilt as it is. */
export function recolorView(q: Quilt): Quilt {
  const r = shownColorway(q)?.recolor;
  if (!r) return q;
  const slots: Quilt['layers'][0]['slots'] = {};
  for (const [sid, s] of Object.entries(q.layers[0].slots)) {
    const own = r.slots[sid];
    slots[sid] = own && own.block === s.block ? { ...s, coloring: own.coloring } : s;
  }
  const out: Quilt = {
    ...q,
    colorings: { ...q.colorings, ...r.colorings },
    layers: [{ ...q.layers[0], slots }, q.layers[1], q.layers[2]],
  };
  delete out.shownColorway;
  return out;
}

/** `q` with its shown re-color as painted in `view` (from `recolorView`). */
export function keepRecolor(q: Quilt, view: Quilt): Quilt {
  const recolor: Recolor = { slots: {}, colorings: {} };
  for (const [sid, s] of Object.entries(view.layers[0].slots)) {
    const c = view.colorings[s.coloring];
    if (!c) continue;
    recolor.slots[sid] = { block: s.block, coloring: s.coloring };
    recolor.colorings[s.coloring] = c;
  }
  const id = q.shownColorway;
  return { ...q, colorways: (q.colorways ?? []).map((v) => (v.id === id ? { ...v, recolor } : v)) };
}

/** In a recipe: `fn` on each re-color's colorings of `blockId`'s spaces (when its patches change). */
export function remapRecolors(
  q: Draft<Quilt>,
  blockId: string,
  fn: (c: ColoringBody) => ColoringBody,
) {
  for (const v of q.colorways ?? []) {
    const r = v.recolor;
    if (!r) continue;
    const ids = new Set(
      Object.values(r.slots).flatMap((s) => (s.block === blockId ? [s.coloring] : [])),
    );
    for (const id of ids) if (r.colorings[id]) r.colorings[id] = fn(r.colorings[id]);
  }
}

/** Swap `from` (a fill key) for `to` in a colorway; swapping back to the original removes it. */
export function setSwap(q: Quilt, colorwayId: string, from: string, to: Fill): Quilt {
  return {
    ...q,
    colorways: (q.colorways ?? []).map((v) =>
      v.id !== colorwayId
        ? v
        : {
            ...v,
            swaps: [
              ...v.swaps.filter((s) => s.from !== from),
              ...(fillKey(to) === from ? [] : [{ from, to }]),
            ],
          },
    ),
  };
}

/** Rename a colorway (no id: the quilt's own colors). */
export const renameColorway = (q: Quilt, id: string | undefined, name: string): Quilt =>
  id
    ? { ...q, colorways: (q.colorways ?? []).map((v) => (v.id === id ? { ...v, name } : v)) }
    : { ...q, primaryName: name };

/**
 * Remove a colorway (showing the quilt's own colors if it was shown). Removing the quilt's own
 * colors (no id) makes the next colorway the quilt's colors: its swaps are painted in (`blocks`
 * give placed blocks' own fills) and the other colorways swap from those colors instead.
 */
export function removeColorway(q: Quilt, id: string | undefined, blocks: readonly Block[]): Quilt {
  if (!id) return removeOwnColors(q, blocks);
  const colorways = (q.colorways ?? []).filter((v) => v.id !== id);
  const out: Quilt = { ...q, colorways };
  if (q.shownColorway === id) delete out.shownColorway;
  return out;
}

function removeOwnColors(q: Quilt, blocks: readonly Block[]): Quilt {
  const [next, ...rest] = q.colorways ?? [];
  if (!next) return q;
  // A re-color becomes the quilt's colors as painted. The others keep their swaps and re-colors.
  if (next.recolor) {
    const view = recolorView({ ...q, shownColorway: next.id });
    const used = new Set(Object.values(view.layers[0].slots).map((s) => s.coloring));
    for (const item of view.layers.flatMap((l) => l.items))
      if (item.coloring) used.add(item.coloring);
    const colorings = Object.fromEntries(
      Object.entries(view.colorings).filter(([id]) => used.has(id)),
    );
    const out: Quilt = { ...view, colorings, colorways: rest, primaryName: next.name };
    if (q.shownColorway && q.shownColorway !== next.id) out.shownColorway = q.shownColorway;
    return out;
  }
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const swap = swapper(next);
  const colorings = { ...q.colorings };
  /** Each fill the quilt shows, by fill key (before the change). */
  const shown = new Map<string, Fill>();
  for (const s of Object.values(q.layers[0].slots)) {
    const r = resolveColoring(q.colorings[s.coloring], byId.get(s.block));
    if (!r) continue;
    const fills = { ...colorings[s.coloring]!.fills };
    for (const [patch, f] of Object.entries(r.fills)) {
      shown.set(fillKey(f), f);
      const to = swap(f)!;
      if (to !== f) fills[patch] = to;
    }
    colorings[s.coloring] = { ...colorings[s.coloring]!, fills };
  }
  // The others swap from the new colors (two colors that became one take the first's swap). An
  // auto mapping (spec 024) keeps the picks it shows and becomes manual, so nothing looks different.
  const colorways = rest.map(({ auto: _auto, ...w }): Colorway => {
    void _auto;
    const swapW = swapper(w);
    const swaps: Colorway['swaps'] = [];
    const seen = new Set<string>();
    for (const f of shown.values()) {
      const from = fillKey(swap(f));
      if (seen.has(from)) continue;
      seen.add(from);
      const to = swapW(f)!;
      if (fillKey(to) !== from) swaps.push({ from, to });
    }
    return { ...w, swaps };
  });
  const out: Quilt = { ...q, colorings, colorways, primaryName: next.name };
  // A data quilt's scale (spec 025) takes the new colors too.
  if (q.data) {
    const to = (f: PlainFill) => plainFill(swap(f)) ?? f;
    out.data = {
      ...q.data,
      slots: q.data.slots.map((s) => ({
        ...s,
        ranges: s.ranges.map((r) => ({ ...r, fill: to(r.fill) })),
        categories: s.categories.map((c) => ({ ...c, fill: to(c.fill) })),
      })),
      ...(q.data.filler ? { filler: to(q.data.filler) } : {}),
    };
  }
  if (!q.shownColorway || q.shownColorway === next.id) delete out.shownColorway;
  return out;
}

/** The colors and fabrics colorways swap or paint in, as colorings (to keep library ones in the
 *  project). */
export const swapColorings = (quilts: readonly Quilt[]): ColoringBody[] =>
  quilts.flatMap((q) =>
    (q.colorways ?? []).flatMap((v): ColoringBody[] => [
      { fills: Object.fromEntries(v.swaps.map((s, i) => [i, s.to])) },
      ...recolorings(v),
    ]),
  );

/** A colorway's own colorings (a re-color's). */
export const recolorings = (v: Colorway): ColoringBody[] =>
  v.recolor ? Object.values(v.recolor.colorings) : [];
