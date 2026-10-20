<template>
  <!-- Category choice: Uncategorized, My library's categories, a rule, then categories other
       libraries use (A–Z, subcategories indented), and New category…. -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="width: 380px; max-width: 95vw">
      <DialogClose />
      <q-card-section class="text-h6">{{ title }}</q-card-section>
      <q-list dense style="max-height: 60vh; overflow: auto">
        <template v-for="(it, i) in items" :key="i">
          <q-separator v-if="it.rule" spaced />
          <q-item-label v-else-if="it.header" header class="q-pb-xs">{{ it.label }}</q-item-label>
          <q-item v-else tag="label" clickable :style="{ paddingLeft: `${16 + it.depth * 20}px` }">
            <q-item-section side>
              <q-radio v-model="picked" :val="it.value" dense />
            </q-item-section>
            <q-item-section>{{ it.label }}</q-item-section>
          </q-item>
        </template>
      </q-list>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="onDialogCancel" />
        <q-btn flat no-caps color="primary" label="OK" @click="onDialogOK(picked)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogClose from './DialogClose.vue';
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';

export interface PickerItem {
  label: string;
  value: string;
  depth: number;
  rule?: boolean;
  header?: boolean;
}

const props = defineProps<{ title: string; items: PickerItem[]; current: string }>();
defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const picked = ref(props.current);
</script>
