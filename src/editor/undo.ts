// Undo history as Immer patch pairs: tiny steps that share unchanged data with the document.
import { applyPatches, enablePatches, type Patch } from 'immer';

enablePatches();

interface Step {
  patches: Patch[];
  inverse: Patch[];
  key: string | undefined;
  at: number;
}

export function createHistory(limit = 200, coalesceMs = 1000) {
  let past: Step[] = [];
  let future: Step[] = [];
  return {
    /** Record a change. Same `key` within `coalesceMs` merges into one step (drags, typing). */
    record(patches: Patch[], inverse: Patch[], key?: string, now = Date.now()) {
      const last = past.at(-1);
      if (key && last?.key === key && now - last.at < coalesceMs) {
        last.patches = [...last.patches, ...patches];
        last.inverse = [...inverse, ...last.inverse];
        last.at = now;
      } else {
        past.push({ patches, inverse, key, at: now });
        if (past.length > limit) past = past.slice(-limit);
      }
      future = [];
    },
    undo<T>(doc: T): T | null {
      const step = past.pop();
      if (!step) return null;
      future.push(step);
      return applyPatches(doc as object, step.inverse) as T;
    },
    redo<T>(doc: T): T | null {
      const step = future.pop();
      if (!step) return null;
      past.push(step);
      return applyPatches(doc as object, step.patches) as T;
    },
    clear() {
      past = [];
      future = [];
    },
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
  };
}
export type History = ReturnType<typeof createHistory>;
