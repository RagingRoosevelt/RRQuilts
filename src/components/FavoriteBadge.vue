<template>
  <!-- Spec 029: a block or palette the quilter tagged Favorite. Top right of a block's picture, on a
       soft blurred spot like the card's checkbox; `inline` before a palette's name. -->
  <span class="fav" :class="{ small, inline }" role="img" aria-label="Favorite">
    ⭐
    <q-tooltip>Favorite</q-tooltip>
  </span>
</template>

<script setup lang="ts">
/** `small`: on the quilt sidebar's tiles. `inline`: in a line of text (a palette's name). */
defineProps<{ small?: boolean; inline?: boolean }>();
</script>

<style scoped>
.fav {
  position: absolute;
  top: -4px;
  right: -4px;
  z-index: 1;
  padding: 6px 8px;
  font-size: 16px;
  line-height: 1;
  border-radius: 50%;
  /* The spot blurs the block behind the star, fading out to its edge. */
  backdrop-filter: blur(3px);
  mask-image: radial-gradient(closest-side, #000 70%, transparent);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.6));
}
.fav.small {
  top: -2px;
  right: -2px;
  padding: 4px 5px;
  font-size: 11px;
}
.fav.inline {
  position: static;
  padding: 0 2px 0 0;
  font-size: 0.9em;
  backdrop-filter: none;
  mask-image: none;
  filter: none;
}
</style>
