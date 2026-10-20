<template>
  <!-- Every $q.dialog / Dialog.create (boot/dialogs.ts): Quasar's quick dialog, plus an X that
       closes it. The X cancels, as Esc does; in a persistent dialog (Cancel is a real choice there)
       it closes without choosing. -->
  <q-dialog ref="dialogRef" :persistent="persistent" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <DialogClose @click="persistent ? dialogRef?.hide() : onDialogCancel()" />
      <q-card-section v-if="title" class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message">{{ message }}</q-card-section>
      <q-card-section v-if="prompt" class="scroll q-dialog-plugin__form">
        <q-input
          v-bind="formProps"
          v-model="model"
          dense
          autofocus
          color="primary"
          @keyup.enter="prompt.type !== 'textarea' && !okDisabled && onOk()"
        />
      </q-card-section>
      <template v-else-if="options">
        <q-separator />
        <q-card-section class="scroll q-dialog-plugin__form">
          <q-option-group
            v-bind="formProps"
            v-model="model"
            :options="options.items ?? []"
            color="primary"
          />
        </q-card-section>
        <q-separator />
      </template>
      <q-card-actions v-if="ok || cancel" align="right">
        <q-btn
          v-if="cancel"
          color="primary"
          :label="labelOf(cancel, 'Cancel')"
          flat
          v-bind="isObj(cancel) ? cancel : {}"
          @click="onDialogCancel"
        />
        <q-btn
          v-if="ok"
          color="primary"
          :label="labelOf(ok, 'OK')"
          flat
          v-bind="isObj(ok) ? ok : {}"
          :disable="okDisabled"
          :data-autofocus="!prompt && !options ? true : undefined"
          @click="onOk"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import { useDialogPluginComponent, type QOptionGroupProps } from 'quasar';
import DialogClose from './DialogClose.vue';

type Btn = string | boolean | Record<string, unknown>;
type Form = {
  model?: unknown;
  isValid?: (v: unknown) => boolean;
  items?: QOptionGroupProps['options'];
  type?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    prompt?: Form;
    options?: Form & { items: QOptionGroupProps['options'] };
    ok?: Btn;
    cancel?: Btn;
    persistent?: boolean;
  }>(),
  { ok: true, cancel: false },
);
defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const form = props.prompt ?? props.options;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a text, a choice or choices
const model = ref<any>(form?.model);
const formProps = computed<Record<string, unknown>>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { model: _m, isValid: _v, items: _i, ...rest } = form ?? {};
  return rest;
});
const okDisabled = computed(() => !!form?.isValid && !form.isValid(model.value));
const isObj = (b: Btn): b is Record<string, unknown> => typeof b === 'object';
const labelOf = (b: Btn, fallback: string) =>
  typeof b === 'string' ? b : isObj(b) && typeof b.label === 'string' ? b.label : fallback;
const onOk = () => onDialogOK(toRaw(model.value));
</script>
