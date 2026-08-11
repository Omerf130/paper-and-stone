import type { MaterialType } from "@/types/material";

export type AdminColorOption = {
  id: string;
  nameHe: string;
  hex: string;
  isActive: boolean;
};

export type AdminMaterialListItem = {
  id: string;
  nameHe: string;
  nameEn?: string;
  code?: string;
  type: MaterialType;
  colorCount: number;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AdminMaterialFormInput = {
  nameHe: string;
  nameEn: string;
  code: string;
  type: MaterialType;
  sortOrder: string;
  isActive: boolean;
  colorIds: string[];
};

export type MaterialFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export const EMPTY_MATERIAL_FORM: AdminMaterialFormInput = {
  nameHe: "",
  nameEn: "",
  code: "",
  type: "FABRIC",
  sortOrder: "0",
  isActive: true,
  colorIds: [],
};
