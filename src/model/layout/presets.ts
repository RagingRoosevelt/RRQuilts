// Layout styles as engine presets: stored layout parameters → Tiling (engine.ts).
import { apply, IDENTITY, invert, mul, type M } from '../geometry/affine';
import { fitShape, SHAPE_OUTLINE, type BlockShape } from '../blocks/shape';
import type { Pt } from '../geometry/path';
import type {
  HorizontalLayout,
  OnePatchLayout,
  OnPointLayout,
  ShapedBlocksLayout,
  StripLayout,
  StripStyle,
  TumblingLayout,
  VariablePointLayout,
} from '../schema/quilt';
import type { PathCommand } from '../schema/shared';
import { clipByLine, clipPolygon, toPath } from './clip';
import { mapPath, tile, TURNS, type Band, type CellPiece, type Tiling } from './engine';
import { squareBlocks, stripWidth } from './strips';
import { rectPath, type Bounds, type Slot, type SlotKind } from './slots';

const rect = (
  kind: SlotKind,
  w: number,
  h: number,
  x: number,
  y: number,
  id: CellPiece['id'],
  alt: CellPiece['alt'],
): CellPiece => ({
  kind,
  shape: 'rect',
  turns: w === h ? 90 : 180,
  size: [w, h],
  transform: [w, 0, 0, h, x, y],
  id,
  alt,
});

/** Rows × cols of blocks; sashes and cornerstones between them (and around, with a sash border). */
export function horizontal(l: HorizontalLayout): { tiling: Tiling; center: Bounds } {
  const [bw, bh] = l.block;
  const [sw, sh] = l.sash;
  const [S, T] = [bw + sw, bh + sh];
  const ox = l.sashBorder ? sw : 0;
  const oy = l.sashBorder ? sh : 0;
  // Sash k sits after block k; k = 0 is the leading sash border.
  const sashes = (n: number): [number, number] => (l.sashBorder ? [0, n] : [1, n - 1]);
  const cols: [number, number] = [0, l.cols - 1];
  const rows: [number, number] = [0, l.rows - 1];
  const band = (piece: CellPiece, i: [number, number], j: [number, number]): Band => ({
    cell: [piece],
    a: [S, 0],
    b: [0, T],
    i,
    j,
  });
  const bands: Band[] = [
    band(
      rect(
        'block',
        bw,
        bh,
        ox,
        oy,
        (i, j) => `b:r${j + 1}c${i + 1}`,
        (i, j) => (i + j) % 2,
      ),
      cols,
      rows,
    ),
  ];
  if (sw > 0)
    bands.push(
      band(
        rect(
          'sash',
          sw,
          bh,
          ox + bw - S,
          oy,
          (i, j) => `sash:v:r${j + 1}c${i}`,
          (i, j) => (i + j + 1) % 2,
        ),
        sashes(l.cols),
        rows,
      ),
    );
  if (sh > 0)
    bands.push(
      band(
        rect(
          'sash',
          bw,
          sh,
          ox,
          oy + bh - T,
          (i, j) => `sash:h:r${j}c${i + 1}`,
          (i, j) => (i + j + 1) % 2,
        ),
        cols,
        sashes(l.rows),
      ),
    );
  if (sw > 0 && sh > 0)
    bands.push(
      band(
        rect(
          'cs',
          sw,
          sh,
          ox + bw - S,
          oy + bh - T,
          (i, j) => `cs:r${j}c${i}`,
          (i, j) => (i + j) % 2,
        ),
        sashes(l.cols),
        sashes(l.rows),
      ),
    );
  const width = l.cols * bw + (l.cols - 1) * sw + 2 * ox;
  const height = l.rows * bh + (l.rows - 1) * sh + 2 * oy;
  return { tiling: { bands }, center: [0, 0, width, height] };
}

/**
 * On-Point (spec 016): square blocks turned 45°. Lattice cells (p, q) are the main grid
 * (`b:r{r}c{c}`), the blocks between them (`b:m:r{r}c{c}`), and a ring of edge positions
 * (`b:m:` rows/cols 0 and R/C) that become setting pieces, trimmed blocks, or nothing. Sashing and
 * cornerstones belong to the cell up-left of them in the lattice (`se`, `sw`, `s`). Ids:
 * specs/016-layout-engine/contracts/slot-ids.md.
 */
