import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    requiresProject?: boolean;
  }
}

const project = { requiresProject: true };
// ponytail: one placeholder page until each screen gets its own feature spec.
const placeholder = () => import('@/pages/PlaceholderPage.vue');

// Flat routes; MainLayout wraps them in App.vue. Paths are relative to the base path.
const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/pages/HomePage.vue') },
  {
    path: '/project',
    component: () => import('@/pages/SketchbookPage.vue'),
    meta: project,
  },
  {
    path: '/project/quilt/:id',
    component: () => import('@/pages/QuiltEditorPage.vue'),
    meta: project,
  },
  {
    path: '/project/block/:id',
    component: () => import('@/pages/BlockEditorPage.vue'),
    meta: project,
  },
  {
    path: '/project/image/:id',
    component: placeholder,
    props: { title: 'Image editor' },
    meta: project,
  },
  { path: '/libraries', component: () => import('@/pages/LibrariesPage.vue') },
  // Help (spec 013): /help/<section>[/<topic>]; /help opens Guides.
  { path: '/help', redirect: '/help/guides' },
  // Moved to the About tab.
  { path: '/help/resources/rrquilts-project', redirect: '/help/about/rrquilts-project' },
  {
    path: '/help/:section(guides|math|techniques|resources|about)/:topic?',
    component: () => import('@/pages/HelpPage.vue'),
  },
  // Settings is a fly-over (MainLayout); old links open it over Home.
  { path: '/settings', redirect: '/' },
  { path: '/:catchAll(.*)*', component: () => import('@/pages/NotFoundPage.vue') },
];

/** Project screens need an open project; otherwise go home with a notice. */
export function projectGuard(
  to: { meta: { requiresProject?: boolean } },
  projectOpen: boolean,
): true | RouteLocationRaw {
  return to.meta.requiresProject && !projectOpen
    ? { path: '/', query: { notice: 'open-project' } }
    : true;
}

export default routes;
