import { describe, expect, it } from 'vitest';
import { parseProject, serializeProject } from '@/model/io';
import type { QuiltTarget } from '@/model/schema/quilt';
import {
  placeTarget,
  resolveTarget,
  shapeSize,
  startChoice,
  type TargetInput,
} from '@/model/targets';
import { convertUnits } from '@/model/units';
import { fixture } from './helpers';

const us = (choice: string | null, more: Partial<TargetInput> = {}): TargetInput => ({
  ...startChoice(choice, { choice: null, region: 'us' }, 'in'),
  ...more,
});

describe('target sizes (spec 006 FR-001a)', () => {
  it('named sizes, beds with drop, pillow tuck, and tall', () => {
    expect(shapeSize(resolveTarget(us('Throw'), 'in')!)).toEqual([50, 65]);
    const queen = resolveTarget(us('Queen'), 'in')!; // 14″ drop by default
    expect(shapeSize(queen)).toEqual([88, 94]);
    expect(queen.core).toEqual([14, 0, 60, 80]);
    const twin = resolveTarget(us('Twin', { tall: true, tuck: 12 }), 'in')!;
    expect(shapeSize(twin)).toEqual([39 + 24, 80 + 12 + 12]);
    expect(twin.core).toEqual([12, 12, 39, 80]);
    expect(twin.label).toBe('Twin (XL) with drop and pillow tuck');
  });

  it('European sizes, in cm or converted to inches', () => {
    const eu = startChoice('Single', { choice: null, region: 'eu' }, 'cm');
    expect(shapeSize(resolveTarget({ ...eu, drop: 0, tall: true }, 'cm')!)).toEqual([90, 210]);
    const inch = startChoice('Single', { choice: null, region: 'eu' }, 'in');
    expect(shapeSize(resolveTarget({ ...inch, drop: 0 }, 'in')!)).toEqual([35.5, 78.5]);
  });

  it('custom and garments; none and unknown names resolve to nothing', () => {
    expect(shapeSize(resolveTarget(us('custom', { custom: [40, 30] }), 'in')!)).toEqual([40, 30]);
    const top = resolveTarget(us('top'), 'in')!;
    expect(top.label).toBe("Top front, women's M");
    expect(top.outline.length).toBeGreaterThan(10);
    expect(resolveTarget(us(null), 'in')).toBeNull();
    expect(resolveTarget({ choice: 'Hammock', region: 'us' }, 'in')).toBeNull();
  });

  it('centers on the quilt', () => {
    const p = placeTarget(resolveTarget(us('Throw'), 'in')!, [0, 0, 40, 40]);
    expect(p.box).toEqual([-5, -12.5, 45, 52.5]);
  });

  it('is saved with the quilt, survives a round trip, and converts with the units', async () => {
    const shape = resolveTarget(us('Queen'), 'in')!;
    const target: QuiltTarget = { visible: true, input: us('Queen'), ...shape };
    const doc = structuredClone(fixture());
    doc.project.quilts[0]!.target = target;
    const back = await parseProject(serializeProject(doc));
    expect(back.ok && back.doc.project.quilts[0]!.target).toEqual(target);
    const cm = convertUnits(doc, 'cm').project.quilts[0]!.target!;
    expect(shapeSize(cm)[0]).toBeCloseTo(88 * 2.54, 6);
    expect(cm.input.drop).toBeCloseTo(14 * 2.54, 6);
    expect(cm.core![2]).toBeCloseTo(60 * 2.54, 6);
  });
});
