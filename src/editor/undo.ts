// Undo history as Immer patch pairs: tiny steps that share unchanged data with the document.
import { applyPatches, enablePatches, type Patch } from 'immer';

enablePatches();

/** Editor state that goes with a step but isn't in the document (e.g. the next data numeral). */
export interface SessionRestore {
  undo: () => void;
  redo: () => void;
}

interface Step {
  patches: Patch[];
  inverse: Patch[];
  key: string | undefined;
  at: number;
  session?: SessionRestore | undefined;
}

export function createHistory(limit = 200, coalesceMs = 1000) {
  let past: Step[] = [];
  let future: Step[] = [];
  return {
    /** Record a change. Same `key` within `coalesceMs` merges into one step (drags, typing). */
    record(
      patches: Patch[],
      inverse: Patch[],
      key?: string,
      now = Date.now(),
      session?: SessionRestore,
    ) {
      const last = past.at(-1);
      if (key && last?.key === key && now - last.at < coalesceMs) {
        last.patches = [...last.patches, ...patches];
        last.inverse = [...inverse, ...last.inverse];
        last.at = now;
        // Merged: undo goes back to the first change's state, redo to the last one's.
        if (session) {
          const first = last.session;
          last.session = { undo: first?.undo ?? session.undo, redo: session.redo };
        }
      } else {
        past.push({ patches, inverse, key, at: now, session });
        if (past.length > limit) past = past.slice(-limit);
      }
      future = [];
    },
    undo<T>(doc: T): T | null {
      const step = past.pop();
      if (!step) return null;
      future.push(step);
      step.session?.undo();
      return applyPatches(doc as object, step.inverse) as T;
    },
    redo<T>(doc: T): T | null {
      const step = future.pop();
      if (!step) return null;
      past.push(step);
      step.session?.redo();
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