export function onPoint(
  l: OnPointLayout,
  /** Edge positions holding a block (`m:r{r}c{c}` → the id it's placed under), Exact/Floating. */
  edgeBlocks: ReadonlyMap<string, string> = new Map(),
  /** Top and bottom floats are divided by this (Variable Point stretches the result by it). */
  stretch = 1,
): {
  slots: Slot[];
  center: Bounds;
  edge: PathCommand[];
  trim: boolean;
} {
  const { cols: C, rows: R, block: s, sash: g, edge } = l;
  const finish = edge.finish;
  const f = finish === 'float' ? edge.float : 0;
  // A block at an edge position is trimmed there: the edge on that side moves in to the block
  // points (no float), and the block gets its sashing.
  const held = finish === 'exact' || finish === 'float' ? edgeBlocks : new Map<string, string>();
  const sides = [false, false, false, false]; // top, right, bottom, left hold blocks
  for (const at of held.keys()) {
    const [, r, c] = /r(\d+)c(\d+)/.exec(at)!.map(Number) as [number, number, number];
    if (r === 0) sides[0] = true;
    if (c === l.cols) sides[1] = true;
    if (r === l.rows) sides[2] = true;
    if (c === 0) sides[3] = true;
  }
  const fs = sides.map((t, i) => (t ? 0 : i % 2 ? f : f / stretch)) as [
    number,
    number,
    number,
    number,
  ];
  const [fT, fR, fB, fL] = fs;
  const k = Math.SQRT1_2;
  const P = s + g;
  const D = 2 * k * P; // center to center along a row
  const h = k * (s + 2 * g); // block center to the tip of its sashing frame
  const [W, H] = [(C - 1) * D + 2 * h, (R - 1) * D + 2 * h];
  const exact: Bounds = [fL, fT, W + fL, H + fT];
  const quilt: Bounds = [0, 0, W + fL + fR, H + fT + fB];

  // Lattice (x right-down, y left-down on screen, cell origin = top point) → quilt.
  const L = (x: number, y: number): Pt => [k * (x - y), k * (x + y)];
  // main(1,1) (p = 1, q = R) has its center at (h + fL, h + fT).
  const O: Pt = [h + fL - D / 2 - (D * R) / 2, h + fT - k * s - D / 2 + (D * R) / 2];
  const cellTransform = (lx: number, ly: number, w: number, hh: number): M => {
    const [ox, oy] = L(lx, ly);
    return [k * w, k * w, -k * hh, k * hh, O[0] + ox, O[1] + oy];
  };

  type Pos = { main: boolean; r: number; c: number };
  const pos = (p: number, q: number): Pos => {
    const s1 = p + q - R;
    if (s1 % 2 !== 0) {
      const c = (s1 + 1) / 2;
      return { main: true, r: p + 1 - c, c };
    }
    const c = s1 / 2;
    return { main: false, r: p - c, c };
  };
  const status = ({ main, r, c }: Pos): 'core' | 'ring' | 'out' =>
    main
      ? r >= 1 && r <= R && c >= 1 && c <= C
        ? 'core'
        : 'out'
      : r >= 1 && r < R && c >= 1 && c < C
        ? 'core'
        : r >= 0 && r <= R && c >= 0 && c <= C
          ? 'ring'
          : 'out';
  const code = ({ main, r, c }: Pos) => `${main ? '' : 'm:'}r${r}c${c}`;
  const blockish = (p: number, q: number) => {
    const x = pos(p, q);
    const st = status(x);
    return st === 'core' || (st === 'ring' && (finish === 'trim' || held.has(code(x))));
  };
  const altOf = (p: number, q: number) => (pos(p, q).main ? 0 : 1);

  const blocks: CellPiece = {
    kind: 'block',
    shape: 'rect',
    turns: 90,
    size: [s, s],
    transform: cellTransform(0, 0, s, s),
    id: (p, q) => {
      const x = pos(p, q);
      const st = status(x);
      if (st === 'core' || (st === 'ring' && finish === 'trim')) return `b:${code(x)}`;
      return (st === 'ring' && held.get(code(x))) || null;
    },
    alt: altOf,
  };
  const cell: CellPiece[] = [blocks];
  if (g > 0) {
    const piece = (
      kind: SlotKind,
      name: string,
      lx: number,
      ly: number,
      w: number,
      hh: number,
      has: (p: number, q: number) => boolean,
    ): CellPiece => ({
      kind,
      shape: 'rect',
      turns: w === hh ? 90 : 180,
      size: [w, hh],
      transform: cellTransform(lx, ly, w, hh),
      id: (p, q) => (has(p, q) ? `${name}${code(pos(p, q))}` : null),
      alt: altOf,
    });
    cell.push(
      piece('sash', 'sash:se:', s, 0, g, s, (p, q) => blockish(p, q) || blockish(p + 1, q)),
      piece('sash', 'sash:sw:', 0, s, s, g, (p, q) => blockish(p, q) || blockish(p, q - 1)),
      piece(
        'cs',
        'cs:s:',
        s,
        s,
        g,
        g,
        (p, q) =>
          blockish(p, q) || blockish(p + 1, q) || blockish(p, q - 1) || blockish(p + 1, q - 1),
      ),
    );
  }
  const span = R + C + 1;
  const slots = tile({
    bands: [{ cell, a: L(P, 0), b: L(0, -P), i: [-1, span], j: [-1, span] }],
    ...(finish === 'none' ? {} : { clip: quilt }),
  });

  // Setting pieces: each ring position's cell, grown over the sashing on its outward sides, trimmed
  // to the exact edge; with Floating, pushed out to the quilt's edge and cut as oversized triangles.
  if (finish === 'exact' || finish === 'float') {
    for (let p = -1; p <= span; p++)
      for (let q = -1; q <= span; q++) {
        const x = pos(p, q);
        if (status(x) !== 'ring' || held.has(code(x))) continue;
        const [top, bottom, left, right] = [x.r === 0, x.r === R, x.c === 0, x.c === C];
        const [x0, x1] = [top || left ? -g : 0, bottom || right ? s + g : s];
        const [y0, y1] = [top || right ? -g : 0, bottom || left ? s + g : s];
        const at = (lx: number, ly: number): Pt => {
          const [ox, oy] = L(p * P + lx, -q * P + ly);
          return [O[0] + ox, O[1] + oy];
        };
        const poly = clipPolygon([at(x0, y0), at(x1, y0), at(x1, y1), at(x0, y1)], exact);
        if (poly.length < 3) continue;
        const corner = (top || bottom) && (left || right);
        const parts: [string, Pt[]][] =
          corner && l.corner === 'seam' ? splitCorner(poly, x, exact) : [['', poly]];
        for (const [suffix, part] of parts) {
          const outline = f > 0 ? extrude(part, exact, fs) : part;
          slots.push({
            id: `set:${code(x)}${suffix}`,
            kind: 'set',
            shape: 'piece',
            turns: 360,
            alt: 0,
            outline: toPath(outline),
            // A block set here is placed whole, turned like the others, then cut to the piece.
            transform: cellTransform(p * P, -q * P, s, s),
            size: [s, s],
            ...(f > 0 ? { cut: toPath(cutShape(part, exact, quilt)) } : {}),
          });
        }
      }
  }

  return {
    slots,
    center: quilt,
    edge: finish === 'none' ? zigzag() : rectPath(0, 0, quilt[2], quilt[3]),
    trim: finish === 'float' || finish === 'trim' || held.size > 0,
  };

  /** Tips of the outer blocks' sashing frames and the V's between them, clockwise from top-left. */
  function zigzag(): PathCommand[] {
    const x = (c: number) => h + (c - 1) * D;
    const y = (r: number) => h + (r - 1) * D;
    const pts: Pt[] = [];
    for (let c = 1; c <= C; c++) {
      pts.push([x(c), 0]);
      if (c < C) pts.push([x(c) + D / 2, D / 2]);
    }
    for (let r = 1; r <= R; r++) {
      pts.push([W, y(r)]);
      if (r < R) pts.push([W - D / 2, y(r) + D / 2]);
    }
    for (let c = C; c >= 1; c--) {
      pts.push([x(c), H]);
      if (c > 1) pts.push([x(c) - D / 2, H - D / 2]);
    }
    for (let r = R; r >= 1; r--) {
      pts.push([0, y(r)]);
      if (r > 1) pts.push([D / 2, y(r) - D / 2]);
    }
    return toPath(pts);
  }
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9 * (1 + Math.abs(a));

/** Which side of `r` an edge a→b lies on, if any: 0 top, 1 right, 2 bottom, 3 left. */
function sideOf(a: Pt, b: Pt, [x0, y0, x1, y1]: Bounds): number | null {
  if (near(a[1], y0) && near(b[1], y0)) return 0;
  if (near(a[0], x1) && near(b[0], x1)) return 1;
  if (near(a[1], y1) && near(b[1], y1)) return 2;
  if (near(a[0], x0) && near(b[0], x0)) return 3;
  return null;
}
const NORMAL: Pt[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** Push the edges lying on `r`'s sides out by `fs` (top, right, bottom, left); corners meet at the
 *  grown rectangle's corner. */
function extrude(poly: Pt[], r: Bounds, fs: readonly number[]): Pt[] {
  const out: Pt[] = [];
  const n = poly.length;
  const push = (p: Pt, ...sides: number[]) =>
    out.push(
      sides.reduce<Pt>((q, s) => [q[0] + NORMAL[s]![0] * fs[s]!, q[1] + NORMAL[s]![1] * fs[s]!], p),
    );
  poly.forEach((v, i) => {
    const sin = sideOf(poly[(i + n - 1) % n]!, v, r);
    const sout = sideOf(v, poly[(i + 1) % n]!, r);
    if (sin === null && sout === null) out.push(v);
    else if (sin === null) {
      out.push(v);
      push(v, sout!);
    } else if (sout === null) {
      push(v, sin);
      out.push(v);
    } else if (sin === sout) push(v, sin);
    else push(v, sin, sout);
  });
  return out;
}

/** The oversized triangle to cut: the grown rectangle within the piece's inner edges. */
function cutShape(poly: Pt[], exact: Bounds, quilt: Bounds): Pt[] {
  const [x0, y0, x1, y1] = quilt;
  let out: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const mid: Pt = [
    poly.reduce((s, p) => s + p[0], 0) / poly.length,
    poly.reduce((s, p) => s + p[1], 0) / poly.length,
  ];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length]!;
    if (sideOf(a, b, exact) === null) out = clipByLine(out, a, b, mid);
  });
  return out;
}

