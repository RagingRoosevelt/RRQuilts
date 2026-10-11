<template>
  <q-dialog v-model="open">
    <q-card style="width: 380px; max-width: 95vw">
      <q-card-section class="q-gutter-sm">
        <div class="text-h6">Notecard</div>
        <q-input v-model="name" dense outlined label="Name" autofocus />
        <q-input v-model="notes" dense outlined type="textarea" autogrow label="Notes" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" @click="open = false" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          label="Save"
          :disable="!name.trim()"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{ save: [card: { name: string; notes: string }] }>();
const open = ref(false);
const name = ref('');
const notes = ref('');

function save() {
  open.value = false;
  emit('save', { name: name.value.trim(), notes: notes.value });
}
function show(card: { name: string; notes?: string | undefined }) {
  name.value = card.name;
  notes.value = card.notes ?? '';
  open.value = true;
}
defineExpose({ show });
</script>
