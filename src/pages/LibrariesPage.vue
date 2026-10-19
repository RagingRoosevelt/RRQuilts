<template>
  <q-page padding>
    <!-- The filters button sits on the sidebar's side, like the editors' menu button. -->
    <div class="row items-center no-wrap q-mb-sm">
      <h1 class="page-title col row items-center no-wrap">
        Libraries <HelpLink topic="guides/libraries" label="Libraries" />
      </h1>
      <q-btn
        v-if="$q.screen.lt.md"
        flat
        round
        icon="menu"
        aria-label="Filters"
        :style="settings.settings.sidesSwapped ? { order: -1 } : undefined"
        @click="toggleFilters"
      />
    </div>
    <q-banner v-if="!library.stored" dense class="bg-warning text-dark q-mb-md">
      This browser isn't keeping your libraries (storage is blocked). Back up before closing.
    </q-banner>

    <div class="row no-wrap-md" style="gap: 16px">
      <div
        v-show="filtersOpen || $q.screen.gt.sm"
        class="libs column"
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
            @click="filtersOpen = false"
          />
        </div>
        <!-- A fieldset, so "Libraries" sits in the top-left of the border. -->
        <fieldset class="lib-picker rounded-borders">
          <legend>
            <button
              class="lib-toggle"
              :aria-expanded="collapse.isOpen('sidebar:libraries')"
              @click="collapse.toggle('sidebar:libraries')"
            >
              <q-icon
                :name="collapse.isOpen('sidebar:libraries') ? 'expand_more' : 'chevron_right'"
              />Libraries
              <span class="text-caption text-grey-7">
                · {{ library.views.length }} of {{ library.allViews.length }} on
              </span>
            </button>
          </legend>
          <!-- One search for packs across libraries, above the list (it doesn't scroll away). -->
          <q-input
            v-if="collapse.isOpen('sidebar:libraries') && libGroups.some((g) => g.packs)"
            v-model="packQuery"
            dense
            borderless
            clearable
            placeholder="Find a pack"
            class="q-px-sm"
          >
            <template #prepend><q-icon name="search" size="xs" /></template>
          </q-input>
          <div
            v-if="collapse.isOpen('sidebar:libraries')"
            class="lib-checks column no-wrap q-px-sm"
          >
            <div v-if="!shownGroups.length" class="text-caption text-grey-7 q-pa-xs">
              No packs match.
            </div>
            <template v-for="g in shownGroups" :key="g.key">
              <!-- Every library has a switch: off leaves it out of projects' trays and pickers.
                   Its name shows just that library here. -->
              <div
                v-if="!g.packs"
                class="row items-center no-wrap q-py-xs q-pl-xs"
                style="gap: 4px"
              >
                <q-toggle
                  dense
                  size="sm"
                  :model-value="packOn(g.view.doc.id)"
                  :aria-label="`Use ${g.view.doc.name}`"
                  @update:model-value="(on: boolean) => setLibOn(g.view.doc.id, on)"
                />
                <div class="col" style="min-width: 0">
                  <div class="row items-center no-wrap" style="gap: 4px">
                    <a
                      href="#"
                      class="pack-link ellipsis block"
                      style="flex: 0 1 auto"
                      :class="{ 'text-grey-6': !packOn(g.view.doc.id) }"
                      @click.prevent="select(g.view.doc.id)"
                      >{{ g.view.doc.name }}</a
                    >
                    <LibraryWebLink
                      :url="libraryPage(g.view.doc.id, g.view.doc)"
                      :name="g.view.doc.name"
                    />
                  </div>
                  <div class="text-caption text-grey-7 ellipsis">
                    {{ kindLabel(g.view) }} · {{ counts(g.view) }}
                  </div>
                </div>
              </div>
              <!-- A library of packs (spec 014): each pack switched on or off for use;
                   a connected library's packs download when first switched on. -->
              <q-expansion-item
                v-else
                dense
                :model-value="!!packQuery?.trim() || !collapsed.includes(g.key)"
                @update:model-value="(o: boolean) => setCollapsed(g.key, !o)"
                :class="{ 'just-added': justAdded === g.key }"
                header-class="q-px-xs"
              >
                <template #header>
                  <q-item-section>
                    <q-item-label class="row items-center no-wrap" style="gap: 4px">
                      <span class="ellipsis">{{ g.name }}</span>
                      <LibraryWebLink
                        :url="
                          libraryPage(
                            g.key.slice(4),
                            g.packs.find((p) => p.view)?.view?.doc,
                            g.bundled?.url,
                          )
                        "
                        :name="g.name"
                      />
                    </q-item-label>
                    <q-item-label caption>{{
                      g.bundled && !g.connection
                        ? 'Not downloaded yet'
                        : `${g.packs.filter((p) => p.view && packOn(p.id)).length} of ${g.packs.length} packs on`
                    }}</q-item-label>
                  </q-item-section>
                </template>
                <div v-if="g.connection || g.packs.length > 1" class="row q-pb-xs" style="gap: 4px">
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    icon="toggle_off"
                    label="All off"
                    :disable="!g.packs.some((p) => p.view && packOn(p.id))"
                    @click="allPacksOff(g)"
                  />
                  <q-btn
                    v-if="g.connection"
                    flat
                    dense
                    no-caps
                    size="sm"
                    icon="update"
                    label="Check for updates"
                    :loading="checking"
                    @click="checkUpdate(g.connection)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    :icon="g.connection ? 'link_off' : 'delete'"
                    :label="g.connection ? 'Disconnect' : 'Remove'"
                    @click="disconnect(g)"
                  />
                </div>
                <div
                  v-for="p in shownPacks(g)"
                  :key="p.id"
                  class="row items-center no-wrap q-pl-xs"
                  style="gap: 4px"
                >
                  <q-spinner v-if="downloading.includes(p.id)" size="20px" class="q-mx-sm" />
                  <q-toggle
                    v-else
                    dense
                    size="sm"
                    :model-value="!!p.view && packOn(p.id)"
                    :aria-label="`Use ${p.name}`"
                    @update:model-value="(on: boolean) => setPackOn(g, p, on)"
                  />
                  <a
                    v-if="p.view"
                    href="#"
                    class="pack-link ellipsis"
                    :class="{ 'text-grey-6': !packOn(p.id) }"
                    :title="p.name"
                    @click.prevent="select(p.id)"
                    >{{ p.name }}</a
                  >
                  <span v-else class="ellipsis text-grey-6 col" style="min-width: 0">
                    {{ p.name }}<q-tooltip>Not downloaded yet</q-tooltip>
                  </span>
                </div>
                <!-- Offered with the app (bundled_libraries.json): its pack list downloads on request. -->
                <div v-if="g.bundled && !g.connection" class="q-px-xs q-pb-xs">
                  <div v-if="g.bundled.description" class="text-caption text-grey-7">
                    {{ g.bundled.description }}
                  </div>
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    icon="cloud_download"
                    label="Show packs"
                    :loading="connectingBundled === g.key"
                    @click="connectBundled(g)"
                  />
                </div>
              </q-expansion-item>
            </template>
          </div>
          <q-btn
            v-if="hiddenLibs.length"
            flat
            dense
            no-caps
            size="sm"
            color="primary"
            icon="visibility"
            label="Show all libraries"
            class="q-ma-xs"
            @click="hiddenLibs = []"
          />
          <!-- Adding and saving libraries, under the list. -->
          <div v-if="collapse.isOpen('sidebar:libraries')" class="lib-actions q-pa-xs">
            <div class="row no-wrap">
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                icon="cloud_download"
                label="Add from the web…"
                class="col"
                @click="
                  Object.assign(adding, {
                    open: true,
                    url: '',
                    ref: '',
                    busy: false,
                    fromLink: false,
                  })
                "
              >
                <q-tooltip>Connect a library repository by its web address</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                icon="upload_file"
                label="Import resource…"
                class="col"
                @click="importFile"
              >
                <q-tooltip>A backup, library or pack (.rrqlib), or a palette (.rrqplt)</q-tooltip>
              </q-btn>
            </div>
            <div class="row no-wrap">
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                icon="save"
                label="Back up…"
                class="col"
                @click="backingUp = { ...ALL }"
              >
                <q-tooltip>Save My library and your libraries' settings to a file</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                icon="share"
                label="Make pack…"
                class="col"
                :disable="!library.mine?.items.length"
                @click="startShare"
              >
                <q-tooltip>Share things from My library as a pack file</q-tooltip>
              </q-btn>
            </div>
          </div>
        </fieldset>
        <SlidePicker v-model="settings.settings.libraryType" :options="TYPE_OPTIONS" label="Type" />
        <template v-for="f in filterFields" :key="f.key">
          <FilterSelect
            v-if="f.options.length"
            v-model="filters[f.key]"
            :options="f.options"
            :label="f.label"
          />
        </template>
        <q-input v-model="search" dense outlined clearable placeholder="Search names, notes">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-select
          v-if="settings.settings.libraryType === 'block'"
          v-model="settings.settings.libraryGroupBy"
          :options="GROUP_BY"
          emit-value
          map-options
          dense
          outlined
          label="Group blocks by"
        />
        <BlockFilter
          v-if="settings.settings.libraryType === 'block'"
          v-model:layout="fitLayout"
          v-model:shape="fitShape"
        />
        <!-- Table of contents (Blocks view): each library and its sections; click to jump. -->
        <template
          v-if="settings.settings.libraryType === 'block' && groups.some((g) => g.blocks.length)"
        >
          <q-separator />
          <nav class="toc column" aria-label="Contents">
            <template v-for="g in groups.filter((x) => x.blocks.length)" :key="g.v.doc.id">
              <a href="#" class="toc-lib" @click.prevent="revealSection(g.v.doc.id)">{{
                g.v.doc.name
              }}</a>
              <a
                v-for="s in g.sections.filter((x) => x.label)"
                :key="s.key"
                href="#"
                class="toc-sec"
                :class="{ sub: s.parent }"
                @click.prevent="revealSection(g.v.doc.id, s)"
                >{{ s.label }} <span class="text-grey-6">{{ s.count }}</span></a
              >
            </template>
          </nav>
        </template>
      </div>

      <div class="col" style="min-width: 0">
        <template v-for="g in groups" :key="g.v.doc.id">
          <div class="lib-group q-mb-md" :class="{ 'in-lib': g.packOf && !g.firstOfLib }">
            <!-- Packs of one library (a repository or zipped library) sit under its name. -->
            <div v-if="g.packOf && g.firstOfLib" class="q-mb-sm">
              <h2 class="lib-name">
                <button class="lib-toggle" :aria-expanded="libOpen(g)" @click="toggleLib(g)">
                  <q-icon :name="libOpen(g) ? 'expand_more' : 'chevron_right'" />{{ g.packOf.name }}
                </button>
              </h2>
              <div class="text-caption text-grey-7">
                {{ libPackCount(g.packOf.id) }}
              </div>
            </div>
            <!-- A pack's palettes join its library's list, like a single library's. -->
            <div v-if="!g.packOf" class="row items-start q-mb-sm" style="gap: 8px">
              <div class="col">
                <h2 class="lib-name">
                  <button class="lib-toggle" :aria-expanded="libOpen(g)" @click="toggleLib(g)">
                    <q-icon :name="libOpen(g) ? 'expand_more' : 'chevron_right'" />{{
                      g.v.doc.name
                    }}
                  </button>
                </h2>
                <div class="text-caption text-grey-7">
                  <template v-if="g.v.doc.author">by {{ g.v.doc.author.name }} · </template>
                  <template v-if="g.v.doc.license">{{ licenseName(g.v.doc.license) }} · </template>
                  revision {{ g.v.doc.revision }}
                </div>
                <div v-if="g.v.doc.description" class="text-body2 q-mt-xs">
                  {{ g.v.doc.description }}
                </div>
              </div>
              <q-btn
                v-if="g.mine"
                flat
                dense
                no-caps
                icon="label"
                label="Categories…"
                @click="managing = true"
              />
              <q-btn
                v-if="isPack(g.v)"
                flat
                dense
                no-caps
                color="negative"
                icon="delete"
                label="Remove pack"
                @click="removePack(g.v.doc)"
              />
            </div>

            <div
              v-if="g.mine && !g.v.doc.items.length && libOpen(g)"
              class="text-grey-7 q-mb-sm"
              style="max-width: 560px"
            >
              Your own blocks and palettes, available in every project on this device. Make a
              palette here, add a block from a project's Blocks tab (<b>Add to my library</b>), save
              a palette from its Palettes tab (<b>Save to my library</b>), or import a backup.
            </div>
            <div
              v-if="g.mine && !g.v.doc.items.length && libOpen(g)"
              class="row items-center q-mb-md"
              style="gap: 4px"
            >
              <q-btn
                outline
                dense
                no-caps
                icon="add"
                label="New palette"
                class="q-px-sm"
                @click="newPalette()"
              />
              <HelpLink topic="guides/libraries#make-your-own-palettes" label="New palette" />
            </div>
            <!-- My library with palettes but no blocks yet (Blocks view): where blocks come from. -->
            <div
              v-else-if="
                g.mine &&
                !g.blocks.length &&
                !filtering &&
                settings.settings.libraryType === 'block' &&
                libOpen(g)
              "
              class="text-grey-7 q-mb-sm"
            >
              No blocks yet. Add one from a project's Blocks tab (<b>Add to my library</b> in a
              block's menu).
            </div>
            <BlockSections
              v-if="g.blocks.length && libOpen(g)"
              :sections="g.sections"
              :lib="g.v.doc.id"
              title="Blocks"
            >
              <template #default="{ block: b }">
                <!-- Built as it comes into view (then kept), not all at once. -->
                <q-intersection once class="card-slot">
                  <div class="card">
                    <div class="relative-position">
                      <button class="thumb" @click="previewing = { lib: g.v.doc.id, id: b.id }">
                        <img
                          :src="thumb(b, 200, shown.get(`${g.v.doc.id}:${b.id}`))"
                          :alt="b.notecard.name"
                        />
                      </button>
                      <ColoringCount
                        :block="b"
                        :model-value="shown.get(`${g.v.doc.id}:${b.id}`)"
                        :thumb="(id) => thumb(b, 64, id)"
                        @update:model-value="(id) => shown.set(`${g.v.doc.id}:${b.id}`, id)"
                      />
                    </div>
                    <div class="row items-center no-wrap">
                      <FullName class="col" :name="b.notecard.name" />
                      <q-btn flat round dense icon="more_vert" aria-label="Actions">
                        <q-menu>
                          <q-list dense style="min-width: 170px">
                            <q-item
                              v-close-popup
                              clickable
                              @click="previewing = { lib: g.v.doc.id, id: b.id }"
                            >
                              <q-item-section>Preview</q-item-section>
                            </q-item>
                            <template v-if="g.mine">
                              <q-item
                                v-close-popup
                                clickable
                                @click="rename(b.id, b.notecard.name)"
                              >
                                <q-item-section>Rename…</q-item-section>
                              </q-item>
                              <q-item v-close-popup clickable @click="pickCategory(b.id)">
                                <q-item-section>Category…</q-item-section>
                              </q-item>
                              <q-item v-close-popup clickable @click="startTagging(b.id)">
                                <q-item-section>Tags & styles…</q-item-section>
                              </q-item>
                            </template>
                            <q-item v-else v-close-popup clickable @click="copyMine(g.v, b.id)">
                              <q-item-section>Copy to my library</q-item-section>
                            </q-item>
                            <q-item v-close-popup clickable @click="exportBlock(b)">
                              <q-item-section>Export (.rrqbl)</q-item-section>
                            </q-item>
                            <q-item v-if="g.mine" v-close-popup clickable @click="remove(b.id)">
                              <q-item-section class="text-negative">Delete</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                </q-intersection>
              </template>
            </BlockSections>

            <div
              v-if="
                libOpen(g) &&
                (g.collections.length || (g.mine && g.v.doc.items.length)) &&
                settings.settings.libraryType !== 'block' &&
                (!g.packOf || g.firstPalettes) &&
                (settings.settings.libraryType !== 'colors' || g.mine)
              "
              class="row items-center q-mb-sm"
              style="gap: 8px"
            >
              <!-- In the Palettes view everything is a palette: no heading needed. -->
              <h3 v-if="settings.settings.libraryType !== 'colors'" class="sub-title">Palettes</h3>
              <q-btn
                v-if="g.mine"
                outline
                dense
                no-caps
                icon="add"
                label="New palette"
                class="q-px-sm"
                @click="newPalette()"
              />
              <HelpLink
                v-if="g.mine"
                topic="guides/libraries#make-your-own-palettes"
                label="New palette"
              />
            </div>
            <div
              v-if="libOpen(g)"
              class="column"
              :class="g.packOf && !g.lastOfLib ? 'q-mb-sm' : 'q-mb-lg'"
              style="gap: 8px"
            >
              <!-- A fieldset, so the name sits in the top-left border like a legend. -->
              <fieldset
                v-for="c in g.collections"
                :key="c.id"
                class="collection row items-center no-wrap"
                :class="{ 'drop-target': dropOn === c.id }"
                @dragover.prevent="g.mine && (dropOn = c.id)"
                @dragleave="dropOn = null"
                @drop.prevent="g.mine && dropImages($event, c.id)"
              >
                <legend class="ellipsis">
                  {{ c.notecard.name }}
                  <span class="text-caption text-grey-7"
                    >· {{ c.colors.length + (c.fabrics?.length ?? 0) }}
                    <template v-if="g.packOf && g.v.doc.author">
                      · {{ g.v.doc.author.name }}</template
                    ></span
                  >
                </legend>
                <button class="strip col" @click="previewing = { lib: g.v.doc.id, id: c.id }">
                  <span
                    v-if="!c.colors.length && !c.fabrics?.length"
                    class="text-caption text-grey-7"
                  >
                    Empty: click to add colors or fabric images
                  </span>
                  <span
                    v-for="(x, i) in c.colors"
                    :key="x.id"
                    class="chip"
                    :style="{ background: css(x) }"
                    :title="x.notecard.name"
                    @click.stop="previewing = { lib: g.v.doc.id, id: c.id, at: i }"
                  />
                  <!-- Fabrics (spec 014): the print over its average color. -->
                  <span
                    v-for="(x, i) in c.fabrics ?? []"
                    :key="x.id"
                    class="chip"
                    :style="swatchStyle(x)"
                    @click.stop="
                      previewing = { lib: g.v.doc.id, id: c.id, at: c.colors.length + i }
                    "
                    :title="x.notecard.name + (x.approximate ? ' (size ≈)' : '')"
                  />
                </button>
                <q-btn flat round dense icon="more_vert" aria-label="Actions">
                  <q-menu>
                    <q-list dense style="min-width: 170px">
                      <q-item
                        v-close-popup
                        clickable
                        @click="previewing = { lib: g.v.doc.id, id: c.id }"
                      >
                        <q-item-section>{{ g.mine ? 'Edit colors…' : 'Preview' }}</q-item-section>
                      </q-item>
                      <template v-if="g.mine">
                        <q-item v-close-popup clickable @click="rename(c.id, c.notecard.name)">
                          <q-item-section>Rename…</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="pickCategory(c.id)">
                          <q-item-section>Category…</q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable @click="startTagging(c.id)">
                          <q-item-section>Tags & styles…</q-item-section>
                        </q-item>
                      </template>
                      <q-item v-else v-close-popup clickable @click="copyMine(g.v, c.id)">
                        <q-item-section>Copy to my library</q-item-section>
                      </q-item>
                      <q-item v-close-popup clickable @click="exportCollection(c)">
                        <q-item-section>Export (.rrqplt)</q-item-section>
                      </q-item>
                      <q-item v-if="g.mine" v-close-popup clickable @click="remove(c.id)">
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                      <q-item
                        v-if="g.packOf && isPack(g.v)"
                        v-close-popup
                        clickable
                        @click="removePack(g.v.doc)"
                      >
                        <q-item-section class="text-negative">Remove pack</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </fieldset>
            </div>
          </div>
        </template>
        <div v-if="!groups.length && filtering" class="text-grey-7 q-pa-md">Nothing matches.</div>
      </div>
    </div>

    <!-- Preview / collection colors -->
    <q-dialog :model-value="!!previewing" @update:model-value="previewing = null">
      <q-card v-if="previewBlock" style="width: 560px; max-width: 95vw">
        <q-card-section>
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close"
            aria-label="Close"
            class="float-right"
          />
          <div class="text-h6">{{ previewBlock.notecard.name }}</div>
          <div class="text-caption text-grey-7">
            {{ previewBlock.size.map((n) => roundLen(n, 'in')).join(' × ') }} in
            <template v-if="previewBlock.revision">
              · revision {{ previewBlock.revision }}</template
            >
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
          <div v-if="itemLicense(previewBlock)">
            <span class="text-grey-7">License:</span> {{ licenseName(itemLicense(previewBlock)!) }}
          </div>
          <div v-if="priorCredits(previewBlock).length">
            <span class="text-grey-7">Based on:</span> {{ creditLine(previewBlock) }}
          </div>
          <div v-if="tagLine(previewBlock)" class="text-caption text-grey-7">
            {{ tagLine(previewBlock) }}
          </div>
        </q-card-section>
      </q-card>
      <q-card v-else-if="previewCollection" style="width: min(80vw, 512px); max-width: none">
        <q-card-section>
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close"
            aria-label="Close"
            class="float-right"
          />
          <PaletteTitle :palette="previewCollection" :license="itemLicense(previewCollection)" />
        </q-card-section>
        <PalettePreview
          v-model:at="swatchAt"
          :palette="previewCollection"
          :editable="previewMine"
          images
          @add="startColor(previewCollection!.id)"
          @add-images="fabricDialog?.show({ palette: previewCollection!.id })"
          @drop-files="(files) => fabricDialog?.show({ files, palette: previewCollection!.id })"
          @edit="(i) => startColor(previewCollection!.id, i)"
          @rename="(i, name) => renameSwatch(previewCollection!, i, name)"
          @remove="(i) => removeSwatch(previewCollection!, i)"
        />
        <ColorEditor v-if="previewMine" ref="colorEditor" @done="saveColorEdit" />
      </q-card>
    </q-dialog>

    <!-- Tags & styles -->
    <q-dialog :model-value="!!tagging" @update:model-value="tagging = null">
      <q-card v-if="tagging" style="width: 400px; max-width: 95vw">
        <q-card-section class="text-h6">Tags & styles</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <q-select
            v-for="f in ['tags', 'styles'] as const"
            :key="f"
            v-model="tagging[f]"
            :label="f === 'tags' ? 'Tags' : 'Styles'"
            :hint="f === 'styles' ? 'e.g. eight-point, log cabin' : undefined"
            :options="tagOptions"
            dense
            outlined
            multiple
            use-chips
            use-input
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add-unique"
            @filter="(v: string, done: (fn: () => void) => void) => filterTags(f, v, done)"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn flat no-caps color="primary" label="Save" @click="saveTags" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Categories -->
    <q-dialog v-model="managing">
      <q-card style="width: 400px; max-width: 95vw">
        <q-card-section class="text-h6">Categories</q-card-section>
        <q-list dense separator>
          <q-item v-for="c in categoryTree(library.mine?.categories ?? [])" :key="c.id">
            <q-item-section :class="{ 'q-pl-lg': c.depth }">{{ c.name }}</q-item-section>
            <q-item-section side>
              <div class="row no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  aria-label="Rename"
                  @click="renameCat(c.id, c.name)"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete"
                  aria-label="Delete"
                  @click="deleteCat(c.id, c.name)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <q-card-section>
          <q-input v-model="newCategory" dense outlined label="New category" @keyup.enter="addCat">
            <template #append>
              <q-btn flat round dense icon="add" aria-label="Add" @click="addCat" />
            </template>
          </q-input>
          <div class="text-caption text-grey-7 q-mt-sm">
            For a subcategory, write its category first: Stars/Eight-point stars. Deleting a
            category deletes its subcategories; their items become uncategorized.
          </div>
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn v-close-popup flat no-caps label="Done"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Back up -->
    <q-dialog :model-value="!!backingUp" @update:model-value="backingUp = null">
      <q-card v-if="backingUp" style="width: 400px; max-width: 95vw">
        <q-card-section class="text-h6">Back up libraries</q-card-section>
        <q-card-section class="column">
          <q-checkbox v-model="backingUp.mine" :label="`${MY_LIBRARY} (${mineCount})`" />
          <q-checkbox
            v-model="backingUp.packs"
            :label="`Installed packs (${library.packs.length})`"
            :disable="!library.packs.length"
          />
          <div class="text-caption text-grey-7 q-mt-sm">
            One .rrqlib file. Import it on any device to get everything back. Packs from libraries
            added from the web are saved as their address and download again when restored.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Back up"
            :disable="!backingUp.mine && !backingUp.packs"
            @click="backUp"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Restore -->
    <q-dialog :model-value="!!restoring" persistent>
      <q-card v-if="restoring" style="width: 460px; max-width: 95vw">
        <q-card-section class="text-h6">Restore a backup</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <div>
            {{ restoring.backup.items.length }} item(s) for {{ MY_LIBRARY }},
            {{ restoring.backup.packs?.length ?? 0 }} pack(s).
          </div>
          <div v-if="restoring.backup.connections?.length">
            Libraries from the web, added again:
            {{ restoring.backup.connections.map(webLine).join('; ') }}
          </div>
          <q-option-group
            v-if="library.mine?.items.length && restoring.backup.items.length"
            v-model="restoring.mine"
            :options="[
              { label: 'Merge into my library (keep what\'s here)', value: 'merge' },
              { label: 'Replace my library with the backup\'s', value: 'replace' },
            ]"
          />
          <div v-for="p in installedAgain" :key="p.id" class="row items-center" style="gap: 8px">
            <div class="col">“{{ p.name }}” is already installed.</div>
            <q-btn-toggle
              v-model="restoring.packs[p.id]"
              dense
              no-caps
              :options="[
                { label: 'Keep', value: 'keep' },
                { label: 'Replace', value: 'replace' },
              ]"
            />
          </div>
          <SkippedList :skipped="restoring.skipped" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="restoring = null" />
          <q-btn flat no-caps color="primary" label="Restore" @click="doRestore" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Share as pack -->
    <q-dialog v-model="shareOpen">
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="text-h6">Make a pack</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <q-input v-model="share.name" dense outlined label="Name" />
          <q-input
            v-model="share.description"
            dense
            outlined
            type="textarea"
            autogrow
            label="Description"
          />
          <q-input v-model="share.author" dense outlined label="Author" />
          <q-select
            v-model="share.license"
            :options="licenseOptions"
            emit-value
            map-options
            dense
            outlined
            label="License"
            :hint="
              shared.lock
                ? `At least ${licenseName(shared.lock.license)}: required by “${shared.lock.because}”`
                : undefined
            "
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.terms }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <div class="text-subtitle2 q-mt-sm">Web pages (optional)</div>
          <q-input
            v-model="share.homepage"
            dense
            outlined
            label="Home page"
            placeholder="https://…"
            :error="!webOk(share.homepage)"
            error-message="A web address, starting https://"
          />
          <q-input
            v-model="share.gallery"
            dense
            outlined
            label="Gallery"
            placeholder="https://…"
            :error="!webOk(share.gallery)"
            error-message="A web address, starting https://"
          />
          <div
            v-for="(o, n) in share.others"
            :key="n"
            class="row no-wrap items-start"
            style="gap: 6px"
          >
            <q-input v-model="o.name" dense outlined label="Name" style="width: 30%" />
            <q-input
              v-model="o.url"
              dense
              outlined
              label="Address"
              class="col"
              :error="!webOk(o.url)"
              error-message="A web address"
            />
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Remove link"
              @click="share.others.splice(n, 1)"
            />
          </div>
          <div>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              icon="add"
              label="Another link"
              @click="share.others.push({ name: '', url: '' })"
            />
          </div>
          <div class="row items-center q-mt-sm" style="gap: 8px">
            <div class="text-subtitle2">What to include</div>
            <q-space />
            <q-btn flat dense no-caps size="sm" label="All" @click="share.only = shareAll()" />
            <q-btn flat dense no-caps size="sm" label="None" @click="share.only = []" />
          </div>
          <q-list
            dense
            bordered
            separator
            class="rounded-borders"
            style="max-height: 35vh; overflow: auto"
          >
            <q-item v-for="it in shareItems" :key="it.id" tag="label">
              <q-item-section side>
                <q-checkbox v-model="share.only" dense :val="it.id" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ it.name }}</q-item-label>
                <q-item-label caption>{{ it.kind }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div class="text-caption">
            {{ shared.doc.items.length }} item(s), license
            <b>{{ licenseName(shared.doc.license!) }}</b>
            <template v-if="shared.doc.credits?.length">
              · credits {{ shared.doc.credits.length }}</template
            >
          </div>
          <div v-if="shared.excluded.length" class="text-caption text-negative">
            Left out (all rights reserved by someone else): {{ shared.excluded.join(', ') }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Download pack"
            :disable="!share.name.trim() || !shared.doc.items.length || !shareLinksOk"
            @click="downloadPack"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Add a library from the web -->
    <q-dialog v-model="adding.open">
      <q-card style="width: 480px; max-width: 90vw">
        <q-card-section class="text-h6">{{
          adding.fromLink ? 'Add this library?' : 'Add a library from the web'
        }}</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <div v-if="adding.fromLink">
            A link asks to add the library at this address. Check it's the one you expect, then
            click <b>Connect</b>.
          </div>
          <q-input
            v-model="adding.url"
            dense
            outlined
            autofocus
            label="Address"
            placeholder="https://github.com/someone/their-library"
            @keyup.enter="connectLibrary"
          />
          <q-input v-model="adding.ref" dense outlined label="Branch or tag (optional)" />
          <div class="text-caption text-grey-7">
            Only the list of packs is downloaded now. Switch packs on to download them.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Connect"
            :loading="adding.busy"
            :disable="!adding.url.trim()"
            @click="connectLibrary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Importing a library file: which of its packs to add -->
    <q-dialog :model-value="!!picking" persistent>
      <q-card v-if="picking" style="width: 520px; max-width: 92vw">
        <q-card-section class="text-h6"
          >Import {{ picking.r.library?.name ?? 'library' }}</q-card-section
        >
        <q-card-section class="q-pt-none column" style="gap: 8px">
          <div class="text-body2">
            Choose the packs to add.
            <template v-if="pickConnects">
              The library is added as if from the web: its other packs stay listed, to switch on
              (and download) later.
            </template>
            <template v-else>Import this file again to add others later.</template>
          </div>
          <q-input
            v-if="picking.r.packs.length > 8"
            v-model="picking.filter"
            dense
            outlined
            clearable
            placeholder="Find a pack"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <div class="row items-center" style="gap: 8px">
            <q-btn flat dense no-caps size="sm" label="Select all" @click="pickAll(true)" />
            <q-btn flat dense no-caps size="sm" label="Select none" @click="pickAll(false)" />
            <span class="text-caption text-grey-7">
              {{ picking.chosen.length }} to add or update
            </span>
          </div>
          <q-list
            dense
            bordered
            separator
            class="rounded-borders"
            style="max-height: 50vh; overflow: auto"
          >
            <q-item
              v-for="p in pickList"
              :key="p.id"
              tag="label"
              :disable="pickStatus(p) === 'have'"
            >
              <q-item-section side>
                <q-checkbox
                  dense
                  :model-value="pickStatus(p) === 'have' || picking.chosen.includes(p.id)"
                  :disable="pickStatus(p) === 'have'"
                  @update:model-value="(on: boolean) => pickOne(p.id, on)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ p.name }}</q-item-label>
                <q-item-label caption>{{ itemCount(p) }} · {{ pickNote(p) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-toggle
            v-if="largerPacks.length"
            v-model="picking.addLarger"
            :label="`Add the file's larger images (${filePx} px) to ${largerPacks.length} pack${largerPacks.length === 1 ? '' : 's'} you have`"
          />
          <div v-if="smallerPacks.length">
            <div class="text-body2">
              {{ smallerPacks.length }} pack{{ smallerPacks.length === 1 ? '' : 's' }} you have
              {{ smallerPacks.length === 1 ? 'has' : 'have' }} larger images than this file's ({{
                filePx
              }}
              px):
            </div>
            <q-option-group
              v-model="picking.useSmaller"
              dense
              :options="[
                { label: 'Keep your larger images', value: false },
                { label: 'Switch to this file\'s smaller images (frees space)', value: true },
              ]"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="picking = null" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Import"
            :disable="!pickSomething"
            :loading="picking.busy"
            @click="installPicked"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- A connected library's update -->
    <q-dialog :model-value="!!updating" persistent>
      <q-card v-if="updating" style="width: 480px; max-width: 90vw">
        <q-card-section class="text-h6">{{ updating.index.name }} has an update</q-card-section>
        <q-card-section class="q-pt-none" style="max-height: 60vh; overflow: auto">
          <!-- What changes on this device, before anything is downloaded or removed. -->
          <div v-if="updating.changes.length" class="text-weight-medium q-mb-sm">
            {{
              [
                updateTotals.added && `${updateTotals.added} new`,
                updateTotals.removed && `${updateTotals.removed} removed`,
                updateTotals.changed && `${updateTotals.changed} changed`,
              ]
                .filter(Boolean)
                .join(' · ') || 'No color or fabric changes'
            }}
            <span class="text-grey-7 text-weight-regular">(colors and fabrics in your packs)</span>
          </div>
          <div v-else class="text-grey-7 q-mb-sm">No changes to the packs on this device.</div>
          <q-expansion-item
            v-for="ch in updating.changes"
            :key="ch.id"
            dense
            dense-toggle
            :label="ch.kind === 'removed' ? `${ch.name} (no longer in the library)` : ch.name"
            :caption="
              [
                diffCount(ch.diff).added && `${diffCount(ch.diff).added} new`,
                diffCount(ch.diff).removed && `${diffCount(ch.diff).removed} removed`,
                diffCount(ch.diff).changed && `${diffCount(ch.diff).changed} changed`,
              ]
                .filter(Boolean)
                .join(' · ') || 'Details only'
            "
          >
            <div class="q-pl-md q-pb-sm">
              <template
                v-for="part in [
                  { label: 'New', items: diffSwatches(ch.diff.added) },
                  { label: 'Removed', items: diffSwatches(ch.diff.removed) },
                  { label: 'Changed', items: diffSwatches(ch.diff.changed) },
                ]"
                :key="part.label"
              >
                <div v-if="part.items.length" class="text-caption text-grey-7 q-mt-xs">
                  {{ part.label }}
                </div>
                <div v-if="part.items.length" class="row" style="gap: 4px">
                  <span
                    v-for="x in part.items"
                    :key="x.id"
                    class="chip"
                    :style="x.style"
                    :title="x.name"
                  />
                </div>
                <div v-if="part.items.length" class="text-caption">
                  {{ part.items.map((x) => x.name).join(', ') }}
                </div>
              </template>
            </div>
          </q-expansion-item>
          <div v-if="updating.newPacks.length" class="q-mt-sm">
            New packs to switch on: {{ updating.newPacks.join(', ') }}
          </div>
          <template v-if="updating.notes.length">
            <div class="text-subtitle2 q-mt-md">Notes</div>
            <div v-for="n in updating.notes" :key="n.revision" class="q-mb-sm">
              <div class="text-weight-medium">Revision {{ n.revision }} · {{ n.date }}</div>
              <div style="white-space: pre-line">{{ n.notes }}</div>
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" :disable="updating.busy" @click="updating = null" />
          <q-btn
            flat
            no-caps
            label="Skip this update"
            :disable="updating.busy"
            @click="declineUpdate"
          />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Update"
            :loading="updating.busy"
            @click="acceptUpdate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Turning off a library or pack the open project uses -->
    <q-dialog :model-value="!!turningOff" @update:model-value="turningOff = null">
      <q-card v-if="turningOff" style="width: 460px; max-width: 95vw">
        <q-card-section class="text-h6">{{ turningOff.name }} is in use</q-card-section>
        <q-card-section class="q-pt-none">
          The open project, {{ project.doc?.project.name }}, uses {{ turningOff.paints }} color{{
            turningOff.paints === 1 ? '' : 's'
          }}
          or fabric{{ turningOff.paints === 1 ? '' : 's' }} from
          {{ turningOff.palettes.map((x) => x.c.notecard.name).join(', ') }}. Swap them for others,
          or keep them by copying {{ turningOff.palettes.length === 1 ? 'it' : 'them' }} to
          {{ MY_LIBRARY }}.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancel" />
          <q-btn
            flat
            no-caps
            :label="`Copy to ${MY_LIBRARY}`"
            :loading="turningOff.busy"
            @click="copyBeforeOff"
          />
          <q-btn flat no-caps color="primary" label="Swap…" @click="swapBeforeOff" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <FabricImportDialog ref="fabricDialog" units="in" :palettes="myPalettes" @done="fabricsAdded" />
  </q-page>
