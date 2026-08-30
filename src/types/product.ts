import type { ProductRecolorView, PublicImageView } from "@/types/product-media";
import type { PublicProductDocumentView } from "@/types/product-document";

export type VisualTone =
  | "blue"
  | "mustard"
  | "gray"
  | "natural"
  | "stone"
  | "sage";

export const VISUAL_TONES: VisualTone[] = [
  "blue",
  "mustard",
  "gray",
  "natural",
  "stone",
  "sage",
];

export type ProductMaterialColorView = {
  id: string;
  name: string;
  hex: string;
};

export type ProductMaterialOptionView = {
  materialId: string;
  materialName: string;
  materialType: string;
  colors: ProductMaterialColorView[];
};

export type ProductSizeView = {
  id: string;
  label: string;
};

export type ProductDimensionsView = {
  width?: number;
  depth?: number;
  height?: number;
  seatHeight?: number;
};

export type ProductView = {
  slug: string;
  name: string;
  nameHe: string;
  brand: string;
  designer: string;
  sku: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  dimensions: ProductDimensionsView;
  materials: string[];
  maintenance: string;
  warranty: string;
  countryOfOrigin: string;
  materialOptions: ProductMaterialOptionView[];
  sizes: ProductSizeView[];
  primaryImage: PublicImageView | null;
  gallery: PublicImageView[];
  technicalDrawing: PublicImageView | null;
  recolor: ProductRecolorView | null;
  documents: PublicProductDocumentView[];
};

export function isVisualTone(value: string | undefined): value is VisualTone {
  return VISUAL_TONES.includes(value as VisualTone);
}
