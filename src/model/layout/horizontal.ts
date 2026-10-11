// Horizontal layout: rows × cols of blocks with optional sashing, cornerstones, and sash border.
import type { HorizontalLayout } from '../schema/quilt';
import { rectSlot, type Bounds, type Slot } from './slots';

export function horizontalSlots(l: HorizontalLayout): { slots: Slot[]; center: Bounds } {
  const [bw, bh] = l.block;
  const [sw, sh] = l.sash;
  const ox = l.sashBorder ? sw : 0;
  const oy = l.sashBorder ? sh : 0;
  const bx = (c: number) => ox + (c - 1) * (bw + sw);
  const by = (r: number) => oy + (r - 1) * (bh + sh);
  // Sash index k sits after block k (k = 0 is the leading sash border).
  const sx = (k: number) => (k === 0 ? 0 : bx(k) + bw);
  const sy = (k: number) => (k === 0 ? 0 : by(k) + bh);
  const range = (n: number) => {
    const from = l.sashBorder ? 0 : 1;
    const to = l.sashBorder ? n : n - 1;
    return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  };
  const rows = Array.from({ length: l.rows }, (_, i) => i + 1);
  const cols = Array.from({ length: l.cols }, (_, i) => i + 1);

  const slots: Slot[] = [];
  for (const r of rows)
    for (const c of cols) slots.push(rectSlot(`b:r${r}c${c}`, bx(c), by(r), bw, bh));
  if (sw > 0) {
    for (const r of rows)
      for (const k of range(l.cols))
        slots.push(rectSlot(`sash:v:r${r}c${k}`, sx(k), by(r), sw, bh));
  }
  if (sh > 0) {
    for (const k of range(l.rows))
      for (const c of cols) slots.push(rectSlot(`sash:h:r${k}c${c}`, bx(c), sy(k), bw, sh));
  }
  if (sw > 0 && sh > 0) {
    for (const r of range(l.rows))
      for (const c of range(l.cols)) slots.push(rectSlot(`cs:r${r}c${c}`, sx(c), sy(r), sw, sh));
  }
  const width = l.cols * bw + (l.cols - 1) * sw + 2 * ox;
  const height = l.rows * bh + (l.rows - 1) * sh + 2 * oy;
  return { slots, center: [0, 0, width, height] };
}
