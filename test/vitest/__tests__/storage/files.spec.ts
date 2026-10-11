import { afterEach, describe, expect, it, vi } from 'vitest';
import { download, fileNameFor, saveWithPicker, supportsFileAccess } from '@/storage/files';

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

  it('writes through the picked handle and returns it; cancel returns null', async () => {
    const written: string[] = [];
    const handle = {
      createWritable: () =>
        Promise.resolve({
          write: (t: string) => (written.push(t), Promise.resolve()),
          close: () => Promise.resolve(),
        }),
    } as unknown as FileSystemFileHandle;
    window.showSaveFilePicker = vi.fn(() => Promise.resolve(handle));
    expect(await saveWithPicker('Sampler', 'TEXT')).toBe(handle);
    expect(written).toEqual(['TEXT']);
    expect(window.showSaveFilePicker).toHaveBeenCalledWith(
      expect.objectContaining({ suggestedName: 'Sampler.rrq' }),
    );

    window.showSaveFilePicker = vi.fn(() =>
      Promise.reject(new DOMException('cancel', 'AbortError')),
    );
    expect(await saveWithPicker('Sampler', 'TEXT')).toBeNull();
  });
});
