// Built-in EPP shapes and rosettes (spec 027 US5, spec 050 US3). Outlines in units, centered on
// their centroid, counter-clockwise on screen. Deterministic ids (`rrquilts.epp-<name>`).
import { centroid, edges, lerp, orient, rot, type Poly } from '@/model/epp/geometry';
import type { Fill } from '@/model/schema/coloring';
import type { EppShape, Rosette, RosettePiece } from '@/model/schema/epp';
import { add, mul, sub, type Pt } from '@/model/geometry/path';

const RAD = Math.PI / 180;

/** Corners from edge lengths and the turn after each edge (degrees), centered. */
function turtle(lengths: number[], turns: number[]): Poly {
  let p: Pt = [0, 0];
  let h = 0;
  const pts: Pt[] = [];
  lengths.forEach((L, i) => {
    pts.push(p);
    p = add(p, [L * Math.cos(h * RAD), L * Math.sin(h * RAD)]);
    h += turns[i]!;
  });
  const c = centroid(pts);
  return orient(pts.map((v) => sub(v, c)));
}
const regular = (n: number) => turtle(Array(n).fill(1), Array(n).fill(360 / n));

/**
 * Starter shapes (owner, 2026-11-10). Jewel: a gem of edges 1, 1, 2, 2, 1 (point 60°, other
 * corners 120°). Honeycomb: six 1U edges with 90° end corners (the rest 135°); Elongated Hexagon:
 * the same with its two long sides 2U. Half Square: its long edge is √2, marked.
 */
/** Hexi Kite (owner, 2026-11-10; first called Kite): from a 2U hexagon, its center, an edge's midpoint, the next
 *  corner and the next midpoint. Short edges 1U, long edges √3 (marked); corners 60°, 90°, 120°. */
function kite(): Poly {
  const pts: Pt[] = [
    [0, 0],
    [1.5, -S3 / 2],
    [2, 0],
    [1.5, S3 / 2],
  ];
  const c = centroid(orient(pts));
  return orient(pts.map((v) => sub(v, c)));
}
const S3 = Math.sqrt(3);

const STARTER_SHAPES: { name: string; category: string; outline: Poly; marked?: number[] }[] = [
  { name: 'Hexagon', category: 'Hexagons', outline: regular(6) },
  { name: 'Half Hexagon', category: 'Hexagons', outline: turtle([2, 1, 1, 1], [120, 60, 60, 120]) },
  {
    name: 'Honeycomb',
    category: 'Hexagons',
    outline: turtle([1, 1, 1, 1, 1, 1], [45, 45, 90, 45, 45, 90]),
  },
  {
    name: 'Elongated Hexagon',
    category: 'Hexagons',
    outline: turtle([1, 2, 1, 1, 2, 1], [45, 45, 90, 45, 45, 90]),
  },
  { name: 'Triangle', category: 'Triangles', outline: regular(3) },
  {
    name: 'Half Square',
    category: 'Triangles',
    outline: turtle([1, 1, Math.SQRT2], [90, 135, 135]),
  },
  { name: 'Square', category: 'Squares', outline: regular(4) },
  { name: '60° Diamond', category: 'Diamonds', outline: turtle([1, 1, 1, 1], [120, 60, 120, 60]) },
  { name: '45° Diamond', category: 'Diamonds', outline: turtle([1, 1, 1, 1], [135, 45, 135, 45]) },
  { name: 'Hexi Kite', category: 'Diamonds', outline: kite() },
  { name: 'Jewel', category: 'Diamonds', outline: turtle([1, 1, 2, 2, 1], [60, 60, 120, 60, 60]) },
  { name: 'Pentagon', category: 'Polygons', outline: regular(5) },
  { name: 'Octagon', category: 'Polygons', outline: regular(8) },
];
// Marked edges (not whole units), found by length so they follow the outline's order.
for (const s of STARTER_SHAPES) {
  const m = edges(s.outline).flatMap(([a, b], i) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return Math.abs(L - Math.round(L)) > 1e-6 ? [i] : [];
  });
  if (m.length) s.marked = m;
}

const AUTHOR = 'RRQuilts contributors';
const LICENSE = 'PDM-1.0';
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/°/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const shapeId = (name: string) => `rrquilts.epp-${slug(name)}`;
/** A built-in color, by name (see STARTER_COLORS). */
const color = (name: string): Fill => ({ color: `rrquilts.${slug(name)}` });

