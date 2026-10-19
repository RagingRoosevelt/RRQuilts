// Border matrix (Tests tab, dev server only): every border style the Borders tab offers, on the
// same small quilt, generated from the style list so new styles show up by themselves.
import { BORDER_STYLE_NAMES } from '@/model/layout/borders';
import type { DevVariation } from './build';

const PLAIN = new Set(['long-horizontal', 'long-vertical', 'mitered', 'corner-blocks']);
const BLOCKS = new Set([
  'blocks',
  'half-drop-blocks',
  'blocks-aligned-inside',
  'half-drop-aligned',
]);

const group = (style: string) =>
  PLAIN.has(style) ? 'Plain borders' : BLOCKS.has(style) ? 'Block borders' : 'Pieced borders';
const EXPECT: Record<string, string> = {
  'Plain borders':
    'One plain strip on each side; the corners are joined as the name says (long sides, mitered, or a corner square).',
  'Block borders':
    'Block-sized units all the way round, each painted (borders take colors and fabrics, not blocks, since 0.3.0); half drop styles offset by half a unit, aligned styles line up with the blocks inside.',
  'Pieced borders':
    'The pattern repeats evenly along every side and the four corners meet cleanly; no piece is cut off mid-repeat.',
};

/** A 3 in inner plain border to set the style off, then the style at 4 in. */
export const BORDERS: DevVariation[] = Object.entries(BORDER_STYLE_NAMES).map(([style, name]) => ({
  id: `border:${style}`,
  title: name,
  group: group(style),
  note: EXPECT[group(style)]!,
  style: 'straight-set',
  borders: [
    { style: 'long-horizontal', sides: [1, 1, 1, 1] },
    { style, sides: [4, 4, 4, 4] },
  ],
}));
