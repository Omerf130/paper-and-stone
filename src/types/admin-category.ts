export type AdminCategoryListItem = {
  id: string;
  nameHe: string;
  nameEn?: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  updatedAt: string;
};

export type AdminCategoryFormInput = {
  nameHe: string;
  nameEn: string;
  slug: string;
  sortOrder: string;
  isActive: boolean;
};

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export const EMPTY_CATEGORY_FORM: AdminCategoryFormInput = {
  nameHe: "",
  nameEn: "",
  slug: "",
  sortOrder: "0",
  isActive: true,
};
