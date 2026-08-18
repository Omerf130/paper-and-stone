import type { ProjectOnboardingStatus, ProjectStatus } from "@/types/project";
import type { ProjectPricingAttention } from "@/lib/projects/admin-project-attention";

export type AdminProjectListItemView = {
  id: string;
  name: string;
  clientName?: string;
  assignedClientFullName?: string | null;
  clientUserId?: string | null;
  onboardingStatus?: ProjectOnboardingStatus | null;
  status: ProjectStatus;
  itemCount: number;
  roomCount: number;
  professionalEmail: string;
  professionalName?: string;
  submittedAt?: string;
  updatedAt: string;
  attentionReasons: string[];
  pricingAttention: ProjectPricingAttention;
  unreadMessageCount?: number;
  quoteStatusLabel?: string;
  quoteAttention?: "accepted" | "change_requested" | "awaiting_professional";
};

export type AdminProjectDetailView = {
  id: string;
  name: string;
  clientName?: string;
  assignedClientFullName?: string | null;
  clientUserId?: string | null;
  onboardingStatus?: ProjectOnboardingStatus | null;
  location?: string;
  description?: string;
  status: ProjectStatus;
  items: import("@/types/project").ProjectItemView[];
  usesRoomBasedWorkspace: boolean;
  rooms: import("@/types/project-room").ProjectRoomView[];
  reviewHistory: import("@/types/project").ProjectReviewHistoryEntry[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  professionalEmail: string;
  professionalName?: string;
  createdAt: string;
  updatedAt: string;
  attentionReasons: string[];
  pricingAttention: import("@/lib/projects/admin-project-attention").ProjectPricingAttention;
  pricingSettings?: import("@/types/project-pricing").ProjectPricingSettingsView;
  pricingTotals?: import("@/types/project-pricing").AdminPricingTotalsView;
  pricingApprovalBlockedReason?: string | null;
};

export type AdminProjectsPageResult = {
  projects: AdminProjectListItemView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "טיוטה",
  submitted: "נשלח",
  changes_requested: "נדרשים שינויים",
  approved: "מאושר",
  rejected: "נדחה",
};

export const ONBOARDING_STATUS_LABELS: Record<
  ProjectOnboardingStatus,
  string
> = {
  pending_approval: "ממתין לאישור",
  active: "פעיל",
  rejected: "נדחה",
};

export const PROJECT_REVIEW_ACTION_LABELS: Record<
  import("@/types/project").ProjectReviewAction,
  string
> = {
  submitted: "נשלח לבדיקה",
  resubmitted: "נשלח מחדש",
  approved: "אושר",
  rejected: "נדחה",
  changes_requested: "נדרשו שינויים",
  onboarding_created: "נוצר וממתין לאישור",
  onboarding_approved: "אושר לפתיחה",
  onboarding_rejected: "נדחה בפתיחה",
  onboarding_resubmitted: "נשלח מחדש לאישור פתיחה",
  onboarding_client_reassigned: "לקוח עודכן",
};
