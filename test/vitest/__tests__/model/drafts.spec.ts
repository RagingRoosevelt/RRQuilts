import { describe, expect, it } from 'vitest';
import { VERSION } from '@/model/schema/project';
import { draftDoc, draftText, UnreadableDraft, type Draft } from '@/storage/drafts';
import { fixture } from './helpers';

const draft = (doc: unknown): Draft =>
  ({ id: 'p1', name: 'Old work', savedAt: 0, dirty: true, doc }) as Draft;

describe('drafts open like files (migrated, checked)', () => {
  it('a draft written by an older version is brought up to date', async () => {
    const old = fixture(); // the fixture is an older format version
    expect(old.version).toBeLessThan(VERSION);
    const { doc } = await draftDoc(draft(old));
    expect(doc.version).toBe(VERSION);
    expect(doc.project.quilts.length).toBe(old.project.quilts.length);
  });

  it("a draft that can't be read says so (and isn't lost)", async () => {
    const bad = draft({ format: 'rrq', version: 1, project: 'nope' });
    const err = await draftDoc(bad).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(UnreadableDraft);
    expect((err as Error).message).toMatch(/Couldn't open the unsaved changes of “Old work”/);
    // Offered as a file to fix by hand: the draft exactly as stored.
    expect(JSON.parse(draftText((err as UnreadableDraft).draft))).toEqual(bad.doc);
  });
});
