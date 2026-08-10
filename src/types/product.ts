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

export type ProductColorView = {
  id: string;
  label: string;
  tone: VisualTone;
};

export type ProductFabricView = {
  id: string;
  label: string;
  colors: ProductColorView[];
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
  fabrics: ProductFabricView[];
  sizes: ProductSizeView[];
};

export function isVisualTone(value: string | undefined): value is VisualTone {
  return VISUAL_TONES.includes(value as VisualTone);
}