</template>

<script setup lang="ts">
import ColoringCount from '@/components/ColoringCount.vue';
import BlockSections from '@/components/BlockSections.vue';
import BlockFilter from '@/components/BlockFilter.vue';
import FilterSelect from '@/components/FilterSelect.vue';
import { blockFits, type ShapeFilter } from '@/render/layout-samples';
import { roundLen } from '@/model/units';
import ColorEditor from '@/components/ColorEditor.vue';
import HelpLink from '@/components/HelpLink.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import FullName from '@/components/FullName.vue';
import { useAskCategory } from '@/composables/category';
// Libraries (spec 011): browse every library; manage My library; back up, restore, share, import.
import { QIcon, QTooltip, useQuasar } from 'quasar';
import {
  computed,
  defineComponent,
  h,
  markRaw,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useAuthor } from '@/composables/author';
import { serializeBlock } from '@/model/block-file';
import { collectionFile, parseCollectionFile } from '@/model/collection-file';
import { DEFAULT_LICENSE, LICENSES, authorOf, licenseName, priorCredits } from '@/model/credits';
import {
  MY_LIBRARY,
  emptyPersonal,
  withSources,
  blockSections,
  categoryTree,
  copyToMine,
  deleteCategory,
  ensureCategory,
  putCollection,
  removeItem,
  renameCategory,
  searchItems,
  setCategory,
  withSubcategories,
  setCollectionColors,
  addNewColor,
  saveCollection,
  setNotecard,
  type LibraryView,
  addFabrics,
  removeFabric,
  renameFabric,
} from '@/model/library';
import { backupDoc, packDoc, parseLibrary, restore, serializeLibrary } from '@/model/library-file';
import { createProject } from '@/model/new-project';
import type { Block } from '@/model/schema/block';
import type {
  ColorCollection,
  LibraryBackup,
  LibraryDoc,
  LibraryItem,
  BackupConnection,
} from '@/model/schema/library';
import type { Color } from '@/model/schema/palette';
import { blockThumbnail } from '@/render/thumbnail';
import { exportFile, pickFile } from '@/storage/files';
import { absorbFabrics, embedFabrics } from '@/storage/fabric-files';
import { deleteImage } from '@/storage/images';
import {
  isZip,
  readLibraryZip,
  writeLibraryZip,
  type ImageCheck,
  type ZippedLibrary,
} from '@/storage/library-zip';
import FabricImportDialog from '@/components/FabricImportDialog.vue';
import PalettePreview from '@/components/PalettePreview.vue';
import PaletteTitle from '@/components/PaletteTitle.vue';
import type { Fabric } from '@/model/schema/palette';
import { retryMissing, swatchStyle } from '@/render/fabric-images';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useRoute, useRouter } from 'vue-router';
import { paintsUsed, replaceColors } from '@/editor/colors';
import { fabricPaint } from '@/editor/paint';
import { coloringSections } from '@/model/library-items';
import type { Connection } from '@/storage/repositories';
import { bundledLibraries, sameUrl } from '@/content/bundled';
import type { BundledLibrary } from '@/model/schema/bundled';
import type { PackChange } from '@/stores/library';
import { diffCount } from '@/model/pack-diff';
import { revealSection, useCollapsed } from '@/composables/block-sections';
import { socialsOut } from '@/settings/socials';
import { useSettingsStore } from '@/stores/settings';

