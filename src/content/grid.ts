// Built-in blocks drawn as pieces on an n × n grid (traditional designs, drawn for RRQuilts), turned
// into seam lines and sample points for their default coloring. Shared by the block families.
export type P = [number, number];
type Seam = [P, P];

/** A piece: its outline (grid units) and a color letter (see `COLORS`). */
export interface Piece {
  poly: P[];
  c: string;
}

/** A block: name, finished size (inches), grid, pieces; `open` grid edges merge the pieces across. */
export interface GridDef {
  name: string;
  size: number;
  n: number;
  pieces: Piece[];
  /** Grid edges with no seam: "v c r" (x = c, y from r to r + 1) or "h c r" (y = r, x from c to c + 1). */
  open?: string;
}

/** Color letters → built-in color names: light, light/medium/dark grays, accent, three "prints". */
export const COLORS: Record<string, string> = {
  L: 'Cream',
  M: 'Sky',
  N: 'Denim',
  D: 'Indigo',
  K: 'Red',
  P: 'Gold',
  Q: 'Rose',
  S: 'Teal',
};

export const rect = (c: number, r: number, w: number, h: number, color: string): Piece => ({
  poly: [
    [c, r],
    [c + w, r],
    [c + w, r + h],
    [c, r + h],
  ],
  c: color,
});
export const sq = (c: number, r: number, color: string, s = 1) => rect(c, r, s, s, color);

/**
 * Half-square triangles: `/` splits a cell from its top-right to bottom-left corner (`a` upper
 * left, `b` lower right); `\` from top-left to bottom-right (`a` upper right, `b` lower left).
 */
export function hst(c: number, r: number, diag: '/' | '\\', a: string, b: string, s = 1): Piece[] {
  const [tl, tr, br, bl]: [P, P, P, P] = [
    [c, r],
    [c + s, r],
    [c + s, r + s],
    [c, r + s],
  ];
  return diag === '/'
    ? [
        { poly: [tl, tr, bl], c: a },
        { poly: [tr, br, bl], c: b },
      ]
    : [
        { poly: [tl, tr, br], c: a },
        { poly: [tl, br, bl], c: b },
      ];
}

/** Quarter-square triangles (hourglass): colors of the top, right, bottom, and left triangles. */
export function qst(c: number, r: number, s: number, t: string, ri: string, b: string, l: string) {
  const [tl, tr, br, bl, m]: [P, P, P, P, P] = [
    [c, r],
    [c + s, r],
    [c + s, r + s],
    [c, r + s],
    [c + s / 2, r + s / 2],
  ];
  return [
    { poly: [tl, tr, m], c: t },
    { poly: [tr, br, m], c: ri },
    { poly: [br, bl, m], c: b },
    { poly: [bl, tl, m], c: l },
  ];
}

/** Square in a square: a diamond (corners at the edge midpoints) and four corner triangles. */
export function sqInSq(c: number, r: number, s: number, corners: string, center: string): Piece[] {
  const [tl, tr, br, bl] =
    corners.length === 4 ? [...corners] : [corners, corners, corners, corners];
  const [t, ri, b, l]: [P, P, P, P] = [
    [c + s / 2, r],
    [c + s, r + s / 2],
    [c + s / 2, r + s],
    [c, r + s / 2],
  ];
  return [
    { poly: [[c, r], t, l], c: tl! },
    { poly: [t, [c + s, r], ri], c: tr! },
    { poly: [ri, [c + s, r + s], b], c: br! },
    { poly: [b, [c, r + s], l], c: bl! },
    { poly: [t, ri, b, l], c: center },
  ];
}

/**
 * A triangle with its base along one side of a w × h rectangle and its tip at the middle of the
 * opposite side (a flying goose, or a star point), plus the two side pieces. `dir` is where the tip
 * points.
 */
