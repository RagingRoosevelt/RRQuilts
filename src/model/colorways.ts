// Quilt colorways: a colorway swaps colors and fabrics over the whole quilt
// (every piece colored `from` shows `to`), so the design's edits show in every colorway. The quilt
// remembers which colorway it shows (none: its own colors). The quilt's own colors are the first
// colorway (named `primaryName`): any colorway can go while another is left, as a block's colorings.
// A re-color (`recolor`) is instead a colorway painted patch by patch, as the primary is: each block
// space has its own coloring there (owner, 2026-11-25). A Palette or Auto mapping colorway follows
// another (`source`): its picks are keyed by its base's colors, the primary's unless the chain of
// sources reaches a re-color, whose painting it then maps.
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

/** The name of the colorway a quilt shows (its own colors: the primary's). */
export const shownName = (q: Pick<Quilt, 'colorways' | 'shownColorway' | 'primaryName'>) =>
  colorwayList(q).find((c) => c.id === shownColorway(q)?.id)!.name;

/** Every colorway to pick: the quilt's own colors (no id) first. */
export function colorwayList(
  q: Pick<Quilt, 'colorways' | 'primaryName'>,
): { id: string | undefined; name: string }[] {
  return followOrder(colorwayItems(q), colorwayFollows).map((v) => ({
    id: v.id === PRIMARY ? undefined : v.id,
    name: v.name,
  }));
}

// The primary first with what follows it (Palette and Auto map without a source follow it), then
// each re-color (painted: it follows nothing) with what follows it.
const PRIMARY = '\u0000primary';
type Listed = Pick<Colorway, 'id' | 'name' | 'source' | 'recolor'>;
const colorwayItems = (q: Pick<Quilt, 'colorways' | 'primaryName'>): Listed[] => [
  { id: PRIMARY, name: q.primaryName ?? 'Colorway 1' },
  ...(q.colorways ?? []),
];
const colorwayFollows = (v: Listed) =>
  v.id === PRIMARY || v.recolor ? undefined : (v.source ?? PRIMARY);

/** Where colorway `id` lands for a drop in gap `gap` of `colorwayList` (null: it doesn't move). */
export const colorwayGap = (q: Quilt, id: string, gap: number) =>
  siblingGap(colorwayItems(q), colorwayFollows, id, gap, PRIMARY);

/** Colorway `id` moved among the colorways that follow what it follows, those following it
 *  along (`siblingMove`); the primary stays first. */
export function moveColorway(q: Quilt, id: string, how: SiblingMove): Quilt {
  const moved = siblingMove(colorwayItems(q), colorwayFollows, id, how, PRIMARY);
  const colorways = moved.filter((v): v is Colorway => v.id !== PRIMARY);
  return colorways.every((v, i) => v === q.colorways?.[i]) ? q : { ...q, colorways };
}

/** Where to: a drop in gap `gap` of the list as shown, `by` places among its siblings, or first or
 *  last of them. */
export type SiblingMove = { gap: number } | { by: number } | { to: 'first' | 'last' };

/** Where `id` really lands for a drop in gap `gap` of the list as shown (`siblingMove`): the gap
 *  before what will follow it and its followers, in the list as it is (null: it doesn't move). */
export function siblingGap<T extends { id: string }>(
  items: readonly T[],
  follows: (t: T) => string | undefined,
  id: string,
  gap: number,
  fixed?: string,
): number | null {
  const moved = siblingMove(items, follows, id, { gap }, fixed);
  if (moved.every((t, i) => t === items[i])) return null;
  const was = followOrder(items, follows);
  const now = followOrder(moved, follows);
  const i = now.findIndex((t) => t.id === id);
  // It and its followers stay together: the first after them.
  const span = was.findIndex((t) => t.id === id);
  let size = 1;
  const inside = new Set([id]);
  for (const t of was.slice(span + 1)) {
    const p = follows(t);
    if (!p || !inside.has(p)) break;
    inside.add(t.id);
    size++;
  }
  const next = now[i + size];
  return next ? was.indexOf(next) : was.length;
}

/**
 * `items` with `id` moved among its siblings (the items that follow what it follows, in the list
 * `followOrder` shows), so the list keeps each item right after the one it follows; its followers
 * come along. A drop past its siblings stops at the first or last place. `fixed` never moves.
 */
