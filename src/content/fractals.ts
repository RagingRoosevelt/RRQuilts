// Fractal blocks (designs drawn for RRQuilts), filed under Fractals. The square ones are drawn on a
// grid with each row's same-colored run as one strip, so they sew in rows; the shaped ones use the
// shaped-block kit.
import { gridBlocks, rect, type GridDef, type Piece } from './grid';
import { corners, lerp, type P, type ShapedDef, type ShapedPiece } from './shaped-kit';
import { sierpinski } from './shaped-e';

/** An n × n block from a color per cell: each row's runs of one color become one strip. */
function rows(n: number, color: (x: number, y: number) => string): Piece[] {
  const out: Piece[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n;) {
      const c = color(x, y);
      let w = 1;
      while (x + w < n && color(x + w, y) === c) w++;
      out.push(rect(x, y, w, 1, c));
      x += w;
    }
  return out;
}

/** Base-3 digits of a cell coordinate, most significant first. */
const digits = (v: number, k: number) =>
  Array.from({ length: k }, (_, i) => Math.floor(v / 3 ** (k - 1 - i)) % 3);

/** Sierpinski carpet, two steps: the middle of each nine-patch is a gap (the big one is one piece). */
function carpet(): Piece[] {
  const hole = (x: number, y: number) =>
    digits(x, 2).some((d, i) => d === 1 && digits(y, 2)[i] === 1);
  const big = (x: number, y: number) => x >= 3 && x < 6 && y >= 3 && y < 6;
  return [
    rect(3, 3, 3, 3, 'L'),
    ...rows(9, (x, y) => (big(x, y) ? 'big' : hole(x, y) ? 'L' : 'D')).filter((p) => p.c !== 'big'),
  ];
}

/** Vicsek fractal, two steps: of each nine-patch keep the middle and its four sides (a cross). */
const vicsek = (x: number, y: number) =>
  digits(x, 2).every((d, i) => d === 1 || digits(y, 2)[i] === 1) ? 'N' : 'L';

// Cantor set, three rows of bars (each third's middle left out) with light rows between.
const CANTOR: [number, number, (x: number) => boolean][] = [
  [0, 2, () => true],
  [3, 2, (x) => digits(x, 2)[0] !== 1],
  [6, 2, (x) => !digits(x, 2).includes(1)],
];
function cantor(): Piece[] {
  const out: Piece[] = [rect(0, 2, 9, 1, 'L'), rect(0, 5, 9, 1, 'L'), rect(0, 8, 9, 1, 'L')];
  for (const [y, h, on] of CANTOR)
    for (let x = 0; x < 9;) {
      const c = on(x) ? 'D' : 'L';
      let w = 1;
      while (x + w < 9 && (on(x + w) ? 'D' : 'L') === c) w++;
      out.push(rect(x, y, w, h, c));
      x += w;
    }
  return out;
}

/** The cells of a Hilbert curve of order `k` (2^k a side), in path order. */
function hilbert(k: number): [number, number][] {
  const n = 2 ** k;
  const out: [number, number][] = [];
  for (let d = 0; d < n * n; d++) {
    let [x, y, t] = [0, 0, d];
    for (let s = 1; s < n; s *= 2) {
      const rx = 1 & (t / 2);
      const ry = 1 & (t ^ rx);
      if (ry === 0) {
        if (rx === 1) [x, y] = [s - 1 - x, s - 1 - y];
        [x, y] = [y, x];
      }
      x += s * rx;
      y += s * ry;
      t = Math.floor(t / 4);
    }
    out.push([x, y]);
  }
  return out;
}
/** The path drawn on a 15 × 15 grid: cells at even places, the steps between them at odd ones. */
const HILBERT = (() => {
  const on = new Set<string>();
  const path = hilbert(3);
  path.forEach(([x, y], i) => {
    on.add(`${2 * x},${2 * y}`);
    const nx = path[i + 1];
    if (nx) on.add(`${x + nx[0]},${y + nx[1]}`);
  });
  return (x: number, y: number) => (on.has(`${x},${y}`) ? 'S' : 'L');
})();

export const FRACTAL_DEFS: GridDef[] = [
  {
    // The nine-patch's middle left out, again in each of the other eight: 73 pieces, sewn in rows.
    name: 'Sierpinski Carpet',
    size: 9,
    n: 9,
    pieces: carpet(),
  },
  {
    // A cross of five squares, each again a cross: a snowflake of squares.
    name: 'Vicsek Cross',
    size: 9,
    n: 9,
    pieces: rows(9, vicsek),
  },
  {
    // Bars cut in thirds, the middle third left out, a step more on each row down.
    name: 'Cantor Bars',
    size: 9,
    n: 9,
    pieces: cantor(),
  },
  {
    // A path that visits every square of an 8 × 8 grid without crossing itself.
    name: 'Hilbert Curve',
    size: 15,
    n: 15,
    pieces: rows(15, HILBERT),
  },
];

