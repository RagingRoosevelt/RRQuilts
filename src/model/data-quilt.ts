// Data quilts (spec 025): which day a data paint stands for, that day's value, and the fill its
// slot's scale gives it. `slotColoring` is a block space's coloring with every data paint replaced
// by what it shows now, so drawing, printing, yardage and colorways read ordinary fills.
import { castDraft, type Draft } from 'immer';
import { resolveColoring } from './coloring';
import { sampleSeries } from './data-samples';
import type { Block, DataKind, DataVariant } from './schema/block';
import type { ColoringBody, DataPaint, Fill, PlainFill } from './schema/coloring';
import type { DataPlace, DataPlan, DataPreset, ValueSlot } from './schema/data-quilt';
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

/** How Feb 29 is handled (spec 046 US6): Weeks and Days over a period holding it; else none. */
export function leapOf(plan: DataPlan): NonNullable<DataPlan['leap']> | undefined {
  if (plan.plan === 'months' || periodLength(plan.start) !== 366) return undefined;
  const l = plan.leap ?? 'extra';
  return plan.plan === 'days' && l === 'pair' ? 'extra' : l;
}

const placeCache = new Map<string, readonly string[]>();
/** The dates the plan places, in order (place day d = `placeDays[d - 1]`): the period's days,
 *  less 29 February when it is averaged into the 28th or ignored. */
export function placeDays(plan: DataPlan): readonly string[] {
  const leap = leapOf(plan);
  const key = `${plan.start}|${leap ?? ''}`;
  let out = placeCache.get(key);
  if (!out) {
    const all = Array.from({ length: periodLength(plan.start) }, (_, i) =>
      dayDate(plan.start, i + 1),
    );
    out = leap === 'average' || leap === 'ignore' ? all.filter((d) => !d.endsWith('-02-29')) : all;
    placeCache.set(key, out);
  }
  return out;
}

/** The date of place day `d` (1-based). */
export const placeDate = (plan: DataPlan, d: number) => placeDays(plan)[d - 1] ?? '';

export interface DataNumber {
  /** First place day (1-based) and how many it holds. */
  first: number;
  len: number;
  /** The kind of data block it takes: a month, a week (2-day numbers too), a single day. */
  kind: DataKind;
  label: string;
}

/** Whether a Weeks plan can start with a single day (spec 046 US5): one day left over (two are
 *  settled by the Leap day setting). */
export const canLead = (plan: DataPlan) => plan.plan === 'weeks' && placeDays(plan).length === 365;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (key: string) => {
  const d = new Date(parse(key));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

const numberCache = new Map<string, readonly DataNumber[]>();
/** The plan's numbers in order: 12 months; 52 weeks with the days left over (one: a single day at
 *  the end, or at the start with `lead`; two: a single day at both ends, or one 2-day number at the
 *  end); or a number per day. */
export function dataNumbers(plan: DataPlan): readonly DataNumber[] {
  const days = placeDays(plan);
  const leap = leapOf(plan);
  const lead = canLead(plan) && !!plan.lead;
  const key = `${plan.plan}|${plan.start}|${leap ?? ''}|${lead}`;
  const hit = numberCache.get(key);
  if (hit) return hit;
  const day = (d: number): DataNumber => ({
    first: d,
    len: 1,
    kind: 'day',
    label: short(days[d - 1]!),
  });
  let out: DataNumber[];
  if (plan.plan === 'months') {
    const s = new Date(parse(plan.start));
    out = Array.from({ length: 12 }, (_, i) => ({
      first:
        Math.round(
          (Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + i, 1) - parse(plan.start)) / DAY,
        ) + 1,
      len: monthLength(plan.start, i + 1),
      kind: 'month' as const,
      label: MONTHS[(s.getUTCMonth() + i) % 12]!,
    }));
  } else if (plan.plan === 'days') {
    out = days.map((_, i) => day(i + 1));
  } else {
    const weeks = (from: number) =>
      Array.from({ length: 52 }, (_, i): DataNumber => ({
        first: from + 7 * i,
        len: 7,
        kind: 'week',
        label: `Wk ${i + 1}`,
      }));
    const n = days.length;
    if (n === 366 && leap === 'pair')
      out = [
        ...weeks(1),
        {
          first: n - 1,
          len: 2,
          kind: 'week',
          label: `${short(days[n - 2]!)}–${Number(days[n - 1]!.slice(8))}`,
        },
      ];
    else if (n === 366) out = [day(1), ...weeks(2), day(n)];
    else out = lead ? [day(1), ...weeks(2)] : [...weeks(1), day(n)];
  }
  numberCache.set(key, out);
  return out;
}