export function goose(
  c: number,
  r: number,
  w: number,
  h: number,
  dir: '^' | 'v' | '<' | '>',
  tip: string,
  side: string,
): Piece[] {
  const [tl, tr, br, bl]: [P, P, P, P] = [
    [c, r],
    [c + w, r],
    [c + w, r + h],
    [c, r + h],
  ];
  const m: P =
    dir === '^'
      ? [c + w / 2, r]
      : dir === 'v'
        ? [c + w / 2, r + h]
        : dir === '<'
          ? [c, r + h / 2]
          : [c + w, r + h / 2];
  const [tip3, s1, s2]: [P[], P[], P[]] =
    dir === '^'
      ? [
          [bl, br, m],
          [tl, m, bl],
          [m, tr, br],
        ]
      : dir === 'v'
        ? [
            [tl, tr, m],
            [tl, m, bl],
            [tr, br, m],
          ]
        : dir === '<'
          ? [
              [tr, br, m],
              [tl, tr, m],
              [m, br, bl],
            ]
          : [
              [tl, bl, m],
              [tl, tr, m],
              [m, br, bl],
            ];
  return [
    { poly: tip3, c: tip },
    { poly: s1, c: side },
    { poly: s2, c: side },
  ];
}

/** Ray ends from a cell's center, clockwise from the top: t, tr, r, br, b, bl, l, tl. */
const RAY: P[] = [
  [0.5, 0],
  [1, 0],
  [1, 0.5],
  [1, 1],
  [0.5, 1],
  [0, 1],
  [0, 0.5],
  [0, 0],
];
const CORNER = new Set([1, 3, 5, 7]);

/**
 * A cell cut by seams from its center (`bits`: which of the eight rays, clockwise from the top, are
 * seams) into wedges colored in order, starting with the wedge clockwise after the first seam.
 */
function rays(c: number, r: number, s: number, bits: string, colors: string): Piece[] {
  const on = [...bits].map((b, i) => (b === '1' ? i : -1)).filter((i) => i >= 0);
  const at = (i: number): P => [c + RAY[i]![0] * s, r + RAY[i]![1] * s];
  const m: P = [c + s / 2, r + s / 2];
  return on.map((i, k) => {
    const j = on[(k + 1) % on.length]!;
    const span = (j - i + 8) % 8 || 8;
    const corners = Array.from({ length: span - 1 }, (_, d) => (i + 1 + d) % 8).filter((x) =>
      CORNER.has(x),
    );
    return { poly: [m, at(i), ...corners.map(at), at(j)], c: colors[k]! };
  });
}

/**
 * Rows of cells, one token each, optionally prefixed with a size in cells (`2D` is a 2 × 2 square):
 * a color letter is a square, `/XY` or `\XY` a half-square triangle (see `hst`), `xTRBL` quarter-
 * square triangles, `oXY` / `oABCDE` a square in a square (corners, then the diamond), `*bits.colors`
 * seams from the center (see `rays`), `.` a cell covered by a bigger piece.
 */
export const cells = (rows: string[], dx = 0, dy = 0): Piece[] =>
  rows.flatMap((row, r) =>
    row
      .trim()
      .split(/\s+/)
      .flatMap((raw, c0) => {
        const m = /^(\d*)(.*)$/.exec(raw)!;
        const s = Number(m[1] || 1);
        const tok = m[2]!;
        const [c, rr] = [c0 + dx, r + dy];
        if (tok === '.') return [];
        if (tok.length === 1) return [sq(c, rr, tok, s)];
        if (tok[0] === 'x') return qst(c, rr, s, tok[1]!, tok[2]!, tok[3]!, tok[4]!);
        if (tok[0] === 'o') return sqInSq(c, rr, s, tok.slice(1, -1), tok.at(-1)!);
        if (tok[0] === '*') {
          const [bits, colors] = tok.slice(1).split('.');
          return rays(c, rr, s, bits!, colors!);
        }
        return hst(c, rr, tok[0] as '/' | '\\', tok[1]!, tok[2]!, s);
      }),
  );

