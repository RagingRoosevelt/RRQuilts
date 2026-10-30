// Block editor rendering in design units: patches, graph paper, guides, seams (unconnected and
// selected highlighted), nodes, the in-progress seam, the snap marker, and the arc bulge handle.
import { segGeom } from '@/editor/draw-ops';
import { gridSpacing, type SnapSettings } from '@/editor/snap';
import type { Pt, Seg } from '@/model/geometry/path';
import type { Block, Drawing } from '@/model/schema/block';
import type { ColoringBody } from '@/model/schema/coloring';
import { colorLookup, complement, drawBlock, type View } from './draw';
import { blockPaths } from './paths';
import { OVERLAY_TINT } from '@/model/targets';
import { drawDataOverlay, type DataMark } from './data-overlay';
import { paintLabel, pieceSpots } from '@/model/data-paint';
import type { RrqDoc } from '@/model/schema/project';
import { arcGeom } from '@/model/geometry/path';
import { lattice, SHAPE_OUTLINE } from '@/model/blocks/shape';

export interface BlockDrawOptions {
  dpr: number;
  view: View;
  dark: boolean;
  /** 'draw' shows light patches + seams; 'color' shows the coloring. */
  mode: 'draw' | 'color';
  coloring: ColoringBody | undefined;
  snap: SnapSettings;
  /** Grid points snap (the quilter's setting): show the grid. */
  showGrid: boolean;
  graph: { show: boolean; step: number };
  guides: { a: Pt; b: Pt; sweep?: number }[];
  selection: Set<string>;
  unconnected: Set<string>;
  showNodes: boolean;
  preview?: Seg | null;
  previewRect?: [Pt, Pt] | null;
  marquee?: [Pt, Pt] | null;
  snapPoint?: Pt | null;
  /** Lined up (spec 031): dashed guides from the point to the corners it lines up with. */
  lineGuide?: { p: Pt; to: Pt[] } | null;
  bulge?: Pt | null;
  /** While dragging: the drawing as it will be on release (seams follow live). */
  liveDrawing?: Drawing | null;
  /** Color mode: data paints' numbers, and their order line (spec 025). */
  dataOverlay?: { line: boolean } | null;
  /** Color mode: the patch under the pointer, outlined with a glow. */
  hoverPatch?: string | null;
}

function segPath(p: Path2D, g: Seg) {
  p.moveTo(...g.a);
  if (g.kind === 'line') p.lineTo(...g.b);
  else if (g.kind === 'arc') {
    const a = arcGeom(g.a, g.b, g.sweep);
    p.arc(a.center[0], a.center[1], a.r, a.start, a.start + a.sweep, a.sweep < 0);
  } else p.bezierCurveTo(...g.c1, ...g.c2, ...g.b);
}