/** How many numbers the plan's list holds. */
export const numberCount = (plan: DataPlan) => dataNumbers(plan).length;

/** Number `k` (1-based): its first place day, how many it holds, the kind of block it takes. */
export const numberInfo = (plan: DataPlan, k: number): DataNumber | undefined =>
  Number.isInteger(k) ? dataNumbers(plan)[k - 1] : undefined;

/**
 * The place day (1-based, `placeDate`) a paint stands for in a space holding number `k`;
 * `undefined` for a place past the number's days (unused), `null` for a space with no number.
 */
export function dayOf(
  plan: DataPlan,
  k: number | undefined,
  p: DataPaint,
): number | undefined | null {
  if (!k) return null;
  const info = numberInfo(plan, k);
  return info && p.n <= info.len ? info.first + p.n - 1 : undefined;
}

const placeMaps = new WeakMap<object, Map<string, DataPlace>>();
/** The placement on a block space (spec 046: a space holds one). */
export function placeOf(plan: DataPlan, space: string): DataPlace | undefined {
  let m = placeMaps.get(plan.places);
  if (!m) placeMaps.set(plan.places, (m = new Map(plan.places.map((p) => [p.space, p]))));
  return m.get(space);
}
/** The number (1-based) a placed space holds. */
export const numberOf = (plan: DataPlan, space: string) => placeOf(plan, space)?.n;

/** The placements of number `k`, in the order they were placed. */
export const placesOf = (plan: DataPlan, k: number) => plan.places.filter((p) => p.n === k);

/** The quilt value (0–3) a block's own value `letter` reads in a placement. */
export const seriesOf = (place: DataPlace | undefined, letter: number) =>
  place?.series?.[letter] ?? letter;

const letterCache = new WeakMap<Block, number[]>();
/** The value letters (0–3) a data block's paints use, in order: its own series. */
export function blockLetters(b: Block): number[] {
  let out = letterCache.get(b);
  if (!out) {
    const s = new Set<number>();
    for (const c of b.colorings)
      for (const f of Object.values(c.fills)) if ('data' in f) s.add(f.data.slot ?? 0);
    out = s.size ? [...s].sort() : [0];
    letterCache.set(b, out);
  }
  return out;
}

/** A series map kept only where it differs from the block's own letters. */
export function cleanSeries(series: readonly (number | null)[] | undefined) {
  return series?.some((v, i) => v !== null && v !== undefined && v !== i)
    ? series.map((v) => v ?? null)
    : undefined;
}

const LETTERS = ['A', 'B', 'C', 'D'];
/** A placement's series line: the quilt values its block's values read, in the block's order
 *  (qB, qC, qA). */
export const seriesLabel = (place: DataPlace, block: Block | undefined) =>
  (block ? blockLetters(block) : [0])
    .map((l) => `q${LETTERS[seriesOf(place, l)] ?? '?'}`)
    .join(', ');

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
    const to = plan.slots[slot]?.unit;
    if (v === undefined) return v;
    if (s?.unit === '°F' && to === '°C') return Math.round(((v - 32) * 5) / 9);
    if (s?.unit === 'in' && to === 'cm') return Math.round(v * 254) / 100;
    return v;
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

/** A category value's place in its list (0-based), by id, name or number; -1: none. */
function categoryIndex(s: ValueSlot, v: Value): number {
  if (typeof v === 'number') return Math.min(s.categories.length, Math.max(1, Math.round(v))) - 1;
  if (typeof v !== 'string') return -1;
  const i = s.categories.findIndex((x) => x.id === v);
  return i >= 0 ? i : s.categories.findIndex((x) => x.name.toLowerCase() === v.toLowerCase());
}

