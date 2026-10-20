<template>
  <!-- The X in a dialog's top right corner (every dialog has one). Without a click handler it just
       closes the dialog; dialogs whose closing means something pass their own. -->
  <q-btn
    v-close-popup="!$attrs.onClick"
    flat
    round
    dense
    size="sm"
    icon="close"
    aria-label="Close"
    class="dialog-close"
  />
</template>

<style>
.dialog-close {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
}
/* Titles keep clear of it. */
.q-card:has(> .dialog-close) > .q-card__section:first-of-type,
.q-card:has(> .dialog-close) > .q-card__section:nth-child(2) {
  padding-right: 40px;
}
</style>
