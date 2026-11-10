import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { checkOutline } from '@/model/epp/checks';
import { expand, lookupEpp } from '@/model/epp/expand';
import { overlapping, outerEdges } from '@/model/epp/geometry';
import { parseLibraryValue } from '@/model/library-file';

describe('built-in EPP starters', () => {
  const { shapes, rosettes } = eppStarters();
  it.each(shapes.map((s) => [s.notecard.name, s] as const))('%s passes every check', (_, s) => {
    expect(checkOutline(s.outline)).toEqual({
      closes: true,
      simple: true,
      wholeUnits: true,
      convex: true,
    });
  });
  it.each(rosettes.map((r) => [r.notecard.name, r] as const))(
    '%s: pieces meet without overlapping',
    (_, r) => {
      const lookup = lookupEpp({ eppShapes: shapes, rosettes });
      const leaves = expand({ id: 'x', rosette: r.id, at: [0, 0], turn: 0, scale: 1 }, lookup);
      expect(leaves).toHaveLength(r.pieces.length);
      expect([...overlapping(leaves.map((l) => l.poly))]).toEqual([]);
      // Joined edge to edge: the outside is shorter than all the pieces' edges together.
      const total = leaves.reduce((s, l) => s + l.poly.length, 0);
      if (leaves.length > 1)
        expect(outerEdges(leaves.map((l) => l.poly)).length).toBeLessThan(total);
    },
  );
  it('all are in the built-in library, which parses, with colors that exist', async () => {
    const doc = builtinDoc(await builtinLibrary());
    const r = parseLibraryValue(doc);
    if (!r.ok) throw new Error(r.error);
    expect(r.skipped).toEqual([]);
    const colorIds = new Set(
      doc.items.flatMap((i) => (i.type === 'colors' ? i.data.colors.map((c) => c.id) : [])),
    );
    for (const ro of rosettes)
      for (const c of ro.colorings)
        for (const f of Object.values(c.fills))
          if ('color' in f) expect(colorIds.has(f.color)).toBe(true);
    expect(doc.items.filter((i) => i.type === 'epp-shape')).toHaveLength(shapes.length);
  });
});
