// Data quilts (spec 025): which day a data paint stands for, that day's value, and the fill its
// slot's scale gives it. `slotColoring` is a block space's coloring with every data paint replaced
// by what it shows now, so drawing, printing, yardage and colorways read ordinary fills.
import { castDraft, type Draft } from 'immer';
import { resolveColoring } from './coloring';
import { sampleSeries } from './data-samples';
import type { Block, DataKind, DataVariant } from './schema/block';
import type { ColoringBody, DataPaint, Fill, PlainFill } from './schema/coloring';
import type { DataPlan, DataPreset, ValueSlot } from './schema/data-quilt';
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

/** How many numbers the plan's list holds: 12 months; 52 weeks then the days they leave over;
 *  or a number per day. */
export function numberCount(plan: DataPlan) {
  const n = periodLength(plan.start);
  return plan.plan === 'months' ? 12 : plan.plan === 'weeks' ? 52 + n - 364 : n;
}

/** Number `k` (1-based): its first period day, how many days it holds, and the kind of data block
 *  it takes. */
export function numberInfo(
  plan: DataPlan,
  k: number,
): { first: number; len: number; kind: DataKind } | undefined {
  if (!Number.isInteger(k) || k < 1 || k > numberCount(plan)) return undefined;
  if (plan.plan === 'months') {
    const s = new Date(parse(plan.start));
    const first =
      Math.round(
        (Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + k - 1, 1) - parse(plan.start)) / DAY,
      ) + 1;
    return { first, len: monthLength(plan.start, k), kind: 'month' };
  }
  if (plan.plan === 'weeks' && k <= 52) return { first: 7 * (k - 1) + 1, len: 7, kind: 'week' };
  return { first: plan.plan === 'weeks' ? 364 + k - 52 : k, len: 1, kind: 'day' };
}

