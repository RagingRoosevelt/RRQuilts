// Draft autosave: the first change after a write schedules a write `delay` ms later; further
// changes don't postpone it (so continuous editing can't starve it). `flush` writes now.
export interface Autosave {
  changed(): void;
  flush(): Promise<void>;
  dispose(): void;
}

export function createAutosave(write: () => Promise<void>, delay = 15_000): Autosave {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending = false;
  const flush = async () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (!pending) return;
    pending = false;
    await write();
  };
  return {
    changed() {
      pending = true;
      timer ??= setTimeout(() => void flush(), delay);
    },
    flush,
    dispose() {
      if (timer) clearTimeout(timer);
      timer = undefined;
      pending = false;
    },
  };
}