export const EPP_CATEGORIES = [
  'EPP',
  'EPP/Hexagons',
  'EPP/Triangles',
  'EPP/Squares',
  'EPP/Diamonds',
  'EPP/Polygons',
  'EPP/Rosettes',
];

function rosette(name: string, pieces: Omit<RosettePiece, 'id'>[], fills: Fill[][]): Rosette {
  const ps = pieces.map((p, i) => ({ ...p, id: `p${i + 1}` }));
  return {
    id: shapeId(name),
    notecard: { name },
    author: AUTHOR,
    license: LICENSE,
    pieces: ps,
    colorings: fills.map((f, k) => ({
      id: `c${k + 1}`,
      name: `Coloring ${k + 1}`,
      fills: Object.fromEntries(ps.map((p, i) => [p.id, f[i % f.length]!])),
    })),
  };
}

export function eppStarters(): {
  shapes: (EppShape & { category: string })[];
  rosettes: Rosette[];
} {
  const shapes = STARTER_SHAPES.map((s) => ({
    id: shapeId(s.name),
    notecard: { name: s.name },
    author: AUTHOR,
    license: LICENSE,
    outline: s.outline,
    ...(s.marked ? { marked: s.marked } : {}),
    category: s.category,
  }));
  const hexId = shapeId('Hexagon');
  const hex = STARTER_SHAPES[0]!.outline;
  // Neighbors' centers: twice each edge's middle.
  const across = edges(hex).map(([a, b]) => mul(lerp(a, b, 0.5), 2));
  const at = (p: Pt) => ({ shape: hexId, at: p, turn: 0, scale: 1 });
  const ring2: Pt[] = [];
  for (const c of across)
    for (const e of across) {
      const p = add(c, e);
      if (Math.hypot(p[0], p[1]) < 0.1) continue;
      if ([...across, ...ring2].some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-3)) continue;
      ring2.push(p);
    }
  const flower = rosette(
    'Hexagon Flower',
    [at([0, 0]), ...across.map(at)],
    [
      [color('Yellow'), ...Array(6).fill(color('Orange'))],
      [color('Butter'), ...Array(6).fill(color('Sky'))],
    ],
  );
  const double = rosette(
    'Double Flower',
    [at([0, 0]), ...across.map(at), ...ring2.map(at)],
    [[color('Yellow'), ...Array(6).fill(color('Red')), ...Array(12).fill(color('Green'))]],
  );
  // Six diamonds whose sharp corners meet in the middle.
  const dia = STARTER_SHAPES.find((s) => s.name === '60° Diamond')!.outline;
  const ang = (i: number) => {
    const n = dia.length;
    const a = sub(dia[(i - 1 + n) % n]!, dia[i]!);
    const b = sub(dia[(i + 1) % n]!, dia[i]!);
    return Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) / RAD;
  };
  const sharp = dia.findIndex((_, i) => Math.abs(ang(i) - 60) < 1);
  const blunt = (sharp + 1) % dia.length;
  const around = (corner: Pt, k: number, step: number) =>
    Array.from({ length: k }, (_, i) => ({
      shape: shapeId('60° Diamond'),
      at: mul(rot(corner, step * i * RAD), -1),
      turn: step * i,
      scale: 1,
    }));
  const star = rosette('Six-Diamond Star', around(dia[sharp]!, 6, 60), [
    [color('Navy'), color('Sky')],
  ]);
  const tumbling = rosette('Tumbling Block', around(dia[blunt]!, 3, 120), [
    [color('Cream'), color('Orange'), color('Charcoal')],
  ]);
  // Octagon and square: an octagon with a square on a slanted side, turned to sit on it.
  const oct = STARTER_SHAPES.find((s) => s.name === 'Octagon')!.outline;
  const [a, b] = edges(oct).find(
    ([p, q]) => Math.abs(p[0] - q[0]) > 1e-6 && Math.abs(p[1] - q[1]) > 1e-6,
  )!;
  const out = mul(lerp(a, b, 0.5), 1 + 0.5 / Math.hypot(...lerp(a, b, 0.5)));
  const turnSq = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const octSquare = rosette(
    'Octagon and Square',
    [
      { shape: shapeId('Octagon'), at: [0, 0], turn: 0, scale: 1 },
      { shape: shapeId('Square'), at: out, turn: turnSq, scale: 1 },
    ],
    [[color('Teal'), color('Cream')]],
  );
  return { shapes, rosettes: [flower, double, star, tumbling, octSquare] };
}
