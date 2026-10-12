// Opening and saving .rrq files. Uses the File System Access API where available (save overwrites
// the same file); elsewhere falls back to a file input and a download.

interface PickerType {
  description: string;
  accept: Record<string, string[]>;
}
interface PickerOptions {
  suggestedName?: string;
  types?: PickerType[];
  id?: string;
}
declare global {
  interface Window {
    showOpenFilePicker?: (o?: PickerOptions) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (o?: PickerOptions) => Promise<FileSystemFileHandle>;
  }
  interface FileSystemHandle {
    queryPermission?: (d: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
    requestPermission?: (d: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
  }
}

const TYPES: PickerType[] = [
  { description: 'RRQuilts project', accept: { 'application/json': ['.rrq', '.json'] } },
];

export const supportsFileAccess = () =>
  typeof window.showOpenFilePicker === 'function' &&
  typeof window.showSaveFilePicker === 'function';

export const fileNameFor = (name: string, ext = 'rrq') =>
  `${name.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'Untitled'}.${ext}`;

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

export interface Picked {
  file: File;
  handle?: FileSystemFileHandle;
}

/** Ask the user for a project file. Null when they cancel. */
export async function pickProject(): Promise<Picked | null> {
  if (supportsFileAccess()) {
    try {
      const [handle] = await window.showOpenFilePicker!({ types: TYPES, id: 'rrq' });
      return handle ? { file: await handle.getFile(), handle } : null;
    } catch (e) {
      if (isAbort(e)) return null;
      throw e;
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rrq,.json';
    input.onchange = () => resolve(input.files?.[0] ? { file: input.files[0] } : null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** Make sure we may read/write a remembered handle (prompts the user if needed). */
export async function ensurePermission(handle: FileSystemFileHandle, mode: 'read' | 'readwrite') {
  if ((await handle.queryPermission?.({ mode })) === 'granted') return true;
  return (await handle.requestPermission?.({ mode })) === 'granted';
}

export async function writeToHandle(handle: FileSystemFileHandle, text: string) {
  const w = await handle.createWritable();
  await w.write(text);
  await w.close();
}

/** Save via a picker. Returns the chosen handle, or null when the user cancels. */
export async function saveWithPicker(
  name: string,
  text: string,
): Promise<FileSystemFileHandle | null> {
  try {
    const handle = await window.showSaveFilePicker!({
      suggestedName: fileNameFor(name),
      types: TYPES,
      id: 'rrq',
    });
    await writeToHandle(handle, text);
    return handle;
  } catch (e) {
    if (isAbort(e)) return null;
    throw e;
  }
}

/** Fallback save: download a copy. */
export function download(name: string, text: string, ext = 'rrq') {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileNameFor(name, ext);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
