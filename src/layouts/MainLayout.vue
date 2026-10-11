<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="text-inherit no-decoration">RRQuilts</router-link>
        </q-toolbar-title>
        <q-btn flat round icon="collections_bookmark" to="/libraries" aria-label="Libraries" />
        <q-btn flat round icon="settings" to="/settings" aria-label="Settings" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
