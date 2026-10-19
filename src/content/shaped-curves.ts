// Curved shaped blocks (traditional designs, drawn for RRQuilts): seams and color points.
import { corners, lerp, type CurvedDef, type P } from './shaped-kit';

const O: P = [0, 0];
const K6 = [0, 1, 2, 3, 4, 5];
const hex = corners('hexagon');
const v = (k: number) => hex[k % 6]!;
const mid = (k: number) => lerp(v(k), v(k + 1), 0.5);

export const SHAPED_CURVES: CurvedDef[] = [
  {
    // Six spokes; a quarter-circle peel bows into each side, dark on every other side.
    name: 'Hexagon Orange Peel',
    shape: 'hexagon',
    leg: 4,
    category: 'Curves',
    seams: K6.flatMap((k): ([P, P] | [P, P, number])[] => [
      [O, v(k)],
      [v(k), v(k + 1), 90],
    ]),
    points: K6.flatMap((k): [P, string][] => [
      [lerp(O, mid(k), 0.45), k % 2 ? 'L' : 'M'],
      [lerp(O, mid(k), 0.94), k % 2 ? 'D' : 'L'],
    ]),
  },
];
