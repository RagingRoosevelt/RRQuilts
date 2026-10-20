// Where a placed block's design space lands in the quilt.
import type { Slot } from '@/model/layout/slots';
import type { Block } from '@/model/schema/block';
import type { SlotContent } from '@/model/schema/quilt';
import { shapeOrient } from '@/model/blocks/shape';
import { mul, orient, scale, type M } from './affine';

/** A placement's turn and flip in the block's unit square (shaped blocks turn about their center). */
export const orientation = (content: SlotContent, block: Block): M =>
  block.shape
    ? shapeOrient(block.shape, content.rotation, content.flip)
    : orient(content.rotation as 0 | 90 | 180 | 270, content.flip);

/** Block design units (0…w, 0…h) → quilt units. */
export const placementMatrix = (slot: Slot, content: SlotContent, block: Block): M =>
  mul(
    mul(slot.transform, orientation(content, block)),
    scale(1 / block.size[0], 1 / block.size[1]),
  );
