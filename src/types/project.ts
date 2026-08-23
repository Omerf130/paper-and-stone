export const ONBOARDING_REVIEW_ACTIONS = [
  "onboarding_created",
  "onboarding_approved",
  "onboarding_rejected",
  "onboarding_resubmitted",
  "onboarding_client_reassigned",
] as const;

export type OnboardingReviewAction =
  (typeof ONBOARDING_REVIEW_ACTIONS)[number];

export const PROJECT_REVIEW_ACTIONS = [
  "submitted",
  "resubmitted",
  "approved",
  "rejected",
  "changes_requested",
  "admin_pricing_delivered",
  ...ONBOARDING_REVIEW_ACTIONS,
] as const;

export type ProjectReviewAction = (typeof PROJECT_REVIEW_ACTIONS)[number];

export type ProjectReviewActorRole = "professional" | "admin";

export const PROJECT_ONBOARDING_STATUSES = [
  "pending_approval",
  "active",
  "rejected",
] as const;

export type ProjectOnboardingStatus =
  (typeof PROJECT_ONBOARDING_STATUSES)[number];

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
  roomId?: string | null;
  selectedMaterialId: string | null;
  selectedColorId: string | null;
  selectedSizeKey: string | null;
  quantity: number;
  snapshot: ProjectItemSnapshot;
  isProductActive: boolean;
  status?: import("@/types/project-item-status").ProjectItemStatus;
  statusPresentation?: import("@/types/project-item-status").ProjectItemStatusPresentation;
  allowedTargetStatuses?: import("@/types/project-item-status").ProjectItemStatus[];
  adminPricing?: import("@/types/project-pricing").AdminProjectItemPricingView;
  architectPricing?: import("@/types/project-pricing").ArchitectProjectItemPricingView;
};

export type ProjectListItemView = {
  id: string;
  name: string;
  clientName?: string;
  assignedClientFullName?: string | null;
  onboardingStatus?: ProjectOnboardingStatus | null;
  status: ProjectStatus;
  commercialDirty?: boolean;
  itemCount: number;
  submittedAt?: string;
  updatedAt: string;
  unreadMessageCount?: number;
  unreadClientMessageCount?: number;
};

export type ProjectDetailView = {
  id: string;
  name: string;
  clientName?: string;
  assignedClientFullName?: string | null;
  onboardingStatus?: ProjectOnboardingStatus | null;
  onboardingRejectionReason?: string | null;
  location?: string;
  description?: string;
  status: ProjectStatus;
  commercialDirty?: boolean;
  commercialDirtyAt?: string;
  items: ProjectItemView[];
  reviewHistory: ProjectReviewHistoryEntry[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  createdAt: string;
  updatedAt: string;
  isMetadataEditable: boolean;
  isItemWorkspaceVisible: boolean;
  isOnboardingDeletable: boolean;
  canResubmitOnboarding: boolean;
  usesRoomBasedWorkspace: boolean;
  isRoomEditable: boolean;
  rooms: import("@/types/project-room").ProjectRoomView[];
  selectedRoomId?: string | null;
  pricingSettings?: import("@/types/project-pricing").ArchitectProjectPricingSettingsView;
  pricingTotals?: import("@/types/project-pricing").ArchitectPricingTotalsView;
  adminPricingDelivery?: {
    hasUnseenDelivery: boolean;
    deliveredRevision: number;
  };
  pricingSubmitBlockedReason?: string | null;
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

export type ProjectCreateFormInput = {
  name: string;
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
  roomId?: string;
  selectedMaterialId?: string;
  selectedColorId?: string;
  selectedSizeKey?: string;
  quantity: number;
};

export type UpdateProjectItemInput = {
  projectId: string;
  itemId: string;
  roomId?: string;
  selectedMaterialId?: string;
  selectedColorId?: string;
  selectedSizeKey?: string;
  quantity: number;
};

export type MoveProjectItemInput = {
  projectId: string;
  itemId: string;
  targetRoomId: string;
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

export const ONBOARDING_STATUS_LABELS: Record<ProjectOnboardingStatus, string> =
  {
    pending_approval: "ממתין לאישור",
    active: "פעיל",
    rejected: "נדחה",
  };