const APP = import.meta.env.APP_VERSION;
const ALL = { mine: true, packs: true };

const $q = useQuasar();
const library = useLibraryStore();
const settings = useSettingsStore();
const askAuthor = useAuthor();
const me = computed(() => settings.settings.author);

/** Problems found while reading a file, listed in dialogs. */
const SkippedList = defineComponent({
  props: { skipped: { type: Array as () => string[], required: true } },
  setup: (p) => () =>
    p.skipped.length
      ? h('div', { class: 'text-caption text-negative' }, [
          `Skipped ${p.skipped.length}:`,
          h(
            'ul',
            { class: 'q-my-xs' },
            p.skipped.map((s) => h('li', s)),
          ),
        ])
      : null,
});

// --- Browsing: filters over every library ---
const filtersOpen = ref($q.screen.gt.sm);
/** Phones: the sidebar flies over the page, just under the app's header. */
const flyTop = ref(50);
function toggleFilters() {
  flyTop.value = document.querySelector('.q-header')?.getBoundingClientRect().bottom ?? 50;
  filtersOpen.value = !filtersOpen.value;
}
const select = (id: string) => {
  for (const k of ['cats', 'tags', 'styles'] as const) filters[k] = [];
  search.value = '';
  hiddenLibs.value =
    id === 'mine' ? [] : library.allViews.map((v) => v.doc.id).filter((x) => x !== id);
};
/** Unchecked libraries; libraries installed later start checked. */
/** Libraries left out of this page's view (a library's name shows just it). */
const hiddenLibs = ref<string[]>([]);
// Libraries removed (or a shown one gone): forget them, and show everything if nothing's left.
watch(
  () => library.allViews.map((v) => v.doc.id),
  (ids) => {
    const hidden = hiddenLibs.value.filter((x) => ids.includes(x));
    hiddenLibs.value = hidden.length >= ids.length ? [] : hidden;
  },
);
/** The library list: single libraries, and libraries of packs grouped (spec 014). */
interface PackEntry {
  id: string;
  name: string;
  view?: LibraryView;
}
interface PackGroup {
  key: string;
  name: string;
  packs: PackEntry[];
  connection?: Connection;
  /** Offered with the app (bundled_libraries.json). */
  bundled?: BundledLibrary;
}
const bundled = bundledLibraries();
const libGroups = computed(() => {
  const out: ({ key: string; view: LibraryView; packs?: undefined } | PackGroup)[] = [];
  const groups = new Map<string, PackGroup>();
  const group = (id: string, name: string) => {
    let g = groups.get(id);
    if (!g) {
      groups.set(id, (g = { key: `lib:${id}`, name, packs: [] }));
      out.push(g);
    }
    return g;
  };
  for (const v of library.allViews) {
    const lib = v.doc.library;
    if (!lib) out.push({ key: v.doc.id, view: v });
    else group(lib.id, lib.name).packs.push({ id: v.doc.id, name: v.doc.name, view: v });
  }
  for (const c of library.connections) {
    const g = group(c.index.id, c.index.name);
    g.connection = c;
    for (const p of c.index.packs)
      if (!g.packs.some((x) => x.id === p.id)) g.packs.push({ id: p.id, name: p.name });
  }
  // Packs alphabetically within their library.
  for (const g of out) if (g.packs) g.packs.sort((a, b) => a.name.localeCompare(b.name));
  // Libraries offered with the app that aren't connected (or were disconnected) on this device.
  const hidden = settings.settings.bundledHidden;
  for (const b of bundled) {
    const c = library.connections.find((x) => sameUrl(x.url, b.url));
    if (c) {
      const g = groups.get(c.index.id);
      if (g) g.bundled = b;
    } else if (
      !hidden.some((u) => sameUrl(u, b.url)) &&
      // Already connected from another address (a mirror): don't list it twice.
      !library.connections.some((x) => x.index.name === b.name)
    )
      out.push({ key: `bundled:${b.url}`, name: b.name, packs: [], bundled: b });
  }
  // My library first, then other libraries by name, then the built-in one.
  const name = (g: (typeof out)[number]) => (g.packs ? g.name : g.view.doc.name);
  const rank = (g: (typeof out)[number]) =>
    g.packs ? 1 : g.view.doc.kind === 'personal' ? 0 : g.view.doc === library.builtin ? 2 : 1;
  out.sort((a, b) => rank(a) - rank(b) || name(a).localeCompare(name(b)));
  return out;
});
/** The sidebar's pack search: matching packs (and libraries by name); others hide while it's set. */
const packQuery = ref<string | null>('');
const packMatch = (name: string) =>
  name.toLowerCase().includes(packQuery.value?.trim().toLowerCase() ?? '');