/**
 * Coarse cells drawn on a grid `k` times finer (pass `n: rows.length * k`), so cells can be cut in
 * half: tokens as in `cells` (scaled by `k`), plus `=XY` a cell cut across (X top, Y bottom) and
 * `|XY` cut down (X left, Y right). `.` = covered by a piece added separately (fine-grid units).
 */
export const halves = (rows: string[], k = 2): Piece[] =>
  rows.flatMap((row, r) =>
    row
      .trim()
      .split(/\s+/)
      .flatMap((tok, c) => {
        const [x, y, h] = [c * k, r * k, k / 2];
        if (tok[0] === '=') return [rect(x, y, k, h, tok[1]!), rect(x, y + h, k, h, tok[2]!)];
        if (tok[0] === '|') return [rect(x, y, h, k, tok[1]!), rect(x + h, y, h, k, tok[2]!)];
        return tok === '.' ? [] : cells([`${k}${tok}`], x, y);
      }),
  );

/** Four copies of a quadrant's pieces (built at 0,0), shifted to each quadrant of a 2h × 2h grid. */
export const quads = (h: number, pieces: Piece[]) =>
  [
    [0, 0],
    [h, 0],
    [0, h],
    [h, h],
  ].flatMap(([dx, dy]) =>
    pieces.map((p) => ({ ...p, poly: p.poly.map(([x, y]): P => [x + dx!, y + dy!]) })),
  );

const key = ([x, y]: P) => `${+x.toFixed(6)},${+y.toFixed(6)}`;
const area2 = (poly: P[]) =>
  poly.reduce((s, [x, y], i) => {
    const [u, v] = poly[(i + 1) % poly.length]!;
    return s + x * v - u * y;
  }, 0);

/** Each edge of `poly` split at the corners in `corners` that lie on it. */
function splitEdges(poly: P[], corners: P[]): [P, P][] {
  return poly.flatMap((a, i) => {
    const b = poly[(i + 1) % poly.length]!;
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const len2 = dx * dx + dy * dy;
    const ts = [
      0,
      1,
      ...corners
        .filter(([x, y]) => Math.abs((x - a[0]) * dy - (y - a[1]) * dx) < 1e-9)
        .map(([x, y]) => ((x - a[0]) * dx + (y - a[1]) * dy) / len2)
        .filter((t) => t > 1e-9 && t < 1 - 1e-9),
    ].sort((u, v) => u - v);
    return ts.slice(1).map((t, k): [P, P] => [
      [a[0] + dx * ts[k]!, a[1] + dy * ts[k]!],
      [a[0] + dx * t, a[1] + dy * t],
    ]);
  });
}

const allCorners = (pieces: Piece[]) => [
  ...new Map(pieces.flatMap((p) => p.poly).map((v) => [key(v), v])).values(),
];

/** Is segment a–b on one of the open grid edges? */
function onOpen(a: P, b: P, open: Set<string>) {
  const [x0, y0, x1, y1] = [a[0], a[1], b[0], b[1]];
  if (Math.abs(x0 - x1) < 1e-9 && Number.isInteger(x0)) {
    const r = Math.floor(Math.min(y0, y1) + 1e-9);
    return Math.max(y0, y1) <= r + 1 + 1e-9 && open.has(`v ${x0} ${r}`);
  }
  if (Math.abs(y0 - y1) < 1e-9 && Number.isInteger(y0)) {
    const c = Math.floor(Math.min(x0, x1) + 1e-9);
    return Math.max(x0, x1) <= c + 1 + 1e-9 && open.has(`h ${c} ${y0}`);
  }
  return false;
}

