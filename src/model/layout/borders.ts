// Borders around the quilt center, innermost first. v1 generates the plain strip styles; the
// pieced styles are stored and reported as unsupported until their generators exist.
import type { Border } from '../schema/quilt';
import type { M } from '../geometry/affine';
import { tile } from './engine';
import { patternBands, type PatternStyle } from './presets';
import { polySlot, rectSlot, type Bounds, type Slot } from './slots';

type Side = 'top' | 'right' | 'bottom' | 'left';

/** Each border style's name, in the order the Borders tab lists them. */
export const BORDER_STYLE_NAMES: Record<Border['style'], string> = {
  'long-horizontal': 'Long horizontal',
  'long-vertical': 'Long vertical',
  mitered: 'Mitered',
  'corner-blocks': 'Corner blocks',
  blocks: 'Blocks',
  'half-drop-blocks': 'Half drop blocks',
  'blocks-aligned-inside': 'Blocks aligned inside',
  'half-drop-aligned': 'Half drop aligned',
  'spaced-squares': 'Spaced squares',
  'tile-squares': 'Tile squares',
  'tile-on-point': 'Tile on point',
  'tile-on-point-corners': 'Tile on point corners',
  diamonds: 'Diamonds',
  'half-drop-diamonds': 'Half drop diamonds',
  'double-diamonds': 'Double diamonds',
  'half-drop-double-diamonds': 'Half drop double diamonds',
  'big-little-diamonds': 'Big & little diamonds',
  'half-drop-big-little-diamonds': 'Half drop big & little diamonds',
  'points-out': 'Points out',
  'points-in': 'Points in',
  'big-little-points-out': 'Big & little points out',
  'big-little-points-in': 'Big & little points in',
};

export function borderSlots(
  borders: Border[],
  center: Bounds,
  /** Columns and rows of a Straight Set, for the "aligned" styles. */
  aligned?: [number, number],
): { slots: Slot[]; bounds: Bounds; unsupported: string[] } {
  const slots: Slot[] = [];
  const unsupported: string[] = [];
  let [x0, y0, x1, y1] = center;
  borders.forEach((b, i) => {
    const n = i + 1;
    const [l, t, r, bt] = b.sides;
    const [X0, Y0, X1, Y1] = [x0 - l, y0 - t, x1 + r, y1 + bt];
    const id = (side: Side) => `border:${n}:${side}`;
    const add = (s: Slot, width: number) => width > 0 && slots.push(s);

    if (b.style === 'mitered') {
      add(
        polySlot(id('top'), [
          [X0, Y0],
          [X1, Y0],
          [x1, y0],
          [x0, y0],
        ]),
        t,
      );
      add(
        polySlot(id('right'), [
          [X1, Y0],
          [X1, Y1],
          [x1, y1],
          [x1, y0],
        ]),
        r,
      );
      add(
        polySlot(id('bottom'), [
          [X1, Y1],
          [X0, Y1],
          [x0, y1],
          [x1, y1],
        ]),
        bt,
      );
      add(
        polySlot(id('left'), [
          [X0, Y1],
          [X0, Y0],
          [x0, y0],
          [x0, y1],
        ]),
        l,
      );
    } else if (b.style === 'long-vertical') {
      add(rectSlot(id('left'), X0, Y0, l, Y1 - Y0), l);
      add(rectSlot(id('right'), x1, Y0, r, Y1 - Y0), r);
      add(rectSlot(id('top'), x0, Y0, x1 - x0, t), t);
      add(rectSlot(id('bottom'), x0, y1, x1 - x0, bt), bt);
    } else if (b.style !== 'long-horizontal') {
      slots.push(...pieced(b, n, [x0, y0, x1, y1], aligned));
    } else {
      add(rectSlot(id('top'), X0, Y0, X1 - X0, t), t);
      add(rectSlot(id('bottom'), X0, y1, X1 - X0, bt), bt);
      add(rectSlot(id('left'), X0, y0, l, y1 - y0), l);
      add(rectSlot(id('right'), x1, y0, r, y1 - y0), r);
    }
    [x0, y0, x1, y1] = [X0, Y0, X1, Y1];
  });
  return { slots, bounds: [x0, y0, x1, y1], unsupported };
}

/** Pattern, turned over or not, and how its counts are found, for each pieced border style. */
const PIECED: Partial<
  Record<
    Border['style'],
    { pattern: PatternStyle; flip?: boolean; aligned?: boolean; corners?: 'on-point' }
  >
> = {
  'corner-blocks': { pattern: 'plain' },
  blocks: { pattern: 'blocks' },
  'half-drop-blocks': { pattern: 'half-drop-blocks' },
  'spaced-squares': { pattern: 'spaced-squares' },
  diamonds: { pattern: 'diamonds' },
  'half-drop-diamonds': { pattern: 'half-drop-diamonds' },
  'double-diamonds': { pattern: 'double-diamonds' },
  'half-drop-double-diamonds': { pattern: 'half-drop-double-diamonds' },
  'big-little-diamonds': { pattern: 'big-little-diamonds' },
  'half-drop-big-little-diamonds': { pattern: 'half-drop-big-little-diamonds' },
  // Points: tips at the band's near side (the quilt) unless turned over.
  'points-in': { pattern: 'points-a' },
  'points-out': { pattern: 'points-a', flip: true },
  'big-little-points-in': { pattern: 'big-little-points' },
  'big-little-points-out': { pattern: 'big-little-points', flip: true },
  'tile-squares': { pattern: 'blocks' },
  'tile-on-point': { pattern: 'diamonds' },
  'tile-on-point-corners': { pattern: 'diamonds', corners: 'on-point' },
  'blocks-aligned-inside': { pattern: 'blocks', aligned: true },
  'half-drop-aligned': { pattern: 'half-drop-blocks', aligned: true },
};

