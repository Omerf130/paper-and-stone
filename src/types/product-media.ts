export const PRODUCT_MEDIA_TYPES = [
  "PRODUCT_IMAGE",
  "TECHNICAL_DRAWING",
  "RECOLOR_MASK",
] as const;

export type ProductMediaType = (typeof PRODUCT_MEDIA_TYPES)[number];

export type PublicImageView = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ProductMediaItem = {
  storageKey: string;
  url: string;
  mediaType: ProductMediaType;
  mimeType: string;
  originalFilename: string;
  byteSize: number;
  width?: number;
  height?: number;
  altText?: string;
  sortOrder: number;
  createdAt: Date;
};

export type ProductMedia = {
  primaryImage?: ProductMediaItem;
  gallery: ProductMediaItem[];
  technicalDrawing?: ProductMediaItem;
  recolorMask?: ProductMediaItem;
};

export type PublicRecolorMaskView = {
  url: string;
  width?: number;
  height?: number;
};

export type ProductRecolorView = {
  enabled: boolean;
  sourceImage: PublicImageView;
  mask: PublicRecolorMaskView;
};

export const EMPTY_PRODUCT_MEDIA: ProductMedia = {
  gallery: [],
};
