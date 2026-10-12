// Opening and saving our files. Uses the File System Access API where available (named file types
// in the dialogs; project save overwrites the same file); elsewhere a file input and a download.

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

/** Names shown for our file types in the browser's file dialogs. */
export const FILE_TYPES = {
  rrq: 'RRQuilts project file',
  rrqbl: 'RRQuilts block file',
  rrqcc: 'RRQuilts color collection file',
  rrqlib: 'RRQuilts library file',
  rrqconf: 'RRQuilts settings file',
} as const;
export type FileExt = keyof typeof FILE_TYPES;

// Some platforms show only the description, so it carries the extension too.
const pickerType = (ext: FileExt): PickerType => ({
  description: `*.${ext} - ${FILE_TYPES[ext]}`,
  accept: { 'application/json': [`.${ext}`] },
});
/** Several types: all of them first (so every file shows), then each on its own, then JSON. */
const pickerTypes = (exts: FileExt[]): PickerType[] => [
  ...(exts.length > 1
    ? [
        {
          description: `All RRQuilts files here (${exts.map((e) => `*.${e}`).join(', ')})`,
          accept: { 'application/json': exts.map((e) => `.${e}`) },
        },
      ]
    : []),
  ...exts.map(pickerType),
  { description: '*.json - JSON', accept: { 'application/json': ['.json'] } },
];
const TYPES = pickerTypes(['rrq']);
/** Save dialogs add the extension themselves, so their labels are names only. */
const saveType = (ext: FileExt): PickerType => ({
  description: FILE_TYPES[ext],
  accept: { 'application/json': [`.${ext}`] },
});

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

/** Ask the user for one of our files (named types where the browser shows them). */
export async function pickFile(exts: FileExt[]): Promise<File | null> {
  if (supportsFileAccess()) {
    try {
      const [handle] = await window.showOpenFilePicker!({ types: pickerTypes(exts), id: exts[0]! });
      return handle ? await handle.getFile() : null;
    } catch (e) {
      if (isAbort(e)) return null;
      throw e;
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = [...exts.map((e) => `.${e}`), '.json'].join(',');
    input.onchange = () => resolve(input.files?.[0] ?? null);
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

/** Ask where to save a project. Null when the user cancels. */
export async function pickSaveHandle(name: string): Promise<FileSystemFileHandle | null> {
  try {
    return await window.showSaveFilePicker!({
      suggestedName: fileNameFor(name),
      types: [saveType('rrq')],
      id: 'rrq',
    });
  } catch (e) {
    if (isAbort(e)) return null;
    throw e;
  }
}

/** Export a file: a save dialog with the named type where supported, else a download. */
export async function exportFile(name: string, text: string, ext: FileExt) {
  if (!supportsFileAccess()) return download(name, text, ext);
  try {
    const handle = await window.showSaveFilePicker!({
      suggestedName: fileNameFor(name, ext),
      types: [saveType(ext)],
      id: ext,
    });
    await writeToHandle(handle, text);
  } catch (e) {
    if (!isAbort(e)) throw e;
  }
}

/** Fallback save: download a copy. */
export function download(name: string, text: string, ext = 'rrq') {
  // Not application/json: Android browsers append ".json" to the name for that type.
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileNameFor(name, ext);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
