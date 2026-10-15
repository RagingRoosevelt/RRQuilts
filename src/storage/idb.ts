// Minimal promise wrapper over IndexedDB. Any failure (blocked storage, quota, private mode)
// surfaces as a rejected promise; callers degrade gracefully.
const DB = 'rrquilts';
const VERSION = 3;
export const STORES = ['drafts', 'recent', 'libraries', 'images'] as const;
export type StoreName = (typeof STORES)[number];

let opening: Promise<IDBDatabase> | undefined;

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error ?? new Error('IndexedDB request failed'));
  });
}

function open(): Promise<IDBDatabase> {
  opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open(DB, VERSION);
    r.onupgradeneeded = () => {
      for (const s of STORES)
        if (!r.result.objectStoreNames.contains(s))
          r.result.createObjectStore(s, { keyPath: 'id' });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error ?? new Error('IndexedDB unavailable'));
    r.onblocked = () => reject(new Error('IndexedDB blocked'));
  }).catch((e: unknown) => {
    opening = undefined; // allow a retry later
    throw e;
  });
  return opening;
}

async function store(name: StoreName, mode: IDBTransactionMode) {
  return (await open()).transaction(name, mode).objectStore(name);
}

export const idb = {
  get: async <T>(s: StoreName, key: string) =>
    request<T | undefined>((await store(s, 'readonly')).get(key)),
  getAll: async <T>(s: StoreName) => request<T[]>((await store(s, 'readonly')).getAll()),
  put: async <T>(s: StoreName, value: T) => {
    await request((await store(s, 'readwrite')).put(value));
  },
  delete: async (s: StoreName, key: string) => {
    await request((await store(s, 'readwrite')).delete(key));
  },
  keys: async (s: StoreName) =>
    (await request((await store(s, 'readonly')).getAllKeys())) as string[],
};

/** Test hook: forget the cached connection. */
export function resetIdb() {
  opening = undefined;
}
