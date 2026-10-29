<template>
  <div class="fit" @dragover.prevent @drop.prevent="onDrop">
    <MainLayout />
    <VersionDialog />
    <UpdateDialog />
    <!-- "View grayscale": each color becomes the gray of the same luminance (Rec. 709 weights in
         linear light), so equal grays mean equal values. CSS grayscale() mixes gamma-encoded
         values and makes saturated blues and reds read too dark. -->
    <svg width="0" height="0" style="position: absolute" aria-hidden="true">
      <filter id="rrq-gray" color-interpolation-filters="linearRGB">
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
        />
      </filter>
    </svg>
  </div>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
import VersionDialog from '@/components/VersionDialog.vue';
import UpdateDialog from '@/components/UpdateDialog.vue';
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
