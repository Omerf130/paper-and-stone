import type { ProductMediaType } from "@/types/product-media";

export const MEDIA_SLOTS = ["primary", "gallery", "technical"] as const;

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
};

export type AdminProductMediaView = {
  productId: string;
  productNameHe: string;
  primaryImage: AdminMediaItemView | null;
  gallery: AdminMediaItemView[];
  technicalDrawing: AdminMediaItemView | null;
};

export type MediaUploadClientPayload = {
  slot: MediaSlot;
  altText?: string;
};

export type MediaUploadTokenPayload = MediaUploadClientPayload & {
  productId: string;
};
