import type { MediaSlot } from "@/types/admin-product-media";
import type { ProductMediaType } from "@/types/product-media";

const PRODUCT_PHOTO_SLOTS = new Set<MediaSlot>(["primary", "gallery"]);

export function shouldNormalizeMediaSlot(slot: MediaSlot): boolean {
  return PRODUCT_PHOTO_SLOTS.has(slot);
}

export function shouldNormalizeMediaType(mediaType: ProductMediaType): boolean {
  return mediaType === "PRODUCT_IMAGE";
}
