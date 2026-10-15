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
    <div class="row items-center q-mb-md" style="gap: 8px">
      <q-btn outline no-caps icon="upload_file" label="Import" @click="importFile">
        <q-tooltip>A backup or pack (.rrqlib), or a palette (.rrqplt)</q-tooltip>
      </q-btn>
      <q-btn
        outline
        no-caps
        icon="cloud_download"
        label="Add from the web…"
        @click="Object.assign(adding, { open: true, url: '', ref: '', busy: false })"
      >
        <q-tooltip>Connect a library repository by its web address</q-tooltip>
      </q-btn>
      <q-btn outline no-caps icon="save" label="Back up…" @click="backingUp = { ...ALL }" />
      <q-btn
        v-if="!library.mine"
        outline
        no-caps
        icon="palette"
        label="New palette…"
        @click="newPalette()"
      />
      <q-btn outline no-caps icon="add_photo_alternate" label="Add fabrics…" @click="addFabricsTo">
        <q-tooltip>Fabric images (files, a folder, or a zip) into one of your palettes</q-tooltip>
      </q-btn>
      <q-btn
        outline
        no-caps
        icon="share"
        label="Share as pack…"
        :disable="!library.mine?.items.length"
        @click="startShare"
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
        <div class="row items-center no-wrap" style="gap: 4px">
          <q-input
            v-model="search"
            dense
            outlined
            clearable
            placeholder="Search names, notes"
            class="col"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <q-btn
            v-if="$q.screen.lt.md"
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
          <div
            v-if="collapse.isOpen('sidebar:libraries')"
            class="lib-checks column no-wrap q-px-sm"
          >
            <template v-for="g in libGroups" :key="g.key">
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
                  <a
                    href="#"
                    class="pack-link ellipsis block"
                    :class="{ 'text-grey-6': !packOn(g.view.doc.id) }"
                    @click.prevent="select(g.view.doc.id)"
                    >{{ g.view.doc.name }}</a
                  >
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
                :model-value="!collapsed.includes(g.key)"
                @update:model-value="(o: boolean) => setCollapsed(g.key, !o)"
                :class="{ 'just-added': justAdded === g.key }"
                :label="g.name"
                :caption="`${g.packs.filter((p) => p.view && packOn(p.id)).length} of ${g.packs.length} packs on`"
                header-class="q-px-xs"
              >
                <!-- Libraries with many packs: find one by name. -->
                <q-input
                  v-if="g.packs.length > 8"
                  v-model="packQuery[g.key]"
                  dense
                  borderless
                  clearable
                  placeholder="Find a pack"
                  class="q-px-xs"
                >
                  <template #prepend><q-icon name="search" size="xs" /></template>
                </q-input>
                <div v-if="!shownPacks(g).length" class="text-caption text-grey-7 q-px-xs">
                  No packs match.
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
                <div v-if="g.connection" class="row q-py-xs" style="gap: 4px">
                  <q-btn
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
                    icon="link_off"
                    label="Disconnect"
                    @click="disconnect(g.connection)"
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
        </fieldset>
        <SlidePicker v-model="settings.settings.libraryType" :options="TYPE_OPTIONS" label="Type" />
        <template v-for="f in filterFields" :key="f.key">
          <q-select
            v-if="f.options.length"
            v-model="filters[f.key]"
            :options="f.options.filter((o) => o.label.toLowerCase().includes(needle[f.key]))"
            :label="f.label"
            dense
            outlined
            multiple
            use-chips
            use-input
            input-debounce="0"
            emit-value
            map-options
            clearable
            @clear="filters[f.key] = []"
            @filter="
              (v: string, done: (fn: () => void) => void) =>
                done(() => (needle[f.key] = v.toLowerCase()))
            "
          >
            <template #option="{ itemProps, opt, selected }">
              <q-item v-bind="itemProps" dense>
                <q-item-section side>
                  <q-checkbox :model-value="selected" dense class="no-pointer-events" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </template>
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
        <div v-if="!mineCount && !filtering" class="text-grey-7 q-pa-md" style="max-width: 560px">
          Your own blocks and palettes, available in every project on this device. Add a block from
          a project's Blocks tab (<b>Add to my library</b>), save colors from its Palettes tab (<b
            >Save to my library</b
          >), or import a backup.
        </div>
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

            <BlockSections
              v-if="g.blocks.length && libOpen(g)"
              :sections="g.sections"
              :lib="g.v.doc.id"
              title="Blocks"
            >
              <template #default="{ block: b }">
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
                            <q-item v-close-popup clickable @click="rename(b.id, b.notecard.name)">
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
              </template>
            </BlockSections>

            <div
              v-if="
                libOpen(g) &&
                (g.collections.length || g.mine) &&
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
                flat
                dense
                no-caps
                size="sm"
                icon="add"
                label="New palette"
                @click="newPalette()"
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
          @add="startColor(previewCollection!.id)"
          @edit="(i) => startColor(previewCollection!.id, i)"
          @remove="(i) => removeColor(previewCollection!.id, i)"
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
            From the web, downloaded again:
            {{
              restoring.backup.connections
                .map(
                  (w) =>
                    `${w.library.name} (${w.packs.length} pack${w.packs.length === 1 ? '' : 's'})`,
                )
                .join(', ')
            }}
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
    <q-dialog :model-value="!!sharing" @update:model-value="sharing = null">
      <q-card v-if="sharing && shared" style="width: 480px; max-width: 95vw">
        <q-card-section class="text-h6">Share as pack</q-card-section>
        <q-card-section class="column" style="gap: 8px">
          <q-input v-model="sharing.name" dense outlined label="Name" />
          <q-input
            v-model="sharing.description"
            dense
            outlined
            type="textarea"
            autogrow
            label="Description"
          />
          <q-input v-model="sharing.author" dense outlined label="Author" />
          <q-select
            v-model="sharing.license"
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
            :disable="!sharing.name.trim() || !shared.doc.items.length"
            @click="downloadPack"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Add a library from the web -->
    <q-dialog v-model="adding.open">
      <q-card style="width: 480px; max-width: 90vw">
        <q-card-section class="text-h6">Add a library from the web</q-card-section>
        <q-card-section class="column" style="gap: 8px">
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
import { roundLen } from '@/model/units';
import ColorEditor from '@/components/ColorEditor.vue';
import HelpLink from '@/components/HelpLink.vue';
import SlidePicker from '@/components/SlidePicker.vue';
import FullName from '@/components/FullName.vue';
import { useAskCategory } from '@/composables/category';
// Libraries (spec 011): browse every library; manage My library; back up, restore, share, import.
import { useQuasar } from 'quasar';
import { computed, defineComponent, h, nextTick, reactive, ref, watch } from 'vue';
import { useAuthor } from '@/composables/author';
import { serializeBlock } from '@/model/block-file';
import { collectionFile, parseCollectionFile } from '@/model/collection-file';
import { DEFAULT_LICENSE, LICENSES, authorOf, licenseName, priorCredits } from '@/model/credits';
import {
  MY_LIBRARY,
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
} from '@/model/library';
import { backupDoc, packDoc, parseLibrary, restore, serializeLibrary } from '@/model/library-file';
import { createProject } from '@/model/new-project';
import type { Block } from '@/model/schema/block';
import type {
  ColorCollection,
  LibraryBackup,
  LibraryDoc,
  LibraryItem,
} from '@/model/schema/library';
import type { Color } from '@/model/schema/palette';
import { blockThumbnail } from '@/render/thumbnail';
import { exportFile, pickFile } from '@/storage/files';
import { isZip, readLibraryZip, writeLibraryZip } from '@/storage/library-zip';
import FabricImportDialog from '@/components/FabricImportDialog.vue';
import PalettePreview from '@/components/PalettePreview.vue';
import PaletteTitle from '@/components/PaletteTitle.vue';
import type { Fabric } from '@/model/schema/palette';
import { retryMissing, swatchStyle } from '@/render/fabric-images';
import { useLibraryStore } from '@/stores/library';
import { useProjectStore } from '@/stores/project';
import { useRouter } from 'vue-router';
import { paintsUsed, replaceColors } from '@/editor/colors';
import { fabricPaint } from '@/editor/paint';
import { coloringSections } from '@/model/library-items';
import type { Connection } from '@/storage/repositories';
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
}
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
  // My library first, then other libraries by name, then the built-in one.
  const name = (g: (typeof out)[number]) => (g.packs ? g.name : g.view.doc.name);
  const rank = (g: (typeof out)[number]) =>
    g.packs ? 1 : g.view.doc.kind === 'personal' ? 0 : g.view.doc === library.builtin ? 2 : 1;
  out.sort((a, b) => rank(a) - rank(b) || name(a).localeCompare(name(b)));
  return out;
});
/** The sidebar's pack search, per library. */
const packQuery = reactive<Record<string, string | null>>({});
const shownPacks = (g: PackGroup) => {
  const q = packQuery[g.key]?.trim().toLowerCase();
  return q ? g.packs.filter((p) => p.name.toLowerCase().includes(q)) : g.packs;
};
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
const adding = reactive({ open: false, url: '', ref: '', busy: false });
async function connectLibrary() {
  const a = adding;
  if (!a.url.trim()) return;
  a.busy = true;
  try {
    const c = await library.connect(a.url, a.ref.trim() || undefined);
    Object.assign(a, { open: false, busy: false });
    // Show where it went: open the side panel, glow around the new library for a few seconds.
    filtersOpen.value = true;
    justAdded.value = `lib:${c.index.id}`;
    setCollapsed(justAdded.value, false);
    void nextTick(() =>
      document
        .querySelector('.just-added')
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
    );
    setTimeout(() => (justAdded.value = null), 4500);
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
function disconnect(c: Connection) {
  $q.dialog({
    title: `Disconnect ${c.index.name}?`,
    message: 'Its downloaded packs are removed from this device. Projects keep the items they use.',
    cancel: true,
    ok: { label: 'Disconnect', color: 'negative', flat: true },
  }).onOk(() => void library.disconnect(c));
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
/** Selected values per filter; empty = any. Category '' = uncategorized. */
const filters = reactive({
  cats: [] as string[],
  tags: [] as string[],
  styles: [] as string[],
});
/** What's typed in each dropdown to narrow its options. */
const needle = reactive({ cats: '', tags: '', styles: '' });
const filtering = computed(
  // The Type picker is a view choice, not a filter (it always has a value).
  () =>
    !!search.value ||
    !!hiddenLibs.value.length ||
    [filters.cats, filters.tags, filters.styles].some((f) => f.length),
);
const inScope = computed(() =>
  library.allViews.filter((v) => !hiddenLibs.value.includes(v.doc.id)),
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
  anyOf(filters.styles, i.data.notecard.styles ?? []);
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
  const v = await askCategory('Category', item?.category ?? '');
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
function exportCollection(c: ColorCollection) {
  void exportFile(c.notecard.name, JSON.stringify(collectionFile(c, APP)), 'rrqplt');
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
      backup: r.doc,
      skipped: r.skipped,
      mine: 'merge',
      packs: Object.fromEntries((r.doc.packs ?? []).map((p) => [p.id, 'keep' as const])),
    };
  } else installPack(r.doc, r.skipped);
}

/** A zipped library (spec 014): every pack in it, new or newer, installed at once. */
async function importZip(bytes: Uint8Array<ArrayBuffer>) {
  const busy = $q.notify({ message: 'Reading the library…', timeout: 0, spinner: true });
  try {
    const r = await readLibraryZip(bytes);
    if (r.backup) {
      busy();
      restoring.value = {
        backup: r.backup,
        skipped: r.skipped,
        mine: 'merge',
        packs: Object.fromEntries((r.backup.packs ?? []).map((p) => [p.id, 'keep' as const])),
      };
      return;
    }
    let added = 0;
    let updated = 0;
    for (const p of r.packs) {
      const have = library.packs.find((x) => x.id === p.id);
      if (have && have.revision >= p.revision) continue;
      await library.savePack(p);
      if (have) updated++;
      else added++;
    }
    if (updated) void library.freeImages(); // dropped fabrics' images, unless a project uses them
    retryMissing();
    busy();
    $q.notify({
      type: r.skipped.length ? 'warning' : 'positive',
      message:
        `${r.library?.name ?? 'Library'}: ${added} pack${added === 1 ? '' : 's'} added` +
        (updated ? `, ${updated} updated` : '') +
        (r.skipped.length ? `. Skipped: ${r.skipped.join('; ')}` : '.'),
      timeout: r.skipped.length ? 0 : 3000,
      ...(r.skipped.length ? { actions: [{ label: 'OK', color: 'white' }] } : {}),
    });
  } catch (e) {
    busy();
    $q.notify({ type: 'negative', message: e instanceof Error ? e.message : String(e) });
  }
}

function importCollection(text: string) {
  const r = parseCollectionFile(text);
  if (!r.ok) return void $q.notify({ type: 'negative', message: r.error });
  const c = r.file.collection;
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
function backUp() {
  const b = backingUp.value!;
  backingUp.value = null;
  // Web libraries go in as their address and installed packs; on/off travels with the packs.
  const connections = library.connections.flatMap((c) => {
    const packs = library.packs.filter((p) => p.library?.id === c.index.id).map((p) => p.id);
    return packs.length
      ? [
          {
            url: c.url,
            ...(c.ref ? { ref: c.ref } : {}),
            library: { id: c.index.id, name: c.index.name },
            packs,
          },
        ]
      : [];
  });
  const doc = backupDoc(library.ensureMine(me.value), library.packs, b, {
    connections,
    packsOff: settings.settings.packsOff,
  });
  // With fabric images (spec 014), the backup is a zip of the document and its images.
  void writeLibraryZip(doc, (d) => serializeLibrary(d, APP)).then((zip) =>
    exportFile('RRQuilts library backup', zip ?? serializeLibrary(doc, APP), 'rrqlib'),
  );
}

// --- Fabric images into My library (spec 014) ---
const fabricDialog = ref<InstanceType<typeof FabricImportDialog>>();
const myPalettes = computed(() =>
  (library.mine?.items ?? []).flatMap((i) =>
    i.type === 'colors' ? [{ id: i.data.id, name: i.data.notecard.name }] : [],
  ),
);
function addFabricsTo() {
  fabricDialog.value?.show();
}
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
      const c =
        library.connections.find((x) => x.index.id === w.library.id) ??
        (await library.connect(w.url, w.ref));
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

// --- Share as pack ---
const sharing = ref<{ name: string; description: string; author: string; license: string } | null>(
  null,
);
const licenseOptions = LICENSES.map((l) => ({ value: l.id, label: l.name, terms: l.terms }));
async function startShare() {
  const author = await askAuthor();
  sharing.value = {
    name: author ? `${author}'s library` : 'My pack',
    description: '',
    author,
    license: DEFAULT_LICENSE,
  };
}
const shared = computed(() =>
  sharing.value && library.mine
    ? packDoc(library.mine, me.value, {
        name: sharing.value.name.trim(),
        description: sharing.value.description.trim(),
        author: sharing.value.author.trim(),
        socials: socialsOut(settings.settings.socials),
        license: sharing.value.license,
      })
    : null,
);
function downloadPack() {
  const doc = shared.value!.doc;
  sharing.value = null;
  void exportFile(doc.name, serializeLibrary(doc, APP), 'rrqlib');
}
</script>

<style scoped>
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
.lib-picker legend {
  margin-left: 8px;
  padding: 0 4px;
  font-size: 0.875rem;
}
/* At most five libraries show; more scroll. */
.lib-checks {
  max-height: calc(5 * 50px);
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
.collection legend {
  padding: 0 4px;
  max-width: 80%;
}
.strip {
  display: flex;
  flex-wrap: wrap;
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
