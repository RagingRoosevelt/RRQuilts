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
/** `flat`: turn tall boxes to lie flat when they fit (off when boxes are already oriented). */
export function pack(boxes: Box[], pageW: number, pageH: number, gap: number, flat = true) {
  const fits = (w: number, h: number) => w <= pageW + 1e-9 && h <= pageH + 1e-9;
  const oversize: number[] = [];
  const items = boxes
    .map((b, index) => {
      // Lie flat (wider than tall) when that fits, lower shelves waste less paper; stand up when
      // only that fits.
      const turned = (flat && b.h > b.w && fits(b.h, b.w)) || !fits(b.w, b.h);
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

/** A fabric pill's width at font size `f`: swatch + "2 · Cream" (0.42 em per character). */
export const pillWidth = (label: string, f: number) => f * (1.5 + label.length * 0.42);

/** Pills left to right, wrapping at `max` (a pill wider than `max` gets its own row). */
export function wrapPills(widths: number[], max: number, gap: number) {
  let x = 0;
  let row = 0;
  return widths.map((w) => {
    if (x > 0 && x + w > max) [x, row] = [0, row + 1];
    const at = { x, row };
    x += w + gap;
    return at;
  });
}

/**
 * Flowing content (charts, tables, lists) split into pages. `items` in reading order with their
 * heights as a fraction of the page; a key `"t>"` is the heading of group `t` (a table's column
 * headings, a list's title) and `"t>…"` its rows: the heading repeats on every page holding rows.
 * An item taller than a page gets a page of its own.
 */
export function splitFlow(items: { key: string; cost: number }[]): string[][] {
  const heads = new Map(items.filter((x) => x.key.endsWith('>')).map((x) => [x.key, x.cost]));
  const pages: string[][] = [];
  let page: string[] = [];
  let used = 0;
  for (const { key, cost } of items) {
    if (heads.has(key)) continue;
    const head = key.includes('>') ? `${key.split('>')[0]}>` : '';
    const extra = () => (head && heads.has(head) && !page.includes(head) ? heads.get(head)! : 0);
    if (page.length && used + extra() + cost > 1 + 1e-9) {
      pages.push(page);
      [page, used] = [[], 0];
    }
    if (extra()) {
      used += extra();
      page.push(head);
    }
    page.push(key);
    used += cost;
  }
  if (page.length) pages.push(page);
  return pages;
}
