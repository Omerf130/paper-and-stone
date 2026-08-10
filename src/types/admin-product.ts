import { VISUAL_TONES, type VisualTone } from "@/types/product";

export type CategoryOption = {
  id: string;
  nameHe: string;
};

export type AdminProductListItem = {
  id: string;
  nameHe: string;
  sku: string;
  categoryName: string;
  isActive: boolean;
  isFeatured: boolean;
  updatedAt: string;
};

export type AdminDashboardStats = {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  activeCategories: number;
};

export type ProductFabricInput = {
  key: string;
  label: string;
  colors: ProductColorInput[];
};

export type ProductColorInput = {
  key: string;
  label: string;
  visualTone: VisualTone;
};

export type ProductSizeInput = {
  key: string;
  label: string;
};

export type AdminProductFormInput = {
  nameHe: string;
  nameEn: string;
  slug: string;
  sku: string;
  categoryId: string;
  brand: string;
  designer: string;
  shortDescription: string;
  longDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  width: string;
  depth: string;
  height: string;
  seatHeight: string;
  materials: string[];
  maintenance: string;
  warranty: string;
  countryOfOrigin: string;
  fabrics: ProductFabricInput[];
  sizes: ProductSizeInput[];
};

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export const EMPTY_PRODUCT_FORM: AdminProductFormInput = {
  nameHe: "",
  nameEn: "",
  slug: "",
  sku: "",
  categoryId: "",
  brand: "",
  designer: "",
  shortDescription: "",
  longDescription: "",
  isActive: true,
  isFeatured: false,
  width: "",
  depth: "",
  height: "",
  seatHeight: "",
  materials: [],
  maintenance: "",
  warranty: "",
  countryOfOrigin: "",
  fabrics: [],
  sizes: [],
};

export { VISUAL_TONES };