const shownPacks = (g: PackGroup) => g.packs.filter((p) => packMatch(p.name));
const shownGroups = computed(() =>
  packQuery.value?.trim()
    ? libGroups.value.filter((g) =>
        g.packs ? packMatch(g.name) || shownPacks(g).length : packMatch(g.view.doc.name),
      )
    : libGroups.value,
);
const packOn = (id: string) => !settings.settings.packsOff.includes(id);
function setLibOn(id: string, on: boolean) {
  const turn = () => {
    const off = settings.settings.packsOff.filter((x) => x !== id);
    settings.settings.packsOff = on ? off : [...off, id];
    if (on) retryMissing();
  };
  if (on) turn();
  else checkOff([id], turn);
}

// --- Turning off a library or pack the open project uses ---
const project = useProjectStore();
const router = useRouter();
const route = useRoute();
/** Its palettes the open project uses: swap their colors, copy them to My library, or cancel. */
const turningOff = ref<{
  ids: string[];
  name: string;
  palettes: { v: LibraryView; c: ColorCollection }[];
  paints: number;
  off: () => void;
  busy?: boolean;
} | null>(null);
function checkOff(ids: string[], off: () => void) {
  const doc = project.doc;
  if (!doc || project.readOnly) return off();
  const used = paintsUsed(doc);
  const views = library.allViews.filter((v) => ids.includes(v.doc.id));
  const members = (c: ColorCollection) => [
    ...c.colors.map((x) => x.id),
    ...(c.fabrics ?? []).map((f) => fabricPaint(f.id)),
  ];
  const palettes = views.flatMap((v) =>
    v.collections.filter((c) => members(c).some((m) => used.has(m))).map((c) => ({ v, c })),
  );
  if (!palettes.length) return off();
  turningOff.value = {
    ids,
    name: views.length === 1 ? views[0]!.doc.name : (views[0]?.doc.library?.name ?? 'This library'),
    palettes,
    paints: new Set(palettes.flatMap((x) => members(x.c)).filter((m) => used.has(m))).size,
    off,
  };
}
/** Swap in the project's Palettes tab; the pack turns off once the swap is done. */
function swapBeforeOff() {
  const t = turningOff.value!;
  turningOff.value = null;
  void router.push({ path: '/project', query: { turnOff: t.ids.join(',') } });
}
/** Copy the palettes in use to My library, point the project at the copies, then turn off. */
async function copyBeforeOff() {
  const t = turningOff.value!;
  t.busy = true;
  const author = await askAuthor();
  const map = new Map<string, string>();
  const swapPalette = new Map<string, string>();
  for (const { v, c } of t.palettes) {
    const item = v.doc.items.find((i) => i.data.id === c.id);
    if (item?.type !== 'colors') continue;
    await update((l) => copyToMine(l, { ...item, data: c }, author, DEFAULT_LICENSE));
    const copy = library.mine!.items.at(-1)!.data as ColorCollection;
    c.colors.forEach((x, i) => copy.colors[i] && map.set(x.id, copy.colors[i].id));
    swapPalette.set(c.id, copy.id);
  }
  project.change((d) => {
    replaceColors(d, map);
    if (d.project.libraryPalettes)
      d.project.libraryPalettes = d.project.libraryPalettes.map((id) => swapPalette.get(id) ?? id);
  });
  turningOff.value = null;
  t.off();
  $q.notify({
    type: 'positive',
    message: `Copied ${t.palettes.length} palette${t.palettes.length === 1 ? '' : 's'} to ${MY_LIBRARY}; ${t.name} is off.`,
  });
}
const downloading = ref<string[]>([]);
async function setPackOn(g: PackGroup, p: PackEntry, on: boolean) {
  if (!on && p.view)
    return checkOff([p.id], () => {
      settings.settings.packsOff = [...settings.settings.packsOff.filter((x) => x !== p.id), p.id];
      if (g.connection) void library.freeImages();
    });
  const off = settings.settings.packsOff.filter((x) => x !== p.id);
  settings.settings.packsOff = on ? off : [...off, p.id];
  if (!on) return void (g.connection && library.freeImages());
  if (p.view && g.connection) {
    const px = settings.settings.imageSize;
    await library.fetchPackImages([p.id], (s) => s <= 256 || s <= px);
  } else if (!p.view && g.connection) {
    downloading.value = [...downloading.value, p.id];
    try {
      const skipped = await library.installFromRepo(
        g.connection,
        p.id,
        settings.settings.imageSize,
      );
      $q.notify({
        message: `${p.name} downloaded` + (skipped.length ? ` (${skipped.length} skipped)` : ''),
        ...(skipped.length ? { caption: skipped.slice(0, 3).join('; ') } : {}),
      });
    } catch (e) {
      $q.notify({ type: 'negative', message: `${p.name}: ${(e as Error).message}` });
    } finally {
      downloading.value = downloading.value.filter((x) => x !== p.id);
    }
  }
  retryMissing();
}

