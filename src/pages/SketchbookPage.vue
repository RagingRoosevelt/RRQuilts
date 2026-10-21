<template>
  <q-page v-if="project.doc" padding>
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-input
        :model-value="project.doc.project.name"
        dense
        borderless
        input-class="text-h6"
        :readonly="project.readOnly"
        aria-label="Project name"
        @update:model-value="rename"
        @blur="(e: Event) => rename((e.target as HTMLInputElement).value.trim())"
      />
    </div>
    <div class="row items-center no-wrap">
      <q-tabs v-model="tab" dense no-caps align="left" class="col proj-tabs">
        <q-tab name="quilts" :label="`Quilts (${quilts.length})`" />
        <q-tab name="blocks" :label="`Blocks (${blocks.length})`" />
        <q-tab name="colors" :label="`Palettes (${ownPalettes.length + pickedPalettes.length})`" />
        <q-tab name="photos" label="Photos" />
        <q-tab name="threads" label="Threads" />
        <q-tab name="details" label="Details" />
      </q-tabs>
      <HelpLink
        :topic="tab === 'colors' ? 'guides/colors-and-palettes' : 'guides/sketchbook'"
        :label="tab === 'colors' ? 'Colors and palettes' : 'The project sketchbook'"
      />
      <template v-if="!project.readOnly">
        <q-btn
          flat
          dense
          icon="undo"
          aria-label="Undo"
          :disable="!project.canUndo"
          @click="project.undo()"
        >
          <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          icon="redo"
          aria-label="Redo"
          :disable="!project.canRedo"
          @click="project.redo()"
        >
          <q-tooltip>Redo (Ctrl+Shift+Z)</q-tooltip>
        </q-btn>
      </template>
    </div>
    <q-separator class="q-mb-md" />

    <div v-if="tab === 'quilts'" class="cards">
      <div v-if="!project.readOnly" class="stack">
        <button class="card add" @click="wizard?.show()">
          <q-icon name="add" size="md" />
          <div>New quilt</div>
        </button>
        <button class="card add" @click="importQuiltsFile">
          <q-icon name="upload_file" size="md" />
          <div>Import quilts<br /><span class="text-caption">from a project</span></div>
        </button>
      </div>
      <div
        v-for="(q, i) in quilts"
        :key="q.id"
        class="card"
        :draggable="!project.readOnly"
        @dragstart="dragFrom = i"
        @dragover.prevent
        @drop="drop('quilts', i)"
      >
        <div class="relative-position">
          <button class="thumb" @click="openQuilt(q.id)">
            <img
              :src="quiltThumbnail(project.doc, q, 240, $q.dark.isActive, true)"
              :alt="q.notecard.name"
            />
          </button>
          <QuiltColorways :quilt="q" :readonly="project.readOnly" />
        </div>
        <div class="row items-center no-wrap">
          <FullName class="col" :name="q.notecard.name" />
          <q-btn flat round dense icon="more_vert" aria-label="Actions">
            <q-menu>
              <q-list dense style="min-width: 180px">
                <q-item v-close-popup clickable @click="openQuilt(q.id)"
                  ><q-item-section>Open</q-item-section></q-item
                >
                <q-item v-close-popup clickable @click="saveQuiltImage(project.doc!, q)"
                  ><q-item-section>Save image</q-item-section></q-item
                >
                <q-item v-close-popup clickable @click="printQuilt(q.id)"
                  ><q-item-section>Print</q-item-section></q-item
                >
                <template v-if="!project.readOnly">
                  <q-item v-close-popup clickable @click="duplicate(q.id)"
                    ><q-item-section>Create copy</q-item-section></q-item
                  >
                  <q-item v-close-popup clickable @click="startSwapColorway(q)"
                    ><q-item-section>New colorway from palette swap…</q-item-section></q-item
                  >
                  <q-item v-close-popup clickable @click="quiltDetails(q.id)"
                    ><q-item-section>Details</q-item-section></q-item
                  >
                  <q-item
                    v-close-popup
                    clickable
                    :disable="i === 0"
                    @click="moveItem('quilts', i, -1)"
                    ><q-item-section>Move earlier</q-item-section></q-item
                  >
                  <q-item
                    v-close-popup
                    clickable
                    :disable="i === quilts.length - 1"
                    @click="moveItem('quilts', i, 1)"
                    ><q-item-section>Move later</q-item-section></q-item
                  >
                  <q-item v-close-popup clickable @click="deleteQuilt(q.id)"
                    ><q-item-section class="text-negative">Delete</q-item-section></q-item
                  >
                </template>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <template v-else-if="tab === 'blocks'">
      <div class="row no-wrap-md" style="gap: 16px">
        <!-- Filter sidebar, as on the Libraries page (no library management). Phones: flies over. -->
        <div
          v-if="sideOpen && $q.screen.lt.md"
          class="fly-backdrop"
          :style="{ '--fly-top': `${flyTop}px` }"
          aria-hidden="true"
          @click="sideOpen = false"
        />
        <aside
          v-show="sideOpen || $q.screen.gt.sm"
          class="filter-side column no-wrap"
          :class="{ left: settings.settings.sidesSwapped }"
          :style="{ gap: '8px', '--fly-top': `${flyTop}px` }"
        >
          <div v-if="$q.screen.lt.md" class="row justify-end">
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Close filters"
              @click="sideOpen = false"
            />
          </div>
          <q-input v-model="bf.search" dense outlined clearable placeholder="Search names, notes">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <FilterCard v-if="blockFilterFields.some((f) => f.options.length)" label="Metadata">
            <template v-for="f in blockFilterFields" :key="f.key">
              <FilterSelect
                v-if="f.options.length"
                v-model="bf[f.key]"
                :options="f.options"
                :label="f.label"
              />
            </template>
          </FilterCard>
          <FilterCard label="Shape">
            <BlockFilter
              v-model:layout="bf.layout"
              v-model:shape="bf.shape"
              style="display: contents"
            />
          </FilterCard>
          <!-- Read from each block's drawing (spec 029). -->
          <FilterCard label="Construction">
            <FilterSelect
              v-for="f in CONSTRUCTION_FILTERS"
              :key="f.key"
              v-model="bf[f.key]"
              :options="f.options"
              :label="f.label"
            />
          </FilterCard>
          <q-select
            v-model="groupBy"
            :options="GROUP_BY"
            emit-value
            map-options
            dense
            outlined
            label="Group library blocks by"
          />
          <!-- Contents: My blocks, then each library and its sections; click to jump. -->
          <FilterCard :label="tocLabel">
            <nav class="toc column" aria-label="Contents">
              <a href="#" class="toc-lib" @click.prevent="jumpTo('my-blocks')"
                >My blocks <span class="text-grey-6">{{ shownBlocks.length }}</span></a
              >
              <template v-if="!settings.settings.hideLibraryBlocks">
                <template v-for="g in libGroups" :key="g.lib">
                  <a href="#" class="toc-lib" @click.prevent="revealSection(g.lib)">{{
                    g.label
                  }}</a>
                  <a
                    v-for="sec in g.sections.filter((x) => x.label)"
                    :key="sec.key"
                    href="#"
                    class="toc-sec"
                    :class="{ sub: sec.parent }"
                    @click.prevent="revealSection(g.lib, sec)"
                    >{{ sec.label }} <span class="text-grey-6">{{ sec.count }}</span></a
                  >
                </template>
              </template>
            </nav>
          </FilterCard>
        </aside>
        <div class="col" style="min-width: 0">
          <div v-if="$q.screen.lt.md" class="row justify-end">
            <q-btn flat no-caps icon="filter_list" label="Filters" @click="toggleSide" />
          </div>
          <div id="my-blocks" class="text-subtitle2 q-mb-sm anchor">My blocks</div>
          <div class="cards">
            <div v-if="!project.readOnly" class="stack">
              <button class="card add" @click="newBlockDialog">
                <q-icon name="add" size="md" />
                <div>New block</div>
              </button>
              <button class="card add" @click="importBlocksFile">
                <q-icon name="upload_file" size="md" />
                <div>Import blocks<br /><span class="text-caption">.rrqbl or a project</span></div>
              </button>
            </div>
            <!-- Cards are built as they come into view (and then kept), not all at once. -->
            <q-intersection v-for="(b, i) in shownBlocks" :key="b.id" once class="card-slot">
              <div
                class="card"
                :draggable="!project.readOnly && !blockFiltering"
                @dragstart="dragFrom = i"
                @dragover.prevent
                @drop="drop('blocks', i)"
              >
                <div class="relative-position">
                  <button class="thumb" @click="openBlock(b.id)">
                    <img :src="thumb(b, 200, shownColoring(b))" :alt="b.notecard.name" />
                  </button>
                  <FavoriteBadge v-if="tagsOfBlock(b).includes(FAVORITE)" />
                  <ColoringCount
                    :block="b"
                    :colorings="projectColorings(b, library.lookup)?.own"
                    :model-value="shownColoring(b)"
                    :thumb="(id) => thumb(b, 64, id)"
                    @update:model-value="(id) => editor.coloringOf.set(b.id, id)"
                  />
                </div>
                <q-badge
                  v-if="b.colorVariant"
                  class="variant cursor-pointer"
                  color="secondary"
                  role="button"
                  @click="showOriginal(b)"
                >
                  <q-icon name="palette" size="14px" class="q-mr-xs" />Color variant
                  <q-tooltip>Your coloring of a library block — show the original</q-tooltip>
                </q-badge>
                <div class="row items-center no-wrap">
                  <FullName class="col" :name="b.notecard.name">
                    <q-icon v-if="inUse(b.id)" name="check_circle" color="primary" size="xs">
                      <q-tooltip>Placed in a quilt</q-tooltip>
                    </q-icon>
                    <q-icon
                      v-if="linkOf(b) === 'synced'"
                      name="collections_bookmark"
                      color="primary"
                      size="xs"
                    >
                      <q-tooltip>In {{ MY_LIBRARY }}</q-tooltip>
                    </q-icon>
                    <q-icon v-if="linkOf(b) === 'changed'" name="sync" color="warning" size="xs">
                      <q-tooltip>Changed since {{ MY_LIBRARY }} — Sync to my library</q-tooltip>
                    </q-icon>
                  </FullName>
                  <q-btn flat round dense icon="more_vert" aria-label="Actions">
                    <q-menu>
                      <q-list dense style="min-width: 160px">
                        <q-item
                          v-if="linkOf(b) === 'changed'"
                          v-close-popup
                          clickable
                          @click="syncToMine(b)"
                        >
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="sync" /></q-item-section
                          ><q-item-section>Sync to my library</q-item-section>
                        </q-item>
                        <q-item
                          v-else-if="!linkOf(b) || linkOf(b) === 'gone'"
                          v-close-popup
                          clickable
                          @click="addToMine(b)"
                        >
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="library_add" /></q-item-section
                          ><q-item-section>Add to my library…</q-item-section>
                        </q-item>
                        <template v-if="!project.readOnly">
                          <q-item
                            v-close-popup
                            clickable
                            :disable="b.kind !== 'seam'"
                            @click="editCopy(b.id)"
                          >
                            <q-item-section avatar class="menu-icon"
                              ><q-icon name="content_copy" /></q-item-section
                            ><q-item-section>Edit a copy</q-item-section>
                          </q-item>
                          <q-item v-close-popup clickable @click="startSwapColoring(b)">
                            <q-item-section avatar class="menu-icon"
                              ><q-icon name="palette" /></q-item-section
                            ><q-item-section>New coloring from palette swap…</q-item-section>
                          </q-item>
                        </template>
                        <q-item v-close-popup clickable @click="preview = b.id">
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="visibility"
                          /></q-item-section>
                          <q-item-section>Preview</q-item-section>
                        </q-item>
                        <q-item
                          v-close-popup
                          clickable
                          :disable="b.kind !== 'seam'"
                          @click="openInEditor(b)"
                        >
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="edit" /></q-item-section
                          ><q-item-section>Open in block editor</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="printBlock(b)">
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="print"
                          /></q-item-section>
                          <q-item-section>Print</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="blockDetails(b.id)">
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="info" /></q-item-section
                          ><q-item-section>Details</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="exportBlock(b)">
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="file_download"
                          /></q-item-section>
                          <q-item-section>Export (.rrqbl)</q-item-section>
                        </q-item>
                        <q-item
                          v-close-popup
                          clickable
                          @click="
                            saveBlockImage(project.doc!, b, shownColoring(b), library.items.colors)
                          "
                        >
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="image"
                          /></q-item-section>
                          <q-item-section>Save image</q-item-section>
                        </q-item>
                        <q-item
                          v-if="!project.readOnly"
                          v-close-popup
                          clickable
                          @click="tagBlock(b)"
                        >
                          <q-item-section avatar class="menu-icon"
                            ><q-icon name="sell"
                          /></q-item-section>
                          <q-item-section>Tags…</q-item-section>
                        </q-item>
                        <template v-if="!project.readOnly && !blockFiltering">
                          <q-item
                            v-close-popup
                            clickable
                            :disable="i === 0"
                            @click="moveItem('blocks', i, -1)"
                            ><q-item-section avatar class="menu-icon"
                              ><q-icon name="arrow_back" /></q-item-section
                            ><q-item-section>Move earlier</q-item-section></q-item
                          >
                          <q-item
                            v-close-popup
                            clickable
                            :disable="i === blocks.length - 1"
                            @click="moveItem('blocks', i, 1)"
                            ><q-item-section avatar class="menu-icon"
                              ><q-icon name="arrow_forward" /></q-item-section
                            ><q-item-section>Move later</q-item-section></q-item
                          >
                          <q-item v-close-popup clickable @click="deleteBlock(b.id)"
                            ><q-item-section avatar
                              ><q-icon name="delete" color="negative" /></q-item-section
                            ><q-item-section class="text-negative">Delete</q-item-section></q-item
                          >
                        </template>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
            </q-intersection>
          </div>

          <div v-if="settings.settings.hideLibraryBlocks" class="text-caption text-grey-7 q-mt-lg">
            Library blocks are turned off in Settings › Project.
          </div>
          <template v-else>
            <div class="text-subtitle2 q-mt-lg">Library blocks</div>
            <div class="text-caption text-grey-7">
              Select block availability when designing your quilts; your own blocks are always
              available.
            </div>
            <div class="text-caption q-mb-sm">
              {{ pickedCount }} of {{ shownLib.length }} selected
            </div>
            <template v-for="group in libGroups" :key="group.lib">
              <BlockSections :sections="group.sections" :lib="group.lib" :title="group.label">
                <template #actions="{ blocks: bs }">
                  <q-checkbox
                    v-if="!project.readOnly"
                    dense
                    size="sm"
                    :model-value="pickState(bs)"
                    :toggle-indeterminate="false"
                    :aria-label="pickState(bs) === true ? 'Deselect all' : 'Select all'"
                    @update:model-value="pickAll(bs, pickState(bs) !== true)"
                  >
                    <q-tooltip>{{
                      pickState(bs) === true ? 'Deselect all' : 'Select all'
                    }}</q-tooltip>
                  </q-checkbox>
                </template>
                <template #default="{ block: b }">
                  <!-- The id is on the place (always there) so "Show the original" can scroll to it. -->
                  <q-intersection :id="`lib-block-${b.id}`" once class="card-slot">
                    <div class="card" :class="{ picked: isPicked(b.id), flash: flashed === b.id }">
                      <q-checkbox
                        class="pick-box"
                        :model-value="isPicked(b.id)"
                        :disable="project.readOnly || inUse(b.id)"
                        :color="inUse(b.id) ? 'grey-8' : 'primary'"
                        :aria-label="`Use ${b.notecard.name} in this project`"
                        @update:model-value="(v: boolean) => pick(b.id, v)"
                      >
                        <q-tooltip>{{
                          inUse(b.id) ? 'Placed in a quilt' : 'Use in this project'
                        }}</q-tooltip>
                      </q-checkbox>
                      <div class="relative-position">
                        <button class="thumb" @click="preview = b.id">
                          <img :src="thumb(b, 200, shownColoring(b))" :alt="b.notecard.name" />
                        </button>
                        <FavoriteBadge v-if="tagsOfBlock(b).includes(FAVORITE)" />
                        <ColoringCount
                          :block="b"
                          :model-value="shownColoring(b)"
                          :thumb="(id) => thumb(b, 64, id)"
                          @update:model-value="(id) => editor.coloringOf.set(b.id, id)"
                        />
                      </div>
                      <div class="row items-center no-wrap">
                        <FullName class="col" :name="b.notecard.name">
                          <q-icon v-if="inUse(b.id)" name="check_circle" color="primary" size="xs">
                            <q-tooltip>Placed in a quilt</q-tooltip>
                          </q-icon>
                          <q-icon
                            v-if="otherVersions.has(b.id)"
                            name="update"
                            color="warning"
                            size="xs"
                          >
                            <q-tooltip
                              >Your library has revision
                              {{ otherVersions.get(b.id)!.library.revision }} — see Switch
                              version…</q-tooltip
                            >
                          </q-icon>
                        </FullName>
                        <q-btn flat round dense icon="more_vert" aria-label="Actions">
                          <q-menu>
                            <q-list dense style="min-width: 160px">
                              <q-item
                                v-if="!project.readOnly"
                                v-close-popup
                                clickable
                                :disable="b.kind !== 'seam'"
                                @click="editLibrary(b)"
                              >
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="content_copy"
                                /></q-item-section>
                                <q-item-section>Edit (make a copy)</q-item-section>
                              </q-item>
                              <q-item
                                v-if="!project.readOnly"
                                v-close-popup
                                clickable
                                :disable="b.kind !== 'seam'"
                                @click="colorVariant(b)"
                              >
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="palette"
                                /></q-item-section>
                                <q-item-section>Create a coloration variant</q-item-section>
                              </q-item>
                              <q-item
                                v-close-popup
                                clickable
                                @click="
                                  saveBlockImage(
                                    project.doc!,
                                    b,
                                    shownColoring(b),
                                    library.items.colors,
                                  )
                                "
                              >
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="image"
                                /></q-item-section>
                                <q-item-section>Save image</q-item-section>
                              </q-item>
                              <q-item v-close-popup clickable @click="tagBlock(b)">
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="sell"
                                /></q-item-section>
                                <q-item-section>Tags…</q-item-section>
                              </q-item>
                              <q-item
                                v-if="otherVersions.has(b.id) && !project.readOnly"
                                v-close-popup
                                clickable
                                @click="project.mismatches = [otherVersions.get(b.id)!]"
                              >
                                <q-item-section>Switch version…</q-item-section>
                              </q-item>
                              <q-item v-close-popup clickable @click="preview = b.id">
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="visibility"
                                /></q-item-section>
                                <q-item-section>Preview</q-item-section>
                              </q-item>
                              <q-item
                                v-close-popup
                                clickable
                                :disable="b.kind !== 'seam'"
                                @click="openInEditor(b)"
                              >
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="edit"
                                /></q-item-section>
                                <q-item-section>Open in block editor</q-item-section>
                              </q-item>
                              <q-item v-close-popup clickable @click="printBlock(b)">
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="print"
                                /></q-item-section>
                                <q-item-section>Print</q-item-section>
                              </q-item>
                              <q-item v-close-popup clickable @click="exportBlock(b)">
                                <q-item-section avatar class="menu-icon"
                                  ><q-icon name="file_download"
                                /></q-item-section>
                                <q-item-section>Export (.rrqbl)</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-btn>
                      </div>
                    </div>
                  </q-intersection>
                </template>
              </BlockSections>
            </template>
          </template>
        </div>
      </div>
    </template>

    <DetailsPanel v-else-if="tab === 'details'" kind="project" />

    <template v-else-if="tab === 'colors'">
      <div class="row no-wrap-md" style="gap: 16px">
        <!-- Palette filters (spec 035 F), as on the Libraries page's palettes. Phones: flies over. -->
        <div
          v-if="sideOpen && $q.screen.lt.md"
          class="fly-backdrop"
          :style="{ '--fly-top': `${flyTop}px` }"
          aria-hidden="true"
          @click="sideOpen = false"
        />
        <aside
          v-show="sideOpen || $q.screen.gt.sm"
          class="filter-side column no-wrap"
          :class="{ left: settings.settings.sidesSwapped }"
          :style="{ gap: '8px', '--fly-top': `${flyTop}px` }"
        >
          <div v-if="$q.screen.lt.md" class="row justify-end">
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Close filters"
              @click="sideOpen = false"
            />
          </div>
          <q-input v-model="pf.search" dense outlined clearable placeholder="Search palette names">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <FilterCard v-if="palTagOptions.length || palCatOptions.length" label="Metadata">
            <FilterSelect
              v-if="palCatOptions.length"
              v-model="pf.cats"
              :options="palCatOptions"
              label="Category"
            />
            <FilterSelect
              v-if="palTagOptions.length"
              v-model="pf.tags"
              :options="palTagOptions"
              label="Tags"
            />
          </FilterCard>
        </aside>
        <div class="col" style="min-width: 0">
          <div v-if="$q.screen.lt.md" class="row justify-end q-mb-sm">
            <q-btn flat no-caps icon="filter_list" label="Filters" @click="toggleSide" />
          </div>
          <div v-if="!project.readOnly" class="row items-center q-mb-sm" style="gap: 8px">
            <q-btn
              v-if="changedColors.length"
              outline
              dense
              no-caps
              color="warning"
              icon="sync"
              :label="`Sync to my library (${changedColors.length})`"
              @click="syncColors"
            />
            <q-btn
              flat
              dense
              no-caps
              icon="upload_file"
              label="Import palette (.rrqplt)"
              @click="importCollectionFile"
            />
          </div>
          <div class="text-subtitle2">Project palettes</div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Your own colors and fabric images, in palettes. Click one to see it large and to add,
            change or remove colors and fabrics. Drop image files on a palette to add them.
          </div>
          <q-btn
            v-if="!project.readOnly"
            outline
            dense
            no-caps
            icon="add"
            label="New palette"
            class="q-mb-sm self-start"
            @click="newProjectPalette"
          />
          <!-- A project palette looks and edits like a My library palette (Libraries page). -->
          <div class="column q-mb-lg" style="gap: 8px">
            <template v-for="(pp, i) in shownOwnPalettes" :key="pp.palette.id">
              <hr v-if="i" class="pal-hr" />
              <fieldset
                class="collection row items-center no-wrap"
                :class="{ 'drop-target': dropOn === pp.palette.id }"
                @dragover.prevent="dropOn = pp.palette.id"
                @dragleave="dropOn = null"
                @drop.prevent="dropImages($event, pp.palette.id)"
              >
                <legend class="ellipsis">
                  <FavoriteBadge
                    v-if="visibleTags(pp.palette.notecard.tags).includes(FAVORITE)"
                    inline
                  />
                  {{ pp.palette.notecard.name }}
                  <span class="text-caption text-grey-7"
                    >· {{ pp.colors.length + pp.fabrics.length }}</span
                  >
                  <!-- Synced with a My library palette: positive when they match, warning when not. -->
                  <q-icon
                    v-if="paletteLinks.get(pp.palette.id)"
                    name="sync"
                    size="xs"
                    :color="paletteLinks.get(pp.palette.id)!.inSync ? 'positive' : 'warning'"
                    class="q-ml-xs"
                  >
                    <q-tooltip>
                      {{
                        paletteLinks.get(pp.palette.id)!.inSync
                          ? `In sync with “${paletteLinks.get(pp.palette.id)!.collection.notecard.name}” in ${MY_LIBRARY}`
                          : `Differs from “${paletteLinks.get(pp.palette.id)!.collection.notecard.name}” in ${MY_LIBRARY}`
                      }}
                    </q-tooltip>
                  </q-icon>
                </legend>
                <button class="strip col" @click="openProjectPalette(pp.palette.id, 0)">
                  <span
                    v-if="!pp.colors.length && !pp.fabrics.length"
                    class="text-caption text-grey-7"
                  >
                    Empty: click to add colors or fabric images
                  </span>
                  <span
                    v-for="(s, k) in swatches(pp.palette.id, pp.colors, pp.fabrics)"
                    :key="s.item.id"
                    class="chip"
                    :style="
                      s.kind === 'color'
                        ? { background: `rgb(${s.item.rgb.join(',')})` }
                        : swatchStyle(s.item)
                    "
                    :title="s.item.notecard.name"
                    @click.stop="openProjectPalette(pp.palette.id, k)"
                  />
                </button>
                <!-- At the top, beside the first row of swatches, however many rows there are. -->
                <q-btn flat round dense class="self-start" icon="more_vert" aria-label="Actions">
                  <q-menu>
                    <q-list dense style="min-width: 190px">
                      <q-item v-close-popup clickable @click="openProjectPalette(pp.palette.id, 0)">
                        <q-item-section>{{
                          project.readOnly ? 'Preview' : 'Edit colors…'
                        }}</q-item-section>
                      </q-item>
                      <template v-if="!project.readOnly">
                        <q-item v-close-popup clickable @click="addImagesTo(pp.palette.id)">
                          <q-item-section>Add fabric images…</q-item-section>
                        </q-item>
                        <q-item
                          v-close-popup
                          clickable
                          @click="renameProjectPalette(pp.palette.id)"
                        >
                          <q-item-section>Rename…</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="tagProjectPalette(pp.palette)">
                          <q-item-section>Tags…</q-item-section>
                        </q-item>
                        <!-- Synced with My library: sync or unlink; otherwise save it there. -->
                        <template v-if="paletteLinks.get(pp.palette.id)">
                          <q-item
                            v-close-popup
                            clickable
                            :disable="paletteLinks.get(pp.palette.id)!.inSync"
                            @click="syncProjectPalette(pp)"
                          >
                            <q-item-section>Synchronize changes</q-item-section>
                          </q-item>
                          <q-item v-close-popup clickable @click="breakPaletteLink(pp)">
                            <q-item-section>Break sync link</q-item-section>
                          </q-item>
                        </template>
                        <q-item
                          v-else
                          v-close-popup
                          clickable
                          :disable="!pp.colors.length && !pp.fabrics.length"
                          @click="
                            saveColors = {
                              to: '',
                              name: pp.palette.notecard.name,
                              from: pp.palette.id,
                            }
                          "
                        >
                          <q-item-section>Save to my library…</q-item-section>
                        </q-item>
                      </template>
                      <PaletteSortMenu :id="pp.palette.id" />
                      <q-item
                        v-close-popup
                        clickable
                        :disable="!pp.colors.length"
                        @click="exportProjectPalette(pp)"
                      >
                        <q-item-section>Export (.rrqplt)</q-item-section>
                      </q-item>
                      <q-item
                        v-if="!project.readOnly"
                        v-close-popup
                        clickable
                        @click="deleteProjectPalette(pp)"
                      >
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </fieldset>
            </template>
            <div v-if="!ownPalettes.length" class="text-caption text-grey-7">
              No palettes of your own yet. Click New palette.
            </div>
          </div>
          <ColorEditor ref="colorEditor" @done="addProjectColor" />
          <FabricImportDialog
            ref="fabricImport"
            :units="project.doc!.units"
            :palettes="
              ownPalettes.map((x) => ({ id: x.palette.id, name: x.palette.notecard.name }))
            "
            :existing="(id?: string) => ownPalettes.find((x) => x.palette.id === id)?.fabrics ?? []"
            @done="fabricsAdded"
          />
          <div
            v-if="settings.settings.hideLibraryPalettes"
            class="text-caption text-grey-7 q-mt-lg"
          >
            Library palettes are turned off in Settings › Project.
          </div>
          <template v-else>
            <div class="text-subtitle2 q-mt-lg">Library palettes</div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Tick the palettes to use in this project's quilts; project palettes are always
              available.
            </div>
            <template v-for="v in shownPaletteLibs" :key="v.id">
              <!-- A fieldset, so the library's name sits in the top-left of its border. Packs of one
               library (spec 014) list together. -->
              <fieldset class="lib-box column q-mt-md q-mb-md" style="gap: 6px">
                <legend class="text-subtitle2">
                  <button
                    class="lib-toggle"
                    :aria-expanded="collapse.isOpen(`pal:${v.id}`)"
                    @click="collapse.toggle(`pal:${v.id}`)"
                  >
                    <q-icon
                      :name="collapse.isOpen(`pal:${v.id}`) ? 'expand_more' : 'chevron_right'"
                    />{{ v.name }}
                    <span v-if="!collapse.isOpen(`pal:${v.id}`)" class="text-caption text-grey-7">
                      · {{ v.collections.length }} palette{{
                        v.collections.length === 1 ? '' : 's'
                      }}
                    </span>
                  </button>
                </legend>
                <div
                  v-for="(c, ci) in collapse.isOpen(`pal:${v.id}`) ? v.collections : []"
                  :key="c.id"
                  class="row items-center no-wrap"
                  :class="{ 'lib-row-sep': ci > 0 }"
                >
                  <q-checkbox
                    dense
                    :model-value="!!project.doc.project.libraryPalettes?.includes(c.id)"
                    :disable="project.readOnly || lastSource(c.id)"
                    @update:model-value="(on: boolean) => pickPalette(c.id, on)"
                  />
                  <q-tooltip v-if="lastSource(c.id)">
                    The last palette stays picked until you have colors of your own
                  </q-tooltip>
                  <div class="q-px-sm" style="width: 160px">
                    <FavoriteBadge v-if="tagsOfPalette(c).includes(FAVORITE)" inline />
                    {{ c.notecard.name }}
                    <span class="text-caption text-grey-7"
                      >· {{ c.colors.length + (c.fabrics?.length ?? 0) }}</span
                    >
                  </div>
                  <div class="row col" style="gap: 3px">
                    <button
                      v-for="(s, k) in swatches(c.id, c.colors, c.fabrics)"
                      :key="s.item.id"
                      class="mini-swatch lib-swatch"
                      :style="
                        s.kind === 'color'
                          ? { background: `rgb(${s.item.rgb.join(',')})` }
                          : swatchStyle(s.item)
                      "
                      :title="s.item.notecard.name"
                      @click="showPalette(c, k)"
                    />
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="sell"
                    aria-label="Tags"
                    class="self-start"
                    @click="tagPalette(c)"
                  >
                    <q-tooltip>Tags… (⭐ Favorite)</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="sort"
                    aria-label="Sort"
                    class="self-start"
                  >
                    <q-tooltip>Sort its swatches</q-tooltip>
                    <q-menu
                      ><q-list dense><PaletteSortMenu :id="c.id" /></q-list
                    ></q-menu>
                  </q-btn>
                </div>
              </fieldset>
            </template>
          </template>
        </div>
      </div>
    </template>
    <div v-else class="text-grey-7">Coming in a later version.</div>

    <!-- Synchronizing when both sides changed: each difference, project's or library's. -->
    <q-dialog :model-value="!!merging" @update:model-value="merging = null">
      <q-card v-if="merging" style="width: 520px; max-width: 95vw">
        <DialogClose />
        <q-card-section>
          <div class="text-h6">Synchronize “{{ merging.pp.palette.notecard.name }}”</div>
          <div class="text-caption text-grey-7">
            These changed in both the project palette and its {{ MY_LIBRARY }} palette. Choose what
            to keep for each; other changes go the way they were made. Both end up the same.
          </div>
        </q-card-section>
        <q-card-section class="column q-pt-none" style="gap: 8px; max-height: 60vh; overflow: auto">
          <!-- Project's version | the choice | My library's version; choices line up. -->
          <div class="merge-grid">
            <div class="text-caption text-grey-7">This project</div>
            <div />
            <div class="text-caption text-grey-7">{{ MY_LIBRARY }}</div>
            <template v-for="c in merging.changes" :key="c.id">
              <div class="merge-side">
                <template v-if="c.project">
                  <span class="merge-swatch" :style="swatchOf(c.project)" />
                  <div class="merge-text">
                    {{ c.project.notecard.name }}
                    <div v-if="'rgb' in c.project" class="text-caption text-grey-7">
                      {{ hexOf(c.project) }}
                    </div>
                  </div>
                </template>
                <span v-else class="text-caption text-grey-7">Not there</span>
              </div>
              <q-btn-toggle
                :model-value="merging.choice.get(c.id)"
                dense
                unelevated
                toggle-color="primary"
                :options="[
                  { value: 'project', icon: 'west', attrs: { 'aria-label': 'Use the project’s' } },
                  { value: 'library', icon: 'east', attrs: { 'aria-label': 'Use the library’s' } },
                ]"
                @update:model-value="(v: 'project' | 'library') => merging!.choice.set(c.id, v)"
              />
              <div class="merge-side">
                <template v-if="c.library">
                  <span class="merge-swatch" :style="swatchOf(c.library)" />
                  <div class="merge-text">
                    {{ c.library.notecard.name }}
                    <div v-if="'rgb' in c.library" class="text-caption text-grey-7">
                      {{ hexOf(c.library) }}
                    </div>
                  </div>
                </template>
                <span v-else class="text-caption text-grey-7">Not there</span>
              </div>
            </template>
          </div>
          <div class="text-caption text-grey-7">The arrow points at the version that's kept.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn flat no-caps color="primary" label="Synchronize" @click="finishMerge" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- A palette's colors and fabrics, one large (as in Libraries). -->
    <q-dialog :model-value="!!shownPalette" @update:model-value="shownPalette = null">
      <q-card v-if="shownPalette && shownData" style="width: min(80vw, 512px); max-width: none">
        <DialogClose />
        <q-card-section class="row items-start no-wrap">
          <PaletteTitle
            class="col"
            :palette="shownData"
            :license="shownData.license ?? shownData.source?.license"
          />
        </q-card-section>
        <!-- A project palette is edited here, like a My library palette on the Libraries page. -->
        <PalettePreview
          v-model:at="shownPalette.at"
          :palette="shownData"
          :sort-id="shownPalette.project ?? shownData.id"
          :editable="!!shownPalette.project && !project.readOnly"
          images
          @add="newProjectColor(shownPalette.project)"
          @add-images="addImagesTo(shownPalette.project!)"
          @drop-files="(files) => fabricImport?.show({ files, palette: shownPalette!.project! })"
          @edit="(i) => editProjectColor(shownData!.colors[i]!)"
          @rename="renameShown"
          @remove="removeFromShown"
        />
      </q-card>
    </q-dialog>

    <q-dialog :model-value="!!preview" @update:model-value="preview = null">
      <q-card v-if="previewBlock" style="width: 560px; max-width: 95vw">
        <DialogClose />
        <q-card-section>
          <div class="text-h6">{{ previewBlock.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewBlock.size.map((n) => roundLen(n, project.doc!.units)).join(' × ') }}
            {{ project.doc.units }} · {{ patchCount(previewBlock) }} patches
            <template v-if="previewBlock.revision">
              ·
              <span class="revision"
                >revision {{ previewBlock.revision }}
                <q-tooltip>{{ previewBlock.id }}@{{ previewBlock.version ?? '—' }}</q-tooltip>
              </span>
            </template>
          </div>
        </q-card-section>
        <img
          :src="thumb(previewBlock, 560, previewColoring ?? previewSections[0]!.colorings[0]?.id)"
          style="width: 100%; display: block"
          alt=""
        />
        <template v-if="previewBlock.colorings.length > 1">
          <template v-for="sec in previewSections" :key="sec.label ?? ''">
            <div v-if="sec.label" class="text-subtitle2 q-px-md q-pt-sm">{{ sec.label }}</div>
            <div class="row q-px-md q-pt-sm" style="gap: 6px">
              <button
                v-for="k in sec.colorings"
                :key="k.id"
                class="skin"
                :class="{
                  active: (previewColoring ?? previewSections[0]!.colorings[0]?.id) === k.id,
                }"
                :title="k.name ?? `Coloring ${previewBlock.colorings.indexOf(k) + 1}`"
                @click="previewColoring = k.id"
              >
                <img :src="thumb(previewBlock, 64, k.id)" alt="" />
                <span class="skin-name">{{
                  k.name ?? `Coloring ${previewBlock.colorings.indexOf(k) + 1}`
                }}</span>
              </button>
            </div>
          </template>
        </template>
        <q-card-section class="column" style="gap: 4px">
          <div v-if="previewBlock.notecard.notes" style="white-space: pre-wrap">
            {{ previewBlock.notecard.notes }}
          </div>
          <div>
            <span class="text-grey-7">Author:</span> {{ authorOf(previewBlock) ?? 'anonymous' }}
          </div>
          <div>
            <span class="text-grey-7">License:</span>
            {{ licenseName(effectiveLicense(previewBlock, project.doc)) }}
          </div>
          <div v-if="priorCredits(previewBlock).length">
            <span class="text-grey-7">Based on:</span>
            {{
              priorCredits(previewBlock)
                .map((c) => `${c.name ?? 'earlier work'} by ${c.author ?? 'anonymous'}`)
                .join('; ')
            }}
          </div>
          <div v-else-if="isLibraryItem(previewBlock)" class="text-caption text-grey-7">
            {{ attribution(previewBlock) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-if="!isLibraryItem(previewBlock)"
            v-close-popup
            flat
            no-caps
            icon="info"
            label="Details"
            @click="blockDetails(previewBlock.id)"
          />
          <q-btn
            v-if="previewBlock.kind === 'seam'"
            v-close-popup
            flat
            no-caps
            color="primary"
            icon="edit"
            label="Open in block editor"
            @click="openInEditor(previewBlock)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog :model-value="!!picking" @update:model-value="picking = null">
      <q-card v-if="picking" style="width: 640px; max-width: 95vw">
        <DialogClose />
        <q-card-section>
          <div class="text-h6">
            Import {{ picking.kind }} from "{{ picking.from.project.name }}"
          </div>
          <div class="text-caption text-grey-7">
            {{
              picking.kind === 'blocks'
                ? 'Pick the blocks to add to My blocks.'
                : 'Pick the quilts to add to this project. The blocks, colors and fabrics they use come with them.'
            }}
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none picks">
          <button
            v-for="c in picking.choices"
            :key="c.id"
            class="pick"
            :class="{ active: picking.picked.includes(c.id) }"
            :disabled="c.here"
            @click="togglePick(c.id)"
          >
            <img :src="c.img()" alt="" />
            <q-checkbox
              :model-value="c.here || picking.picked.includes(c.id)"
              :disable="c.here"
              dense
              size="xs"
              :label="c.name"
              class="text-caption"
              @update:model-value="togglePick(c.id)"
              @click.stop
            />
            <div v-if="c.here" class="text-caption text-grey-7">Already here</div>
          </button>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            no-caps
            label="All"
            @click="picking.picked = picking.choices.filter((c) => !c.here).map((c) => c.id)"
          />
          <q-btn flat no-caps label="None" @click="picking.picked = []" />
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            color="primary"
            no-caps
            :label="`Import ${picking.picked.length}`"
            :disable="!picking.picked.length"
            @click="importPicked"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog :model-value="!!editingInUse" @update:model-value="editingInUse = null">
      <q-card v-if="editingInUse" style="width: 420px; max-width: 95vw">
        <DialogClose />
        <q-card-section class="text-h6">This block is in use</q-card-section>
        <q-card-section class="q-pt-none">
          Changes will update {{ editingInUse.quilts.length }} quilt{{
            editingInUse.quilts.length > 1 ? 's' : ''
          }}: {{ editingInUse.quilts.join(', ') }}. To leave them alone, use "Edit a copy".
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn flat no-caps label="Edit a copy" @click="chooseInUse('copy')" />
          <q-btn flat no-caps color="primary" label="Edit anyway" @click="chooseInUse('edit')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog :model-value="!!inUseDialog" @update:model-value="inUseDialog = null">
      <q-card v-if="inUseDialog" style="width: 420px; max-width: 95vw">
        <DialogClose />
        <q-card-section>
          <div class="text-h6">This block is placed in a quilt</div>
          <div v-for="w in inUseDialog.where" :key="w.quilt" class="q-mt-sm">
            <div class="text-weight-medium">{{ w.quilt }}</div>
            <div class="row q-mt-xs" style="gap: 4px">
              <q-badge
                v-for="(spot, i) in w.spots"
                :key="i"
                outline
                rounded
                color="primary"
                class="q-px-sm q-py-xs"
                :label="spot"
              />
            </div>
          </div>
          <div class="q-mt-sm text-grey-7">Deleting it empties those spaces (you can undo).</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps icon="search" label="Show me" @click="showPlacements" />
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            v-close-popup
            flat
            no-caps
            color="negative"
            label="Remove from quilts and delete"
            @click="inUseDialog!.remove()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Unpicking a palette whose colors are in use: swap them for colors that stay available. -->
    <q-dialog :model-value="!!unpicking" @update:model-value="unpicking = null">
      <q-card v-if="unpicking" style="width: 520px; max-width: 95vw">
        <DialogClose />
        <q-card-section>
          <template v-if="unpicking">
            <div class="text-h6">
              {{ unpicking.used.length }}
              {{
                unpicking.used.some((c) => c.fabric)
                  ? unpicking.used.length === 1
                    ? 'fabric'
                    : 'colors and fabrics'
                  : unpicking.used.length === 1
                    ? 'color'
                    : 'colors'
              }}
              in use
            </div>
            <div class="text-caption text-grey-7">
              {{ unpicking.title }} has colors used in this project's blocks and quilts. Choose what
              each one becomes; the nearest match is suggested.
            </div>
          </template>
        </q-card-section>
        <q-card-section v-if="!unpicking.options.length" class="text-negative">
          No other colors would be left. Pick another palette or add your own colors first.
        </q-card-section>
        <q-card-section v-else class="column q-pt-none" style="gap: 8px">
          <div
            v-for="c in unpicking.used"
            :key="c.id"
            class="row items-center no-wrap"
            style="gap: 8px"
          >
            <div class="mini-swatch big" :style="optStyle(c)" />
            <div class="ellipsis" style="width: 110px">{{ c.notecard.name }}</div>
            <q-icon name="arrow_forward" />
            <q-select
              v-model="unpicking.map[c.id]"
              :options="unpicking.options"
              option-value="id"
              :option-label="(o) => o.notecard.name"
              emit-value
              map-options
              dense
              outlined
              class="col"
            >
              <template #prepend>
                <div
                  class="mini-swatch"
                  :style="optStyle(unpicking.options.find((o) => o.id === unpicking!.map[c.id]))"
                />
              </template>
              <template #option="{ itemProps, opt }">
                <q-item v-bind="itemProps" dense>
                  <q-item-section side>
                    <div class="mini-swatch" :style="optStyle(opt)" />
                  </q-item-section>
                  <q-item-section>
                    {{ opt.notecard.name }}
                    <span class="text-caption text-grey-7">{{ opt.from }}</span>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </q-card-section>
        <q-card-section v-if="unpicking.options.length && affected.length" class="q-pt-none">
          <q-carousel
            v-model="previewQuilt"
            animated
            swipeable
            arrows
            :navigation="affected.length > 1"
            height="270px"
            control-color="primary"
            class="rounded-borders"
          >
            <q-carousel-slide
              v-for="q in affected"
              :key="q.key"
              :name="q.key"
              class="column no-wrap q-pt-sm"
              style="padding-bottom: 40px"
            >
              <div class="text-caption text-center ellipsis">
                {{ q.kind === 'quilt' ? 'Quilt' : 'Block' }}: {{ q.name }}
              </div>
              <div class="row no-wrap justify-center col" style="gap: 12px">
                <div v-for="side in ['Before', 'After']" :key="side" class="column items-center">
                  <img
                    :src="side === 'Before' ? beforeThumb(q) : afterThumb(q)"
                    style="width: 160px; height: 160px"
                    alt=""
                  />
                  <div class="text-caption">{{ side }}</div>
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            color="primary"
            :label="
              unpicking.packsOff
                ? 'Swap and turn off'
                : unpicking.palette || unpicking.color
                  ? 'Swap and remove'
                  : 'Swap and clear'
            "
            :disable="!unpicking.options.length"
            @click="finishUnpick"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <PaletteSwapDialog ref="swapDialog" />
    <NewBlockDialog ref="newBlockDlg" @create="createBlock" />

    <q-dialog :model-value="!!saveColors" @update:model-value="saveColors = null">
      <q-card v-if="saveColors" style="width: 380px; max-width: 95vw">
        <DialogClose />
        <q-card-section class="q-gutter-sm">
          <div class="text-h6">Save to my library</div>
          <div class="text-grey-7">
            {{ ownPalettes.find((x) => x.palette.id === saveColors!.from)?.colors.length ?? 0 }}
            color(s) and
            {{ ownPalettes.find((x) => x.palette.id === saveColors!.from)?.fabrics.length ?? 0 }}
            fabric image(s).
          </div>
          <q-select
            v-model="saveColors.to"
            :options="[
              { label: 'New palette', value: '' },
              ...myCollections.map((c) => ({ label: c.notecard.name, value: c.id })),
            ]"
            emit-value
            map-options
            label="Palette"
          />
          <q-input v-if="!saveColors.to" v-model="saveColors.name" autofocus label="Name" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            v-close-popup
            flat
            no-caps
            color="primary"
            label="Save"
            :disable="!saveColors.to && !saveColors.name.trim()"
            @click="void savePickedColors(saveColors!)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <QuiltWizard ref="wizard" :units="project.doc.units" @create="startQuilt" />
    <!-- Tags (and technique on the project's own blocks), spec 029 -->
    <KeepWhichDialog
      :items="keepWhich?.items ?? null"
      title="This quilt is already here"
      :labels="['Project', 'Both', 'Import']"
      @done="(c) => keepWhich?.done(c)"
      @cancel="stopKeepWhich"
    />
    <TagsDialog
      :target="tagging?.target ?? null"
      :vocabulary="tagVocabulary"
      @close="tagging = null"
      @save="saveTags"
    />
  </q-page>
</template>

<script setup lang="ts">
import DialogClose from '@/components/DialogClose.vue';
import QuiltColorways from '@/components/QuiltColorways.vue';
import FabricImportDialog from '@/components/FabricImportDialog.vue';
import PaletteSwapDialog from '@/components/PaletteSwapDialog.vue';
import NewBlockDialog from '@/components/NewBlockDialog.vue';
import type { BlockShape } from '@/model/blocks/shape';
import {
  fabricOpt,
  optStyle,
  useSwapOptions,
  type Drop,
  type Opt,
} from '@/composables/swap-options';
import { fillFor, paintOf } from '@/editor/paint';
import PalettePreview from '@/components/PalettePreview.vue';
import PaletteSortMenu from '@/components/PaletteSortMenu.vue';
import { usePaletteSort } from '@/composables/palette-sort';
import PaletteTitle from '@/components/PaletteTitle.vue';
import type { ColorCollection } from '@/model/schema/library';
import { swatchStyle } from '@/render/fabric-images';
import { useQuasar } from 'quasar';
import { computed, reactive, ref, toRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DetailsPanel from '@/components/DetailsPanel.vue';
import QuiltWizard from '@/components/QuiltWizard.vue';
import { useStartQuilt } from '@/composables/start-quilt';
import { allPatches } from '@/model/blocks/patches';
import { attribution, copyBlock, newBlock, saveColoringAs } from '@/editor/block-ops';
import { nearestColor } from '@/editor/color';
import { paintsUsed, quiltColors, quiltPaints, replaceColors } from '@/editor/colors';
import { fillKey } from '@/model/coloring';
import { addColorway, setSwap, shownColorway, swapper, colorwayList } from '@/model/colorways';
import type { Quilt } from '@/model/schema/quilt';
import { authorOf, effectiveLicense, licenseName, priorCredits } from '@/model/credits';
import { newId } from '@/model/ids';
import { variationName } from '@/model/new-quilt';
import { describeSlot } from '@/model/plain';
import type { Block } from '@/model/schema/block';
import { saveBlockImage, saveQuiltImage } from '@/render/save-image';
import { blockThumbnail, quiltThumbnail } from '@/render/thumbnail';
import { useEditorStore } from '@/stores/editor';
import { useProjectStore } from '@/stores/project';
import BlockSections from '@/components/BlockSections.vue';
import BlockFilter from '@/components/BlockFilter.vue';
import FilterSelect from '@/components/FilterSelect.vue';
import FilterCard from '@/components/FilterCard.vue';
import { blockFits, type ShapeFilter } from '@/render/layout-samples';
import { roundLen } from '@/model/units';
import ColorEditor from '@/components/ColorEditor.vue';
import { itemId } from '@/model/identity';
import ColoringCount from '@/components/ColoringCount.vue';
import FullName from '@/components/FullName.vue';
import HelpLink from '@/components/HelpLink.vue';
import { useLibraryStore } from '@/stores/library';
import { revealSection, useCollapsed } from '@/composables/block-sections';
import { socialsOut } from '@/settings/socials';
import { useSettingsStore } from '@/stores/settings';
import TagsDialog from '@/components/TagsDialog.vue';
import KeepWhichDialog, { type KeepChoice, type KeepItem } from '@/components/KeepWhichDialog.vue';
import FavoriteBadge from '@/components/FavoriteBadge.vue';
import { CONSTRUCTION_FILTERS, constructionMatches } from '@/model/blocks/construction';
import { techniqueOptions } from '@/model/schema/shared';
import {
  cleanTags,
  FAVORITE,
  INTERNAL_TAGS,
  sortTags,
  tagLabel,
  tagsFor,
  visibleTags,
  type TagTarget,
} from '@/model/tags';
import { useLibraryBlockActions } from '@/composables/library-block-actions';
import { useAuthor } from '@/composables/author';
import { useAskCategory } from '@/composables/category';
import {
  importBlock,
  importProjectBlocks,
  fabricIdsOf,
  parseBlockFile,
  projectBlockChoices,
  serializeBlock,
} from '@/model/block-file';
import { parseProject } from '@/model/io';
import type { RrqDoc } from '@/model/schema/project';
import { castDraft, produce, type Draft } from 'immer';
import {
  addPalette,
  deletePalette,
  fileInto,
  contentKey,
  linkPalette,
  paletteDiff,
  resolveSync,
  type PaletteChange,
  paletteLinks as linksOf,
  renamePalette,
} from '@/model/project-palettes';
import { collectionFile } from '@/model/collection-file';
import type { LibraryDoc } from '@/model/schema/library';
import { absorbFabrics, absorbImages, embedFabrics } from '@/storage/fabric-files';
import { importProjectQuilts } from '@/model/import-quilts';
import {
  fabricToUnits,
  isLibraryItem,
  splitItems,
  syncLibraryItems,
  versionMismatches,
  projectColorings,
  coloringSections,
} from '@/model/library-items';
import { exportFile, pickFile } from '@/storage/files';
import { importCollectionColors, parseCollectionFile } from '@/model/collection-file';
import {
  MY_LIBRARY,
  addBlock,
  addToCollection,
  colorChanged,
  blocksByLibrary,
  categoryFilter,
  notecardMatches,
  type GroupBy,
  linkState,
  saveCollection,
  addFabrics,
  syncCollectionFrom,
  syncBlock,
  syncColor,
  syncConflict,
} from '@/model/library';
import type { Color, Fabric, ProjectPalette } from '@/model/schema/palette';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const project = useProjectStore();
const editor = useEditorStore();
const startQuilt = useStartQuilt();
const library = useLibraryStore();
/** Library blocks whose project copy differs from the installed library version. */
const otherVersions = computed(
  () => new Map(versionMismatches(project.doc!, library.lookup).map((m) => [m.project.id, m])),
);
const settings = useSettingsStore();
const askAuthor = useAuthor();
const { editLibrary, colorVariant } = useLibraryBlockActions();
const { swatches, forget: forgetSorts } = usePaletteSort();
const inUseDialog = ref<{
  id: string;
  quilt: string;
  where: { quilt: string; spots: string[] }[];
  remove: () => void;
} | null>(null);
const tab = computed({
  get: () => settings.settings.projectTab,
  set: (v) => (settings.settings.projectTab = v),
});
const preview = ref<string | null>(null);
const dragFrom = ref<number | null>(null);
const wizard = ref<InstanceType<typeof QuiltWizard>>();

const quilts = computed(() => project.doc!.project.quilts);
const split = computed(() => {
  const own = project.doc!.project.blocks.filter((b) => !b.notecard.tags?.includes('system'));
  // My-library items this project has a linked copy of show once, as that copy in My blocks.
  const linked = new Set(
    own
      .filter(
        (b) =>
          settings.settings.hideSyncedMine &&
          b.source?.derived &&
          b.source.libraryId === library.mine?.id,
      )
      .map((b) => b.source!.itemId),
  );
  return splitItems(
    own,
    library.items.blocks.filter((b) => !linked.has(b.id)),
  );
});
const blocks = computed(() => split.value.mine);
const libBlocks = computed(() => split.value.library);
/** Block filters, as on the Libraries page: categories (with subcategories), tags, styles, words,
 *  and the layout / shape filter (spec 026). Own blocks take their library source's category. */
const bf = reactive({
  search: '',
  cats: [] as string[],
  tags: [] as string[],
  techniques: [] as string[],
  seams: [] as string[],
  difficulty: [] as string[],
  layout: null as string | null,
  shape: null as ShapeFilter | null,
});
const groupBy = ref<GroupBy>('category');
const GROUP_BY = [
  { label: 'Nothing', value: 'none' },
  { label: 'Category', value: 'category' },
  { label: 'Tags', value: 'tags' },
  { label: 'Technique', value: 'techniques' },
];
const libCats = computed(() => [
  ...new Map(library.views.flatMap((v) => v.doc.categories).map((c) => [c.id, c])).values(),
]);
const catOf = computed(() => {
  const m = new Map<string, string>();
  for (const v of library.views) for (const i of v.doc.items) m.set(i.data.id, i.category ?? '');
  return m;
});
const blockCat = (b: Block) => catOf.value.get(b.source?.itemId ?? b.id) ?? '';
const blockFiltering = computed(
  () =>
    !!bf.search ||
    !!bf.layout ||
    !!bf.shape ||
    [bf.cats, bf.tags, bf.techniques, bf.seams, bf.difficulty].some((f) => f.length),
);
const anyOf = (picked: string[], have: readonly string[]) =>
  !picked.length || picked.some((x) => have.includes(x));
/** The quilter's tags (spec 029): a library block's are kept in My library by its id; the
 *  project's own blocks carry theirs. */
const tagsOfBlock = (b: Block) =>
  isLibraryItem(b) ? tagsFor(b.notecard.tags, [b.id], library.kept) : visibleTags(b.notecard.tags);
const tagVocabulary = computed(() =>
  sortTags(
    cleanTags([
      ...library.tagVocabulary,
      ...blocks.value.flatMap((b) => visibleTags(b.notecard.tags)),
      ...ownPalettes.value.flatMap((x) => visibleTags(x.palette.notecard.tags)),
    ]),
    true,
  ),
);
const tagging = ref<{
  block?: Block;
  palette?: string;
  projectPalette?: string;
  target: TagTarget;
} | null>(null);
/** A project palette's tags are its own (spec 029, format v8). */
function tagProjectPalette(p: ProjectPalette) {
  tagging.value = {
    projectPalette: p.id,
    target: { name: p.notecard.name, tags: visibleTags(p.notecard.tags) },
  };
}
function tagBlock(b: Block) {
  tagging.value = { block: b, target: { name: b.notecard.name, tags: tagsOfBlock(b) } };
}
/** A library palette's tags (kept in My library, or its own if it's in My library). */
const tagsOfPalette = (c: ColorCollection) => tagsFor(c.notecard.tags, [c.id], library.kept);
function tagPalette(c: ColorCollection) {
  tagging.value = { palette: c.id, target: { name: c.notecard.name, tags: tagsOfPalette(c) } };
}
function saveTags(tags: string[]) {
  const { block: b, palette, projectPalette } = tagging.value!;
  tagging.value = null;
  if (palette) return void library.setTags(settings.settings.author, palette, tags);
  if (projectPalette)
    return project.change((d) => {
      const pp = d.project.palette.collections?.find((x) => x.id === projectPalette);
      if (!pp) return;
      const clean = cleanTags(tags);
      if (clean.length) pp.notecard.tags = clean;
      else delete pp.notecard.tags;
    });
  if (!b) return;
  if (isLibraryItem(b)) {
    // Tags a library block came with stay (they're its library's); the quilter's are kept.
    const theirs = new Set(visibleTags(b.notecard.tags));
    void library.setKeptTags(
      settings.settings.author,
      b.id,
      tags.filter((t) => !theirs.has(t)),
    );
    return;
  }
  project.change((d) => {
    const n = d.project.blocks.find((x) => x.id === b.id)?.notecard;
    if (!n) return;
    // Internal tags (the plain block's) stay as they are.
    const all = [...(n.tags ?? []).filter((t) => INTERNAL_TAGS.has(t)), ...tags];
    if (all.length) n.tags = all;
    else delete n.tags;
  });
}
function blockShown(b: Block) {
  return (
    blockFits(b.shape, bf.layout, bf.shape) &&
    anyOf(catFilter.value.ids(bf.cats), [blockCat(b)]) &&
    anyOf(bf.tags, tagsOfBlock(b)) &&
    anyOf(bf.techniques, b.notecard.techniques ?? []) &&
    // A library block is in inches; the project's own in the project's units.
    constructionMatches(b, bf, isLibraryItem(b) ? 'in' : (project.doc?.units ?? 'in')) &&
    notecardMatches(b.notecard, bf.search ?? '', tagsOfBlock(b))
  );
}
/** Phones: the filter sidebar flies over the page, just under the app's header. */
const sideOpen = ref(false);
const flyTop = ref(50);
function toggleSide() {
  flyTop.value = document.querySelector('.q-header')?.getBoundingClientRect().bottom ?? 50;
  sideOpen.value = !sideOpen.value;
}
const tocLabel = computed(() =>
  groupBy.value === 'none' ? 'Libraries' : GROUP_BY.find((g) => g.value === groupBy.value)!.label,
);
function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const shownBlocks = computed(() => blocks.value.filter(blockShown));
/** Category filter: every library's categories merged by name; only those the blocks use. */
const catFilter = computed(() =>
  categoryFilter(libCats.value, new Set([...blocks.value, ...libBlocks.value].map(blockCat))),
);
const blockFilterFields = computed(() => {
  const all = [...blocks.value, ...libBlocks.value];
  // Favorite first, always listed.
  const tagValues = sortTags(all.flatMap(tagsOfBlock), true).map((t) => ({
    label: tagLabel(t),
    value: t,
  }));
  // Spec 029: in its two sections (Techniques, Efficiency), only those the blocks use.
  const techniqueValues = techniqueOptions(
    new Set(all.flatMap((b) => b.notecard.techniques ?? [])),
  );
  const cats = catFilter.value.options;
  return [
    {
      key: 'cats' as const,
      label: 'Category',
      options: cats.some((o) => o.value) ? cats : [],
    },
    { key: 'tags' as const, label: 'Tags', options: tagValues },
    { key: 'techniques' as const, label: 'Technique', options: techniqueValues },
  ];
});
/** Library blocks the filters let through, and how many of them are picked. */
const shownLib = computed(() => libBlocks.value.filter(blockShown));
const pickedCount = computed(() => shownLib.value.filter((b) => isPicked(b.id)).length);
/** Library blocks per library, in category sections (blocks no installed library has: Other). */
const libGroups = computed(() => {
  const r = blocksByLibrary(library.views, shownLib.value, groupBy.value, tagsOfBlock);
  const out = r.groups.map((g) => ({ lib: g.id, label: g.label, sections: g.sections }));
  const other = r.other;
  return other.length
    ? [
        ...out,
        {
          lib: 'other',
          label: 'Other libraries',
          sections: [{ key: '', label: '', blocks: other, count: other.length }],
        },
      ]
    : out;
});
const fabricImport = ref<InstanceType<typeof FabricImportDialog>>();
/** Library boxes collapse from their title (remembered). */
const collapse = useCollapsed();
/** Library palettes by library: a library's packs (spec 014) together under its name. */
const paletteLibs = computed(() => {
  const out = new Map<string, { id: string; name: string; collections: ColorCollection[] }>();
  // My library palettes synced with one of the project's palettes show once, there.
  const linked = new Set([...paletteLinks.value.values()].map((l) => l.collection.id));
  const synced = (c: ColorCollection) => linked.has(c.id);
  for (const v0 of library.views) {
    const v =
      settings.settings.hideSyncedMine && v0.doc.kind === 'personal'
        ? { ...v0, collections: v0.collections.filter((c) => !synced(c)) }
        : v0;
    if (!v.collections.length) continue;
    const lib = v.doc.library ?? { id: v.doc.id, name: v.doc.name };
    const g = out.get(lib.id) ?? { id: lib.id, name: lib.name, collections: [] };
    g.collections.push(...v.collections);
    out.set(lib.id, g);
  }
  // A library's packs (one palette each) alphabetically; a single library keeps its order.
  for (const g of out.values())
    if (library.views.some((v) => v.doc.library?.id === g.id))
      g.collections.sort((a, b) => a.notecard.name.localeCompare(b.notecard.name));
  return [...out.values()];
});
// --- Palette filters (spec 035 F): search, Category, Tags; project palettes count as uncategorized.
const pf = reactive({ search: null as string | null, tags: [] as string[], cats: [] as string[] });
const ownPaletteTags = (pp: { palette: ProjectPalette }) => visibleTags(pp.palette.notecard.tags);
const palCatFilter = computed(() =>
  categoryFilter(
    libCats.value,
    new Set([
      ...paletteLibs.value.flatMap((g) => g.collections.map((c) => catOf.value.get(c.id) ?? '')),
      ...(ownPalettes.value.length ? [''] : []),
    ]),
  ),
);
const palCatOptions = computed(() =>
  palCatFilter.value.options.some((o) => o.value) ? palCatFilter.value.options : [],
);
const palTagOptions = computed(() =>
  sortTags(
    [
      ...ownPalettes.value.flatMap(ownPaletteTags),
      ...paletteLibs.value.flatMap((g) => g.collections.flatMap(tagsOfPalette)),
    ],
    true,
  ).map((t) => ({ label: tagLabel(t), value: t })),
);
const palMatches = (name: string, tags: string[], cat: string) =>
  (!pf.search || name.toLowerCase().includes(pf.search.toLowerCase())) &&
  anyOf(pf.tags, tags) &&
  anyOf(palCatFilter.value.ids(pf.cats), [cat]);
const shownOwnPalettes = computed(() =>
  ownPalettes.value.filter((pp) => palMatches(pp.palette.notecard.name, ownPaletteTags(pp), '')),
);
const shownPaletteLibs = computed(() =>
  paletteLibs.value
    .map((g) => ({
      ...g,
      collections: g.collections.filter((c) =>
        palMatches(c.notecard.name, tagsOfPalette(c), catOf.value.get(c.id) ?? ''),
      ),
    }))
    .filter((g) => g.collections.length),
);
/** The palette preview: a palette and which of its colors or fabrics is shown large. */
type Shown = Pick<
  ColorCollection,
  'id' | 'notecard' | 'colors' | 'fabrics' | 'author' | 'source' | 'license'
>;
/** `project`: one of the project's own palettes (editable, read from the project as it changes). */
const shownPalette = ref<{ palette?: Shown; project?: string; at: number } | null>(null);
const showPalette = (palette: Shown, at: number) => (shownPalette.value = { palette, at });
const shownData = computed((): Shown | undefined => {
  const sp = shownPalette.value;
  if (!sp?.project) return sp?.palette;
  const pp = ownPalettes.value.find((x) => x.palette.id === sp.project);
  return (
    pp && {
      id: pp.palette.id,
      notecard: pp.palette.notecard,
      colors: pp.colors,
      fabrics: pp.fabrics,
    }
  );
});

// --- The project's own palettes (format v3) ---
const { ownPalettes, pickedPalettes, remaining, paintOpt } = useSwapOptions();
/** Each project palette's synced My library palette, and whether they match. */
const paletteLinks = computed(() =>
  linksOf(
    project.doc!,
    (library.mine?.items ?? []).flatMap((i) => (i.type === 'colors' ? [i.data] : [])),
  ),
);
const openProjectPalette = (id: string, at: number) => (shownPalette.value = { project: id, at });
function newProjectPalette() {
  $q.dialog({
    title: 'New palette',
    prompt: { model: '', type: 'text', isValid: (v: string) => !!v.trim() },
    cancel: true,
  }).onOk((name: string) => {
    const id = itemId(settings.settings.author);
    project.change((d) => void addPalette(d, id, name.trim()));
  });
}
function renameProjectPalette(id: string) {
  const pp = ownPalettes.value.find((x) => x.palette.id === id);
  $q.dialog({
    title: 'Rename palette',
    prompt: {
      model: pp?.palette.notecard.name ?? '',
      type: 'text',
      isValid: (v: string) => !!v.trim(),
    },
    cancel: true,
  }).onOk((name: string) => project.change((d) => renamePalette(d, id, name.trim())));
}
/** Delete a palette with its colors and fabrics; any in use are swapped first (the swap dialog). */
function deleteProjectPalette(pp: (typeof ownPalettes.value)[number]) {
  confirmRemoval(
    [...pp.colors, ...pp.fabrics.map((f) => fabricOpt(f, ''))],
    { projectPalette: pp.palette.id },
    pp.palette.notecard.name,
  );
}
function exportProjectPalette(pp: (typeof ownPalettes.value)[number]) {
  const c = {
    id: pp.palette.id,
    notecard: pp.palette.notecard,
    colors: pp.colors,
    fabrics: pp.fabrics,
  } as ColorCollection;
  void embedFabrics(pp.fabrics, settings.settings.saveSize).then((fabrics) =>
    exportFile(
      pp.palette.notecard.name,
      JSON.stringify(collectionFile({ ...c, fabrics }, import.meta.env.APP_VERSION)),
      'rrqplt',
    ),
  );
}
/** Fabric images into a palette: picked in the dialog, or dropped on the palette. */
const addImagesTo = (id: string) => fabricImport.value?.show({ palette: id });
const dropOn = ref<string | null>(null);
function dropImages(e: DragEvent, id: string) {
  dropOn.value = null;
  const files = [...(e.dataTransfer?.files ?? [])];
  if (files.length) fabricImport.value?.show({ files, palette: id });
}
function fabricsAdded(fabrics: Fabric[], to?: { id: string } | { name: string }) {
  project.change((d) => {
    // One already here by id is a replacement ("Use the new one"): its image changes in place.
    const all = d.project.palette.fabrics;
    for (const f of fabrics) {
      const at = all.findIndex((x) => x.id === f.id);
      if (at >= 0) all[at] = f;
      else all.push(f);
    }
    const id =
      to && 'name' in to
        ? addPalette(d, itemId(settings.settings.author), to.name)
        : (to?.id ?? d.project.palette.collections?.[0]?.id);
    if (id)
      fileInto(
        d,
        id,
        [],
        fabrics.map((f) => f.id),
      );
  });
}
/** Rename the shown palette's color or fabric `i` (colors first), from the editor's name field. */
function renameShown(i: number, name: string) {
  const d = shownData.value!;
  const id = (d.colors[i] ?? d.fabrics?.[i - d.colors.length])?.id;
  project.change((doc) => {
    const x =
      doc.project.palette.colors.find((y) => y.id === id) ??
      doc.project.palette.fabrics.find((y) => y.id === id);
    if (x) x.notecard.name = name;
  });
}
/** Remove the shown palette's color or fabric `i` (colors first), swapping any uses first. */
function removeFromShown(i: number) {
  const d = shownData.value!;
  const c = d.colors[i];
  if (c) return deleteProjectColor(c);
  const f = d.fabrics?.[i - d.colors.length];
  if (f) confirmRemoval([fabricOpt(f, '')], { fabric: f.id }, f.notecard.name);
}
/** The swap dialog: colors in use that are going away, each mapped to one that stays. */
const unpicking = ref<{
  title: string;
  /** What is going away: a palette (its id), one project color, or (neither) all project colors. */
  palette?: string;
  color?: string;
  /** One of the project's own palettes going away (with its items), or one fabric. */
  projectPalette?: string;
  fabric?: string;
  /** Libraries' palettes going away, and the packs to switch off afterwards (Libraries page). */
  palettes?: string[];
  packsOff?: string[];
  used: (Color & { fabric?: Fabric })[];
  options: Opt[];
  map: Record<string, string>;
} | null>(null);
const ownColors = computed(() =>
  project.doc!.project.palette.colors.filter((c) => !isLibraryItem(c)),
);
/** The only picked palette while there are no colors of your own: it can't be unpicked. */
const lastSource = (id: string) =>
  !ownColors.value.length && pickedPalettes.value.length === 1 && pickedPalettes.value[0] === id;
/**
 * Removing colors: those the project's own blocks and quilts use and nothing remaining provides
 * get a dialog mapping each to the nearest remaining color; Cancel changes nothing.
 */
function confirmRemoval(
  going: (Color & { fabric?: Fabric })[],
  drop: Drop,
  title: string,
  packsOff?: string[],
) {
  const options = remaining(drop);
  const keep = new Set(options.map((o) => o.id));
  const inUse = paintsUsed(project.doc!);
  const used = going.filter((c) => inUse.has(c.id) && !keep.has(c.id));
  const map: Record<string, string> = {};
  for (const c of used) {
    const n = nearestColor(c.rgb, options);
    if (n) map[c.id] = n.id;
  }
  const u = {
    title,
    ...(drop.palette ? { palette: drop.palette } : {}),
    ...(drop.color ? { color: drop.color } : {}),
    ...(drop.palettes ? { palettes: drop.palettes } : {}),
    ...(drop.projectPalette ? { projectPalette: drop.projectPalette } : {}),
    ...(drop.fabric ? { fabric: drop.fabric } : {}),
    ...(packsOff ? { packsOff } : {}),
    used,
    options,
    map,
  };
  if (used.length) unpicking.value = u;
  else applyRemoval(u);
}
function pickPalette(id: string, on: boolean) {
  if (on) return setPalettePick(id, true);
  const c = library.views.flatMap((v) => v.collections).find((x) => x.id === id);
  confirmRemoval(c?.colors ?? [], { palette: id }, c?.notecard.name ?? 'This palette');
}
function deleteProjectColor(c: Color) {
  confirmRemoval([c], { color: c.id }, c.notecard.name);
}
const colorEditor = ref<InstanceType<typeof ColorEditor>>();
/** The project color the editor is changing (null: adding a new one). */
const editingColor = ref<string | null>(null);
function editProjectColor(c: Color) {
  editingColor.value = c.id;
  colorEditor.value?.show({ name: c.notecard.name, rgb: [...c.rgb] as [number, number, number] });
}
/** The palette a new color goes into. */
const colorTarget = ref<string | undefined>();
function newProjectColor(palette?: string) {
  editingColor.value = null;
  colorTarget.value = palette;
  colorEditor.value?.show();
}
function addProjectColor({ name, rgb }: { name: string; rgb: [number, number, number] }) {
  const id = editingColor.value;
  editingColor.value = null;
  project.change((d) => {
    const c = id && d.project.palette.colors.find((x) => x.id === id);
    if (c) {
      c.notecard.name = name;
      c.rgb = rgb;
    } else {
      const nid = itemId(settings.settings.author);
      d.project.palette.colors.push({ id: nid, notecard: { name }, rgb });
      if (colorTarget.value) fileInto(d, colorTarget.value, [nid]);
    }
  });
}
function finishUnpick() {
  const u = unpicking.value!;
  unpicking.value = null;
  applyRemoval(u);
}

// --- New coloring from palette swap: the swap dialog, mapping one coloring's colors ---
const swapDialog = ref<InstanceType<typeof PaletteSwapDialog>>();
/** The block with coloring `from` copied, swapped by `map` (and named for the palette). */
function swapped(b: Block, from: string, map: Record<string, string>, name?: string) {
  const { block, id } = saveColoringAs(b, from);
  const next = produce(block, (d) => {
    const k = d.colorings.find((c) => c.id === id)!;
    for (const [patch, f] of Object.entries(k.fills)) {
      const to = map[paintOf(f)!];
      if (to) k.fills[patch] = fillFor(to);
    }
    if (name) k.name = name;
  });
  return { block: next, id };
}
/** The quilt with a new colorway: the one shown, its colors as shown swapped by `map`. */
function swappedQuilt(q: Quilt, map: Record<string, string>, name?: string): Quilt {
  const shown = swapper(shownColorway(q));
  const id = newId();
  let next = addColorway(q, id, name, shownColorway(q));
  for (const p of quiltPaints(project.doc!, q)) {
    const from = fillFor(p);
    const now = paintOf(shown(from))!;
    if (map[now] && map[now] !== now) next = setSwap(next, id, fillKey(from), fillFor(map[now]));
  }
  return next;
}
function startSwapColorway(q: Quilt) {
  const shown = swapper(shownColorway(q));
  const now = new Set([...quiltPaints(project.doc!, q)].map((p) => paintOf(shown(fillFor(p)))!));
  const name = colorwayList(q).find((v) => v.id === shownColorway(q)?.id)?.name;
  swapDialog.value?.show({
    heading: 'New colorway from palette swap',
    title: `${q.notecard.name} (${name})`,
    okLabel: 'Add colorway',
    used: [...now].flatMap((p) => paintOpt(p) ?? []),
    before: quiltThumbnail(project.doc!, q, 500, $q.dark.isActive, true, true),
    preview: (map, n, doc) =>
      quiltThumbnail(doc, swappedQuilt(q, map, n), 500, $q.dark.isActive, true, true),
    done: (map, n) =>
      project.change((d) => {
        const i = d.project.quilts.findIndex((x) => x.id === q.id);
        if (i >= 0) d.project.quilts[i] = castDraft(swappedQuilt(q, map, n));
      }),
  });
}
function startSwapColoring(b: Block) {
  const coloring = b.colorings.find((c) => c.id === shownColoring(b)) ?? b.colorings[0]!;
  const ids = new Set(Object.values(coloring.fills).map((f) => paintOf(f)!));
  swapDialog.value?.show({
    heading: 'New coloring from palette swap',
    title: coloring.name ? `${b.notecard.name} (${coloring.name})` : b.notecard.name,
    okLabel: 'Add coloring',
    used: [...ids].flatMap((id) => paintOpt(id) ?? []),
    before: thumb(b, 500, coloring.id),
    preview: (map, name, doc) => {
      const s = swapped(b, coloring.id, map, name);
      return blockThumbnail(doc, s.block, 500, $q.dark.isActive, s.id, library.items.colors);
    },
    done: (map, name) => {
      const { block, id } = swapped(b, coloring.id, map, name);
      project.change((d) => {
        const i = d.project.blocks.findIndex((x) => x.id === block.id);
        if (i >= 0) d.project.blocks[i] = castDraft(block);
      });
      editor.coloringOf.set(block.id, id);
    },
  });
}
/** Recolor, then unpick the palette or clear My colors (inside a project.change recipe). */
function removal(d: Draft<RrqDoc>, u: NonNullable<typeof unpicking.value>) {
  replaceColors(d, new Map(Object.entries(u.map)));
  if (u.projectPalette) deletePalette(d, u.projectPalette);
  else if (u.fabric)
    d.project.palette.fabrics = d.project.palette.fabrics.filter((f) => f.id !== u.fabric);
  else if (u.palette || u.palettes) {
    const going = new Set([u.palette, ...(u.palettes ?? [])]);
    d.project.libraryPalettes = (d.project.libraryPalettes ?? []).filter((x) => !going.has(x));
    if (!d.project.libraryPalettes.length) delete d.project.libraryPalettes;
  } else
    d.project.palette.colors = d.project.palette.colors.filter((c) =>
      u.color ? c.id !== u.color : isLibraryItem(c),
    );
}
function applyRemoval(u: NonNullable<typeof unpicking.value>) {
  project.change((d) => removal(d, u));
  if (u.projectPalette) forgetSorts([u.projectPalette]);
  if (u.packsOff) {
    const off = new Set([...settings.settings.packsOff, ...u.packsOff]);
    settings.settings.packsOff = [...off];
  }
}
/**
 * Turning off libraries or packs from the Libraries page (`?turnOff=<ids>`) whose colors or fabrics
 * this project uses: swap them in the usual dialog, then they switch off.
 */
function startTurnOff(ids: string[]) {
  const views = library.allViews.filter((v) => ids.includes(v.doc.id));
  const cols = views.flatMap((v) => v.collections);
  const going = cols.flatMap((c) => [
    ...c.colors.map((x) => ({ ...x, from: '' })),
    ...(c.fabrics ?? []).map((f) => fabricOpt(f, '')),
  ]);
  const name = views[0]?.doc.library?.name ?? views[0]?.doc.name ?? 'This library';
  confirmRemoval(
    going,
    { palettes: cols.map((c) => c.id) },
    views.length === 1 ? views[0]!.doc.name : name,
    ids,
  );
}
/** The dialog's carousel: which quilt, and the project as it would be after the swap. */
const previewQuilt = ref('');
type Affected = {
  key: string;
  kind: 'quilt' | 'block';
  id: string;
  name: string;
  coloring?: string;
};
/** Quilts, then the project's own blocks (their first coloring using it), showing a color being swapped. */
const affected = computed((): Affected[] => {
  const going = new Set(unpicking.value?.used.map((c) => c.id) ?? []);
  const hits = (fills: Record<string, unknown>) =>
    Object.values(fills).some((f) => going.has((f as { color?: string }).color ?? ''));
  return [
    ...quilts.value
      .filter((q) => [...quiltColors(project.doc!, q)].some((id) => going.has(id)))
      .map((q) => ({ key: `q:${q.id}`, kind: 'quilt' as const, id: q.id, name: q.notecard.name })),
    ...blocks.value.flatMap((b) => {
      const k = b.colorings.find((c) => hits(c.fills));
      return k
        ? [
            {
              key: `b:${b.id}`,
              kind: 'block' as const,
              id: b.id,
              name: b.notecard.name,
              coloring: k.id,
            },
          ]
        : [];
    }),
  ];
});
watch(unpicking, () => {
  if (!affected.value.some((q) => q.key === previewQuilt.value))
    previewQuilt.value = affected.value[0]?.key ?? '';
});
const afterDoc = computed(() =>
  unpicking.value
    ? syncLibraryItems(
        produce(project.doc!, (d) => removal(d, unpicking.value!)),
        library.lookup,
      )
    : undefined,
);
function slideThumb(doc: RrqDoc, a: Affected, fresh: boolean) {
  // A fresh object for "after", so the thumbnail cache (per object) can't serve the "before" one.
  if (a.kind === 'quilt') {
    const q = doc.project.quilts.find((x) => x.id === a.id);
    return q ? quiltThumbnail(doc, fresh ? { ...q } : q, 160, $q.dark.isActive, true) : '';
  }
  const b = doc.project.blocks.find((x) => x.id === a.id);
  return b
    ? blockThumbnail(
        doc,
        fresh ? { ...b } : b,
        160,
        $q.dark.isActive,
        a.coloring,
        library.items.colors,
      )
    : '';
}
const beforeThumb = (a: Affected) => slideThumb(project.doc!, a, false);
const afterThumb = (a: Affected) => (afterDoc.value ? slideThumb(afterDoc.value, a, true) : '');
function setPalettePick(id: string, on: boolean) {
  project.change((d) => {
    const rest = (d.project.libraryPalettes ?? []).filter((x) => x !== id);
    const next = on ? [...rest, id] : rest;
    if (next.length) d.project.libraryPalettes = next;
    else delete d.project.libraryPalettes;
  });
}
/** Library blocks picked for the design tray; ones placed in a quilt always count. */
const isPicked = (id: string) => inUse(id) || !!project.doc!.project.libraryBlocks?.includes(id);
const pick = (id: string, on: boolean) => pickAll([{ id }], on);
/** A category's checkbox: all picked, none, or some (null). */
function pickState(bs: { id: string }[]) {
  const n = bs.filter((b) => isPicked(b.id)).length;
  return n === bs.length ? true : n ? null : false;
}
/** Pick or unpick blocks in one undo step (blocks placed in a quilt stay picked). */
function pickAll(bs: { id: string }[], on: boolean) {
  const ids = new Set(bs.map((b) => b.id));
  project.change((d) => {
    const rest = (d.project.libraryBlocks ?? []).filter((x) => !ids.has(x));
    const next = on ? [...rest, ...ids] : rest;
    if (next.length) d.project.libraryBlocks = next;
    else delete d.project.libraryBlocks;
  });
}
const previewBlock = computed(() =>
  [...blocks.value, ...libBlocks.value].find((b) => b.id === preview.value),
);
const previewSections = computed(() =>
  previewBlock.value
    ? coloringSections(previewBlock.value, library.lookup, 'Project colorings')
    : [],
);
const thumb = (b: Block, px: number, coloring?: string) =>
  blockThumbnail(project.doc!, b, px, $q.dark.isActive, coloring, library.items.colors);
/** The coloring a card shows: the one last chosen (its count badge or the block editor), else a color
 *  variant's first project coloring, else the block's first. */
function shownColoring(b: Block) {
  const chosen = editor.coloringOf.get(b.id);
  if (b.colorings.some((c) => c.id === chosen)) return chosen;
  return projectColorings(b, library.lookup)?.own[0]?.id;
}
/** The preview's coloring (undefined: the block's first); reset when the preview changes. */
const previewColoring = ref<string>();
watch(preview, () => (previewColoring.value = undefined));
const inUse = (id: string) => quiltsUsing(id).length > 0;
const patchCount = (b: Block) => allPatches(b).length;

function rename(value: string | number | null) {
  const name = String(value ?? '');
  if (name.trim()) project.change((d) => void (d.project.name = name), { coalesce: 'rename' });
}

function quiltsUsing(id: string) {
  return quilts.value.filter((q) =>
    [
      ...Object.values(q.layers[0].slots).map((s) => s.block),
      ...q.layers.flatMap((l) => l.items.map((i) => i.ref)),
    ].includes(id),
  );
}

/** Open the block editor; warn once when the block is used in quilts (edits update them). */
const warnedBlocks = new Set<string>();
function openBlock(id: string) {
  const b = blocks.value.find((x) => x.id === id);
  if (!b) return;
  if (b.kind !== 'seam') {
    preview.value = id;
    return;
  }
  const users = quiltsUsing(id);
  const go = () => {
    editor.blockMode = b.colorVariant ? 'color' : 'draw';
    void router.push(`/project/block/${id}`);
  };
  if (!users.length || warnedBlocks.has(id) || project.readOnly) return go();
  editingInUse.value = {
    id,
    quilts: users.map((q) => `"${q.notecard.name}"`),
    go: () => {
      warnedBlocks.add(id);
      go();
    },
  };
}
/** Opening a block quilts use: edit it anyway, edit a copy, or cancel. */
const editingInUse = ref<{ id: string; quilts: string[]; go: () => void } | null>(null);
function chooseInUse(how: 'copy' | 'edit') {
  const e = editingInUse.value!;
  editingInUse.value = null;
  if (how === 'copy') void editCopy(e.id);
  else e.go();
}

async function editCopy(id: string) {
  const b = blocks.value.find((x) => x.id === id);
  if (!b) return;
  const copy = produce(
    copyBlock(
      b,
      blocks.value.map((x) => x.notecard.name),
      await askAuthor(),
      project.doc!.project.license,
    ),
    (c) => void delete c.colorVariant, // a copy is a full block of your own
  );
  const at = project.doc!.project.blocks.indexOf(b) + 1;
  project.change((d) => void d.project.blocks.splice(at, 0, copy));
  editor.blockMode = 'draw';
  void router.push(`/project/block/${copy.id}`);
}

const newBlockDlg = ref<InstanceType<typeof NewBlockDialog>>();
function newBlockDialog() {
  newBlockDlg.value?.show(`Block ${blocks.value.length + 1}`, project.doc!.units);
}

async function createBlock(name: string, shape: BlockShape | undefined, size: [number, number]) {
  const b = newBlock(
    name,
    size,
    project.doc!.units,
    await askAuthor(),
    project.doc!.project.license,
    shape,
  );
  project.change((d) => void d.project.blocks.push(b));
  editor.blockMode = 'draw';
  editor.blockTool = 'line';
  void router.push(`/project/block/${b.id}`);
}

/** Scroll to a color variant's library block, opening the sections it's in. */
const flashed = ref<string>();
function showOriginal(v: Block) {
  const id = v.source?.itemId;
  if (settings.settings.hideLibraryBlocks) {
    $q.notify({ message: 'Library blocks are turned off in Settings › Project.' });
    return;
  }
  const g = libGroups.value.find((x) => x.sections.some((s) => s.blocks.some((b) => b.id === id)));
  const sec = g?.sections.find((s) => s.blocks.some((b) => b.id === id));
  if (!g || !sec) {
    $q.notify({ message: 'The original block is no longer in your libraries.' });
    return;
  }
  // Glow once the scroll stops, so it catches the eye (timer: already in view / no scrollend).
  let done = false;
  const glow = () => {
    if (done) return;
    done = true;
    document.removeEventListener('scrollend', glow, true);
    flashed.value = id;
    setTimeout(() => (flashed.value = undefined), 3600);
  };
  document.addEventListener('scrollend', glow, true);
  setTimeout(glow, 1000);
  void revealSection(g.lib, sec, `lib-block-${id}`);
}

/** Your own coloring of a library block, in My blocks: same drawing, locked. */
// --- My library (spec 011) ---
const linkOf = (b: Block) => linkState(library.mine ?? undefined, b, project.doc!.units);

const askCategoryFor = useAskCategory();
const askCategory = (kind: 'block' | 'colors') => askCategoryFor(`Add to ${MY_LIBRARY}`, '', kind);

/** Take the library links a My-library operation set on blocks/colors into the open project. */
function applyLinks(next: RrqDoc) {
  const blocks = new Map(next.project.blocks.map((b) => [b.id, b]));
  const colors = new Map(next.project.palette.colors.map((c) => [c.id, c]));
  project.change((d) => {
    for (const x of [...d.project.blocks, ...d.project.palette.colors]) {
      const n = blocks.get(x.id) ?? colors.get(x.id);
      if (!n?.source || n.source === x.source) continue;
      x.source = n.source;
      x.credits ??= [];
    }
  });
}

async function addToMine(b: Block) {
  const category = await askCategory('block');
  if (category === null) return;
  const r = await addBlock(library.ensureMine(await askAuthor()), project.doc!, b.id, category);
  await library.saveMine(r.lib);
  applyLinks(r.doc);
  $q.notify({ type: 'positive', message: `Added “${b.notecard.name}” to ${MY_LIBRARY}.` });
}

function syncToMine(b: Block) {
  const lib = library.mine!;
  const go = async (asNew = false) => {
    const r = asNew
      ? await addBlock(lib, project.doc!, b.id)
      : await syncBlock(lib, project.doc!, b.id);
    await library.saveMine(r.lib);
    applyLinks(r.doc);
    $q.notify({ type: 'positive', message: `Synced “${b.notecard.name}” to ${MY_LIBRARY}.` });
  };
  if (!syncConflict(lib, b)) return void go();
  // Keeping both needs a different id (a copy made with Edit has one).
  const canKeepBoth = b.source?.itemId !== b.id;
  $q.dialog({
    title: `${MY_LIBRARY} has a newer version`,
    message: `“${b.notecard.name}” was synced from another project after this copy was made. Replace that version with this one?`,
    cancel: canKeepBoth
      ? { label: 'Keep both', flat: true, noCaps: true }
      : { label: 'Cancel', flat: true, noCaps: true },
    ok: { label: 'Replace', flat: true, noCaps: true },
    persistent: true,
  })
    .onOk(() => void go())
    .onCancel(() => canKeepBoth && void go(true));
}

// Colors: pick own colors, save them as a collection or add them to one; sync changed ones.

const myCollections = computed(
  () => library.views.find((v) => v.doc.kind === 'personal')?.collections ?? [],
);
const changedColors = computed(() =>
  project
    .doc!.project.palette.colors.filter((c: Color) => colorChanged(library.mine ?? undefined, c))
    .map((c) => c.id),
);

const saveColors = ref<{ to: string; name: string; from: string } | null>(null);
async function savePickedColors({ to, name, from }: { to: string; name: string; from: string }) {
  // A project palette's colors and fabric images (library sizes are in inches).
  const pp = ownPalettes.value.find((x) => x.palette.id === from);
  const picked = pp?.colors.map((c) => c.id) ?? [];
  const k = project.doc!.units === 'cm' ? 1 / 2.54 : 1;
  const fabrics = (pp?.fabrics ?? []).map((f) => ({
    ...f,
    size: [f.size[0] * k, f.size[1] * k] as [number, number],
  }));
  const author = to ? settings.settings.author : await askAuthor();
  let lib: LibraryDoc;
  let doc: RrqDoc;
  let id = to;
  if (to) {
    ({ lib, doc } = picked.length
      ? await addToCollection(library.mine!, project.doc!, to, picked)
      : { lib: library.mine!, doc: project.doc! });
  } else {
    const category = await askCategory('colors');
    if (category === null) return;
    ({ lib, doc } = await saveCollection(
      library.ensureMine(author),
      project.doc!,
      name.trim(),
      picked,
      author,
      category,
      visibleTags(pp?.palette.notecard.tags),
    ));
    id = lib.items.at(-1)!.data.id;
  }
  if (fabrics.length) lib = (await addFabrics(lib, { id }, fabrics, author)).lib;
  await library.saveMine(lib);
  applyLinks(doc);
  // The project palette stays synced with it.
  const after = ownPalettes.value.find((x) => x.palette.id === from);
  const link = {
    libraryId: lib.id,
    itemId: id,
    ...(after ? { base: contentKey(after.colors, after.fabrics) } : {}),
  };
  project.change((d) => linkPalette(d, from, link));
  $q.notify({
    type: 'positive',
    message: to ? 'Added to the palette.' : `Saved “${name.trim()}” to ${MY_LIBRARY}.`,
  });
}

/**
 * Synchronize a project palette with its My library palette: the side that changed since the last
 * sync wins; when both did (or that isn't known), each difference is chosen in a dialog.
 */
function syncProjectPalette(pp: (typeof ownPalettes.value)[number]) {
  const l = paletteLinks.value.get(pp.palette.id);
  if (!l) return;
  if (l.inSync) return void $q.notify({ message: 'Already in sync.' });
  const { auto, conflicts } = resolveSync(paletteDiff(pp, l.collection), pp.palette.source?.base);
  if (!conflicts.length) return void applyMerge(pp, auto);
  // Changed on both sides: the user settles those; the rest go the way they changed.
  const choice = reactive(new Map(auto));
  for (const c of conflicts) choice.set(c.id, 'project');
  merging.value = { pp, changes: conflicts, choice };
}
/** The per-change choices when both sides changed. */
const merging = ref<{
  pp: (typeof ownPalettes.value)[number];
  changes: PaletteChange[];
  choice: Map<string, 'project' | 'library'>;
} | null>(null);
const hexOf = (x: Color | Fabric) =>
  'rgb' in x
    ? '#' +
      x.rgb
        .map((n) => n.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    : '';
const swatchOf = (x: Color | Fabric | undefined) =>
  !x ? {} : 'rgb' in x ? { background: `rgb(${x.rgb.join(',')})` } : swatchStyle(x);
function finishMerge() {
  const m = merging.value!;
  merging.value = null;
  void applyMerge(m.pp, m.choice);
}
/** Apply the chosen side of each change to both the project palette and its My library palette. */
async function applyMerge(
  pp: (typeof ownPalettes.value)[number],
  choice: Map<string, 'project' | 'library'>,
) {
  const l = paletteLinks.value.get(pp.palette.id);
  if (!l || !library.mine) return;
  const changes = new Map(paletteDiff(pp, l.collection).map((c) => [c.id, c]));
  /** The chosen version of a changed color or fabric (undefined: it goes). */
  const chosen = (id: string) => {
    const c = changes.get(id)!;
    return choice.get(id) === 'library' ? c.library : c.project;
  };
  // The result, in order: the project's, then what only My library had.
  const ids = (kind: 'color' | 'fabric', mine: { id: string }[], theirs: { id: string }[]) =>
    [...new Set([...mine, ...theirs].map((x) => x.id))].filter((id) => {
      const c = changes.get(id);
      return !c || chosen(id) !== undefined;
    });
  const colorIds = ids('color', pp.colors, l.collection.colors);
  const fabricIds = ids('fabric', pp.fabrics, l.collection.fabrics ?? []);
  const used = paintsUsed(project.doc!);
  let kept = 0;
  project.change((d) => {
    const p = d.project.palette;
    for (const c of changes.values()) {
      const x = chosen(c.id);
      if (!x || x === c.project) continue; // removed, or the project's stays as it is
      if ('rgb' in x) {
        const i = p.colors.findIndex((y) => y.id === c.id);
        if (i >= 0) p.colors[i] = castDraft(x);
        else p.colors.push(castDraft(x));
      } else {
        const f = fabricToUnits(x, d.units);
        const i = p.fabrics.findIndex((y) => y.id === c.id);
        if (i >= 0) p.fabrics[i] = castDraft(f);
        else p.fabrics.push(castDraft(f));
      }
    }
    // Removed: out of the project too, unless its quilts or blocks use it (then it stays here).
    const pal = p.collections?.find((x) => x.id === pp.palette.id);
    if (!pal) return;
    for (const c of changes.values()) {
      if (chosen(c.id) !== undefined || !c.project) continue;
      const paint = c.kind === 'color' ? c.id : `fabric:${c.id}`;
      if (used.has(paint)) {
        kept++;
        (c.kind === 'color' ? colorIds : fabricIds).push(c.id);
        continue;
      }
      if (c.kind === 'color') p.colors = p.colors.filter((y) => y.id !== c.id);
      else p.fabrics = p.fabrics.filter((y) => y.id !== c.id);
    }
    pal.colors = colorIds;
    pal.fabrics = fabricIds;
  });
  // My library gets the same, in inches.
  const now = ownPalettes.value.find((x) => x.palette.id === pp.palette.id)!;
  const k = project.doc!.units === 'cm' ? 1 / 2.54 : 1;
  const r = await syncCollectionFrom(
    library.mine,
    project.doc!,
    l.collection.id,
    now.colors.map((c) => c.id),
    now.fabrics.map((f) => ({ ...f, size: [f.size[0] * k, f.size[1] * k] as [number, number] })),
  );
  await library.saveMine(r.lib);
  applyLinks(r.doc);
  const base = contentKey(now.colors, now.fabrics);
  project.change((d) =>
    linkPalette(d, pp.palette.id, { libraryId: r.lib.id, itemId: l.collection.id, base }),
  );
  $q.notify({
    type: 'positive',
    message:
      `“${pp.palette.notecard.name}” and “${l.collection.notecard.name}” are in sync.` +
      (kept ? ` ${kept} in use stayed in the project.` : ''),
  });
}
function breakPaletteLink(pp: (typeof ownPalettes.value)[number]) {
  project.change((d) => linkPalette(d, pp.palette.id));
}

async function syncColors() {
  let lib = library.mine!;
  let doc = project.doc!;
  for (const id of changedColors.value) ({ lib, doc } = await syncColor(lib, doc, id));
  await library.saveMine(lib);
  applyLinks(doc);
  $q.notify({ type: 'positive', message: `Synced colors to ${MY_LIBRARY}.` });
}

/** A palette file becomes a project palette with its colors and fabrics (images stored here). */
async function importCollectionFile() {
  const file = await pickFile(['rrqplt']);
  if (!file) return;
  const r = parseCollectionFile(await file.text());
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  const c = r.file.collection;
  const res = importCollectionColors(project.doc!, c);
  const have = new Set(project.doc!.project.palette.fabrics.map((f) => f.id));
  const fabrics = (await absorbFabrics(c.fabrics ?? [])).filter((f) => !have.has(f.id));
  if (!res.added && !fabrics.length)
    return void $q.notify({ message: `“${c.notecard.name}” is already here.` });
  const colorIds = c.colors.map((x) => x.id);
  project.change((d) => {
    if (res.added) d.project.palette.colors = castDraft(res.doc.project.palette.colors);
    d.project.palette.fabrics.push(...castDraft(fabrics));
    const id = addPalette(d, itemId(settings.settings.author), c.notecard.name);
    fileInto(
      d,
      id,
      colorIds,
      fabrics.map((f) => f.id),
    );
  });
  $q.notify({
    type: 'positive',
    message: `Added “${c.notecard.name}”: ${res.added} color(s), ${fabrics.length} fabric(s).`,
  });
}

async function exportBlock(b: Block) {
  const palette = [...project.doc!.project.palette.colors, ...library.items.colors];
  const author = settings.settings.author;
  const stamped = { ...b, license: effectiveLicense(b, project.doc!) };
  // The fabrics it uses go along with their images (as in a palette file).
  const used = fabricIdsOf(b);
  const fabrics = await embedFabrics(
    project.doc!.project.palette.fabrics.filter((f) => used.has(f.id)),
    settings.settings.saveSize,
  );
  void exportFile(
    b.notecard.name,
    serializeBlock(
      stamped,
      project.doc!.units,
      palette,
      author,
      socialsOut(settings.settings.socials),
      fabrics,
    ),
    'rrqbl',
  );
}

/** One picker for both: a project file (.rrq) offers its blocks; anything else is read as .rrqbl. */
async function importBlocksFile() {
  const file = await pickFile(['rrqbl', 'rrq']);
  if (!file) return;
  const text = await file.text();
  if (file.name.toLowerCase().endsWith('.rrq') || formatOf(text) === 'rrq')
    await importProjectBlocksText(text);
  else await importBlockText(text);
}

function formatOf(text: string): unknown {
  try {
    return (JSON.parse(text) as { format?: unknown } | null)?.format;
  } catch {
    return undefined;
  }
}

async function importBlockText(text: string) {
  const r = parseBlockFile(text);
  if (!r.ok) {
    $q.notify({ type: 'negative', message: r.error });
    return;
  }
  // Its fabrics' images go into this device's store; the fabrics keep references.
  const file = r.file.fabrics
    ? { ...r.file, fabrics: await absorbFabrics(r.file.fabrics) }
    : r.file;
  const res = importBlock(project.doc!, file, settings.settings.author);
  if (res.doc === project.doc) {
    $q.notify({ message: `"${r.file.block.notecard.name}" is already in this project.` });
    return;
  }
  project.change(() => res.doc);
  $q.notify({ type: 'positive', message: `Imported "${r.file.block.notecard.name}".` });
}

/** Another project's blocks or quilts to pick from; only the picked ones come in (one undo step). */
const picking = ref<{
  from: RrqDoc;
  kind: 'blocks' | 'quilts';
  choices: { id: string; name: string; here: boolean; img: () => string }[];
  picked: string[];
} | null>(null);

async function importProjectBlocksText(text: string) {
  const r0 = await parseProject(text);
  if (!r0.ok) {
    $q.notify({ type: 'negative', message: r0.error });
    return;
  }
  // Its fabrics' images go into this device's store, so imported blocks show them.
  const r = { ...r0, doc: await absorbImages(r0.doc) };
  const choices = projectBlockChoices(project.doc!, r.doc, (id) => !!library.lookup.block(id));
  if (!choices.some((c) => !c.here)) {
    $q.notify({ message: `No new blocks in "${r.doc.project.name}".` });
    return;
  }
  picking.value = {
    from: r.doc,
    kind: 'blocks',
    choices: choices.map((c) => ({
      id: c.block.id,
      name: c.block.notecard.name,
      here: c.here,
      img: () => blockThumbnail(r.doc, c.block, 96, $q.dark.isActive),
    })),
    picked: choices.filter((c) => !c.here).map((c) => c.block.id),
  };
}

/** A project file's quilts to pick from, all picked to start. */
async function importQuiltsFile() {
  const file = await pickFile(['rrq']);
  if (!file) return;
  const r = await parseProject(await file.text());
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  if (!r.doc.project.quilts.length)
    return void $q.notify({ message: `No quilts in "${r.doc.project.name}".` });
  // Fabric images are stored on this device once, as when the project is opened.
  const from = await absorbImages(r.doc);
  picking.value = {
    from,
    kind: 'quilts',
    choices: from.project.quilts.map((q) => ({
      id: q.id,
      name: q.notecard.name,
      here: false,
      img: () => quiltThumbnail(from, q, 96, $q.dark.isActive),
    })),
    picked: from.project.quilts.map((q) => q.id),
  };
}

function togglePick(id: string) {
  const p = picking.value!;
  p.picked = p.picked.includes(id) ? p.picked.filter((x) => x !== id) : [...p.picked, id];
}

/** Quilts already in this project (same id) that an import brings again: which to keep (spec 035 A). */
const keepWhich = ref<{ items: KeepItem[]; done: (c: KeepChoice[]) => void } | null>(null);
function askKeepWhich(items: KeepItem[]) {
  return new Promise<KeepChoice[] | null>((resolve) => {
    keepWhich.value = {
      items,
      done: (c) => {
        keepWhich.value = null;
        resolve(c);
      },
    };
    stopKeepWhich = () => {
      keepWhich.value = null;
      resolve(null);
    };
  });
}
let stopKeepWhich = () => {};

async function importPicked() {
  const p = picking.value!;
  picking.value = null;
  if (p.kind === 'quilts') {
    const from = toRaw(p.from);
    const here = new Map(quilts.value.map((q) => [q.id, q]));
    const clashes = p.picked.filter((id) => here.has(id));
    let ids = p.picked;
    const replace = new Set<string>();
    if (clashes.length) {
      const dark = $q.dark.isActive;
      // ponytail: names assume every earlier clash is kept as both; the import picks the final one.
      const taken = quilts.value.map((q) => q.notecard.name);
      const choices = await askKeepWhich(
        clashes.map((id) => {
          const mine = here.get(id)!;
          const theirs = from.project.quilts.find((q) => q.id === id)!;
          const bothName = taken.includes(theirs.notecard.name)
            ? variationName(theirs.notecard.name, taken)
            : theirs.notecard.name;
          taken.push(bothName);
          return {
            title: theirs.notecard.name,
            left: {
              label: `This project: ${mine.notecard.name}`,
              img: quiltThumbnail(project.doc!, mine, 240, dark),
            },
            right: {
              label: `The file: ${theirs.notecard.name}`,
              img: quiltThumbnail(from, theirs, 240, dark),
              bothName,
            },
          };
        }),
      );
      if (!choices) return;
      clashes.forEach((id, i) => {
        if (choices[i] === 'left') ids = ids.filter((x) => x !== id);
        if (choices[i] === 'right') replace.add(id);
      });
      if (!ids.length) return;
    }
    const res = importProjectQuilts(project.doc!, from, settings.settings.author, ids, replace);
    if (!res.added) return;
    project.change(() => res.doc);
    $q.notify({
      type: 'positive',
      message: `Imported ${res.added} quilt${res.added > 1 ? 's' : ''} from "${p.from.project.name}" (undo removes ${res.added > 1 ? 'them' : 'it'}).`,
    });
    return;
  }
  const res = importProjectBlocks(project.doc!, p.from, settings.settings.author, p.picked);
  if (!res.added) return;
  project.change(() => res.doc);
  $q.notify({
    type: 'positive',
    message: `Imported ${res.added} block${res.added > 1 ? 's' : ''} from "${p.from.project.name}" (undo removes ${res.added > 1 ? 'them' : 'it'}).`,
  });
}

function openQuilt(id: string) {
  editor.mode = 'design';
  void router.push(`/project/quilt/${id}`);
}

function duplicate(id: string) {
  const q = quilts.value.find((x) => x.id === id);
  if (!q) return;
  const copy = { ...structuredClone(q), id: newId() };
  copy.notecard.name = variationName(
    q.notecard.name,
    quilts.value.map((x) => x.notecard.name),
  );
  project.change((d) => void d.project.quilts.splice(quilts.value.indexOf(q) + 1, 0, copy));
  openQuilt(copy.id);
}

function quiltDetails(id: string) {
  editor.mode = 'details';
  void router.push(`/project/quilt/${id}`);
}
/** The block editor: your own block to edit, a library block to look at (read-only there). */
function openInEditor(b: Block) {
  if (!isLibraryItem(b)) return openBlock(b.id);
  editor.blockMode = 'details';
  void router.push(`/project/block/${b.id}`);
}
/** Straight to the editor's Print tab (a library block's read-only view prints too). */
function printBlock(b: Block) {
  editor.blockMode = 'print';
  void router.push(`/project/block/${b.id}`);
}
function printQuilt(id: string) {
  editor.mode = 'print';
  void router.push(`/project/quilt/${id}`);
}
function blockDetails(id: string) {
  editor.blockMode = 'details';
  void router.push(`/project/block/${id}`);
}

/** Reorder within the visible list (system blocks keep their place at the end). */
function moveItem(list: 'quilts' | 'blocks', from: number, delta: number) {
  const visible = list === 'quilts' ? quilts.value : blocks.value;
  const id = visible[from]?.id;
  const target = visible[from + delta]?.id;
  if (!id || !target) return;
  project.change((d) => {
    const arr = d.project[list] as { id: string }[];
    const i = arr.findIndex((x) => x.id === id);
    const [item] = arr.splice(i, 1);
    arr.splice(arr.findIndex((x) => x.id === target) + (delta > 0 ? 1 : 0), 0, item!);
  });
}
function drop(list: 'quilts' | 'blocks', to: number) {
  if (dragFrom.value === null || dragFrom.value === to) return;
  moveItem(list, dragFrom.value, to - dragFrom.value);
  dragFrom.value = null;
}

function deleteQuilt(id: string) {
  const q = quilts.value.find((x) => x.id === id);
  $q.dialog({
    title: `Delete "${q?.notecard.name}"?`,
    message: 'You can undo this.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() =>
    project.change((d) => void (d.project.quilts = d.project.quilts.filter((x) => x.id !== id))),
  );
}

function deleteBlock(id: string) {
  const users = quiltsUsing(id);
  const remove = () =>
    project.change((d) => {
      for (const q of d.project.quilts) {
        const slots = q.layers[0].slots;
        for (const [k, s] of Object.entries(slots)) if (s.block === id) delete slots[k];
        for (const l of q.layers) l.items = l.items.filter((i) => i.ref !== id);
        const used = new Set(Object.values(slots).map((s) => s.coloring));
        for (const l of q.layers) for (const i of l.items) if (i.coloring) used.add(i.coloring);
        for (const c of Object.keys(q.colorings)) if (!used.has(c)) delete q.colorings[c];
      }
      d.project.blocks = d.project.blocks.filter((b) => b.id !== id);
    });
  if (!users.length) return remove();
  const where = users.map((q) => {
    const spots = Object.keys(q.layers[0].slots)
      .filter((slot) => q.layers[0].slots[slot]!.block === id)
      .sort((x, y) => x.localeCompare(y, undefined, { numeric: true }))
      .map(describeSlot);
    const items = q.layers.flatMap((l) => l.items).filter((i) => i.ref === id).length;
    if (items) spots.push(`${items} appliqué item${items > 1 ? 's' : ''}`);
    return { quilt: q.notecard.name, spots };
  });
  inUseDialog.value = { id, where, remove, quilt: users[0]!.id };
}

function showPlacements() {
  const d = inUseDialog.value!;
  inUseDialog.value = null;
  editor.mode = 'design';
  editor.tool = 'find';
  editor.block = d.id;
  void router.push(`/project/quilt/${d.quilt}`);
}
// Turning off a library's packs from the Libraries page (`?turnOff=`), watched for (last, so
// everything it uses exists).
watch(
  () => route.query.turnOff,
  (q) => {
    const ids = typeof q === 'string' ? q.split(',') : [];
    if (!ids.length || !project.doc) return;
    tab.value = 'colors';
    // After the address is tidied: dialogs close when the route changes.
    void router.replace({ query: {} }).then(() => startTurnOff(ids));
  },
  { immediate: true },
);
</script>

<style scoped>
.picks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  max-height: 60vh;
  overflow: auto;
}
.pick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border: 2px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  background: none;
  color: inherit;
  cursor: pointer;
  min-width: 0;
}
.pick.active {
  border-color: var(--q-primary);
}
.pick:disabled {
  opacity: 0.5;
  cursor: default;
}
.pick img {
  width: 96px;
  height: 96px;
}
.revision {
  text-decoration: underline dotted;
  cursor: help;
}
/* A card's place before it's built (it's built when scrolled into view): about a card's height,
   so the page doesn't jump as cards appear. */
.card-slot:not(:has(.card)) {
  min-height: 204px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
}
.card {
  position: relative;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 8px;
  background: transparent;
  color: inherit;
}
.save-pick {
  position: absolute;
  top: 2px;
  left: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.mini-swatch.lib-swatch {
  width: 26px;
  height: 26px;
  padding: 0;
  cursor: pointer;
}
.mini-swatch.big {
  width: 28px;
  height: 28px;
}
.mini-swatch {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex: none;
}
.card.flash {
  animation: glow 1.2s ease-out 3; /* three flashes */
}
@keyframes glow {
  0%,
  40% {
    box-shadow:
      0 0 0 3px var(--q-accent),
      0 0 16px 4px var(--q-accent);
  }
  100% {
    box-shadow:
      0 0 0 3px transparent,
      0 0 16px 4px transparent;
  }
}
.card .variant {
  position: absolute;
  top: 12px;
  left: 12px;
}
.card .pick-box {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.card .pick-box :deep(.q-checkbox__bg) {
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.6),
    0 0 10px 3px rgba(0, 0, 0, 0.3);
}
/* A soft blurred spot behind the box calms a busy block, fading out to its edge (the box sits in
   the mask's opaque middle). */
.card .pick-box :deep(.q-checkbox__inner) {
  border-radius: 50%;
  backdrop-filter: blur(3px);
  mask-image: radial-gradient(closest-side, #000 75%, transparent);
}
.card .pick-box :deep(.q-checkbox__inner--falsy .q-checkbox__bg) {
  background: rgba(255, 255, 255, 0.45);
}
/* Tabs that don't fit fade out before undo/redo while there's more to scroll to. */
.proj-tabs:has(.q-tabs__arrow--right:not(.q-tabs__arrow--faded)) :deep(.q-tabs__content) {
  mask-image: linear-gradient(to right, black calc(100% - 3rem), transparent);
}
.menu-icon {
  min-width: 0;
  padding-right: 12px;
}
.card.picked {
  border-color: var(--q-primary);
}
.card.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
}
/* Stacked actions sharing one grid cell, icon beside the label. */
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stack .card.add {
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  gap: 8px;
  min-height: 0;
  padding: 8px 12px;
  text-align: left;
}
.thumb {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: #9e9e9e;
  border-radius: 4px;
  cursor: pointer;
}
.thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.skin {
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  cursor: pointer;
}
.skin img {
  display: block;
  width: 48px;
  height: 48px;
  margin: 0 auto;
}
.skin-name {
  display: block;
  width: 56px;
  font-size: 10px;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.skin.active {
  border-color: var(--q-primary);
}
.lib-box {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 4px 12px 10px;
  margin-left: 0;
  margin-right: 0;
  min-width: 0;
}
.lib-box legend {
  padding: 0 4px;
}
/* Project palettes: rows like the Libraries page's palettes. */
.collection {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 2px 6px 6px;
  margin: 0;
  min-width: 0;
}
.collection legend {
  padding: 0 4px;
  max-width: 80%;
}
.collection.drop-target {
  border-color: var(--q-primary);
  box-shadow: inset 0 0 0 1px var(--q-primary);
}
.strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  min-height: 30px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.chip {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
/* Synchronize dialog: project | choice | library, the choices in one column. */
.merge-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: start; /* swatches line up; the arrows sit level with them */
  gap: 8px 10px;
}
/* Each side: a big swatch, its name and details wrapping underneath. */
.merge-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}
.merge-grid > .q-btn-toggle {
  margin-top: 16px;
}
.merge-swatch {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  background-size: cover;
  flex: none;
}
.merge-text {
  max-width: 100%;
  overflow-wrap: anywhere;
}
.lib-row-sep {
  border-top: 1px solid rgba(128, 128, 128, 0.15);
  padding-top: 4px;
}
.pal-hr {
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}
.lib-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.fabric-swatch {
  padding: 0;
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.4);
}
/* Filter sidebar: as the Libraries page's. */
.filter-side {
  width: 260px;
  flex: none;
  align-self: flex-start;
  position: sticky;
  top: 67px;
  max-height: calc(100vh - 83px);
  overflow-y: auto;
  padding-top: 2px;
  order: 1;
}
.filter-side.left {
  order: -1;
}
.anchor {
  scroll-margin-top: 64px;
}
.toc {
  gap: 2px;
}
.toc a {
  color: inherit;
  text-decoration: none;
  border-radius: 4px;
  padding: 2px 6px;
}
.toc a:hover {
  background: rgba(128, 128, 128, 0.15);
}
.toc-lib {
  font-weight: 600;
  margin-top: 6px;
}
.toc-sec {
  padding-left: 18px !important;
}
.toc-sec.sub {
  padding-left: 34px !important;
}
@media (max-width: 1023px) {
  .fly-backdrop {
    position: fixed;
    inset: var(--fly-top, 50px) 0 0 0;
    z-index: 4;
    background: rgba(0, 0, 0, 0.2);
  }
  .row.no-wrap-md {
    flex-direction: column;
  }
  .filter-side {
    position: fixed;
    top: var(--fly-top, 50px);
    height: calc(100dvh - var(--fly-top, 50px));
    right: 0;
    width: min(300px, 85vw);
    max-height: none;
    z-index: 5;
    padding: 12px;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.25);
  }
  .filter-side.left {
    right: auto;
    left: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  }
  :global(.body--dark .filter-side) {
    background: var(--q-dark-page);
  }
}
</style>
