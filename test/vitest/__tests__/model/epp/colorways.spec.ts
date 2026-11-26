// EPP quilt colorways (owner, 2026-11-25: "epp quilts don't seem to handle auto map colorations
// right"): an Auto map colorway maps the colors of the quilt's pieces, and the quilt's colors list
// (the colorway map's rows, New colorway from palette) has them.
import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { builtinDoc, builtinLibrary } from '@/content/starter';
import { quiltPaints } from '@/editor/colors';
import { lookupOf, withSources } from '@/model/library';
import { syncDraft } from '@/model/library-items';
import { createProject } from '@/model/new-project';
import { addEppV12 } from '../../formats/epp-v12';

describe('EPP quilt colorways', () => {
  it('Auto map maps the colors of the pieces; the colors list has them', async () => {
    const lib = builtinDoc(await builtinLibrary());
    const lookup = lookupOf([{ doc: lib, ...withSources(lib) }]);
    const doc = addEppV12(createProject('EPP', 'in'));
    const i = doc.project.quilts.findIndex((q) => q.notecard.name === 'EPP Quilt');
    const paints = quiltPaints(doc, doc.project.quilts[i]!);
    expect(paints.size).toBeGreaterThan(2);
    const next = produce(doc, (d) => {
      d.project.quilts[i]!.colorways = [
        { id: 'auto', name: 'Auto', swaps: [], auto: { palette: 'rrquilts.neon' } },
      ];
      syncDraft(d, lookup);
    });
    const v = next.project.quilts[i]!.colorways![0]!;
    expect(v.auto).toBeDefined();
    // Every piece color maps to a Neon color (none of the quilt's are Neon).
    expect(v.swaps.map((s) => s.from).sort()).toEqual([...paints].map((p) => `color:${p}`).sort());
  });
});
