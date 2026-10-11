<template>
  <div class="fit" @dragover.prevent @drop.prevent="onDrop">
    <MainLayout />
    <RestoreDrafts />
    <VersionDialog />
  </div>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
import RestoreDrafts from '@/components/RestoreDrafts.vue';
import VersionDialog from '@/components/VersionDialog.vue';
import { useOpenProject } from '@/composables/open-project';
import { useProjectStore } from '@/stores/project';

const project = useProjectStore();
const { openWith } = useOpenProject();

/** Drop a .rrq file anywhere to open it. */
async function onDrop(e: DragEvent) {
  const item = [...(e.dataTransfer?.items ?? [])].find((i) => i.kind === 'file');
  const file = item?.getAsFile();
  if (!file?.name.toLowerCase().endsWith('.rrq')) return;
  // Chrome/Edge give a file handle so saves go back to the same file.
  const handle = (await (
    item as DataTransferItem & { getAsFileSystemHandle?: () => Promise<FileSystemHandle | null> }
  )
    .getAsFileSystemHandle?.()
    .catch(() => null)) as FileSystemFileHandle | null | undefined;
  await openWith(() => project.openFile({ file, ...(handle?.kind === 'file' ? { handle } : {}) }));
}
</script>
