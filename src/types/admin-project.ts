import type { ProjectStatus } from "@/types/project";

export type AdminProjectListItemView = {
  id: string;
  name: string;
  clientName?: string;
  status: ProjectStatus;
  itemCount: number;
  professionalEmail: string;
  professionalName?: string;
  submittedAt?: string;
  updatedAt: string;
};

export type AdminProjectDetailView = {
  id: string;
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  items: import("@/types/project").ProjectItemView[];
  reviewHistory: import("@/types/project").ProjectReviewHistoryEntry[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  professionalEmail: string;
  professionalName?: string;
  createdAt: string;
  updatedAt: string;
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

export const PROJECT_REVIEW_ACTION_LABELS: Record<
  import("@/types/project").ProjectReviewAction,
  string
> = {
  submitted: "נשלח לבדיקה",
  resubmitted: "נשלח מחדש",
  approved: "אושר",
  rejected: "נדחה",
  changes_requested: "נדרשו שינויים",
};