/** A corner piece split by the seam from the quilt corner along the diagonal, clockwise order. */
function splitCorner(
  poly: Pt[],
  { r, c }: { r: number; c: number },
  [x0, y0, x1, y1]: Bounds,
): [string, Pt[]][] {
  const K: Pt = [c === 0 ? x0 : x1, r === 0 ? y0 : y1];
  const inward: Pt = [c === 0 ? 1 : -1, r === 0 ? 1 : -1];
  const end: Pt = [K[0] + inward[0], K[1] + inward[1]];
  // Clockwise around the quilt: at top-left the left-edge half comes first, then the top-edge half.
  const firstSide: Pt =
    r === 0 && c === 0
      ? [K[0], K[1] + 1]
      : r === 0
        ? [K[0] - 1, K[1]]
        : c !== 0
          ? [K[0], K[1] - 1]
          : [K[0] + 1, K[1]];
  const secondSide: Pt = [2 * K[0] + inward[0] - firstSide[0], 2 * K[1] + inward[1] - firstSide[1]];
  const a = clipByLine(poly, K, end, firstSide);
  const b = clipByLine(poly, K, end, secondSide);
  return [
    [':1', a],
    [':2', b],
  ];
}

/** Pattern styles shared by strips (spec 017) and pieced borders (spec 018). */
export type PatternStyle =
  StripStyle | 'big-little-diamonds' | 'half-drop-big-little-diamonds' | 'big-little-points';

