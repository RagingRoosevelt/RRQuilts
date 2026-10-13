// Built-in log cabin and strip blocks (traditional designs, drawn for RRQuilts) as grid pieces.
import { gridBlocks, hst, rect, sq, type GridDef, type P, type Piece } from './grid';

export const LOG_CABIN_DEFS: GridDef[] = [
  {
    name: 'Log Cabin I',
    size: 13.5,
    n: 9,
    pieces: [
      rect(3, 3, 2, 1, 'N'),
      sq(3, 4, 'N'),
      sq(4, 4, 'K'),
      rect(5, 3, 1, 2, 'L'),
      rect(3, 5, 3, 1, 'L'),
      rect(2, 2, 4, 1, 'K'),
      rect(2, 3, 1, 3, 'K'),
      rect(6, 2, 1, 4, 'M'),
      rect(2, 6, 5, 1, 'M'),
      rect(1, 1, 6, 1, 'N'),
      rect(1, 2, 1, 5, 'N'),
      rect(7, 1, 1, 6, 'L'),
      rect(1, 7, 7, 1, 'L'),
      rect(0, 0, 8, 1, 'K'),
      rect(0, 1, 1, 7, 'K'),
      rect(8, 0, 1, 8, 'M'),
      rect(0, 8, 9, 1, 'M'),
    ],
  },
  {
    name: 'Split Center',
    size: 10,
    n: 10,
    pieces: [
      ...hst(4, 4, '/', 'L', 'M', 2),
      rect(4, 3, 2, 1, 'L'),
      rect(3, 3, 1, 4, 'L'),
      rect(6, 3, 1, 4, 'D'),
      rect(4, 6, 2, 1, 'D'),
      rect(3, 2, 4, 1, 'L'),
      rect(2, 2, 1, 6, 'L'),
      rect(7, 2, 1, 6, 'D'),
      rect(3, 7, 4, 1, 'D'),
      rect(2, 1, 6, 1, 'L'),
      rect(1, 1, 1, 8, 'L'),
      rect(8, 1, 1, 8, 'D'),
      rect(2, 8, 6, 1, 'D'),
      rect(1, 0, 8, 1, 'L'),
      rect(0, 0, 1, 10, 'L'),
      rect(9, 0, 1, 10, 'D'),
      rect(1, 9, 8, 1, 'D'),
    ],
  },
  {
    name: 'Four-Patch Center',
    size: 10,
    n: 10,
    pieces: [
      sq(4, 4, 'M'),
      sq(5, 4, 'L'),
      sq(4, 5, 'L'),
      sq(5, 5, 'M'),
      rect(4, 3, 2, 1, 'M'),
      rect(3, 3, 1, 4, 'L'),
      rect(6, 3, 1, 4, 'M'),
      rect(4, 6, 2, 1, 'L'),
      rect(3, 2, 4, 1, 'M'),
      rect(2, 2, 1, 6, 'L'),
      rect(7, 2, 1, 6, 'M'),
      rect(3, 7, 4, 1, 'L'),
      rect(2, 1, 6, 1, 'M'),
      rect(1, 1, 1, 8, 'L'),
      rect(8, 1, 1, 8, 'M'),
      rect(2, 8, 6, 1, 'L'),
      rect(1, 0, 8, 1, 'M'),
      rect(0, 0, 1, 10, 'L'),
      rect(9, 0, 1, 10, 'M'),
      rect(1, 9, 8, 1, 'L'),
    ],
  },
  {
    name: 'Nine-Patch Center',
    size: 9,
    n: 9,
    pieces: [
      sq(3, 3, 'N'),
      sq(4, 3, 'K'),
      ...hst(5, 3, '/', 'N', 'Q'),
      sq(3, 4, 'K'),
      sq(4, 4, 'P'),
      sq(5, 4, 'K'),
      ...hst(3, 5, '/', 'N', 'Q'),
      sq(4, 5, 'K'),
      sq(5, 5, 'Q'),
      rect(6, 3, 1, 3, 'S'),
      rect(3, 6, 4, 1, 'S'),
      rect(2, 2, 5, 1, 'M'),
      rect(2, 3, 1, 4, 'M'),
      rect(7, 2, 1, 5, 'Q'),
      rect(2, 7, 6, 1, 'Q'),
      rect(1, 1, 7, 1, 'N'),
      rect(1, 2, 1, 6, 'N'),
      rect(8, 1, 1, 7, 'P'),
      rect(1, 8, 8, 1, 'P'),
      rect(0, 0, 9, 1, 'K'),
      rect(0, 1, 1, 8, 'K'),
    ],
  },
  {
    name: 'Courthouse Steps',
    size: 10,
    n: 10,
    pieces: (() => {
      const out: Piece[] = [rect(4, 4, 2, 2, 'L')];
      for (let k = 0; k < 4; k++)
        out.push(
          rect(3 - k, 4 - k, 1, 2 + 2 * k, 'M'),
          rect(6 + k, 4 - k, 1, 2 + 2 * k, 'M'),
          rect(3 - k, 3 - k, 4 + 2 * k, 1, 'L'),
          rect(3 - k, 6 + k, 4 + 2 * k, 1, 'L'),
        );
      return out;
    })(),
  },
  {
    name: 'Cabin in the Cotton',
    size: 18,
    n: 12,
    pieces: (() => {
      const out: Piece[] = [rect(5, 5, 2, 2, 'L')];
      for (let k = 0; k < 5; k++) {
        const c = k % 2 ? 'L' : 'M';
        out.push(
          rect(k, k, 12 - 2 * k, 1, c),
          rect(k, 11 - k, 12 - 2 * k, 1, c),
          rect(k, k + 1, 1, 10 - 2 * k, c),
          rect(11 - k, k + 1, 1, 10 - 2 * k, c),
        );
      }
      return out;
    })(),
  },
  {
    name: 'Cornerstones',
    size: 10,
    n: 10,
    pieces: (() => {
      const out: Piece[] = [rect(4, 4, 2, 2, 'M')];
      for (let k = 0; k < 4; k++)
        out.push(
          rect(3 - k, 3 - k, 3 + 2 * k, 1, 'L'),
          sq(6 + k, 3 - k, 'M'),
          rect(6 + k, 4 - k, 1, 2 + 2 * k, 'L'),
          rect(4 - k, 6 + k, 3 + 2 * k, 1, 'L'),
          sq(3 - k, 6 + k, 'M'),
          rect(3 - k, 4 - k, 1, 2 + 2 * k, 'L'),
        );
      return out;
    })(),
  },
  {
    name: 'Chimneys and Cornerstones',
    size: 10,
    n: 10,
    pieces: (() => {
      const out: Piece[] = [rect(4, 4, 2, 2, 'M')];
      for (let k = 0; k < 4; k++)
        out.push(
          sq(3 - k, 3 - k, 'M'),
          sq(6 + k, 3 - k, 'M'),
          sq(3 - k, 6 + k, 'M'),
          sq(6 + k, 6 + k, 'M'),
          rect(4 - k, 3 - k, 2 + 2 * k, 1, 'L'),
          rect(4 - k, 6 + k, 2 + 2 * k, 1, 'L'),
          rect(3 - k, 4 - k, 1, 2 + 2 * k, 'L'),
          rect(6 + k, 4 - k, 1, 2 + 2 * k, 'L'),
        );
      return out;
    })(),
  },
  {
    name: 'Wide and Narrow',
    size: 14,
    n: 14,
    pieces: [
      sq(8, 8, 'L', 2),
      rect(10, 8, 1, 2, 'M'),
      rect(8, 10, 3, 1, 'M'),
      rect(6, 8, 2, 3, 'L'),
      rect(6, 6, 5, 2, 'L'),
      rect(11, 6, 1, 5, 'M'),
      rect(6, 11, 6, 1, 'M'),
      rect(4, 6, 2, 6, 'L'),
      rect(4, 4, 8, 2, 'L'),
      rect(12, 4, 1, 8, 'M'),
      rect(4, 12, 9, 1, 'M'),
      rect(2, 4, 2, 9, 'L'),
      rect(2, 2, 11, 2, 'L'),
      rect(13, 2, 1, 11, 'M'),
      rect(2, 13, 12, 1, 'M'),
      rect(0, 2, 2, 12, 'L'),
      rect(0, 0, 14, 2, 'L'),
    ],
  },
  {
    name: 'Centers in the Corners',
    size: 11.5,
    n: 23,
    pieces: [
      sq(0, 0, 'L', 5),
      rect(0, 5, 5, 3, 'D'),
      rect(0, 8, 8, 3, 'D'),
      rect(0, 11, 11, 3, 'D'),
      rect(0, 14, 14, 3, 'D'),
      rect(0, 17, 17, 3, 'D'),
      rect(0, 20, 20, 3, 'D'),
      rect(5, 0, 3, 8, 'L'),
      rect(8, 0, 3, 11, 'L'),
      rect(11, 0, 3, 14, 'L'),
      rect(14, 0, 3, 17, 'L'),
      rect(17, 0, 3, 20, 'L'),
      rect(20, 0, 3, 23, 'L'),
    ],
  },
  {
    name: 'Double Strips',
    size: 10,
    n: 10,
    pieces: [
      rect(0, 0, 1, 8, 'D'),
      rect(1, 0, 1, 8, 'L'),
      rect(2, 0, 8, 1, 'D'),
      rect(2, 1, 8, 1, 'L'),
      rect(9, 2, 1, 8, 'D'),
      rect(8, 2, 1, 8, 'L'),
      rect(0, 9, 8, 1, 'D'),
      rect(0, 8, 8, 1, 'L'),
      rect(2, 2, 1, 4, 'D'),
      rect(3, 2, 1, 4, 'L'),
      rect(4, 2, 4, 1, 'D'),
      rect(4, 3, 4, 1, 'L'),
      rect(7, 4, 1, 4, 'D'),
      rect(6, 4, 1, 4, 'L'),
      rect(2, 7, 4, 1, 'D'),
      rect(2, 6, 4, 1, 'L'),
      sq(4, 4, 'M', 2),
    ],
  },
  {
    name: 'Pineapple',
    size: 8,
    n: 10,
    pieces: (() => {
      const out: Piece[] = [];
      const a = 4.63;
      const b = 3.35;
      const rot = (p: [number, number], k: number): [number, number] => {
        let [x, y] = p;
        for (let i = 0; i < k; i++) [x, y] = [10 - y, x];
        return [x, y];
      };
      const add = (poly: [number, number][], c: string) => {
        for (let k = 0; k < 4; k++) out.push({ poly: poly.map((p) => rot(p, k)), c });
      };
      // strips on each side (top side, rotated), rings 1-3
      add(
        [
          [3, 3],
          [4, 2],
          [6, 2],
          [7, 3],
        ],
        'L',
      );
      add(
        [
          [a - 2, 2],
          [a - 1, 1],
          [11 - a, 1],
          [12 - a, 2],
        ],
        'L',
      );
      add(
        [
          [b - 1, 1],
          [b, 0],
          [10 - b, 0],
          [11 - b, 1],
        ],
        'L',
      );
      // corners: diagonal strips and the corner triangle
      add(
        [
          [a - 2, 2],
          [4, 2],
          [2, 4],
          [2, a - 2],
        ],
        'M',
      );
      add(
        [
          [b - 1, 1],
          [a - 1, 1],
          [1, a - 1],
          [1, b - 1],
        ],
        'M',
      );
      add(
        [
          [0, 0],
          [b, 0],
          [0, b],
        ],
        'M',
      );
      // center: diamond and four corner triangles
      out.push({
        poly: [
          [5, 3],
          [7, 5],
          [5, 7],
          [3, 5],
        ],
        c: 'L',
      });
      add(
        [
          [3, 3],
          [5, 3],
          [3, 5],
        ],
        'M',
      );
      return out;
    })(),
  },
];

