// Auto mapping (spec 024): a colorway that follows another colorway's colors (`source`, none: the
// primary), each becoming its nearest color or fabric in a palette, except the quilter's overrides.
// Picks and overrides are keyed by its base's colors (`baseOf`: the primary, or a re-color). Its
// `swaps` are worked out again on every project change (syncDraft), so drawing, printing and
// embedding read them like any colorway's.
import { fillKey, resolveColoring } from './coloring';
import { nearestColor, type RGB } from './color-distance';
import { baseOf, baseView, swapper } from './colorways';
import { dataColorings } from './data-quilt';
import type { Block } from './schema/block';
import type { Fill } from './schema/coloring';
import type { Colorway, Quilt } from './schema/quilt';

/** A palette's color or fabric as a pick (fabrics by their average color). */
export interface PaletteSwatch {
  fill: Fill;
  rgb: RGB;
}

/** The quilt's own fills (its primary colorway), by fill key, in the order pieces show them. */
export function primaryFills(q: Quilt, blocks: readonly Block[]): Map<string, Fill> {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const out = new Map<string, Fill>();
  for (const s of Object.values(q.layers[0].slots)) {
    const r = resolveColoring(q.colorings[s.coloring], byId.get(s.block));
    for (const f of Object.values(r?.fills ?? {}))
      if (!('data' in f) && !out.has(fillKey(f))) out.set(fillKey(f), f);
  }
  // A data quilt's scale colors (spec 025).
  for (const c of dataColorings([q]))
    for (const f of Object.values(c.fills)) if (!out.has(fillKey(f))) out.set(fillKey(f), f);
  return out;
}

/** The colorways `id` leads to through auto mapping sources (itself first): a source can't be one. */
export function dependents(q: Pick<Quilt, 'colorways'>, id: string): Set<string> {
  const out = new Set([id]);
  for (let grew = true; grew;) {
    grew = false;
    for (const v of q.colorways ?? [])
      if (v.source && out.has(v.source) && !out.has(v.id)) grew = !!out.add(v.id);
  }
  return out;
}

/**
 * Every auto mapping worked out again. `paletteOf` gives a palette's picks (undefined: gone; null:
 * can't tell, e.g. libraries not known here, so that colorway is left as it is), `rgbOf` a fill's color. A colorway whose source is gone, whose palette is gone or empty, or whose
 * source chain loops becomes a manual one keeping the picks it has (spec 024 FR-005). Unchanged
 * colorways are returned as they were (so nothing changes when nothing moved).
 */
export function refreshAuto(
  q: Quilt,
  blocks: readonly Block[],
  paletteOf: (id: string) => readonly PaletteSwatch[] | undefined | null,
  rgbOf: (f: Fill) => RGB | undefined,
): Quilt {
  const list = q.colorways ?? [];
  if (!list.some((v) => v.auto && !v.recolor)) return q;
  /** Each base's colors (undefined: the primary's). */
  const bases = new Map<Colorway | undefined, Map<string, Fill>>();
  const keysOf = (v: Colorway) => {
    const b = baseOf(q, v);
    if (!bases.has(b)) bases.set(b, primaryFills(baseView(q, v), blocks));
    return bases.get(b)!;
  };
  const done = new Map<string, Colorway>();
  const out = list.map((v) => v);
  // Sources first: each pass settles the colorways whose source is settled (or the primary).
  for (let pass = 0; pass <= list.length; pass++)
    list.forEach((v, i) => {
      if (done.has(v.id)) return;
      const a = v.auto;
      // A re-color keeps its mapping only for going back.
      if (!a || v.recolor) return void done.set(v.id, v);
      const src = v.source ? list.find((w) => w.id === v.source) : undefined;
      const manual = (): Colorway => {
        const { auto: _a, ...rest } = v;
        void _a;
        if (v.source && !src) delete rest.source;
        return rest;
      };
      const pal = paletteOf(a.palette);
      if (pal === null) return void done.set(v.id, v);
      if ((v.source && !src) || !pal?.length) return void done.set(v.id, (out[i] = manual()));
      if (src && !done.has(src.id)) {
        if (pass === list.length) done.set(v.id, (out[i] = manual())); // a loop
        return;
      }
      // Each base color as the source shows it (a re-color source is the base itself).
      const shown = swapper(src ? done.get(src.id) : undefined);
      const keys = keysOf(v);
      const inPalette = new Set(pal.map((p) => fillKey(p.fill)));
      const overrides = (a.overrides ?? []).filter(
        (o) => keys.has(o.from) && inPalette.has(fillKey(o.to)),
      );
      const over = new Map(overrides.map((o) => [o.from, o.to]));
      const swaps: Colorway['swaps'] = [];
      for (const [from, f] of keys) {
        const srcFill = shown(f)!;
        const rgb = rgbOf(srcFill);
        const to = over.get(from) ?? (rgb && nearestColor(rgb, pal)?.fill);
        if (to && fillKey(to) !== from) swaps.push({ from, to });
      }
      const next: Colorway = {
        ...v,
        swaps,
        auto: { ...a, ...(overrides.length ? { overrides } : {}) },
      };
      if (!overrides.length) delete next.auto!.overrides;
      done.set(v.id, (out[i] = JSON.stringify(next) === JSON.stringify(v) ? v : next));
    });
  return out.every((v, i) => v === list[i]) ? q : { ...q, colorways: out };
}