export interface PatternArgs {
  style: PatternStyle;
  /** Length along, width across, units along, units across (Checker Board). */
  L: number;
  w: number;
  n: number;
  across: number;
  /** Where the band starts across (strips stack). */
  y0: number;
  kind: SlotKind;
  /** Plain pieces' ids: `${prefix}${code}${i}`. */
  prefix: string;
  /** Turn the pattern over across the band (points facing the other way). */
  flip?: boolean;
  /** Block spaces for block styles (else their units are painted rectangles). */
  block?: (dx: number, u: number, half: boolean) => CellPiece;
}

/**
 * One band of a pattern in band-local coordinates: x along (0…L), y across (y0…y0 + w). Units repeat
 * every L ÷ n; pieces past the ends are trimmed by the caller's clip.
 */
export function patternBands(p: PatternArgs): Band[] {
  const { L, w, n, y0, prefix } = p;
  const [y1, ym] = [y0 + w, y0 + w / 2];
  const u = L / n;
  const fy = (y: number) => (p.flip ? y0 + y1 - y : y);
  const plain = (code: string, pts: Pt[], alt = 1): CellPiece => ({
    kind: p.kind,
    shape: 'piece',
    turns: 360,
    size: [u, w],
    transform: IDENTITY,
    outline: toPath(pts.map(([x, y]): Pt => [x, fy(y)])),
    id: (i) => `${prefix}${code}${i}`,
    alt: () => alt,
  });
  const along = (cell: CellPiece[], from = -1, to = n): Band => ({
    cell,
    a: [u, 0],
    b: [0, 0],
    i: [from, to],
    j: [0, 0],
  });
  const rect = (x0: number, a: number, b: number, x1: number): Pt[] => [
    [x0, a],
    [x1, a],
    [x1, b],
    [x0, b],
  ];
  // Points along the band: bases on the far side (y1), tips on the near side (y0).
  const points = (dx: number) =>
    along([
      plain(
        'f',
        [
          [dx, y1],
          [dx + u / 2, y0],
          [dx + u, y1],
        ],
        0,
      ),
      plain('g', [
        [dx + u / 2, y0],
        [dx + 1.5 * u, y0],
        [dx + u, y1],
      ]),
    ]);
  const diamonds = (dx: number, t: number, b: number, row = '') => {
    const m = (t + b) / 2;
    return along([
      plain(
        `f${row}`,
        [
          [dx + u / 2, t],
          [dx + u, m],
          [dx + u / 2, b],
          [dx, m],
        ],
        0,
      ),
      plain(`g${row}`, [
        [dx + u / 2, t],
        [dx + 1.5 * u, t],
        [dx + u, m],
      ]),
      plain(`h${row}`, [
        [dx + u, m],
        [dx + 1.5 * u, b],
        [dx + u / 2, b],
      ]),
    ]);
  };
  // A big shape (2/3 of a unit) then a little one (1/3, half as tall), and the background around.
  const big = (2 * u) / 3;
  const little = u / 3;
  const bigLittleDiamonds = (dx: number) =>
    along([
      plain(
        'f',
        [
          [dx + big / 2, y0],
          [dx + big, ym],
          [dx + big / 2, y1],
          [dx, ym],
        ],
        0,
      ),
      plain(
        'k',
        [
          [dx + big, ym],
          [dx + big + little / 2, ym - w / 4],
          [dx + u, ym],
          [dx + big + little / 2, ym + w / 4],
        ],
        0,
      ),
      plain('g', [
        [dx + big / 2, y0],
        [dx + u + big / 2, y0],
        [dx + u, ym],
        [dx + big + little / 2, ym - w / 4],
        [dx + big, ym],
      ]),
      plain('h', [
        [dx + big, ym],
        [dx + big + little / 2, ym + w / 4],
        [dx + u, ym],
        [dx + u + big / 2, y1],
        [dx + big / 2, y1],
      ]),
    ]);
  switch (p.style) {
    case 'plain':
      return [along([plain('p', rect(0, y0, y1, L))], 0, 0)];
    case 'blocks':
    case 'half-drop-blocks': {
      const half = p.style === 'half-drop-blocks';
      const dx = half ? -u / 2 : 0;
      const unit = p.block?.(dx, u, half) ?? {
        ...plain('u', rect(dx, y0, y1, dx + u)),
        alt: (i: number) => ((i % 2) + 2) % 2,
      };
      return [along([unit], 0, half ? n : n - 1)];
    }
    case 'points-a':
      return [points(0)];
    case 'points-b':
      return [points(-u / 2)];
    case 'diamonds':
      return [diamonds(0, y0, y1)];
    case 'half-drop-diamonds':
      return [diamonds(-u / 2, y0, y1)];
    case 'double-diamonds':
      return [diamonds(0, y0, ym), diamonds(0, ym, y1, '2-')];
    case 'half-drop-double-diamonds':
      return [diamonds(0, y0, ym), diamonds(-u / 2, ym, y1, '2-')];
    case 'big-little-diamonds':
      return [bigLittleDiamonds(0)];
    case 'half-drop-big-little-diamonds':
      return [bigLittleDiamonds(-u / 2)];
    case 'big-little-points':
      return [
        along([
          plain(
            'f',
            [
              [0, y1],
              [big / 2, y0],
              [big, y1],
            ],
            0,
          ),
          plain(
            'k',
            [
              [big, y1],
              [big + little / 2, ym],
              [u, y1],
            ],
            0,
          ),
          plain('g', [
            [big / 2, y0],
            [u + big / 2, y0],
            [u, y1],
            [big + little / 2, ym],
            [big, y1],
          ]),
        ]),
      ];
    case 'spaced-squares': {
      const a = Math.min(w, u);
      const [s0, s1] = [ym - a / 2, ym + a / 2];
      const cell = [plain('f', rect((u - a) / 2, s0, s1, (u + a) / 2), 0)];
      // Spacers between squares (and at the ends), and above and below when squares are narrower.
      if (u > a) cell.push(plain('g', rect((u + a) / 2, y0, y1, (3 * u - a) / 2)));
      if (w > a) cell.push(plain('t', rect(0, y0, s0, u)), plain('b', rect(0, s1, y1, u)));
      return [along(cell)];
    }
    case 'checker-board': {
      const h = w / p.across;
      return [
        along(
          Array.from({ length: p.across }, (_, r) => ({
            ...plain('c', rect(0, y0 + r * h, y0 + (r + 1) * h, u)),
            id: (i: number) => `${prefix}c${i}.${r}`,
            alt: (i: number) => (i + r) % 2,
          })),
          0,
          n - 1,
        ),
      ];
    }
  }
}