export function siblingMove<T extends { id: string }>(
  items: readonly T[],
  follows: (t: T) => string | undefined,
  id: string,
  how: SiblingMove,
  fixed?: string,
): T[] {
  const ids = new Set(items.map((t) => t.id));
  const parent = (t: T) => {
    const p = follows(t);
    return p && p !== t.id && ids.has(p) ? p : undefined;
  };
  const me = items.find((t) => t.id === id);
  if (!me || id === fixed) return [...items];
  const others = items.filter((t) => t !== me && t.id !== fixed && parent(t) === parent(me));
  const now = items.filter((t) => t.id !== fixed && parent(t) === parent(me)).indexOf(me);
  let to: number;
  if ('gap' in how) {
    // Siblings whose place in the list starts before the gap stay before it.
    const at = new Map(followOrder(items, follows).map((t, i) => [t.id, i]));
    to = others.filter((t) => at.get(t.id)! < how.gap).length;
  } else if ('by' in how) to = now + how.by;
  else to = how.to === 'first' ? 0 : others.length;
  to = Math.max(0, Math.min(to, others.length));
  if (to === now || !others.length) return [...items];
  const rest = items.filter((t) => t !== me);
  const anchor = to === 0 ? others[0]! : others[to - 1]!;
  const k = rest.indexOf(anchor) + (to === 0 ? 0 : 1);
  return [...rest.slice(0, k), me, ...rest.slice(k)];
}

/**
 * Items as lists show them (owner, 2026-11-25): each one followed at once by those that follow it
 * (`follows`: its source; Palette and Auto map colorways and rosette colorings), and theirs, in
 * stored order otherwise. Display only: the stored order stays.
 */
export function followOrder<T extends { id: string }>(
  items: readonly T[],
  follows: (t: T) => string | undefined,
): T[] {
  const ids = new Set(items.map((t) => t.id));
  const parent = (t: T) => {
    const p = follows(t);
    return p && p !== t.id && ids.has(p) ? p : undefined;
  };
  const kids = new Map<string, T[]>();
  for (const t of items) {
    const p = parent(t);
    if (p) kids.set(p, [...(kids.get(p) ?? []), t]);
  }
  const out: T[] = [];
  const seen = new Set<string>();
  const visit = (t: T) => {
    if (seen.has(t.id)) return;
    seen.add(t.id);
    out.push(t);
    for (const k of kids.get(t.id) ?? []) visit(k);
  };
  // Those that follow nothing listed first, with their followers; then any left (a loop).
  for (const t of items) if (!parent(t)) visit(t);
  for (const t of items) visit(t);
  return out;
}

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

/** The re-color `v` is painted as: itself, or the first its chain of sources reaches (undefined:
 *  the primary). Its colors key `v`'s picks. */
export function baseOf(q: Pick<Quilt, 'colorways'>, v: Colorway | undefined): Colorway | undefined {
  const seen = new Set<string>();
  while (v && !v.recolor && v.source && !seen.has(v.id)) {
    seen.add(v.id);
    const source = v.source;
    v = q.colorways?.find((w) => w.id === source);
  }
  return v?.recolor ? v : undefined;
}

/** The quilt's spaces and coloring table as `v`'s base paints them (what its picks are keyed by). */
export const baseView = (q: Quilt, v: Colorway | undefined): Quilt => {
  const b = baseOf(q, v);
  return b ? recolorView({ ...q, shownColorway: b.id }) : q;
};

/** A block space's coloring as the shown colorway has it: its base re-color's own while the space
 *  holds the block it had when painted, else the quilt's. */
export function spaceColoring(q: Quilt, slotId: string): ColoringBody | undefined {
  const s = q.layers[0].slots[slotId];
  if (!s) return undefined;
  const r = baseOf(q, shownColorway(q))?.recolor;
  const own = r?.slots[slotId];
  return own && own.block === s.block ? r.colorings[own.coloring] : q.colorings[s.coloring];
}

/** A new colorway, shown at once: the quilt's own colors, or a copy of `from`. */
export function addColorway(q: Quilt, id: string, name?: string, from?: Colorway): Quilt {
  const colorways = q.colorways ?? [];
  const swaps = from ? from.swaps.map((s) => ({ ...s })) : [];
  const v: Colorway = { id, name: name ?? `Colorway ${colorways.length + 2}`, swaps };
  if (from?.source) v.source = from.source;
  if (from?.recolor) v.recolor = structuredClone(from.recolor);
  return { ...q, colorways: [...colorways, v], shownColorway: id };
}

