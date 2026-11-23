// The temperature quilts demo (owner, 2026-11-23: "let's also have a demo of temperature quilts"):
// public/demo/temperature.rrq, opened by /?open_demo=temperature.rrq. Three data quilts over 2027 with
// a full year of real entries from the built-in sample (made-up, shaped on a temperate climate), the
// first weeks cut and sewn: 365 days of highs (a Day Square each), a month per row (Month Strip),
// and highs and lows week by week (Week Strips side by side). TEMPERATURE_DEMO=<file> writes it.
import { writeFileSync } from 'node:fs';
import { produce, type Draft } from 'immer';
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import { DEFAULT_LICENSE } from '@/model/credits';
import {
  dataReport,
  fillNumbers,
  newDataPlan,
  numberCount,
  placeDays,
  presetSlot,
} from '@/model/data-quilt';
import { sampleSeries } from '@/model/data-samples';
import { parseProject, serializeProject } from '@/model/io';
import { generateFor } from '@/model/layout/slots';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';
import type { DataPlan } from '@/model/schema/data-quilt';
import type { RrqDoc } from '@/model/schema/project';
import type { Layout, Quilt } from '@/model/schema/quilt';

const out = process.env.TEMPERATURE_DEMO;
const YEAR = 2027;
const AUTHOR = 'RRQuilts contributors';

const items = builtinItems();
const block = (name: string) => items.blocks.find((b) => b.notecard.name === name)!.id;
const lib = {
  block: (x: string) => items.blocks.find((b) => b.id === x),
  color: (x: string) => items.colors.find((c) => c.id === x),
};
const series = (id: string) => sampleSeries().find((s) => s.id === id)!.values;

/** A full year of entries (highs, and lows when asked), and the first `cut` days cut, the first
 *  `sewn` sewn, as a quilter part way through. */
function real(plan: DataPlan, withLow: boolean, cut: number, sewn: number): DataPlan {
  const days = placeDays(plan);
  const [high, low] = [series('high'), series('low')];
  const entries = Object.fromEntries(
    days.map((d, i) => [d, withLow ? [high[i]!, low[i]!] : [high[i]!]]),
  );
  const made = Object.fromEntries(
    days
      .slice(0, cut)
      .map((d, i) => [d, i < sewn ? { cut: d, assembled: d } : { cut: d }] as const),
  );
  return { ...plan, show: 'real', entries, made };
}

/** Spaces in reading order. */
const spacesOf = (q: Quilt) =>
  generateFor(q)
    .slots.filter((s) => s.kind === 'block')
    .map((s) => s.id);

function quilt(name: string, layout: Layout, notes: string, plan: (q: Quilt) => DataPlan): Quilt {
  const q = {
    ...createQuilt(name, layout, [{ style: 'long-horizontal', sides: [2, 2, 2, 2] }]),
    author: AUTHOR,
    license: DEFAULT_LICENSE,
  } as Quilt;
  return { ...q, notecard: { ...q.notecard, notes }, data: plan(q) };
}

function demo(): RrqDoc {
  const days = quilt(
    '365 days of highs',
    { style: 'straight-set', cols: 25, rows: 15, block: [2, 2], sash: [0, 0], sashBorder: false },
    'A Day Square for each day of 2027, colored by its high. The ten squares after December 31 are filler.',
    (q) => {
      const plan = fillNumbers({ ...newDataPlan('in', YEAR), plan: 'days' }, spacesOf(q), () =>
        block('Day Square'),
      );
      return real(plan, false, 75, 59);
    },
  );
  const months = quilt(
    'A month per row',
    {
      style: 'straight-set',
      cols: 1,
      rows: 12,
      block: [15.5, 3],
      sash: [0.5, 0.5],
      sashBorder: true,
    },
    'Each row a month of daily highs (Month Strip), a strip per day. January and February are sewn.',
    (q) => {
      const plan = fillNumbers(newDataPlan('in', YEAR), spacesOf(q), () => block('Month Strip'));
      return {
        ...real(plan, false, 75, 59),
        blocksMade: { 1: `${YEAR}-02-01`, 2: `${YEAR}-03-01` },
      };
    },
  );
  const weeks = quilt(
    'Highs and lows, week by week',
    { style: 'straight-set', cols: 8, rows: 14, block: [4, 4], sash: [0, 0], sashBorder: false },
    'Four weeks to a row, each week twice: its highs, then its lows (Week Strip). December 31 is the last Day Square.',
    (q) => {
      const base: DataPlan = {
        ...newDataPlan('in', YEAR),
        plan: 'weeks',
        lead: false,
        slots: [presetSlot('temperature', 'in'), presetSlot('temperature', 'in', 'Low')],
        sim: { source: 'builtin', set: 'sample', series: ['high', 'low'] },
      };
      const spaces = spacesOf(q);
      const week = block('Week Strip');
      const places: DataPlan['places'] = [];
      for (let w = 1; w <= 52; w++) {
        places.push({ space: spaces[2 * w - 2]!, n: w, block: week });
        places.push({ space: spaces[2 * w - 1]!, n: w, block: week, series: [1] });
      }
      places.push({ space: spaces[104]!, n: 53, block: block('Day Square') });
      return real({ ...base, places }, true, 70, 56);
    },
  );
  return produce(createProject('Temperature quilts demo', 'in', 'demo'), (d: Draft<RrqDoc>) => {
    d.project.license = DEFAULT_LICENSE;
    d.project.quilts.push(days, months, weeks);
    syncDraft(d, lib);
  });
}

describe('temperature quilts demo', () => {
  it('three data quilts, every day placed and entered; the file opens clean', async () => {
    const doc = demo();
    const blocks = [...doc.project.blocks, ...items.blocks];
    for (const q of doc.project.quilts) {
      const plan = q.data!;
      expect(Object.keys(plan.entries), q.notecard.name).toHaveLength(365);
      expect(new Set(plan.places.map((p) => p.n)).size, q.notecard.name).toBe(numberCount(plan));
      expect(dataReport(q, blocks), q.notecard.name).toEqual([]);
    }
    const text = serializeProject(doc);
    const back = await parseProject(text);
    if (!back.ok) throw new Error(back.error);
    expect(back.report).toEqual([]);
    if (out) writeFileSync(out, text);
  });
});