/**
 * Strip quilts (spec 017): one band per strip, stepped along it and clipped at the quilt's ends.
 * Strip-local coordinates run x along (0…length) and y across; Vertical swaps the axes, with block
 * spaces kept upright. Ids follow the strip's lasting id (contracts in specs/017).
 */
export function strips(l: StripLayout): { tiling: Tiling; center: Bounds } {
  const L = l.length;
  const vertical = l.style === 'vertical-strip';
  const swap: M = [0, 1, 1, 0, 0, 0];
  const map = vertical ? swap : IDENTITY;
  const bands: Band[] = [];
  let y0 = 0;
  for (const st of l.strips) {
    const w = stripWidth(l, st);
    const sid = st.id;
    // A block space at x = `dx`, upright in the quilt either way.
    const block = (dx: number, u: number, half: boolean): CellPiece => {
      const g: M = vertical ? [w, 0, 0, u, y0, dx] : [u, 0, 0, w, dx, y0];
      return {
        kind: 'block',
        shape: 'rect',
        turns: Math.abs(u - w) < 1e-9 ? 90 : 180,
        size: [u, w],
        transform: vertical ? mul(swap, g) : g,
        id: (i) => `b:s${sid}:${half ? i : i + 1}`,
        alt: (i) => ((i % 2) + 2) % 2,
      };
    };
    bands.push(
      ...patternBands({
        style: st.style,
        L,
        w,
        n: st.along,
        across: st.across,
        y0,
        kind: 'strip',
        prefix: `strip:${sid}:`,
        ...(squareBlocks(st) ? { block } : {}),
      }),
    );
    y0 += w;
  }
  const [W, H] = vertical ? [y0, L] : [L, y0];
  return { tiling: { bands, map, clip: [0, 0, W, H] }, center: [0, 0, W, H] };
}

/** A plain patch with a fixed outline in cell coordinates (spec 018: patches take fabric only). */
const patch = (
  pts: Pt[],
  id: (i: number, j: number) => string | null,
  alt: (i: number, j: number) => number,
  arcs?: PathCommand[],
): CellPiece => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    kind: 'patch',
    shape: 'piece',
    turns: 360,
    size: [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)],
    transform: IDENTITY,
    outline: arcs ?? toPath(pts),
    id,
    alt,
  };
};
const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
const ring = (n: number, r: number, cx: number, cy: number, turn: number): Pt[] =>
  Array.from({ length: n }, (_, k) => {
    const t = turn + (2 * Math.PI * k) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });

/**
 * Variable Point (spec 018): On-Point with diamonds `width` × `height` through the block. Built as
 * On-Point with diamonds `width` wide, then stretched vertically by height ÷ width; every space is a
 * patch (fabric only until diamond-shaped blocks exist).
 */