/** Make colorway `id` a re-color, starting from the colors it shows (`blocks`: the placed blocks). */
export function startRecolor(q: Quilt, id: string, blocks: readonly Block[]): Quilt {
  const v = q.colorways?.find((x) => x.id === id);
  if (!v || v.recolor) return q;
  const recolor = snapshot(q, v, blocks);
  return { ...q, colorways: q.colorways!.map((x) => (x.id === id ? { ...x, recolor } : x)) };
}

/** What `v` (not a re-color) shows, painted as a re-color's own colorings. */
function snapshot(q: Quilt, v: Colorway, blocks: readonly Block[]): Recolor {
  const base = baseView(q, v);
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const swap = swapper(v);
  const recolor: Recolor = { slots: {}, colorings: {} };
  for (const [sid, s] of Object.entries(base.layers[0].slots)) {
    recolor.slots[sid] = { block: s.block, coloring: s.coloring };
    if (s.coloring in recolor.colorings) continue;
    const r = resolveColoring(base.colorings[s.coloring], byId.get(s.block));
    if (!r) continue;
    const fills: ColoringBody['fills'] = {};
    for (const [patch, f] of Object.entries(r.fills)) fills[patch] = swap(f) ?? f;
    recolor.colorings[s.coloring] = { fills, ...(r.threads ? { threads: r.threads } : {}) };
  }
  return recolor;
}

/** `w` following `source` instead (none: the primary); its auto mapping goes unless `keepAuto`
 *  (it keeps the picks it shows, spec 024 FR-005). */
function refollow(w: Colorway, source: string | undefined, keepAuto: boolean): Colorway {
  const { source: _s, auto, ...rest } = w;
  void _s;
  return { ...rest, ...(keepAuto && auto ? { auto } : {}), ...(source ? { source } : {}) };
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
 * give placed blocks' own fills) and the other colorways swap from those colors instead. Every
 * other colorway looks as it did: those following the one removed follow its source, and those
 * painted as a re-color that goes become re-colors of what they show.
 */
export function removeColorway(q: Quilt, id: string | undefined, blocks: readonly Block[]): Quilt {
  if (!id) return removeOwnColors(q, blocks);
  const gone = q.colorways?.find((v) => v.id === id);
  if (!gone) return q;
  const colorways = q.colorways!.flatMap((w): Colorway[] => {
    if (w === gone) return [];
    const x =
      gone.recolor && !w.recolor && baseOf(q, w) === gone
        ? { ...w, recolor: snapshot(q, w, blocks) }
        : w;
    return [w.source === id ? refollow(x, gone.source, !!x.recolor) : x];
  });
  const out: Quilt = { ...q, colorways };
  if (q.shownColorway === id) delete out.shownColorway;
  return out;
}

function removeOwnColors(q: Quilt, blocks: readonly Block[]): Quilt {
  const [first, ...rest] = q.colorways ?? [];
  if (!first) return q;
  // One painted as a re-color is painted as it shows first.
  const next =
    first.recolor || !baseOf(q, first) ? first : { ...first, recolor: snapshot(q, first, blocks) };
  // A re-color becomes the quilt's colors as painted. Those on the old colors become re-colors of
  // what they show; those following it follow the new colors (or, when it was painted as another
  // re-color, that one).
  if (next.recolor) {
    const view = recolorView({ ...q, colorways: [next, ...rest], shownColorway: next.id });
    const used = new Set(Object.values(view.layers[0].slots).map((s) => s.coloring));
    for (const item of view.layers.flatMap((l) => l.items))
      if (item.coloring) used.add(item.coloring);
    const colorings = Object.fromEntries(
      Object.entries(view.colorings).filter(([id]) => used.has(id)),
    );
    const colorways = rest.map((w) => {
      const x = !w.recolor && !baseOf(q, w) ? { ...w, recolor: snapshot(q, w, blocks) } : w;
      return w.source === first.id
        ? refollow(x, first.recolor ? undefined : first.source, !!first.recolor || !!x.recolor)
        : x;
    });
    const out: Quilt = { ...view, colorings, colorways, primaryName: next.name };
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
  // Those painted as a re-color keep their picks (that re-color stays).
  const colorways = rest.map((v): Colorway => {
    const w = refollow(v, v.source === next.id ? undefined : v.source, false);
    if (w.recolor || baseOf(q, v)) return w;
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
