import type { MediaSlot } from "@/types/admin-product-media";

const PRODUCT_PHOTO_SLOTS = new Set<MediaSlot>(["primary", "gallery"]);

export function shouldTrimProductPhotoSlot(slot: MediaSlot): boolean {
  return PRODUCT_PHOTO_SLOTS.has(slot);
}
