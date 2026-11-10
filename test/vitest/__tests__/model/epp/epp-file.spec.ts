import { describe, expect, it } from 'vitest';
import { eppStarters } from '@/content/epp';
import { eppFile, importEpp, parseEppFile, serializeEpp } from '@/model/epp-file';
import { addEpp, emptyPersonal } from '@/model/library';
import { createProject } from '@/model/new-project';
import { produce } from 'immer';

const { shapes, rosettes } = eppStarters();
const flower = rosettes[0]!;
const plain = shapes.map((s) => ({ ...s, category: undefined }));
const lookup = {
  shape: (id: string) => plain.find((s) => s.id === id),
  color: (id: string) => ({
    id,
    notecard: { name: id },
    rgb: [1, 2, 3] as [number, number, number],
  }),
  fabric: () => undefined,
};

describe('.rrqepp', () => {
  it('a rosette file carries its shapes and colors and imports into another project', () => {
    const doc = produce(createProject('A'), (d) => void (d.project.rosettes = [flower]));
    const file = eppFile(doc, flower.id, lookup, 'test')!;
    expect(file.shapes?.map((s) => s.id)).toEqual(['rrquilts.epp-hexagon']);
    expect(file.colors?.length).toBeGreaterThan(0);
    const parsed = parseEppFile(serializeEpp(file));
    if (!parsed.ok) throw new Error(parsed.error);
    const { doc: b, id } = importEpp(createProject('B'), parsed.file, 'me');
    expect(id).toBe(flower.id);
    expect(b.project.rosettes?.[0]?.id).toBe(flower.id);
    expect(b.project.eppShapes?.[0]?.id).toBe('rrquilts.epp-hexagon');
    // Importing again changes nothing; a different design with the same id becomes a copy.
    expect(importEpp(b, parsed.file, 'me').doc).toBe(b);
    const changed = produce(parsed.file, (f) => void (f.item.data.notecard.notes = 'x'));
    const moved = produce(changed, (f) => {
      if (f.item.type === 'rosette') f.item.data.pieces = f.item.data.pieces.slice(1);
    });
    const again = importEpp(b, moved, 'me');
    expect(again.id).not.toBe(flower.id);
  });

  it('rejects other files and newer versions', () => {
    expect(parseEppFile('{').ok).toBe(false);
    expect(parseEppFile('{"format":"rrqbl"}').ok).toBe(false);
    expect(parseEppFile('{"format":"rrqepp","version":99}').ok).toBe(false);
  });

  it('add to My library links the project copy', async () => {
    const doc = produce(createProject('A'), (d) => {
      d.project.eppShapes = [plain[0]!];
      d.project.rosettes = [flower];
    });
    const r = await addEpp(emptyPersonal('me.x'), doc, flower.id);
    const item = r.lib.items[0]!;
    expect(item.type).toBe('rosette');
    if (item.type === 'rosette')
      expect(item.shapes?.map((s) => s.id)).toEqual(['rrquilts.epp-hexagon']);
    expect(r.doc.project.rosettes?.[0]?.source?.derived).toBe(true);
  });
});
