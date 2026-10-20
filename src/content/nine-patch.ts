// Built-in nine-patch family blocks (traditional designs, drawn for RRQuilts) as grid pieces.
import { cells, gridBlocks, hst, qst, rect, sq, sqInSq, type GridDef } from './grid';

export const NINE_PATCH_DEFS: GridDef[] = [
  {
    name: 'Basic Nine-Patch',
    size: 9,
    n: 3,
    pieces: cells(['D L D', 'L D L', 'D L D']),
  },
  {
    name: 'Red Cross I',
    size: 9,
    n: 3,
    pieces: cells(['L M L', 'M D M', 'L M L']),
  },
  {
    name: 'Nine-Patch Variation I',
    size: 9,
    n: 3,
    pieces: cells(['L M M', 'M L M', 'M M L']),
  },
  {
    name: 'H-Block',
    size: 9,
    n: 3,
    pieces: cells(['D L D', 'D D D', 'D L D']),
  },
  {
    name: 'Patience Nine-Patch',
    size: 9,
    n: 3,
    pieces: cells(['L M D', 'M L M', 'D M L']),
  },
  {
    name: 'Basketweave I',
    size: 9,
    n: 3,
    pieces: cells(['M M D', 'D L D', 'D M M']),
  },
  {
    name: 'Two-Color Double Nine-Patch',
    size: 9,
    n: 9,
    pieces: [
      rect(0, 0, 3, 3, 'D'),
      rect(6, 0, 3, 3, 'D'),
      rect(0, 6, 3, 3, 'D'),
      rect(6, 6, 3, 3, 'D'),
      rect(3, 0, 3, 3, 'L'),
      rect(0, 3, 3, 3, 'L'),
      rect(6, 3, 3, 3, 'L'),
      rect(3, 6, 3, 3, 'L'),
      ...cells(['D L D', 'L D L', 'D L D'], 3, 3),
    ],
  },
  {
    name: 'Pussy in the Corner',
    size: 9,
    n: 6,
    pieces: cells([
      'L L 2M . L L',
      'L D . . L D',
      '2M . L L 2M .',
      '. . L D . .',
      'L L 2M . L L',
      'L D . . L D',
    ]),
  },
  {
    name: 'Puss in the Corner',
    size: 9,
    n: 9,
    pieces: [
      ...cells(['L D L', 'D L D', 'L D L']),
      ...cells(['L D L', 'D L D', 'L D L'], 6, 0),
      ...cells(['L D L', 'D L D', 'L D L'], 0, 6),
      ...cells(['L D L', 'D L D', 'L D L'], 6, 6),
      rect(3, 0, 3, 2, 'L'),
      rect(3, 7, 3, 2, 'L'),
      rect(0, 3, 2, 3, 'L'),
      rect(7, 3, 2, 3, 'L'),
      rect(3, 2, 3, 1, 'M'),
      rect(3, 6, 3, 1, 'M'),
      rect(2, 3, 1, 3, 'M'),
      rect(6, 3, 1, 3, 'M'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Building Blocks',
    size: 9,
    n: 9,
    pieces: [
      ...cells(['L M L', 'M L M', 'L M L']),
      ...cells(['L M L', 'M L M', 'L M L'], 6, 0),
      ...cells(['L M L', 'M L M', 'L M L'], 0, 6),
      ...cells(['L M L', 'M L M', 'L M L'], 6, 6),
      rect(3, 0, 3, 1, 'D'),
      rect(3, 1, 3, 1, 'L'),
      rect(3, 2, 3, 1, 'D'),
      rect(3, 6, 3, 1, 'D'),
      rect(3, 7, 3, 1, 'L'),
      rect(3, 8, 3, 1, 'D'),
      rect(0, 3, 1, 3, 'D'),
      rect(1, 3, 1, 3, 'L'),
      rect(2, 3, 1, 3, 'D'),
      rect(6, 3, 1, 3, 'D'),
      rect(7, 3, 1, 3, 'L'),
      rect(8, 3, 1, 3, 'D'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Homeward Bound',
    size: 9,
    n: 6,
    pieces: cells([
      'M L 2D . L M',
      'L L . . L L',
      '2D . 2L . 2D .',
      '. . . . . .',
      'L L 2D . L L',
      'M L . . L M',
    ]),
  },
  {
    name: 'Pennsylvania',
    size: 9,
    n: 6,
    pieces: cells([
      'M L 2L . L M',
      'L M . . M L',
      '2L . 2M . 2L .',
      '. . . . . .',
      'L M 2L . M L',
      'M L . . L M',
    ]),
  },
  {
    name: 'Patience Corner',
    size: 12,
    n: 6,
    pieces: cells([
      '2M . L L L L',
      '. . L M M L',
      'L L L M M L',
      'L M M L L L',
      'L M M L 2M .',
      'L L L L . .',
    ]),
  },
  {
    name: 'Handweave',
    size: 18,
    n: 9,
    pieces: [
      rect(0, 0, 2, 2, 'D'),
      rect(7, 0, 2, 2, 'D'),
      rect(0, 7, 2, 2, 'D'),
      rect(7, 7, 2, 2, 'D'),
      rect(2, 0, 1, 2, 'L'),
      rect(3, 0, 3, 2, 'L'),
      rect(6, 0, 1, 2, 'L'),
      rect(2, 7, 1, 2, 'L'),
      rect(3, 7, 3, 2, 'L'),
      rect(6, 7, 1, 2, 'L'),
      rect(0, 2, 2, 1, 'L'),
      rect(7, 2, 2, 1, 'L'),
      rect(0, 6, 2, 1, 'L'),
      rect(7, 6, 2, 1, 'L'),
      sq(2, 2, 'L'),
      sq(6, 2, 'L'),
      sq(2, 6, 'L'),
      sq(6, 6, 'L'),
      rect(3, 2, 3, 1, 'D'),
      rect(3, 6, 3, 1, 'D'),
      rect(2, 3, 1, 3, 'D'),
      rect(6, 3, 1, 3, 'D'),
      rect(0, 3, 2, 3, 'L'),
      rect(7, 3, 2, 3, 'L'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Two-Color Domino',
    size: 12,
    n: 6,
    pieces: cells([
      'M D M D D M',
      'D M D M M D',
      'M D D M M D',
      'D M M D D M',
      'D M M D M D',
      'M D D M D M',
    ]),
  },
  {
    name: 'Two-Color Garden Path',
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        'L M L . . . L M L',
        'M L M . . . M L M',
        'L M L M L M L M L',
        '. . M L M L M . .',
        '. . L M L M L . .',
        '. . M L M L M . .',
        'L M L M L M L M L',
        'M L M . . . M L M',
        'L M L . . . L M L',
      ]),
      rect(3, 0, 3, 2, 'L'),
      rect(3, 7, 3, 2, 'L'),
      rect(0, 3, 2, 3, 'L'),
      rect(7, 3, 2, 3, 'L'),
    ],
  },
  {
    name: 'Nine-Patch Plaid',
    size: 12,
    n: 6,
    pieces: cells([
      'N M M M M M',
      'M Q L L L Q',
      'M L Q K Q L',
      'M L K Q K L',
      'M L Q K Q L',
      'M Q L L L Q',
    ]),
  },
  {
    name: 'Alabama',
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        'D M M . . . M M D',
        'M D L . . . L D M',
        'M L D . . . D L M',
        '. . . D L D . . .',
        '. . . L D L . . .',
        '. . . D L D . . .',
        'M L D . . . D L M',
        'M D L . . . L D M',
        'D M M . . . M M D',
      ]),
      rect(3, 0, 3, 1, 'M'),
      rect(3, 1, 3, 1, 'L'),
      rect(3, 2, 3, 1, 'M'),
      rect(3, 6, 3, 1, 'M'),
      rect(3, 7, 3, 1, 'L'),
      rect(3, 8, 3, 1, 'M'),
      rect(0, 3, 1, 3, 'M'),
      rect(1, 3, 1, 3, 'L'),
      rect(2, 3, 1, 3, 'M'),
      rect(6, 3, 1, 3, 'M'),
      rect(7, 3, 1, 3, 'L'),
      rect(8, 3, 1, 3, 'M'),
    ],
  },
  {
    name: 'Four-Color Domino',
    size: 12,
    n: 6,
    pieces: cells([
      'L K L M M L',
      'K L M D D M',
      'L M M D D M',
      'M D D M M L',
      'M D D M L K',
      'L M M L K L',
    ]),
  },
  {
    name: 'Streak of Lightning',
    size: 12,
    n: 6,
    pieces: cells([
      'D D L L D D',
      'D L L D D L',
      'L L D D L L',
      'L D D L L D',
      'D D L L D D',
      'D L L D D L',
    ]),
  },
  {
    name: 'Tree Everlasting I',
    size: 9,
    n: 3,
    pieces: cells(['/LD /LD /LD', '/LD /LD /LD', '/LD /LD /LD']),
  },
  {
    name: 'Lightning Streaks',
    size: 12,
    n: 6,
    pieces: cells([
      '/LM /LM /LM /LM /LM /LM',
      '/ML /ML /ML /ML /ML /ML',
      '/LM /LM /LM /LM /LM /LM',
      '/ML /ML /ML /ML /ML /ML',
      '/LM /LM /LM /LM /LM /LM',
      '/ML /ML /ML /ML /ML /ML',
    ]),
  },
  {
    name: 'Hourglass II',
    size: 9,
    n: 3,
    pieces: cells(['M N \\ML', 'N L N', '\\LM N M']),
  },
  {
    name: 'Practical Orchard',
    size: 9,
    n: 3,
    pieces: cells(['M L M', 'L xMLML L', 'M L M']),
  },
  {
    name: 'Sawtooth',
    size: 12,
    n: 6,
    pieces: cells([
      '/LM /LM /LM /LM /LM L',
      '/LM M M M /ML L',
      '/LM M M /ML 2L .',
      '/LM M /ML L . .',
      '/LM /ML 2L . 2L .',
      'L L . . . .',
    ]),
  },
  {
    name: 'Sawtooth Square',
    size: 9,
    n: 3,
    pieces: cells(['D \\DL \\DL', '\\LD D /DL', '\\LD /DL L']),
  },
  {
    name: 'Triplet',
    size: 9,
    n: 6,
    pieces: cells([
      '2D . 2L . 2D .',
      '. . . . . .',
      '\\LD /LD \\DL /DL \\LD /LD',
      '/DL \\DL /LD \\LD /DL \\DL',
      '2D . 2L . 2D .',
      '. . . . . .',
    ]),
  },
  {
    name: "Clown's Choice",
    size: 9,
    n: 3,
    pieces: cells(['xMLML L xMLML', 'L xMLML L', 'xMLML L xMLML']),
  },
  {
    name: "Malvina's Chain",
    size: 9,
    n: 3,
    pieces: cells(['xLDLD xDLDL xLDLD', 'xDLDL xDLDL xDLDL', 'xLDLD xDLDL xLDLD']),
  },
  {
    name: 'The X Patch',
    size: 9,
    n: 3,
    pieces: cells(['xMLML M xMLML', 'M xMLML M', 'xMLML M xMLML']),
  },
  {
    name: 'Checkerboard',
    size: 8.5,
    n: 6,
    pieces: [
      {
        poly: [
          [1, 0],
          [0, 1],
          [0, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [2, 1],
          [1, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 0],
          [4, 1],
          [3, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [6, 1],
          [5, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 0],
          [2, 1],
          [1, 2],
          [0, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 0],
          [4, 1],
          [3, 2],
          [2, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 0],
          [6, 1],
          [5, 2],
          [4, 1],
        ],
        c: 'S',
      },
      {
        poly: [
          [1, 2],
          [0, 3],
          [0, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [3, 2],
          [2, 3],
          [1, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 1],
          [5, 2],
          [4, 3],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 1],
          [6, 3],
          [5, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 2],
          [2, 3],
          [1, 4],
          [0, 3],
        ],
        c: 'S',
      },
      {
        poly: [
          [3, 2],
          [4, 3],
          [3, 4],
          [2, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 2],
          [6, 3],
          [5, 4],
          [4, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 4],
          [0, 5],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3],
          [3, 4],
          [2, 5],
          [1, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 3],
          [5, 4],
          [4, 5],
          [3, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [6, 5],
          [5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 4],
          [2, 5],
          [1, 6],
          [0, 5],
        ],
        c: 'P',
      },
      {
        poly: [
          [3, 4],
          [4, 5],
          [3, 6],
          [2, 5],
        ],
        c: 'Q',
      },
      {
        poly: [
          [5, 4],
          [6, 5],
          [5, 6],
          [4, 5],
        ],
        c: 'P',
      },
      {
        poly: [
          [1, 6],
          [0, 6],
          [0, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 5],
          [3, 6],
          [1, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 5],
          [5, 6],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 5],
          [6, 6],
          [5, 6],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Arbor Window',
    size: 8.5,
    n: 6,
    pieces: [
      {
        poly: [
          [1, 0],
          [0, 1],
          [0, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [2, 1],
          [1, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 0],
          [4, 1],
          [3, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [6, 1],
          [5, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 0],
          [2, 1],
          [1, 2],
          [0, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 0],
          [4, 1],
          [3, 2],
          [2, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 0],
          [6, 1],
          [5, 2],
          [4, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 2],
          [0, 3],
          [0, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [3, 2],
          [2, 3],
          [1, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 1],
          [5, 2],
          [4, 3],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 1],
          [6, 3],
          [5, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 2],
          [2, 3],
          [1, 4],
          [0, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 2],
          [4, 3],
          [3, 4],
          [2, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 2],
          [6, 3],
          [5, 4],
          [4, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 4],
          [0, 5],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3],
          [3, 4],
          [2, 5],
          [1, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 3],
          [5, 4],
          [4, 5],
          [3, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [6, 5],
          [5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 4],
          [2, 5],
          [1, 6],
          [0, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 4],
          [4, 5],
          [3, 6],
          [2, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 4],
          [6, 5],
          [5, 6],
          [4, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 6],
          [0, 6],
          [0, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 5],
          [3, 6],
          [1, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 5],
          [5, 6],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 5],
          [6, 6],
          [5, 6],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Nine-Patch Variation II',
    size: 12,
    n: 6,
    pieces: cells([
      '/LM \\LM /LM \\LM /LM \\LM',
      '\\ML /ML \\ML /ML \\ML /ML',
      '/LM \\LM /LM \\LM /LM \\LM',
      '\\ML /ML \\ML /ML \\ML /ML',
      '/LM \\LM /LM \\LM /LM \\LM',
      '\\ML /ML \\ML /ML \\ML /ML',
    ]),
  },
  {
    name: 'Nine-Patch on Point',
    size: 8.5,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [3, 0],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [6, 0],
          [6, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [0, 6],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [6, 6],
          [3, 6],
        ],
        c: 'L',
      },
      ...(
        [
          [3, 1],
          [1, 3],
          [3, 3],
          [5, 3],
          [3, 5],
        ] as [number, number][]
      ).map(([x, y]) => ({
        poly: [
          [x, y - 1],
          [x + 1, y],
          [x, y + 1],
          [x - 1, y],
        ] as [number, number][],
        c: 'M',
      })),
      ...(
        [
          [2, 2],
          [4, 2],
          [2, 4],
          [4, 4],
        ] as [number, number][]
      ).map(([x, y]) => ({
        poly: [
          [x, y - 1],
          [x + 1, y],
          [x, y + 1],
          [x - 1, y],
        ] as [number, number][],
        c: 'L',
      })),
    ],
  },
  {
    name: 'Hourglass III',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '. . . . . .',
        '. L /LM \\LM L .',
        '. /LM 2L . \\LM .',
        '. \\ML . . /ML .',
        '. L \\ML /ML L .',
        '. . . . . .',
      ]),
      ...[0, 1, 4, 5].flatMap((x) => [sq(x, 0, 'M'), sq(x, 5, 'M')]),
      sq(0, 1, 'M'),
      sq(0, 4, 'M'),
      sq(5, 1, 'M'),
      sq(5, 4, 'M'),
      rect(2, 0, 2, 1, 'M'),
      rect(2, 5, 2, 1, 'M'),
      rect(0, 2, 1, 2, 'M'),
      rect(5, 2, 1, 2, 'M'),
    ],
  },
  {
    name: "Aunt Vinah's Favorite",
    size: 13,
    n: 12,
    pieces: [
      ...hst(0, 0, '/', 'L', 'M', 4),
      ...hst(8, 0, '\\', 'L', 'M', 4),
      ...hst(0, 8, '\\', 'M', 'L', 4),
      ...hst(8, 8, '/', 'M', 'L', 4),
      rect(4, 4, 4, 4, 'L'),
      // edge cells: a small nine-patch on point (top, right, bottom, left diamonds)
      ...(
        [
          [4, 0, 'L', 'N', 'L', 'N'],
          [0, 4, 'N', 'L', 'N', 'L'],
          [8, 4, 'N', 'L', 'N', 'L'],
          [4, 8, 'L', 'N', 'L', 'N'],
        ] as [number, number, string, string, string, string][]
      ).flatMap(([x, y, t, r, b, l]) => {
        const p = (a: number, c: number): [number, number] => [x + a, y + c];
        return [
          { poly: [p(0, 0), p(2, 0), p(0, 2)], c: 'L' },
          { poly: [p(2, 0), p(4, 0), p(4, 2)], c: 'L' },
          { poly: [p(4, 2), p(4, 4), p(2, 4)], c: 'L' },
          { poly: [p(0, 2), p(0, 4), p(2, 4)], c: 'L' },
          { poly: [p(2, 0), p(3, 1), p(2, 2), p(1, 1)], c: t },
          { poly: [p(3, 1), p(4, 2), p(3, 3), p(2, 2)], c: r },
          { poly: [p(2, 2), p(3, 3), p(2, 4), p(1, 3)], c: b },
          { poly: [p(1, 1), p(2, 2), p(1, 3), p(0, 2)], c: l },
        ];
      }),
    ],
  },
  {
    name: 'Jefferson City',
    size: 9,
    n: 3,
    pieces: cells(['xMLML xDLDL xMLML', 'xMDMD L xMDMD', 'xMLML xDLDL xMLML']),
  },
  {
    name: 'Nine-Patch Frame',
    size: 12,
    n: 6,
    pieces: cells([
      'D D /LM \\LM D D',
      'D /DM /ML \\ML \\DM D',
      '/LM /ML D D \\ML \\LM',
      '\\ML \\LM D D /LM /ML',
      'D \\MD \\LM /LM /MD D',
      'D D \\ML /ML D D',
    ]),
    open: 'v 3 2, v 3 3, h 2 3, h 3 3',
  },
  {
    name: "Aunt Sukey's Choice",
    size: 12,
    n: 6,
    pieces: cells([
      'M L /LM \\LM L M',
      'L L /ML \\ML L L',
      '/LM /ML 2D . \\ML \\LM',
      '\\ML \\LM . . /LM /ML',
      'L L \\LM /LM L L',
      'M L \\ML /ML L M',
    ]),
  },
  {
    name: 'Illinois',
    size: 9,
    n: 6,
    pieces: [
      ...cells([
        '2/DL . /LD \\LD 2\\DL .',
        '. . /LD \\LD . .',
        '/LD /LD . . \\LD \\LD',
        '\\DL \\DL . . /DL /DL',
        '2\\LD . \\DL /DL 2/LD .',
        '. . \\DL /DL . .',
      ]),
      ...sqInSq(2, 2, 2, 'L', 'D'),
    ],
  },
  {
    name: 'Crosspatch',
    size: 9,
    n: 9,
    pieces: [
      ...cells([
        'N L L L N L L L N',
        'L N L N L N L N L',
        'L L N L L L N L L',
        'L N L . . . L N L',
        'N L L . . . L L N',
        'L N L . . . L N L',
        'L L N L L L N L L',
        'L N L N L N L N L',
        'N L L L N L L L N',
      ]),
      ...qst(3, 3, 3, 'M', 'K', 'M', 'K'),
    ],
  },
  {
    name: 'At the Square',
    size: 9,
    n: 9,
    pieces: [
      ...qst(0, 0, 3, 'M', 'D', 'M', 'D'),
      ...qst(6, 0, 3, 'M', 'D', 'M', 'D'),
      ...qst(0, 6, 3, 'M', 'D', 'M', 'D'),
      ...qst(6, 6, 3, 'M', 'D', 'M', 'D'),
      rect(3, 0, 3, 1, 'M'),
      rect(3, 1, 3, 1, 'D'),
      rect(3, 2, 3, 1, 'M'),
      rect(3, 6, 3, 1, 'M'),
      rect(3, 7, 3, 1, 'D'),
      rect(3, 8, 3, 1, 'M'),
      rect(0, 3, 1, 3, 'D'),
      rect(1, 3, 1, 3, 'M'),
      rect(2, 3, 1, 3, 'D'),
      rect(6, 3, 1, 3, 'D'),
      rect(7, 3, 1, 3, 'M'),
      rect(8, 3, 1, 3, 'D'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Chain and Hourglass',
    size: 9,
    n: 9,
    pieces: [
      ...qst(0, 0, 3, 'L', 'M', 'L', 'M'),
      ...qst(6, 0, 3, 'L', 'M', 'L', 'M'),
      ...qst(0, 6, 3, 'L', 'M', 'L', 'M'),
      ...qst(6, 6, 3, 'L', 'M', 'L', 'M'),
      ...qst(3, 3, 3, 'M', 'L', 'M', 'L'),
      rect(3, 0, 1, 3, 'L'),
      rect(4, 0, 1, 3, 'M'),
      rect(5, 0, 1, 3, 'L'),
      rect(3, 6, 1, 3, 'L'),
      rect(4, 6, 1, 3, 'M'),
      rect(5, 6, 1, 3, 'L'),
      rect(0, 3, 3, 1, 'L'),
      rect(0, 4, 3, 1, 'M'),
      rect(0, 5, 3, 1, 'L'),
      rect(6, 3, 3, 1, 'L'),
      rect(6, 4, 3, 1, 'M'),
      rect(6, 5, 3, 1, 'L'),
    ],
  },
  {
    name: "Mother's Dream Nine-Patch",
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        '. . . \\LM . /LM . . .',
        '. . . \\LM . /LM . . .',
        '. . . \\LM . /LM . . .',
        '\\ML \\ML \\ML . . . /ML /ML /ML',
        '. . . . . . . . .',
        '/LM /LM /LM . . . \\LM \\LM \\LM',
        '. . . /ML . \\ML . . .',
        '. . . /ML . \\ML . . .',
        '. . . /ML . \\ML . . .',
      ]),
      ...sqInSq(0, 0, 3, 'L', 'D'),
      ...sqInSq(6, 0, 3, 'L', 'D'),
      ...sqInSq(3, 3, 3, 'L', 'D'),
      ...sqInSq(0, 6, 3, 'L', 'D'),
      ...sqInSq(6, 6, 3, 'L', 'D'),
      rect(4, 0, 1, 3, 'M'),
      rect(4, 6, 1, 3, 'M'),
      rect(0, 4, 3, 1, 'M'),
      rect(6, 4, 3, 1, 'M'),
    ],
  },
  {
    name: 'Box Kite',
    size: 9,
    n: 3,
    pieces: cells(['/LD /LM \\LD', '/LM D /ML', '\\DL /ML /DL']),
  },
  {
    name: 'Londontown Roads',
    size: 9,
    n: 9,
    pieces: [
      ...qst(0, 0, 3, 'D', 'L', 'D', 'L'),
      ...qst(6, 6, 3, 'D', 'L', 'D', 'L'),
      ...qst(6, 0, 3, 'L', 'D', 'L', 'D'),
      ...qst(0, 6, 3, 'L', 'D', 'L', 'D'),
      rect(3, 0, 3, 1, 'K'),
      rect(3, 1, 3, 1, 'L'),
      rect(3, 2, 3, 1, 'K'),
      rect(3, 6, 3, 1, 'K'),
      rect(3, 7, 3, 1, 'L'),
      rect(3, 8, 3, 1, 'K'),
      rect(0, 3, 1, 3, 'K'),
      rect(1, 3, 1, 3, 'L'),
      rect(2, 3, 1, 3, 'K'),
      rect(6, 3, 1, 3, 'K'),
      rect(7, 3, 1, 3, 'L'),
      rect(8, 3, 1, 3, 'K'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Beggar Block',
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        '\\LD . /LD \\DL D /DL \\LD . /LD',
        'D . D . . . D . D',
        '/DL . \\DL /LD D \\LD /DL . \\DL',
        '\\DL D /DL . . . \\DL D /DL',
        '. . . . . . . . .',
        '/LD D \\LD . . . /LD D \\LD',
        '\\LD . /LD \\DL D /DL \\LD . /LD',
        'D . D . . . D . D',
        '/DL . \\DL /LD D \\LD /DL . \\DL',
      ]),
      rect(1, 0, 1, 3, 'K'),
      rect(7, 0, 1, 3, 'K'),
      rect(1, 6, 1, 3, 'K'),
      rect(7, 6, 1, 3, 'K'),
      rect(3, 1, 3, 1, 'K'),
      rect(3, 7, 3, 1, 'K'),
      rect(0, 4, 3, 1, 'K'),
      rect(6, 4, 3, 1, 'K'),
      rect(3, 3, 3, 3, 'M'),
    ],
  },
  {
    name: 'No-Name Nine-Patch',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'K M /DL \\DL M K',
        'M D \\LD /LD D M',
        '/DL \\DL . . /DL \\DL',
        '\\LD /LD . . \\LD /LD',
        'M D /DL \\DL D M',
        'K M \\LD /LD M K',
      ]),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: "Mollie's Choice",
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        '/LD /LD . . . . . \\LD \\LD',
        '/LD . . . . . . . \\LD',
        '. . . . . . . . .',
        '. . . . . . . . .',
        '. . . . . . . . .',
        '. . . . . . . . .',
        '. . . . . . . . .',
        '\\DL . . . . . . . /DL',
        '\\DL \\DL . . . . . /DL /DL',
      ]),
      {
        poly: [
          [3, 0],
          [4.5, 0],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [4.5, 0],
          [6, 0],
          [6, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 1],
          [4.5, 0],
          [4.5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [4.5, 0],
          [6, 1],
          [4.5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [3, 3],
          [4.5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 2],
          [6, 3],
          [4.5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 2],
          [4.5, 2],
          [4.5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4.5, 2],
          [6, 2],
          [4.5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 6],
          [4.5, 6],
          [3, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [4.5, 6],
          [6, 6],
          [6, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 7],
          [4.5, 6],
          [4.5, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [4.5, 6],
          [6, 7],
          [4.5, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 8],
          [3, 9],
          [4.5, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 8],
          [6, 9],
          [4.5, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 8],
          [4.5, 8],
          [4.5, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [4.5, 8],
          [6, 8],
          [4.5, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [1, 3],
          [0, 4.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 4.5],
          [0, 6],
          [1, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 3],
          [1, 4.5],
          [0, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4.5],
          [1, 4.5],
          [1, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3],
          [3, 3],
          [3, 4.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 4.5],
          [3, 6],
          [2, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 3],
          [2, 4.5],
          [3, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4.5],
          [2, 6],
          [3, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [7, 3],
          [6, 4.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 4.5],
          [6, 6],
          [7, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [7, 3],
          [7, 4.5],
          [6, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 4.5],
          [7, 4.5],
          [7, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 3],
          [9, 3],
          [9, 4.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 4.5],
          [9, 6],
          [8, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 3],
          [8, 4.5],
          [9, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 4.5],
          [8, 6],
          [9, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [3, 0],
          [2, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 1],
          [2, 1],
          [1, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [0, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 0],
          [7, 0],
          [7, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [7, 1],
          [8, 1],
          [8, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 2],
          [9, 2],
          [9, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 6],
          [0, 7],
          [1, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 7],
          [1, 8],
          [2, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 8],
          [2, 9],
          [3, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 6],
          [9, 7],
          [8, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 7],
          [8, 8],
          [7, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [7, 8],
          [7, 9],
          [6, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 3],
          [3, 0],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [9, 3],
          [6, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 6],
          [3, 6],
          [3, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 9],
          [9, 6],
          [6, 6],
        ],
        c: 'L',
      },
      rect(3, 1, 3, 1, 'D'),
      rect(3, 7, 3, 1, 'D'),
      rect(1, 3, 1, 3, 'D'),
      rect(7, 3, 1, 3, 'D'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Jackknife',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '/LD /DL . . \\DL \\LD',
        '/DL /LD . . \\LD \\DL',
        '. . . . . .',
        '. . . . . .',
        '\\LD \\DL . . /DL /LD',
        '\\DL \\LD . . /LD /DL',
      ]),
      rect(2, 2, 2, 2, 'L'),
      ...qst(2, 0, 2, 'D', 'L', 'D', 'L'),
      ...qst(2, 4, 2, 'D', 'L', 'D', 'L'),
      ...qst(0, 2, 2, 'L', 'D', 'L', 'D'),
      ...qst(4, 2, 2, 'L', 'D', 'L', 'D'),
    ],
  },
  {
    name: 'Handy Andy II',
    size: 12,
    n: 6,
    pieces: cells([
      'N /NL \\ML /ML \\NL N',
      '/NL M /MK \\MK M \\NL',
      '\\LM /MK /LQ \\LQ \\MK /LM',
      '/ML \\KM \\QL /QL /KM \\ML',
      '\\LN M \\KM /KM M /LN',
      'N \\LN /LM \\LM /LN N',
    ]),
    open: 'v 1 0, h 0 1, v 5 0, h 5 1, v 1 5, h 0 5, v 5 5, h 5 5, v 3 2, v 3 3, h 2 3, h 3 3',
  },
  {
    name: 'Crab Claws',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '/LD L \\LD L /LM \\LM',
        '\\DL D /DM M M L',
        'L D . . \\MD /ML',
        '/LM \\DM . . D L',
        'L M M /MD D \\LD',
        '\\ML /ML L \\DL L \\LD',
      ]),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: 'Color Wheel',
    size: 9,
    n: 3,
    pieces: [
      rect(1, 1, 1, 1, 'K'),
      {
        poly: [
          [0, 0],
          [1, 0],
          [0, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 0],
          [1, 1],
          [0, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 0],
          [3, 0],
          [3, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [3, 1],
          [2, 1],
        ],
        c: 'Q',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [1, 3],
        ],
        c: 'P',
      },
      {
        poly: [
          [0, 2],
          [1, 3],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 2],
          [3, 2],
          [2, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [3, 2],
          [3, 3],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 0],
          [1, 1],
          [2, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 0],
          [2, 0],
          [1.5, 0.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1.5, 0.5],
        ],
        c: 'Q',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [1, 1],
        ],
        c: 'P',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [0.5, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 1],
          [0, 2],
          [0.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [3, 1],
          [2, 2],
        ],
        c: 'Q',
      },
      {
        poly: [
          [3, 1],
          [3, 2],
          [2.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [2, 2],
          [2.5, 1.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 2],
          [2, 2],
          [2, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 2],
          [1, 3],
          [1.5, 2.5],
        ],
        c: 'P',
      },
      {
        poly: [
          [1, 3],
          [2, 3],
          [1.5, 2.5],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Castles in the Air',
    size: 9,
    n: 3,
    pieces: [
      ...hst(0, 0, '/', 'L', 'K'),
      ...hst(2, 0, '\\', 'L', 'N'),
      ...hst(0, 2, '\\', 'N', 'L'),
      ...hst(2, 2, '/', 'K', 'L'),
      ...sqInSq(1, 1, 1, 'KMKM', 'L'),
      {
        poly: [
          [1, 0],
          [1, 1],
          [2, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 0],
          [2, 0],
          [1.5, 0.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1.5, 0.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [1, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 1],
          [0, 2],
          [0.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [0.5, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 1],
          [2, 2],
          [3, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 1],
          [3, 1],
          [2.5, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 1],
          [3, 2],
          [2.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 2],
          [2, 2],
          [2, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 2],
          [1, 3],
          [1.5, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 3],
          [2, 3],
          [1.5, 2.5],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Boxes',
    size: 12,
    n: 6,
    pieces: cells([
      'M /MQ \\KQ /KQ \\MQ M',
      '/MQ M /MN \\MN M \\MQ',
      '\\QK /MN /NM \\NM \\MN /QK',
      '/KQ \\NM \\MN /MN /NM \\KQ',
      '\\QM M \\NM /NM M /QM',
      'M \\QM /QK \\QK /QM M',
    ]),
  },
  {
    name: 'Card Tricks',
    size: 9,
    n: 3,
    pieces: [
      ...hst(0, 0, '/', 'L', 'M'),
      ...hst(2, 0, '\\', 'L', 'D'),
      ...hst(0, 2, '\\', 'D', 'L'),
      ...hst(2, 2, '/', 'M', 'L'),
      ...qst(1, 1, 1, 'M', 'D', 'M', 'D'),
      {
        poly: [
          [1, 0],
          [1, 1],
          [2, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 0],
          [2, 0],
          [1.5, 0.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1.5, 0.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [1, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [0.5, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 1],
          [0, 2],
          [0.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [3, 1],
          [2, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 1],
          [3, 2],
          [2.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [2, 2],
          [2.5, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 2],
          [2, 2],
          [2, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 2],
          [1, 3],
          [1.5, 2.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 3],
          [2, 3],
          [1.5, 2.5],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Cards with Diamonds',
    size: 9,
    n: 3,
    pieces: [
      ...hst(0, 0, '/', 'L', 'Q'),
      ...hst(2, 0, '\\', 'L', 'Q'),
      ...hst(0, 2, '\\', 'Q', 'L'),
      ...hst(2, 2, '/', 'Q', 'L'),
      ...sqInSq(1, 1, 1, 'L', 'P'),
      {
        poly: [
          [1, 0],
          [1, 1],
          [2, 1],
        ],
        c: 'P',
      },
      {
        poly: [
          [1, 0],
          [2, 0],
          [1.5, 0.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1.5, 0.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [1, 1],
        ],
        c: 'P',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [0.5, 1.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 1],
          [0, 2],
          [0.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [3, 1],
          [2, 2],
        ],
        c: 'P',
      },
      {
        poly: [
          [3, 1],
          [3, 2],
          [2.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [2, 2],
          [2.5, 1.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 2],
          [2, 2],
          [2, 3],
        ],
        c: 'P',
      },
      {
        poly: [
          [1, 2],
          [1, 3],
          [1.5, 2.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 3],
          [2, 3],
          [1.5, 2.5],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Fort Sumter',
    size: 11,
    n: 11,
    pieces: [
      {
        poly: [
          [0, 0],
          [1.875, 0],
          [3.6875, 1.8125],
          [1.8125, 3.6875],
          [0, 1.875],
        ],
        c: 'D',
      },
      {
        poly: [
          [1.875, 0],
          [5.5, 0],
          [3.6875, 1.8125],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 1.875],
          [0, 5.5],
          [1.8125, 3.6875],
        ],
        c: 'M',
      },
      {
        poly: [
          [4.125, 1.375],
          [5.5, 2.75],
          [2.75, 5.5],
          [1.375, 4.125],
        ],
        c: 'L',
      },
      {
        poly: [
          [11, 0],
          [9.125, 0],
          [7.3125, 1.8125],
          [9.1875, 3.6875],
          [11, 1.875],
        ],
        c: 'D',
      },
      {
        poly: [
          [9.125, 0],
          [5.5, 0],
          [7.3125, 1.8125],
        ],
        c: 'M',
      },
      {
        poly: [
          [11, 1.875],
          [11, 5.5],
          [9.1875, 3.6875],
        ],
        c: 'M',
      },
      {
        poly: [
          [6.875, 1.375],
          [5.5, 2.75],
          [8.25, 5.5],
          [9.625, 4.125],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 11],
          [1.875, 11],
          [3.6875, 9.1875],
          [1.8125, 7.3125],
          [0, 9.125],
        ],
        c: 'D',
      },
      {
        poly: [
          [1.875, 11],
          [5.5, 11],
          [3.6875, 9.1875],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 9.125],
          [0, 5.5],
          [1.8125, 7.3125],
        ],
        c: 'M',
      },
      {
        poly: [
          [4.125, 9.625],
          [5.5, 8.25],
          [2.75, 5.5],
          [1.375, 6.875],
        ],
        c: 'L',
      },
      {
        poly: [
          [11, 11],
          [9.125, 11],
          [7.3125, 9.1875],
          [9.1875, 7.3125],
          [11, 9.125],
        ],
        c: 'D',
      },
      {
        poly: [
          [9.125, 11],
          [5.5, 11],
          [7.3125, 9.1875],
        ],
        c: 'M',
      },
      {
        poly: [
          [11, 9.125],
          [11, 5.5],
          [9.1875, 7.3125],
        ],
        c: 'M',
      },
      {
        poly: [
          [6.875, 9.625],
          [5.5, 8.25],
          [8.25, 5.5],
          [9.625, 6.875],
        ],
        c: 'L',
      },
      {
        poly: [
          [5.5, 0],
          [6.875, 1.375],
          [5.5, 2.75],
          [4.125, 1.375],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 5.5],
          [1.375, 4.125],
          [2.75, 5.5],
          [1.375, 6.875],
        ],
        c: 'D',
      },
      {
        poly: [
          [11, 5.5],
          [9.625, 4.125],
          [8.25, 5.5],
          [9.625, 6.875],
        ],
        c: 'D',
      },
      {
        poly: [
          [5.5, 11],
          [6.875, 9.625],
          [5.5, 8.25],
          [4.125, 9.625],
        ],
        c: 'D',
      },
      {
        poly: [
          [5.5, 2.75],
          [8.25, 5.5],
          [5.5, 8.25],
          [2.75, 5.5],
        ],
        c: 'M',
      },
    ],
  },
  {
    name: 'Garden Path',
    size: 12,
    n: 6,
    pieces: cells([
      'S /LK /LD \\LD \\LM P',
      '/LM /LD /DL \\DL \\LD \\LK',
      '/LD /DL K S \\DL \\LD',
      '\\DL \\LD P M /LD /DL',
      '\\KL \\DL \\LD /LD /DL /ML',
      'P \\ML \\DL /DL /KL S',
    ]),
  },
  {
    name: "Grandmother's Own IV",
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'M M /MD \\MD M M',
        'M L . . L M',
        '/MD . . . . \\MD',
        '\\DM . . . . /DM',
        'M L . . L M',
        'M M \\DM /DM M M',
      ]),
      rect(2, 1, 2, 1, 'D'),
      rect(2, 4, 2, 1, 'D'),
      rect(1, 2, 1, 2, 'D'),
      rect(4, 2, 1, 2, 'D'),
      rect(2, 2, 2, 2, 'D'),
    ],
  },
  {
    name: 'Lucky Clover',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L D /DP \\SM S L',
        'P L P M L M',
        '/PD D . . S \\MS',
        '\\SM S . . D /DP',
        'M L M P L P',
        'L S \\MS /PD D L',
      ]),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: "Mrs. Cleveland's Choice",
    size: 12,
    n: 12,
    pieces: [
      ...hst(0, 0, '/', 'L', 'P', 2),
      ...hst(2, 0, '/', 'M', 'P', 2),
      ...hst(0, 2, '/', 'M', 'P', 2),
      ...hst(2, 2, '/', 'D', 'L', 2),
      ...hst(8, 0, '\\', 'M', 'P', 2),
      ...hst(10, 0, '\\', 'L', 'P', 2),
      ...hst(8, 2, '\\', 'D', 'L', 2),
      ...hst(10, 2, '\\', 'M', 'P', 2),
      ...hst(0, 8, '\\', 'P', 'M', 2),
      ...hst(2, 8, '\\', 'L', 'D', 2),
      ...hst(0, 10, '\\', 'P', 'L', 2),
      ...hst(2, 10, '\\', 'P', 'M', 2),
      ...hst(8, 8, '/', 'L', 'D', 2),
      ...hst(10, 8, '/', 'P', 'M', 2),
      ...hst(8, 10, '/', 'P', 'M', 2),
      ...hst(10, 10, '/', 'P', 'L', 2),
      {
        poly: [
          [4, 0],
          [6, 0],
          [4, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 12],
          [6, 12],
          [4, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 0],
          [8, 0],
          [8, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 12],
          [8, 12],
          [8, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 0],
          [6, 2],
          [4, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 12],
          [6, 10],
          [4, 10],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 0],
          [8, 2],
          [6, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 12],
          [8, 10],
          [6, 10],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [4, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 10],
          [6, 10],
          [4, 8],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 2],
          [8, 2],
          [8, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 10],
          [8, 10],
          [8, 8],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 2],
          [5, 3],
          [7, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 10],
          [5, 9],
          [7, 9],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 3],
          [7, 3],
          [6, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 9],
          [7, 9],
          [6, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 4],
          [5, 3],
          [6, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 8],
          [5, 9],
          [6, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 4],
          [7, 3],
          [8, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 8],
          [7, 9],
          [8, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [0, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 4],
          [10, 4],
          [12, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 6],
          [2, 8],
          [0, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 6],
          [10, 8],
          [12, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 6],
          [2, 4],
          [2, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [12, 6],
          [10, 4],
          [10, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 6],
          [2, 6],
          [2, 8],
        ],
        c: 'K',
      },
      {
        poly: [
          [12, 6],
          [10, 6],
          [10, 8],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 4],
          [4, 4],
          [2, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [10, 4],
          [8, 4],
          [10, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 6],
          [2, 8],
          [4, 8],
        ],
        c: 'K',
      },
      {
        poly: [
          [10, 6],
          [10, 8],
          [8, 8],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 6],
          [3, 5],
          [3, 7],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 6],
          [9, 5],
          [9, 7],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 5],
          [4, 6],
          [3, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 5],
          [8, 6],
          [9, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 5],
          [4, 4],
          [4, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [9, 5],
          [8, 4],
          [8, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 7],
          [4, 6],
          [4, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [9, 7],
          [8, 6],
          [8, 8],
        ],
        c: 'M',
      },
      rect(4, 4, 4, 1, 'D'),
      rect(4, 7, 4, 1, 'D'),
      rect(4, 5, 1, 2, 'D'),
      rect(7, 5, 1, 2, 'D'),
      ...sqInSq(5, 5, 2, 'L', 'D'),
    ],
  },
  {
    name: "Gentleman's Fancy",
    size: 12,
    n: 6,
    pieces: cells([
      'K /KD \\LD /LD \\KD K',
      '/KD M /ML \\ML M \\KD',
      '\\DL /ML 2D . \\ML /DL',
      '/LD \\LM . . /LM \\LD',
      '\\DK M \\LM /LM M /DK',
      'K \\DK /DL \\DL /DK K',
    ]),
    open: 'v 1 0, h 0 1, v 5 0, h 5 1, h 0 5, v 1 5, v 5 5, h 5 5',
  },
  {
    name: "Stone Mason's Puzzle",
    size: 14,
    n: 7,
    pieces: [
      ...cells([
        'N L . . . L N',
        'L L . . . L L',
        '. . M K M . .',
        '. . K N K . .',
        '. . M K M . .',
        'L L . . . L L',
        'N L . . . L N',
      ]),
      rect(2, 0, 1, 2, 'M'),
      rect(4, 0, 1, 2, 'M'),
      rect(2, 5, 1, 2, 'M'),
      rect(4, 5, 1, 2, 'M'),
      rect(0, 2, 2, 1, 'M'),
      rect(5, 2, 2, 1, 'M'),
      rect(0, 4, 2, 1, 'M'),
      rect(5, 4, 2, 1, 'M'),
      rect(3, 0, 1, 2, 'K'),
      rect(3, 5, 1, 2, 'K'),
      rect(0, 3, 2, 1, 'K'),
      rect(5, 3, 2, 1, 'K'),
    ],
  },
  {
    name: 'California',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L L . . L L',
        'L /LM \\NM /NM \\LM L',
        '. \\MN . . /MN .',
        '. /NM . . \\NM .',
        'L \\ML /MN \\MN /ML L',
        'L L . . L L',
      ]),
      rect(2, 0, 2, 1, 'N'),
      rect(2, 5, 2, 1, 'N'),
      rect(0, 2, 1, 2, 'N'),
      rect(5, 2, 1, 2, 'N'),
      ...sqInSq(2, 2, 2, 'M', 'K'),
    ],
  },
  {
    name: 'Merry Kite',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'K D \\LK /LK D K',
        'D M \\KM /KM M D',
        '\\KL \\MK . . /MK /KL',
        '/LK /KM . . \\KM \\LK',
        'D M /MK \\MK M D',
        'K D /KL \\KL D K',
      ]),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Flying Dutchman II',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '. . . \\DL /DL .',
        '\\LD /LD /DL /LD \\LD .',
        '/DL \\DL \\LD /DL \\DL .',
        '. \\LD /LD \\DL \\LD /LD',
        '. \\DL /DL /LD /DL \\DL',
        '. /LD \\LD . . .',
      ]),
      rect(0, 0, 3, 1, 'L'),
      rect(5, 0, 1, 3, 'L'),
      rect(0, 3, 1, 3, 'L'),
      rect(3, 5, 3, 1, 'L'),
    ],
  },
  {
    name: 'Swing-in-the-Center',
    size: 12,
    n: 6,
    pieces: cells([
      'D \\LD \\LM /LM /LD D',
      '\\DL /DL \\ML /ML \\DL /DL',
      '\\ML \\LM /LD \\LD /LM /ML',
      '/LM /ML \\DL /DL \\ML \\LM',
      '/LD \\LD /LM \\LM /LD \\LD',
      'D /DL /ML \\ML \\DL D',
    ]),
  },
  {
    name: 'Dumbbell Block',
    size: 12,
    n: 6,
    pieces: cells([
      'M \\LM \\LD /LD /LM M',
      '\\ML /ML \\ML /ML \\ML /ML',
      '\\DL \\LM /LM \\LM /LM /DL',
      '/LD /ML \\ML /ML \\ML \\LD',
      '/LM \\LM /LM \\LM /LM \\LM',
      'M /ML /DL \\DL \\ML M',
    ]),
  },
  {
    name: "Saint George's Cross",
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '/LM \\DM \\MD /MD /DM \\LM',
        '\\MD /ML \\DM /DM \\ML /MD',
        '\\DM \\MD . . /MD /DM',
        '/MD /DM . . \\DM \\MD',
        '/DM \\LM /MD \\MD /LM \\DM',
        '\\ML /MD /DM \\DM \\MD /ML',
      ]),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Capital T',
    size: 9,
    n: 6,
    pieces: [
      ...cells([
        '. . \\LM /LM . .',
        '. . \\LM /LM . .',
        '\\ML \\ML . . /ML /ML',
        '/LM /LM . . \\LM \\LM',
        '. . /ML \\ML . .',
        '. . /ML \\ML . .',
      ]),
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [6, 2],
          [4, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 6],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'L',
      },
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: 'Robbing Peter to Pay Paul Nine-Patch',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LM \\LM /LM /LM L',
        '\\ML /LM . . \\LM /ML',
        '\\ML . . . . /ML',
        '/LM . . . . \\LM',
        '/LM \\ML . . /ML \\LM',
        'L /ML /ML \\ML \\ML L',
      ]),
      rect(2, 1, 2, 1, 'L'),
      rect(2, 4, 2, 1, 'L'),
      rect(1, 2, 1, 2, 'L'),
      rect(4, 2, 1, 2, 'L'),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: 'Love-in-a-Mist',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LM /LM \\LM /LM L',
        '\\ML M \\ML /ML M /ML',
        '/LM \\LM . . /LM \\LM',
        '\\ML /ML . . \\ML /ML',
        '/LM M /LM \\LM M \\LM',
        'L /ML \\ML /ML \\ML L',
      ]),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: 'Indian Puzzle',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LM /DL \\DL /LM L',
        '\\ML M \\DL /DL M /ML',
        '/DL \\LD . . /LD \\DL',
        '\\LD /DL . . \\DL /LD',
        '/LM M /LD \\LD M \\LM',
        'L /ML \\LD /LD \\ML L',
      ]),
      {
        poly: [
          [2, 2],
          [3, 2],
          [2, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 2],
          [4, 2],
          [4, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 3],
          [2, 4],
          [3, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 3],
          [4, 4],
          [3, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 2],
          [4, 3],
          [3, 4],
          [2, 3],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Fancy Contrary Wife',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LD . . /LD L',
        '\\DL D . . D /DL',
        '. . . . . .',
        '. . . . . .',
        '/LD D . . D \\LD',
        'L /DL . . \\DL L',
      ]),
      ...qst(2, 0, 2, 'L', 'D', 'L', 'D'),
      ...qst(2, 4, 2, 'L', 'D', 'L', 'D'),
      ...qst(0, 2, 2, 'D', 'L', 'D', 'L'),
      ...qst(4, 2, 2, 'D', 'L', 'D', 'L'),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Weathervane',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LD /LM \\LM /LD L',
        '\\DL D M M D /DL',
        '/LM M . . M \\LM',
        '\\ML M . . M /ML',
        '/LD D M M D \\LD',
        'L /DL \\ML /ML \\DL L',
      ]),
      rect(2, 2, 2, 2, 'D'),
    ],
  },
  {
    name: 'Arizona II',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LD \\LD /LD /LD L',
        '\\DL /LD . . \\LD /DL',
        '\\DL . . . . /DL',
        '/LD . . . . \\LD',
        '/LD \\DL . . /DL \\LD',
        'L /DL /DL \\DL \\DL L',
      ]),
      rect(2, 1, 2, 1, 'L'),
      rect(2, 4, 2, 1, 'L'),
      rect(1, 2, 1, 2, 'L'),
      rect(4, 2, 1, 2, 'L'),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Union Square',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'M \\ML \\KL /KL /ML M',
        '\\LM L /LN \\LN L /LM',
        '\\LK /LN . . \\LN /LK',
        '/KL \\NL . . /NL \\KL',
        '/ML L \\NL /NL L \\ML',
        'M /LM /LK \\LK \\LM M',
      ]),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Wyoming Valley',
    size: 12,
    n: 6,
    pieces: cells([
      'L \\LM \\LD /LD /LM L',
      '\\ML /LM \\DL /DL \\LM /ML',
      '\\DL \\LD /ML \\ML /LD /DL',
      '/LD /DL \\LM /LM \\DL \\LD',
      '/LM \\ML /LD \\LD /ML \\LM',
      'L /ML /DL \\DL \\ML L',
    ]),
  },
  {
    name: 'Morning',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LD /LM \\LM /LD L',
        '\\DL D . . D /DL',
        '/LM . . . . \\LM',
        '\\ML . . . . /ML',
        '/LD D . . D \\LD',
        'L /DL \\ML /ML \\DL L',
      ]),
      rect(2, 1, 2, 1, 'M'),
      rect(2, 4, 2, 1, 'M'),
      rect(1, 2, 1, 2, 'M'),
      rect(4, 2, 1, 2, 'M'),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Contrary Wife',
    size: 9,
    n: 3,
    pieces: cells(['M /LD M', '/LD M /DL', 'M /DL M']),
  },
  {
    name: 'Attic Window I',
    size: 9,
    n: 3,
    pieces: cells(['K /KN M', '/KM L /MK', 'M /NK K']),
  },
  {
    name: 'Four T Square',
    size: 13,
    n: 13,
    pieces: [
      {
        poly: [
          [4, 0],
          [4, 2],
          [6, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [4, 4],
          [6, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [6, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 0],
          [9, 2],
          [7, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 0],
          [7, 0],
          [7, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 2],
          [9, 4],
          [7, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 2],
          [7, 2],
          [7, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [7, 0],
          [7, 4],
          [6, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 9],
          [2, 9],
          [2, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 9],
          [0, 7],
          [2, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 9],
          [4, 9],
          [4, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 9],
          [2, 7],
          [4, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [4, 4],
          [4, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 4],
          [2, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 7],
          [0, 6],
          [4, 6],
          [4, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 13],
          [9, 11],
          [7, 11],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 13],
          [7, 13],
          [7, 11],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 11],
          [9, 9],
          [7, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 11],
          [7, 11],
          [7, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 13],
          [4, 11],
          [6, 11],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 13],
          [6, 13],
          [6, 11],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 11],
          [4, 9],
          [6, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 11],
          [6, 11],
          [6, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 13],
          [6, 13],
          [6, 9],
          [7, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [13, 4],
          [11, 4],
          [11, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [13, 4],
          [13, 6],
          [11, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [11, 4],
          [9, 4],
          [9, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [11, 4],
          [11, 6],
          [9, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [13, 9],
          [11, 9],
          [11, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [13, 9],
          [13, 7],
          [11, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [11, 9],
          [9, 9],
          [9, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [11, 9],
          [11, 7],
          [9, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [13, 6],
          [13, 7],
          [9, 7],
          [9, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 0],
          [4, 0],
          [0, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [4, 4],
          [0, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 0],
          [13, 0],
          [13, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 0],
          [13, 4],
          [9, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 9],
          [4, 13],
          [0, 13],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 9],
          [4, 9],
          [4, 13],
        ],
        c: 'D',
      },
      {
        poly: [
          [13, 9],
          [13, 13],
          [9, 13],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 9],
          [13, 9],
          [9, 13],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 4],
          [9, 4],
          [9, 9],
          [4, 9],
        ],
        c: 'D',
      },
    ],
  },
  {
    name: 'Nonesuch',
    size: 9,
    n: 9,
    pieces: [
      rect(3, 3, 3, 3, 'L'),
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 1],
          [3, 3],
          [1, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [3, 0],
          [3, 1],
          [1, 3],
          [0, 3],
          [0, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 0],
          [5, 0],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 1],
          [6, 3],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 0],
          [6, 0],
          [6, 1],
          [4, 3],
          [3, 3],
          [3, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 0],
          [8, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 1],
          [9, 3],
          [7, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 0],
          [9, 0],
          [9, 1],
          [7, 3],
          [6, 3],
          [6, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3],
          [2, 3],
          [0, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 4],
          [3, 6],
          [1, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3],
          [3, 3],
          [3, 4],
          [1, 6],
          [0, 6],
          [0, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 3],
          [8, 3],
          [6, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 4],
          [9, 6],
          [7, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 3],
          [9, 3],
          [9, 4],
          [7, 6],
          [6, 6],
          [6, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 6],
          [2, 6],
          [0, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 7],
          [3, 9],
          [1, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 6],
          [3, 6],
          [3, 7],
          [1, 9],
          [0, 9],
          [0, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 6],
          [5, 6],
          [3, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 7],
          [6, 9],
          [4, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 6],
          [6, 6],
          [6, 7],
          [4, 9],
          [3, 9],
          [3, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 6],
          [8, 6],
          [6, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 7],
          [9, 9],
          [7, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 6],
          [9, 6],
          [9, 7],
          [7, 9],
          [6, 9],
          [6, 8],
        ],
        c: 'M',
      },
    ],
  },
  {
    name: 'Steps to the Altar II',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'N L M L Q L',
        'L M L Q L L',
        'M L Q . . .',
        'L Q . . . .',
        'Q L . . . .',
        'L L . . . .',
      ]),
      {
        poly: [
          [2, 4],
          [4, 2],
          [4, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [3, 2],
          [4, 2],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3],
          [3, 3],
          [2, 4],
        ],
        c: 'L',
      },
      rect(4, 2, 2, 2, 'L'),
      rect(2, 4, 2, 2, 'L'),
      rect(4, 4, 2, 2, 'K'),
    ],
  },
  {
    name: 'Railroad II',
    size: 12,
    n: 6,
    pieces: cells([
      'D L 2/DL . L D',
      'L D . . D L',
      '2/DL . L D 2/LD .',
      '. . D L . .',
      'L D 2/LD . D L',
      'D L . . L D',
    ]),
  },
  {
    name: 'Rocky Road to California',
    size: 12,
    n: 6,
    pieces: cells([
      '2M . 2/LM . L M',
      '. . . . M L',
      '2/LM . M L 2/ML .',
      '. . L M . .',
      'L M 2/ML . 2M .',
      'M L . . . .',
    ]),
  },
  {
    name: 'Road to the White House',
    size: 12,
    n: 6,
    pieces: cells([
      'D L 2\\KM . 2M .',
      'L D . . . .',
      '2\\MK . D M 2\\KM .',
      '. . M D . .',
      '2M . 2\\MK . D L',
      '. . . . L D',
    ]),
  },
  {
    name: "Kelly's Block",
    size: 12,
    n: 6,
    pieces: cells([
      '/LD L /DL L 2\\LD .',
      'L L L D . .',
      '/DL L 2D . D L',
      'L D . . L /LD',
      '2\\DL . D L L L',
      '. . L /LD L /DL',
    ]),
  },
  {
    name: 'Broken Sugar Bowl',
    size: 12,
    n: 6,
    pieces: cells([
      '2K . 2/LM . L K',
      '. . . . M L',
      '2/LM . K M 2/ML .',
      '. . M K . .',
      'L M 2/ML . 2K .',
      'K L . . . .',
    ]),
  },
  {
    name: "Jacob's Ladder",
    size: 12,
    n: 6,
    pieces: cells([
      'D L 2/LM . D L',
      'L D . . L D',
      '2/LM . D L 2/ML .',
      '. . L D . .',
      'D L 2/ML . D L',
      'L D . . L D',
    ]),
  },
  {
    name: 'Mixed T',
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        'M . M . M . M . M',
        '/ML . \\ML . /ML . \\ML . /ML',
        'L . L . L . L . L',
        'M . M . M . M . M',
        '\\ML . /ML . \\ML . /ML . \\ML',
        'L . L . L . L . L',
        'M . M . M . M . M',
        '/ML . \\ML . /ML . \\ML . /ML',
        'L . L . L . L . L',
      ]),
      rect(1, 0, 1, 3, 'M'),
      rect(3, 0, 1, 3, 'L'),
      rect(5, 0, 1, 3, 'M'),
      rect(7, 0, 1, 3, 'L'),
      rect(1, 3, 1, 3, 'L'),
      rect(3, 3, 1, 3, 'M'),
      rect(5, 3, 1, 3, 'L'),
      rect(7, 3, 1, 3, 'M'),
      rect(1, 6, 1, 3, 'M'),
      rect(3, 6, 1, 3, 'L'),
      rect(5, 6, 1, 3, 'M'),
      rect(7, 6, 1, 3, 'L'),
    ],
  },
  {
    name: 'Dublin Chain',
    size: 18,
    n: 9,
    pieces: cells([
      'M \\LD L M L M L /LD M',
      '\\DL M \\LD L L L /LD M /DL',
      'L \\DL M \\LD L /LD M /DL L',
      'M L \\DL M L M /DL L M',
      'L L L L M L L L L',
      'M L /LD M L M \\LD L M',
      'L /LD M /DL L \\DL M \\LD L',
      '/LD M /DL L L L \\DL M \\LD',
      'M /DL L M L M L \\DL M',
    ]),
  },
  {
    name: 'Massachusetts',
    size: 18,
    n: 12,
    pieces: [
      ...cells([
        'D \\DL \\DL \\DL \\DL \\DL \\DL \\DL \\DL \\DL \\DL L',
        '\\LD D D D D D D D D D D \\DL',
        '\\LD D L L L L L L L L D \\DL',
        '\\LD D L L /DL /DL /DL /DL D L D \\DL',
        '\\LD D L /DL . . . . /LD L D \\DL',
        '\\LD D L /DL . . . . /LD L D \\DL',
        '\\LD D L /DL . . . . /LD L D \\DL',
        '\\LD D L /DL . . . . /LD L D \\DL',
        '\\LD D L D /LD /LD /LD /LD L L D \\DL',
        '\\LD D L L L L L L L L D \\DL',
        '\\LD D D D D D D D D D D \\DL',
        'L \\LD \\LD \\LD \\LD \\LD \\LD \\LD \\LD \\LD \\LD D',
      ]),
      rect(4, 4, 4, 4, 'M'),
    ],
  },
  {
    name: '54-40 or Fight',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L K . . K L',
        'K L . . L K',
        '. . L K . .',
        '. . K L . .',
        'K L . . L K',
        'L K . . K L',
      ]),
      {
        poly: [
          [2, 0],
          [2, 2],
          [3, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 0],
          [3, 0],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [4, 0],
          [4, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [3, 0],
          [4, 0],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [4, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 2],
          [6, 3],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 3],
          [6, 4],
          [4, 4],
        ],
        c: 'N',
      },
      {
        poly: [
          [4, 3],
          [6, 3],
          [6, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 4],
          [4, 4],
          [4, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 4],
          [3, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [3, 4],
          [2, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [3, 4],
          [3, 6],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3],
          [0, 4],
          [2, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3],
          [2, 3],
          [0, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2],
          [2, 2],
          [2, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 2],
          [0, 3],
          [2, 3],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Patch as Patch Can',
    size: 12,
    n: 6,
    pieces: cells([
      '\\MQ \\DQ D K /KM /QM',
      '\\MK \\MQ \\DP /KS /QM /QD',
      'K \\SK \\PS /SP /PD D',
      'D /DP \\PS /PS \\KS K',
      '/DQ /MQ /SK \\PD \\QM \\KM',
      '/MQ /MK K D \\QD \\QM',
    ]),
  },
  {
    name: 'Flower Garden Path',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '\\LD \\LM . . /LM /LD',
        '\\DL \\LD \\LM /LM /LD /DL',
        '. \\DL . . /DL .',
        '. /LD . . \\LD .',
        '/LD /DL /ML \\ML \\DL \\LD',
        '/DL /ML . . \\ML \\DL',
      ]),
      rect(2, 0, 2, 1, 'M'),
      rect(2, 5, 2, 1, 'M'),
      rect(0, 2, 1, 2, 'M'),
      rect(5, 2, 1, 2, 'M'),
      ...qst(2, 2, 2, 'L', 'D', 'L', 'D'),
    ],
  },
  {
    name: 'Battlegrounds',
    size: 12,
    n: 6,
    pieces: cells([
      '/LM /LD /LQ /LM /LQ /LD',
      '/LK /LD /LM /LD /LK /LM',
      '/LQ /LQ /LM /LQ /LD /LQ',
      '/LD /LQ /LD /LM /LK /LD',
      '/LQ /LK /LM /LD /LQ /LQ',
      '/LM /LD /LQ /LQ /LD /LM',
    ]),
  },
  {
    name: "Cat's Cradle",
    size: 12,
    n: 6,
    pieces: [
      rect(4, 0, 2, 2, 'L'),
      rect(0, 4, 2, 2, 'L'),
      rect(2, 2, 2, 2, 'M'),
      // units with the white half at upper left
      ...(
        [
          [0, 0],
          [2, 0],
          [0, 2],
        ] as [number, number][]
      ).flatMap(([x, y]) => [
        {
          poly: [
            [x, y],
            [x + 2, y],
            [x, y + 2],
          ] as [number, number][],
          c: 'L',
        },
        {
          poly: [
            [x + 2, y],
            [x + 2, y + 1],
            [x + 1, y + 1],
          ] as [number, number][],
          c: 'M',
        },
        {
          poly: [
            [x, y + 2],
            [x + 1, y + 1],
            [x + 1, y + 2],
          ] as [number, number][],
          c: 'M',
        },
        {
          poly: [
            [x + 1, y + 1],
            [x + 2, y + 1],
            [x + 1, y + 2],
          ] as [number, number][],
          c: 'L',
        },
        {
          poly: [
            [x + 2, y + 1],
            [x + 2, y + 2],
            [x + 1, y + 2],
          ] as [number, number][],
          c: 'M',
        },
      ]),
      // units with the white half at lower right
      ...(
        [
          [4, 2],
          [2, 4],
          [4, 4],
        ] as [number, number][]
      ).flatMap(([x, y]) => [
        {
          poly: [
            [x + 2, y],
            [x + 2, y + 2],
            [x, y + 2],
          ] as [number, number][],
          c: 'L',
        },
        {
          poly: [
            [x, y],
            [x + 1, y],
            [x, y + 1],
          ] as [number, number][],
          c: 'M',
        },
        {
          poly: [
            [x + 1, y],
            [x + 2, y],
            [x + 1, y + 1],
          ] as [number, number][],
          c: 'M',
        },
        {
          poly: [
            [x, y + 1],
            [x + 1, y + 1],
            [x, y + 2],
          ] as [number, number][],
          c: 'M',
        },
        {
          poly: [
            [x + 1, y],
            [x + 1, y + 1],
            [x, y + 1],
          ] as [number, number][],
          c: 'L',
        },
      ]),
    ],
  },
  {
    name: 'Winged Square',
    size: 12,
    n: 6,
    pieces: cells([
      '/LM /LM /LM /LM 2L .',
      '/LM /LM /LM /LM . .',
      '/LM /LM 2D . /ML /ML',
      '/LM /LM . . /ML /ML',
      '2L . /ML /ML /ML /ML',
      '. . /ML /ML /ML /ML',
    ]),
  },
  {
    name: 'Formal Garden',
    size: 9,
    n: 3,
    pieces: cells(['\\ML \\LM /LM', '/LM D /ML', '/ML \\ML \\LM']),
  },
  {
    name: 'Darting Bird',
    size: 9,
    n: 3,
    pieces: cells(['M /LM \\LM', '/LM M \\LM', '\\ML \\ML L']),
  },
  {
    name: 'Calico Puzzle',
    size: 9,
    n: 3,
    pieces: cells(['\\DL M /LD', 'M D M', '/DL M \\LD']),
  },
  {
    name: 'Nine-Patch Water Wheel',
    size: 12,
    n: 6,
    pieces: cells([
      'L M 2\\LM . D L',
      'D L . . L M',
      '2/LM . 2M . 2/ML .',
      '. . . . . .',
      'M L 2\\ML . L D',
      'L D . . M L',
    ]),
  },
  {
    name: 'Mississippi',
    size: 12,
    n: 12,
    pieces: [
      rect(0, 0, 4, 4, 'M'),
      rect(8, 0, 4, 4, 'M'),
      rect(0, 8, 4, 4, 'M'),
      rect(8, 8, 4, 4, 'M'),
      rect(4, 4, 4, 4, 'L'),
      {
        poly: [
          [4, 0],
          [6, 0],
          [8, 2],
          [8, 4],
          [6, 4],
          [4, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 0],
          [8, 0],
          [8, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [6, 4],
          [4, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 8],
          [6, 8],
          [8, 10],
          [8, 12],
          [6, 12],
          [4, 10],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 8],
          [8, 8],
          [8, 10],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 10],
          [6, 12],
          [4, 12],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [4, 4],
          [4, 6],
          [2, 8],
          [0, 8],
          [0, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 6],
          [4, 8],
          [2, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 4],
          [12, 4],
          [12, 6],
          [10, 8],
          [8, 8],
          [8, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 4],
          [10, 4],
          [8, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [12, 6],
          [12, 8],
          [10, 8],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Silver Lane',
    size: 12,
    n: 6,
    pieces: cells([
      'L \\NM \\MN /MN /NM L',
      '\\MN M P P M /MN',
      '\\NM P \\KL /LK P /NM',
      '/MN P /KL \\LK P \\MN',
      '/NM M P P M \\NM',
      'L /MN /NM \\NM \\MN L',
    ]),
  },
  {
    name: "Ranger's Pride",
    size: 12,
    n: 6,
    pieces: cells([
      '\\ML /ML L L L /LM',
      'L \\LM L M /ML \\ML',
      'L M \\LM /ML L L',
      'L L /LM \\ML M L',
      '\\LM /LM M L \\ML L',
      '/ML L L L /LM \\LM',
    ]),
  },
  {
    name: 'Rolling Pinwheel II',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        'L \\LN . . /LN L',
        '\\NL /LM \\LM \\LK \\LM /NL',
        '. /LK . . /ML .',
        '. /LM . . /KL .',
        '/LN \\ML \\KL \\ML /ML \\LN',
        'L /NL . . \\NL L',
      ]),
      rect(2, 0, 2, 1, 'L'),
      rect(2, 5, 2, 1, 'L'),
      rect(0, 2, 1, 2, 'L'),
      rect(5, 2, 1, 2, 'L'),
      rect(2, 2, 2, 2, 'K'),
    ],
  },
  {
    name: 'Four Winds',
    size: 12,
    n: 6,
    pieces: cells([
      '\\LM /ML L /MK \\LM /ML',
      '/LM \\MK \\MN K /KM \\ML',
      '\\KM K \\NM /MN /NM L',
      'L /MN /NM \\MN K \\MK',
      '\\LM /MK K \\NM \\MK /ML',
      '/LM \\ML /KM L /LM \\ML',
    ]),
  },
  {
    name: 'Flutter Wheel',
    size: 12,
    n: 6,
    pieces: cells([
      '\\LD /DL L L \\LD /DL',
      '/LD \\DL L L /LD \\DL',
      'L L \\LD /DL L L',
      'L L /LD \\DL L L',
      '\\LD /DL L L \\LD /DL',
      '/LD \\DL L L /LD \\DL',
    ]),
    open: 'v 3 0, v 3 1, v 1 2, v 5 2, v 1 3, v 5 3, v 3 4, v 3 5, h 2 1, h 3 1, h 0 3, h 1 3, h 4 3, h 5 3, h 2 5, h 3 5',
  },
  {
    name: 'Wheeling Nine-Patch',
    size: 12,
    n: 6,
    pieces: cells([
      '/LM /DM \\DL \\MD \\LM D',
      '/MD /ML D \\ML \\DM \\LD',
      '/DL D M D /LD L',
      '\\MD \\LM D /LM /DM \\DL',
      '\\ML \\DM \\LD /MD /ML D',
      'D /LD L /DL D L',
    ]),
  },
  {
    name: 'Octagon',
    size: 9,
    n: 3,
    pieces: cells(['/ML L \\ML', 'L L L', '\\LM L /LM']),
  },
  {
    name: 'Shoofly II',
    size: 9,
    n: 3,
    pieces: cells(['/LM L \\LM', 'L M L', '\\ML L /ML']),
  },
  {
    name: 'Double Pinwheel III',
    size: 12,
    n: 6,
    pieces: [
      ...cells([
        '\\DL \\LD L . . /LD',
        '. \\DL \\LD L /LD /DL',
        '. L \\LD /DL /DL L',
        'L /LD /LD \\DL L .',
        '/LD /DL L \\DL \\LD .',
        '/DL . . L \\DL \\LD',
      ]),
      {
        poly: [
          [3, 0],
          [3, 1],
          [5, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 0],
          [5, 0],
          [5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 1],
          [1, 3],
          [0, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 3],
          [6, 3],
          [5, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 3],
          [6, 5],
          [5, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 5],
          [3, 5],
          [3, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 5],
          [1, 6],
          [3, 6],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Churn Dash Nine-Patch',
    size: 9,
    n: 3,
    pieces: [
      ...cells(['/LM . \\LM', '. L .', '\\ML . /ML']),
      rect(1, 0, 1, 0.5, 'L'),
      rect(1, 0.5, 1, 0.5, 'M'),
      rect(1, 2, 1, 0.5, 'M'),
      rect(1, 2.5, 1, 0.5, 'L'),
      rect(0, 1, 0.5, 1, 'L'),
      rect(0.5, 1, 0.5, 1, 'M'),
      rect(2, 1, 0.5, 1, 'M'),
      rect(2.5, 1, 0.5, 1, 'L'),
    ],
  },
  {
    name: 'Greek Cross II',
    size: 9,
    n: 3,
    pieces: [
      ...cells(['/LK . \\LK', '. N .', '\\KL . /KL']),
      rect(1, 0, 1, 0.5, 'L'),
      rect(1, 0.5, 1, 0.5, 'N'),
      rect(1, 2, 1, 0.5, 'N'),
      rect(1, 2.5, 1, 0.5, 'L'),
      rect(0, 1, 0.5, 1, 'L'),
      rect(0.5, 1, 0.5, 1, 'N'),
      rect(2, 1, 0.5, 1, 'N'),
      rect(2.5, 1, 0.5, 1, 'L'),
    ],
  },
  {
    name: 'Kitchen Woodbox',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 1],
          [1, 2],
          [0, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 0],
          [4, 1],
          [5, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 1],
          [5, 2],
          [6, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [1, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 5],
          [2, 5],
          [2, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 4],
          [5, 4],
          [5, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 5],
          [4, 5],
          [4, 6],
        ],
        c: 'D',
      },
      rect(2, 0, 2, 1, 'D'),
      rect(2, 5, 2, 1, 'D'),
      rect(0, 2, 1, 2, 'D'),
      rect(5, 2, 1, 2, 'D'),
      rect(2, 1, 2, 1, 'M'),
      rect(2, 4, 2, 1, 'M'),
      rect(1, 2, 1, 2, 'M'),
      rect(4, 2, 1, 2, 'M'),
      sq(1, 1, 'M'),
      sq(4, 1, 'M'),
      sq(1, 4, 'M'),
      sq(4, 4, 'M'),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: 'Grecian Design',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [6, 2],
          [4, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'D',
      },
      rect(2, 0, 2, 1, 'D'),
      rect(2, 1, 2, 1, 'L'),
      rect(2, 4, 2, 1, 'L'),
      rect(2, 5, 2, 1, 'D'),
      rect(0, 2, 1, 2, 'D'),
      rect(1, 2, 1, 2, 'L'),
      rect(4, 2, 1, 2, 'L'),
      rect(5, 2, 1, 2, 'D'),
      rect(2, 2, 2, 2, 'D'),
    ],
  },
  {
    name: 'Square Greek Cross',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 0],
          [6, 2],
          [4, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'L',
      },
      rect(2, 0, 2, 1, 'L'),
      rect(2, 1, 2, 1, 'M'),
      rect(2, 4, 2, 1, 'M'),
      rect(2, 5, 2, 1, 'L'),
      rect(0, 2, 1, 2, 'L'),
      rect(1, 2, 1, 2, 'M'),
      rect(4, 2, 1, 2, 'M'),
      rect(5, 2, 1, 2, 'L'),
      rect(2, 2, 2, 2, 'M'),
    ],
  },
  {
    name: 'Montana',
    size: 18,
    n: 9,
    pieces: [
      {
        poly: [
          [0, 0],
          [3, 0],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [3, 3],
          [0, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 0],
          [9, 0],
          [9, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [9, 3],
          [6, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 6],
          [0, 9],
          [3, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 6],
          [3, 6],
          [3, 9],
        ],
        c: 'N',
      },
      {
        poly: [
          [9, 6],
          [9, 9],
          [6, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 6],
          [9, 6],
          [6, 9],
        ],
        c: 'N',
      },
      // top
      rect(3, 0, 3, 1, 'L'),
      rect(3, 1, 3, 1, 'M'),
      {
        poly: [
          [3, 2],
          [4.5, 2],
          [4.5, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [4.5, 2],
          [6, 2],
          [4.5, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [3, 2],
          [3, 3],
          [4.5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 2],
          [6, 3],
          [4.5, 3],
        ],
        c: 'L',
      },
      // bottom
      rect(3, 8, 3, 1, 'L'),
      rect(3, 7, 3, 1, 'M'),
      {
        poly: [
          [3, 7],
          [4.5, 7],
          [4.5, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [4.5, 7],
          [6, 7],
          [4.5, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [3, 6],
          [4.5, 6],
          [3, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 6],
          [4.5, 6],
          [6, 7],
        ],
        c: 'L',
      },
      // left
      rect(0, 3, 1, 3, 'L'),
      rect(1, 3, 1, 3, 'M'),
      {
        poly: [
          [2, 3],
          [3, 4.5],
          [2, 4.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 4.5],
          [3, 4.5],
          [2, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 3],
          [3, 3],
          [3, 4.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 6],
          [3, 6],
          [3, 4.5],
        ],
        c: 'L',
      },
      // right
      rect(8, 3, 1, 3, 'L'),
      rect(7, 3, 1, 3, 'M'),
      {
        poly: [
          [7, 3],
          [7, 4.5],
          [6, 4.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [7, 4.5],
          [7, 6],
          [6, 4.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 3],
          [6, 4.5],
          [7, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 4.5],
          [6, 6],
          [7, 6],
        ],
        c: 'L',
      },
      // center nine-patch
      ...cells(['M L M', 'L M L', 'M L M'], 3, 3),
    ],
  },
  {
    name: 'London Roads',
    size: 18,
    n: 9,
    pieces: [
      {
        poly: [
          [0, 0],
          [3, 0],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [3, 3],
          [1.5, 1.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 0],
          [3, 3],
          [1.5, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [9, 0],
          [9, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [7.5, 1.5],
          [6, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [7.5, 1.5],
          [9, 3],
          [6, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 6],
          [0, 9],
          [3, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 6],
          [3, 6],
          [1.5, 7.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 6],
          [3, 9],
          [1.5, 7.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 6],
          [9, 9],
          [6, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 6],
          [9, 6],
          [7.5, 7.5],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 6],
          [7.5, 7.5],
          [6, 9],
        ],
        c: 'L',
      },
      rect(3, 0, 3, 1, 'M'),
      rect(3, 1, 3, 1, 'L'),
      rect(3, 2, 3, 1, 'M'),
      rect(3, 6, 3, 1, 'M'),
      rect(3, 7, 3, 1, 'L'),
      rect(3, 8, 3, 1, 'M'),
      rect(0, 3, 1, 3, 'M'),
      rect(1, 3, 1, 3, 'L'),
      rect(2, 3, 1, 3, 'M'),
      rect(6, 3, 1, 3, 'M'),
      rect(7, 3, 1, 3, 'L'),
      rect(8, 3, 1, 3, 'M'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Golden Gate',
    size: 18,
    n: 9,
    pieces: [
      {
        poly: [
          [0, 0],
          [3, 0],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [3, 3],
          [0, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 0],
          [9, 0],
          [9, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [9, 3],
          [6, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 6],
          [0, 9],
          [3, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 6],
          [3, 6],
          [3, 9],
        ],
        c: 'M',
      },
      {
        poly: [
          [9, 6],
          [9, 9],
          [6, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 6],
          [9, 6],
          [6, 9],
        ],
        c: 'M',
      },
      rect(3, 0, 3, 1, 'D'),
      rect(3, 1, 3, 1, 'L'),
      rect(3, 2, 3, 1, 'D'),
      rect(3, 6, 3, 1, 'D'),
      rect(3, 7, 3, 1, 'L'),
      rect(3, 8, 3, 1, 'D'),
      rect(0, 3, 1, 3, 'D'),
      rect(1, 3, 1, 3, 'L'),
      rect(2, 3, 1, 3, 'D'),
      rect(6, 3, 1, 3, 'D'),
      rect(7, 3, 1, 3, 'L'),
      rect(8, 3, 1, 3, 'D'),
      rect(3, 3, 3, 3, 'L'),
    ],
  },
  {
    name: 'Cups and Saucers',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [6, 2],
          [4, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'M',
      },
      rect(2, 2, 2, 2, 'L'),
      ...cells([
        '. . /ML \\ML . .',
        '. . /ML \\ML . .',
        '/ML /ML . . \\ML \\ML',
        '\\LM \\LM . . /LM /LM',
        '. . \\LM /LM . .',
        '. . \\LM /LM . .',
      ]),
    ],
  },
  {
    name: 'Album Cross',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 1],
          [1, 2],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [4, 1],
          [5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 1],
          [5, 2],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [1, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 5],
          [2, 5],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 4],
          [5, 4],
          [5, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 5],
          [4, 5],
          [4, 6],
        ],
        c: 'L',
      },
      sq(1, 1, 'N'),
      sq(4, 1, 'N'),
      sq(1, 4, 'N'),
      sq(4, 4, 'N'),
      rect(2, 0, 2, 2, 'M'),
      rect(0, 2, 2, 2, 'M'),
      rect(4, 2, 2, 2, 'M'),
      rect(2, 4, 2, 2, 'M'),
      rect(2, 2, 2, 2, 'L'),
    ],
  },
  {
    name: 'New Album I',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 4],
          [0, 6],
          [2, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'N',
      },
      rect(1, 1, 1, 1, 'K'),
      rect(4, 1, 1, 1, 'K'),
      rect(1, 4, 1, 1, 'K'),
      rect(4, 4, 1, 1, 'K'),
      {
        poly: [
          [2, 0],
          [2, 1],
          [1, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 1],
          [1, 2],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [4, 1],
          [5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 1],
          [5, 2],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [1, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 5],
          [2, 5],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 4],
          [6, 4],
          [5, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 5],
          [5, 5],
          [4, 6],
        ],
        c: 'L',
      },
      rect(2, 0, 2, 2, 'M'),
      rect(0, 2, 2, 2, 'M'),
      rect(4, 2, 2, 2, 'M'),
      rect(2, 4, 2, 2, 'M'),
      rect(2, 2, 1, 1, 'L'),
      rect(3, 3, 1, 1, 'L'),
      ...hst(3, 2, '\\', 'K', 'L'),
      ...hst(2, 3, '\\', 'L', 'K'),
    ],
  },
  {
    name: 'Sawtooth Patch',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 2],
          [2, 0],
          [2, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [6, 2],
          [4, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 6],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [4, 1],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 1],
          [3, 2],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 2],
          [2, 1],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 1],
          [3, 0],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 0],
          [3, 0],
          [2, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [3, 0],
          [4, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [4, 1],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 2],
          [3, 2],
          [2, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 2],
          [2, 3],
          [1, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 3],
          [1, 4],
          [1, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 4],
          [0, 3],
          [1, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 3],
          [1, 2],
          [1, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 2],
          [1, 2],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [2, 3],
          [1, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [4, 3],
          [3, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 3],
          [3, 4],
          [3, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 4],
          [2, 3],
          [3, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 3],
          [3, 2],
          [3, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 2],
          [3, 2],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [3, 2],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [4, 3],
          [3, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [3, 4],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 2],
          [6, 3],
          [5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 3],
          [5, 4],
          [5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [5, 4],
          [4, 3],
          [5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 3],
          [5, 2],
          [5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 2],
          [5, 2],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 2],
          [5, 2],
          [6, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 4],
          [6, 3],
          [5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [5, 4],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 4],
          [4, 5],
          [3, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 5],
          [3, 6],
          [3, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 6],
          [2, 5],
          [3, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 5],
          [3, 4],
          [3, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 4],
          [3, 4],
          [2, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [3, 4],
          [4, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 6],
          [4, 5],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 6],
          [3, 6],
          [2, 5],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Four-Color Air Castle',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'Q',
      },
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [4, 2],
          [6, 2],
        ],
        c: 'Q',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'Q',
      },
      {
        poly: [
          [0, 4],
          [2, 6],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'Q',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [4, 2],
          [2, 2],
        ],
        c: 'P',
      },
      {
        poly: [
          [4, 0],
          [4, 2],
          [3, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 0],
          [4, 0],
          [3, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 2],
          [2, 4],
          [0, 4],
        ],
        c: 'P',
      },
      {
        poly: [
          [0, 2],
          [2, 2],
          [1, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 2],
          [1, 3],
          [0, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [4, 4],
        ],
        c: 'P',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [5, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 2],
          [6, 4],
          [5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [4, 4],
          [4, 6],
        ],
        c: 'P',
      },
      {
        poly: [
          [2, 4],
          [2, 6],
          [3, 5],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 6],
          [4, 6],
          [3, 5],
        ],
        c: 'L',
      },
      ...sqInSq(2, 2, 2, 'L', 'P'),
    ],
  },
  {
    name: 'Card Basket',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 0],
          [4, 2],
          [6, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 4],
          [2, 6],
          [0, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 0],
          [4, 0],
          [3, 1],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 0],
          [3, 1],
          [2, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 0],
          [4, 2],
          [3, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 1],
          [2, 2],
          [4, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 2],
          [1, 3],
          [0, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 2],
          [2, 2],
          [1, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [1, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 2],
          [2, 4],
          [1, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 2],
          [6, 4],
          [5, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [4, 4],
          [5, 3],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 6],
          [4, 6],
          [3, 5],
        ],
        c: 'K',
      },
      {
        poly: [
          [2, 4],
          [2, 6],
          [3, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [4, 6],
          [3, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [4, 4],
          [3, 5],
        ],
        c: 'N',
      },
      ...sqInSq(2, 2, 2, 'N', 'L'),
    ],
  },
  {
    name: 'Prairie Queen',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 0],
          [6, 0],
          [6, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [4, 0],
          [4, 2],
          [6, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [2, 6],
          [0, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 4],
          [2, 4],
          [2, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'N',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [4, 6],
        ],
        c: 'M',
      },
      rect(2, 2, 2, 2, 'M'),
      ...cells(['L K', 'K L'], 2, 0),
      ...cells(['K L', 'L K'], 0, 2),
      ...cells(['K L', 'L K'], 4, 2),
      ...cells(['L K', 'K L'], 2, 4),
    ],
  },
  {
    name: 'Corn and Beans',
    size: 12,
    n: 6,
    pieces: cells([
      'L /LM /LD \\LD \\LM L',
      '/LM /LM /LD L \\LM \\LM',
      '/LD /LD D L L \\LD',
      '\\DL L L D /DL /DL',
      '\\ML \\ML L /DL /ML /ML',
      'L \\ML \\DL /DL /ML L',
    ]),
  },
  {
    name: 'WCTU',
    size: 12,
    n: 6,
    pieces: [
      {
        poly: [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 1],
          [2, 1],
          [2, 2],
          [1, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [1, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 0],
          [2, 0],
          [1.5, 0.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 0],
          [1.5, 0.5],
          [1, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [0.5, 1.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 1],
          [0.5, 1.5],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 6],
          [1, 6],
          [1, 5],
          [0, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 5],
          [2, 5],
          [2, 4],
          [1, 4],
        ],
        c: 'N',
      },
      {
        poly: [
          [2, 6],
          [2, 5],
          [1, 5],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [1, 5],
        ],
        c: 'N',
      },
      {
        poly: [
          [1, 6],
          [2, 6],
          [1.5, 5.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 6],
          [1.5, 5.5],
          [1, 5],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 5],
          [1, 5],
          [0.5, 4.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [0, 5],
          [0.5, 4.5],
          [0, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 0],
          [5, 0],
          [5, 1],
          [6, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 1],
          [4, 1],
          [4, 2],
          [5, 2],
        ],
        c: 'N',
      },
      {
        poly: [
          [4, 0],
          [4, 1],
          [5, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 2],
          [5, 2],
          [5, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [5, 0],
          [4, 0],
          [4.5, 0.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 0],
          [4.5, 0.5],
          [5, 1],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 1],
          [5, 1],
          [5.5, 1.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 1],
          [5.5, 1.5],
          [6, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 6],
          [5, 6],
          [5, 5],
          [6, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 5],
          [4, 5],
          [4, 4],
          [5, 4],
        ],
        c: 'N',
      },
      {
        poly: [
          [4, 6],
          [4, 5],
          [5, 5],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 4],
          [5, 4],
          [5, 5],
        ],
        c: 'N',
      },
      {
        poly: [
          [5, 6],
          [4, 6],
          [4.5, 5.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 6],
          [4.5, 5.5],
          [5, 5],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 5],
          [5, 5],
          [5.5, 4.5],
        ],
        c: 'N',
      },
      {
        poly: [
          [6, 5],
          [5.5, 4.5],
          [6, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [4, 0],
          [4, 2],
          [2, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 2],
          [2, 2],
          [2, 4],
          [0, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [6, 4],
          [4, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 4],
          [4, 4],
          [4, 6],
          [2, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 2],
          [3.5, 2],
          [2, 3.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2.5],
          [4, 4],
          [2.5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 3.5],
          [3.5, 2],
          [4, 2],
          [4, 2.5],
          [2.5, 4],
          [2, 4],
        ],
        c: 'N',
      },
    ],
  },
  {
    name: 'Santa Fe',
    size: 18,
    n: 9,
    pieces: [
      ...cells([
        '. . . /LD D \\LD . . .',
        '. . . D L D . . .',
        '. . . \\DL D /DL . . .',
        '/LD D \\LD D L D /LD D \\LD',
        'D L D L D L D L D',
        '\\DL D /DL D L D \\DL D /DL',
        '. . . /LD D \\LD . . .',
        '. . . D L D . . .',
        '. . . \\DL D /DL . . .',
      ]),
      rect(0, 0, 3, 3, 'L'),
      rect(6, 0, 3, 3, 'L'),
      rect(0, 6, 3, 3, 'L'),
      rect(6, 6, 3, 3, 'L'),
    ],
  },
  {
    name: 'Tile Puzzle',
    size: 18,
    n: 9,
    pieces: cells([
      '/LD D \\LD L D L /LD D \\LD',
      'D L D D L D D L D',
      '\\DL D /DL L D L \\DL D /DL',
      'L D L /LD D \\LD L D L',
      'D L D D L D D L D',
      'L D L \\DL D /DL L D L',
      '/LD D \\LD L D L /LD D \\LD',
      'D L D D L D D L D',
      '\\DL D /DL L D L \\DL D /DL',
    ]),
  },
  {
    name: 'Single Wedding Ring II',
    size: 12,
    n: 6,
    pieces: cells([
      '/DL \\DL L L /DL \\DL',
      '\\LD /LD D D \\LD /LD',
      'L D L L D L',
      'L D L L D L',
      '/DL \\DL D D /DL \\DL',
      '\\LD /LD L L \\LD /LD',
    ]),
    open: 'v 3 0, v 3 1, v 3 2, v 3 3, v 3 4, v 3 5, h 0 3, h 1 3, h 2 3, h 3 3, h 4 3, h 5 3',
  },
  {
    name: 'Rolling Stone',
    size: 12,
    n: 6,
    pieces: cells([
      '/KL \\KL L L /KL \\KL',
      '\\LK /LM M M \\LM /LK',
      'L M L L M L',
      'L M L L M L',
      '/KL \\ML M M /ML \\KL',
      '\\LK /LK L L \\LK /LK',
    ]),
    open: 'v 3 0, v 3 1, v 3 2, v 3 3, v 3 4, v 3 5, h 0 3, h 1 3, h 2 3, h 3 3, h 4 3, h 5 3',
  },
];

export const NINE_PATCH_BLOCKS = gridBlocks(NINE_PATCH_DEFS, 'N-Patch/Nine-patch');
