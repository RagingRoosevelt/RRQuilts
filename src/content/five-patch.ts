// Built-in five-patch family blocks (traditional designs, drawn for RRQuilts) as grid pieces.
import { cells, gridBlocks, goose, hst, qst, rect, sq, type GridDef } from './grid';

export const FIVE_PATCH_DEFS: GridDef[] = [
  {
    name: 'Simple Five-Patch',
    size: 10,
    n: 5,
    pieces: cells(['L L L M L', 'M L M L L', 'L M L M L', 'L L M L M', 'L M L L L']),
  },
  {
    name: 'Flying Square',
    size: 10,
    n: 5,
    pieces: cells(['L L L D L', 'P K P K L', 'L M L D L', 'L K Q K Q', 'L M L L L']),
  },
  {
    name: 'Blocks in a Box',
    size: 10,
    n: 5,
    pieces: cells(['D D D D D', 'D M M M D', 'D M L M D', 'D M M M D', 'D D D D D']),
  },
  {
    name: "Children's Delight Five-Patch",
    size: 10,
    n: 5,
    pieces: cells(['L M M M M', 'L M L L M', 'M L M M L', 'M L M M L', 'M M L L M']),
  },
  {
    name: 'Plaid',
    size: 10,
    n: 5,
    pieces: cells(['M K L K M', 'D D K D D', 'L K L K L', 'D D K D D', 'M K L K M']),
    open: 'v 1 1, v 4 1, v 1 3, v 4 3',
  },
  {
    name: 'Star and Cross',
    size: 10,
    n: 5,
    pieces: cells(['L L K L L', 'L N K N L', 'K K M K K', 'L N K N L', 'L L K L L']),
  },
  {
    name: 'Double Irish Chain I',
    size: 10,
    n: 5,
    pieces: cells(['M D L D M', 'D M D M D', 'L D M D L', 'D M D M D', 'M D L D M']),
  },
  {
    name: 'Double Irish Chain II',
    size: 10,
    n: 5,
    pieces: cells(['M L L L M', 'L L L L L', 'L L L L L', 'L L L L L', 'M L L L M']),
    open: 'v 2 0, v 3 0, v 2 1, v 3 1, v 2 2, v 3 2, v 2 3, v 3 3, v 2 4, v 3 4, h 0 2, h 1 2, h 2 2, h 3 2, h 4 2, h 0 3, h 1 3, h 2 3, h 3 3, h 4 3',
  },
  {
    name: "Carpenter's Square",
    size: 15,
    n: 10,
    pieces: cells([
      'M M M M M M M M M M',
      'M L L L L M L M L M',
      'M L M M M M M M M M',
      'M L M L L M L M L M',
      'M L M L M M M M M M',
      'M M M M M M L M L M',
      'M L M L M L L M L M',
      'M M M M M M M M L M',
      'M L M L M L L L L M',
      'M M M M M M M M M M',
    ]),
  },
  {
    name: 'Steps to the Altar',
    size: 10,
    n: 5,
    pieces: cells(['\\ML L M L M', 'L \\ML L M L', 'L L \\ML L M', 'L L L \\ML L', 'L L L L \\ML']),
  },
  {
    name: 'Greek Cross',
    size: 10,
    n: 5,
    pieces: cells([
      '\\MD D D D D',
      '\\DL \\MD D L D',
      'L \\DL \\MD D D',
      'L L \\DL \\MD D',
      'L L L \\DL \\MD',
    ]),
  },
  {
    name: "King's Crown II",
    size: 10,
    n: 5,
    pieces: cells(['L L L L M', 'L D L /DM /ML', 'L L /DM /ML L', 'L /DM /ML L L', 'M /ML L L L']),
  },
  {
    name: 'Sawtooth Five-Patch',
    size: 10,
    n: 5,
    pieces: cells([
      '/LM /LM /LM /LM L',
      '/LM M M /ML L',
      '/LM M /ML L L',
      '/LM /ML L L L',
      'L L L L L',
    ]),
  },
  {
    name: 'Double Sawtooth Five-Patch',
    size: 10,
    n: 5,
    pieces: cells([
      'L /DL /DL /DL D',
      '/DL M M M /LD',
      '/DL M M M /LD',
      '/DL M M M /LD',
      'D /LD /LD /LD L',
    ]),
  },
  {
    name: 'Lady of the Lake',
    size: 10,
    n: 5,
    pieces: cells([
      '/LM /LM /LM /LM /LM',
      '/LM M M /ML /LM',
      '/LM M /ML L /LM',
      '/LM /ML L L /LM',
      '/LM /LM /LM /LM /LM',
    ]),
  },
  {
    name: 'Tent of Armageddon',
    size: 10,
    n: 5,
    pieces: cells([
      '\\LM \\LM \\LM \\LM \\LM',
      '\\LM \\LM \\LM \\LM \\LM',
      '\\LM \\LM \\LM \\LM \\LM',
      '\\LM \\LM \\LM \\LM \\LM',
      '\\LM \\LM \\LM \\LM \\LM',
    ]),
  },
  {
    name: 'Alaska Homestead',
    size: 10,
    n: 5,
    pieces: cells([
      'L /LM D \\LM L',
      '/LM M L M \\LM',
      'D L D L D',
      '\\ML M L M /ML',
      'L \\ML D /ML L',
    ]),
  },
  {
    name: 'Wishing Ring',
    size: 10,
    n: 5,
    pieces: cells([
      '/DL D L D \\DL',
      'D /LD D \\LD D',
      'L D L D L',
      'D \\DL D /DL D',
      '\\LD D L D /LD',
    ]),
  },
  {
    name: 'Duck and Ducklings',
    size: 10,
    n: 5,
    pieces: cells([
      '/LM /LM M \\LM \\LM',
      '/LM M L M \\LM',
      'M L M L M',
      '\\ML M L M /ML',
      '\\ML \\ML M /ML /ML',
    ]),
  },
  {
    name: 'Simple Wedding Ring',
    size: 10,
    n: 5,
    pieces: cells([
      '/LM /LM L \\LM \\LM',
      '/LM /LM M \\LM \\LM',
      'L M L M L',
      '\\ML \\ML M /ML /ML',
      '\\ML \\ML L /ML /ML',
    ]),
  },
  {
    name: 'Wedding Rings',
    size: 10,
    n: 5,
    pieces: cells([
      '/LP /KL L \\KL \\LP',
      '/KL /LD M \\LD \\KL',
      'L M L M L',
      '\\LK \\DL M /DL /LK',
      '\\PL \\LK L /LK /PL',
    ]),
  },
  {
    name: 'Double Wrench',
    size: 10,
    n: 5,
    pieces: cells([
      'L /LM L \\LM L',
      '/LM M M M \\LM',
      'L M L M L',
      '\\ML M M M /ML',
      'L \\ML L /ML L',
    ]),
  },
  {
    name: 'Philadelphia Pavements Five-Patch',
    size: 10,
    n: 5,
    pieces: cells(['D M M M D', 'M /DM L \\DM M', 'M L D L M', 'M \\MD L /MD M', 'D M M M D']),
  },
  {
    name: 'Ombre',
    size: 10,
    n: 5,
    pieces: cells([
      '/KD /DM Q \\DM \\KD',
      '/DM /MK P \\MK \\DM',
      'Q P M P Q',
      '\\MD \\KM P /KM /MD',
      '\\DK \\MD Q /MD /DK',
    ]),
  },
  {
    name: 'Flying Geese Five-Patch',
    size: 10,
    n: 5,
    pieces: cells([
      '/LM /LM L \\LM \\LM',
      '/LM /LM L \\LM \\LM',
      'L L M L L',
      '\\ML \\ML L /ML /ML',
      '\\ML \\ML L /ML /ML',
    ]),
  },
  {
    name: "Fool's Square",
    size: 10,
    n: 5,
    pieces: cells([
      '/ML \\LM L /LM \\ML',
      '\\ML M L M /ML',
      'L L M L L',
      '/LM M L M \\LM',
      '\\LM /ML L \\ML /LM',
    ]),
  },
  {
    name: 'E-Z Quilt',
    size: 10,
    n: 5,
    pieces: cells([
      'L \\LM D /LM L',
      '\\ML M D M /ML',
      'D D L D D',
      '/LM M D M \\LM',
      'L /ML D \\ML L',
    ]),
  },
  {
    name: "Farmer's Daughter",
    size: 10,
    n: 5,
    pieces: cells([
      'L \\LM L /LM L',
      '\\ML M D M /ML',
      'L D M D L',
      '/LM M D M \\LM',
      'L /ML L \\ML L',
    ]),
  },
  {
    name: 'Cain and Abel',
    size: 10,
    n: 5,
    pieces: cells([
      '/LK L D L \\LK',
      'L /PL M \\PL L',
      'D M L M D',
      'L \\LP M /LP L',
      '\\KL L D L /KL',
    ]),
  },
  {
    name: 'David and Goliath',
    size: 15,
    n: 10,
    pieces: cells([
      'L L \\LM /LD D D \\LD /LM L L',
      'L L /MD D D D D \\MD L L',
      '\\ML /MD D /DM D D \\DM D \\MD /ML',
      '/LD D /DM M D D M \\DM D \\LD',
      'D D D D M M D D D D',
      'D D D D M M D D D D',
      '\\DL D \\MD M D D M /MD D /DL',
      '/LM \\DM D \\MD D D /MD D /DM \\LM',
      'L L \\DM D D D D /DM L L',
      'L L /ML \\DL D D /DL \\ML L L',
    ]),
    open: 'v 1 0, v 3 0, v 5 0, v 7 0, v 9 0, v 1 1, v 3 1, v 5 1, v 7 1, v 9 1, v 1 2, v 5 2, v 7 2, v 9 2, v 1 3, v 3 3, v 5 3, v 7 3, v 9 3, v 1 4, v 3 4, v 5 4, v 7 4, v 9 4, v 1 5, v 3 5, v 5 5, v 7 5, v 9 5, v 1 6, v 3 6, v 5 6, v 7 6, v 9 6, v 1 7, v 3 7, v 5 7, v 7 7, v 9 7, v 1 8, v 3 8, v 5 8, v 7 8, v 9 8, v 1 9, v 3 9, v 5 9, v 7 9, v 9 9, h 0 1, h 1 1, h 2 1, h 3 1, h 4 1, h 5 1, h 6 1, h 7 1, h 8 1, h 9 1, h 0 3, h 1 3, h 2 3, h 3 3, h 4 3, h 5 3, h 6 3, h 7 3, h 8 3, h 9 3, h 0 5, h 1 5, h 2 5, h 3 5, h 4 5, h 5 5, h 6 5, h 7 5, h 8 5, h 9 5, h 0 7, h 1 7, h 2 7, h 3 7, h 4 7, h 5 7, h 6 7, h 7 7, h 8 7, h 9 7, h 0 9, h 1 9, h 2 9, h 3 9, h 4 9, h 5 9, h 6 9, h 7 9, h 8 9, h 9 9',
  },
  {
    name: 'Oregon',
    size: 10,
    n: 10,
    pieces: cells([
      'D D L L L L L L D D',
      'D D L L L L L L D D',
      'L L \\DL D L L D /DL L L',
      '\\LD L L \\DL L L /DL L L /LD',
      'D \\LD L L D D L L /LD D',
      'D /DL L L D D L L \\DL D',
      '/DL L L /LD L L \\LD L L \\DL',
      'L L /LD D L L D \\LD L L',
      'D D L L L L L L D D',
      'D D L L L L L L D D',
    ]),
    open: 'v 1 0, v 3 0, v 5 0, v 7 0, v 9 0, v 1 1, v 3 1, v 5 1, v 7 1, v 9 1, v 1 2, v 3 2, v 5 2, v 7 2, v 9 2, v 1 3, v 3 3, v 5 3, v 7 3, v 9 3, v 1 4, v 3 4, v 5 4, v 7 4, v 9 4, v 1 5, v 3 5, v 5 5, v 7 5, v 9 5, v 1 6, v 3 6, v 5 6, v 7 6, v 9 6, v 1 7, v 3 7, v 5 7, v 7 7, v 9 7, v 1 8, v 3 8, v 5 8, v 7 8, v 9 8, v 1 9, v 3 9, v 5 9, v 7 9, v 9 9, h 0 1, h 1 1, h 2 1, h 3 1, h 4 1, h 5 1, h 6 1, h 7 1, h 8 1, h 9 1, h 2 3, h 3 3, h 4 3, h 5 3, h 6 3, h 7 3, h 0 4, h 1 4, h 8 4, h 9 4, h 2 5, h 3 5, h 4 5, h 5 5, h 6 5, h 7 5, h 0 6, h 1 6, h 8 6, h 9 6, h 2 7, h 3 7, h 4 7, h 5 7, h 6 7, h 7 7, h 0 9, h 1 9, h 2 9, h 3 9, h 4 9, h 5 9, h 6 9, h 7 9, h 8 9, h 9 9',
  },
  {
    name: 'Providence Block II',
    size: 15,
    n: 5,
    pieces: cells([
      'L \\LD K /LD L',
      '\\DL L xKLML L /DL',
      'K xLMLK M xLKLM K',
      '/LD L xMLKL L \\LD',
      'L /DL K \\DL L',
    ]),
  },
  {
    name: 'Cathedral Window Five-Patch',
    size: 20,
    n: 10,
    pieces: cells([
      'D L L /LD \\LD /LD \\LD L L D',
      'L D D \\DL \\DL /DL /DL D D L',
      'L D D /LD /LD \\LD \\LD D D L',
      '/LD \\LD /LD D /DL \\DL D \\LD /LD \\LD',
      '\\DL \\LD /LD /DL L L \\DL \\LD /LD /DL',
      '/LD /DL \\DL \\LD L L /LD /DL \\DL \\LD',
      '\\DL /DL \\DL D \\LD /LD D /DL \\DL /DL',
      'L D D \\DL \\DL /DL /DL D D L',
      'L D D /LD /LD \\LD \\LD D D L',
      'D L L \\DL /DL \\DL /DL L L D',
    ]),
    open: 'v 7 0, v 5 9',
  },
  {
    name: 'Domino Five-Patch',
    size: 10,
    n: 5,
    pieces: cells([
      'M \\LM L /LM M',
      '\\ML M M M /ML',
      'L M L M L',
      '/LM M M M \\LM',
      'M /ML L \\ML M',
    ]),
  },
  {
    name: 'Domino Chicken Foot',
    size: 10,
    n: 5,
    pieces: cells([
      '\\MD \\LM L /LM /MD',
      '\\DL M L M /DL',
      'L M D M L',
      '/LD M L M \\LD',
      '/DM /ML L \\ML \\DM',
    ]),
  },
  {
    name: "Grandmother's Puzzle",
    size: 10,
    n: 5,
    pieces: cells([
      'D L L \\LM D',
      'L M /ML M \\LM',
      'L /ML D /LM L',
      '\\ML M /LM M L',
      'D \\ML L L D',
    ]),
  },
  {
    name: 'Garden of Eden',
    size: 10,
    n: 5,
    pieces: cells([
      '/LD \\LD D /LD \\LD',
      '\\DL /DL D \\DL /DL',
      'D D K D D',
      '/LD \\LD D /LD \\LD',
      '\\DL /DL D \\DL /DL',
    ]),
  },
  {
    name: 'Georgia',
    size: 10,
    n: 5,
    pieces: cells(['L M D M L', 'M /MD L \\MD M', 'D L M L D', 'M \\DM L /DM M', 'L M D M L']),
  },
  {
    name: "Grandmother's Choice",
    size: 10,
    n: 5,
    pieces: cells([
      'D /LD L \\LD D',
      '/LD D L D \\LD',
      'L L D L L',
      '\\DL D L D /DL',
      'D \\DL L /DL D',
    ]),
  },
  {
    name: "Mrs. Keller's Patch",
    size: 10,
    n: 5,
    pieces: cells([
      '/ML /ML L \\ML \\ML',
      '/ML L M L \\ML',
      'L M L M L',
      '\\LM L M L /LM',
      '\\LM \\LM L /LM /LM',
    ]),
  },
  {
    name: 'Red Cross Five-Patch',
    size: 10,
    n: 5,
    pieces: cells([
      '/LM \\ML D /ML \\LM',
      '\\LM /ML D \\ML /LM',
      'D D L D D',
      '/ML \\LM D /LM \\ML',
      '\\ML /LM D \\LM /ML',
    ]),
  },
  {
    name: 'Album Five-Patch',
    size: 15,
    n: 10,
    pieces: [
      ...cells([
        '2/LD . 2/LD . 2L . 2\\LD . 2\\LD .',
        '. . . . . . . . . .',
        '2/LD . 2/LM . 2L . 2\\LM . 2\\LD .',
      ]),
      ...cells(
        [
          '2\\DL . 2\\ML . 2L . 2/ML . 2/DL .',
          '. . . . . . . . . .',
          '2\\DL . 2\\DL . 2L . 2/DL . 2/DL .',
        ],
        0,
        6,
      ),
      rect(1, 4, 8, 2, 'L'),
      {
        poly: [
          [0, 4],
          [1, 5],
          [0, 6],
        ],
        c: 'M',
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
          [1, 6],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 4],
          [10, 6],
          [9, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [9, 4],
          [10, 4],
          [9, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 5],
          [10, 6],
          [9, 6],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Memory Block',
    size: 20,
    n: 10,
    pieces: [
      ...cells([
        '2/LD . L /LD \\LD /LD \\LD L 2\\LD .',
        '. . /LD L /LD \\LD L \\LD . .',
        'L /LD D /LD 2L . \\LD D \\LD L',
        '/LD L /LD D . . D \\LD L \\LD',
        '\\DL /LD . . . . . . \\LD /DL',
        '/LD \\DL . . . . . . /DL \\LD',
        '\\DL L \\DL D 2L . D /DL L /DL',
        'L \\DL D \\DL . . /DL D /DL L',
        '2\\DL . \\DL L \\DL /DL L /DL 2/DL .',
        '. . L \\DL /DL \\DL /DL L . .',
      ]),
      rect(2, 4, 6, 2, 'L'),
    ],
  },
  {
    name: "Joseph's Coat II",
    size: 15,
    n: 10,
    pieces: [
      {
        poly: [
          [0, 0],
          [2, 0],
          [0, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 0],
          [4, 0],
          [4, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 2],
          [4, 4],
          [2, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 2],
          [2, 4],
          [0, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 1],
          [2, 0],
          [2, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [3, 1],
          [2, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 1],
          [4, 2],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [3, 3],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 3],
          [2, 4],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [1, 3],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 3],
          [0, 2],
          [1, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2],
          [1, 1],
          [1, 2],
        ],
        c: 'L',
      },
      sq(1, 1, 'M'),
      sq(2, 1, 'M'),
      sq(1, 2, 'M'),
      sq(2, 2, 'M'),
      {
        poly: [
          [6, 0],
          [8, 0],
          [6, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 0],
          [10, 0],
          [10, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 2],
          [10, 4],
          [8, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 2],
          [8, 4],
          [6, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [7, 1],
          [8, 0],
          [8, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 0],
          [9, 1],
          [8, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 1],
          [10, 2],
          [9, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 2],
          [9, 3],
          [9, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 3],
          [8, 4],
          [8, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 4],
          [7, 3],
          [8, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 3],
          [6, 2],
          [7, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 2],
          [7, 1],
          [7, 2],
        ],
        c: 'L',
      },
      sq(7, 1, 'M'),
      sq(8, 1, 'M'),
      sq(7, 2, 'M'),
      sq(8, 2, 'M'),
      {
        poly: [
          [0, 6],
          [2, 6],
          [0, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 6],
          [4, 6],
          [4, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 8],
          [4, 10],
          [2, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 8],
          [2, 10],
          [0, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 7],
          [2, 6],
          [2, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 6],
          [3, 7],
          [2, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 7],
          [4, 8],
          [3, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 8],
          [3, 9],
          [3, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 9],
          [2, 10],
          [2, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 10],
          [1, 9],
          [2, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 9],
          [0, 8],
          [1, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 8],
          [1, 7],
          [1, 8],
        ],
        c: 'L',
      },
      sq(1, 7, 'M'),
      sq(2, 7, 'M'),
      sq(1, 8, 'M'),
      sq(2, 8, 'M'),
      {
        poly: [
          [6, 6],
          [8, 6],
          [6, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 6],
          [10, 6],
          [10, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 8],
          [10, 10],
          [8, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 8],
          [8, 10],
          [6, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [7, 7],
          [8, 6],
          [8, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 6],
          [9, 7],
          [8, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 7],
          [10, 8],
          [9, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 8],
          [9, 9],
          [9, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 9],
          [8, 10],
          [8, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 10],
          [7, 9],
          [8, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 9],
          [6, 8],
          [7, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 8],
          [7, 7],
          [7, 8],
        ],
        c: 'L',
      },
      sq(7, 7, 'M'),
      sq(8, 7, 'M'),
      sq(7, 8, 'M'),
      sq(8, 8, 'M'),
      ...qst(4, 0, 2, 'L', 'K', 'L', 'K'),
      ...qst(4, 2, 2, 'L', 'K', 'L', 'K'),
      ...qst(0, 4, 2, 'K', 'L', 'K', 'L'),
      ...qst(2, 4, 2, 'K', 'L', 'K', 'L'),
      ...qst(6, 4, 2, 'K', 'L', 'K', 'L'),
      ...qst(8, 4, 2, 'K', 'L', 'K', 'L'),
      ...qst(4, 6, 2, 'L', 'K', 'L', 'K'),
      ...qst(4, 8, 2, 'L', 'K', 'L', 'K'),
      sq(4, 4, 'L', 2),
    ],
  },
  {
    name: 'Easy Do Five-Patch',
    size: 15,
    n: 10,
    pieces: [
      ...cells(['K L', 'L K']),
      ...cells(['L K', 'K L'], 8, 0),
      ...cells(['L K', 'K L'], 0, 8),
      ...cells(['K L', 'L K'], 8, 8),
      {
        poly: [
          [2, 0],
          [4, 0],
          [2, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 0],
          [4, 1],
          [3, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 1],
          [3, 2],
          [2, 2],
        ],
        c: 'L',
      },
      sq(3, 1, 'M'),
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
          [6, 0],
          [7, 1],
          [6, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [7, 1],
          [8, 2],
          [7, 2],
        ],
        c: 'L',
      },
      sq(6, 1, 'M'),
      {
        poly: [
          [0, 2],
          [2, 2],
          [0, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 3],
          [1, 4],
          [0, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 2],
          [2, 3],
          [1, 3],
        ],
        c: 'L',
      },
      sq(1, 3, 'M'),
      {
        poly: [
          [8, 2],
          [10, 2],
          [10, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 3],
          [10, 4],
          [9, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 2],
          [9, 3],
          [8, 3],
        ],
        c: 'L',
      },
      sq(8, 3, 'M'),
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
          [0, 6],
          [1, 6],
          [1, 7],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 7],
          [2, 7],
          [2, 8],
        ],
        c: 'L',
      },
      sq(1, 6, 'M'),
      {
        poly: [
          [10, 6],
          [10, 8],
          [8, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 6],
          [10, 6],
          [9, 7],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 7],
          [9, 7],
          [8, 8],
        ],
        c: 'L',
      },
      sq(8, 6, 'M'),
      {
        poly: [
          [2, 8],
          [4, 10],
          [2, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 9],
          [4, 9],
          [4, 10],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 8],
          [3, 8],
          [3, 9],
        ],
        c: 'L',
      },
      sq(3, 8, 'M'),
      {
        poly: [
          [8, 8],
          [8, 10],
          [6, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 9],
          [7, 9],
          [6, 10],
        ],
        c: 'M',
      },
      {
        poly: [
          [7, 8],
          [8, 8],
          [7, 9],
        ],
        c: 'L',
      },
      sq(6, 8, 'M'),
      sq(2, 2, 'K'),
      sq(3, 2, 'M'),
      sq(2, 3, 'M'),
      sq(3, 3, 'K'),
      sq(6, 2, 'M'),
      sq(7, 2, 'K'),
      sq(6, 3, 'K'),
      sq(7, 3, 'M'),
      sq(2, 6, 'M'),
      sq(3, 6, 'K'),
      sq(2, 7, 'K'),
      sq(3, 7, 'M'),
      sq(6, 6, 'K'),
      sq(7, 6, 'M'),
      sq(6, 7, 'M'),
      sq(7, 7, 'K'),
      sq(4, 0, 'Q', 2),
      sq(4, 2, 'Q', 2),
      sq(0, 4, 'Q', 2),
      sq(2, 4, 'Q', 2),
      sq(6, 4, 'Q', 2),
      sq(8, 4, 'Q', 2),
      sq(4, 6, 'Q', 2),
      sq(4, 8, 'Q', 2),
      sq(4, 4, 'K', 2),
    ],
  },
  {
    name: 'Mexican Cross I',
    size: 15,
    n: 10,
    pieces: cells([
      'L \\ML M \\MK M M /MK M /ML L',
      '\\LM L \\ML K \\MK /MK K /ML L /LM',
      'M \\LM L \\KL /KM \\KM /KL L /LM M',
      '\\KM K \\LK L \\ML /ML L /LK K /KM',
      'M \\KM /KM \\LM /LM \\LM /LM \\KM /KM M',
      'M /MK \\MK /ML \\ML /ML \\ML /MK \\MK M',
      '/MK K /KL L /LM \\LM L \\KL K \\MK',
      'M /ML L /LK \\MK /MK \\LK L \\ML M',
      '/ML L /LM K /KM \\KM K \\LM L \\ML',
      'L /LM M /KM M M \\KM M \\LM L',
    ]),
  },
  {
    name: 'Alaska Territory',
    size: 15,
    n: 5,
    pieces: cells([
      'D D oKKDDL D D',
      'D \\LK D /LK D',
      'oKDDKL D xKLKL D oDKKDL',
      'D /KL D \\KL D',
      'D D oDDKKL D D',
    ]),
  },
  {
    name: 'Goose in the Pond',
    size: 15,
    n: 15,
    pieces: [
      ...hst(0, 0, '/', 'L', 'M', 3),
      ...hst(3, 0, '/', 'L', 'M', 3),
      ...hst(9, 0, '\\', 'L', 'M', 3),
      ...hst(12, 0, '\\', 'L', 'M', 3),
      ...hst(0, 3, '/', 'L', 'M', 3),
      ...hst(12, 3, '\\', 'L', 'M', 3),
      ...hst(0, 9, '\\', 'M', 'L', 3),
      ...hst(12, 9, '/', 'M', 'L', 3),
      ...hst(0, 12, '\\', 'M', 'L', 3),
      ...hst(3, 12, '\\', 'M', 'L', 3),
      ...hst(9, 12, '/', 'M', 'L', 3),
      ...hst(12, 12, '/', 'M', 'L', 3),
      sq(6, 0, 'L', 3),
      sq(0, 6, 'L', 3),
      sq(12, 6, 'L', 3),
      sq(6, 12, 'L', 3),
      sq(6, 6, 'L', 3),
      ...cells(['L K L', 'K L K', 'L K L'], 3, 3),
      ...cells(['L K L', 'K L K', 'L K L'], 9, 3),
      ...cells(['L K L', 'K L K', 'L K L'], 3, 9),
      ...cells(['L K L', 'K L K', 'L K L'], 9, 9),
      rect(6, 3, 3, 1, 'K'),
      rect(6, 4, 3, 1, 'L'),
      rect(6, 5, 3, 1, 'K'),
      rect(6, 9, 3, 1, 'K'),
      rect(6, 10, 3, 1, 'L'),
      rect(6, 11, 3, 1, 'K'),
      rect(3, 6, 1, 3, 'K'),
      rect(4, 6, 1, 3, 'L'),
      rect(5, 6, 1, 3, 'K'),
      rect(9, 6, 1, 3, 'K'),
      rect(10, 6, 1, 3, 'L'),
      rect(11, 6, 1, 3, 'K'),
    ],
  },
  {
    name: 'Clown',
    size: 15,
    n: 5,
    pieces: cells([
      'xMLML L L L xMLML',
      'L xLMLM L xLMLM L',
      'xLMLM L xLMLM L xLMLM',
      'L xLMLM L xLMLM L',
      'xMLML L L L xMLML',
    ]),
  },
  {
    name: 'Widower Choice',
    size: 15,
    n: 10,
    pieces: [
      ...cells(['L \\DL /DL L', '\\LD /LD \\LD /LD', '/DL \\DL /DL \\DL', 'L /LD \\LD L']),
      ...cells(['L \\DL /DL L', '\\LD /LD \\LD /LD', '/DL \\DL /DL \\DL', 'L /LD \\LD L'], 6, 6),
      sq(6, 0, 'D', 4),
      sq(0, 6, 'D', 4),
      rect(4, 0, 2, 4, 'L'),
      rect(4, 6, 2, 4, 'L'),
      rect(0, 4, 4, 2, 'L'),
      rect(6, 4, 4, 2, 'L'),
      sq(4, 4, 'D', 2),
    ],
    open: 'v 1 0, h 0 1, h 1 1, v 1 1, v 3 0, h 3 1, h 2 1, v 3 1, v 1 3, h 0 3, h 1 3, v 1 2, v 3 2, h 3 3, h 2 3, v 3 3, v 7 6, h 6 7, h 7 7, v 7 7, v 9 6, h 9 7, h 8 7, v 9 7, v 7 9, h 6 9, h 7 9, v 7 8, v 9 8, h 9 9, h 8 9, v 9 9',
  },
  {
    name: 'Leap Frog',
    size: 15,
    n: 10,
    pieces: cells([
      'M \\LM /LM M L L \\LM L M M',
      '\\ML /ML \\ML /ML L L M \\LM M M',
      '/LM \\LM /LM \\LM L L M M \\LM L',
      'M /ML \\ML M L L M M M \\LM',
      'L L L L M M L L L L',
      'L L L L M M L L L L',
      '\\ML M M M L L M \\LM /LM M',
      'L \\ML M M L L \\ML /ML \\ML /ML',
      'M M \\ML M L L /LM \\LM /LM \\LM',
      'M M L \\ML L L M /ML \\ML M',
    ]),
    open: 'v 1 0, v 3 0, v 5 0, v 7 0, v 9 0, v 1 1, v 3 1, v 5 1, v 7 1, v 9 1, v 1 2, v 3 2, v 5 2, v 7 2, v 9 2, v 1 3, v 3 3, v 5 3, v 7 3, v 9 3, v 1 4, v 2 4, v 3 4, v 5 4, v 7 4, v 8 4, v 9 4, v 1 5, v 2 5, v 3 5, v 5 5, v 7 5, v 8 5, v 9 5, v 1 6, v 3 6, v 5 6, v 7 6, v 9 6, v 1 7, v 3 7, v 5 7, v 7 7, v 9 7, v 1 8, v 3 8, v 5 8, v 7 8, v 9 8, v 1 9, v 3 9, v 5 9, v 7 9, v 9 9, h 0 1, h 1 1, h 2 1, h 3 1, h 4 1, h 5 1, h 6 1, h 7 1, h 8 1, h 9 1, h 4 2, h 5 2, h 0 3, h 1 3, h 2 3, h 3 3, h 4 3, h 5 3, h 6 3, h 7 3, h 8 3, h 9 3, h 0 5, h 1 5, h 2 5, h 3 5, h 4 5, h 5 5, h 6 5, h 7 5, h 8 5, h 9 5, h 0 7, h 1 7, h 2 7, h 3 7, h 4 7, h 5 7, h 6 7, h 7 7, h 8 7, h 9 7, h 4 8, h 5 8, h 0 9, h 1 9, h 2 9, h 3 9, h 4 9, h 5 9, h 6 9, h 7 9, h 8 9, h 9 9',
  },
  {
    name: "Bachelor's Puzzle Five-Patch",
    size: 15,
    n: 10,
    pieces: [
      ...cells(['D \\LD /LD D', '\\DL /DL \\DL /DL', '/LD \\LD /LD \\LD', 'D /DL \\DL D']),
      ...cells(['D \\LD /LD D', '\\DL /DL \\DL /DL', '/LD \\LD /LD \\LD', 'D /DL \\DL D'], 6, 0),
      ...cells(['D \\LD /LD D', '\\DL /DL \\DL /DL', '/LD \\LD /LD \\LD', 'D /DL \\DL D'], 0, 6),
      ...cells(['D \\LD /LD D', '\\DL /DL \\DL /DL', '/LD \\LD /LD \\LD', 'D /DL \\DL D'], 6, 6),
      rect(4, 0, 2, 4, 'L'),
      rect(4, 6, 2, 4, 'L'),
      rect(0, 4, 4, 2, 'L'),
      rect(6, 4, 4, 2, 'L'),
      sq(4, 4, 'L', 2),
    ],
    open: 'v 1 0, h 0 1, h 1 1, v 1 1, v 3 0, h 3 1, h 2 1, v 3 1, v 1 3, h 0 3, h 1 3, v 1 2, v 3 2, h 3 3, h 2 3, v 3 3, v 7 0, h 6 1, h 7 1, v 7 1, v 9 0, h 9 1, h 8 1, v 9 1, v 7 3, h 6 3, h 7 3, v 7 2, v 9 2, h 9 3, h 8 3, v 9 3, v 1 6, h 0 7, h 1 7, v 1 7, v 3 6, h 3 7, h 2 7, v 3 7, v 1 9, h 0 9, h 1 9, v 1 8, v 3 8, h 3 9, h 2 9, v 3 9, v 7 6, h 6 7, h 7 7, v 7 7, v 9 6, h 9 7, h 8 7, v 9 7, v 7 9, h 6 9, h 7 9, v 7 8, v 9 8, h 9 9, h 8 9, v 9 9',
  },
  {
    name: 'Broken Arrows',
    size: 10,
    n: 5,
    pieces: cells([
      '\\ML M L L /LM',
      'L \\ML M /LM M',
      'L M M M L',
      'M /ML M \\LM L',
      '/ML L L M \\LM',
    ]),
  },
  {
    name: "Honey's Choice",
    size: 10,
    n: 5,
    pieces: cells([
      '\\LM /ML L \\LM /ML',
      '/LM \\ML L /LM \\ML',
      'L L M L L',
      '\\LM /ML L \\LM /ML',
      '/LM \\ML L /LM \\ML',
    ]),
  },
  {
    name: 'Propeller',
    size: 10,
    n: 5,
    pieces: cells([
      '\\DL D L L /LD',
      'L \\DL D /LD D',
      'L D L D L',
      'D /DL D \\LD L',
      '/DL L L D \\LD',
    ]),
  },
  {
    name: 'Crazy House',
    size: 10,
    n: 5,
    pieces: cells([
      '\\LM M L M /ML',
      'M \\ML M /LM M',
      'L M L M L',
      'M /ML M \\LM M',
      '/LM M L M \\ML',
    ]),
  },
  {
    name: 'Hartford',
    size: 10,
    n: 5,
    pieces: cells([
      'L \\LD /LM L L',
      'L /DM M \\DM /DL',
      '\\ML M K M \\LM',
      '/LD \\MD M /MD L',
      'L L /ML \\DL L',
    ]),
  },
  {
    name: 'Jack in the Box',
    size: 10,
    n: 5,
    pieces: cells([
      '/LD \\LD K /LM \\LD',
      '\\ML \\LM K /ML /DL',
      'K K L K K',
      '/LD /LM K \\ML \\LM',
      '\\DL /ML K \\DL /DL',
    ]),
  },
  {
    name: 'Square and a Half',
    size: 15,
    n: 5,
    pieces: cells([
      '/DL /DL L \\DL \\DL',
      '/DL D xDLDL D \\DL',
      'L xLDLD L xLDLD L',
      '\\LD D xDLDL D /LD',
      '\\LD \\LD L /LD /LD',
    ]),
  },
  {
    name: 'Handy Andy Five-Patch',
    size: 15,
    n: 5,
    pieces: cells([
      '/LM /LM L \\LM \\LM',
      '/LM M xKMKM M \\LM',
      'L xMKMK M xMKMK L',
      '\\ML M xKMKM M /ML',
      '\\ML \\ML L /ML /ML',
    ]),
  },
  {
    name: 'Z and Cross',
    size: 10,
    n: 5,
    pieces: cells([
      '\\LD D L K /KL',
      'D \\DL M /LK K',
      'L M M M L',
      'K /KL M \\LD D',
      '/LK K L D \\DL',
    ]),
  },
  {
    name: 'St. Louis',
    size: 15,
    n: 10,
    pieces: cells([
      'L L M M \\LM /LM M M L L',
      'L L M M /ML \\ML M M L L',
      'M M L L \\LM /LM L L M M',
      'M M L L M M L L M M',
      '\\ML /ML \\ML M \\ML /ML M /ML \\ML /ML',
      '/LM \\LM /LM M /LM \\LM M \\LM /LM \\LM',
      'M M L L M M L L M M',
      'M M L L /ML \\ML L L M M',
      'L L M M \\LM /LM M M L L',
      'L L M M /ML \\ML M M L L',
    ]),
    open: 'v 1 0, v 3 0, v 5 0, v 7 0, v 9 0, v 1 1, v 3 1, v 5 1, v 7 1, v 9 1, v 1 2, v 3 2, v 5 2, v 7 2, v 9 2, v 1 3, v 3 3, v 7 3, v 9 3, v 1 4, v 9 4, v 1 5, v 9 5, v 1 6, v 3 6, v 7 6, v 9 6, v 1 7, v 3 7, v 5 7, v 7 7, v 9 7, v 1 8, v 3 8, v 5 8, v 7 8, v 9 8, v 1 9, v 3 9, v 5 9, v 7 9, v 9 9, h 0 1, h 1 1, h 2 1, h 3 1, h 4 1, h 5 1, h 6 1, h 7 1, h 8 1, h 9 1, h 0 3, h 1 3, h 2 3, h 3 3, h 6 3, h 7 3, h 8 3, h 9 3, h 0 5, h 1 5, h 2 5, h 4 5, h 5 5, h 7 5, h 8 5, h 9 5, h 0 7, h 1 7, h 2 7, h 3 7, h 6 7, h 7 7, h 8 7, h 9 7, h 0 9, h 1 9, h 2 9, h 3 9, h 4 9, h 5 9, h 6 9, h 7 9, h 8 9, h 9 9',
  },
  {
    name: 'Golden Royalty',
    size: 15,
    n: 5,
    pieces: cells([
      'L *01000101.MML L *01010001.MML L',
      '*00010101.MLM /MD xKDKD \\MD *01010001.LMM',
      'L xDKDK L xDKDK L',
      '*00010101.MLM \\DM xKDKD /DM *01010001.LMM',
      'L *00010101.LMM L *01010100.MLM L',
    ]),
  },
  {
    name: "King David's Crown",
    size: 15,
    n: 10,
    pieces: [
      ...cells([
        '2L . 2\\LM . 2xLDLD . 2/LM . 2L .',
        '. . . . . . . . . .',
        '2\\ML . . . . . . . 2/ML .',
        '. . . . . . . . . .',
        '2xDLDL . . . . . . . 2xDLDL .',
        '. . . . . . . . . .',
        '2/LM . . . . . . . 2\\LM .',
        '. . . . . . . . . .',
        '2L . 2/ML . 2xLDLD . 2\\ML . 2L .',
      ]),
      ...cells(
        [
          'L /LD . . \\LD L',
          '/LD L . . L \\LD',
          '. . . . . .',
          '. . . . . .',
          '\\DL L . . L /DL',
          'L \\DL . . /DL L',
        ],
        2,
        2,
      ),
      rect(4, 2, 2, 1, 'D'),
      rect(4, 3, 2, 1, 'L'),
      rect(2, 4, 1, 2, 'D'),
      rect(3, 4, 1, 2, 'L'),
      sq(4, 4, 'L', 2),
      rect(6, 4, 1, 2, 'L'),
      rect(7, 4, 1, 2, 'D'),
      rect(4, 6, 2, 1, 'L'),
      rect(4, 7, 2, 1, 'D'),
    ],
  },
  {
    name: "Bull's Eye",
    size: 20,
    n: 10,
    pieces: cells([
      'L L \\LM /LN L L \\LD /LM L L',
      'L L M D L L D M L L',
      '\\ML M M /DL M M \\DL M M /ML',
      '/LD D /DL L M M L \\DL D \\LD',
      'L L M M L L M M L L',
      'L L M M L L M M L L',
      'L D \\LD L M M L /LD D /DL',
      'L M M \\LD M M /LD M M \\LM',
      'L L M D L L D M L L',
      'L L /ML \\NL L L /DL \\ML L L',
    ]),
    open: 'v 1 0, v 5 0, v 9 0, v 1 1, v 5 1, v 9 1, v 5 2, v 5 3, v 1 4, v 3 4, v 5 4, v 7 4, v 9 4, v 1 5, v 3 5, v 5 5, v 7 5, v 9 5, v 5 6, v 5 7, v 1 8, v 5 8, v 9 8, v 1 9, v 5 9, v 9 9, h 0 1, h 1 1, h 4 1, h 5 1, h 8 1, h 9 1, h 4 3, h 5 3, h 0 5, h 1 5, h 2 5, h 3 5, h 4 5, h 5 5, h 6 5, h 7 5, h 8 5, h 9 5, h 4 7, h 5 7, h 0 9, h 1 9, h 4 9, h 5 9, h 8 9, h 9 9',
  },
  {
    name: "Queen Charlotte's Crown",
    size: 10,
    n: 5,
    pieces: cells([
      'L \\LM /LM 2\\QL .',
      '\\ML D /DK . .',
      '/LM /DK K /KD /ML',
      '2\\LQ . /KD D \\LM',
      '. . /ML \\ML L',
    ]),
  },
  {
    name: "Bird's Nest",
    size: 15,
    n: 5,
    pieces: cells([
      '/LD /LD oLM \\LD \\LD',
      '/LD D oLM D \\LD',
      'oLM oLM oLM oLM oLM',
      '\\DL D oLM D /DL',
      '\\DL \\DL oLM /DL /DL',
    ]),
  },
  {
    name: 'Grape Vine',
    size: 15,
    n: 10,
    pieces: [
      {
        poly: [
          [0, 1],
          [2, 1],
          [1, 0],
        ],
        c: 'M',
      },
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
          [2, 0],
          [2, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [4, 1],
          [3, 0],
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
          [3, 0],
          [4, 0],
          [4, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 1],
          [6, 1],
          [5, 0],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 0],
          [5, 0],
          [4, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 0],
          [6, 0],
          [6, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 0],
          [8, 1],
          [7, 2],
          [6, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 0],
          [7, 0],
          [6, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 0],
          [8, 0],
          [8, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 2],
          [8, 1],
          [8, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 1],
          [7, 2],
          [6, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 0],
          [9, 0],
          [9, 2],
          [8, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 0],
          [10, 1],
          [9, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [9, 0],
          [10, 0],
          [10, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 1],
          [10, 2],
          [9, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 1],
          [2, 1],
          [2, 2],
          [0, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [4, 1],
          [3, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 1],
          [3, 2],
          [2, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 1],
          [4, 2],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 1],
          [6, 1],
          [6, 2],
          [4, 2],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 2],
          [6, 2],
          [6, 3],
          [4, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [1, 2],
          [2, 3],
          [1, 4],
          [0, 3],
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
          [1, 2],
          [2, 2],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [1, 4],
          [0, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 4],
          [2, 3],
          [2, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 3],
          [3, 4],
          [2, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 2],
          [3, 2],
          [4, 3],
          [3, 4],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2],
          [4, 2],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 3],
          [4, 4],
          [3, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 3],
          [6, 3],
          [5, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 3],
          [5, 4],
          [4, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [6, 4],
          [5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 3],
          [7, 2],
          [8, 2],
          [8, 3],
          [7, 4],
          [6, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 3],
          [8, 4],
          [7, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 2],
          [9, 4],
          [8, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [9, 2],
          [10, 3],
          [9, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 2],
          [9, 2],
          [8, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 2],
          [10, 2],
          [10, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 3],
          [9, 4],
          [8, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 3],
          [10, 4],
          [9, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 9],
          [8, 9],
          [9, 10],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 10],
          [9, 10],
          [10, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 10],
          [8, 10],
          [8, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 9],
          [6, 9],
          [7, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 10],
          [7, 10],
          [8, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 10],
          [6, 10],
          [6, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 9],
          [4, 9],
          [5, 10],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 10],
          [5, 10],
          [6, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 10],
          [4, 10],
          [4, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 10],
          [2, 9],
          [3, 8],
          [4, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 10],
          [3, 10],
          [4, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 10],
          [2, 10],
          [2, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 8],
          [2, 9],
          [2, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 9],
          [3, 8],
          [4, 7],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 10],
          [1, 10],
          [1, 8],
          [2, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 10],
          [0, 9],
          [1, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 10],
          [0, 10],
          [0, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 9],
          [0, 8],
          [1, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 9],
          [8, 9],
          [8, 8],
          [10, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 9],
          [6, 9],
          [7, 8],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 9],
          [7, 8],
          [8, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 9],
          [6, 8],
          [7, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 9],
          [4, 9],
          [4, 8],
          [6, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 8],
          [4, 8],
          [4, 7],
          [6, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [9, 8],
          [8, 7],
          [9, 6],
          [10, 7],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 8],
          [9, 8],
          [10, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 8],
          [8, 8],
          [8, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 7],
          [9, 6],
          [10, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 6],
          [8, 7],
          [8, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 7],
          [7, 6],
          [8, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 8],
          [7, 8],
          [6, 7],
          [7, 6],
          [8, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [7, 8],
          [6, 8],
          [6, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 7],
          [6, 6],
          [7, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 7],
          [4, 7],
          [5, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [6, 7],
          [5, 6],
          [6, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 7],
          [4, 6],
          [5, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 7],
          [3, 8],
          [2, 8],
          [2, 7],
          [3, 6],
          [4, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 7],
          [2, 6],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 8],
          [1, 6],
          [2, 7],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 8],
          [0, 7],
          [1, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 8],
          [1, 8],
          [2, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 8],
          [0, 8],
          [0, 7],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 7],
          [1, 6],
          [2, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 7],
          [0, 6],
          [1, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [0, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 4],
          [1, 6],
          [0, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 5],
          [1, 6],
          [0, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 4],
          [2, 4],
          [2, 6],
          [1, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [2, 4],
          [3, 4],
          [3, 6],
          [2, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [3, 4],
          [4, 5],
          [3, 6],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 4],
          [4, 4],
          [4, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 5],
          [4, 6],
          [3, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 6],
          [9, 6],
          [10, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 6],
          [9, 4],
          [10, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 5],
          [9, 4],
          [10, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [9, 6],
          [8, 6],
          [8, 4],
          [9, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 6],
          [7, 6],
          [7, 4],
          [8, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [7, 6],
          [6, 5],
          [7, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [7, 6],
          [6, 6],
          [6, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [6, 5],
          [6, 4],
          [7, 4],
        ],
        c: 'L',
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
          [4, 4],
          [5, 4],
          [4, 5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 4],
          [6, 4],
          [6, 5],
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
      {
        poly: [
          [4, 5],
          [5, 6],
          [4, 6],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Zig Zag',
    size: 20,
    n: 10,
    pieces: cells([
      'M /ML L L \\ML /ML L L \\ML M',
      '/ML L L \\ML /ML \\ML /ML L L \\ML',
      'L L \\ML /ML L L \\ML /ML L L',
      'L \\ML /ML L L L L \\ML /ML L',
      '\\ML /ML L L /LM \\LM L L \\ML /ML',
      '/LM \\LM L L \\ML /ML L L /LM \\LM',
      'L /LM \\LM L L L L /LM \\LM L',
      'L L /LM \\LM L L /LM \\LM L L',
      '\\LM L L /LM \\LM /LM \\LM L L /LM',
      'M \\LM L L /LM \\LM L L /LM M',
    ]),
    open: 'v 1 9, h 0 9, v 1 0, v 7 0, v 9 0, v 1 1, v 7 1, v 9 1, v 1 2, v 5 2, v 9 2, v 1 3, v 5 3, v 9 3, v 3 4, v 7 4, v 9 4, v 3 5, v 7 5, v 9 5, v 5 6, v 9 6, v 5 7, v 9 7, v 1 8, v 5 8, v 9 8, v 9 9, h 0 1, h 1 1, h 8 1, h 9 1, h 4 3, h 5 3, h 2 5, h 3 5, h 6 5, h 7 5, h 4 7, h 5 7, h 1 9, h 8 9, h 9 9',
  },
  {
    name: "Mare's Nest",
    size: 15,
    n: 10,
    pieces: cells([
      '2K . 2/LD . /LM M 2\\LD . 2\\LK .',
      '. . . . M /ML . . . .',
      '2/LD . 2D . /LM M 2D . 2\\LD .',
      '. . . . M /ML . . . .',
      '/LM M /LM M 2L . M \\LM M \\LM',
      'M /ML M /ML . . \\ML M \\ML M',
      '2\\DL . 2D . M \\LM 2D . 2/DL .',
      '. . . . \\ML M . . . .',
      '2\\KL . 2\\DL . M \\LM 2/DL . 2K .',
      '. . . . \\ML M . . . .',
    ]),
  },
  {
    name: 'Indian Chain and Squares',
    size: 20,
    n: 10,
    pieces: cells([
      '/LD L L \\LD 2oLD . /LD L L \\LD',
      'L M M L . . L M M L',
      'L M M L 2oLD . L M M L',
      '\\DL L L /DL . . \\DL L L /DL',
      '2oLD . 2oLD . 2oLD . 2oLD . 2oLD .',
      '. . . . . . . . . .',
      '/LD L L \\LD 2oLD . /LD L L \\LD',
      'L M M L . . L M M L',
      'L M M L 2oLD . L M M L',
      '\\DL L L /DL . . \\DL L L /DL',
    ]),
  },
  {
    name: 'Milky Way',
    size: 15,
    n: 10,
    pieces: cells([
      'K L M /ML K L L /LM K L',
      'L K /ML L L K /LM M L K',
      '\\LM L L L \\ML M M M \\LM L',
      'M \\LM L L L \\ML M M M \\LM',
      'K L L /LM K L M /ML K L',
      'L K /LM M L K /ML L L K',
      '\\ML M M M \\LM L L L \\ML M',
      'L \\ML M M M \\LM L L L \\ML',
      'K L M /ML K L L /LM K L',
      'L K /ML L L K /LM M L K',
    ]),
    open: 'v 3 0, v 7 0, v 3 1, v 7 1, v 1 2, v 3 2, v 5 2, v 7 2, v 9 2, v 1 3, v 3 3, v 5 3, v 7 3, v 9 3, v 3 4, v 7 4, v 3 5, v 7 5, v 1 6, v 3 6, v 5 6, v 7 6, v 9 6, v 1 7, v 3 7, v 5 7, v 7 7, v 9 7, v 3 8, v 7 8, v 3 9, v 7 9, h 2 1, h 3 1, h 6 1, h 7 1, h 0 3, h 1 3, h 2 3, h 3 3, h 4 3, h 5 3, h 6 3, h 7 3, h 8 3, h 9 3, h 2 5, h 3 5, h 6 5, h 7 5, h 0 7, h 1 7, h 2 7, h 3 7, h 4 7, h 5 7, h 6 7, h 7 7, h 8 7, h 9 7, h 2 9, h 3 9, h 6 9, h 7 9',
  },
  {
    name: "Captain's Wheel",
    size: 10,
    n: 5,
    pieces: cells([
      '\\DM D D /DM /MD',
      '\\MD M M M D',
      'D M M M D',
      'D M M M \\DM',
      '/DM /MD D D \\MD',
    ]),
  },
  {
    name: 'Maryland',
    size: 20,
    n: 20,
    pieces: [
      {
        poly: [
          [0, 0],
          [3, 0],
          [3, 3],
          [0, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [4, 0],
          [4, 3],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [3, 3],
          [3, 4],
          [0, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 3],
          [4, 3],
          [4, 4],
          [3, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 0],
          [8, 0],
          [8, 4],
          [4, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 4],
          [4, 4],
          [4, 8],
          [0, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 4],
          [6, 4],
          [6, 6],
          [4, 6],
        ],
        c: 'K',
      },
      {
        poly: [
          [6, 4],
          [8, 4],
          [8, 6],
          [6, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 6],
          [6, 6],
          [6, 8],
          [4, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 6],
          [8, 6],
          [8, 8],
          [6, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 0],
          [10, 0],
          [9, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 0],
          [12, 0],
          [11, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 0],
          [11, 1],
          [10, 2],
          [9, 1],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 0],
          [9, 1],
          [10, 2],
          [9, 3],
          [8, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [12, 0],
          [12, 4],
          [11, 3],
          [10, 2],
          [11, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 2],
          [11, 3],
          [10, 4],
          [9, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [8, 4],
          [9, 3],
          [10, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 4],
          [11, 3],
          [12, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 4],
          [12, 4],
          [10, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 4],
          [10, 6],
          [8, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [12, 4],
          [12, 8],
          [10, 6],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 8],
          [10, 6],
          [12, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [20, 0],
          [20, 3],
          [17, 3],
          [17, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [20, 3],
          [20, 4],
          [17, 4],
          [17, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [17, 0],
          [17, 3],
          [16, 3],
          [16, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [17, 3],
          [17, 4],
          [16, 4],
          [16, 3],
        ],
        c: 'D',
      },
      {
        poly: [
          [20, 4],
          [20, 8],
          [16, 8],
          [16, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [16, 0],
          [16, 4],
          [12, 4],
          [12, 0],
        ],
        c: 'L',
      },
      {
        poly: [
          [16, 4],
          [16, 6],
          [14, 6],
          [14, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [16, 6],
          [16, 8],
          [14, 8],
          [14, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [14, 4],
          [14, 6],
          [12, 6],
          [12, 4],
        ],
        c: 'D',
      },
      {
        poly: [
          [14, 6],
          [14, 8],
          [12, 8],
          [12, 6],
        ],
        c: 'D',
      },
      {
        poly: [
          [20, 8],
          [20, 10],
          [19, 9],
        ],
        c: 'M',
      },
      {
        poly: [
          [20, 10],
          [20, 12],
          [19, 11],
        ],
        c: 'M',
      },
      {
        poly: [
          [20, 10],
          [19, 11],
          [18, 10],
          [19, 9],
        ],
        c: 'D',
      },
      {
        poly: [
          [20, 8],
          [19, 9],
          [18, 10],
          [17, 9],
          [16, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [20, 12],
          [16, 12],
          [17, 11],
          [18, 10],
          [19, 11],
        ],
        c: 'L',
      },
      {
        poly: [
          [18, 10],
          [17, 11],
          [16, 10],
          [17, 9],
        ],
        c: 'K',
      },
      {
        poly: [
          [16, 8],
          [17, 9],
          [16, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [16, 10],
          [17, 11],
          [16, 12],
        ],
        c: 'D',
      },
      {
        poly: [
          [16, 8],
          [16, 12],
          [14, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [16, 8],
          [14, 10],
          [12, 8],
        ],
        c: 'L',
      },
      {
        poly: [
          [16, 12],
          [12, 12],
          [14, 10],
        ],
        c: 'L',
      },
      {
        poly: [
          [12, 8],
          [14, 10],
          [12, 12],
        ],
        c: 'D',
      },
      {
        poly: [
          [20, 20],
          [17, 20],
          [17, 17],
          [20, 17],
        ],
        c: 'L',
      },
      {
        poly: [
          [17, 20],
          [16, 20],
          [16, 17],
          [17, 17],
        ],
        c: 'L',
      },
      {
        poly: [
          [20, 17],
          [17, 17],
          [17, 16],
          [20, 16],
        ],
        c: 'L',
      },
      {
        poly: [
          [17, 17],
          [16, 17],
          [16, 16],
          [17, 16],
        ],
        c: 'D',
      },
      {
        poly: [
          [16, 20],
          [12, 20],
          [12, 16],
          [16, 16],
        ],
        c: 'L',
      },
      {
        poly: [
          [20, 16],
          [16, 16],
          [16, 12],
          [20, 12],
        ],
        c: 'L',
      },
      {
        poly: [
          [16, 16],
          [14, 16],
          [14, 14],
          [16, 14],
        ],
        c: 'K',
      },
      {
        poly: [
          [14, 16],
          [12, 16],
          [12, 14],
          [14, 14],
        ],
        c: 'D',
      },
      {
        poly: [
          [16, 14],
          [14, 14],
          [14, 12],
          [16, 12],
        ],
        c: 'D',
      },
      {
        poly: [
          [14, 14],
          [12, 14],
          [12, 12],
          [14, 12],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 20],
          [10, 20],
          [11, 19],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 20],
          [8, 20],
          [9, 19],
        ],
        c: 'M',
      },
      {
        poly: [
          [10, 20],
          [9, 19],
          [10, 18],
          [11, 19],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 20],
          [11, 19],
          [10, 18],
          [11, 17],
          [12, 16],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 20],
          [8, 16],
          [9, 17],
          [10, 18],
          [9, 19],
        ],
        c: 'L',
      },
      {
        poly: [
          [10, 18],
          [9, 17],
          [10, 16],
          [11, 17],
        ],
        c: 'K',
      },
      {
        poly: [
          [12, 16],
          [11, 17],
          [10, 16],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 16],
          [9, 17],
          [8, 16],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 16],
          [8, 16],
          [10, 14],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 16],
          [10, 14],
          [12, 12],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 16],
          [8, 12],
          [10, 14],
        ],
        c: 'L',
      },
      {
        poly: [
          [12, 12],
          [10, 14],
          [8, 12],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 20],
          [0, 17],
          [3, 17],
          [3, 20],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 17],
          [0, 16],
          [3, 16],
          [3, 17],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 20],
          [3, 17],
          [4, 17],
          [4, 20],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 17],
          [3, 16],
          [4, 16],
          [4, 17],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 16],
          [0, 12],
          [4, 12],
          [4, 16],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 20],
          [4, 16],
          [8, 16],
          [8, 20],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 16],
          [4, 14],
          [6, 14],
          [6, 16],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 14],
          [4, 12],
          [6, 12],
          [6, 14],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 16],
          [6, 14],
          [8, 14],
          [8, 16],
        ],
        c: 'D',
      },
      {
        poly: [
          [6, 14],
          [6, 12],
          [8, 12],
          [8, 14],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 12],
          [0, 10],
          [1, 11],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 10],
          [0, 8],
          [1, 9],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 10],
          [1, 9],
          [2, 10],
          [1, 11],
        ],
        c: 'D',
      },
      {
        poly: [
          [0, 12],
          [1, 11],
          [2, 10],
          [3, 11],
          [4, 12],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 8],
          [4, 8],
          [3, 9],
          [2, 10],
          [1, 9],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 10],
          [3, 9],
          [4, 10],
          [3, 11],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 12],
          [3, 11],
          [4, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 10],
          [3, 9],
          [4, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 12],
          [4, 8],
          [6, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [4, 12],
          [6, 10],
          [8, 12],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 8],
          [8, 8],
          [6, 10],
        ],
        c: 'L',
      },
      {
        poly: [
          [8, 12],
          [6, 10],
          [8, 8],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 8],
          [12, 10],
          [10, 12],
          [8, 10],
        ],
        c: 'M',
      },
      {
        poly: [
          [8, 8],
          [10, 8],
          [8, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [10, 8],
          [12, 8],
          [12, 10],
        ],
        c: 'D',
      },
      {
        poly: [
          [12, 10],
          [12, 12],
          [10, 12],
        ],
        c: 'D',
      },
      {
        poly: [
          [8, 10],
          [10, 12],
          [8, 12],
        ],
        c: 'D',
      },
    ],
  },
  {
    name: 'Minnesota',
    size: 15,
    n: 5,
    pieces: [
      {
        poly: [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 0],
          [1, 1],
          [0, 1],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 0],
          [2, 0],
          [1, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1, 1],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 1],
          [1, 1],
          [0, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 1],
          [1, 2],
          [0, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 1],
          [2, 1],
          [2, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 1],
          [2, 2],
          [1, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 0],
          [4, 0],
          [4, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 0],
          [4, 1],
          [3, 1],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 0],
          [5, 0],
          [4, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 0],
          [5, 1],
          [4, 1],
        ],
        c: 'K',
      },
      {
        poly: [
          [3, 1],
          [4, 1],
          [3, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 1],
          [4, 2],
          [3, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 1],
          [5, 1],
          [5, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 1],
          [5, 2],
          [4, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3],
          [1, 3],
          [1, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3],
          [1, 4],
          [0, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 3],
          [2, 3],
          [1, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 3],
          [2, 4],
          [1, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 4],
          [1, 4],
          [0, 5],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 4],
          [1, 5],
          [0, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 4],
          [2, 4],
          [2, 5],
        ],
        c: 'K',
      },
      {
        poly: [
          [1, 4],
          [2, 5],
          [1, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 3],
          [4, 3],
          [4, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 3],
          [4, 4],
          [3, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 3],
          [5, 3],
          [4, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 3],
          [5, 4],
          [4, 4],
        ],
        c: 'K',
      },
      {
        poly: [
          [3, 4],
          [4, 4],
          [3, 5],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 4],
          [4, 5],
          [3, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 4],
          [5, 4],
          [5, 5],
        ],
        c: 'K',
      },
      {
        poly: [
          [4, 4],
          [5, 5],
          [4, 5],
        ],
        c: 'M',
      },
      {
        poly: [
          [2.5, 0],
          [2.5, 1],
          [2, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [2.5, 0],
          [3, 1],
          [2.5, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 1],
          [2.5, 1],
          [2.5, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [2.5, 1],
          [3, 1],
          [2.5, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 0],
          [2.5, 0],
          [2, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2.5, 0],
          [3, 0],
          [3, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 1],
          [2.5, 2],
          [2, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 1],
          [3, 2],
          [2.5, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 2.5],
          [4, 2.5],
          [4, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 2.5],
          [4, 3],
          [4, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 2],
          [4, 2.5],
          [3, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 2.5],
          [4, 3],
          [3, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 2],
          [5, 2.5],
          [4, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 2.5],
          [5, 3],
          [4, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 2],
          [3, 2.5],
          [3, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [4, 3],
          [3, 3],
          [3, 2.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2.5, 5],
          [2.5, 4],
          [3, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2.5, 5],
          [2, 4],
          [2.5, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 4],
          [2.5, 4],
          [2.5, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [2.5, 4],
          [2, 4],
          [2.5, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 5],
          [2.5, 5],
          [3, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [2.5, 5],
          [2, 5],
          [2, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 4],
          [2.5, 3],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 4],
          [2, 3],
          [2.5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2.5],
          [1, 2.5],
          [1, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 2.5],
          [1, 2],
          [1, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 3],
          [1, 2.5],
          [2, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [1, 2.5],
          [1, 2],
          [2, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3],
          [0, 2.5],
          [1, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2.5],
          [0, 2],
          [1, 2],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 3],
          [2, 2.5],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [1, 2],
          [2, 2],
          [2, 2.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2.5, 2],
          [3, 2.5],
          [2.5, 3],
          [2, 2.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 2],
          [2.5, 2],
          [2, 2.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [2.5, 2],
          [3, 2],
          [3, 2.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 2.5],
          [3, 3],
          [2.5, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 2.5],
          [2.5, 3],
          [2, 3],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Follow the Leader',
    size: 10,
    n: 5,
    pieces: [
      ...cells([
        'M /LM . \\LM M',
        '/LM M . M \\LM',
        '. . L . .',
        '\\ML M . M /ML',
        'M \\ML . /ML M',
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
          [5, 2],
          [3, 2],
          [3, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 2],
          [5, 3],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 5],
          [3, 3],
          [2, 3],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 5],
          [2, 5],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [2, 3],
          [2, 2],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3],
          [0, 2],
          [2, 2],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Pinwheel Square',
    size: 10,
    n: 5,
    pieces: [
      ...cells([
        'M /KL . \\LD M',
        '/LD \\LD . /DL \\KL',
        '. . M . .',
        '\\LK /LD . \\DL /DL',
        'M \\DL . /LK M',
      ]),
      {
        poly: [
          [2, 0],
          [2, 2],
          [3, 2],
        ],
        c: 'K',
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
          [5, 2],
          [3, 2],
          [3, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [5, 2],
          [5, 3],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 5],
          [3, 3],
          [2, 3],
        ],
        c: 'K',
      },
      {
        poly: [
          [3, 5],
          [2, 5],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [2, 3],
          [2, 2],
        ],
        c: 'K',
      },
      {
        poly: [
          [0, 3],
          [0, 2],
          [2, 2],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Crazy Ann Five-Patch',
    size: 10,
    n: 5,
    pieces: [
      ...cells([
        'M /LD . \\LD M',
        '/LD D . D \\LD',
        '. . K . .',
        '\\DL D . D /DL',
        'M \\DL . /DL M',
      ]),
      {
        poly: [
          [2, 0],
          [2, 2],
          [3, 2],
        ],
        c: 'P',
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
          [5, 2],
          [3, 2],
          [3, 3],
        ],
        c: 'P',
      },
      {
        poly: [
          [5, 2],
          [5, 3],
          [3, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 5],
          [3, 3],
          [2, 3],
        ],
        c: 'P',
      },
      {
        poly: [
          [3, 5],
          [2, 5],
          [2, 3],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [2, 3],
          [2, 2],
        ],
        c: 'P',
      },
      {
        poly: [
          [0, 3],
          [0, 2],
          [2, 2],
        ],
        c: 'L',
      },
    ],
  },
  {
    name: 'Pigeon Toes',
    size: 15,
    n: 5,
    pieces: [
      ...cells(['L . L . L', '. L M L .', 'L M L M L', '. L M L .', 'L . L . L']),
      {
        poly: [
          [1, 0],
          [1.5, 0],
          [1, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [1.5, 0],
          [1.5, 1],
          [1, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [1.5, 0],
          [2, 0],
          [1.5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 0],
          [2, 1],
          [1.5, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [3, 0],
          [3.5, 0],
          [3.5, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 0],
          [3, 1],
          [3.5, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [3.5, 0],
          [4, 0],
          [4, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [3.5, 0],
          [3.5, 1],
          [4, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 1],
          [5, 1.5],
          [4, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 1.5],
          [4, 1.5],
          [4, 1],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 1.5],
          [5, 2],
          [4, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 2],
          [4, 2],
          [4, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 3],
          [5, 3.5],
          [4, 3.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 3],
          [4, 3],
          [4, 3.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [5, 3.5],
          [5, 4],
          [4, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [5, 3.5],
          [4, 3.5],
          [4, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [4, 5],
          [3.5, 5],
          [4, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [3.5, 5],
          [3.5, 4],
          [4, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [3.5, 5],
          [3, 5],
          [3.5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [3, 5],
          [3, 4],
          [3.5, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [2, 5],
          [1.5, 5],
          [1.5, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [2, 5],
          [2, 4],
          [1.5, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [1.5, 5],
          [1, 5],
          [1, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [1.5, 5],
          [1.5, 4],
          [1, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 4],
          [0, 3.5],
          [1, 4],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3.5],
          [1, 3.5],
          [1, 4],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 3.5],
          [0, 3],
          [1, 3.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 3],
          [1, 3],
          [1, 3.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 2],
          [0, 1.5],
          [1, 1.5],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 2],
          [1, 2],
          [1, 1.5],
        ],
        c: 'M',
      },
      {
        poly: [
          [0, 1.5],
          [0, 1],
          [1, 1],
        ],
        c: 'L',
      },
      {
        poly: [
          [0, 1.5],
          [1, 1.5],
          [1, 1],
        ],
        c: 'M',
      },
    ],
  },
  {
    name: "Grandmother's Own III",
    size: 15,
    n: 5,
    pieces: [
      ...cells(['M M . M M', 'M L D L M', '. D D D .', 'M L D L M', 'M M . M M']),
      ...goose(2, 0, 1, 1, '^', 'D', 'M'),
      ...goose(4, 2, 1, 1, '>', 'D', 'M'),
      ...goose(2, 4, 1, 1, 'v', 'D', 'M'),
      ...goose(0, 2, 1, 1, '<', 'D', 'M'),
    ],
  },
  {
    name: "Grandmother's Cross II",
    size: 15,
    n: 5,
    pieces: [
      ...cells(['D D . D D', 'D L M L D', '. M D M .', 'D L M L D', 'D D . D D']),
      ...goose(2, 0, 1, 1, '^', 'M', 'D'),
      ...goose(4, 2, 1, 1, '>', 'M', 'D'),
      ...goose(2, 4, 1, 1, 'v', 'M', 'D'),
      ...goose(0, 2, 1, 1, '<', 'M', 'D'),
    ],
  },
];

export const FIVE_PATCH_BLOCKS = gridBlocks(FIVE_PATCH_DEFS, 'N-Patch/Five-patch');
