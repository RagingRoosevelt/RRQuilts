// Data paints' overlay (spec 025): each numbered piece's label, and an order line through the
// pieces of each group (a value slot) in number order, drawn in the current transform.
import { resolveColoring } from '@/model/coloring';
import { paintLabel, pieceSpots } from '@/model/data-paint';
import { unitLabel } from '@/model/data-quilt';
import type { Pt } from '@/model/geometry/path';
import type { Generated } from '@/model/layout/slots';
import { PLAIN_BLOCK } from '@/model/plain';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { placementMatrix } from './placement';

export interface DataMark {
  p: Pt;
  label: string;
  /** Pieces joined by one line (a value slot; year days apart). */
  group: string;
  /** Place along the line. */
  order: number;
  /** Label moved down this many CSS pixels (so it clears another at the same spot). */
  dy?: number;
}

const LINE = ['#1565c0', '#e65100', '#2e7d32', '#6a1b9a'];

/** `px` = one CSS pixel in the current units. */
export function drawDataOverlay(
  ctx: CanvasRenderingContext2D,
  marks: readonly DataMark[],
  px: number,
  o: { line: boolean; dark: boolean },
) {
  if (!marks.length) return;
  ctx.save();
  if (o.line) {
    const groups = new Map<string, DataMark[]>();
    for (const m of marks) groups.set(m.group, [...(groups.get(m.group) ?? []), m]);
    [...groups.values()].forEach((g, i) => {
      g.sort((a, b) => a.order - b.order);
      ctx.beginPath();
      g.forEach((m, j) => (j ? ctx.lineTo(...m.p) : ctx.moveTo(...m.p)));
      ctx.strokeStyle = LINE[i % LINE.length]!;
      ctx.lineWidth = 2 * px;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      // The start: a dot.
      ctx.beginPath();
      ctx.arc(...g[0]!.p, 4 * px, 0, 2 * Math.PI);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    });
  }
  // Labels in device pixels (tiny fonts scaled up draw unevenly).
  const t = ctx.getTransform();
  const dev = Math.hypot(t.a, t.b) * px; // device pixels per CSS pixel
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `600 ${13 * dev}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3 * dev;
  ctx.strokeStyle = o.dark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  ctx.fillStyle = o.dark ? '#fff' : '#111';
  for (const m of marks) {
    const q = t.transformPoint({ x: m.p[0], y: m.p[1] });
    const y = q.y + (m.dy ?? 0) * dev;
    ctx.strokeText(m.label, q.x, y);
    ctx.fillText(m.label, q.x, y);
  }
  ctx.restore();
}

/** A data quilt's marks (spec 025): unit names on numbered spaces, year days on pieces. */
export function quiltDataMarks(doc: RrqDoc, quilt: Quilt, generated: Generated): DataMark[] {
  const plan = quilt.data;
  if (!plan) return [];
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  const marks: DataMark[] = [];
  for (const slot of generated.slots) {
    const [a, b, c, d, e, f] = slot.transform;
    const center: Pt = [(a + c) / 2 + e, (b + d) / 2 + f];
    const u = plan.units[slot.id];
    if (u) marks.push({ p: center, label: unitLabel(plan, u), group: 'units', order: u });
    const content = quilt.layers[0].slots[slot.id];
    const block = content && blocks.get(content.block);
    if (!content || !block) continue;
    const fills = resolveColoring(quilt.colorings[content.coloring], block)?.fills ?? {};
    let m: ReturnType<typeof placementMatrix> | undefined;
    for (const [id, fl] of Object.entries(fills)) {
      if (!('data' in fl) || !fl.data.year) continue;
      let p = center;
      let dy = u ? 16 : 0; // under the space's unit name
      if (block.id !== PLAIN_BLOCK) {
        dy = 0;
        const s = pieceSpots(block).get(id);
        if (!s) continue;
        m ??= placementMatrix(slot, content, block);
        const [x, y] = [s[0] * block.size[0], s[1] * block.size[1]];
        p = [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
      }
      marks.push({
        p,
        label: paintLabel(fl.data),
        group: `y${fl.data.slot ?? 0}`,
        order: fl.data.n,
        ...(dy ? { dy } : {}),
      });
    }
  }
  return marks;
}