export function drawBlockEditor(
  ctx: CanvasRenderingContext2D,
  doc: RrqDoc,
  block: Block & { drawing?: Drawing },
  o: BlockDrawOptions,
) {
  const [w, h] = block.size;
  const k = o.dpr * o.view.scale;
  ctx.setTransform(k, 0, 0, k, o.dpr * o.view.tx, o.dpr * o.view.ty);
  const px = 1 / o.view.scale; // one CSS pixel in design units
  const ink = o.dark ? '#e8e8e8' : '#222';
  // The block's outline: its shape (spec 026) or the square.
  const outline = new Path2D();
  if (block.shape) {
    SHAPE_OUTLINE[block.shape].forEach(([x, y], i) =>
      i ? outline.lineTo(x * w, y * h) : outline.moveTo(x * w, y * h),
    );
    outline.closePath();
  } else outline.rect(0, 0, w, h);

  // Patches
  if (o.mode === 'color') {
    drawBlock(ctx, block, o.coloring, colorLookup(doc, [], { ctx, devicePerUnit: k }), {
      outlines: true,
      lineWidth: px,
      dark: o.dark,
    });
  } else {
    ctx.fillStyle = o.dark ? '#2f2f2f' : '#fbf8f1';
    ctx.fill(outline);
  }

  // A shaped block's triangle grid: faint lines inside the outline, as the snap points.
  if (block.shape && o.mode === 'draw' && o.showGrid) {
    ctx.save();
    ctx.clip(outline);
    ctx.beginPath();
    for (const [a, b] of lattice(block.shape, block.size, o.snap.perSide).lines()) {
      ctx.moveTo(...a);
      ctx.lineTo(...b);
    }
    ctx.lineWidth = px;
    ctx.strokeStyle = o.dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)';
    ctx.stroke();
    ctx.restore();
  }

  // Graph paper
  if (o.graph.show && o.graph.step > 0 && !block.shape) {
    ctx.beginPath();
    for (let x = o.graph.step; x < w; x += o.graph.step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = o.graph.step; y < h; y += o.graph.step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.lineWidth = px;
    ctx.strokeStyle = o.dark ? 'rgba(120,170,255,0.18)' : 'rgba(30,110,220,0.15)';
    ctx.stroke();
  }

  // Snap grid points (only when they'd be at least 6 px apart)
  if (o.mode === 'draw' && o.showGrid && !block.shape) {
    const [gx, gy] = gridSpacing(o.snap, block.size);
    if (gx / px >= 6 && gy / px >= 6) {
      ctx.fillStyle = o.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';
      const r = 1.2 * px;
      for (let x = 0; x <= w + 1e-9; x += gx)
        for (let y = 0; y <= h + 1e-9; y += gy) ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }

  // Guides
  if (o.guides.length) {
    const g = new Path2D();
    for (const x of o.guides) {
      const a: Pt = [x.a[0] * w, x.a[1] * h];
      const b: Pt = [x.b[0] * w, x.b[1] * h];
      segPath(g, x.sweep ? { kind: 'arc', a, b, sweep: x.sweep } : { kind: 'line', a, b });
    }
    ctx.setLineDash([6 * px, 4 * px]);
    ctx.lineWidth = px;
    ctx.strokeStyle = '#1e88e5';
    ctx.stroke(g);
    ctx.setLineDash([]);
  }

  // Outline
  ctx.lineWidth = 2 * px;
  ctx.strokeStyle = ink;
  ctx.stroke(outline);

  // Seams
  const d = o.liveDrawing ?? ('drawing' in block ? block.drawing : undefined);
  if (d && o.mode === 'draw') {
    for (const s of d.segments) {
      const p = new Path2D();
      segPath(p, segGeom(d, s, block.size));
      const sel = o.selection.has(s.id);
      ctx.lineWidth = (sel ? 3 : 1.6) * px;
      ctx.strokeStyle = sel ? '#1976d2' : o.unconnected.has(s.id) ? '#e53935' : ink;
      ctx.stroke(p);
    }
    if (o.showNodes) {
      const r = 3 * px;
      for (const n of d.nodes) {
        ctx.fillStyle = o.dark ? '#111' : '#fff';
        ctx.strokeStyle = ink;
        ctx.lineWidth = px;
        ctx.fillRect(n.x * w - r, n.y * h - r, 2 * r, 2 * r);
        ctx.strokeRect(n.x * w - r, n.y * h - r, 2 * r, 2 * r);
      }
    } else {
      // Other tools: seam ends stay visible as small, quieter rings (unlike grid dots).
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = o.dark ? '#111' : '#fff';
      ctx.strokeStyle = ink;
      ctx.lineWidth = px;
      for (const n of d.nodes) {
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, 2.5 * px, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  // In-progress seam / grid rectangle / marquee
  ctx.setLineDash([5 * px, 4 * px]);
  ctx.lineWidth = 1.6 * px;
  ctx.strokeStyle = '#1976d2';
  if (o.preview) {
    const p = new Path2D();
    segPath(p, o.preview);
    ctx.stroke(p);
  }
  for (const r of [o.previewRect, o.marquee]) {
    if (!r) continue;
    ctx.strokeRect(
      Math.min(r[0][0], r[1][0]),
      Math.min(r[0][1], r[1][1]),
      Math.abs(r[1][0] - r[0][0]),
      Math.abs(r[1][1] - r[0][1]),
    );
  }
  ctx.setLineDash([]);

  if (o.lineGuide) {
    ctx.beginPath();
    for (const a of o.lineGuide.to) {
      ctx.moveTo(...o.lineGuide.p);
      ctx.lineTo(...a);
    }
    ctx.setLineDash([4 * px, 3 * px]);
    ctx.lineWidth = 1.5 * px;
    ctx.strokeStyle = '#43a047';
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Snap marker and bulge handle
  for (const [pt, color] of [
    [o.snapPoint, '#43a047'],
    [o.bulge, '#1976d2'],
  ] as const) {
    if (!pt) continue;
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 5 * px, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  if (o.mode === 'color' && o.dataOverlay && o.coloring) {
    const at = pieceSpots(block);
    const marks: DataMark[] = Object.entries(o.coloring.fills).flatMap(([id, f]) => {
      const p = at.get(id);
      return p && 'data' in f
        ? [
            {
              p: [p[0] * w, p[1] * h] as Pt,
              label: paintLabel(f.data),
              group: String(f.data.slot ?? 0),
              order: f.data.n,
            },
          ]
        : [];
    });
    drawDataOverlay(ctx, marks, px, { line: o.dataOverlay.line, dark: o.dark });
  }

  // The hovered patch: a glowing outline on top, in the quilt editor's hues (a numbered patch as
  // a data block, any other as a block).
  const hovered = o.mode === 'color' && o.hoverPatch;
  const path = hovered ? blockPaths(block).find((x) => x.id === hovered)?.path : undefined;
  if (path) {
    const f = o.coloring?.fills[hovered as string];
    const glow = complement(OVERLAY_TINT, f && 'data' in f ? 180 : 120);
    ctx.save();
    ctx.strokeStyle = glow;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 10 * o.dpr;
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 6.5 * px;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2.5 * px;
    ctx.stroke(path);
    ctx.restore();
  }
}
