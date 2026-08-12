export const PROJECT_STATUSES = [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "rejected",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type ProjectItemSnapshot = {
  productName: string;
  productSlug: string;
  sku?: string;
  materialName?: string;
  colorName?: string;
  colorHex?: string;
  sizeLabel?: string;
};

export type ProjectItemView = {
  id: string;
  productId: string;
  selectedMaterialId: string | null;
  selectedColorId: string | null;
  selectedSizeKey: string | null;
  quantity: number;
  snapshot: ProjectItemSnapshot;
  isProductActive: boolean;
};

export type ProjectListItemView = {
  id: string;
  name: string;
  clientName?: string;
  status: ProjectStatus;
  itemCount: number;
  updatedAt: string;
};

export type ProjectDetailView = {
  id: string;
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  items: ProjectItemView[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectOptionView = {
  id: string;
  name: string;
};

export type ProjectFormInput = {
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
};

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export type AddToProjectInput = {
  projectId: string;
  productSlug: string;
  selectedMaterialId?: string;
  selectedColorId?: string;
  selectedSizeKey?: string;
  quantity: number;
};

export type UpdateProjectItemInput = {
  projectId: string;
  itemId: string;
  selectedMaterialId?: string;
  selectedColorId?: string;
  selectedSizeKey?: string;
  quantity: number;
};

export type AddToProjectState = {
  error?: string;
  success?: boolean;
};
