import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAutosave } from '@/session/autosave';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('draft autosave', () => {
  it('writes 15 s after the first change, and continued edits do not postpone it', async () => {
    const write = vi.fn(() => Promise.resolve());
    const a = createAutosave(write);
    a.changed();
    for (let i = 0; i < 14; i++) {
      await vi.advanceTimersByTimeAsync(1000);
      a.changed();
    }
    expect(write).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(write).toHaveBeenCalledOnce();
  });

  it('flush writes immediately only when there are changes', async () => {
    const write = vi.fn(() => Promise.resolve());
    const a = createAutosave(write);
    await a.flush();
    expect(write).not.toHaveBeenCalled();
    a.changed();
    await a.flush();
    expect(write).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(write).toHaveBeenCalledOnce(); // timer was cancelled by the flush
  });
});
