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

/** One Koch step: on each side's middle third, a triangle pointing out of the polygon. */
function kochStep(poly: P[]): P[] {
  return poly.flatMap((a, i) => {
    const b = poly[(i + 1) % poly.length]!;
    const [p, q, m] = [lerp(a, b, 1 / 3), lerp(a, b, 2 / 3), lerp(a, b, 0.5)];
    const h = Math.hypot(q[0] - p[0], q[1] - p[1]) * (Math.sqrt(3) / 2);
    let n: P = [-(q[1] - p[1]), q[0] - p[0]];
    const k = Math.hypot(n[0], n[1]);
    n = [n[0] / k, n[1] / k];
    if (inside(poly, [m[0] + n[0] * 1e-6, m[1] + n[1] * 1e-6])) n = [-n[0], -n[1]];
    return [a, p, [m[0] + n[0] * h, m[1] + n[1] * h], q];
  });
}

/**
 * A Koch snowflake two steps deep on a triangle grid inside a flat-top hexagon (side 1 = 6 grid
 * steps): its tips touch the middle of each side. Shaded by step (dark first triangle, medium
 * step-one points, light step-two points) and sewn in rows: each row's run of one color is one piece.
 */
function koch(): ShapedPiece[] {
  const u = 1 / 6;
  const h = (u * Math.sqrt(3)) / 2;
  // The first triangle: side 9 steps, tip on the top side's middle, centered on the hexagon's.
  const s0: P[] = [
    [0, -6 * h],
    [4.5 * u, 3 * h],
    [-4.5 * u, 3 * h],
  ];
  const s1 = kochStep(s0);
  const s2 = kochStep(s1);
  const colorAt = (c: P) => (inside(s0, c) ? 'D' : inside(s1, c) ? 'N' : inside(s2, c) ? 'M' : 'L');
  const hex = corners('hexagon', true);
  const out: ShapedPiece[] = [];
  for (let j = 0; j < 12; j++) {
    const [y0, y1] = [(j - 6) * h, (j - 5) * h];
    // Grid points on the row's top line; the bottom line is offset half a step.
    const off = (((j - 6) % 2) + 2) % 2 === 0 ? 0 : u / 2;
    const tris: { poly: P[]; c: string; x: number }[] = [];
    for (let i = -8; i <= 8; i++) {
      const x = off + i * u;
      const up: P[] = [
        [x, y0],
        [x + u / 2, y1],
        [x - u / 2, y1],
      ];
      const down: P[] = [
        [x, y0],
        [x + u, y0],
        [x + u / 2, y1],
      ];
      for (const t of [up, down]) {
        const c: P = [(t[0]![0] + t[1]![0] + t[2]![0]) / 3, (t[0]![1] + t[1]![1] + t[2]![1]) / 3];
        if (inside(hex, c)) tris.push({ poly: t, c: colorAt(c), x: c[0] });
      }
    }
    tris.sort((p, q) => p.x - q.x);
    // Runs of one color along the row become one piece (a trapezoid, or a triangle).
    for (let k = 0; k < tris.length;) {
      let e = k;
      while (e + 1 < tris.length && tris[e + 1]!.c === tris[k]!.c) e++;
      const pts = tris.slice(k, e + 1).flatMap((t) => t.poly);
      const xs = (y: number) => pts.filter((p) => Math.abs(p[1] - y) < 1e-9).map((p) => p[0]);
      const [top, bot] = [xs(y0), xs(y1)];
      const poly: P[] = [
        [Math.min(...top), y0],
        ...(Math.max(...top) - Math.min(...top) > 1e-9 ? [[Math.max(...top), y0] as P] : []),
        [Math.max(...bot), y1],
        ...(Math.max(...bot) - Math.min(...bot) > 1e-9 ? [[Math.min(...bot), y1] as P] : []),
      ];
      out.push({ poly, c: tris[k]!.c });
      k = e + 1;
    }
  }
  return out;
}

/** Ray casting: is `p` inside the polygon `poly`? */
function inside(poly: P[], [x, y]: P) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
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
