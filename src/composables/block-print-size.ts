// A block's size for printing (spec 010) and 3D templates (spec 027): as used in a quilt (counts
// from that quilt), its own, or custom. `active` false: no block (other print kinds). `doc`: where
// the block is (a library block opens in a view of its library); quilts are the open project's.
import { computed, ref } from 'vue';
import { generateFor } from '@/model/layout/slots';
import { fmtLen } from '@/model/print/format';
import type { RrqDoc } from '@/model/schema/project';
import { useProjectStore } from '@/stores/project';

export function useBlockPrintSize(
  blockId: () => string,
  active: () => boolean = () => true,
  doc: () => RrqDoc | null | undefined = () => undefined,
) {
  const project = useProjectStore();
  const units = computed(() => (doc() ?? project.doc)?.units ?? 'in');
  const block = computed(() =>
    (doc() ?? project.doc)?.project.blocks.find((b) => b.id === blockId()),
  );
  const fmtSize = (s: [number, number]) =>
    `${fmtLen(s[0], units.value)} × ${fmtLen(s[1], units.value)}`;
  const quiltSizes = computed(() =>
    (active() ? (project.doc?.project.quilts ?? []) : []).flatMap((q) => {
      const slot = generateFor(q).slots.find((s) => q.layers[0].slots[s.id]?.block === blockId());
      return slot ? [{ quilt: q, size: slot.size }] : [];
    }),
  );
  const sizeOptions = computed(() => [
    ...quiltSizes.value.map((u) => ({
      value: `quilt:${u.quilt.id}`,
      label: `As in “${u.quilt.notecard.name}” (${fmtSize(u.size)})`,
    })),
    ...(block.value ? [{ value: 'own', label: `Block size (${fmtSize(block.value.size)})` }] : []),
    { value: 'custom', label: 'Custom size' },
  ]);
  const sizeSource = ref(sizeOptions.value[0]!.value);
  const custom = ref<[number, number]>(block.value ? [...block.value.size] : [10, 10]);
  const fromQuilt = computed(() =>
    quiltSizes.value.find((u) => `quilt:${u.quilt.id}` === sizeSource.value),
  );
  /** The chosen size (a quilt's: the block's space in it). */
  const size = computed<[number, number]>(() =>
    fromQuilt.value
      ? fromQuilt.value.size
      : sizeSource.value === 'custom' || !block.value
        ? custom.value
        : block.value.size,
  );
  return { units, block, sizeOptions, sizeSource, custom, fromQuilt, size };
}
