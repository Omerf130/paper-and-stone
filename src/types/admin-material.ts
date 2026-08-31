import type { MaterialVariantInput } from "@/types/material-variant";

export type AdminMaterialVariantOption = {
  id: string;
  name: string;
  hex?: string;
  swatchImageUrl?: string;
  isActive: boolean;
};

/** @deprecated Use AdminMaterialVariantOption */
export type AdminColorOption = AdminMaterialVariantOption;

export type MaterialTypeOption = {
  key: string;
  labelEn: string;
};

export type AdminMaterialListItem = {
  id: string;
  nameEn: string;
  code?: string;
  type: string;
  variantCount: number;
  isActive: boolean;
  updatedAt: string;
};

export type AdminMaterialFormInput = {
  nameEn: string;
  code: string;
  type: string;
  isActive: boolean;
  variants: MaterialVariantInput[];
};

export type MaterialFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export const EMPTY_MATERIAL_FORM: AdminMaterialFormInput = {
  nameEn: "",
  code: "",
  type: "FABRIC",
  isActive: true,
  variants: [],
};

export type AdminMaterialProductLink = {
  productId: string;
  nameHe: string;
  sku: string;
  allowedVariantIds: string[];
  categoryName?: string;
  isActive: boolean;
  thumbnailUrl?: string;
};
