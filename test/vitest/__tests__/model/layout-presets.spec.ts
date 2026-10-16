import { describe, expect, it } from 'vitest';
import { flattenLoop, pathToSegs, pointInPolygon, type Pt } from '@/model/geometry/path';
import type { Generated, Slot } from '@/model/layout/slots';
import { rectPath } from '@/model/layout/slots';
import { ensurePlainBlock } from '@/model/plain';
import { quiltPieces, templates } from '@/model/print/pieces';
import { drawQuilt } from '@/render/draw';
import { hitTest } from '@/render/hit';
import { fixture } from './helpers';
import { presets } from './layout-presets';
import { quiltWith, slotArea } from './layout-helpers';

// happy-dom has no Path2D; drawing only needs something to hand the context.
globalThis.Path2D ??= class {
  moveTo() {}
  lineTo() {}
  arc() {}
  bezierCurveTo() {}
  closePath() {}
  addPath() {}
} as unknown as typeof Path2D;

const poly = (s: Slot): Pt[] => flattenLoop(pathToSegs(s.outline, [1, 1]), 1e-3);
const generated = (slots: Slot[], b: [number, number, number, number]): Generated => ({
  slots,
  center: b,
  bounds: b,
  unsupported: [],
  edge: rectPath(b[0], b[1], b[2] - b[0], b[3] - b[1]),
  trim: false,
});
const boxOf = (slots: Slot[]): [number, number, number, number] => {
  const pts = slots.flatMap(poly);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

describe('every planned layout is an engine preset (SC-004)', () => {
  for (const p of presets()) {
    describe(p.name, () => {
      const box = p.clip ?? boxOf(p.slots);
      const polys = p.slots.map(poly);

      it('has spaces with unique, position-based ids', () => {
        expect(p.slots.length).toBeGreaterThan(5);
        expect(new Set(p.slots.map((s) => s.id)).size).toBe(p.slots.length);
      });

      it('covers the quilt without gaps or overlaps', () => {
        const [x0, y0, x1, y1] = box;
        const n = 37;
        for (let a = 0; a < n; a++)
          for (let b = 0; b < n; b++) {
            const pt: Pt = [x0 + ((a + 0.5) / n) * (x1 - x0), y0 + ((b + 0.5) / n) * (y1 - y0)];
            const inside = polys.filter((q) => pointInPolygon(pt, q)).length;
            // Trimmed layouts fill the rectangle; a shaped edge leaves gaps outside the shape.
            if (p.clip) expect(inside, pt.join()).toBe(1);
            else expect(inside, pt.join()).toBeLessThanOrEqual(1);
          }
        if (p.clip) {
          const area = p.slots.reduce((s, x) => s + slotArea(x), 0);
          expect(area).toBeCloseTo((x1 - x0) * (y1 - y0), 1);
        }
      });

      it('hit-tests each space at a point inside it', () => {
        const g = generated(p.slots, box);
        const q = quiltWith(
          {
            style: 'straight-set',
            cols: 1,
            rows: 1,
            block: [1, 1],
            sash: [0, 0],
            sashBorder: false,
          },
          [],
        );
        for (const [i, s] of p.slots.entries()) {
          const pts = polys[i]!;
          const c = pts.reduce<Pt>(
            (a, x) => [a[0] + x[0] / pts.length, a[1] + x[1] / pts.length],
            [0, 0],
          );
          if (!pointInPolygon(c, pts)) continue; // concave (clamshell, spool): centroid may fall out
          expect(hitTest(new Map(), q, g, c)?.slotId).toBe(s.id);
        }
      });

      it('draws and prints', () => {
        const calls: string[] = [];
        const ctx = new Proxy(
          {},
          {
            get: (_t, k) =>
              k === 'measureText' ? () => ({ width: 0 }) : () => calls.push(String(k)),
            set: () => true,
          },
        ) as unknown as CanvasRenderingContext2D;
        const doc = ensurePlainBlock(fixture());
        const q = quiltWith(
          {
            style: 'straight-set',
            cols: 1,
            rows: 1,
            block: [1, 1],
            sash: [0, 0],
            sashBorder: false,
          },
          [],
        );
        drawQuilt(ctx, doc, q, generated(p.slots, box), {
          dpr: 1,
          view: { scale: 1, tx: 0, ty: 0 },
          outlines: true,
          dark: false,
        });
        expect(calls.filter((c) => c === 'fill').length).toBeGreaterThanOrEqual(p.slots.length);
        // As plain pieces they print as templates (arcs kept as curves).
        for (const s of p.slots)
          q.layers[0].slots[s.id] = { block: 'plain', coloring: 'k', rotation: 0, flip: false };
        q.colorings = { k: { fills: {} } };
        const pieces = quiltPieces(doc, q, undefined, p.slots);
        expect(pieces).toHaveLength(p.slots.length);
        const curved = p.slots.some((s) => s.outline.some((c) => c[0] === 'A'));
        expect(pieces.some((x) => x.curved)).toBe(curved);
        expect(templates(pieces).length).toBeGreaterThan(0);
      });
    });
  }
});
