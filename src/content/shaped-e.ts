// Shaped blocks, batch E: 60° triangle blocks (designs drawn for RRQuilts). Most sit on a triangle
// lattice, so they sew in straight rows of triangles; Three Kites and Triangle Pinwheel are the
// exceptions (a set-in and a partial seam).
import { corners, lerp, type P, type ShapedDef, type ShapedPiece } from './shaped-kit';

const [A, B, C] = corners('triangle') as [P, P, P]; // top, bottom right, bottom left
const add = (p: P, q: P, t = 1): P => [p[0] + q[0] * t, p[1] + q[1] * t];
const sub = (p: P, q: P): P => [p[0] - q[0], p[1] - q[1]];
const O: P = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];

/** Where the line a-b meets the line c-d. */
function meet([a, b]: [P, P], [c, d]: [P, P]): P {
  const [r, s] = [sub(b, a), sub(d, c)];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
  return add(a, r, t);
}

/** Lattice point (i toward B, j toward C) of a triangle cut into n rows. */
const pt = (n: number, i: number, j: number): P => add(add(A, sub(B, A), i / n), sub(C, A), j / n);

/** Every small triangle of an n-row lattice, colored by `color(i, j, up)`: up triangles point to
 *  the top corner (row i + j from the top), down triangles sit between them. */
function lattice(n: number, color: (i: number, j: number, up: boolean) => string): ShapedPiece[] {
  const out: ShapedPiece[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; i + j < n; j++) {
      out.push({ poly: [pt(n, i, j), pt(n, i + 1, j), pt(n, i, j + 1)], c: color(i, j, true) });
      if (i + j < n - 1)
        out.push({
          poly: [pt(n, i + 1, j), pt(n, i + 1, j + 1), pt(n, i, j + 1)],
          c: color(i, j, false),
        });
    }
  return out;
}

/** Rows of a lattice triangle: how far it is from the nearest side (0 = on the edge). */
const ring = (n: number, i: number, j: number, up: boolean) =>
  up ? Math.min(i, j, n - 1 - i - j) : Math.min(i, j, n - 2 - i - j) + 0.5;

/** The small triangles around lattice point (ci, cj), and those sharing an edge with them. */
function star(n: number, ci: number, cj: number) {
  const tri = (i: number, j: number, up: boolean): [number, number][] =>
    up
      ? [
          [i, j],
          [i + 1, j],
          [i, j + 1],
        ]
      : [
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ];
  const has = (t: [number, number][], p: [number, number]) =>
    t.some(([a, b]) => a === p[0] && b === p[1]);
  const hex = new Set<string>();
  const all: { key: string; t: [number, number][] }[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; i + j < n; j++)
      for (const up of [true, false]) {
        if (!up && i + j >= n - 1) continue;
        const t = tri(i, j, up);
        const key = `${i},${j},${up}`;
        all.push({ key, t });
        if (has(t, [ci, cj])) hex.add(key);
      }
  const hexTris = all.filter((x) => hex.has(x.key));
  const points = new Set(
    all
      .filter(
        (x) => !hex.has(x.key) && hexTris.some((h) => x.t.filter((p) => has(h.t, p)).length === 2),
      )
      .map((x) => x.key),
  );
  return (i: number, j: number, up: boolean) => {
    const key = `${i},${j},${up}`;
    return hex.has(key) ? 'hex' : points.has(key) ? 'point' : '';
  };
}

const RAIL = ['D', 'N', 'M', 'L'];
const starAt = star(6, 2, 2);
/** A Sierpinski gasket `depth` steps deep: each step leaves the middle (upside down, light) as one
 *  piece and repeats in the three corners; the smallest corners are dark. */
function sierpinski(a: P, b: P, c: P, depth: number): ShapedPiece[] {
  if (depth === 0) return [{ poly: [a, b, c], c: 'D' }];
  const [ab, bc, ca] = [lerp(a, b, 0.5), lerp(b, c, 0.5), lerp(c, a, 0.5)];
  return [
    { poly: [ab, bc, ca], c: 'L' },
    ...sierpinski(a, ab, ca, depth - 1),
    ...sierpinski(ab, b, bc, depth - 1),
    ...sierpinski(ca, bc, c, depth - 1),
  ];
}

