// Layout styles as engine presets: stored layout parameters → Tiling (engine.ts).
import type { HorizontalLayout } from '../schema/quilt';
import type { Band, CellPiece, Tiling } from './engine';
import type { Bounds, SlotKind } from './slots';

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
