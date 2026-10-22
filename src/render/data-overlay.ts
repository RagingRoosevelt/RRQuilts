// Data paints' overlay (spec 025): each numbered piece's label, and an order line through the
// pieces of each group (a value slot) in number order, drawn in the current transform.
import { takesBlock } from '@/editor/scope';
import { resolveColoring } from '@/model/coloring';
import { pieceSpots, readingOrder } from '@/model/data-paint';
import { numberLabel, numberOf } from '@/model/data-quilt';
import type { Pt } from '@/model/geometry/path';
import type { Generated } from '@/model/layout/slots';
import type { RrqDoc } from '@/model/schema/project';
import type { Quilt } from '@/model/schema/quilt';
import { placementMatrix } from './placement';

export interface DataMark {
  p: Pt;
  label: string;
  /** Marks joined by one line (a value slot). */
  group: string;
  /** Place along the line. */
  order: number;
  /** Label moved down this many CSS pixels (two labels at one spot). */
  dy?: number;
  /** A quieter label (smaller, no line). */
  muted?: boolean;
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
    for (const m of marks) if (m.group) groups.set(m.group, [...(groups.get(m.group) ?? []), m]);
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
  const font = ctx.font;
  for (const m of marks) {
    const q = t.transformPoint({ x: m.p[0], y: m.p[1] });
    const y = q.y + (m.dy ?? 0) * dev;
    ctx.font = m.muted ? `500 ${11 * dev}px sans-serif` : font;
    ctx.globalAlpha = m.muted ? 0.75 : 1;
    ctx.strokeText(m.label, q.x, y);
    ctx.fillText(m.label, q.x, y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Block spaces numbered left to right, top to bottom (1-based): the Blocks tab's "Block N". */
export function blockSpaceNumbers(generated: Generated): Map<string, number> {
  const [x0, y0, x1, y1] = generated.bounds;
  const spots = new Map(
    generated.slots
      .filter((s) => s.kind === 'block' && takesBlock(s))
      .map((s): [string, Pt] => {
        const [a, b, c, d, e, f] = s.transform;
        return [s.id, [((a + c) / 2 + e - x0) / (x1 - x0), ((b + d) / 2 + f - y0) / (y1 - y0)]];
      }),
  );
  return new Map(readingOrder(spots, [...spots.keys()], 'rows').map((id, i) => [id, i + 1]));
}

/** A data quilt's marks (spec 025): each block space's number, and each placed space's month
 *  (week, day) under it, those joined in order. */
export function quiltDataMarks(quilt: Quilt, generated: Generated): DataMark[] {
  const plan = quilt.data;
  if (!plan) return [];
  const no = blockSpaceNumbers(generated);
  return generated.slots.flatMap((slot): DataMark[] => {
    const n = no.get(slot.id);
    if (!n) return [];
    const [a, b, c, d, e, f] = slot.transform;
    const p: Pt = [(a + c) / 2 + e, (b + d) / 2 + f];
    const k = numberOf(plan, slot.id);
    return [
      { p, label: `Block ${n}`, group: '', order: n, dy: -15, muted: true },
      ...(k ? [{ p, label: numberLabel(plan, k), group: 'n', order: k }] : []),
    ];
  });
}

/** Each placed data block's day places (value A) in day order, in quilt units: where its days run. */
export function quiltDayPaths(doc: RrqDoc, quilt: Quilt, generated: Generated): Pt[][] {
  const plan = quilt.data;
  if (!plan) return [];
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  return generated.slots.flatMap((slot) => {
    const content = quilt.layers[0].slots[slot.id];
    const block = content && blocks.get(content.block);
    if (!content || !block || !numberOf(plan, slot.id)) return [];
    const fills = resolveColoring(quilt.colorings[content.coloring], block)?.fills ?? {};
    const at = pieceSpots(block);
    const m = placementMatrix(slot, content, block);
    const days = Object.entries(fills)
      .flatMap(([id, f]) =>
        'data' in f && !f.data.slot && at.has(id) ? [{ n: f.data.n, s: at.get(id)! }] : [],
      )
      .sort((a, b) => a.n - b.n)
      .map(({ s }): Pt => {
        const [x, y] = [s[0] * block.size[0], s[1] * block.size[1]];
        return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
      });
    return days.length > 1 ? [days] : [];
  });
}

/** Light arrows along the day paths (under the month trace). `px` = one CSS pixel. */
export function drawDayArrows(
  ctx: CanvasRenderingContext2D,
  paths: readonly Pt[][],
  px: number,
  dark: boolean,
) {
  if (!paths.length) return;
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.25 * px;
  ctx.lineJoin = 'round';
  for (const p of paths) {
    ctx.beginPath();
    p.forEach((q, i) => (i ? ctx.lineTo(...q) : ctx.moveTo(...q)));
    ctx.stroke();
    // The head, at the last day, pointing on from the day before.
    const [a, b] = [p.at(-2)!, p.at(-1)!];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const h = 6 * px;
    ctx.beginPath();
    ctx.moveTo(...b);
    ctx.lineTo(b[0] - h * Math.cos(ang - 0.45), b[1] - h * Math.sin(ang - 0.45));
    ctx.lineTo(b[0] - h * Math.cos(ang + 0.45), b[1] - h * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
