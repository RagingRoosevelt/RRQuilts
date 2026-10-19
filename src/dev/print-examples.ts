// Print sheets (Tests tab, dev server only): the Print tab for a few layout gallery quilts, with
// what to check on the sheets.
export const PRINT_EXAMPLES: { id: string; quilt: string; check: string[] }[] = [
  {
    id: 'P1',
    quilt: 'G001',
    check: [
      'Quilt picture page with the nine blocks, sashing and border.',
      'Rotary cuts for each block, the sashing strips and the border strips, at finished size plus seam allowance.',
      'Yardage lists every color used, including sashing and border.',
    ],
  },
  {
    id: 'P2',
    quilt: 'G011',
    check: [
      'Pieced borders print as templates (points and diamonds), each labeled and at true size.',
      'Border piece counts match what is drawn on the quilt.',
    ],
  },
  {
    id: 'P3',
    quilt: 'G024',
    check: [
      'Hexagon block pieces print as templates (no rotary cuts for 60° shapes).',
      'Templates are at true size with seam allowance, grouped and lettered by shape.',
    ],
  },
  {
    id: 'P4',
    quilt: 'G013',
    check: [
      'Clamshell patches print as curved templates, with smooth arcs.',
      'Patches trimmed by the quilt edge are counted with the whole patches they are cut from.',
    ],
  },
];
