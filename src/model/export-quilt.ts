// Export one quilt (0.7.0): a project holding just that quilt and what it uses, its blocks (and
// their colors and fabrics) and the palettes cut down to those. Opens as a project or imports
// like any other (Import quilts from a project). EPP quilts (0.9.1 fix): the shapes and rosettes it
// places and the colors they're painted with.
import { swapColorings } from './colorways';
import { dataColorings } from './data-quilt';
import { blocksUsed, colorsIn, eppColorings, eppUsed, fabricsIn } from './library-items';
import type { RrqDoc } from './schema/project';

export function quiltProject(doc: RrqDoc, quiltId: string, projectId: string): RrqDoc | undefined {
  const p = doc.project;
  const q = p.quilts.find((x) => x.id === quiltId);
  if (!q) return undefined;
  const used = blocksUsed({ ...p, quilts: [q] });
  const blocks = p.blocks.filter((b) => used.has(b.id));
  // EPP: the rosettes the quilt places (or holds as blocks), then the shapes it and they use.
  const placed = eppUsed({ ...p, quilts: [q], blocks });
  const rosettes = (p.rosettes ?? []).filter((r) => placed.rosettes.has(r.id));
  const shapesUsed = eppUsed({ ...p, quilts: [q], blocks, rosettes }).shapes;
  const eppShapes = (p.eppShapes ?? []).filter((s) => shapesUsed.has(s.id));
  const colorings = [
    ...blocks.flatMap((b) => b.colorings),
    ...Object.values(q.colorings),
    ...swapColorings([q]),
    ...dataColorings([q]),
    ...eppColorings({ ...p, quilts: [q], rosettes, eppShapes }),
  ];
  const colors = new Set(colorsIn(colorings));
  const fabrics = new Set(fabricsIn(colorings));
  // ponytail: photos, embroidery and fonts go along whole; nothing ties them to one quilt yet.
  return {
    ...doc,
    project: {
      ...p,
      id: projectId,
      name: q.notecard.name,
      quilts: [q],
      blocks,
      ...(p.eppShapes ? { eppShapes } : {}),
      ...(p.rosettes ? { rosettes } : {}),
      palette: {
        ...p.palette,
        colors: p.palette.colors.filter((c) => colors.has(c.id)),
        fabrics: p.palette.fabrics.filter((f) => fabrics.has(f.id)),
        // Palettes stay (a colorway's auto mapping may name one), holding only what's kept.
        ...(p.palette.collections
          ? {
              collections: p.palette.collections.map((c) => ({
                ...c,
                colors: c.colors.filter((id) => colors.has(id)),
                fabrics: c.fabrics.filter((id) => fabrics.has(id)),
              })),
            }
          : {}),
      },
    },
  };
}
