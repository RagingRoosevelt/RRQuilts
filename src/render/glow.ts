// Glowing highlights for any canvas, one look wherever the same style is given: one path's own
// (`glowPath`), or one outline round several shapes taken together (`glowGroup`: shapes that touch
// share it, with no line where they meet). The quilt editor (spaces, a colorway's color), the block
// editor (the hovered patch) and EPP canvases (through their `decorate` hook) draw with these.
import type { M } from './affine';

/** A glowing line `width` wide over a fainter `halo` line, both blurred by `blur`. Lengths in style
 *  pixels (CSS pixels for the looks below; each function says how they're scaled). */
export interface GlowStyle {
  color: string;
  width: number;
  blur: number;
  halo?: { width: number; alpha: number };
}

/** A lit patch: the block editor's hovered patch, a colorway's color on the quilt (CSS pixels). */
export const patchGlow = (color: string): GlowStyle => ({
  color,
  width: 2.5,
  blur: 10,
  halo: { width: 6.5, alpha: 0.45 },
});

/** The halo, then the line, of `s` along `path` (`unit`: one style pixel in the path's units). */
function strokes(g: CanvasRenderingContext2D, path: Path2D, unit: number, s: GlowStyle) {
  if (s.halo) {
    g.globalAlpha = s.halo.alpha;
    g.lineWidth = s.halo.width * unit;
    g.stroke(path);
    g.globalAlpha = 1;
  }
  g.lineWidth = s.width * unit;
  g.stroke(path);
}

/** `path` in the current transform, glowing. `px`: one style pixel in the path's units; `dpr`:
 *  device pixels per style pixel, for the blur. */
export function glowPath(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  px: number,
  dpr: number,
  s: GlowStyle,
) {
  ctx.save();
  ctx.strokeStyle = ctx.shadowColor = s.color;
  ctx.shadowBlur = s.blur * dpr;
  ctx.lineJoin = 'round';
  strokes(ctx, path, px, s);
  ctx.restore();
}

/** A shape for `glowGroup`: `path` in transform `m` (to canvas device pixels), cut to `clip`. */
export interface GlowShape {
  path: Path2D;
  m: M;
  clip?: { path: Path2D; m: M };
}

const scratches: HTMLCanvasElement[] = [];
/** Scratch canvas `i`, cleared, `w` × `h`. */
function scratch(i: number, w: number, h: number) {
  const c = (scratches[i] ??= document.createElement('canvas'));
  if (c.width !== w || c.height !== h) Object.assign(c, { width: w, height: h });
  const g = c.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, w, h);
  return [c, g] as const;
}
/** One device pixel in the units of transform `m`. */
const unitOf = (m: M) => 1 / Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

/** Each shape's edge as a `width` line (device pixels): where it's cut, along the cut too. */
function strokeShapes(g: CanvasRenderingContext2D, shapes: readonly GlowShape[], width: number) {
  g.lineJoin = 'round';
  for (const x of shapes) {
    g.save();
    if (x.clip) {
      g.setTransform(...x.clip.m);
      g.clip(x.clip.path);
    }
    g.setTransform(...x.m);
    g.lineWidth = width * unitOf(x.m);
    g.stroke(x.path);
    g.restore();
    if (!x.clip) continue;
    g.save();
    g.setTransform(...x.m);
    g.clip(x.path);
    g.setTransform(...x.clip.m);
    g.lineWidth = width * unitOf(x.clip.m);
    g.stroke(x.clip.path);
    g.restore();
  }
}

/** A `width` line (device pixels) round `mask`'s shapes: its outer half is the `lit` shapes' own
 *  edges outside the mask, its inner half the `rest`'s edges inside it. */
function band(
  mask: HTMLCanvasElement,
  lit: readonly GlowShape[],
  rest: readonly GlowShape[],
  width: number,
  color: string,
) {
  const { width: w, height: h } = mask;
  const [outer, og] = scratch(1, w, h);
  og.strokeStyle = color;
  strokeShapes(og, lit, width);
  og.globalCompositeOperation = 'destination-out';
  og.drawImage(mask, 0, 0);
  const [inner, ig] = scratch(2, w, h);
  ig.strokeStyle = color;
  strokeShapes(ig, rest, width);
  ig.globalCompositeOperation = 'destination-in';
  ig.drawImage(mask, 0, 0);
  og.globalCompositeOperation = 'source-over';
  og.drawImage(inner, 0, 0);
  return outer;
}

/**
 * One glow round the `lit` shapes taken together, as `glowPath` draws one path (`k`: device
 * pixels per style pixel). `rest`: the shapes beside them (other pieces, empty spaces), whose
 * edges give the line's inner half. Where lit shapes touch, there's no line.
 */
export function glowGroup(
  ctx: CanvasRenderingContext2D,
  lit: readonly GlowShape[],
  rest: readonly GlowShape[],
  k: number,
  s: GlowStyle,
) {
  if (!lit.length) return;
  const { width: w, height: h } = ctx.canvas;
  // Every lit shape, solid (seams between neighbors, each edge partly covered, filled in).
  const [mask, mg] = scratch(0, w, h);
  mg.fillStyle = mg.strokeStyle = '#000';
  for (const x of lit) {
    mg.save();
    if (x.clip) {
      mg.setTransform(...x.clip.m);
      mg.clip(x.clip.path);
    }
    mg.setTransform(...x.m);
    mg.lineWidth = 1.5 * unitOf(x.m);
    mg.fill(x.path);
    mg.stroke(x.path);
    mg.restore();
  }
  mg.drawImage(mask, 0, 0);
  mg.drawImage(mask, 0, 0);
  // As `glowPath`: the halo, faint, then the line, each blurred (drawn before the next band
  // reuses the scratch canvases).
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.shadowColor = s.color;
  ctx.shadowBlur = s.blur * k;
  if (s.halo) {
    ctx.globalAlpha = s.halo.alpha;
    ctx.drawImage(band(mask, lit, rest, s.halo.width * k, s.color), 0, 0);
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(band(mask, lit, rest, s.width * k, s.color), 0, 0);
  ctx.restore();
}