export function variablePoint(l: VariablePointLayout) {
  // Diamond Point (spec 026): 60° diamonds that take diamond blocks.
  const blocks = l.style === 'diamond-point';
  if (blocks) l = { ...l, height: l.width * Math.sqrt(3) };
  const k = l.height / l.width;
  const o = onPoint(
    {
      style: 'on-point',
      cols: l.cols,
      rows: l.rows,
      block: l.width * Math.SQRT1_2,
      sash: l.sash,
      corner: l.corner,
      edge: l.edge,
    },
    undefined,
    k,
  );
  const m: M = [1, 0, 0, k, 0, 0];
  const slots = o.slots.map((s): Slot => {
    const transform = mul(m, s.transform);
    const fit =
      blocks && s.kind === 'block'
        ? fitShape(
            'diamond60',
            UNIT_CORNERS.map((p) => apply(transform, p)),
          )
        : undefined;
    return {
      ...s,
      ...(fit
        ? { shape: 'diamond60' as const, turns: TURNS.diamond60, transform: fit }
        : {
            id: s.id.replace(/^b:/, 'p:'),
            kind: s.kind === 'sash' ? 'sash' : 'patch',
            transform,
          }),
      outline: mapPath(s.outline, m),
      ...(s.cut ? { cut: mapPath(s.cut, m) } : {}),
    };
  });
  const [x0, y0, x1, y1] = o.center;
  return {
    slots,
    center: [x0, y0 * k, x1, y1 * k] as Bounds,
    edge: mapPath(o.edge, m),
    trim: o.trim,
  };
}

/**
 * One Patch (spec 018): one shape repeated `cols` × `rows`. Trimmed: the quilt rectangle cuts the
 * edge straight; No fill: whole patches only. Shapes whose rows alternate use a two-row cell so the
 * quilt doesn't drift sideways.
 */