/**
 * Units along the top and bottom and down the sides of a pieced border around `inner`: the layout's
 * columns and rows for aligned styles, else the border's own counts, else the counts giving its
 * pattern its natural proportions (UNIT).
 */
export function borderCounts(
  b: Border,
  inner: Bounds,
  aligned?: [number, number],
): [number, number] {
  const spec = PIECED[b.style] ?? { pattern: 'plain' as const };
  const [x0, y0, x1, y1] = inner;
  const [l, t] = b.sides;
  const auto = (len: number, width: number) =>
    Math.max(1, Math.round(len / Math.max(width * (UNIT[spec.pattern] ?? 1), 1e-9)));
  const pick = (i: 0 | 1, len: number, width: number) =>
    Math.max(1, (spec.aligned ? aligned?.[i] : undefined) ?? b.blocks?.[i] ?? auto(len, width));
  return [pick(0, x1 - x0, t), pick(1, y1 - y0, l)];
}

/** A pattern's natural unit length, in border widths: square blocks and diamonds, 90° points, a
 *  spaced square as long as its gap, a square big shape among big and little ones. Default counts. */
const UNIT: Partial<Record<PatternStyle, number>> = {
  'spaced-squares': 2,
  'double-diamonds': 0.5,
  'half-drop-double-diamonds': 0.5,
  'points-a': 2,
  'big-little-diamonds': 1.5,
  'half-drop-big-little-diamonds': 1.5,
  'big-little-points': 3,
};

/**
 * A pieced border (spec 018): each side a pattern band (spec 017's strip patterns) along the inner
 * edge, from the quilt outward, between square corners. Pieces take colors and fabrics only.
 */
function pieced(b: Border, n: number, inner: Bounds, aligned?: [number, number]): Slot[] {
  const spec = PIECED[b.style] ?? { pattern: 'plain' as const };
  const [x0, y0, x1, y1] = inner;
  const [l, t, r, bt] = b.sides;
  const [W, H] = [x1 - x0, y1 - y0];
  const counts = borderCounts(b, inner, aligned);
  const count = (_len: number, _width: number, i: 0 | 1) => counts[i];
  // Each side: band-local x along it, y from the quilt (0) outward.
  const sides: [Side, number, number, M, Bounds, 0 | 1][] = [
    ['top', t, W, [1, 0, 0, -1, x0, y0], [x0, y0 - t, x1, y0], 0],
    ['bottom', bt, W, [1, 0, 0, 1, x0, y1], [x0, y1, x1, y1 + bt], 0],
    ['left', l, H, [0, 1, -1, 0, x0, y0], [x0 - l, y0, x0, y1], 1],
    ['right', r, H, [0, 1, 1, 0, x1, y0], [x1, y0, x1 + r, y1], 1],
  ];
  const out: Slot[] = [];
  for (const [side, width, len, map, clip, axis] of sides) {
    if (width <= 0 || len <= 0) continue;
    const bands = patternBands({
      style: spec.pattern,
      L: len,
      w: width,
      n: count(len, width, axis),
      across: 1,
      y0: 0,
      kind: 'border',
      prefix: `border:${n}:${side}:`,
      ...(spec.flip ? { flip: true } : {}),
    });
    out.push(...tile({ bands, map, clip }));
  }
  // Corners: squares, or (Tile On Point Corners) a square on point with four triangles around it.
  const corners: [string, Bounds][] = [
    ['tl', [x0 - l, y0 - t, x0, y0]],
    ['tr', [x1, y0 - t, x1 + r, y0]],
    ['br', [x1, y1, x1 + r, y1 + bt]],
    ['bl', [x0 - l, y1, x0, y1 + bt]],
  ];
  for (const [c, [a, bb, cc, d]] of corners) {
    if (cc - a <= 0 || d - bb <= 0) continue;
    const id = `border:${n}:corner:${c}`;
    if (spec.corners !== 'on-point') {
      out.push(rectSlot(id, a, bb, cc - a, d - bb));
      continue;
    }
    const [mx, my] = [(a + cc) / 2, (bb + d) / 2];
    const tri = (k: number, pts: [number, number][]) => ({
      ...polySlot(`${id}:${k}`, pts),
      alt: 1,
    });
    out.push(
      {
        ...polySlot(`${id}:c`, [
          [mx, bb],
          [cc, my],
          [mx, d],
          [a, my],
        ]),
        alt: 0,
      },
      tri(1, [
        [a, bb],
        [mx, bb],
        [a, my],
      ]),
      tri(2, [
        [mx, bb],
        [cc, bb],
        [cc, my],
      ]),
      tri(3, [
        [cc, my],
        [cc, d],
        [mx, d],
      ]),
      tri(4, [
        [a, my],
        [mx, d],
        [a, d],
      ]),
    );
  }
  return out;
}
