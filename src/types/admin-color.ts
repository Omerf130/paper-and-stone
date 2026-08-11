export type AdminColorListItem = {
  id: string;
  nameHe: string;
  nameEn?: string;
  code?: string;
  hex: string;
  isActive: boolean;
  sortOrder: number;
  materialCount: number;
  updatedAt: string;
};

export type AdminColorFormInput = {
  nameHe: string;
  nameEn: string;
  code: string;
  hex: string;
  sortOrder: string;
  isActive: boolean;
};

export type ColorFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export const EMPTY_COLOR_FORM: AdminColorFormInput = {
  nameHe: "",
  nameEn: "",
  code: "",
  hex: "#163F35",
  sortOrder: "0",
  isActive: true,
};