/** A triangle inside another, its corners a third of the way along each side (turned). */
function twist(a: P, b: P, c: P): [P, P, P] {
  return [lerp(a, b, 1 / 3), lerp(b, c, 1 / 3), lerp(c, a, 1 / 3)];
}
const [X1, Y1, Z1] = twist(A, B, C);
const [X2, Y2, Z2] = twist(X1, Y1, Z1);

// Arrowhead Strips: each half (split down the middle) striped along its outer side.
const M: P = lerp(B, C, 0.5);
const arrowHalf = (corner: P, cs: string[]): ShapedPiece[] => {
  const q = (k: number) => lerp(M, A, k / cs.length);
  const p = (k: number) => lerp(M, corner, k / cs.length);
  return cs.map((c, k) => ({
    poly: k === 0 ? [M, p(1), q(1)] : [q(k), p(k), p(k + 1), q(k + 1)],
    c,
  }));
};

// Triangle Pinwheel: a small center triangle, each side carried on to the outside.
const [a, b, c] = [A, B, C].map((v) => lerp(O, v, 0.35)) as [P, P, P];
const pa = meet([c, a], [A, B]);
const pb = meet([a, b], [B, C]);
const pc = meet([b, c], [C, A]);

// --- Beyond the lattice: fans, strips, a frame, a picture --------------------------------------

const MAB = lerp(A, B, 0.5);
const MCA = lerp(C, A, 0.5);
const MBC = lerp(B, C, 0.5);

/** A fan of wedges from `hub` along the path `path`, each leg cut into `parts`. */
function fan(hub: P, path: P[], parts: number, cs: string[]): ShapedPiece[] {
  const stops = path.flatMap((p, k) =>
    k === 0 ? [p] : Array.from({ length: parts }, (_, i) => lerp(path[k - 1]!, p, (i + 1) / parts)),
  );
  return stops
    .slice(0, -1)
    .map((p, k) => ({ poly: [hub, p, stops[k + 1]!], c: cs[k % cs.length]! }));
}

// Framed Triangle: a center triangle, then one round of strips in log cabin order.
const inner = [A, B, C].map((v) => lerp(O, v, 0.5)) as [P, P, P];
const line = (p: P, q: P): [P, P] => [p, q];
const frame: ShapedPiece[] = (() => {
  const [a, b, c] = inner;
  // First strip on the bottom (b-c), then the left (c-a) over its end, then the right over both.
  const s1: P[] = [b, c, meet(line(c, a), line(B, C)), meet(line(a, b), line(B, C))];
  const s2: P[] = [c, a, meet(line(a, b), line(C, A)), C, meet(line(c, a), line(B, C))];
  const s3: P[] = [a, b, meet(line(a, b), line(B, C)), B, A, meet(line(a, b), line(C, A))];
  return [
    { poly: inner, c: 'K' },
    { poly: s1, c: 'N' },
    { poly: s2, c: 'M' },
    { poly: s3, c: 'D' },
  ];
})();

// Slanted Rails: stripes parallel to the left side, from the left side to the bottom right corner.
const slanted: ShapedPiece[] = ['D', 'L', 'N', 'L', 'M'].map((c, k, all) => {
  const t0 = k / all.length;
  const t1 = (k + 1) / all.length;
  const p0 = lerp(A, B, t0); // on the right side
  const q0 = lerp(C, B, t0); // on the bottom
  const p1 = lerp(A, B, t1);
  const q1 = lerp(C, B, t1);
  return { poly: k === all.length - 1 ? [p0, B, q0] : [p0, p1, q1, q0], c };
});

// Sailboat: water along the bottom, the hull in the next row, two sails split by the mast.
const sail: ShapedPiece[] = (() => {
  const row = (t: number): [P, P] => [lerp(A, C, t), lerp(A, B, t)]; // left, right at height t
  const [w0l, w0r] = row(1);
  const [w1l, w1r] = row(0.84);
  const [h1l, h1r] = row(0.68);
  const hull = (t: number, k: number): P => lerp(...row(t), k);
  const mast = hull(0.68, 0.55);
  return [
    { poly: [w1l, w1r, w0r, w0l], c: 'N' },
    { poly: [h1l, hull(0.68, 0.2), hull(0.84, 0.3), w1l], c: 'L' },
    { poly: [hull(0.68, 0.2), hull(0.68, 0.85), hull(0.84, 0.75), hull(0.84, 0.3)], c: 'D' },
    { poly: [hull(0.68, 0.85), h1r, w1r, hull(0.84, 0.75)], c: 'L' },
    // Above the hull: left of the mast a mainsail, right of it a jib.
    { poly: [h1l, hull(0.68, 0.25), A], c: 'L' },
    { poly: [hull(0.68, 0.25), mast, A], c: 'K' },
    { poly: [mast, hull(0.68, 0.8), A], c: 'M' },
    { poly: [hull(0.68, 0.8), h1r, A], c: 'L' },
  ];
})();