export const FRACTAL_BLOCKS = gridBlocks(FRACTAL_DEFS, 'Fractals');

// --- Shaped fractals ---------------------------------------------------------------------------

/**
 * A light triangle with one small spike on its side v0-v1, pointing toward v2, sewn log cabin style:
 * the spike, the light piece on one side of it, then the other (each cut along a spike side's line).
 */
function spikeUnit(v0: P, v1: P, v2: P): ShapedPiece[] {
  const [b1, b2] = [lerp(v0, v1, 1 / 3), lerp(v0, v1, 2 / 3)];
  const base = lerp(v0, v1, 0.5);
  const tip: P = [base[0] + (v2[0] - base[0]) / 3, base[1] + (v2[1] - base[1]) / 3];
  const x = lerp(v1, v2, 2 / 3);
  return [
    { poly: [b1, b2, tip], c: 'M' },
    { poly: [tip, b2, v1, x], c: 'L' },
    { poly: [v0, b1, tip, x, v2], c: 'L' },
  ];
}

/**
 * A Koch snowflake two steps deep in a flat-top hexagon, sewn as the quilter would: the big first
 * triangle (its corners on the middles of every other side) is one piece, and each of its sides gets
 * a wing (the rest of the hexagon on that side): a row of five triangles, the middle one the
 * medium first-step point, the other four light with a small second-step spike, each sewn log cabin
 * style. Wings are sewn on their own, then joined to the big triangle along one straight seam.
 */
function koch(): ShapedPiece[] {
  const u = 1 / 6;
  const h = (u * Math.sqrt(3)) / 2;
  const big: P[] = [
    [0, -6 * h],
    [4.5 * u, 3 * h],
    [-4.5 * u, 3 * h],
  ];
  /** The point making an equilateral triangle with a-b, away from the middle. */
  const out = (a: P, b: P): P => {
    const m = lerp(a, b, 0.5);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * (Math.sqrt(3) / 2);
    let n: P = [-(b[1] - a[1]), b[0] - a[0]];
    const k = Math.hypot(n[0], n[1]);
    n = [n[0] / k, n[1] / k];
    if (n[0] * m[0] + n[1] * m[1] < 0) n = [-n[0], -n[1]];
    return [m[0] + n[0] * len, m[1] + n[1] * len];
  };
  const wing = (p: P, q: P): ShapedPiece[] => {
    const [p1, p2] = [lerp(p, q, 1 / 3), lerp(p, q, 2 / 3)];
    const [o1, o2, o3] = [out(p, p1), out(p1, p2), out(p2, q)];
    return [
      ...spikeUnit(p, p1, o1),
      ...spikeUnit(p1, o2, o1),
      { poly: [p1, p2, o2], c: 'N' },
      ...spikeUnit(o2, p2, o3),
      ...spikeUnit(p2, q, o3),
    ];
  };
  return [{ poly: big, c: 'D' }, ...big.flatMap((p, i) => wing(p, big[(i + 1) % 3]!))];
}

const [dTop, dRight, dBottom, dLeft] = corners('diamond60') as [P, P, P, P];
const [tA, tB, tC] = corners('triangle') as [P, P, P];

/** The fractals' designer and license. */
export const FRACTAL_CREDIT = { author: 'RagingRoosevelt', license: 'CC-BY-SA-4.0' };

export const FRACTAL_SHAPED: ShapedDef[] = [
  {
    // A Sierpinski gasket three steps deep: each light gap is one piece, 27 dark corners.
    name: 'Sierpinski Triangle',
    shape: 'triangle',
    leg: 8,
    category: 'Fractals',
    pieces: sierpinski(tA, tB, tC, 3),
  },
  {
    // Two Sierpinski triangles back to back, three steps deep.
    name: 'Sierpinski Diamond',
    shape: 'diamond60',
    leg: 8,
    category: 'Fractals',
    pieces: [...sierpinski(dTop, dRight, dLeft, 3), ...sierpinski(dBottom, dLeft, dRight, 3)],
  },
  {
    // A Koch snowflake two steps deep: a six-point star with a small point on each side. The
    // background is set in around its jagged edge.
    name: 'Koch Snowflake',
    shape: 'hexagon',
    leg: 6,
    category: 'Fractals',
    flat: true,
    pieces: koch(),
  },
];