/** Two days' values as one (spec 046 US6 Average): numbers averaged; categories by their places in
 *  the list, a half rounded down (the earlier) or up. One missing: the other. */
export function averageValues(s: ValueSlot, a: Value, b: Value, round: 'down' | 'up' = 'down') {
  const none = (v: Value) => v === null || v === undefined || v === '';
  if (none(a)) return b;
  if (none(b)) return a;
  if (s.kind === 'category') {
    const [i, j] = [categoryIndex(s, a), categoryIndex(s, b)];
    if (i < 0 || j < 0) return i < 0 ? b : a;
    const m = (i + j) / 2;
    return s.categories[round === 'up' ? Math.ceil(m) : Math.floor(m)]!.id;
  }
  const [x, y] = [Number(a), Number(b)];
  return Number.isFinite(x) && Number.isFinite(y) ? (x + y) / 2 : Number.isFinite(x) ? a : b;
}

type Shown = { v: Value } | 'filler' | 'designed';
/** A date's value for a quilt value as shown: real (missing: the waiting-days choice) or sample. */
function shownValue(plan: DataPlan, key: string, slot: number): Shown {
  if (plan.show === 'real') {
    const v = plan.entries[key]?.[slot];
    if (v !== null && v !== undefined) return { v };
    if (plan.waiting === 'filler') return 'filler';
    if (plan.waiting === 'designed') return 'designed';
  }
  return { v: sampleValue(plan, key, slot) };
}

/** What a data paint shows now in a placement: a fill, or the paint itself (a placeholder) when
 *  it can't be told. */
