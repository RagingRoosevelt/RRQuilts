// Data quilts (spec 025): which day a data paint stands for, that day's value, and the fill its
// slot's scale gives it. `slotColoring` is a block space's coloring with every data paint replaced
// by what it shows now, so drawing, printing, yardage and colorways read ordinary fills.
import type { Draft } from 'immer';
import { resolveColoring } from './coloring';
import { sampleSeries } from './data-samples';
import type { Block } from './schema/block';
import type { ColoringBody, DataPaint, Fill, PlainFill } from './schema/coloring';
import type { DataPlan, ValueSlot } from './schema/data-quilt';
import type { Quilt } from './schema/quilt';

const DAY = 86_400_000;
const parse = (key: string) => {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
};
export const dateKey = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Days in the one-year period from `start` (366 when it holds a 29 February). */
export function periodLength(start: string) {
  const t = parse(start);
  const d = new Date(t);
  return Math.round((Date.UTC(d.getUTCFullYear() + 1, d.getUTCMonth(), d.getUTCDate()) - t) / DAY);
}

/** The date of day `i` (1-based) of the period. */
export const dayDate = (start: string, i: number) => dateKey(parse(start) + (i - 1) * DAY);

/** Days in the period's `unit`-th month (1-based). */
export function monthLength(start: string, unit: number) {
  const d = new Date(parse(start));
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + unit, 0)).getUTCDate();
}

/** Days in each unit (months: 28–31; weeks: 7). */
export const unitLength = (plan: DataPlan, unit: number) =>
  plan.plan === 'months' ? monthLength(plan.start, unit) : 7;

/**
 * The period day (1-based) a paint stands for in a space numbered `unit`; `undefined` for a place
 * its unit doesn't reach (unused), `null` when it can't be told (a local paint with no unit).
 */
export function dayOf(
  plan: DataPlan,
  unit: number | undefined,
  p: DataPaint,
): number | undefined | null {
  const n = periodLength(plan.start);
  if (p.year) return p.n <= n ? p.n : undefined;
  if (plan.plan === 'days' || !unit) return null;
  let i: number;
  if (plan.plan === 'weeks') {
    if (p.n > 7 || unit > 52) return undefined;
    i = 7 * (unit - 1) + p.n;
  } else {
    if (unit > 12 || p.n > monthLength(plan.start, unit)) return undefined;
    const s = new Date(parse(plan.start));
    i =
      Math.round(
        (Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + unit - 1, p.n) - parse(plan.start)) / DAY,
      ) + 1;
  }
  return i >= 1 && i <= n ? i : undefined;
}

/** Day of the calendar year (0–364) of a date, 29 February reading 28 February. */
function yearDay(key: string) {
  const d = new Date(parse(key));
  const md = Date.UTC(
    2001,
    d.getUTCMonth(),
    Math.min(d.getUTCDate(), d.getUTCMonth() === 1 ? 28 : 31),
  );
  return Math.round((md - Date.UTC(2001, 0, 1)) / DAY);
}

type Value = number | string | null | undefined;
const monthDays = new WeakMap<object, Map<string, readonly Value[]>>();

/** A slot's sample value on a date (matched by day of the year). */
export function sampleValue(plan: DataPlan, key: string, slot: number): Value {
  const sim = plan.sim;
  if (sim.source === 'builtin') {
    const s = sampleSeries().find((x) => x.id === sim.series[slot]);
    const v = s?.values[yearDay(key)];
    return v !== undefined && s?.unit === '°F' && plan.slots[slot]?.unit === '°C'
      ? Math.round(((v - 32) * 5) / 9)
      : v;
  }
  let byDay = monthDays.get(sim.values);
  if (!byDay) {
    byDay = new Map(Object.entries(sim.values).map(([k, v]) => [k.slice(5), v]));
    monthDays.set(sim.values, byDay);
  }
  const md = key.slice(5);
  return (sim.values[key] ?? byDay.get(md) ?? (md === '02-29' ? byDay.get('02-28') : undefined))?.[
    slot
  ];
}

/** A value's fill on a slot's scale (numbers: the range holding it, else the nearest; categories:
 *  by id, name, or a number's place in the list). */
export function scaleFill(s: ValueSlot, v: Value): PlainFill | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (s.kind === 'category') {
    const c =
      typeof v === 'number'
        ? s.categories[Math.min(s.categories.length, Math.max(1, Math.round(v))) - 1]
        : (s.categories.find((x) => x.id === v) ??
          s.categories.find((x) => x.name.toLowerCase() === v.toLowerCase()));
    return c?.fill;
  }
  const x = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(x) || !s.ranges.length) return undefined;
  let best = s.ranges[0]!;
  let gap = Infinity;
  for (const r of s.ranges) {
    if (x >= r.from && x < r.to) return r.fill;
    const g = Math.min(Math.abs(x - r.from), Math.abs(x - r.to));
    if (g < gap || (g === gap && x >= r.from)) [best, gap] = [r, g];
  }
  return best.fill;
}

