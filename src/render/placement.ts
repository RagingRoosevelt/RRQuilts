// Where a placed block's design space lands in the quilt.
import type { Slot } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { SlotContent } from '@/model/schema/quilt';
import { mul, orient, scale, type M } from './affine';

/** Block design units (0…w, 0…h) → quilt units. */
export const placementMatrix = (slot: Slot, content: SlotContent, block: Block): M =>
  mul(
    mul(slot.transform, orient(content.rotation, content.flip)),
    scale(1 / block.size[0], 1 / block.size[1]),
  );
