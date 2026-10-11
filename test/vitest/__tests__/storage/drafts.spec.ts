import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { createProject } from '@/model/new-project';
import { resetIdb } from '@/storage/idb';
import { getDraft, markDraftClean, putDraft, removeDraft, unsavedDrafts } from '@/storage/drafts';
import { recentProjects, rememberRecent } from '@/storage/recent';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetIdb();
});

describe('drafts', () => {
  it('stores, lists only unsaved drafts newest first, and marks clean', async () => {
    const a = createProject('A');
    const b = createProject('B');
    await putDraft(a, true, 1);
    await putDraft(b, true, 2);
    expect((await unsavedDrafts()).map((d) => d.name)).toEqual(['B', 'A']);
    await markDraftClean(a.project.id);
    expect((await unsavedDrafts()).map((d) => d.name)).toEqual(['B']);
    expect((await getDraft(a.project.id))?.doc).toEqual(a);
    await removeDraft(b.project.id);
    expect(await unsavedDrafts()).toEqual([]);
  });

  it('keys drafts by project id, so renames replace the same draft', async () => {
    const doc = createProject('Old');
    await putDraft(doc, true);
    doc.project.name = 'New';
    await putDraft(doc, true);
    expect((await unsavedDrafts()).map((d) => d.name)).toEqual(['New']);
  });

  it('rejects (instead of throwing synchronously) when storage is unavailable', async () => {
    globalThis.indexedDB = {
      open() {
        throw new DOMException('blocked', 'SecurityError');
      },
    } as unknown as IDBFactory;
    resetIdb();
    await expect(putDraft(createProject(), true)).rejects.toBeTruthy();
  });
});

describe('recent projects', () => {
  it('keeps the 20 newest', async () => {
    for (let i = 0; i < 25; i++) await rememberRecent({ id: `p${i}`, name: `P${i}`, openedAt: i });
    const list = await recentProjects();
    expect(list).toHaveLength(20);
    expect(list[0]!.id).toBe('p24');
  });
});
