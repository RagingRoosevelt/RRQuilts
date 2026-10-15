<template>
  <!-- Add fabric images (spec 014 FR-020): several files, a folder, or a zip at once. -->
  <q-dialog v-model="open" persistent>
    <!-- Image files can be dropped anywhere on it. -->
    <q-card
      style="width: 640px; max-width: 95vw"
      :class="{ 'drop-target': dropping }"
      @dragover.prevent="dropping = true"
      @dragleave.self="dropping = false"
      @drop.prevent="onDrop"
    >
      <q-card-section class="text-h6">Add fabric images</q-card-section>
      <q-card-section class="column q-pt-none" style="gap: 12px">
        <div class="row" style="gap: 8px">
          <q-btn outline no-caps icon="image" label="Pick images or a zip" @click="pick(false)" />
          <q-btn outline no-caps icon="folder_open" label="Pick a folder" @click="pick(true)" />
        </div>
        <div class="text-caption text-grey-7">…or drop image files here.</div>
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
        <q-checkbox
          v-model="crop"
          label="Crop each image to a square (click an image to move the crop)"
        />
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
              <!-- The crop as it will be saved; click to change it. -->
              <button
                class="preview"
                :class="{ editing: editing === i }"
                :style="thumbStyle(it)"
                :aria-label="`Crop ${it.name}`"
                @click="editing = editing === i ? null : i"
              >
                <q-tooltip>Change the crop</q-tooltip>
              </button>
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
        <!-- Cropping one image: move the box, or drag a corner to resize it. -->
        <div
          v-if="editing !== null && items[editing]?.iw"
          class="column items-center"
          style="gap: 6px"
        >
          <div class="text-caption">
            Crop “{{ items[editing]!.name }}”: drag the box to move it, or a corner to resize it{{
              crop ? ' (it stays square)' : ''
            }}.
          </div>
          <CropBox
            v-model="items[editing]!.rect"
            :src="items[editing]!.preview"
            :width="items[editing]!.iw"
            :height="items[editing]!.ih"
            :square="crop"
            @update:model-value="items[editing]!.custom = true"
          />
          <div class="row" style="gap: 8px">
            <q-btn flat dense no-caps label="Reset" @click="resetCrop(items[editing]!)" />
            <q-btn flat dense no-caps color="primary" label="Done" @click="editing = null" />
          </div>
        </div>
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
import { ref, watch } from 'vue';
import CropBox, { type Rect } from '@/components/CropBox.vue';
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
type Item = {
  name: string;
  sku?: string;
  file: string;
  blob: Blob;
  preview: string;
  /** The image's size in pixels (0 until read). */
  iw: number;
  ih: number;
  /** The crop, in fractions of the image; `custom` once the user changed it. */
  rect: Rect;
  custom: boolean;
};
const items = ref<Item[]>([]);
const editing = ref<number | null>(null);
const dropping = ref(false);
/** The crop an image starts with: a centered square, or the whole image. */
function defaultRect(iw: number, ih: number, square: boolean): Rect {
  if (!square || !iw || !ih) return { x: 0, y: 0, w: 1, h: 1 };
  const s = Math.min(iw, ih);
  return { x: (iw - s) / 2 / iw, y: (ih - s) / 2 / ih, w: s / iw, h: s / ih };
}
function resetCrop(it: Item) {
  it.rect = defaultRect(it.iw, it.ih, crop.value);
  it.custom = false;
}
/** A thumbnail of the crop: the image scaled and shifted so the crop fills it. */
const thumbStyle = (it: Item) => ({
  backgroundImage: `url(${it.preview})`,
  backgroundSize: `${100 / it.rect.w}% ${100 / it.rect.h}%`,
  backgroundPosition: `${it.rect.w < 1 ? (it.rect.x / (1 - it.rect.w)) * 100 : 0}% ${
    it.rect.h < 1 ? (it.rect.y / (1 - it.rect.h)) * 100 : 0
  }%`,
});
function onDrop(e: DragEvent) {
  dropping.value = false;
  const files = [...(e.dataTransfer?.files ?? [])];
  if (files.length) void addFiles(files);
}
const crop = ref(true);
const width = ref<number | null>(null);
const palette = ref<string>(NEW.value);
const newName = ref('');
const busy = ref(false);
const done = ref(0);
const errors = ref<string[]>([]);

/** Open the dialog: empty, or with dropped `files` and the palette they're for. */
function show(opts: { files?: File[]; palette?: string } = {}) {
  items.value = [];
  editing.value = null;
  errors.value = [];
  palette.value = opts.palette ?? props.palettes?.[0]?.id ?? NEW.value;
  newName.value = '';
  open.value = true;
  if (opts.files?.length) void addFiles(opts.files);
}
defineExpose({ show });

function pick(folder: boolean) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  if (folder) input.webkitdirectory = true;
  else input.accept = 'image/jpeg,image/png,image/webp,.zip';
  input.onchange = () => void addFiles([...(input.files ?? [])]);
  input.click();
}

async function addFiles(files: File[]) {
  try {
    for (const f of await imageFiles(files)) {
      const it: Item = {
        ...nameFromFile(f.name),
        file: f.name,
        blob: f.blob,
        preview: URL.createObjectURL(f.blob),
        iw: 0,
        ih: 0,
        rect: { x: 0, y: 0, w: 1, h: 1 },
        custom: false,
      };
      items.value.push(it);
      // Its size, for the crop (read in the background).
      void createImageBitmap(f.blob)
        .then((b) => {
          const live = items.value.find((x) => x.preview === it.preview);
          if (live) {
            live.iw = b.width;
            live.ih = b.height;
            if (!live.custom) live.rect = defaultRect(b.width, b.height, crop.value);
          }
          b.close();
        })
        .catch(() => {});
    }
  } catch (e) {
    errors.value.push(e instanceof Error ? e.message : String(e));
  }
}

// The square setting: images keep following it until their crop is changed; changed crops become
// squares (inside the crop) when it's ticked.
watch(crop, (square) => {
  for (const it of items.value) {
    if (!it.custom) it.rect = defaultRect(it.iw, it.ih, square);
    else if (square && it.iw) {
      const side = Math.min(it.rect.w * it.iw, it.rect.h * it.ih);
      const cx = it.rect.x + it.rect.w / 2;
      const cy = it.rect.y + it.rect.h / 2;
      it.rect = {
        x: cx - side / it.iw / 2,
        y: cy - side / it.ih / 2,
        w: side / it.iw,
        h: side / it.ih,
      };
    }
  }
});

function drop(i: number) {
  if (editing.value === i) editing.value = null;
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
      const p = await processImage(it.blob, it.file, {
        crop: crop.value,
        ...(it.iw ? { rect: it.rect } : {}),
      });
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
.drop-target {
  outline: 2px dashed var(--q-primary);
  outline-offset: -6px;
}
.preview {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgba(128, 128, 128, 0.4);
  background-repeat: no-repeat;
  cursor: pointer;
  border-radius: 4px;
  display: block;
}
</style>