export function onePatch(l: OnePatchLayout): { tiling: Tiling; center: Bounds | null } {
  const { cols: C, rows: R } = l;
  const w = l.width;
  const h = l.height;
  const trim = l.edge === 'trim';
  const id =
    (code: string, rowOf: (j: number) => number = (j) => j) =>
    (i: number, j: number) => {
      const r = rowOf(j);
      return trim || (i >= 0 && i < C && r >= 0 && r < R) ? `p:i${i}j${r}${code}` : null;
    };
  const parity = (i: number, j: number) => (((i + j) % 2) + 2) % 2;
  const box = (x: number, y: number, bw: number, bh: number): Pt[] => [
    [x, y],
    [x + bw, y],
    [x + bw, y + bh],
    [x, y + bh],
  ];
  const band = (cell: CellPiece[], a: Pt, b: Pt, rowsPerCell = 1): Band => ({
    cell,
    a,
    b,
    i: trim ? [-2, C + 1] : [0, C - 1],
    j: trim ? [-2, Math.ceil(R / rowsPerCell) + 1] : [0, Math.ceil(R / rowsPerCell) - 1],
  });
  let bands: Band[] = [];
  let rect: Bounds = [0, 0, C * w, R * h];
  switch (l.shape) {
    case 'squares':
    case 'rectangles': {
      const hh = l.shape === 'squares' ? w : h;
      bands = [band([patch(box(0, 0, w, hh), id(''), parity)], [w, 0], [0, hh])];
      rect = [0, 0, C * w, R * hh];
      break;
    }
    case 'bricks':
      // Rows alternate by half a brick (two rows per cell).
      bands = [
        band(
          [
            patch(
              box(0, 0, w, h),
              id('', (j) => 2 * j),
              parity,
            ),
            patch(
              box(w / 2, h, w, h),
              id('', (j) => 2 * j + 1),
              (i, j) => parity(i, j + 1),
            ),
          ],
          [w, 0],
          [0, 2 * h],
          2,
        ),
      ];
      break;
    case 'half-square-triangles':
      bands = [
        band(
          [
            patch(
              [
                [0, 0],
                [w, 0],
                [0, h],
              ],
              id('a'),
              () => 0,
            ),
            patch(
              [
                [w, 0],
                [w, h],
                [0, h],
              ],
              id('b'),
              () => 1,
            ),
          ],
          [w, 0],
          [0, h],
        ),
      ];
      break;
    case 'triangles': {
      // Equilateral, side `w`; rows of up and down triangles, every other row shifted half a side.
      const t = (w * Math.sqrt(3)) / 2;
      const row = (dx: number, dy: number, r: (j: number) => number) => [
        patch(
          shift(
            [
              [0, t],
              [w, t],
              [w / 2, 0],
            ],
            dx,
            dy,
          ),
          id('u', r),
          () => 0,
        ),
        patch(
          shift(
            [
              [w / 2, 0],
              [1.5 * w, 0],
              [w, t],
            ],
            dx,
            dy,
          ),
          id('d', r),
          () => 1,
        ),
      ];
      bands = [
        band(
          [...row(0, 0, (j) => 2 * j), ...row(-w / 2, t, (j) => 2 * j + 1)],
          [w, 0],
          [0, 2 * t],
          2,
        ),
      ];
      rect = [0, 0, C * w, R * t];
      break;
    }
    case 'diamonds': {
      // 60° diamonds standing on a point (`w` across, w√3 tall), every other row shifted half.
      const t = w * Math.sqrt(3);
      const d = (dx: number, dy: number): Pt[] =>
        shift(
          [
            [w / 2, 0],
            [w, t / 2],
            [w / 2, t],
            [0, t / 2],
          ],
          dx,
          dy,
        );
      bands = [
        band(
          [
            patch(
              d(0, 0),
              id('', (j) => 2 * j),
              () => 0,
            ),
            patch(
              d(w / 2, t / 2),
              id('', (j) => 2 * j + 1),
              () => 1,
            ),
          ],
          [w, 0],
          [0, t],
          2,
        ),
      ];
      rect = [0, t / 2, C * w, t / 2 + (R * t) / 2];
      break;
    }
    case 'hexagons': {
      // Pointy-top hexagons, side `w`: `w`√3 across, rows 1.5 `w` apart, every other row shifted.
      const across = w * Math.sqrt(3);
      const hex = (cx: number, cy: number) => ring(6, w, cx, cy, -Math.PI / 2);
      bands = [
        band(
          [
            patch(
              hex(across / 2, w),
              id('', (j) => 2 * j),
              () => 0,
            ),
            patch(
              hex(across, 2.5 * w),
              id('', (j) => 2 * j + 1),
              () => 1,
            ),
          ],
          [across, 0],
          [0, 3 * w],
          2,
        ),
      ];
      rect = [0, w / 2, C * across, w / 2 + R * 1.5 * w];
      break;
    }
    case 'tumblers': {
      // Bottom `w`, top half as wide, `h` tall; up and down in turn along a row.
      const up: Pt[] = [
        [0, h],
        [w, h],
        [0.75 * w, 0],
        [0.25 * w, 0],
      ];
      const down: Pt[] = [
        [0.75 * w, 0],
        [1.75 * w, 0],
        [1.5 * w, h],
        [w, h],
      ];
      bands = [
        band(
          [
            // Tumbler k is the kth along its row: up ones even, down ones odd.
            patch(
              up,
              (i, j) => (trim || (2 * i < C && j < R) ? `p:i${2 * i}j${j}` : null),
              () => 0,
            ),
            patch(
              down,
              (i, j) => (trim || (2 * i + 1 < C && j < R) ? `p:i${2 * i + 1}j${j}` : null),
              () => 1,
            ),
          ],
          [1.5 * w, 0],
          [0, h],
        ),
      ];
      rect = [0, 0, C * 0.75 * w, R * h];
      break;
    }
    case 'clamshells': {
      // Radius w/2: a half circle over two hollows; rows w/2 apart, every other row shifted.
      const r = w / 2;
      const shell = (cx: number, cy: number): PathCommand[] => [
        ['M', cx - r, cy],
        ['A', cx + r, cy, -180],
        ['A', cx, cy + r, 90],
        ['A', cx - r, cy, 90],
        ['Z'],
      ];
      const pts = (cx: number, cy: number): Pt[] => [
        [cx - r, cy - r],
        [cx + r, cy - r],
        [cx + r, cy + r],
        [cx - r, cy + r],
      ];
      bands = [
        band(
          [
            patch(
              pts(r, r),
              id('', (j) => 2 * j),
              () => 0,
              shell(r, r),
            ),
            patch(
              pts(2 * r, 2 * r),
              id('', (j) => 2 * j + 1),
              () => 1,
              shell(2 * r, 2 * r),
            ),
          ],
          [2 * r, 0],
          [0, 2 * r],
          2,
        ),
      ];
      rect = [0, r, C * 2 * r, r + R * r];
      break;
    }
    case 'octagons': {
      // Octagons `w` across (flat sides), small squares on point where four meet.
      const c = w / (2 + Math.SQRT2); // corner cut
      const oct: Pt[] = [
        [c, 0],
        [w - c, 0],
        [w, c],
        [w, w - c],
        [w - c, w],
        [c, w],
        [0, w - c],
        [0, c],
      ];
      const sq: Pt[] = [
        [-c, 0],
        [0, -c],
        [c, 0],
        [0, c],
      ];
      const inner = (i: number, j: number) =>
        trim || (i >= 1 && i < C && j >= 1 && j < R) ? `p:i${i}j${j}s` : null;
      bands = [band([patch(oct, id('o'), () => 0), patch(sq, inner, () => 1)], [w, 0], [0, w])];
      if (!trim) bands[0]!.i = [0, C];
      if (!trim) bands[0]!.j = [0, R];
      break;
    }
  }
  return { tiling: { bands, ...(trim ? { clip: rect } : {}) }, center: trim ? rect : null };
}

/**
 * Baby Blocks and Variable Blocks (spec 018): cubes of three diamonds (top, left, right; three
 * alternate classes). `width` across a cube, `top` the top diamond's height, `side` the side
 * diamonds' upright edge. Every other row of cubes is shifted half a cube.
 */