/**
 * The period day (1-based) a paint stands for in a space holding number `k`; `undefined` for a
 * place past the number's days (unused), `null` for a space with no number.
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

const numbers = new WeakMap<object, Map<string, number>>();
/** The number (1-based) each placed space holds. */
export function numberOf(plan: DataPlan, slotId: string): number | undefined {
  let m = numbers.get(plan.order);
  if (!m) {
    m = new Map();
    plan.order.forEach((id, i) => id && !m!.has(id) && m!.set(id, i + 1));
    numbers.set(plan.order, m);
  }
  return m.get(slotId);
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
  const unit = numberOf(plan, slotId);
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

/** The data blocks (types) a quilt's spaces show. */
export const dataBlocks = (q: Quilt): string[] => [...new Set(Object.values(q.data?.types ?? {}))];

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
export const VARIANT_DAYS: Record<DataKind, readonly (28 | 29 | 30 | 1)[]> = {
  month: [30, 29, 28, 1],
  week: [1],
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
 * Show each placed space's type (spec 025 FR-007): the variant for its number's days, keeping its
 * turn and flip; a new block gets a coloring that follows the block's first. A space whose number
 * was taken back (one by one, Clear, a shorter list) gives its block up and loses its type.
 */
export function applyPicks(q: Draft<Quilt>, blocks: readonly Block[], newId: () => string) {
  const plan = q.data;
  if (!plan?.on) return;
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const slots = q.layers[0].slots;
  const used = (c: string) =>
    Object.values(slots).some((s) => s.coloring === c) ||
    q.layers.some((l) => l.items.some((i) => i.coloring === c));
  plan.order.forEach((slotId, i) => {
    const info = slotId ? numberInfo(plan, i + 1) : undefined;
    const type = slotId ? byId.get(plan.types[slotId] ?? '') : undefined;
    if (!slotId || !info || !type) return;
    const id = variantFor(type, info.len);
    const block = byId.get(id);
    const now = slots[slotId];
    if (!block || now?.block === id) return;
    let coloring: string;
    do coloring = newId();
    while (coloring in q.colorings);
    const base = block.colorings[0]?.id;
    q.colorings[coloring] = { fills: {}, ...(base ? { base } : {}) };
    slots[slotId] = { block: id, coloring, rotation: now?.rotation ?? 0, flip: now?.flip ?? false };
    const old = now?.coloring;
    if (old && !used(old)) delete q.colorings[old];
  });
  // ponytail: an unnumbered space showing a data block is emptied, even one set before the quilt
  // became a data quilt; Other blocks only offers them for numbering, so only numbering puts them
  // there.
  const placed = new Set(plan.order);
  for (const id of Object.keys(plan.types)) if (!placed.has(id)) delete plan.types[id];
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
    order: Array<null>(12).fill(null),
    types: {},
    unused: 'filler',
    waiting: 'designed',
    filler: col('black'),
    show: 'simulation',
    sim: { source: 'builtin', set: 'sample', series: ['high'] },
    entries: {},
  };
}

/** The list sized for the plan and period (numbers past the end dropped, new ones empty). */
export function fitOrder(plan: DataPlan): DataPlan {
  const n = numberCount(plan);
  if (plan.order.length === n) return plan;
  return { ...plan, order: Array.from({ length: n }, (_, i) => plan.order[i] ?? null) };
}

/** The first unplaced number from `from` on, wrapping round (undefined: all placed). */
export function nextFree(plan: DataPlan, from = 1): number | undefined {
  const n = numberCount(plan);
  for (let i = 0; i < n; i++) {
    const k = ((from - 1 + i) % n) + 1;
    if (!plan.order[k - 1]) return k;
  }
  return undefined;
}

/** Place number `k` on a space with data block `type` (a space holds one number: its old one is
 *  freed). */
export function placeNumber(plan: DataPlan, slotId: string, k: number, type: string): DataPlan {
  const order = fitOrder(plan).order.map((id) => (id === slotId ? null : id));
  order[k - 1] = slotId;
  return { ...plan, order, types: { ...plan.types, [slotId]: type } };
}

/** Take a space's number back (the number becomes empty). */
export function takeBack(plan: DataPlan, slotId: string): DataPlan {
  const { [slotId]: _gone, ...types } = plan.types;
  void _gone;
  return { ...plan, order: plan.order.map((id) => (id === slotId ? null : id)), types };
}

/** Put spaces on the empty numbers in the order given (placed spaces kept), until they run out,
 *  each with the type `typeOf` gives for its number's kind (numbers without one are skipped). */
export function fillNumbers(
  plan: DataPlan,
  ids: readonly string[],
  typeOf: (kind: DataKind) => string | undefined,
): DataPlan {
  const out = fitOrder(plan);
  const order = [...out.order];
  const types = { ...out.types };
  const placed = new Set(order);
  const free = ids.filter((id) => !placed.has(id));
  order.forEach((id, i) => {
    const kind = numberInfo(out, i + 1)?.kind;
    const type = kind && typeOf(kind);
    if (id || !type || !free.length) return;
    const space = free.shift()!;
    order[i] = space;
    types[space] = type;
  });
  return { ...out, order, types };
}

/** Move number `from` to position `to` (1-based); the ones between shift, so their labels do. */
export function moveNumber(plan: DataPlan, from: number, to: number): DataPlan {
  const order = [...fitOrder(plan).order];
  const [x] = order.splice(from - 1, 1);
  order.splice(to - 1, 0, x ?? null);
  return { ...plan, order };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (key: string) => {
  const d = new Date(parse(key));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
/** A number's label: its month's name (Jan), its week (Wk 1), or its day's date (Jan 2; a Weeks
 *  plan's left-over days too). */
export function numberLabel(plan: DataPlan, k: number) {
  if (plan.plan === 'months') return numberName(plan, k);
  const info = numberInfo(plan, k);
  return info?.len === 7 ? `Wk ${k}` : numberName(plan, k);
}

/** What a number stands for: its month, its week's first day, or its day. */
export function numberName(plan: DataPlan, k: number) {
  const info = numberInfo(plan, k);
  if (!info) return '';
  if (plan.plan === 'months')
    return MONTHS[(new Date(parse(plan.start)).getUTCMonth() + k - 1) % 12]!;
  const from = short(dayDate(plan.start, info.first));
  return info.len === 7 ? `Week of ${from}` : from;
}

/** What the tab reports (FR-004 and the edge cases): numbers not placed, pools with no block that
 *  fits, spaces with day places but no number, days without a place. */
export function dataReport(q: Quilt, blocks: readonly Block[]): string[] {
  const plan = q.data;
  if (!plan) return [];
  const out: string[] = [];
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const count = numberCount(plan);
  const empty = Array.from({ length: count }, (_, i) => i + 1).filter((k) => !plan.order[k - 1]);
  if (empty.length && empty.length < count)
    out.push(
      `${empty.length} number${empty.length > 1 ? 's' : ''} not placed yet: ${empty
        .slice(0, 6)
        .map((k) => numberLabel(plan, k))
        .join(', ')}${empty.length > 6 ? '…' : ''}.`,
    );
  const missing = new Set(Object.values(plan.types).filter((id) => !byId.has(id)));
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
  const n = periodLength(plan.start);
  const without = Array.from({ length: n }, (_, i) => i + 1).filter((d) => !days.has(d));
  if (days.size && without.length)
    out.push(
      `${without.length} day${without.length > 1 ? 's have' : ' has'} no place: ${without
        .slice(0, 4)
        .map((d) => dayDate(plan.start, d))
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
