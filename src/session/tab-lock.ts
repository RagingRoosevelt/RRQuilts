// Only one tab may edit a project. The editing tab holds Web Lock `rrq-edit:<projectId>`; locks
// are released automatically when a tab closes or crashes. "Continue here anyway" asks the holder
// to flush its draft, then steals the lock; the old holder is told and goes read-only.
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('rrq') : null;
const lockName = (id: string) => `rrq-edit:${id}`;
const supported = () => typeof navigator !== 'undefined' && !!navigator.locks;

export interface HeldLock {
  release(): void;
}

type Message = { type: 'flush' | 'flushed'; projectId: string };

/** Hold the lock; resolves null if another tab has it (unless `steal`). `onLost` fires if stolen. */
function hold(projectId: string, steal: boolean, onLost: () => void): Promise<HeldLock | null> {
  if (!supported()) return Promise.resolve({ release() {} });
  return new Promise((resolve) => {
    let release: (() => void) | undefined;
    navigator.locks
      .request(lockName(projectId), steal ? { steal: true } : { ifAvailable: true }, (lock) => {
        if (!lock) {
          resolve(null);
          return;
        }
        return new Promise<void>((done) => {
          release = done;
          resolve({ release: done });
        });
      })
      .catch(() => {
        // AbortError: another tab stole the lock.
        if (release) onLost();
      });
  });
}

export const acquireEditLock = (projectId: string, onLost: () => void) =>
  hold(projectId, false, onLost);

/** Ask the current holder to save its draft (≤ timeoutMs), then take the lock. */
export async function takeOverEditLock(
  projectId: string,
  onLost: () => void,
  timeoutMs = 2000,
): Promise<{ lock: HeldLock | null; holderAnswered: boolean }> {
  let holderAnswered = false;
  if (channel) {
    holderAnswered = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => done(false), timeoutMs);
      const listener = (e: MessageEvent<Message>) => {
        if (e.data.type === 'flushed' && e.data.projectId === projectId) done(true);
      };
      const done = (answered: boolean) => {
        clearTimeout(timer);
        channel.removeEventListener('message', listener);
        resolve(answered);
      };
      channel.addEventListener('message', listener);
      channel.postMessage({ type: 'flush', projectId } satisfies Message);
    });
  }
  return { lock: await hold(projectId, true, onLost), holderAnswered };
}

/** In the holding tab: answer flush requests for the project currently being edited. */
export function answerFlushRequests(
  currentProject: () => string | null,
  flush: () => Promise<void>,
) {
  const listener = async (e: MessageEvent<Message>) => {
    if (e.data.type !== 'flush' || e.data.projectId !== currentProject()) return;
    await flush();
    channel?.postMessage({ type: 'flushed', projectId: e.data.projectId } satisfies Message);
  };
  channel?.addEventListener('message', (e: MessageEvent<Message>) => void listener(e));
}

/** Projects currently held by some tab (to hide their drafts from the restore prompt). */
export async function lockedProjects(): Promise<Set<string>> {
  if (!supported()) return new Set();
  const { held = [] } = await navigator.locks.query();
  return new Set(
    held
      .map((l) => l.name ?? '')
      .filter((n) => n.startsWith('rrq-edit:'))
      .map((n) => n.slice(9)),
  );
}
