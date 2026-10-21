// Quilt colorways: a colorway swaps colors and fabrics over the whole quilt
// (every piece colored `from` shows `to`), so the design's edits show in every colorway. The quilt
// remembers which colorway it shows (none: its own colors). The quilt's own colors are the first
// colorway (named `primaryName`): any colorway can go while another is left, as a block's colorings.
import { fillKey, resolveColoring } from './coloring';
import type { Block } from './schema/block';
import type { ColoringBody, Fill } from './schema/coloring';
import type { Quilt, Colorway } from './schema/quilt';

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

/** A fill as a colorway shows it (the fill itself when nothing swaps it). */
export function swapper(v: Colorway | undefined): (f: Fill | undefined) => Fill | undefined {
  if (!v?.swaps.length) return (f) => f;
  const map = new Map(v.swaps.map((s) => [s.from, s.to]));
  return (f) => (f ? (map.get(fillKey(f)) ?? f) : f);
}

/** A coloring as a colorway shows it. */
export function swapColoring(
  c: ColoringBody | undefined,
  v: Colorway | undefined,
): ColoringBody | undefined {
  if (!c || !v?.swaps.length) return c;
  const swap = swapper(v);
  const fills: ColoringBody['fills'] = {};
  for (const [k, f] of Object.entries(c.fills)) fills[k] = swap(f) ?? f;
  return { ...c, fills };
}

/** A new colorway, shown at once: the quilt's own colors, or a copy of `from`'s swaps. */
export function addColorway(q: Quilt, id: string, name?: string, from?: Colorway): Quilt {
  const colorways = q.colorways ?? [];
  const swaps = from ? from.swaps.map((s) => ({ ...s })) : [];
  const v: Colorway = { id, name: name ?? `Colorway ${colorways.length + 2}`, swaps };
  return { ...q, colorways: [...colorways, v], shownColorway: id };
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
  if (!q.shownColorway || q.shownColorway === next.id) delete out.shownColorway;
  return out;
}

/** The colors and fabrics colorways swap in, as colorings (to keep library ones in the project). */
export const swapColorings = (quilts: readonly Quilt[]): ColoringBody[] =>
  quilts.flatMap((q) =>
    (q.colorways ?? []).map((v): ColoringBody => ({
      fills: Object.fromEntries(v.swaps.map((s, i) => [i, s.to])),
    })),
  );
