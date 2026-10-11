import { produceWithPatches } from 'immer';
import { describe, expect, it } from 'vitest';
import { createHistory } from '@/editor/undo';

type Doc = { n: number; big: { data: string } };

function setup() {
  const h = createHistory(200, 1000);
  let doc: Doc = { n: 0, big: { data: 'x'.repeat(1000) } };
  const states = [doc];
  const change = (n: number, key?: string, at = 0) => {
    const [next, p, inv] = produceWithPatches(doc, (d) => void (d.n = n));
    h.record(p, inv, key, at);
    doc = next;
    states.push(doc);
  };
  return {
    h,
    change,
    get doc() {
      return doc;
    },
    set doc(d) {
      doc = d;
    },
    states,
  };
}

describe('undo history', () => {
  it('undoes and redoes 200 steps reproducing every state, sharing unchanged data', () => {
    const s = setup();
    for (let i = 1; i <= 200; i++) s.change(i);
    for (let i = 199; i >= 0; i--) {
      s.doc = s.h.undo(s.doc)!;
      expect(s.doc.n).toBe(i);
      expect(s.doc.big).toBe(s.states[0]!.big); // not copied
    }
    expect(s.h.canUndo).toBe(false);
    for (let i = 1; i <= 10; i++) s.doc = s.h.redo(s.doc)!;
    expect(s.doc.n).toBe(10);
  });

  it('coalesces same-key changes within the window into one step', () => {
    const s = setup();
    s.change(1, 'slider', 0);
    s.change(2, 'slider', 500);
    s.change(3, 'slider', 900);
    s.change(4, 'slider', 2500); // window passed → new step
    s.doc = s.h.undo(s.doc)!;
    expect(s.doc.n).toBe(3);
    s.doc = s.h.undo(s.doc)!;
    expect(s.doc.n).toBe(0);
  });

  it('a new change clears redo; the cap drops the oldest steps', () => {
    const h = createHistory(3);
    let doc = { n: 0 };
    const step = (n: number) => {
      const [next, p, inv] = produceWithPatches(doc, (d) => void (d.n = n));
      h.record(p, inv);
      doc = next;
    };
    [1, 2, 3, 4].forEach(step);
    doc = h.undo(doc)!;
    step(9);
    expect(h.canRedo).toBe(false);
    doc = h.undo(doc)!;
    doc = h.undo(doc)!;
    doc = h.undo(doc)!;
    expect(doc.n).toBe(1);
    expect(h.canUndo).toBe(false);
  });
});