// Spike Star: three long kites from the center to the corners, background triangles between.
const spikeQ = (m: P) => lerp(O, m, 0.5);
const spikes: ShapedPiece[] = [
  { poly: [O, spikeQ(MAB), A, spikeQ(MCA)], c: 'K' },
  { poly: [O, spikeQ(MBC), B, spikeQ(MAB)], c: 'K' },
  { poly: [O, spikeQ(MCA), C, spikeQ(MBC)], c: 'K' },
  { poly: [A, B, spikeQ(MAB)], c: 'L' },
  { poly: [B, C, spikeQ(MBC)], c: 'L' },
  { poly: [C, A, spikeQ(MCA)], c: 'L' },
];

export const SHAPED_E: ShapedDef[] = [
  {
    // The triangle cut into four: three corners and an upside-down center.
    name: 'Four Triangles',
    shape: 'triangle',
    leg: 6,
    category: 'Basics',
    pieces: lattice(2, (i, j, up) => (!up ? 'K' : i === 0 && j === 0 ? 'N' : i ? 'M' : 'S')),
  },
  {
    // Nine triangles: dark corners, light middles, medium between.
    name: 'Triangle Nine-Patch',
    shape: 'triangle',
    leg: 6,
    category: 'N-Patch/Nine-patch',
    pieces: lattice(3, (i, j, up) =>
      !up ? 'L' : (i === 0 && j === 0) || i === 2 || j === 2 ? 'D' : 'M',
    ),
  },
  {
    // Rings of triangles from the edge in: dark outside, light in the middle.
    name: 'Trip Around the Triangle',
    shape: 'triangle',
    leg: 8,
    category: 'Mosaics',
    pieces: lattice(
      6,
      (i, j, up) => ['D', 'N', 'K', 'M', 'L', 'P'][Math.floor(ring(6, i, j, up) * 2)]!,
    ),
  },
  {
    // Up triangles in turn through four colors, the down triangles light.
    name: 'Thousand Pyramids',
    shape: 'triangle',
    leg: 8,
    category: 'Mosaics',
    pieces: lattice(6, (i, j, up) => (up ? ['N', 'K', 'S', 'P'][(i * 3 + j * 2) % 4]! : 'L')),
  },
  {
    // A Sierpinski gasket three steps deep: each light gap is one piece, 27 dark corners.
    name: 'Sierpinski Triangle',
    shape: 'triangle',
    leg: 8,
    category: 'Mosaics',
    pieces: sierpinski(A, B, C, 3),
  },
  {
    // Six triangles round the middle make a hexagon; three corners finish the triangle.
    name: 'Hexagon Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Mosaics',
    pieces: [
      {
        poly: [pt(3, 1, 0), pt(3, 2, 0), pt(3, 2, 1), pt(3, 1, 2), pt(3, 0, 2), pt(3, 0, 1)],
        c: 'N',
      },
      { poly: [pt(3, 0, 0), pt(3, 1, 0), pt(3, 0, 1)], c: 'L' },
      { poly: [pt(3, 2, 0), pt(3, 3, 0), pt(3, 2, 1)], c: 'L' },
      { poly: [pt(3, 0, 2), pt(3, 1, 2), pt(3, 0, 3)], c: 'L' },
    ],
  },
  {
    // A six-point star on the triangle lattice, gold points round a red center.
    name: 'Triangle Star',
    shape: 'triangle',
    leg: 8,
    category: 'Stars',
    pieces: lattice(6, (i, j, up) => {
      const s = starAt(i, j, up);
      return s === 'hex' ? 'K' : s === 'point' ? 'P' : 'L';
    }),
  },
  {
    // Strips across, dark at the bottom to light at the tip.
    name: 'Rail Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Strips/Strips',
    pieces: RAIL.map((col, k) => {
      const t0 = k / 4;
      const t1 = (k + 1) / 4;
      const row = (t: number): [P, P] => [lerp(A, B, t), lerp(A, C, t)];
      const [b1, c1] = row(1 - t0);
      const [b0, c0] = row(1 - t1);
      return { poly: k === 3 ? [A, b1, c1] : [b0, b1, c1, c0], c: col };
    }),
  },
  {
    // Rows of geese: up triangles shade from dark at the bottom to light at the top.
    name: 'Flying Geese Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Strips/Strips',
    pieces: lattice(4, (i, j, up) => (up ? ['P', 'K', 'N', 'D'][i + j]! : 'L')),
  },
  {
    // Split down the middle, each half striped along its side: nested arrowheads.
    name: 'Arrowhead Strips',
    shape: 'triangle',
    leg: 6,
    category: 'Strips/Strips',
    pieces: [...arrowHalf(B, ['D', 'L', 'N', 'L']), ...arrowHalf(C, ['D', 'L', 'N', 'L'])],
  },
  {
    // A triangle set in turned, and another inside that: each piece sews on with one seam.
    name: 'Twisted Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Medallions',
    pieces: [
      { poly: [A, X1, Z1], c: 'N' },
      { poly: [B, Y1, X1], c: 'D' },
      { poly: [C, Z1, Y1], c: 'S' },
      { poly: [X1, X2, Z2], c: 'M' },
      { poly: [Y1, Y2, X2], c: 'L' },
      { poly: [Z1, Z2, Y2], c: 'Q' },
      { poly: [X2, Y2, Z2], c: 'K' },
    ],
  },
  {
    // A tree in rows of triangles: gold star on top, green rows, a dark trunk.
    name: 'Christmas Tree',
    shape: 'triangle',
    leg: 8,
    category: 'Images/Plants',
    pieces: lattice(5, (i, j, up) => {
      const row = i + j;
      if (row === 0) return up ? 'P' : 'S';
      if (row === 4) return up && i === 2 ? 'D' : 'L';
      const ornament = up && row === 3 && i === 1;
      return ornament ? 'K' : up ? 'S' : row === 3 ? 'L' : 'S';
    }),
  },
  {
    // Three kites meet in the middle: a set-in (Y) seam at the center.
    name: 'Three Kites',
    shape: 'triangle',
    leg: 6,
    category: 'Stars',
    pieces: [
      { poly: [A, lerp(A, B, 0.5), O, lerp(A, C, 0.5)], c: 'K' },
      { poly: [B, lerp(B, C, 0.5), O, lerp(A, B, 0.5)], c: 'P' },
      { poly: [C, lerp(A, C, 0.5), O, lerp(B, C, 0.5)], c: 'S' },
    ],
  },
  {
    // Three pieces whirl round a small center triangle (a partial seam closes the round).
    name: 'Triangle Pinwheel',
    shape: 'triangle',
    leg: 6,
    category: 'Basics',
    pieces: [
      { poly: [a, b, c], c: 'L' },
      { poly: [pa, B, pb, b, a], c: 'N' },
      { poly: [pb, C, pc, c, b], c: 'D' },
      { poly: [pc, A, pa, a, c], c: 'M' },
    ],
  },
  {
    // Rays fan out from the middle of the bottom edge to both sides and the tip.
    name: 'Sunburst Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Basics',
    pieces: fan(MBC, [B, A, C], 3, ['P', 'K', 'Q', 'K']),
  },
  {
    // A peacock's tail: feathers fan from the top point to the bottom edge.
    name: 'Peacock Fan',
    shape: 'triangle',
    leg: 6,
    category: 'Images/Animals',
    pieces: fan(A, [C, B], 5, ['S', 'N', 'D', 'N', 'S']),
  },
  {
    // A center triangle framed by three strips, each over the end of the one before.
    name: 'Framed Triangle',
    shape: 'triangle',
    leg: 6,
    category: 'Medallions',
    pieces: frame,
  },
  {
    // Stripes parallel to one side, narrowing to the far corner.
    name: 'Slanted Rails',
    shape: 'triangle',
    leg: 6,
    category: 'Strips/Strips',
    pieces: slanted,
  },
  {
    // Water, a hull, and two sails either side of the mast.
    name: 'Sailboat',
    shape: 'triangle',
    leg: 8,
    category: 'Images',
    pieces: sail,
  },
  {
    // Three long spikes meet in the middle: a set-in (Y) seam at the center.
    name: 'Spike Star',
    shape: 'triangle',
    leg: 6,
    category: 'Stars',
    pieces: spikes,
  },
];
