import { defineStore } from 'pinia';
import { ref } from 'vue';

// ponytail: stub until the .rrq project model (spec 003) lands; only the route guard reads it.
export const useProjectStore = defineStore('project', () => {
  const isOpen = ref(false);
  return { isOpen };
});
