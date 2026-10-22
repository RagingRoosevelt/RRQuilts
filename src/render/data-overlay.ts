// Data paints' overlay (spec 025): each numbered piece's label, and an order line through the
// pieces of each group (a value slot) in number order, drawn in the current transform.
import { numberLabel, numberOf } from '@/model/data-quilt';
import type { Pt } from '@/model/geometry/path';
import type { Generated } from '@/model/layout/slots';
import type { Quilt } from '@/model/schema/quilt';

export interface DataMark {
  p: Pt;
  label: string;
  /** Marks joined by one line (a value slot). */
  group: string;
  /** Place along the line. */
  order: number;
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
    ctx.strokeText(m.label, q.x, q.y);
    ctx.fillText(m.label, q.x, q.y);
  }
  ctx.restore();
}

/** A data quilt's marks (spec 025): each placed space's number, joined in number order. */
export function quiltDataMarks(quilt: Quilt, generated: Generated): DataMark[] {
  const plan = quilt.data;
  if (!plan) return [];
  return generated.slots.flatMap((slot) => {
    const k = numberOf(plan, slot.id);
    if (!k) return [];
    const [a, b, c, d, e, f] = slot.transform;
    return [
      {
        p: [(a + c) / 2 + e, (b + d) / 2 + f] as Pt,
        label: numberLabel(plan, k),
        group: 'n',
        order: k,
      },
    ];
  });
}
