// The temperature quilts demo (owner, 2026-11-23: "let's also have a demo of temperature quilts"):
// public/demo/temperature.rrq, opened by /?open_demo=temperature.rrq. First written by a test, then
// finished by the owner in the app (filler, borders and sashing colored, a fourth quilt; "I meant to
// use that new temp demo"), so the file is the source now and this checks it: three data quilts over
// 2027 with a year of entries from the built-in sample, and month pinwheels on simulated data.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import { dataReport, numberCount } from '@/model/data-quilt';
import { parseProject } from '@/model/io';

describe('temperature quilts demo', () => {
  it('opens clean: four data quilts, three with a year of entries', async () => {
    const back = await parseProject(readFileSync('public/demo/temperature.rrq', 'utf8'));
    if (!back.ok) throw new Error(back.error);
    expect(back.report).toEqual([]);
    const { project } = back.doc;
    expect(project.author).toBe('RRQuilts contributors');
    // Built-in items only: opening it never asks for a library the device lacks.
    expect(project.libraries?.map((l) => l.id)).toEqual(['rrquilts-starter']);
    expect(project.quilts.map((q) => q.notecard.name)).toEqual([
      '365 days of highs',
      'A month per row',
      'Highs and lows, week by week',
      'Month pinwheels on point',
    ]);
    const blocks = [...project.blocks, ...builtinItems().blocks];
    for (const q of project.quilts) {
      const plan = q.data!;
      expect(new Set(plan.places.map((p) => p.n)).size, q.notecard.name).toBe(numberCount(plan));
      expect(dataReport(q, blocks), q.notecard.name).toEqual([]);
    }
    for (const q of project.quilts.slice(0, 3))
      expect(Object.keys(q.data!.entries), q.notecard.name).toHaveLength(365);
  });
});
