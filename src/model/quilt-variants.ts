// Quilt color variants (palette swaps): a variant swaps colors and fabrics over the whole quilt
// (every piece colored `from` shows `to`), so the design's edits show in every variant. The quilt
// remembers which variant it shows (none: its own colors).
import { fillKey } from './coloring';
import type { ColoringBody, Fill } from './schema/coloring';
import type { Quilt, QuiltVariant } from './schema/quilt';

/** The variant a quilt shows (undefined: its own colors). */
export const shownVariant = (q: Pick<Quilt, 'variants' | 'shownVariant'>, id = q.shownVariant) =>
  id ? q.variants?.find((v) => v.id === id) : undefined;

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
  const v: QuiltVariant = { id, name: name ?? `Variant ${variants.length + 1}`, swaps };
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

export const renameVariant = (q: Quilt, id: string, name: string): Quilt => ({
  ...q,
  variants: (q.variants ?? []).map((v) => (v.id === id ? { ...v, name } : v)),
});

/** Remove a variant (showing the quilt's own colors if it was shown). */
export function removeVariant(q: Quilt, id: string): Quilt {
  const variants = (q.variants ?? []).filter((v) => v.id !== id);
  const out: Quilt = { ...q, variants };
  if (q.shownVariant === id) delete out.shownVariant;
  return out;
}

/** The colors and fabrics variants swap in, as colorings (to keep library ones in the project). */
export const swapColorings = (quilts: readonly Quilt[]): ColoringBody[] =>
  quilts.flatMap((q) =>
    (q.variants ?? []).map((v): ColoringBody => ({
      fills: Object.fromEntries(v.swaps.map((s, i) => [i, s.to])),
    })),
  );