// --- Libraries connected from the web ---
const justAdded = ref<string | null>(null);
/** Libraries of packs start expanded; the ones collapsed are remembered on this device. */
const COLLAPSED_KEY = 'rrquilts.librariesCollapsed';
const collapsed = ref<string[]>(
  (() => {
    try {
      const v = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '[]') as unknown;
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  })(),
);
function setCollapsed(key: string, on: boolean) {
  collapsed.value = on
    ? [...new Set([...collapsed.value, key])]
    : collapsed.value.filter((k) => k !== key);
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed.value));
  } catch {
    // Not kept (storage blocked): fine, it's only a view preference.
  }
}
/** Where a library's globe link goes: its home page, else its gallery, else its repository. */
function libraryPage(libId: string, doc?: LibraryDoc, repository?: string) {
  const c = library.connections.find((x) => x.index.id === libId);
  const links = c?.index.links ?? doc?.links;
  const url = links?.homepage ?? links?.gallery ?? c?.url ?? repository;
  // Indexes come from the web unchecked: only web addresses become links.
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : '';
}
/** The globe link beside a library's name (nothing when it has no web page). */
const LibraryWebLink = defineComponent({
  props: { url: { type: String, default: '' }, name: { type: String, required: true } },
  setup: (props) => () =>
    props.url
      ? h(
          'a',
          {
            class: 'lib-web',
            href: props.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': `${props.name} on the web`,
            onClick: (e: Event) => e.stopPropagation(), // not the expansion header's toggle
          },
          [h(QIcon, { name: 'public' }), h(QTooltip, () => props.url)],
        )
      : null,
});
const adding = reactive({ open: false, url: '', ref: '', busy: false, fromLink: false });
/** Open the side panel on a library and glow around it for a few seconds. */
function showLibrary(id: string) {
  filtersOpen.value = true;
  justAdded.value = `lib:${id}`;
  setCollapsed(justAdded.value, false);
  void nextTick(() =>
    document.querySelector('.just-added')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
  );
  setTimeout(() => (justAdded.value = null), 4500);
}
// A link to /libraries?add=<address>[&ref=<branch or tag>] (e.g. from a library's gallery page)
// fills in Add from the web and asks; it never connects on its own.
onMounted(async () => {
  const url = route.query.add;
  if (typeof url !== 'string' || !url.trim()) return;
  const ref = typeof route.query.ref === 'string' ? route.query.ref.trim() : '';
  // A reload doesn't ask again. Done first: dialogs close when the route changes.
  await router.replace({ query: {} });
  await library.connectionsLoaded;
  const c = library.connections.find((x) => sameUrl(x.url, url));
  if (c) {
    showLibrary(c.index.id);
    $q.notify({ message: `${c.index.name} is already added.` });
    return;
  }
  Object.assign(adding, { open: true, url: url.trim(), ref, busy: false, fromLink: true });
});
async function connectLibrary() {
  const a = adding;
  if (!a.url.trim()) return;
  a.busy = true;
  try {
    const c = await library.connect(a.url, a.ref.trim() || undefined);
    settings.settings.bundledHidden = settings.settings.bundledHidden.filter(
      (u) => !sameUrl(u, a.url),
    );
    Object.assign(a, { open: false, busy: false });
    showLibrary(c.index.id); // show where it went
    $q.notify({
      type: 'positive',
      message: `${c.index.name} connected. Switch on the packs you want.`,
    });
  } catch (e) {
    a.busy = false;
    $q.notify({
      type: 'negative',
      message: (e as Error).message || 'Couldn’t reach that address.',
    });
  }
}
const checking = ref(false);
const updating = ref<{
  c: Connection;
  index: Connection['index'];
  notes: { revision: number; date: string; notes: string }[];
  changes: PackChange[];
  newPacks: string[];
  busy?: boolean;
} | null>(null);
/** The update's totals across packs, for its summary line. */
const updateTotals = computed(() => {
  const t = { added: 0, removed: 0, changed: 0 };
  for (const ch of updating.value?.changes ?? []) {
    const n = diffCount(ch.diff);
    t.added += n.added;
    t.removed += n.removed;
    t.changed += n.changed;
  }
  return t;
});
/** A diff's colors and fabrics as swatches: fabrics show their image if this device has it. */
const diffSwatches = (part: { colors: Color[]; fabrics: Fabric[] }) => [
  ...part.colors.map((c) => ({ id: c.id, name: c.notecard.name, style: { background: css(c) } })),
  ...part.fabrics.map((f) => ({ id: f.id, name: f.notecard.name, style: swatchStyle(f) })),
];
async function checkUpdate(c: Connection) {
  checking.value = true;
  try {
    const u = await library.checkForUpdate(c);
    if (u) updating.value = { c, ...u };
    else $q.notify({ message: `${c.index.name} is up to date.` });
  } catch (e) {
    $q.notify({ type: 'negative', message: (e as Error).message });
  } finally {
    checking.value = false;
  }
}
async function acceptUpdate() {
  const u = updating.value;
  if (!u) return;
  u.busy = true;
  try {
    const skipped = await library.acceptUpdate(u.c, u.index, settings.settings.imageSize);
    $q.notify({
      type: 'positive',
      message: `${u.index.name} updated` + (skipped.length ? ` (${skipped.length} skipped)` : ''),
    });
    updating.value = null;
  } catch (e) {
    u.busy = false;
    $q.notify({ type: 'negative', message: (e as Error).message });
  }
}
async function declineUpdate() {
  const u = updating.value;
  updating.value = null;
  if (u) await library.declineUpdate(u.c, u.index.revision);
}
/** Switch off every pack of a library (asking first about any the open project uses). */
function allPacksOff(g: PackGroup) {
  const ids = g.packs.filter((p) => p.view && packOn(p.id)).map((p) => p.id);
  checkOff(ids, () => {
    settings.settings.packsOff = [...new Set([...settings.settings.packsOff, ...ids])];
    if (g.connection) void library.freeImages();
  });
}
const connectingBundled = ref<string | null>(null);
async function connectBundled(g: PackGroup) {
  const b = g.bundled!;
  connectingBundled.value = g.key;
  try {
    const c = await library.connect(b.url, b.ref);
    setCollapsed(`lib:${c.index.id}`, false);
  } catch (e) {
    $q.notify({ type: 'negative', message: `${b.name}: ${(e as Error).message}` });
  } finally {
    connectingBundled.value = null;
  }
}
/** Disconnect a web library, or remove an imported one: its packs leave this device. */
function disconnect(g: PackGroup) {
  const c = g.connection;
  const verb = c ? 'Disconnect' : 'Remove';
  $q.dialog({
    title: `${verb} ${g.name}?`,
    message: `Its ${c ? 'downloaded' : 'imported'} packs are removed from this device. Projects keep the items they use.`,
    cancel: true,
    ok: { label: verb, color: 'negative', flat: true },
  }).onOk(() => {
    // A library offered with the app stays out of the list on this device once disconnected.
    if (c && bundled.some((b) => sameUrl(b.url, c.url)))
      settings.settings.bundledHidden = [...settings.settings.bundledHidden, c.url];
    void library.removeLibrary(g.key.slice(4));
  });
}

const isPack = (v: LibraryView) => library.packs.some((p) => p.id === v.doc.id);
const kindLabel = (v: LibraryView) =>
  v.doc.kind === 'personal' ? 'Yours' : v.doc === library.builtin ? 'Built-in' : 'Pack';
