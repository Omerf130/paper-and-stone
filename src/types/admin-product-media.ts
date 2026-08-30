import type { ProductMediaType } from "@/types/product-media";
import type { ProductRecolorConfig } from "@/types/product-recolor";

export const MEDIA_SLOTS = [
  "primary",
  "gallery",
  "technical",
  "recolor-mask",
] as const;

export type MediaSlot = (typeof MEDIA_SLOTS)[number];

export type AdminMediaItemView = {
  id: string;
  storageKey: string;
  url: string;
  mediaType: ProductMediaType;
  mimeType: string;
  originalFilename: string;
  byteSize: number;
  altText: string;
  sortOrder: number;
  createdAt: string;
  width?: number;
  height?: number;
  normalized?: boolean;
};

export type AdminProductMediaView = {
  productId: string;
  productNameHe: string;
  primaryImage: AdminMediaItemView | null;
  gallery: AdminMediaItemView[];
  technicalDrawing: AdminMediaItemView | null;
  recolorMask: AdminMediaItemView | null;
  recolorConfig: ProductRecolorConfig;
};

export type MediaUploadClientPayload = {
  slot: MediaSlot;
  altText?: string;
  width?: number;
  height?: number;
  normalized?: boolean;
  byteSize?: number;
};

export type MediaUploadTokenPayload = MediaUploadClientPayload & {
  productId: string;
};