/** Pieces sharing a stretch of an open grid edge become one piece (their union). */
export function mergeOpen(pieces: Piece[], openList = ''): Piece[] {
  const open = new Set(
    openList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  if (!open.size) return pieces;
  const corners = allCorners(pieces);
  // Clockwise (screen) outlines, edges split at every corner.
  const outlines = pieces.map((p) => (area2(p.poly) < 0 ? [...p.poly].reverse() : p.poly));
  const edges = outlines.map((poly) => splitEdges(poly, corners));
  const parent = pieces.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const owner = new Map<string, number>();
  edges.forEach((es, i) =>
    es.forEach(([a, b]) => {
      const k = [key(a), key(b)].sort().join('|');
      const j = owner.get(k);
      if (j === undefined) owner.set(k, i);
      else if (onOpen(a, b, open)) parent[find(i)] = find(j);
    }),
  );
  const groups = new Map<number, number[]>();
  pieces.forEach((_, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), i]));
  return [...groups.values()].map((ids) => {
    if (ids.length === 1) return pieces[ids[0]!]!;
    // Boundary = edges whose reverse isn't in the group; chain them into one outline.
    const all = ids.flatMap((i) => edges[i]!);
    const keys = new Set(all.map(([a, b]) => `${key(a)}>${key(b)}`));
    const next = new Map<string, P>();
    const pts = new Map<string, P>();
    for (const [a, b] of all)
      if (!keys.has(`${key(b)}>${key(a)}`)) {
        next.set(key(a), b);
        pts.set(key(a), a);
      }
    const start = [...pts.values()][0]!;
    const poly: P[] = [start];
    for (let p = next.get(key(start))!; key(p) !== key(start); p = next.get(key(p))!) poly.push(p);
    // Drop corners where the outline runs straight on.
    const clean = poly.filter((p, i) => {
      const a = poly[(i + poly.length - 1) % poly.length]!;
      const b = poly[(i + 1) % poly.length]!;
      return Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) > 1e-9;
    });
    return { poly: clean, c: pieces[ids[0]!]!.c };
  });
}

/** Piece outlines → seam lines (edges split where other corners lie on them, each once). */
function seamsOf(pieces: Piece[], n: number): Seam[] {
  const corners = allCorners(pieces);
  const seen = new Set<string>();
  const out: Seam[] = [];
  for (const { poly } of pieces)
    for (const [p, q] of splitEdges(poly, corners)) {
      const id = [key(p), key(q)].sort().join('|');
      if (seen.has(id)) continue;
      seen.add(id);
      out.push([
        [p[0] / n, p[1] / n],
        [q[0] / n, q[1] / n],
      ]);
    }
  return out;
}

/** A point inside a piece: its centroid if inside, else the middle of its fattest triangle. */
function inside(poly: P[]): P {
  const [sx, sy] = poly.reduce(([x, y], [px, py]) => [x + px, y + py], [0, 0]);
  const c: P = [sx / poly.length, sy / poly.length];
  let isIn = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > c[1] !== yj > c[1] && c[0] < ((xj - xi) * (c[1] - yi)) / (yj - yi) + xi) isIn = !isIn;
  }
  if (isIn) return c;
  // Ear: the convex corner triangle with the largest area (fine for these simple outlines).
  let best: P = c;
  let bestA = -1;
  poly.forEach((b, i) => {
    const a = poly[(i + poly.length - 1) % poly.length]!;
    const d = poly[(i + 1) % poly.length]!;
    const ar = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]);
    if (Math.abs(ar) > bestA && Math.sign(ar) === Math.sign(area2(poly))) {
      bestA = Math.abs(ar);
      best = [(a[0] + b[0] + d[0]) / 3, (a[1] + b[1] + d[1]) / 3];
    }
  });
  return best;
}

/** Blocks as seams (normalized) and sample points with color names, plus size and category. */
export const gridBlocks = (defs: GridDef[], category: string) =>
  defs.map((d) => {
    const pieces = mergeOpen(d.pieces, d.open);
    return {
      name: d.name,
      size: d.size,
      category,
      seams: seamsOf(pieces, d.n),
      points: pieces.map((p): [number, number, string] => {
        const [x, y] = inside(p.poly);
        return [x / d.n, y / d.n, COLORS[p.c]!];
      }),
      /** Color counts by letter (for checking against the source's cutting lists). */
      counts: pieces.reduce<Record<string, number>>(
        (m, p) => ({ ...m, [p.c]: (m[p.c] ?? 0) + 1 }),
        {},
      ),
    };
  });