/** What a data paint shows now: a fill, or the paint itself (a placeholder) when it can't be told. */
export function dataFill(
  plan: DataPlan,
  unit: number | undefined,
  f: Extract<Fill, { data: unknown }>,
): Fill | undefined {
  const day = dayOf(plan, unit, f.data);
  if (day === null) return f;
  const designed = f.under ?? f;
  if (day === undefined) return plan.unused === 'filler' ? (plan.filler ?? designed) : designed;
  const slot = f.data.slot ?? 0;
  const s = plan.slots[slot];
  if (!s) return f;
  const key = dayDate(plan.start, day);
  let v: Value;
  if (plan.show === 'real') {
    v = plan.entries[key]?.[slot];
    if (v === null || v === undefined) {
      if (plan.waiting === 'filler') return plan.filler ?? designed;
      if (plan.waiting === 'designed') return designed;
      v = sampleValue(plan, key, slot);
    }
  } else v = sampleValue(plan, key, slot);
  return scaleFill(s, v) ?? designed;
}

const cache = new WeakMap<Quilt, Map<string, { block: Block; body: ColoringBody | undefined }>>();

/** A block space's fills as shown: its coloring (`resolveColoring`) with data paints worked out. */
export function slotColoring(
  quilt: Quilt,
  slotId: string,
  block: Block | undefined,
): ColoringBody | undefined {
  const content = quilt.layers[0].slots[slotId];
  const c = resolveColoring(content && quilt.colorings[content.coloring], block);
  const plan = quilt.data;
  if (!c || !plan?.on || !Object.values(c.fills).some((f) => 'data' in f)) return c;
  let m = cache.get(quilt);
  if (!m) cache.set(quilt, (m = new Map()));
  const hit = m.get(slotId);
  if (hit && hit.block === block) return hit.body;
  const unit = plan.units[slotId];
  const fills: Record<string, Fill> = {};
  for (const [k, f] of Object.entries(c.fills)) {
    const r = 'data' in f ? dataFill(plan, unit, f) : f;
    if (r) fills[k] = r;
  }
  const body = { ...c, fills };
  m.set(slotId, { block: block!, body });
  return body;
}

/** The fills a quilt's data plan holds (scales and filler), as a coloring, so their colors and
 *  fabrics count as used. */
export const dataColorings = (quilts: readonly Quilt[]): ColoringBody[] =>
  quilts.flatMap((q) => {
    const d = q.data;
    if (!d) return [];
    const fills = [
      ...d.slots.flatMap((s) => [
        ...s.ranges.map((r) => r.fill),
        ...s.categories.map((c) => c.fill),
      ]),
      ...(d.filler ? [d.filler] : []),
    ];
    return [{ fills: Object.fromEntries(fills.map((f, i) => [i, f])) }];
  });

/** Blocks a quilt's month or week picks name. */
export const dataBlocks = (q: Quilt): string[] =>
  Object.values(q.data?.picks ?? {}).flatMap((ids) => ids ?? []);

/** A stable pick in 0…n−1 for a block space (FNV-1a of seed and space id). */
function pickIndex(seed: number, slotId: string, n: number) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < slotId.length; i++) h = Math.imul(h ^ slotId.charCodeAt(i), 16777619);
  return (h >>> 0) % n;
}

/** The blocks a unit can take: its length's picks, else the next longer length's. */
export function picksFor(plan: DataPlan, unit: number): readonly string[] {
  if (plan.plan === 'weeks') return plan.picks['7'] ?? [];
  if (plan.plan !== 'months') return [];
  for (let len = monthLength(plan.start, unit); len <= 31; len++) {
    const p = plan.picks[String(len) as '28'];
    if (p?.length) return p;
  }
  return [];
}

/**
 * Put each numbered space's pick in it (spec 025 FR-007), keeping its turn and flip; a new block
 * gets a coloring that follows the block's first. Spaces with no picks keep what they hold.
 */
export function applyPicks(q: Draft<Quilt>, blocks: readonly Block[], newId: () => string) {
  const plan = q.data;
  if (!plan?.on) return;
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const slots = q.layers[0].slots;
  for (const [slotId, unit] of Object.entries(plan.units)) {
    const list = picksFor(plan, unit).filter((id) => byId.has(id));
    if (!list.length) continue;
    const id = list[pickIndex(plan.seed, slotId, list.length)]!;
    const now = slots[slotId];
    if (now?.block === id) continue;
    let coloring: string;
    do coloring = newId();
    while (coloring in q.colorings);
    const base = byId.get(id)!.colorings[0]?.id;
    q.colorings[coloring] = { fills: {}, ...(base ? { base } : {}) };
    slots[slotId] = { block: id, coloring, rotation: now?.rotation ?? 0, flip: now?.flip ?? false };
    const old = now?.coloring;
    const used = (c: string) =>
      Object.values(slots).some((s) => s.coloring === c) ||
      q.layers.some((l) => l.items.some((i) => i.coloring === c));
    if (old && !used(old)) delete q.colorings[old];
  }
}