export function tumbling(l: TumblingLayout): { tiling: Tiling; center: Bounds | null } {
  const { cols: C, rows: R, width: W, top: T, side: S } = l;
  const trim = l.edge === 'trim';
  const P = {
    top: [0, -T] as Pt,
    ur: [W / 2, -T / 2] as Pt,
    lr: [W / 2, S - T / 2] as Pt,
    bot: [0, S] as Pt,
    ll: [-W / 2, S - T / 2] as Pt,
    ul: [-W / 2, -T / 2] as Pt,
    o: [0, 0] as Pt,
  };
  const step = S + T / 2; // row to row
  const faces = (dx: number, dy: number, row: (j: number) => number): CellPiece[] =>
    (
      [
        ['t', [P.ul, P.top, P.ur, P.o], 0],
        ['l', [P.ul, P.o, P.bot, P.ll], 1],
        ['r', [P.o, P.ur, P.lr, P.bot], 2],
      ] as [string, Pt[], number][]
    ).map(([code, pts, alt]) =>
      patch(
        shift(pts, dx, dy),
        (i, j) => {
          const r = row(j);
          return trim || (i >= 0 && i < C && r >= 0 && r < R) ? `p:i${i}j${r}${code}` : null;
        },
        () => alt,
      ),
    );
  const bands: Band[] = [
    {
      cell: [...faces(W / 2, T, (j) => 2 * j), ...faces(W, T + step, (j) => 2 * j + 1)],
      a: [W, 0],
      b: [0, 2 * step],
      i: trim ? [-2, C + 1] : [0, C - 1],
      j: trim ? [-2, Math.ceil(R / 2) + 1] : [0, Math.ceil(R / 2) - 1],
    },
  ];
  // Trimmed straight through the top cubes' side corners.
  const rect: Bounds = [0, T / 2, C * W, T / 2 + R * step];
  return { tiling: { bands, ...(trim ? { clip: rect } : {}) }, center: trim ? rect : null };
}

const UNIT_CORNERS: Pt[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

const BLOCK_SHAPE: Record<ShapedBlocksLayout['shape'], BlockShape> = {
  triangles: 'triangle',
  diamonds: 'diamond60',
  hexagons: 'hexagon',
};

/**
 * A tiling's patches as block spaces of `shape` (spec 026): each laid out by `fitShape` (the block's
 * unit square onto the patch, never mirrored), with the shape's outline and `b:` ids in place of
 * `p:`. A patch that isn't that shape stays a patch.
 */
export function asBlocks(t: Tiling, shape: BlockShape): Tiling {
  const outline = toPath(SHAPE_OUTLINE[shape]);
  return {
    ...t,
    bands: t.bands.map((band) => ({
      ...band,
      cell: band.cell.map((p): CellPiece => {
        const pts = (p.outline ?? []).flatMap((c): Pt[] =>
          c[0] === 'M' || c[0] === 'L' ? [apply(p.transform, [c[1], c[2]])] : [],
        );
        const fit = fitShape(shape, pts);
        if (!fit) return p;
        return {
          ...p,
          kind: 'block',
          shape,
          turns: TURNS[shape],
          transform: fit,
          outline,
          id: (i, j) => p.id(i, j)?.replace(/^p:/, 'b:') ?? null,
        };
      }),
    })),
  };
}

/** Shaped Blocks (spec 026): One Patch's triangles, diamonds or hexagons as block spaces. */
export function shapedBlocks(l: ShapedBlocksLayout): { tiling: Tiling; center: Bounds | null } {
  const o = onePatch({
    style: 'one-patch',
    shape: l.shape,
    cols: l.cols,
    rows: l.rows,
    width: l.width,
    height: l.width,
    edge: l.edge,
  });
  return { tiling: asBlocks(o.tiling, BLOCK_SHAPE[l.shape]), center: o.center };
}

/**
 * Turn a tiling's grid by `degrees` (spec 026 flow angle) about the middle of `rect`. Trimmed
 * (`rect` is the quilt): every band is widened to cover the turned quilt, then clipped to it as
 * before. Whole patches (no `rect`): the patches turn about the origin and the quilt follows them.
 */
export function flowTiling(t: Tiling, degrees: number | undefined, rect: Bounds | null): Tiling {
  if (!degrees || degrees % 360 === 0) return t;
  const r = (degrees * Math.PI) / 180;
  const [c, s] = [Math.cos(r), Math.sin(r)];
  const [cx, cy] = rect ? [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2] : [0, 0];
  const turn: M = [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
  const map = mul(turn, t.map ?? IDENTITY);
  if (!rect) return { ...t, map };
  // The quilt's corners in the grid's own (unturned) coordinates.
  const back = invert(map);
  const corners = [
    [rect[0], rect[1]],
    [rect[2], rect[1]],
    [rect[2], rect[3]],
    [rect[0], rect[3]],
  ].map((p) => apply(back, p as Pt));
  const bands = t.bands.map((band): Band => {
    const basis: M = [band.a[0], band.a[1], band.b[0], band.b[1], 0, 0];
    const ij = corners.map((p) => apply(invert(basis), p));
    const lo = (k: 0 | 1) => Math.floor(Math.min(...ij.map((q) => q[k]))) - 2;
    const hi = (k: 0 | 1) => Math.ceil(Math.max(...ij.map((q) => q[k]))) + 2;
    return {
      ...band,
      i: [Math.min(band.i[0], lo(0)), Math.max(band.i[1], hi(0))],
      j: [Math.min(band.j[0], lo(1)), Math.max(band.j[1], hi(1))],
    };
  });
  return { ...t, map, bands };
}
