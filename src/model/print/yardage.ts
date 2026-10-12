// Fabric estimates: whole strips across the usable width per fill, plus backing and binding.
// Lengths are project units (inches or cm); results are rounded up and never under-estimate.
import type { CutLine } from './rotary';
import { roundUp } from './format';

export interface FabricWidth {
  /** Usable width across the fabric (strip length). */
  usable: number;
  /** Fat quarters: each holds strips up to `depth` deep in total. */
  fatQuarter?: { depth: number };
}

export interface FabricNeed {
  fill: string;
  /** Inches or cm of fabric off the bolt (rounded up), or number of fat quarters. */
  length: number;
  fatQuarters?: number;
}

/** Strip widths (one entry per strip) a fill needs. */
const stripsOf = (lines: CutLine[]) =>
  lines.flatMap((l) => Array.from({ length: l.strips }, () => l.stripWidth));

/** Per fill: total strip depth rounded up to `step`, or fat quarters by first-fit. */
export function fabricNeeds(lines: CutLine[], width: FabricWidth, step: number): FabricNeed[] {
  const fills = [...new Set(lines.map((l) => l.fill))];
  return fills.map((fill) => {
    const strips = stripsOf(lines.filter((l) => l.fill === fill));
    if (!width.fatQuarter) {
      return {
        fill,
        length: roundUp(
          strips.reduce((a, b) => a + b, 0),
          step,
        ),
      };
    }
    const depth = width.fatQuarter.depth;
    const bins: number[] = [];
    for (const s of [...strips].sort((a, b) => b - a)) {
      const i = bins.findIndex((used) => used + s <= depth + 1e-9);
      if (i >= 0) bins[i]! += s;
      else bins.push(s); // a strip deeper than a fat quarter still takes one (and is flagged by caller)
    }
    return { fill, length: 0, fatQuarters: bins.length };
  });
}

/** Backing for a `w`×`h` quilt with `overhang` each side, pieced from panels the cheaper way. */
export function backing(w: number, h: number, overhang: number, usable: number, step: number) {
  const W = w + 2 * overhang;
  const H = h + 2 * overhang;
  const across = Math.ceil(W / usable) * H; // panels running top to bottom
  const down = Math.ceil(H / usable) * W; // panels running side to side
  return roundUp(Math.min(across, down), step);
}

/** Straight-grain binding strips around a `w`×`h` quilt, with `extra` for joins and corners. */
export function binding(
  w: number,
  h: number,
  stripWidth: number,
  extra: number,
  usable: number,
  step: number,
) {
  const strips = Math.ceil((2 * (w + h) + extra) / usable);
  return { strips, length: roundUp(strips * stripWidth, step) };
}