export const STRIP_DEFS: GridDef[] = [
  {
    name: 'London Steps',
    size: 9,
    n: 6,
    pieces: [
      rect(0, 0, 2, 1, 'L'),
      rect(2, 0, 1, 2, 'L'),
      rect(3, 0, 1, 2, 'M'),
      rect(4, 0, 2, 1, 'L'),
      rect(0, 1, 2, 1, 'M'),
      rect(4, 1, 2, 1, 'M'),
      rect(0, 2, 1, 2, 'L'),
      rect(1, 2, 1, 2, 'M'),
      rect(2, 2, 2, 1, 'L'),
      rect(2, 3, 2, 1, 'M'),
      rect(4, 2, 1, 2, 'L'),
      rect(5, 2, 1, 2, 'M'),
      rect(0, 4, 2, 1, 'L'),
      rect(0, 5, 2, 1, 'M'),
      rect(2, 4, 1, 2, 'L'),
      rect(3, 4, 1, 2, 'M'),
      rect(4, 4, 2, 1, 'L'),
      rect(4, 5, 2, 1, 'M'),
    ],
  },
  {
    name: 'Fence Rail',
    size: 12,
    n: 8,
    pieces: [
      ...['L', 'M', 'N', 'K'].flatMap((c, i) => [
        rect(i, 0, 1, 4, c),
        rect(4, i, 4, 1, c),
        rect(0, 7 - i, 4, 1, c),
        rect(4 + i, 4, 1, 4, c),
      ]),
    ],
  },
  {
    name: 'Random Country Calico',
    size: 10,
    n: 10,
    pieces: [
      ...['M', 'S', 'N', 'P', 'K'].flatMap((c, i) => [
        rect(0, i, 5, 1, c),
        rect(0, 5 + i, 5, 1, c),
      ]),
      ...['K', 'P', 'N', 'S', 'M'].map((c, i) => rect(5 + i, 0, 1, 5, c)),
      ...['N', 'M', 'S', 'K', 'P'].map((c, i) => rect(5 + i, 5, 1, 5, c)),
    ],
  },
  {
    name: 'Attic Window II',
    size: 6,
    n: 6,
    pieces: [
      rect(0, 0, 2, 4, 'K'),
      rect(2, 0, 4, 4, 'N'),
      rect(2, 4, 4, 2, 'M'),
      {
        poly: [
          [0, 4],
          [2, 4],
          [0, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 4],
          [2, 6],
          [0, 6],
        ],
        c: 'M',
      },
    ],
  },
  {
    name: 'Basket Weave I',
    size: 12,
    n: 6,
    pieces: [
      ...['M', 'N', 'K'].map((c, i) => rect(i, 0, 1, 3, c)),
      ...['K', 'N', 'M'].flatMap((c, i) => [rect(3, i, 3, 1, c), rect(0, 3 + i, 3, 1, c)]),
      ...['M', 'N', 'K'].map((c, i) => rect(3 + i, 3, 1, 3, c)),
    ],
  },
  {
    name: 'City Streets',
    size: 9,
    n: 9,
    pieces: (() => {
      const out: Piece[] = [rect(0, 4, 9, 1, 'L'), rect(4, 0, 1, 4, 'L'), rect(4, 5, 1, 4, 'L')];
      for (const [fx, fy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]) {
        const X = (x: number, w: number) => (fx ? 9 - x - w : x);
        const Y = (y: number, h: number) => (fy ? 9 - y - h : y);
        const r = (x: number, y: number, w: number, h: number, c: string) =>
          rect(X(x, w), Y(y, h), w, h, c);
        out.push(
          r(0, 0, 2, 2, 'K'),
          r(2, 0, 1, 2, 'N'),
          r(0, 2, 3, 1, 'N'),
          r(3, 0, 1, 3, 'M'),
          r(0, 3, 4, 1, 'M'),
        );
      }
      return out;
    })(),
  },
  {
    name: 'Square Red Cross',
    size: 7,
    n: 7,
    pieces: [
      rect(0, 0, 7, 1, 'N'),
      rect(0, 6, 7, 1, 'N'),
      rect(0, 1, 1, 5, 'N'),
      rect(6, 1, 1, 5, 'N'),
      sq(1, 1, 'M', 2),
      sq(4, 1, 'M', 2),
      sq(1, 4, 'M', 2),
      sq(4, 4, 'M', 2),
      rect(3, 1, 1, 2, 'K'),
      rect(3, 4, 1, 2, 'K'),
      rect(1, 3, 2, 1, 'K'),
      rect(4, 3, 2, 1, 'K'),
      sq(3, 3, 'K'),
    ],
  },
  {
    name: 'Lantern Patch',
    size: 12,
    n: 12,
    pieces: (() => {
      const out: Piece[] = [
        sq(0, 0, 'L', 2),
        sq(10, 0, 'L', 2),
        sq(0, 10, 'L', 2),
        sq(10, 10, 'L', 2),
      ];
      const strips = ['N', 'M', 'K', 'M', 'K', 'N'];
      strips.forEach((c, i) => {
        const r = i * 2;
        out.push(rect(2, r, 8, 2, c));
        if (c === 'N') return;
        for (const m of [false, true]) {
          const f = (x: number): P => [m ? 12 - x : x, 0];
          const pt = (x: number, y: number): P => [f(x)[0], y];
          out.push(
            c === 'M'
              ? { poly: [pt(2, r), pt(2, r + 2), pt(0, r + 2)], c }
              : { poly: [pt(0, r), pt(2, r), pt(2, r + 2)], c },
            c === 'M'
              ? { poly: [pt(0, r), pt(2, r), pt(0, r + 2)], c: 'L' }
              : { poly: [pt(0, r), pt(2, r + 2), pt(0, r + 2)], c: 'L' },
          );
        }
      });
      return out;
    })(),
  },
  {
    name: 'Garden Gazebo',
    size: 18,
    n: 18,
    pieces: (() => {
      type P = [number, number];
      const h = 9;
      const clip = (poly: P[], [a, b, c]: number[]): P[] => {
        const o: P[] = [];
        poly.forEach((p, i) => {
          const q = poly[(i + 1) % poly.length]!;
          const dp = a! * p[0] + b! * p[1] - c!;
          const dq = a! * q[0] + b! * q[1] - c!;
          if (dp <= 0) o.push(p);
          if (dp * dq < 0) {
            const t = dp / (dp - dq);
            o.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
          }
        });
        return o;
      };
      const reg = (hs: number[][]): P[] =>
        hs.reduce(clip, [
          [-h, -h],
          [h, -h],
          [h, h],
          [-h, h],
        ] as P[]);
      const rot = (p: P[]): P[] => p.map(([x, y]) => [-y, x]);
      const out: Piece[] = [];
      const put = (poly: P[], c: string) =>
        out.push({ poly: poly.map(([x, y]) => [x + h, y + h] as P), c });
      const S = 1.5 * Math.SQRT2;
      const lv = [13.5, 13.5 - S, 13.5 - 2 * S, 13.5 - 3 * S, 4.5];
      const base: [number[][], string][] = [];
      ['K', 'N', 'M', 'P'].forEach((c, i) =>
        base.push([
          [
            [-1, -1, lv[i]!],
            [1, 1, -lv[i + 1]!],
            [1, -1, 4.5],
            [-1, 1, 4.5],
          ],
          c,
        ]),
      );
      base.push([[[1, 1, -13.5]], 'L']);
      base.push([
        [
          [-1, 1, -4.5],
          [1, 1, -4.5],
          [0, 1, -6.75],
        ],
        'Q',
      ]);
      base.push([
        [
          [-1, 1, -4.5],
          [1, 1, -4.5],
          [0, -1, 6.75],
        ],
        'L',
      ]);
      base.push([
        [
          [0, 1, -2.25],
          [1, -1, 4.5],
          [-1, -1, 4.5],
        ],
        'K',
      ]);
      base.push([
        [
          [-1, 1, -2.25],
          [1, 0, 2.25],
          [0, -1, 2.25],
        ],
        'N',
      ]);
      for (const [hs, c] of base) {
        let p = reg(hs);
        for (let k = 0; k < 4; k++) {
          put(p, c);
          p = rot(p);
        }
      }
      put(
        reg([
          [1, 1, 2.25],
          [1, -1, 2.25],
          [-1, 1, 2.25],
          [-1, -1, 2.25],
        ]),
        'M',
      );
      return out;
    })(),
  },
  {
    name: 'Ribbons II',
    size: 16.75,
    n: 67,
    pieces: (() => {
      type P = [number, number];
      const h = 33.5;
      const R = 22.5;
      const clip = (poly: P[], [a, b, c]: number[]): P[] => {
        const o: P[] = [];
        poly.forEach((p, i) => {
          const q = poly[(i + 1) % poly.length]!;
          const dp = a! * p[0] + b! * p[1] - c!;
          const dq = a! * q[0] + b! * q[1] - c!;
          if (dp <= 0) o.push(p);
          if (dp * dq < 0) {
            const t = dp / (dp - dq);
            o.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
          }
        });
        return o;
      };
      const reg = (hs: number[][]): P[] =>
        hs.reduce(clip, [
          [-h, -h],
          [h, -h],
          [h, h],
          [-h, h],
        ] as P[]);
      const rot = (p: P[]): P[] => p.map(([x, y]) => [-y, x]);
      const out: Piece[] = [];
      const put = (poly: P[], c: string) =>
        out.push({ poly: poly.map(([x, y]) => [x + h, y + h] as P), c });
      const dia = [
        [1, 1, R],
        [1, -1, R],
        [-1, 1, R],
        [-1, -1, R],
      ];
      put(reg([...dia, [1, 0, R / 2], [-1, 0, R / 2]]), 'P');
      put(reg([...dia, [1, 0, -R / 2]]), 'L');
      put(reg([...dia, [-1, 0, -R / 2]]), 'L');
      const base: [number[][], string][] = [
        [
          [
            [1, 1, -R],
            [-1, 1, -R],
          ],
          'S',
        ],
      ];
      // north-west band, strips across x - y
      ['N', 'Q', 'K', 'M'].forEach((c, i) => {
        const lo = -R + (i * R) / 2;
        base.push([
          [
            [1, 1, -R],
            [1, -1, lo + R / 2],
            [-1, 1, -lo],
          ],
          c,
        ]);
      });
      for (const [hs, c] of base) {
        let p = reg(hs);
        for (let k = 0; k < 4; k++) {
          put(p, c);
          p = rot(p);
        }
      }
      return out;
    })(),
  },
  {
    name: 'Mexican Cross II',
    size: 10,
    n: 10,
    pieces: (() => {
      type P = [number, number];
      const h = 5;
      const A = Math.SQRT1_2;
      const B = 3 * A;
      const clip = (poly: P[], [a, b, c]: number[]): P[] => {
        const o: P[] = [];
        poly.forEach((p, i) => {
          const q = poly[(i + 1) % poly.length]!;
          const dp = a! * p[0] + b! * p[1] - c!;
          const dq = a! * q[0] + b! * q[1] - c!;
          if (dp <= 0) o.push(p);
          if (dp * dq < 0) {
            const t = dp / (dp - dq);
            o.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
          }
        });
        return o;
      };
      const reg = (hs: number[][]): P[] =>
        hs.reduce(clip, [
          [-h, -h],
          [h, -h],
          [h, h],
          [-h, h],
        ] as P[]);
      const rot = (p: P[]): P[] => p.map(([x, y]) => [-y, x]);
      const out: Piece[] = [];
      const put = (poly: P[], c: string) =>
        out.push({ poly: poly.map(([x, y]) => [x + h, y + h] as P), c });
      // centre 3 x 3 checker, turned 45 degrees
      for (let a = -1; a <= 1; a++)
        for (let b = -1; b <= 1; b++)
          put(
            (
              [
                [a - 0.5, b - 0.5],
                [a + 0.5, b - 0.5],
                [a + 0.5, b + 0.5],
                [a - 0.5, b + 0.5],
              ] as P[]
            ).map(([u, v]) => [(u + v) * A, (u - v) * A] as P),
            a === b || a === -b ? 'K' : 'N',
          );
      const base: [number[][], string][] = [
        [
          [
            [1, -1, A],
            [-1, 1, A],
            [-1, -1, -B],
          ],
          'L',
        ],
        [
          [
            [1, -1, -A],
            [-1, 1, B],
            [1, 0, h - B],
            [-1, -1, -B],
          ],
          'N',
        ],
        [
          [
            [-1, 1, -A],
            [1, -1, B],
            [0, 1, h - B],
            [-1, -1, -B],
          ],
          'N',
        ],
        [
          [
            [1, -1, -A],
            [-1, 0, B - h],
          ],
          'K',
        ],
        [
          [
            [-1, 1, -A],
            [0, -1, B - h],
          ],
          'K',
        ],
        [
          [
            [1, -1, -B],
            [-1, -1, -B],
          ],
          'M',
        ],
      ];
      for (const [hs, c] of base) {
        let p = reg(hs);
        for (let k = 0; k < 4; k++) {
          put(p, c);
          p = rot(p);
        }
      }
      return out;
    })(),
  },
  {
    name: 'Cobweb',
    size: 12,
    n: 48,
    pieces: (() => {
      type Pt = [number, number];
      // Clip polygon to half-plane a*x + b*y >= c (Sutherland-Hodgman).
      const clip = (poly: Pt[], a: number, b: number, c: number): Pt[] => {
        const out: Pt[] = [];
        poly.forEach((p, i) => {
          const q = poly[(i + 1) % poly.length]!;
          const dp = a * p[0] + b * p[1] - c;
          const dq = a * q[0] + b * q[1] - c;
          if (dp >= 0) out.push(p);
          if (dp * dq < 0) {
            const t = dp / (dp - dq);
            out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
          }
        });
        return out;
      };
      // Template unit (24 x 24): white triangles 13 and 14, and 12 strips x+y in [4j, 4j+4] across the kite.
      const unit: { poly: Pt[]; c: string }[] = [
        {
          poly: [
            [0, 0],
            [24, 0],
            [24, 8],
          ],
          c: 'L',
        },
        {
          poly: [
            [0, 0],
            [8, 24],
            [0, 24],
          ],
          c: 'L',
        },
      ];
      const cols = ['N', 'K', 'M'];
      for (let j = 0; j < 12; j++) {
        let p: Pt[] = [
          [0, 0],
          [8, 24],
          [24, 24],
          [24, 8],
        ];
        p = clip(p, 1, 1, 4 * j);
        p = clip(p, -1, -1, -4 * (j + 1));
        unit.push({ poly: p, c: cols[j % 3]! });
      }
      const out: { poly: Pt[]; c: string }[] = [];
      for (const [sx, sy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ] as const) {
        for (const u of unit) {
          let poly = u.poly.map(([x, y]): Pt => [24 + sx * x, 24 + sy * y]);
          if (sx * sy < 0) poly = poly.reverse();
          out.push({ poly, c: u.c });
        }
      }
      return out;
    })(),
  },
];

export const LOG_CABIN_BLOCKS = gridBlocks(LOG_CABIN_DEFS, 'Strips/Log Cabin');
export const STRIP_BLOCKS = gridBlocks(STRIP_DEFS, 'Strips/Strips');
