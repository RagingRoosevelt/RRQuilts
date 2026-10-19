// Spec 029: techniques replace styles (which become tags), the quilter's tags, packs without them.
import { describe, expect, it } from 'vitest';
import { blockFile } from '@/model/block-file';
import { parseProject } from '@/model/io';
import { packDoc, parseLibrary } from '@/model/library-file';
import { emptyPersonal, notecardMatches } from '@/model/library';
import { cleanTags, keptTags, setKept, stylesToTags, tagsFor, withoutTags } from '@/model/tags';
import { fixture } from './helpers';

describe('styles become tags', () => {
  it('on every notecard, merged with existing tags, nothing else touched', () => {
    const raw = {
      a: { notecard: { name: 'A', tags: ['red'], styles: ['eight-point', 'Red'] } },
      list: [{ notecard: { name: 'B', styles: [] } }, { other: { styles: ['kept'] } }],
    };
    expect(stylesToTags(raw)).toEqual({
      a: { notecard: { name: 'A', tags: ['red', 'eight-point'] } },
      list: [{ notecard: { name: 'B' } }, { other: { styles: ['kept'] } }],
    });
    expect(stylesToTags(stylesToTags(raw))).toEqual(stylesToTags(raw));
  });

  it('when a v6 project opens', async () => {
    const doc = fixture();
    (doc as { version: number }).version = 6;
    (doc.project.blocks[0]!.notecard as Record<string, unknown>).styles = ['eight-point'];
    const r = await parseProject(JSON.stringify(doc));
    if (!r.ok) throw new Error(r.error);
    expect(r.doc.project.blocks[0]!.notecard.tags).toContain('eight-point');
    expect('styles' in r.doc.project.blocks[0]!.notecard).toBe(false);
  });

  it('when a v3 library opens', () => {
    const lib = { ...emptyPersonal('me'), version: 3 } as Record<string, unknown>;
    const r = parseLibrary(JSON.stringify(lib));
    expect(r.ok).toBe(true);
  });
});

describe('tags', () => {
  it('are trimmed, kept once ignoring case, and take a known spelling', () => {
    expect(cleanTags([' Christmas ', 'christmas', '', 'xmas', 3], ['XMAS'])).toEqual([
      'Christmas',
      'XMAS',
    ]);
  });

  it('on others’ items are kept by id, with internal tags left out', () => {
    let kept = setKept(undefined, 'rrquilts.ohio-star', ['stars', 'red']);
    kept = setKept(kept, 'rrquilts.pinwheel', ['easy']);
    kept = setKept(kept, 'rrquilts.pinwheel', []);
    expect(kept).toEqual([{ id: 'rrquilts.ohio-star', tags: ['stars', 'red'] }]);
    expect(tagsFor(['system', 'mine'], ['x', 'rrquilts.ohio-star'], keptTags(kept))).toEqual([
      'mine',
      'stars',
      'red',
    ]);
  });

  it('are searched with technique names', () => {
    const n = { name: 'Star', techniques: ['epp' as const] };
    expect(notecardMatches(n, 'english paper')).toBe(true);
    expect(notecardMatches(n, 'favourite', ['favourite'])).toBe(true);
  });

  it('stay home: block files and packs leave them out, technique travels', () => {
    const block = fixture().project.blocks[0]!;
    const tagged = {
      ...block,
      notecard: { ...block.notecard, tags: ['mine'], techniques: ['hand' as const] },
    };
    const f = blockFile(tagged, 'in', [], 'Me');
    expect(f.block.notecard.tags).toBeUndefined();
    expect(f.block.notecard.techniques).toEqual(['hand']);
    expect(withoutTags(block)).toEqual(withoutTags(withoutTags(block)));

    const mine = {
      ...emptyPersonal('me'),
      annotations: [{ id: 'rrquilts.x', tags: ['t'] }],
      items: [{ type: 'block' as const, data: tagged }],
    };
    const { doc } = packDoc(mine, 'Me', { name: 'P', author: 'Me', license: 'CC-BY-4.0' });
    expect(doc.items[0]!.data.notecard.tags).toBeUndefined();
    expect(doc.items[0]!.data.notecard.techniques).toEqual(['hand']);
    expect('annotations' in doc).toBe(false);
  });
});
