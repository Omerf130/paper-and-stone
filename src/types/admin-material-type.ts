export type AdminMaterialTypeFormInput = {
  key: string;
  labelEn: string;
};

export type MaterialTypeFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  createdKey?: string;
};
