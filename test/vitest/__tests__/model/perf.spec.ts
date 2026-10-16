import { describe, expect, it } from 'vitest';
import { onPointDefaults, parseProject, serializeProject, sha256Hex } from '@/model/io';
import { generateSlots } from '@/model/layout/slots';
import type { RrqDoc } from '@/model/schema/project';
import { fixture } from './helpers';

// SC-005: 10 quilts, 100 blocks, 50 fabric images (~300 KB each) open in under 3 s.
describe('performance', () => {
  it('parses a large project quickly', async () => {
    const base = fixture() as RrqDoc;
    const bytes = new Uint8Array(300_000).map((_, i) => (i * 31) % 251);
    const b64 = Buffer.from(bytes).toString('base64');
    const sha256 = await sha256Hex(bytes);
    const fabric = base.project.palette.fabrics[0]!;
    base.project.palette.fabrics = Array.from({ length: 50 }, (_, i) => ({
      ...fabric,
      id: `fab${i}`,
      image: { data: `data:image/png;base64,${b64}`, type: 'image/png', sha256 },
    }));
    const seam = base.project.blocks[0]!;
    base.project.blocks = Array.from({ length: 100 }, (_, i) => ({ ...seam, id: `blk${i}` }));
    const quilt = base.project.quilts[0]!;
    base.project.quilts = Array.from({ length: 10 }, (_, i) => ({ ...quilt, id: `q${i}` }));
    const text = serializeProject(base);

    const start = performance.now();
    const r = await parseProject(text);
    const ms = performance.now() - start;
    expect(r.ok).toBe(true);
    expect(ms).toBeLessThan(3000);
  });

  it('generates a 100 x 100 On-Point layout quickly', () => {
    const layout = { ...onPointDefaults(1), cols: 100, rows: 100, sash: 1 };
    const start = performance.now();
    const g = generateSlots(layout, []);
    const ms = performance.now() - start;
    console.log(`on-point 100x100: ${Math.round(ms)} ms, ${g.slots.length} slots`);
    expect(g.slots.length).toBeGreaterThan(20000);
    expect(ms).toBeLessThan(3000);
  });
});
