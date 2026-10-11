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
    component: placeholder,
    props: { title: 'Project sketchbook' },
    meta: project,
  },
  {
    path: '/project/quilt/:id',
    component: placeholder,
    props: { title: 'Quilt editor' },
    meta: project,
  },
  {
    path: '/project/block/:id',
    component: placeholder,
    props: { title: 'Block editor' },
    meta: project,
  },
  {
    path: '/project/image/:id',
    component: placeholder,
    props: { title: 'Image editor' },
    meta: project,
  },
  { path: '/libraries', component: placeholder, props: { title: 'Libraries' } },
  { path: '/settings', component: () => import('@/pages/SettingsPage.vue') },
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
