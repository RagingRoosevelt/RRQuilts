import { afterEach, describe, expect, it, vi } from 'vitest';
import { download, fileNameFor, pickSaveHandle, supportsFileAccess } from '@/storage/files';

afterEach(() => {
  vi.restoreAllMocks();
  delete window.showSaveFilePicker;
  delete window.showOpenFilePicker;
});

describe('file saving', () => {
  it('makes safe file names', () => {
    expect(fileNameFor('Mom: "Star" quilt')).toBe('Mom_ _Star_ quilt.rrq');
    expect(fileNameFor('  ')).toBe('Untitled.rrq');
  });

  it('falls back to downloading <name>.rrq', () => {
    expect(supportsFileAccess()).toBe(false);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    let blob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => {
      blob = b as Blob;
      return 'blob:x';
    });
    download('Sampler', '{"format":"rrq"}');
    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('Sampler.rrq');
    expect(blob?.size).toBe(16);
  });

  it('asks where to save (name-only type label); cancel returns null', async () => {
    const handle = {} as FileSystemFileHandle;
    window.showSaveFilePicker = vi.fn(() => Promise.resolve(handle));
    expect(await pickSaveHandle('Sampler')).toBe(handle);
    expect(window.showSaveFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({
        suggestedName: 'Sampler.rrq',
        types: [{ description: 'RRQuilts project file', accept: { 'application/json': ['.rrq'] } }],
      }),
    );

    window.showSaveFilePicker = vi.fn(() =>
      Promise.reject(new DOMException('cancel', 'AbortError')),
    );
    expect(await pickSaveHandle('Sampler')).toBeNull();
  });
});
