// App updates (spec 054): the update dialog opens as soon as the browser finds a new version, while
// it downloads; Reload activates it (waiting for the download when pressed early). Fed by
// src-pwa/register-sw.ts. The new version's number and changelog come from its version.json.
import { reactive } from 'vue';
import { parseVersionInfo, type VersionInfo } from '@/model/changelog';

export type UpdatePhase =
  /** No new version. */
  | 'none'
  /** Found; the new worker is downloading the changed files. */
  | 'downloading'
  /** Downloaded; waiting for Reload. */
  | 'ready'
  /** The download failed; the browser tries again later. */
  | 'failed'
  /** Another tab reloaded into the new version: this one must reload too. */
  | 'elsewhere';

export const update = reactive<{
  phase: UpdatePhase;
  open: boolean;
  /** Reload pressed: reload as soon as the new version is ready. */
  reloading: boolean;
  info: VersionInfo | null;
  /** Dev only (`?update_demo=<version>`): the version to pretend is running. */
  from: string | null;
}>({ phase: 'none', open: false, reloading: false, info: null, from: null });

let registration: ServiceWorkerRegistration | null = null;
let reloadingHere = false;
let watched: ServiceWorker | null = null;
/** Action links waiting for the quilter's answer (Later). */
let waiters: (() => void)[] = [];

function show() {
  if (update.open) return;
  update.open = true;
  if (!update.info) void loadInfo();
}

async function loadInfo() {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' });
    if (r.ok) update.info = parseVersionInfo(await r.json());
  } catch {
    // Offline or missing: the dialog still opens, without the list.
  }
}

function watch(w: ServiceWorker | null) {
  if (!w || w === watched) return;
  watched = w;
  w.addEventListener('statechange', () => {
    if (w.state === 'redundant' && update.phase === 'downloading') {
      update.phase = 'failed';
      update.reloading = false;
    }
  });
}

/** The browser found a new version and started downloading it. */
export function found(reg: ServiceWorkerRegistration) {
  // First visit: the app is being installed, not updated. The dev demo ignores real updates.
  if (!navigator.serviceWorker.controller || update.from) return;
  registration = reg;
  watch(reg.installing);
  if (update.phase === 'none' || update.phase === 'failed') update.phase = 'downloading';
  show();
}

/** The new version is downloaded and waiting. */
export function ready(reg: ServiceWorkerRegistration) {
  if (update.from) return;
  registration = reg;
  if (update.phase !== 'elsewhere') update.phase = 'ready';
  if (update.reloading) activate();
  else show();
}

function activate() {
  const w = registration?.waiting;
  if (!w) return;
  reloadingHere = true;
  w.postMessage({ type: 'SKIP_WAITING' });
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  // A page with no worker at load gets one on first install (clients.claim): not an update.
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    // This tab asked for the new version: reload into it. Another tab did: this one is now served
    // by the new version but runs the old code, so it asks to reload.
    if (reloadingHere) window.location.reload();
    else if (update.phase !== 'none') {
      update.phase = 'elsewhere';
      update.reloading = false;
      update.open = true;
    }
  });
}

/** Reload into the new version, now or when its download finishes. Unsaved work is the caller's. */
export function reload() {
  if (update.from) return demoReload();
  if (update.phase === 'elsewhere') return window.location.reload();
  update.reloading = true;
  if (update.phase === 'ready') activate();
}

/** Later: close, and let waiting action links go ahead. */
export function later() {
  update.open = false;
  update.reloading = false;
  const w = waiters;
  waiters = [];
  w.forEach((f) => f());
}

/**
 * Before an action link (open a gist, add a library) is acted on: look for an update (up to 3 s).
 * With one, the dialog shows first and this waits for Later; Reload reloads the same URL, so the
 * new version acts on the link.
 */
export async function updateBeforeLink(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker?.controller) return;
  const reg = await navigator.serviceWorker.getRegistration().catch(() => undefined);
  if (!reg) return;
  await Promise.race([reg.update().catch(() => {}), new Promise((r) => setTimeout(r, 3000))]);
  if (reg.waiting) ready(reg);
  else if (reg.installing) found(reg);
  if (!update.open) return;
  await new Promise<void>((r) => waiters.push(r));
}

/** Dev demo: "reload into the new version" = the same URL without the demo flag. */
function demoReload() {
  update.reloading = true;
  const go = () => {
    const u = new URL(location.href);
    u.searchParams.delete('update_demo');
    u.searchParams.delete('phase');
    location.replace(u);
  };
  if (update.phase === 'downloading') setTimeout(go, 2000);
  else go();
}

// Dev only: `?update_demo=0.6.1[&phase=ready|failed|elsewhere]` opens the dialog as an update from
// 0.6.1 to this build (the dev server has no service worker).
if (import.meta.env.DEV && typeof location !== 'undefined') {
  const q = new URLSearchParams(location.search);
  const from = q.get('update_demo');
  if (from)
    void import('@/dev/update-demo').then((m) => {
      update.info = m.demoInfo();
      update.from = from;
      update.phase = (q.get('phase') as UpdatePhase | null) ?? 'downloading';
      update.open = true;
      // The fake download finishes after a moment.
      if (update.phase === 'downloading')
        setTimeout(() => update.phase === 'downloading' && (update.phase = 'ready'), 2000);
    });
}
