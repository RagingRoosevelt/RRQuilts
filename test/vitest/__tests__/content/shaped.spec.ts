// Built-in shaped blocks (spec 026): every piece drawn becomes one patch, colored as drawn.
// SHAPED_RENDER=<dir> also writes each block as <dir>/<name>.svg (SHAPED_ONLY=a,b to pick some).
import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { builtinItems } from '@/content/starter';
import { SHAPED_BLOCKS } from '@/content/shaped';
import { SHAPED_CURVES } from '@/content/shaped-curves';
import { FRACTAL_SHAPED } from '@/content/fractals';
import { pathPolygon } from '@/model/geometry/path';

const items = builtinItems();
const blocks = items.blocks.filter((b) => b.shape);
const rgbOf = new Map(items.colors.map((c) => [c.id, c.rgb]));

describe('built-in shaped blocks', () => {
  it('are all in the library', () => {
    expect(blocks.map((b) => b.notecard.name)).toEqual(
      [...SHAPED_BLOCKS, ...SHAPED_CURVES, ...FRACTAL_SHAPED].map((d) => d.name),
    );
  });

  it.each([...SHAPED_BLOCKS, ...FRACTAL_SHAPED].map((d) => [d.name, d] as const))(
    '%s: one patch per piece, all seams connected, each colored',
    (name, d) => {
      const b = blocks.find((x) => x.notecard.name === name)!;
      expect(b.shape).toBe(d.shape);
      expect(b.unconnected ?? []).toEqual([]);
      expect(b.patches).toHaveLength(d.pieces.length);
      const colored = new Set(
        Object.values(b.colorings[0]!.fills).map((f) => 'color' in f && f.color),
      );
      expect(colored.size).toBeGreaterThan(1);
    },
  );

  it.each(SHAPED_CURVES.map((d) => [d.name, d] as const))(
    '%s: one patch per color point, all seams connected',
    (name, d) => {
      const b = blocks.find((x) => x.notecard.name === name)!;
      expect(b.unconnected ?? []).toEqual([]);
      expect(b.patches).toHaveLength(d.points.length);
    },
  );

  const dir = process.env.SHAPED_RENDER;
  it.skipIf(!dir)('render', () => {
    const only = process.env.SHAPED_ONLY?.split(',');
    for (const b of blocks) {
      if (only && !only.includes(b.notecard.name)) continue;
      const k = 400 / Math.max(...b.size);
      const [w, h] = [b.size[0] * k, b.size[1] * k];
      const fills = b.colorings[0]!.fills;
      const paths = b.patches.map((p) => {
        const f = fills[p.id];
        const rgb = f && 'color' in f ? rgbOf.get(f.color) : undefined;
        const d = pathPolygon(p.path, b.size)
          .map(([x, y], i) => `${i ? 'L' : 'M'}${(x * w).toFixed(2)} ${(y * h).toFixed(2)}`)
          .join('');
        return `<path d="${d}Z" fill="${rgb ? `rgb(${rgb.join(',')})` : '#f0f'}" stroke="#222" stroke-width="1.5"/>`;
      });
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 20}" height="${h + 20}" viewBox="-10 -10 ${w + 20} ${h + 20}"><rect x="-10" y="-10" width="${w + 20}" height="${h + 20}" fill="#fff"/>${paths.join('')}</svg>`;
      writeFileSync(`${dir}/${b.notecard.name.replace(/[^A-Za-z0-9]+/g, '_')}.svg`, svg);
    }
  });
});
