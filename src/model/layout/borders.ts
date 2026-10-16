// Borders around the quilt center, innermost first. v1 generates the plain strip styles; the
// pieced styles are stored and reported as unsupported until their generators exist.
import type { Border } from '../schema/quilt';
import { polySlot, rectSlot, type Bounds, type Slot } from './slots';

type Side = 'top' | 'right' | 'bottom' | 'left';

export function borderSlots(
  borders: Border[],
  center: Bounds,
): { slots: Slot[]; bounds: Bounds; unsupported: string[] } {
  const slots: Slot[] = [];
  const unsupported: string[] = [];
  let [x0, y0, x1, y1] = center;
  borders.forEach((b, i) => {
    const n = i + 1;
    const [l, t, r, bt] = b.sides;
    const [X0, Y0, X1, Y1] = [x0 - l, y0 - t, x1 + r, y1 + bt];
    const id = (side: Side) => `border:${n}:${side}`;
    const add = (s: Slot, width: number) => width > 0 && slots.push(s);

    if (b.style === 'mitered') {
      add(
        polySlot(id('top'), [
          [X0, Y0],
          [X1, Y0],
          [x1, y0],
          [x0, y0],
        ]),
        t,
      );
      add(
        polySlot(id('right'), [
          [X1, Y0],
          [X1, Y1],
          [x1, y1],
          [x1, y0],
        ]),
        r,
      );
      add(
        polySlot(id('bottom'), [
          [X1, Y1],
          [X0, Y1],
          [x0, y1],
          [x1, y1],
        ]),
        bt,
      );
      add(
        polySlot(id('left'), [
          [X0, Y1],
          [X0, Y0],
          [x0, y0],
          [x0, y1],
        ]),
        l,
      );
    } else if (b.style === 'long-vertical') {
      add(rectSlot(id('left'), X0, Y0, l, Y1 - Y0), l);
      add(rectSlot(id('right'), x1, Y0, r, Y1 - Y0), r);
      add(rectSlot(id('top'), x0, Y0, x1 - x0, t), t);
      add(rectSlot(id('bottom'), x0, y1, x1 - x0, bt), bt);
    } else {
      if (b.style !== 'long-horizontal') unsupported.push(`border ${n} ${b.style}`);
      // long-horizontal (also the stand-in geometry for styles not generated yet)
      add(rectSlot(id('top'), X0, Y0, X1 - X0, t), t);
      add(rectSlot(id('bottom'), X0, y1, X1 - X0, bt), bt);
      add(rectSlot(id('left'), X0, y0, l, y1 - y0), l);
      add(rectSlot(id('right'), x1, y0, r, y1 - y0), r);
    }
    [x0, y0, x1, y1] = [X0, Y0, X1, Y1];
  });
  return { slots, bounds: [x0, y0, x1, y1], unsupported };
}
