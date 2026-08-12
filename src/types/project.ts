export const PROJECT_REVIEW_ACTIONS = [
  "submitted",
  "resubmitted",
  "approved",
  "rejected",
  "changes_requested",
] as const;

export type ProjectReviewAction = (typeof PROJECT_REVIEW_ACTIONS)[number];

export type ProjectReviewActorRole = "professional" | "admin";

export type ProjectReviewHistoryEntry = {
  action: ProjectReviewAction;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  message?: string;
  actorUserId: string;
  actorRole: ProjectReviewActorRole;
  createdAt: string;
};

export const PROJECT_STATUSES = [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "rejected",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EDITABLE_PROJECT_STATUSES = ["draft", "changes_requested"] as const;

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
  submittedAt?: string;
  updatedAt: string;
  unreadMessageCount?: number;
};

export type ProjectDetailView = {
  id: string;
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  items: ProjectItemView[];
  reviewHistory: ProjectReviewHistoryEntry[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
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

export type AdminReviewActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};
