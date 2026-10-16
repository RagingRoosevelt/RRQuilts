// Layout styles as engine presets: stored layout parameters → Tiling (engine.ts).
import type { M } from '../geometry/affine';
import type { Pt } from '../geometry/path';
import type { HorizontalLayout, OnPointLayout } from '../schema/quilt';
import type { PathCommand } from '../schema/shared';
import { clipByLine, clipPolygon, toPath } from './clip';
import { tile, type Band, type CellPiece, type Tiling } from './engine';
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
  const fs = sides.map((t) => (t ? 0 : f)) as [number, number, number, number];
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
