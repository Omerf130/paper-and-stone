import type { ProductMaterialOptionInput } from "@/lib/products/material-options/product-material-option-input";

export type CategoryOption = {
  id: string;
  nameHe: string;
  isActive?: boolean;
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
  materialOptions: ProductMaterialOptionInput[];
  sizes: ProductSizeInput[];
  defaultInternalCostShekels: string;
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
  materialOptions: [],
  sizes: [],
  defaultInternalCostShekels: "",
};

export type { ProductMaterialOptionInput };