export function dataFill(
  plan: DataPlan,
  place: DataPlace | undefined,
  f: Extract<Fill, { data: unknown }>,
): Fill | undefined {
  const day = dayOf(plan, place?.n, f.data);
  if (day === null) return f;
  const designed = f.under ?? f;
  if (day === undefined) return plan.unused === 'filler' ? (plan.filler ?? designed) : designed;
  const slot = seriesOf(place, f.data.slot ?? 0);
  const s = plan.slots[slot];
  if (!s) return f;
  const key = placeDate(plan, day);
  let shown = shownValue(plan, key, slot);
  // Average: 28 February shows the 28th and the 29th as one.
  if (leapOf(plan) === 'average' && key.endsWith('-02-28')) {
    const other = shownValue(plan, `${key.slice(0, 5)}02-29`, slot);
    if (typeof other === 'object')
      shown = {
        v: averageValues(s, typeof shown === 'object' ? shown.v : null, other.v, plan.leapRound),
      };
  }
  if (shown === 'filler') return plan.filler ?? designed;
  if (shown === 'designed') return designed;
  return scaleFill(s, shown.v) ?? designed;
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
  const place = placeOf(plan, slotId);
  const fills: Record<string, Fill> = {};
  for (const [k, f] of Object.entries(c.fills)) {
    const r = 'data' in f ? dataFill(plan, place, f) : f;
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

/** The data blocks a quilt's placements show. */
export const dataBlocks = (q: Quilt): string[] => [
  ...new Set((q.data?.places ?? []).map((p) => p.block)),
];

/** Days a data block's kind holds (a month block's own drawing: 31). */
export const KIND_DAYS: Record<DataKind, number> = { day: 1, week: 7, month: 31 };

/** The block lists' Data block filter (spec 025): data blocks by kind, or the others. */
export const DATA_FILTER = {
  key: 'data' as const,
  label: 'Data block',
  options: [
    { value: 'none', label: 'Not a data block' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ],
};
export const dataKindMatches = (b: Block, picked: readonly string[]) =>
  !picked.length || picked.includes(b.data?.kind ?? 'none');

/** A variant's block id: the data block's id and its days. */
export const variantId = (id: string, days: number) => `${id}-v${days}`;

/** What a type shows for a number of `len` days: its smallest variant with at least that many
 *  days (a block id), else the block itself. */
export function variantFor(b: Block, len: number): string {
  const v = (b.data?.variants ?? [])
    .filter((x) => x.days >= len)
    .sort((x, y) => x.days - y.days)[0];
  return v ? variantId(b.id, v.days) : b.id;
}

/** The variants a kind of data block can add (spec 025). */
export const VARIANT_DAYS: Record<DataKind, readonly (28 | 29 | 30 | 2 | 1)[]> = {
  month: [30, 29, 28, 1],
  week: [2, 1],
  day: [],
};

/** Whether a data block can show a number of `kind`: its own kind, or a single day from a week or
 *  month block's 1-day variant. */
export const takesKind = (b: Block, kind: DataKind) =>
  b.data?.kind === kind || (kind === 'day' && !!b.data?.variants?.some((v) => v.days === 1));

/** A data block's variant as a block of its own, hidden, to place in a quilt: the variant's
 *  drawing and the block's colorings (which hold every variant's fills). */
export function variantBlock(b: Block, v: DataVariant): Block | undefined {
  if (b.kind !== 'seam') return undefined;
  const { source: _s, version: _v, revision: _r, unconnected: _u, data: _d, ...rest } = b;
  void [_s, _v, _r, _u, _d];
  return {
    ...rest,
    id: variantId(b.id, v.days),
    drawing: v.drawing,
    patches: v.patches,
    ...(v.unconnected ? { unconnected: v.unconnected } : {}),
    notecard: {
      ...b.notecard,
      name: `${b.notecard.name} (${v.days === 1 ? '1 day' : `${v.days} days`})`,
      tags: ['system'],
    },
    data: { kind: b.data?.kind ?? 'month', of: b.id, days: v.days },
  };
}

/**
 * Rebuild the hidden variant blocks of the data blocks data quilts use (spec 025): kept in step
 * with their block on every change. Unused ones go (`pruneVariants`, after `applyPicks`).
 */
export function syncVariants(blocks: Draft<Block>[], quilts: readonly Quilt[]) {
  const used = new Set(quilts.flatMap((q) => (q.data?.on ? dataBlocks(q) : [])));
  for (const b of [...blocks]) {
    if (!used.has(b.id) || b.data?.of) continue;
    for (const v of b.data?.variants ?? []) {
      const made = variantBlock(b, v);
      if (!made) continue;
      const i = blocks.findIndex((x) => x.id === made.id);
      if (i < 0) blocks.push(castDraft(made));
      else if (JSON.stringify(blocks[i]) !== JSON.stringify(made)) blocks[i] = castDraft(made);
    }
  }
}

/** Drop hidden variant blocks no quilt space shows. */
export function pruneVariants(blocks: Draft<Block>[], quilts: readonly Quilt[]): Draft<Block>[] {
  const shown = new Set(
    quilts.flatMap((q) => [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...q.layers.flatMap((l) => l.items.map((i) => i.ref)),
    ]),
  );
  return blocks.filter((b) => !b.data?.of || shown.has(b.id));
}

/**
 * Show each placement's block (spec 025 FR-007): the variant for its number's days, keeping the
 * space's turn and flip; a new block gets a coloring that follows the block's first. A space with
 * no placement that shows a data block gives it up.
 */
export function applyPicks(q: Draft<Quilt>, blocks: readonly Block[], newId: () => string) {
  const plan = q.data;
  if (!plan?.on) return;
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const slots = q.layers[0].slots;
  const used = (c: string) =>
    Object.values(slots).some((s) => s.coloring === c) ||
    q.layers.some((l) => l.items.some((i) => i.coloring === c));
  for (const place of plan.places) {
    const info = numberInfo(plan, place.n);
    const type = byId.get(place.block);
    if (!info || !type) continue;
    const id = variantFor(type, info.len);
    const block = byId.get(id);
    const now = slots[place.space];
    if (!block || now?.block === id) continue;
    let coloring: string;
    do coloring = newId();
    while (coloring in q.colorings);
    const base = block.colorings[0]?.id;
    q.colorings[coloring] = { fills: {}, ...(base ? { base } : {}) };
    slots[place.space] = {
      block: id,
      coloring,
      rotation: now?.rotation ?? 0,
      flip: now?.flip ?? false,
    };
    const old = now?.coloring;
    if (old && !used(old)) delete q.colorings[old];
  }
  // ponytail: a space without a placement showing a data block is emptied, even one set before the
  // quilt became a data quilt; Other blocks doesn't offer them, so only placing puts them there.
  const placed = new Set(plan.places.map((p) => p.space));
  for (const [id, s] of Object.entries(slots)) {
    const data = byId.get(s.block)?.data;
    if (placed.has(id) || !data) continue;
    delete slots[id];
    if (!used(s.coloring)) delete q.colorings[s.coloring];
  }
}

// --- Setting a plan up (spec 025 User Stories 2 and 3) ---

const col = (name: string): PlainFill => ({ color: `rrquilts.${name}` });
const ranges = (edges: number[], colors: string[]) =>
  colors.map((c, i) => ({ from: edges[i]!, to: edges[i + 1]!, fill: col(c) }));
const COLD_HOT = [
  'navy',
  'blue',
  'sky',
  'aqua',
  'mint',
  'green',
  'chartreuse',
  'yellow',
  'orange',
  'red',
  'barn-red',
];

/** A value slot from a preset, with suggested ranges or categories (built-in colors). */
export function presetSlot(preset: DataPreset, units: 'in' | 'cm', label?: string): ValueSlot {
  const base = { preset, ranges: [], categories: [] };
  switch (preset) {
    case 'temperature':
      return units === 'cm'
        ? {
            ...base,
            label: label ?? 'High',
            kind: 'number',
            unit: '°C',
            ranges: ranges([-50, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 60], COLD_HOT),
          }
        : {
            ...base,
            label: label ?? 'High',
            kind: 'number',
            unit: '°F',
            ranges: ranges([-60, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 140], COLD_HOT),
          };
    case 'mood':
      return {
        ...base,
        label: label ?? 'Mood',
        kind: 'category',
        categories: [
          ['awful', 'Awful', 'charcoal'],
          ['low', 'Low', 'denim'],
          ['okay', 'Okay', 'sage'],
          ['good', 'Good', 'gold'],
          ['great', 'Great', 'orange'],
        ].map(([id, name, c]) => ({ id: id!, name: name!, fill: col(c!) })),
      };
    case 'daylight':
      return {
        ...base,
        label: label ?? 'Daylight',
        kind: 'number',
        unit: 'h',
        ranges: ranges(
          [0, 9, 10, 11, 12, 13, 14, 15, 24],
          ['navy', 'indigo', 'blue', 'sky', 'butter', 'yellow', 'gold', 'orange'],
        ),
      };
    case 'rainfall':
      return units === 'cm'
        ? {
            ...base,
            label: label ?? 'Rainfall',
            kind: 'number',
            unit: 'cm',
            ranges: ranges(
              [0, 0.03, 0.25, 1.25, 2.5, 50],
              ['cream', 'sky', 'blue', 'indigo', 'navy'],
            ),
          }
        : {
            ...base,
            label: label ?? 'Rainfall',
            kind: 'number',
            unit: 'in',
            ranges: ranges([0, 0.01, 0.1, 0.5, 1, 20], ['cream', 'sky', 'blue', 'indigo', 'navy']),
          };
    default:
      return {
        ...base,
        label: label ?? 'Value',
        kind: 'number',
        ranges: ranges([0, 10, 20, 30], ['cream', 'sage', 'forest']),
      };
  }
}

/** The sample series that suits a preset (the second temperature slot: the daily low). */
export function presetSeries(preset: DataPreset | undefined, nth = 0): string | null {
  if (preset === 'temperature') return nth ? 'low' : 'high';
  return preset === 'mood' || preset === 'daylight' || preset === 'rainfall' ? preset : null;
}

/** A new plan: Months from 1 January of `year`, a daily high temperature, shown with the sample. */
export function newDataPlan(units: 'in' | 'cm', year: number): DataPlan {
  return {
    on: true,
    plan: 'months',
    start: `${year}-01-01`,
    slots: [presetSlot('temperature', units)],
    places: [],
    unused: 'filler',
    waiting: 'designed',
    filler: col('black'),
    show: 'simulation',
    sim: { source: 'builtin', set: 'sample', series: ['high'] },
    entries: {},
  };
}

/** Placements whose number the plan still has and whose block takes its kind (`blocks`: known
 *  blocks; unknown ones are kept and reported as missing). `lost`: how many went. */
export function fitPlaces(
  plan: DataPlan,
  blocks?: ReadonlyMap<string, Block>,
): { plan: DataPlan; lost: number } {
  const places = plan.places.filter((p) => {
    const kind = numberInfo(plan, p.n)?.kind;
    const b = blocks?.get(p.block);
    return !!kind && (!b || takesKind(b, kind));
  });
  return places.length === plan.places.length
    ? { plan, lost: 0 }
    : { plan: { ...plan, places }, lost: plan.places.length - places.length };
}

/** The plan switched to Months, Weeks or Days: placements on numbers it no longer has, or whose
 *  block can't show their new number's kind (a week block in a month), go. */
export function replan(
  plan: DataPlan,
  to: DataPlan['plan'],
  blocks: ReadonlyMap<string, Block>,
): { plan: DataPlan; lost: number } {
  const start = to === 'months' ? `${plan.start.slice(0, 8)}01` : plan.start;
  return fitPlaces({ ...plan, plan: to, start }, blocks);
}

/** The plan with its numbers changed (the Leap day setting): placements follow their number's
 *  label (Wk 3, Mar 1); ones whose label is gone (Feb 29 ignored) or whose block can't show the
 *  number's kind go. */
export function relabel(
  before: DataPlan,
  after: DataPlan,
  blocks?: ReadonlyMap<string, Block>,
): { plan: DataPlan; lost: number } {
  const at = new Map(dataNumbers(after).map((x, i) => [x.label, i + 1]));
  const places = before.places.flatMap((p) => {
    const n = at.get(numberName(before, p.n));
    return n ? [{ ...p, n }] : [];
  });
  const out = fitPlaces({ ...after, places }, blocks);
  return { plan: out.plan, lost: out.lost + before.places.length - places.length };
}

/** The single day moved to the start (`on`) or back to the end (spec 046 US5): weeks keep their
 *  labels (their numbers shift by one) and the single day's placements move with it. */
export function setLead(plan: DataPlan, on: boolean): DataPlan {
  if (!canLead(plan) || !!plan.lead === on) return plan;
  const n = numberCount(plan); // 53 either way
  const places = plan.places.map((p) => {
    const single = on ? p.n === n : p.n === 1;
    return { ...p, n: single ? (on ? 1 : n) : on ? p.n + 1 : p.n - 1 };
  });
  const { lead: _l, ...rest } = plan;
  void _l;
  return { ...rest, ...(on ? { lead: true } : {}), places };
}

/** The brush (spec 046): the highlighted number, the picked data block and the kind of number it
 *  was picked for, and its series map (by the block's letter). */
export interface DataBrush {
  n: number;
  block: Block;
  kind: DataKind;
  series?: readonly (number | null)[] | undefined;
}

export type TapResult =
  | { error: string }
  | {
      plan: DataPlan;
      /** The highlight after: the next number, or the one taken back. */
      next: number;
      /** Ask first; the plan is what Yes does. */
      ask?: string;
    };

const sameSeries = (a?: readonly (number | null)[], b?: readonly (number | null)[]) =>
  JSON.stringify(cleanSeries(a) ?? null) === JSON.stringify(cleanSeries(b) ?? null);

/**
 * A tap on a block space with the brush (spec 046 US1): an empty space takes the brush; a placed
 * one changes what differs from it, or (nothing differs) gives its placement up. A single-day
 * brush on the first week, or (single day first) on the last week, moves the single day (US5); a
 * week brush on a single day first moves it back to the end.
 */
export function dataTap(plan: DataPlan, space: string, brush: DataBrush): TapResult {
  let p = plan;
  const k = brush.n;
  let ask: string | undefined;
  const count = numberCount(p);
  const info = numberInfo(p, k);
  if (!info) return { error: 'Pick a number in the list first.' };
  if (brush.kind !== info.kind && canLead(p)) {
    if (brush.kind === 'day' && !p.lead && k === 1) {
      const moving = placesOf(p, 1).filter((x) => x.space !== space).length;
      p = setLead(p, true);
      if (moving)
        ask = `Start with ${numberInfo(p, 1)!.label} as a single day? Weeks then start a day later, and the ${moving > 1 ? `${moving} blocks` : 'block'} on Wk 1 stay${moving > 1 ? '' : 's'} on Wk 1.`;
    } else if (brush.kind === 'day' && p.lead && k === count) {
      p = setLead(p, false);
      ask = `Make ${numberInfo(plan, 1)!.label} part of Wk 1 again and the last day (${numberInfo(p, count)!.label}) a single day?`;
    } else if (brush.kind === 'week' && p.lead && k === 1) p = setLead(p, false);
  }
  const at = numberInfo(p, k)!;
  if (!takesKind(brush.block, at.kind))
    return {
      error: `${brush.block.notecard.name} can’t show ${at.label}: it takes a ${at.kind} block${at.kind === 'day' ? ' (or a week or month block with a 1-day variant)' : ''}.`,
    };
  const unmapped = blockLetters(brush.block).filter((l) => {
    const q = brush.series?.[l] ?? l;
    return q < 0 || q >= p.slots.length;
  });
  if (unmapped.length)
    return {
      error: `Pick which of this quilt’s values ${brush.block.notecard.name}’s ${unmapped.map((l) => LETTERS[l]).join(', ')} read${unmapped.length > 1 ? '' : 's'}.`,
    };
  const series = cleanSeries(brush.series);
  const cur = placeOf(p, space);
  if (cur && cur.n === k && cur.block === brush.block.id && sameSeries(cur.series, series)) {
    let out = takeBack(p, space);
    // The single day's last block taken off the start: the single day goes back to the end.
    if (out.lead && k === 1 && !placesOf(out, 1).length) out = setLead(out, false);
    return { plan: out, next: k };
  }
  const place: DataPlace = { space, n: k, block: brush.block.id, ...(series ? { series } : {}) };
  const places = cur ? p.places.map((x) => (x.space === space ? place : x)) : [...p.places, place];
  const next = cur && cur.n === k ? k : Math.min(k + 1, numberCount(p));
  return { plan: { ...p, places }, next, ...(ask ? { ask } : {}) };
}

/** Take a space's placement off. */
export const takeBack = (plan: DataPlan, space: string): DataPlan => ({
  ...plan,
  places: plan.places.filter((p) => p.space !== space),
});

/** Put spaces (in the order given, placed ones skipped) on the numbers without a placement, from
 *  the first, each with the block `typeOf` gives for its kind (numbers without one skipped). */
export function fillNumbers(
  plan: DataPlan,
  ids: readonly string[],
  typeOf: (kind: DataKind) => string | undefined,
): DataPlan {
  const placed = new Set(plan.places.map((p) => p.space));
  const have = new Set(plan.places.map((p) => p.n));
  const free = ids.filter((id) => !placed.has(id));
  const places = [...plan.places];
  dataNumbers(plan).forEach((num, i) => {
    const block = typeOf(num.kind);
    if (have.has(i + 1) || !block || !free.length) return;
    places.push({ space: free.shift()!, n: i + 1, block });
  });
  return { ...plan, places };
}

/** A number's label: its month (Jan), its week (Wk 1), or its day's date (Jan 2; a Weeks plan's
 *  left-over days too, Dec 30–31 for two). */
export const numberName = (plan: DataPlan, k: number) => numberInfo(plan, k)?.label ?? '';

/** What the tab reports (FR-004 and the edge cases): numbers not placed, pools with no block that
 *  fits, spaces with day places but no number, days without a place. */
export function dataReport(q: Quilt, blocks: readonly Block[]): string[] {
  const plan = q.data;
  if (!plan) return [];
  const out: string[] = [];
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const count = numberCount(plan);
  const have = new Set(plan.places.map((p) => p.n));
  const empty = Array.from({ length: count }, (_, i) => i + 1).filter((k) => !have.has(k));
  if (empty.length && empty.length < count)
    out.push(
      `${empty.length} number${empty.length > 1 ? 's' : ''} not placed yet: ${empty
        .slice(0, 6)
        .map((k) => numberLabel(plan, k))
        .join(', ')}${empty.length > 6 ? '…' : ''}.`,
    );
  const missing = new Set(plan.places.map((p) => p.block).filter((id) => !byId.has(id)));
  if (missing.size)
    out.push(
      `${missing.size} block type${missing.size > 1 ? 's are' : ' is'} missing: ${[...missing].join(', ')}.`,
    );
  const days = new Set<number>();
  let unnumbered = 0;
  for (const [slotId, s] of Object.entries(q.layers[0].slots)) {
    const fills = resolveColoring(q.colorings[s.coloring], byId.get(s.block))?.fills ?? {};
    const k = numberOf(plan, slotId);
    let places = false;
    for (const f of Object.values(fills)) {
      if (!('data' in f)) continue;
      places = true;
      const d = dayOf(plan, k, f.data);
      if (typeof d === 'number') days.add(d);
    }
    if (places && !k) unnumbered++;
  }
  if (unnumbered)
    out.push(`${unnumbered} space${unnumbered > 1 ? 's have' : ' has'} day places but no number.`);
  const n = placeDays(plan).length;
  const without = Array.from({ length: n }, (_, i) => i + 1).filter((d) => !days.has(d));
  if (days.size && without.length)
    out.push(
      `${without.length} day${without.length > 1 ? 's have' : ' has'} no place: ${without
        .slice(0, 4)
        .map((d) => placeDate(plan, d))
        .join(', ')}${without.length > 4 ? '…' : ''}.`,
    );
  return out;
}

/** A slot's scale entries in order, each with its text (`60 to 70 °F`, `Good`). */
/** Ranges with one boundary moved: range `j`'s `from` or `to` becomes `v`. Ranges stay joined and
 *  each keeps at least `gap` between its start and end, so a big move pushes the ranges beyond it
 *  along (and the moved range's other end too). */
export function moveBound<R extends { from: number; to: number }>(
  ranges: readonly R[],
  j: number,
  side: 'from' | 'to',
  v: number,
  gap = 1,
): R[] {
  const b = [...ranges.map((r) => r.from), ranges.at(-1)!.to];
  const at = side === 'from' ? j : j + 1;
  b[at] = v;
  for (let k = at + 1; k < b.length; k++) b[k] = Math.max(b[k]!, b[k - 1]! + gap);
  for (let k = at - 1; k >= 0; k--) b[k] = Math.min(b[k]!, b[k + 1]! - gap);
  return ranges.map((r, k) => ({ ...r, from: b[k]!, to: b[k + 1]! }));
}

export function scaleEntries(s: ValueSlot): { fill: PlainFill; text: string; most?: number }[] {
  const u = s.unit ? ` ${s.unit}` : '';
  const most = (x: { most?: number }) => (x.most !== undefined ? { most: x.most } : {});
  const n = s.ranges.length;
  // The end ranges hold everything past them (values outside go to the nearest).
  const text = (r: ValueSlot['ranges'][number], i: number) =>
    n > 1 && i === 0
      ? `under ${r.to}${u}`
      : n > 1 && i === n - 1
        ? `${r.from}${u} and up`
        : n === 1
          ? 'all values'
          : `${r.from} to ${r.to}${u}`;
  return s.kind === 'number'
    ? s.ranges.map((r, i) => ({ fill: r.fill, text: text(r, i), ...most(r) }))
    : s.categories.map((c) => ({ fill: c.fill, text: c.name, ...most(c) }));
}

/** How many days of the period fall in each of a slot's scale entries in the sample data. */
export function sampleCounts(plan: DataPlan, slot: number): number[] {
  const s = plan.slots[slot];
  if (!s) return [];
  const entries = scaleEntries(s);
  const counts = entries.map(() => 0);
  const n = periodLength(plan.start);
  for (let d = 1; d <= n; d++) {
    const f = scaleFill(s, sampleValue(plan, dayDate(plan.start, d), slot));
    const i = f ? entries.findIndex((e) => e.fill === f) : -1;
    if (i >= 0) counts[i]!++;
  }
  return counts;
}

/** Same as `numberName` (the list and the quilt show one label). */
export const numberLabel = (plan: DataPlan, k: number) => numberName(plan, k);
