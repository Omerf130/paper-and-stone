export type AdminSupplierListItem = {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  productCount: number;
  updatedAt: string;
};

export type AdminSupplierFormInput = {
  name: string;
  code: string;
  isActive: boolean;
};

export type SupplierFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export type SupplierOption = {
  id: string;
  name: string;
  isActive?: boolean;
};

export const EMPTY_SUPPLIER_FORM: AdminSupplierFormInput = {
  name: "",
  code: "",
  isActive: true,
};
