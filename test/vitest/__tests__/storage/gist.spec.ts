import { afterEach, describe, expect, it, vi } from 'vitest';
import { gistId, gistProjects, gistText } from '@/storage/gist';

const ID = 'aa5a315d61ae9438b18d';

describe('open from a gist', () => {
  afterEach(() => void vi.unstubAllGlobals());

  it('finds the id in links and bare ids', () => {
    expect(gistId(`https://gist.github.com/someone/${ID}`)).toBe(ID);
    expect(gistId(`https://gist.github.com/${ID}#file-x-rrq`)).toBe(ID);
    expect(gistId(` ${ID.toUpperCase()} `)).toBe(ID);
    expect(gistId(`https://gist.githubusercontent.com/someone/${ID}/raw/abc/q.rrq`)).toBe(ID);
    expect(gistId('https://example.com/someone/aa5a315d61ae9438b18d')).toBeNull();
    expect(gistId('not a gist')).toBeNull();
  });

  it('lists only .rrq files with GitHub raw links, then reads one', async () => {
    const raw = `https://gist.githubusercontent.com/someone/${ID}/raw/1/q.rrq`;
    const fetch = vi.fn((url: string) =>
      Promise.resolve(
        url === raw
          ? new Response('{"format":"rrq"}')
          : Response.json({
              files: {
                'q.rrq': { filename: 'q.rrq', size: 16, raw_url: raw },
                'notes.md': { filename: 'notes.md', size: 4, raw_url: raw },
                'bad.rrq': { filename: 'bad.rrq', size: 4, raw_url: 'https://evil.example/x' },
              },
            }),
      ),
    );
    vi.stubGlobal('fetch', fetch);
    const { files } = await gistProjects(ID);
    expect(files.map((f) => f.name)).toEqual(['q.rrq']);
    expect(await gistText(files[0]!)).toBe('{"format":"rrq"}');
    expect(fetch.mock.calls[0]![0]).toBe(`https://api.github.com/gists/${ID}`);
  });

  it('says what went wrong', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(new Response('', { status: 404 })));
    await expect(gistProjects(ID)).rejects.toThrow(/No gist found/);
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('offline')));
    await expect(gistProjects(ID)).rejects.toThrow(/Couldn't reach GitHub/);
  });
});
