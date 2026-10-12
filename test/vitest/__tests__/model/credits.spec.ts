import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { copyBlock, newBlock } from '@/editor/block-ops';
import { builtinItems } from '@/content/starter';
import {
  ALL_RIGHTS,
  blocksByOthers,
  effectiveLicense,
  licenseName,
  quiltLock,
  requiredLicense,
} from '@/model/credits';
import { createProject } from '@/model/new-project';
import { createQuilt } from '@/model/new-quilt';

describe('credits and licenses', () => {
  it('locks to the strictest license in the chain', () => {
    expect(requiredLicense([{ license: 'CC0-1.0' }, { license: 'CC-BY-4.0' }])).toBeUndefined();
    expect(requiredLicense([{ license: 'CC-BY-SA-4.0', name: 'A' }])).toEqual({
      license: 'CC-BY-SA-4.0',
      because: 'A',
    });
    expect(
      requiredLicense([{ license: 'CC-BY-SA-4.0' }, { license: 'CC-BY-NC-4.0', name: 'B' }]),
    ).toEqual({ license: 'CC-BY-NC-SA-4.0', because: 'B' });
    expect(requiredLicense([{ license: ALL_RIGHTS, name: 'C' }])?.license).toBe(ALL_RIGHTS);
    expect(licenseName('CC-BY-4.0')).toBe('CC BY 4.0');
  });

  it('a quilt is locked by and credits blocks made by others', () => {
    const star = builtinItems().blocks.find((b) => b.id === 'rrquilts.ohio-star')!;
    const jane = { ...copyBlock(star, [], 'Jane'), license: 'CC-BY-SA-4.0' };
    const mine = newBlock('Mine', [10, 10], 'in', 'Sam');
    const quilt = produce(createQuilt('Q', { style: 'one-patch' }, []), (q) => {
      q.layers[0].slots = {
        a: { block: jane.id, coloring: 'k', rotation: 0, flip: false },
        b: { block: mine.id, coloring: 'k', rotation: 0, flip: false },
      } as never;
    });
    const doc = produce(createProject(), (d) => {
      d.project.blocks.push(jane, mine);
      d.project.license = 'CC0-1.0';
    });
    expect(blocksByOthers(doc, quilt, 'Sam').map((u) => u.author)).toEqual(['Jane']);
    expect(quiltLock(doc, quilt, 'Sam')).toEqual({
      license: 'CC-BY-SA-4.0',
      because: 'Ohio Star (2)',
    });
    expect(effectiveLicense(mine, doc)).toBe('CC0-1.0'); // project license is the default
  });
});
