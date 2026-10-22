<template>
  <!-- Settings, shown in the layout's fly-over (the header's gear toggles it). -->
  <div class="q-pa-md">
    <div class="q-gutter-lg">
      <h1 class="text-h5">Settings</h1>

      <q-banner v-if="!store.persisted" class="bg-warning text-dark" rounded>
        This browser isn't keeping settings (private mode or blocked storage). Export them to keep a
        copy.
      </q-banner>

      <q-list bordered separator class="rounded-borders">
        <q-expansion-item default-opened label="You" icon="person">
          <div class="q-pa-md">
            <SettingsCard label="Your name">
              <q-input
                v-model.trim="store.settings.author"
                outlined
                dense
                maxlength="100"
                placeholder="anonymous"
                :hint="`Shown in projects, blocks, and packs you share. Ids of items you create start with “${slug}.” (existing items keep theirs).`"
                @update:model-value="store.settings.authorAsked = true"
              />
            </SettingsCard>
            <SettingsCard label="Socials" class="q-mt-md">
              <div
                v-if="store.settings.socials.length && !editing.size"
                class="text-caption text-grey-7 credits-label"
              >
                In credits
              </div>
              <div
                v-for="(link, n) in store.settings.socials"
                :key="n"
                class="row items-center no-wrap q-mb-sm social"
                :class="{ over: dragOver === n }"
                style="gap: 8px"
                @dragover.prevent="dragOver = n"
                @dragleave="dragOver = null"
                @drop="drop(n)"
              >
                <q-icon
                  name="drag_indicator"
                  class="drag text-grey-6"
                  size="20px"
                  draggable="true"
                  aria-label="Drag to reorder"
                  @dragstart="dragFrom = n"
                  @dragend="dragFrom = dragOver = null"
                />
                <!-- Shown: icon · handle (linked to the profile); edited: type and handle fields. -->
                <template v-if="!editing.has(n)">
                  <q-radio
                    v-if="!editing.size"
                    :model-value="creditIndex"
                    :val="n"
                    dense
                    class="credit-radio"
                    :aria-label="`Show ${link.type} in printed credits`"
                    @update:model-value="setCredit"
                  />
                  <q-icon :name="socialIcon(link.type)" size="20px">
                    <q-tooltip>{{ link.type || 'No type' }}</q-tooltip>
                  </q-icon>
                  <span class="text-grey-6">•</span>
                  <a
                    v-if="socialLink(link)"
                    :href="socialLink(link)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="col ellipsis"
                    >{{ link.handle }}</a
                  >
                  <span v-else class="col ellipsis">{{ link.handle }}</span>
                  <q-btn flat round dense icon="edit" aria-label="Edit" @click="editing.add(n)" />
                </template>
                <template v-else>
                  <q-select
                    :model-value="link.type"
                    :options="SOCIAL_TYPES"
                    use-input
                    hide-selected
                    fill-input
                    new-value-mode="add-unique"
                    input-debounce="0"
                    outlined
                    dense
                    label="Type"
                    style="width: 210px"
                    @input-value="setType(n, $event)"
                    @update:model-value="setType(n, $event ?? '')"
                  >
                    <template #prepend>
                      <q-icon :name="socialIcon(link.type)" size="18px" />
                    </template>
                    <template #option="{ opt, itemProps }">
                      <q-item v-bind="itemProps" dense>
                        <q-item-section avatar style="min-width: 0; padding-right: 12px">
                          <q-icon :name="socialIcon(opt)" size="18px" />
                        </q-item-section>
                        <q-item-section>{{ opt }}</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-input
                    :model-value="link.handle"
                    outlined
                    dense
                    maxlength="500"
                    placeholder="Handle or link"
                    class="col"
                    @update:model-value="setHandle(n, $event)"
                    @keyup.enter="editing.delete(n)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="check"
                    aria-label="Done"
                    @click="editing.delete(n)"
                  />
                </template>
                <q-btn flat round dense icon="delete" aria-label="Remove" @click="remove(n)" />
              </div>
              <!-- While dragging: a roomy target to drop an entry at the end. -->
              <div
                v-if="dragFrom !== null"
                class="drop-end q-mb-sm"
                :class="{ over: dragOver === store.settings.socials.length }"
                @dragover.prevent="dragOver = store.settings.socials.length"
                @dragleave="dragOver = null"
                @drop="drop(store.settings.socials.length)"
              />
              <q-btn
                flat
                dense
                no-caps
                icon="add"
                label="Add a social"
                :disable="store.settings.socials.length >= 50"
                @click="addSocial"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                Saved with your name in projects and packs you share. A profile link for a known
                site becomes its handle; Website and your own types keep what you type.
              </div>
            </SettingsCard>
            <q-btn
              flat
              no-caps
              icon="waving_hand"
              label="Show the welcome again"
              class="q-mt-sm"
              @click="welcomeOpen = true"
            />
          </div>
        </q-expansion-item>
        <q-expansion-item default-opened label="Interface" icon="tune">
          <div class="q-pa-md column" style="gap: 16px">
            <SettingsCard label="Theme">
              <q-btn-toggle
                v-model="store.settings.theme"
                no-caps
                :options="[
                  { label: 'Auto', value: 'auto' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ]"
              />
              <div>
                <q-checkbox
                  v-model="store.settings.osAccent"
                  class="q-mt-sm"
                  label="Use the system accent color"
                >
                  <q-tooltip
                    >Where the browser shares it (Firefox, Safari); otherwise blue.</q-tooltip
                  >
                </q-checkbox>
              </div>
            </SettingsCard>

            <SettingsCard label="Units for new projects">
              <q-btn-toggle
                v-model="store.settings.units"
                no-caps
                :options="[
                  { label: 'Inches', value: 'in' },
                  { label: 'Centimeters', value: 'cm' },
                ]"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                An open project's units are in its Details tab.
              </div>
            </SettingsCard>
            <q-toggle v-model="store.settings.showHelp" label="Show help buttons" />
            <SettingsCard label="Editor layout">
              <q-btn-toggle
                v-model="store.settings.sidesSwapped"
                no-caps
                :options="[
                  { label: 'Toolbar left, sidebar right', value: false },
                  { label: 'Sidebar left, toolbar right', value: true },
                ]"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                The quilt and block editors; the Libraries filters follow the sidebar.
              </div>
            </SettingsCard>
          </div>
        </q-expansion-item>
        <q-expansion-item default-opened label="Project" icon="grid_view">
          <div class="q-pa-md column" style="gap: 4px">
            <q-checkbox
              v-model="store.settings.hideLibraryBlocks"
              label="Hide library blocks from projects"
            />
            <q-checkbox
              v-model="store.settings.hideLibraryPalettes"
              label="Hide library palettes from projects"
            />
            <div class="text-caption text-grey-7">
              The project's Blocks and Palettes tabs then leave out the libraries' lists. Blocks and
              palettes already in use stay available.
            </div>
            <q-checkbox
              v-model="store.settings.hideSyncedMine"
              label="Hide “My Library” blocks and palettes when they are synced with the project's"
            />
          </div>
        </q-expansion-item>
        <q-expansion-item default-opened label="Quilt and block design" icon="palette">
          <div class="q-pa-md">
            <q-toggle
              v-model="store.settings.recentColorsFirst"
              label="Sort colors and fabrics in palette by most recent use"
            />
            <!-- Spec 032: palettes shown in a sort of their own (a palette's menu › Sort by). -->
            <SettingsCard label="Sorted palettes" class="q-mt-md">
              <div v-if="!sorted.length" class="text-caption text-grey-8">
                None. A palette's menu has Sort by: hue, value, saturation or name, just for how it
                shows on this device.
              </div>
              <div
                v-for="p in sorted"
                :key="p.id"
                class="row items-center no-wrap"
                style="gap: 8px"
              >
                <div class="col ellipsis">
                  {{ p.name }} <span class="text-caption text-grey-7">· {{ p.where }}</span>
                </div>
                <span class="text-caption">{{ p.sort }}</span>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  label="Clear"
                  @click="sorting.setPref(p.id, undefined)"
                />
              </div>
            </SettingsCard>
            <SettingsCard label="Reference overlay" class="q-mt-md">
              <div class="text-caption text-grey-8 q-mb-sm">
                Where a target size starts in the new quilt wizard and the Layout tab.
              </div>
              <OverlaySettings />
            </SettingsCard>
          </div>
        </q-expansion-item>
        <q-expansion-item default-opened label="Fabrics" icon="attachment">
          <div class="q-pa-md column" style="gap: 16px">
            <SettingsCard label="Fabric images">
              <q-option-group
                v-model="store.settings.fabricImages"
                :options="[
                  { value: 'standins', label: 'Show them, with average colors while they load' },
                  { value: 'blank', label: 'Show them, blank while they load' },
                  { value: 'colors', label: 'Average colors only (never load images)' },
                ]"
              />
              <div class="text-caption q-mt-md q-mb-xs">Image size on screen</div>
              <q-btn-toggle
                v-model="store.settings.imageSize"
                no-caps
                unelevated
                toggle-color="primary"
                :options="[
                  { value: 256, label: 'Light (256 px)' },
                  { value: 512, label: 'Standard (512 px)' },
                ]"
              />
              <div class="text-caption q-mt-md q-mb-xs">Your fabric images in saved projects</div>
              <q-btn-toggle
                v-model="store.settings.saveSize"
                no-caps
                unelevated
                toggle-color="primary"
                :options="[
                  { value: 256, label: 'Smaller (256 px)' },
                  { value: 512, label: 'Standard (512 px)' },
                ]"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                Library fabrics are saved as references, not images.
              </div>
            </SettingsCard>
          </div>
        </q-expansion-item>
      </q-list>

      <div class="q-gutter-sm">
        <div class="text-subtitle1">Settings file (.rrqconf)</div>
        <q-btn outline no-caps icon="download" label="Export" @click="exportConf" />
        <q-btn outline no-caps icon="upload" label="Import" @click="importConf" />
      </div>

      <div class="text-caption text-grey-7">RRQuilts {{ version }} · build {{ build }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import OverlaySettings from '@/components/OverlaySettings.vue';
import SettingsCard from '@/components/SettingsCard.vue';
import { welcomeOpen } from '@/composables/settings-open';
import { computed, reactive, ref } from 'vue';
import { authorSlug } from '@/model/identity';
import { parseConf, toConf } from '@/settings/settings';
import { exportFile, pickFile } from '@/storage/files';
import { SOCIAL_TYPES, socialIcon, socialLink, toHandle } from '@/settings/socials';
import { useSettingsStore } from '@/stores/settings';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { usePaletteSort } from '@/composables/palette-sort';
import { SORT_KEYS } from '@/model/palette-sort';

const $q = useQuasar();
const store = useSettingsStore();
const sorting = usePaletteSort();
const library = useLibraryStore();
const project = useProjectStore();
/** Palettes with a sort, named where the app can see them (other projects' palettes can't be). */
const sorted = computed(() =>
  Object.entries(store.settings.paletteSorts).map(([id, pref]) => {
    const lib = library.allViews.find((v) => v.collections.some((c) => c.id === id));
    const own = project.doc?.project.palette.collections?.find((c) => c.id === id);
    const name =
      lib?.collections.find((c) => c.id === id)?.notecard.name ?? own?.notecard.name ?? 'A palette';
    const where = lib
      ? (lib.doc.library?.name ?? lib.doc.name)
      : own
        ? 'this project'
        : 'another project';
    const label = SORT_KEYS.find((k) => k.value === pref.key)?.label ?? pref.key;
    return { id, name, where, sort: pref.reverse ? `${label}, reversed` : label };
  }),
);
/** Drag to reorder (the handle at the left of each row); edits in progress follow their entry. */
const dragFrom = ref<number | null>(null);
const dragOver = ref<number | null>(null);
function drop(to: number) {
  const from = dragFrom.value;
  dragFrom.value = dragOver.value = null;
  if (from === null || from === to) return;
  const list = store.settings.socials;
  const order = list.map((_, i) => i);
  order.splice(to, 0, ...order.splice(from, 1));
  store.settings.socials = order.map((i) => list[i]!);
  const was = new Set(editing);
  editing.clear();
  order.forEach((i, at) => was.has(i) && editing.add(at));
}
/** Which social printed credits show: the flagged one, else the first. */
const creditIndex = computed(() =>
  Math.max(
    0,
    store.settings.socials.findIndex((s) => s.credit),
  ),
);
function setCredit(i: number) {
  store.settings.socials.forEach((s, j) => {
    if (j === i) s.credit = true;
    else delete s.credit;
  });
}
/** Entries being edited (by index); everything shows as a link when Settings opens. */
const editing = reactive(new Set<number>());
function addSocial() {
  store.settings.socials.push({ type: '', handle: '' });
  editing.add(store.settings.socials.length - 1);
}
function remove(i: number) {
  store.settings.socials.splice(i, 1);
  // Indices after the removed one shift down.
  const shifted = [...editing].filter((x) => x !== i).map((x) => (x > i ? x - 1 : x));
  editing.clear();
  shifted.forEach((x) => editing.add(x));
}
/** Typing a type that isn't suggested keeps it as typed; a handle re-reads for the new type. */
function setType(i: number, v: string) {
  const s = store.settings.socials[i]!;
  s.type = v.slice(0, 60);
  s.handle = toHandle(s.type, s.handle);
}
const setHandle = (i: number, v: string | number | null) => {
  const s = store.settings.socials[i]!;
  s.handle = toHandle(s.type, String(v ?? '')).slice(0, 500);
};
const slug = computed(() => authorSlug(store.settings.author));
const version = import.meta.env.APP_VERSION;
// The main bundle's hashed file name changes with every build (dev server shows "dev").
const mainScript = document.querySelector<HTMLScriptElement>(
  'script[type="module"][src*="/assets/index-"]',
);
const build = /index-([\w-]+)\.js$/.exec(mainScript?.src ?? '')?.[1] ?? 'dev';

function exportConf() {
  const doc = toConf(store.settings, import.meta.env.APP_VERSION);
  void exportFile('settings', JSON.stringify(doc, null, 2), 'rrqconf');
}

async function importConf() {
  const file = await pickFile(['rrqconf']);
  if (!file) return;
  const result = parseConf(await file.text());
  if (!result.ok) {
    $q.notify({ type: 'negative', message: result.error });
    return;
  }
  store.replace(result.settings);
  $q.notify({
    type: result.invalid.length ? 'warning' : 'positive',
    message: result.invalid.length
      ? `Settings imported; reset to defaults: ${result.invalid.join(', ')}`
      : 'Settings imported.',
  });
}
</script>

<style scoped>
.credit-radio {
  width: 28px;
  flex: none;
}
/* Above the radio column (after the drag handle). */
.credits-label {
  padding-left: 22px;
  margin-bottom: 2px;
}
.social .drag {
  cursor: grab;
  opacity: 0;
}
.social:hover .drag {
  opacity: 1;
}
/* No hover on touch screens: keep the handles visible. */
@media (hover: none) {
  .social .drag {
    opacity: 1;
  }
}
.drop-end {
  height: 44px;
  margin-top: -8px;
}
.drop-end.over,
.social.over {
  box-shadow: 0 -2px 0 var(--q-primary);
}
</style>
