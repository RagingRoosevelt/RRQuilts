// Data paints' overlay (spec 025): each numbered piece's label, and an order line through the
// pieces of each group (a value slot) in number order, drawn in the current transform. A number on
// several places traces by spec 046's rules (`traceSegments`).
import { takesBlock } from '@/editor/scope';
import { resolveColoring } from '@/model/coloring';
import { pieceSpots, readingOrder } from '@/model/data-paint';
import { numberLabel, placeOf, seriesLabel } from '@/model/data-quilt';
import type { Generated, Slot } from '@/model/layout/slots';
import { SHAPE_OUTLINE, type BlockShape } from '@/model/blocks/shape';
import { pathPolygon, type Pt } from '@/model/geometry/path';
import { area } from '@/model/print/polygon';
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
  /** A second line under the label (a placement's series: qA). */
  sub?: string;
}

/**
 * The order line's segments (spec 046 US3): from each number's places to the next number's. One
 * place on either side joins every place on the other; several on both pair up in order, each to
 * the nearest one left, until one side has a single place left.
 */
export function traceSegments(marks: readonly Pick<DataMark, 'p' | 'order'>[]): [Pt, Pt][] {
  const by = new Map<number, Pt[]>();
  for (const m of marks) by.set(m.order, [...(by.get(m.order) ?? []), m.p]);
  const keys = [...by.keys()].sort((a, b) => a - b);
  const out: [Pt, Pt][] = [];
  for (let i = 0; i + 1 < keys.length; i++) {
    const xs = [...by.get(keys[i]!)!];
    const ys = [...by.get(keys[i + 1]!)!];
    while (xs.length > 1 && ys.length > 1) {
      const x = xs.shift()!;
      let j = 0;
      ys.forEach((y, k) => {
        if (Math.hypot(y[0] - x[0], y[1] - x[1]) < Math.hypot(ys[j]![0] - x[0], ys[j]![1] - x[1]))
          j = k;
      });
      out.push([x, ys.splice(j, 1)[0]!]);
    }
    if (xs.length === 1) for (const y of ys) out.push([xs[0]!, y]);
    else for (const x of xs) out.push([x, ys[0]!]);
  }
  return out;
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
      ctx.beginPath();
      for (const [a, b] of traceSegments(g)) {
        ctx.moveTo(...a);
        ctx.lineTo(...b);
      }
      ctx.strokeStyle = LINE[i % LINE.length]!;
      ctx.lineWidth = 2 * px;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      // The start: a dot on each place of the first number.
      const first = Math.min(...g.map((m) => m.order));
      ctx.beginPath();
      for (const m of g) {
        if (m.order !== first) continue;
        ctx.moveTo(m.p[0] + 4 * px, m.p[1]);
        ctx.arc(...m.p, 4 * px, 0, 2 * Math.PI);
      }
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
    if (m.sub) {
      ctx.font = `500 ${11 * dev}px sans-serif`;
      ctx.globalAlpha = 0.85;
      ctx.strokeText(m.sub, q.x, y + 14 * dev);
      ctx.fillText(m.sub, q.x, y + 14 * dev);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** A block space a data block can go in: whole, not cut down at the quilt's edge (its outline as
 *  big as its shape). */
export function isWholeBlockSpace(s: Slot): boolean {
  if (s.kind !== 'block' || !takesBlock(s)) return false;
  const [a, b, c, d] = s.transform;
  const unit = SHAPE_OUTLINE[s.shape as BlockShape];
  const whole = Math.abs(a * d - b * c) * (unit ? area(unit) : 1);
  return area(pathPolygon(s.outline, [1, 1])) >= whole * 0.99;
}

/** Whole block spaces numbered left to right, top to bottom (1-based): where a data quilt's
 *  numbers can go. The count isn't shown (spec 046), but names a space where one must be named. */
export function blockSpaceNumbers(generated: Generated): Map<string, number> {
  const [x0, y0, x1, y1] = generated.bounds;
  const spots = new Map(
    generated.slots.filter(isWholeBlockSpace).map((s): [string, Pt] => {
      const [a, b, c, d, e, f] = s.transform;
      return [s.id, [((a + c) / 2 + e - x0) / (x1 - x0), ((b + d) / 2 + f - y0) / (y1 - y0)]];
    }),
  );
  return new Map(readingOrder(spots, [...spots.keys()], 'rows').map((id, i) => [id, i + 1]));
}

/** A data quilt's marks (spec 046): each placement's number on its space, its series under it,
 *  joined in number order (several places of a number by `traceSegments`). */
export function quiltDataMarks(doc: RrqDoc, quilt: Quilt, generated: Generated): DataMark[] {
  const plan = quilt.data;
  if (!plan) return [];
  const at = new Map(generated.slots.map((s) => [s.id, s]));
  const blocks = new Map(doc.project.blocks.map((b) => [b.id, b]));
  return plan.places.flatMap((place): DataMark[] => {
    const slot = at.get(place.space);
    if (!slot) return [];
    const [a, b, c, d, e, f] = slot.transform;
    return [
      {
        p: [(a + c) / 2 + e, (b + d) / 2 + f],
        label: numberLabel(plan, place.n),
        sub: seriesLabel(place, blocks.get(place.block)),
        group: 'n',
        order: place.n,
        dy: -7,
      },
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
    if (!content || !block || !placeOf(plan, slot.id)) return [];
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
  ctx.strokeStyle = ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.22)';
  // Wider than the month trace (2 px), and light, so the trace reads on top of it.
  ctx.lineWidth = 5 * px;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const p of paths) {
    ctx.beginPath();
    p.forEach((q, i) => (i ? ctx.lineTo(...q) : ctx.moveTo(...q)));
    ctx.stroke();
    // The head, at the last day, pointing on from the day before.
    const [a, b] = [p.at(-2)!, p.at(-1)!];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const h = 13 * px;
    ctx.beginPath();
    ctx.moveTo(...b);
    ctx.lineTo(b[0] - h * Math.cos(ang - 0.45), b[1] - h * Math.sin(ang - 0.45));
    ctx.lineTo(b[0] - h * Math.cos(ang + 0.45), b[1] - h * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