const counts = (v: LibraryView) =>
  [
    v.blocks.length && `${v.blocks.length} block${v.blocks.length > 1 ? 's' : ''}`,
    v.collections.length && `${v.collections.length} palette${v.collections.length > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(', ') || 'empty';
const mineCount = computed(() => library.mine?.items.length ?? 0);

const search = ref('');
/** Block filter (spec 026): blocks that fit a layout, or of one shape. */
const fitLayout = ref<string | null>(null);
const fitShape = ref<ShapeFilter | null>(null);
/** Selected values per filter; empty = any. Category '' = uncategorized. */
const filters = reactive({
  cats: [] as string[],
  tags: [] as string[],
  styles: [] as string[],
});
/** What's typed in each dropdown to narrow its options. */
const filtering = computed(
  // The Type picker is a view choice, not a filter (it always has a value).
  () =>
    !!search.value ||
    !!hiddenLibs.value.length ||
    !!fitLayout.value ||
    !!fitShape.value ||
    [filters.cats, filters.tags, filters.styles].some((f) => f.length),
);
/** Every library shown; My library always, as an empty one until something is saved there. */
const inScope = computed(() =>
  [
    ...(library.mine
      ? []
      : [
          (() => {
            const doc = emptyPersonal(me.value);
            return { doc, ...withSources(doc) };
          })(),
        ]),
    ...library.allViews,
  ].filter(
    (v) =>
      !hiddenLibs.value.includes(v.doc.id) &&
      // Switched-off libraries and packs stay out, unless picked by name to look at alone.
      (packOn(v.doc.id) || library.allViews.length - hiddenLibs.value.length === 1),
  ),
);
/** Items of the type shown (Blocks, Palettes, or All): filters only offer what they use. */
const ofType = (i: LibraryItem) =>
  !settings.settings.libraryType || i.type === settings.settings.libraryType;
const typedItems = computed(() => inScope.value.flatMap((v) => v.doc.items.filter(ofType)));
const values = (f: 'tags' | 'styles') =>
  [...new Set(typedItems.value.flatMap((i) => i.data.notecard[f] ?? []))]
    .sort()
    .map((t) => ({ label: t, value: t }));
const allCats = computed(() => [
  ...new Map(inScope.value.flatMap((v) => v.doc.categories).map((c) => [c.id, c])).values(),
]);
// Switching Blocks / Palettes / All: drop filter picks the new type doesn't offer.
watch(
  () => settings.settings.libraryType,
  () => {
    for (const f of filterFields.value) {
      const ok = new Set(f.options.map((o) => o.value));
      filters[f.key] = filters[f.key].filter((x) => ok.has(x));
    }
  },
);
const TYPE_OPTIONS = [
  { label: 'Blocks', value: 'block' },
  { label: 'Palettes', value: 'colors' },
  { label: 'All', value: '' },
];
const filterFields = computed(() => {
  // Categories the shown items use, with their parents.
  const used = new Set(typedItems.value.map((i) => i.category ?? ''));
  for (const c of allCats.value) if (used.has(c.id) && c.parent) used.add(c.parent);
  const cats = allCats.value.filter((c) => used.has(c.id));
  return [
    {
      key: 'cats' as const,
      label: 'Category',
      options: cats.length
        ? [
            ...categoryTree(cats).map((c) => ({ label: c.label, value: c.id })),
            ...(used.has('') ? [{ label: 'Uncategorized', value: '' }] : []),
          ]
        : [],
    },
    { key: 'tags' as const, label: 'Tags', options: values('tags') },
    { key: 'styles' as const, label: 'Styles', options: values('styles') },
  ];
});
const anyOf = (picked: string[], have: string[]) =>
  !picked.length || picked.some((x) => have.includes(x));
const matches = (i: LibraryItem) =>
  (!settings.settings.libraryType || i.type === settings.settings.libraryType) &&
  anyOf(withSubcategories(allCats.value, filters.cats), [i.category ?? '']) &&
  anyOf(filters.tags, i.data.notecard.tags ?? []) &&
  anyOf(filters.styles, i.data.notecard.styles ?? []) &&
  (i.type !== 'block' || blockFits(i.data.shape, fitLayout.value, fitShape.value));
const GROUP_BY = [
  { label: 'Nothing', value: 'none' },
  { label: 'Category', value: 'category' },
  { label: 'Tags', value: 'tags' },
  { label: 'Styles', value: 'styles' },
];
const groups = computed(() =>
  withLibraryHeads(
    inScope.value
      .map((v) => {
        const ids = new Set(
          searchItems(v.doc.items, search.value ?? '')
            .filter(matches)
            .map((i) => i.data.id),
        );
        const blocks = v.blocks.filter((b) => ids.has(b.id));
        return {
          v,
          mine: v.doc.kind === 'personal',
          blocks,
          sections: blockSections(v.doc, blocks, settings.settings.libraryGroupBy),
          collections: v.collections.filter((c) => ids.has(c.id)),
        };
      })
      // My library shows even when empty (it holds the New palette button), unless filtering.
      .filter((g) => g.blocks.length || g.collections.length || (g.mine && !filtering.value)),
  ),
);
/** Packs of the same library together, the first of each carrying the library's heading. */
function withLibraryHeads<T extends { v: LibraryView; collections: unknown[] }>(gs: T[]) {
  // My library first, then other libraries by name (a library's packs together, in their order),
  // then the built-in one.
  const rank = (g: T) => (g.v.doc.kind === 'personal' ? 0 : g.v.doc === library.builtin ? 2 : 1);
  const libName = (g: T) => g.v.doc.library?.name ?? g.v.doc.name;
  const sorted = gs
    .map((g, i) => ({ g, i }))
    .sort(
      (a, b) =>
        rank(a.g) - rank(b.g) ||
        libName(a.g).localeCompare(libName(b.g)) ||
        (a.g.v.doc.library ? a.g.v.doc.name.localeCompare(b.g.v.doc.name) : 0) ||
        a.i - b.i,
    )
    .map((x) => x.g);
  const lib = (g?: T) => g?.v.doc.library?.id;
  return sorted.map((g, i) => ({
    ...g,
    packOf: g.v.doc.library,
    firstOfLib: !!lib(g) && lib(sorted[i - 1]) !== lib(g),
    lastOfLib: !!lib(g) && lib(sorted[i + 1]) !== lib(g),
    /** The first of its library's packs with palettes: it carries the Palettes heading. */
    firstPalettes:
      !!lib(g) && !sorted.slice(0, i).some((x) => lib(x) === lib(g) && x.collections.length),
  }));
}
/** Libraries collapse from their heading (remembered, like block sections). */
const collapse = useCollapsed();
const libOf = (g: { v: LibraryView; packOf?: { id: string } | undefined }) =>
  `page:${g.packOf?.id ?? g.v.doc.id}`;
const libOpen = (g: { v: LibraryView; packOf?: { id: string } | undefined }) =>
  collapse.isOpen(libOf(g));
const toggleLib = (g: { v: LibraryView; packOf?: { id: string } | undefined }) =>
  collapse.toggle(libOf(g));
const libPackCount = (id: string) => {
  const n = library.allViews.filter((v) => v.doc.library?.id === id).length;
  const c = library.connections.find((x) => x.index.id === id);
  const all = c?.index.packs.length ?? n;
  return `${n} of ${all} pack${all === 1 ? '' : 's'} on this device`;
};

const emptyDoc = createProject();
/** The coloring each card shows ("<library>:<block>" → coloring id); default the first. */
const shown = reactive(new Map<string, string>());
const thumb = (b: Block, px: number, coloring?: string) =>
  blockThumbnail(emptyDoc, b, px, $q.dark.isActive, coloring, library.items.colors);
const css = (c: Color) => `rgb(${c.rgb.join(',')})`;
const itemLicense = (x: Block | ColorCollection) =>
  x.license ?? previewLib.value?.doc.license ?? (previewMine.value ? undefined : DEFAULT_LICENSE);
const creditLine = (x: Block) =>
  priorCredits(x)
    .map((c) => `${c.name ?? 'earlier work'} by ${c.author ?? 'anonymous'}`)
    .join('; ');
const tagLine = (x: Block) =>
  [...(x.notecard.styles ?? []).map((s) => `style: ${s}`), ...(x.notecard.tags ?? [])].join(' · ');

/** What the preview shows; `at`: a palette's color or fabric to show first. */
const previewing = ref<{ lib: string; id: string; at?: number } | null>(null);
/** The preview's coloring (undefined: the block's first); reset when the preview changes. */
const previewColoring = ref<string>();
watch(previewing, () => (previewColoring.value = undefined));
const previewLib = computed(() => library.allViews.find((v) => v.doc.id === previewing.value?.lib));
const previewMine = computed(() => previewLib.value?.doc.kind === 'personal');
const previewBlock = computed(() =>
  previewLib.value?.blocks.find((b) => b.id === previewing.value?.id),
);
const previewSections = computed(() =>
  previewBlock.value ? coloringSections(previewBlock.value, library.lookup, 'My colorings') : [],
);
const previewCollection = computed(() =>
  previewLib.value?.collections.find((c) => c.id === previewing.value?.id),
);
/** The palette preview's color or fabric shown large (where the palette was clicked). */
const swatchAt = ref(0);
watch(previewing, (p) => (swatchAt.value = p?.at ?? 0));

// --- Editing My library ---
async function update(fn: (lib: LibraryDoc) => LibraryDoc | Promise<LibraryDoc>) {
  await library.saveMine(await fn(library.ensureMine(me.value)));
}

function rename(id: string, name: string) {
  $q.dialog({ title: 'Rename', prompt: { model: name, type: 'text' }, cancel: true }).onOk(
    (v: string) => v.trim() && void update((l) => setNotecard(l, id, { name: v.trim() })),
  );
}
function remove(id: string) {
  $q.dialog({
    title: 'Delete from my library?',
    message: 'Projects that use it keep their copy.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => void update((l) => removeItem(l, id)));
}
const askCategory = useAskCategory();
async function pickCategory(id: string) {
  const item = library.mine!.items.find((i) => i.data.id === id);
  const v = await askCategory('Category', item?.category ?? '', item?.type);
  if (v !== null) await update((l) => setCategory(l, id, v));
}

const tagging = ref<{ id: string; tags: string[]; styles: string[] } | null>(null);
const tagOptions = ref<string[]>([]);
// Existing tags/styles from every library, matched as you type; Enter adds a new one.
function filterTags(f: 'tags' | 'styles', typed: string, done: (fn: () => void) => void) {
  const q = typed.trim().toLowerCase();
  const all = new Set(
    library.allViews.flatMap((v) => v.doc.items.flatMap((i) => i.data.notecard[f] ?? [])),
  );
  done(() => (tagOptions.value = [...all].filter((t) => t.toLowerCase().includes(q)).sort()));
}
function startTagging(id: string) {
  const n = library.mine!.items.find((i) => i.data.id === id)!.data.notecard;
  tagging.value = { id, tags: [...(n.tags ?? [])], styles: [...(n.styles ?? [])] };
}
function saveTags() {
  const { id, tags, styles } = tagging.value!;
  tagging.value = null;
  const clean = (l: string[]) => [...new Set(l.map((x) => x.trim()).filter(Boolean))];
  void update((l) => setNotecard(l, id, { tags: clean(tags), styles: clean(styles) }));
}

const managing = ref(false);
const newCategory = ref('');
function addCat() {
  const name = newCategory.value.trim();
  if (!name) return;
  newCategory.value = '';
  void update((l) => ensureCategory(l, name).lib);
}
function renameCat(id: string, name: string) {
  $q.dialog({ title: 'Rename category', prompt: { model: name, type: 'text' }, cancel: true }).onOk(
    (v: string) => v.trim() && void update((l) => renameCategory(l, id, v.trim())),
  );
}
function deleteCat(id: string, name: string) {
  $q.dialog({
    title: `Delete “${name}”?`,
    message: 'Its subcategories go too; their items become uncategorized.',
    cancel: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => {
    const gone = withSubcategories(library.mine?.categories ?? [], [id]);
    filters.cats = filters.cats.filter((c) => !gone.includes(c));
    void update((l) => deleteCategory(l, id));
  });
}

function editColors(id: string, fn: (colors: Color[]) => Color[]) {
  void update((l) => {
    const item = l.items.find((i) => i.data.id === id);
    return item?.type === 'colors' ? setCollectionColors(l, id, fn([...item.data.colors])) : l;
  });
}
const colorEditor = ref<InstanceType<typeof ColorEditor>>();
/** The palette color being edited (index), or a new one (no index). */
const colorTarget = ref<{ palette: string; index?: number } | null>(null);
function startColor(palette: string, index?: number) {
  colorTarget.value = { palette, ...(index === undefined ? {} : { index }) };
  const c = index === undefined ? undefined : previewCollection.value?.colors[index];
  colorEditor.value?.show(
    c && { name: c.notecard.name, rgb: [...c.rgb] as [number, number, number] },
  );
}
async function saveColorEdit(c: { name: string; rgb: [number, number, number] }) {
  const t = colorTarget.value;
  colorTarget.value = null;
  if (!t) return;
  if (t.index === undefined) {
    const me = await askAuthor();
    await update((l) => addNewColor(l, t.palette, c, me));
  } else
    editColors(t.palette, (cs) =>
      cs.map((x, j) =>
        j === t.index ? { ...x, rgb: c.rgb, notecard: { ...x.notecard, name: c.name } } : x,
      ),
    );
}
/** A new, empty palette in My library, opened for adding colors. */
function newPalette() {
  $q.dialog({
    title: 'New palette',
    prompt: { model: '', type: 'text', isValid: (v: string) => !!v.trim() },
    cancel: true,
  }).onOk((name: string) => void createPalette(name.trim()));
}
async function createPalette(name: string) {
  const me = await askAuthor();
  let made = '';
  await update(async (l) => {
    const r = await saveCollection(l, emptyDoc, name, [], me);
    made = r.lib.items.at(-1)!.data.id;
    return r.lib;
  });
  previewing.value = { lib: library.mine!.id, id: made };
}
const removeColor = (id: string, i: number) => editColors(id, (cs) => cs.filter((_, j) => j !== i));
/** Rename a My library palette's color or fabric `i` (colors first), from the editor's name field. */
function renameSwatch(c: ColorCollection, i: number, name: string) {
  if (i < c.colors.length)
    return editColors(c.id, (cs) =>
      cs.map((x, j) => (j === i ? { ...x, notecard: { ...x.notecard, name } } : x)),
    );
  const f = c.fabrics?.[i - c.colors.length];
  if (f) void update((l) => renameFabric(l, c.id, f.id, name));
}
/** Remove a My library palette's color or fabric `i` (colors first, as the preview lists them). */
function removeSwatch(c: ColorCollection, i: number) {
  if (i < c.colors.length) return removeColor(c.id, i);
  const f = c.fabrics?.[i - c.colors.length];
  if (f) void update((l) => removeFabric(l, c.id, f.id));
}
/** Image files dropped on a My library palette: add them as fabrics (the import dialog first). */
const dropOn = ref<string | null>(null);
function dropImages(e: DragEvent, palette: string) {
  dropOn.value = null;
  const files = [...(e.dataTransfer?.files ?? [])];
  if (files.length) fabricDialog.value?.show({ files, palette });
}

async function copyMine(v: LibraryView, id: string) {
  const item = v.doc.items.find((i) => i.data.id === id);
  if (!item) return;
  // Copy what projects see (with its library attribution), so credits name the source.
  const stamped =
    item.type === 'block'
      ? { ...item, data: v.blocks.find((b) => b.id === id)! }
      : { ...item, data: v.collections.find((c) => c.id === id)! };
  const author = await askAuthor();
  await update((l) => copyToMine(l, stamped, author, DEFAULT_LICENSE));
  $q.notify({ type: 'positive', message: `Copied “${item.data.notecard.name}” to ${MY_LIBRARY}.` });
}

// --- Files ---
function exportBlock(b: Block) {
  void exportFile(
    b.notecard.name,
    serializeBlock(b, 'in', library.items.colors, me.value, socialsOut(settings.settings.socials)),
    'rrqbl',
  );
}
/** A palette file carries its fabric images (at the save size), so it opens anywhere. */
async function exportCollection(c: ColorCollection) {
  const fabrics = c.fabrics?.length
    ? await embedFabrics(c.fabrics, settings.settings.saveSize)
    : undefined;
  const out = fabrics ? { ...c, fabrics } : c;
  void exportFile(c.notecard.name, JSON.stringify(collectionFile(out, APP)), 'rrqplt');
}

const formatOf = (text: string): unknown => {
  try {
    return (JSON.parse(text) as { format?: unknown } | null)?.format;
  } catch {
    return undefined;
  }
};

async function importFile() {
  const file = await pickFile(['rrqlib', 'rrqplt']);
  if (!file) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (isZip(bytes)) return importZip(bytes);
  const text = new TextDecoder().decode(bytes);
  if (formatOf(text) === 'rrqplt') return importCollection(text);
  const r = parseLibrary(text);
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  if (r.doc.kind === 'personal') {
    restoring.value = {
      backup: markRaw(r.doc), // frozen documents: Vue mustn't proxy them
      skipped: r.skipped,
      mine: 'merge',
      packs: Object.fromEntries((r.doc.packs ?? []).map((p) => [p.id, 'keep' as const])),
    };
  } else installPack(r.doc, r.skipped);
}

/** A zipped library (spec 014): a backup restores; a library's packs are picked first. */
async function importZip(bytes: Uint8Array<ArrayBuffer>) {
  const busy = $q.notify({ message: 'Reading the library…', timeout: 0, spinner: true });
  try {
    const r = await readLibraryZip(bytes);
    busy();
    if (r.backup) {
      restoring.value = {
        backup: markRaw(r.backup),
        skipped: r.skipped,
        mine: 'merge',
        packs: Object.fromEntries((r.backup.packs ?? []).map((p) => [p.id, 'keep' as const])),
      };
      return;
    }
    // Installed packs identical to the file's: their images here compared with the file's.
    const checks = await r.imageCheck(
      r.packs
        .filter((p) => library.packs.some((x) => x.id === p.id && x.revision >= p.revision))
        .map((p) => p.id),
    );
    picking.value = {
      r: markRaw(r), // frozen packs: Vue mustn't proxy them
      checks,
      addLarger: true,
      useSmaller: false,
      chosen: [],
      filter: '',
    };
    // Updates and incomplete packs start ticked; new ones are the user's choice.
    picking.value.chosen = r.packs
      .filter((p) => ['update', 'missing'].includes(pickStatus(p)))
      .map((p) => p.id);
    if (r.packs.length === 1 && !r.index) {
      picking.value.chosen = [r.packs[0]!.id]; // a single pack: nothing to choose
      await installPicked();
    }
  } catch (e) {
    busy();
    $q.notify({ type: 'negative', message: e instanceof Error ? e.message : String(e) });
  }
}
const picking = ref<{
  r: ZippedLibrary;
  /** Installed packs the file has too: image sizes here and in the file, and images missing. */
  checks: Record<string, ImageCheck>;
  /** Packs here with smaller images than the file's: add the file's larger ones. */
  addLarger: boolean;
  /** Packs here with larger images than the file's: switch to the file's (frees space). */
  useSmaller: boolean;
  chosen: string[];
  filter: string | null;
  busy?: boolean;
} | null>(null);
/** The file names its repository: importing it connects the library. */
const pickConnects = computed(() => /^https:\/\//.test(picking.value?.r.index?.repository ?? ''));
/**
 * new; update (the file's is newer); missing (same, but images are missing here); off (complete
 * but switched off: ticking switches it on); have (complete and on: nothing to do).
 */
function pickStatus(p: LibraryDoc) {
  const have = library.packs.find((x) => x.id === p.id);
  if (!have) return 'new';
  if (have.revision < p.revision) return 'update';
  if (picking.value?.checks[p.id]?.holes) return 'missing';
  return packOn(p.id) ? 'have' : 'off';
}
function pickNote(p: LibraryDoc) {
  const n = picking.value?.checks[p.id]?.holes ?? 0;
  return {
    new: 'new',
    update: 'newer than yours',
    missing: `installed, ${n} image${n === 1 ? '' : 's'} missing`,
    off: 'installed, switched off',
    have: 'installed',
  }[pickStatus(p)];
}
const pickList = computed(() => {
  const q = picking.value?.filter?.trim().toLowerCase();
  const all = [...(picking.value?.r.packs ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  return q ? all.filter((p) => p.name.toLowerCase().includes(q)) : all;
});
function pickOne(id: string, on: boolean) {
  const pk = picking.value!;
  pk.chosen = on ? [...new Set([...pk.chosen, id])] : pk.chosen.filter((x) => x !== id);
}
/** Select all or none of the packs shown (complete ones need nothing). */
function pickAll(on: boolean) {
  for (const p of pickList.value) if (pickStatus(p) !== 'have') pickOne(p.id, on);
}
/** Installed packs whose images here are smaller, or larger, than the file's. */
const sizeDiff = (larger: boolean) =>
  Object.entries(picking.value?.checks ?? {})
    .filter(([, c]) => c.havePx && c.filePx && (larger ? c.filePx > c.havePx : c.filePx < c.havePx))
    .map(([id]) => id);
const largerPacks = computed(() => sizeDiff(true));
const smallerPacks = computed(() => sizeDiff(false));
const filePx = computed(() =>
  Math.max(0, ...Object.values(picking.value?.checks ?? {}).map((c) => c.filePx)),
);
const pickSomething = computed(() => {
  const pk = picking.value;
  return (
    !!pk &&
    (!!pk.chosen.length ||
      pickConnects.value ||
      (pk.addLarger && !!largerPacks.value.length) ||
      (pk.useSmaller && !!smallerPacks.value.length))
  );
});
const itemCount = (p: LibraryDoc) => {
  const n = p.items.reduce(
    (t, i) => t + (i.type === 'colors' ? i.data.colors.length + (i.data.fabrics?.length ?? 0) : 1),
    0,
  );
  return `${n} ${n === 1 ? 'item' : 'items'}`;
};
async function installPicked() {
  const pk = picking.value;
  if (!pk) return;
  pk.busy = true;
  try {
    // Counted before installing: afterwards every chosen pack is installed.
    const by = (st: string) =>
      pk.chosen.filter((id) => pk.r.packs.some((p) => p.id === id && pickStatus(p) === st)).length;
    const counts = { new: by('new'), update: by('update'), missing: by('missing'), off: by('off') };
    const larger = pk.addLarger ? largerPacks.value : [];
    const smaller = pk.useSmaller ? smallerPacks.value : [];
    const bad = await pk.r.storeImages([...new Set([...pk.chosen, ...larger, ...smaller])]);
    // Switching to the file's smaller images: the larger ones of those packs go.
    for (const id of smaller) {
      const max = pk.checks[id]!.filePx;
      const doc = pk.r.packs.find((p) => p.id === id)!;
      for (const i of doc.items)
        if (i.type === 'colors')
          for (const f of i.data.fabrics ?? [])
            for (const sz of f.sizes ?? []) if (sz.px > max) await deleteImage(sz.sha256);
    }
    const connected = await library.installFromFile(pk.r.index, pk.r.packs, pk.chosen);
    // Chosen packs are on, even ones switched off before.
    settings.settings.packsOff = settings.settings.packsOff.filter((id) => !pk.chosen.includes(id));
    if (counts.update) void library.freeImages(); // dropped fabrics' images, unless a project uses them
    retryMissing();
    picking.value = null;
    if (pk.r.index) showLibrary(pk.r.index.id);
    const n = (k: number, what: string) => `${k} pack${k === 1 ? '' : 's'} ${what}`;
    const done = [
      ...(counts.new ? [n(counts.new, 'added')] : []),
      ...(counts.update ? [n(counts.update, 'updated')] : []),
      ...(counts.missing ? [n(counts.missing, 'completed')] : []),
      ...(counts.off ? [n(counts.off, 'switched on')] : []),
      ...(larger.length ? [n(larger.length, 'given larger images')] : []),
      ...(smaller.length ? [n(smaller.length, 'switched to smaller images')] : []),
    ];
    const skipped = [...pk.r.skipped, ...bad];
    $q.notify({
      type: skipped.length ? 'warning' : 'positive',
      message:
        `${pk.r.library?.name ?? 'Library'}: ${done.join(', ') || 'nothing to add'}` +
        (connected ? '. Switch on more packs any time.' : '.') +
        (skipped.length ? ` Skipped: ${skipped.join('; ')}` : ''),
      timeout: skipped.length ? 0 : 4000,
      ...(skipped.length ? { actions: [{ label: 'OK', color: 'white' }] } : {}),
    });
  } catch (e) {
    pk.busy = false;
    $q.notify({ type: 'negative', message: e instanceof Error ? e.message : String(e) });
  }
}

async function importCollection(text: string) {
  const r = parseCollectionFile(text);
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  // Its fabric images go into this device's image store; the palette keeps references.
  const c = r.file.collection.fabrics?.length
    ? { ...r.file.collection, fabrics: await absorbFabrics(r.file.collection.fabrics) }
    : r.file.collection;
  const have = library.mine?.items.find((i) => i.data.id === c.id);
  const done = () => {
    select('mine');
    $q.notify({ type: 'positive', message: `Added “${c.notecard.name}” to ${MY_LIBRARY}.` });
  };
  if (!have) return void update((l) => putCollection(l, c)).then(done);
  if (have.data.version && have.data.version === c.version)
    return void $q.notify({ message: `“${c.notecard.name}” is already in ${MY_LIBRARY}.` });
  $q.dialog({
    title: `“${c.notecard.name}” is already in ${MY_LIBRARY}`,
    message: 'The file has another version of it.',
    cancel: { label: 'Keep both', flat: true, noCaps: true },
    ok: { label: 'Replace it', flat: true, noCaps: true },
  })
    .onOk(() => void update((l) => putCollection(l, c)).then(done))
    .onCancel(
      () => void update((l) => copyToMine(l, { type: 'colors', data: c }, me.value)).then(done),
    );
}

function installPack(doc: LibraryDoc, skipped: string[]) {
  if (doc.id === library.builtin?.id || doc.id === library.mine?.id)
    return void $q.notify({ type: 'negative', message: 'This pack’s id is already used here.' });
  const have = library.packs.find((p) => p.id === doc.id);
  const install = async () => {
    await library.savePack(doc);
    if (have) void library.freeImages(); // a newer version may have dropped fabrics
    select(doc.id);
    $q.notify({
      type: skipped.length ? 'warning' : 'positive',
      message: `Installed “${doc.name}”${skipped.length ? ` (${skipped.length} item(s) skipped: ${skipped.join('; ')})` : ''}.`,
      timeout: skipped.length ? 0 : 2500,
      ...(skipped.length ? { actions: [{ label: 'OK', color: 'white' }] } : {}),
    });
  };
  if (!have) return void install();
  if (doc.revision <= have.revision)
    return void $q.notify({
      message: `“${doc.name}” is already installed (revision ${have.revision}).`,
    });
  const notes = (doc.changelog ?? [])
    .filter((c) => c.revision > have.revision)
    .map((c) => `Revision ${c.revision} (${c.date}): ${c.notes}`);
  $q.dialog({
    title: `Update “${doc.name}” to revision ${doc.revision}?`,
    message: notes.length ? notes.join('\n') : 'No changelog provided.',
    style: 'white-space: pre-wrap',
    cancel: true,
    ok: { label: 'Update', flat: true },
  }).onOk(() => void install());
}

function removePack(doc: LibraryDoc) {
  $q.dialog({
    title: `Remove “${doc.name}”?`,
    message: 'Projects that use its items keep their copies.',
    cancel: true,
    ok: { label: 'Remove', color: 'negative', flat: true },
  }).onOk(() => {
    select('mine');
    void library.removePack(doc.id);
  });
}

const backingUp = ref<{ mine: boolean; packs: boolean } | null>(null);
async function backUp() {
  const b = backingUp.value!;
  backingUp.value = null;
  const busy = $q.notify({ message: 'Checking libraries on the web…', timeout: 0, spinner: true });
  // Every web library with packs here goes in as its address and index (so a restore brings it
  // back even when it can't be reached), listing the packs it can still serve. The others (private,
  // gone, offline) go in as copies with their images. On/off travels with them.
  const connections: BackupConnection[] = [];
  for (const c of library.connections) {
    const installed = library.packs.filter((p) => p.library?.id === c.index.id);
    if (!installed.length) continue;
    const live = await library.livePacks(c);
    connections.push({
      url: c.url,
      ...(c.ref ? { ref: c.ref } : {}),
      library: { id: c.index.id, name: c.index.name },
      packs: installed.filter((p) => live.has(p.id)).map((p) => p.id),
      index: c.index,
    });
  }
  busy();
  const doc = backupDoc(library.ensureMine(me.value), library.packs, b, {
    connections,
    packsOff: settings.settings.packsOff,
  });
  // With fabric images (spec 014), the backup is a zip of the document and its images.
  const zip = await writeLibraryZip(doc, (d) => serializeLibrary(d, APP));
  await exportFile('RRQuilts library backup', zip ?? serializeLibrary(doc, APP), 'rrqlib');
}

// --- Fabric images into My library (spec 014) ---
const fabricDialog = ref<InstanceType<typeof FabricImportDialog>>();
const myPalettes = computed(() =>
  (library.mine?.items ?? []).flatMap((i) =>
    i.type === 'colors' ? [{ id: i.data.id, name: i.data.notecard.name }] : [],
  ),
);
async function fabricsAdded(fabrics: Fabric[], palette?: { id: string } | { name: string }) {
  if (!palette) return;
  await update(async (l) => (await addFabrics(l, palette, fabrics, me.value)).lib);
  select('mine');
  $q.notify({
    type: 'positive',
    message: `Added ${fabrics.length} fabric${fabrics.length > 1 ? 's' : ''} to ${MY_LIBRARY}.`,
  });
}

const restoring = ref<{
  backup: LibraryBackup;
  skipped: string[];
  mine: 'merge' | 'replace';
  packs: Record<string, 'keep' | 'replace'>;
} | null>(null);
/** A backed-up web library: what comes from the web and what's in the file. */
function webLine(w: BackupConnection) {
  const n = (k: number) => `${k} pack${k === 1 ? '' : 's'}`;
  const inFile = (restoring.value?.backup.packs ?? []).filter(
    (p) => p.library?.id === w.library.id,
  );
  const parts = [
    ...(w.packs.length ? [`${n(w.packs.length)} to download`] : []),
    ...(inFile.length ? [`${n(inFile.length)} in this file`] : []),
  ];
  return `${w.library.name}${parts.length ? ` (${parts.join(', ')})` : ''}`;
}
const installedAgain = computed(() =>
  (restoring.value?.backup.packs ?? []).filter((p) => library.packs.some((x) => x.id === p.id)),
);
async function doRestore() {
  const r = restoring.value!;
  restoring.value = null;
  const next = restore({ mine: library.ensureMine(me.value), packs: library.packs }, r.backup, {
    mine: r.mine,
    packs: r.packs,
  });
  await library.saveMine(next.mine);
  for (const p of next.packs) if (!library.packs.includes(p)) await library.savePack(p);
  // Packs that were off stay off.
  if (r.backup.packsOff?.length)
    settings.settings.packsOff = [
      ...new Set([...settings.settings.packsOff, ...r.backup.packsOff]),
    ];
  // Web libraries: connect again and download their packs (images at this device's screen size).
  const failed: string[] = [];
  for (const w of r.backup.connections ?? []) {
    try {
      const c = await library.reconnect(w);
      for (const id of w.packs)
        if (!library.packs.some((p) => p.id === id) && c.index.packs.some((p) => p.id === id))
          await library.installFromRepo(c, id, settings.settings.imageSize);
    } catch {
      failed.push(w.library.name);
    }
  }
  void library.freeImages();
  retryMissing();
  select('mine');
  $q.notify(
    failed.length
      ? {
          type: 'warning',
          message: `Libraries restored, but ${failed.join(', ')} couldn't be reached. Add ${failed.length === 1 ? 'it' : 'them'} again with Add from the web when you're online.`,
          timeout: 0,
          actions: [{ label: 'OK', color: 'white' }],
        }
      : { type: 'positive', message: 'Libraries restored.' },
  );
}

// --- Make a pack ---
/** The Make a pack form (always there; `shareOpen` shows it). */
const share = reactive({
  name: '',
  description: '',
  author: '',
  license: DEFAULT_LICENSE,
  homepage: '',
  gallery: '',
  others: [] as { name: string; url: string }[],
  /** The My library items to include, by id. */
  only: [] as string[],
});
const shareOpen = ref(false);
/** Empty, or a web address (packs only carry http(s) links). */
const webOk = (u: string) => !u.trim() || /^https?:\/\/\S+$/.test(u.trim());
const shareLinksOk = computed(() =>
  [share.homepage, share.gallery, ...share.others.map((o) => o.url)].every(webOk),
);
/** My library's items, palettes then blocks, for picking what a pack holds. */
const shareItems = computed(() =>
  [...(library.mine?.items ?? [])]
    .sort(
      (a, b) =>
        a.type.localeCompare(b.type) || a.data.notecard.name.localeCompare(b.data.notecard.name),
    )
    .map((i) => ({
      id: i.data.id,
      name: i.data.notecard.name,
      kind: i.type === 'block' ? 'Block' : 'Palette',
    })),
);
const shareAll = () => shareItems.value.map((i) => i.id);
const licenseOptions = LICENSES.map((l) => ({ value: l.id, label: l.name, terms: l.terms }));
async function startShare() {
  const author = await askAuthor();
  Object.assign(share, {
    name: author ? `${author}'s library` : 'My pack',
    description: '',
    author,
    license: DEFAULT_LICENSE,
    homepage: '',
    gallery: '',
    others: [],
    only: shareAll(),
  });
  shareOpen.value = true;
}
/** The links typed, trimmed, without empty ones (none at all: no `links`). */
function shareLinks() {
  const others = share.others
    .map((o) => ({ name: o.name.trim() || o.url.trim(), url: o.url.trim() }))
    .filter((o) => o.url && webOk(o.url));
  const links = {
    ...(share.homepage.trim() && webOk(share.homepage) ? { homepage: share.homepage.trim() } : {}),
    ...(share.gallery.trim() && webOk(share.gallery) ? { gallery: share.gallery.trim() } : {}),
    ...(others.length ? { others } : {}),
  };
  return Object.keys(links).length ? { links } : {};
}
const shared = computed(() =>
  packDoc(library.mine ?? emptyPersonal(me.value), me.value, {
    name: share.name.trim(),
    description: share.description.trim(),
    author: share.author.trim(),
    socials: socialsOut(settings.settings.socials),
    license: share.license,
    only: share.only,
    ...shareLinks(),
  }),
);
function downloadPack() {
  const doc = shared.value.doc;
  shareOpen.value = false;
  void exportFile(doc.name, serializeLibrary(doc, APP), 'rrqlib');
}
</script>

