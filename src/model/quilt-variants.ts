// Quilt color variants (palette swaps): a variant swaps colors and fabrics over the whole quilt
// (every piece colored `from` shows `to`), so the design's edits show in every variant. The quilt
// remembers which variant it shows (none: its own colors). The quilt's own colors are the first
// variant (named `colorsName`): any variant can go while another is left, as a block's colorings.
import { fillKey, resolveColoring } from './coloring';
import type { Block } from './schema/block';
import type { ColoringBody, Fill } from './schema/coloring';
import type { Quilt, QuiltVariant } from './schema/quilt';

/** The variant a quilt shows (undefined: its own colors). */
export const shownVariant = (q: Pick<Quilt, 'variants' | 'shownVariant'>, id = q.shownVariant) =>
  id ? q.variants?.find((v) => v.id === id) : undefined;

/** Every variant to pick: the quilt's own colors (no id) first. */
export const variantList = (
  q: Pick<Quilt, 'variants' | 'colorsName'>,
): { id: string | undefined; name: string }[] => [
  { id: undefined, name: q.colorsName ?? 'Variant 1' },
  ...(q.variants ?? []).map((v) => ({ id: v.id, name: v.name })),
];

/** A fill as a variant shows it (the fill itself when nothing swaps it). */
export function swapper(v: QuiltVariant | undefined): (f: Fill | undefined) => Fill | undefined {
  if (!v?.swaps.length) return (f) => f;
  const map = new Map(v.swaps.map((s) => [s.from, s.to]));
  return (f) => (f ? (map.get(fillKey(f)) ?? f) : f);
}

/** A coloring as a variant shows it. */
export function swapColoring(
  c: ColoringBody | undefined,
  v: QuiltVariant | undefined,
): ColoringBody | undefined {
  if (!c || !v?.swaps.length) return c;
  const swap = swapper(v);
  const fills: ColoringBody['fills'] = {};
  for (const [k, f] of Object.entries(c.fills)) fills[k] = swap(f) ?? f;
  return { ...c, fills };
}

/** A new variant, shown at once: the quilt's own colors, or a copy of `from`'s swaps. */
export function addVariant(q: Quilt, id: string, name?: string, from?: QuiltVariant): Quilt {
  const variants = q.variants ?? [];
  const swaps = from ? from.swaps.map((s) => ({ ...s })) : [];
  const v: QuiltVariant = { id, name: name ?? `Variant ${variants.length + 2}`, swaps };
  return { ...q, variants: [...variants, v], shownVariant: id };
}

/** Swap `from` (a fill key) for `to` in a variant; swapping back to the original removes it. */
export function setSwap(q: Quilt, variantId: string, from: string, to: Fill): Quilt {
  return {
    ...q,
    variants: (q.variants ?? []).map((v) =>
      v.id !== variantId
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

/** Rename a variant (no id: the quilt's own colors). */
export const renameVariant = (q: Quilt, id: string | undefined, name: string): Quilt =>
  id
    ? { ...q, variants: (q.variants ?? []).map((v) => (v.id === id ? { ...v, name } : v)) }
    : { ...q, colorsName: name };

/**
 * Remove a variant (showing the quilt's own colors if it was shown). Removing the quilt's own
 * colors (no id) makes the next variant the quilt's colors: its swaps are painted in (`blocks`
 * give placed blocks' own fills) and the other variants swap from those colors instead.
 */
export function removeVariant(q: Quilt, id: string | undefined, blocks: readonly Block[]): Quilt {
  if (!id) return removeOwnColors(q, blocks);
  const variants = (q.variants ?? []).filter((v) => v.id !== id);
  const out: Quilt = { ...q, variants };
  if (q.shownVariant === id) delete out.shownVariant;
  return out;
}

function removeOwnColors(q: Quilt, blocks: readonly Block[]): Quilt {
  const [next, ...rest] = q.variants ?? [];
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
  // The others swap from the new colors (two colors that became one take the first's swap).
  const variants = rest.map((w): QuiltVariant => {
    const swapW = swapper(w);
    const swaps: QuiltVariant['swaps'] = [];
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
  const out: Quilt = { ...q, colorings, variants, colorsName: next.name };
  if (!q.shownVariant || q.shownVariant === next.id) delete out.shownVariant;
  return out;
}

/** The colors and fabrics variants swap in, as colorings (to keep library ones in the project). */
export const swapColorings = (quilts: readonly Quilt[]): ColoringBody[] =>
  quilts.flatMap((q) =>
    (q.variants ?? []).map((v): ColoringBody => ({
      fills: Object.fromEntries(v.swaps.map((s, i) => [i, s.to])),
    })),
  );
