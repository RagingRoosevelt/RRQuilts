<template>
  <!-- A multi-pick filter dropdown with checkboxes; typing narrows its options. Empty = any.
       Chips show the picks while the list is closed. Options with a `group` get a labeled rule where the group changes; a `header` option is that
       rule, with a checkbox before its name that checks or clears the whole group. -->
  <q-select
    v-model="picked"
    :options="shown"
    :label="label"
    dense
    outlined
    multiple
    use-chips
    use-input
    input-debounce="0"
    emit-value
    map-options
    clearable
    :class="{ open }"
    @popup-show="open = true"
    @popup-hide="open = false"
    @clear="picked = []"
    @filter="(v: string, done: (fn: () => void) => void) => done(() => (needle = v.toLowerCase()))"
  >
    <template #option="{ itemProps, opt, selected, index }">
      <!-- A group's own option (picks all of it) is its rule, with the checkbox before its name. -->
      <q-item
        v-if="opt.header"
        clickable
        dense
        class="group-rule"
        :aria-label="`${opt.group}, all`"
        @click="toggleGroup(opt.group!)"
      >
        <q-checkbox :model-value="groupState(opt.group!)" dense class="no-pointer-events" />
        {{ opt.group }}
      </q-item>
      <div v-else-if="opt.group && opt.group !== shown[index - 1]?.group" class="group-rule">
        {{ opt.group }}
      </div>
      <q-item v-if="!opt.header" v-bind="itemProps" dense>
        <q-item-section side>
          <q-checkbox :model-value="selected" dense class="no-pointer-events" />
        </q-item-section>
        <q-item-section>{{ opt.label }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  label: string;
  options: { label: string; value: string; group?: string; header?: boolean }[];
}>();
const picked = defineModel<string[]>({ required: true });
const needle = ref('');
/** The list is showing (the checks there stand in for the chips). */
const open = ref(false);
const members = (group: string) =>
  props.options.filter((o) => o.group === group).map((o) => o.value);
const headers = computed(() => props.options.filter((o) => o.header));
/** A group's checkbox is its header option: checked only with the whole group. */
const groupState = (group: string) =>
  headers.value.some((h) => h.group === group && picked.value.includes(h.value));
function toggleGroup(group: string) {
  const all = members(group);
  const rest = picked.value.filter((v) => !all.includes(v));
  picked.value = groupState(group) ? rest : [...rest, ...all];
}
// Unchecking one of a group's options unchecks the group; checking its last one checks it.
watch(picked, (now) => {
  let next = now;
  for (const h of headers.value) {
    const rest = members(h.group!).filter((v) => v !== h.value);
    const whole = rest.every((v) => next.includes(v));
    if (next.includes(h.value) && !whole) next = next.filter((v) => v !== h.value);
    else if (!next.includes(h.value) && whole && rest.length) next = [...next, h.value];
  }
  if (next !== now) picked.value = next;
});
const shown = computed(() =>
  props.options.filter((o) => o.label.toLowerCase().includes(needle.value)),
);
</script>

<style scoped>
.open :deep(.q-chip) {
  display: none;
}
/* A rule with its group's name set into it. */
.group-rule {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 2px;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.75;
}
.group-rule::before,
.group-rule::after {
  content: '';
  border-top: 1px solid currentColor;
  opacity: 0.5;
}
.group-rule::before {
  width: 8px;
}
.group-rule::after {
  flex: 1;
}
.q-item.group-rule {
  min-height: 0;
  padding-right: 16px;
}
</style>
