<template>
  <!-- Add fabric images (spec 014 FR-020): several files, a folder, or a zip at once. -->
  <q-dialog v-model="open" persistent>
    <q-card style="width: 640px; max-width: 95vw">
      <q-card-section class="text-h6">Add fabric images</q-card-section>
      <q-card-section class="column q-pt-none" style="gap: 12px">
        <div class="row" style="gap: 8px">
          <q-btn outline no-caps icon="image" label="Pick images or a zip" @click="pick(false)" />
          <q-btn outline no-caps icon="folder_open" label="Pick a folder" @click="pick(true)" />
        </div>
        <template v-if="palettes">
          <q-select
            v-model="palette"
            :options="[...palettes.map((p) => ({ label: p.name, value: p.id })), NEW]"
            emit-value
            map-options
            outlined
            dense
            label="Palette"
          />
          <q-input
            v-if="palette === NEW.value"
            v-model="newName"
            outlined
            dense
            label="New palette name"
          />
        </template>
        <q-checkbox v-model="crop" label="Crop each image to a square from its center" />
        <q-input
          v-model.number="width"
          type="number"
          min="0"
          outlined
          dense
          clearable
          :suffix="units"
          label="Real width of each image"
          :hint="`Leave empty for ${units === 'cm' ? '20.3 cm' : '8 in'} (marked ≈ until you set it)`"
          style="max-width: 320px"
        />
        <q-list v-if="items.length" dense separator class="rounded-borders list">
          <q-item v-for="(it, i) in items" :key="it.preview">
            <q-item-section avatar>
              <img :src="it.preview" alt="" class="preview" />
            </q-item-section>
            <q-item-section>
              <q-input v-model="it.name" dense borderless aria-label="Fabric name" />
            </q-item-section>
            <q-item-section v-if="it.sku" side class="text-caption">{{ it.sku }}</q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="close" aria-label="Leave out" @click="drop(i)" />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-if="busy" class="column" style="gap: 4px">
          <div class="text-caption">Preparing images… {{ done }} of {{ items.length }}</div>
          <q-linear-progress :value="items.length ? done / items.length : 0" />
        </div>
        <div v-for="e in errors" :key="e" class="text-negative text-caption">{{ e }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="Cancel" :disable="busy" @click="close" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          :label="items.length ? `Add ${items.length} fabric${items.length > 1 ? 's' : ''}` : 'Add'"
          :disable="
            !items.length || busy || (palette === NEW.value && !!palettes && !newName.trim())
          "
          @click="finish"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fabricFrom, imageFiles, nameFromFile, processImage } from '@/editor/fabric-import';
import { itemId } from '@/model/identity';
import type { Fabric } from '@/model/schema/palette';
import type { Units } from '@/model/schema/project';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  units: Units;
  /** When given (My library), the user picks one of these palettes or names a new one. */
  palettes?: { id: string; name: string }[] | undefined;
}>();
const emit = defineEmits<{
  done: [fabrics: Fabric[], palette: { id: string } | { name: string } | undefined];
}>();

const NEW = { label: 'New palette…', value: '__new__' };
const app = useSettingsStore();
const open = ref(false);
const items = ref<{ name: string; sku?: string; file: string; blob: Blob; preview: string }[]>([]);
const crop = ref(true);
const width = ref<number | null>(null);
const palette = ref<string>(NEW.value);
const newName = ref('');
const busy = ref(false);
const done = ref(0);
const errors = ref<string[]>([]);

function show() {
  items.value = [];
  errors.value = [];
  palette.value = props.palettes?.[0]?.id ?? NEW.value;
  newName.value = '';
  open.value = true;
}
defineExpose({ show });

function pick(folder: boolean) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  if (folder) input.webkitdirectory = true;
  else input.accept = 'image/jpeg,image/png,image/webp,.zip';
  input.onchange = async () => {
    try {
      for (const f of await imageFiles([...(input.files ?? [])]))
        items.value.push({
          ...nameFromFile(f.name),
          file: f.name,
          blob: f.blob,
          preview: URL.createObjectURL(f.blob),
        });
    } catch (e) {
      errors.value.push(e instanceof Error ? e.message : String(e));
    }
  };
  input.click();
}

function drop(i: number) {
  URL.revokeObjectURL(items.value[i]!.preview);
  items.value.splice(i, 1);
}

function close() {
  for (const it of items.value) URL.revokeObjectURL(it.preview);
  open.value = false;
}

async function finish() {
  busy.value = true;
  done.value = 0;
  errors.value = [];
  const fabrics: Fabric[] = [];
  for (const it of items.value) {
    try {
      const p = await processImage(it.blob, it.file, { crop: crop.value });
      const w = width.value && width.value > 0 ? width.value : undefined;
      fabrics.push(
        await fabricFrom(p, {
          id: itemId(app.settings.author),
          name: it.name.trim() || p.name,
          units: props.units,
          ...(w ? { size: [w, Math.round(((w * p.height) / p.width) * 100) / 100] } : {}),
          ...(app.settings.author ? { author: app.settings.author } : {}),
        }),
      );
    } catch {
      errors.value.push(`${it.file}: couldn’t read this image, so it was left out.`);
    }
    done.value++;
  }
  busy.value = false;
  if (!fabrics.length) return;
  emit(
    'done',
    fabrics,
    props.palettes
      ? palette.value === NEW.value
        ? { name: newName.value.trim() }
        : { id: palette.value }
      : undefined,
  );
  if (!errors.value.length) close();
}
</script>

<style scoped>
.list {
  max-height: 40vh;
  overflow: auto;
  border: 1px solid rgba(128, 128, 128, 0.3);
}
.preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}
</style>