<style scoped>
/* A card's place before it's built (when scrolled into view): about a card's height, so the page
   doesn't jump as cards appear. */
.card-slot:not(:has(.card)) {
  min-height: 189px;
}
.libs {
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
.libs.left {
  order: -1;
}
.lib-picker {
  border: 1px solid rgba(128, 128, 128, 0.4);
  margin: 0;
  padding: 0 0 4px;
}
.lib-actions .q-btn {
  justify-content: flex-start;
}
.lib-actions :deep(.q-btn__content) {
  justify-content: flex-start;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.lib-picker legend {
  margin-left: 8px;
  padding: 0 4px;
  font-size: 0.875rem;
}
/* About seven libraries show; more scroll. */
.lib-checks {
  max-height: calc(7.5 * 50px);
  overflow-y: auto;
  overflow-x: hidden;
}
/* Long library and pack names shorten with "…" (full name on hover) instead of widening the panel. */
.lib-picker,
.lib-checks,
.lib-checks > * {
  min-width: 0;
  max-width: 100%;
}
.lib-checks :deep(.q-item__section--main),
.lib-checks :deep(.q-item__label) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* A very slight line between libraries. */
.lib-checks > * + * {
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}
.lib-checks .q-checkbox {
  min-height: 50px;
}
.lib-group + .lib-group:not(.in-lib) {
  border-top: 1px solid rgba(128, 128, 128, 0.3);
  padding-top: 12px;
}

@media (max-width: 1023px) {
  .row.no-wrap-md {
    flex-direction: column;
  }
  /* Phones and portrait tablets: the sidebar flies over the page, like the editors'. */
  .libs {
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
  .libs.left {
    right: auto;
    left: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  }
  :global(.body--dark .libs) {
    background: var(--q-dark-page);
  }
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.card {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 8px;
  min-width: 0;
}
/* Headings: page h1, library h2, Blocks/Palettes and categories h3. */
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
.page-title,
.lib-name,
.sub-title {
  margin: 0;
  line-height: 1.3;
  letter-spacing: normal;
}
.page-title {
  font-size: 1.6rem;
  font-weight: 500;
}
.lib-name {
  font-size: 1.4rem;
  font-weight: 600;
}
.sub-title {
  font-size: 1.25rem;
  font-weight: 600;
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
.collection {
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 2px 6px 6px;
  margin: 0;
  min-width: 0;
}
.collection.drop-target {
  border-color: var(--q-primary);
  box-shadow: inset 0 0 0 1px var(--q-primary);
}
.collection legend {
  padding: 0 4px;
  max-width: 80%;
}
.strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 30px;
  color: inherit;
  text-align: left;
  gap: 2px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}
.chip {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.chip.big {
  width: 32px;
  height: 32px;
}
.skin {
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
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
.just-added {
  border-radius: 6px;
  animation: just-added 1.5s ease-in-out 3;
}
@keyframes just-added {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    box-shadow:
      inset 0 0 0 2px var(--q-primary),
      inset 0 0 12px 2px var(--q-primary);
  }
}
@media (prefers-reduced-motion: reduce) {
  .just-added {
    animation: none;
    box-shadow: inset 0 0 0 2px var(--q-primary);
  }
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
/* A library's web page: a small globe beside its name. */
.lib-web {
  display: inline-flex;
  flex: none;
  color: var(--q-primary);
  font-size: 16px;
}
.pack-link {
  color: inherit;
  text-decoration: none;
  min-width: 0;
  flex: 1 1 auto;
}
.pack-link:hover {
  text-decoration: underline;
}
</style>
