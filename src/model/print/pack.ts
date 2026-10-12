// Arrange pieces on pages: shelves, tallest first, turning a piece 90° when that fits better.
// Pieces bigger than a page in both orientations are tiled across pages (`tiles`).

export interface Box {
  w: number;
  h: number;
}
export interface Placed {
  index: number;
  x: number;
  y: number;
  /** Turned 90° (w and h swapped). */
  turned: boolean;
}

/** Pages of placements for boxes that fit; `oversize` lists indexes that don't fit any page. */
export function pack(boxes: Box[], pageW: number, pageH: number, gap: number) {
  const fits = (w: number, h: number) => w <= pageW + 1e-9 && h <= pageH + 1e-9;
  const oversize: number[] = [];
  const items = boxes
    .map((b, index) => {
      // Lie flat (wider than tall) when that fits, lower shelves waste less paper; stand up when
      // only that fits.
      const turned = (b.h > b.w && fits(b.h, b.w)) || !fits(b.w, b.h);
      return turned ? { index, w: b.h, h: b.w, turned } : { index, w: b.w, h: b.h, turned: false };
    })
    .filter((b) => {
      if (fits(b.w, b.h) || fits(b.h, b.w)) return true;
      oversize.push(b.index);
      return false;
    });
  items.sort((a, b) => b.h - a.h);
  const pages: Placed[][] = [];
  let page: Placed[] = [];
  let x = 0;
  let y = 0;
  let shelf = 0;
  for (const it of items) {
    const { w, h, turned } = it;
    if (x + w > pageW + 1e-9) {
      x = 0;
      y += shelf + gap;
      shelf = 0;
    }
    if (y + h > pageH + 1e-9) {
      pages.push(page);
      page = [];
      x = 0;
      y = 0;
      shelf = 0;
    }
    page.push({ index: it.index, x, y, turned });
    x += w + gap;
    shelf = Math.max(shelf, h);
  }
  if (page.length) pages.push(page);
  return { pages, oversize };
}

/** Tile origins covering a `w`×`h` piece with `pageW`×`pageH` tiles that overlap by `overlap`. */
export function tiles(w: number, h: number, pageW: number, pageH: number, overlap: number) {
  const stepX = pageW - overlap;
  const stepY = pageH - overlap;
  const cols = Math.max(1, Math.ceil((w - overlap) / stepX));
  const rows = Math.max(1, Math.ceil((h - overlap) / stepY));
  const out: { x: number; y: number; row: number; col: number }[] = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) out.push({ x: col * stepX, y: row * stepY, row, col });
  return { cols, rows, tiles: out };
}
