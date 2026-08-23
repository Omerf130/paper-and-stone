import type { StatusBadgeTone } from "@/components/ui/StatusBadge/StatusBadge";
import type { ClientApprovedProjectView } from "@/types/client-approved-project";

export type ClientProjectPresentationState = {
  label: string;
  tone: StatusBadgeTone;
  supportingText?: string;
  isUpdating: boolean;
};

export type ClientProjectListItemView = {
  projectId: string;
  projectName: string;
  presentationState: ClientProjectPresentationState;
  architectFullName: string;
  hasApprovedSnapshot: boolean;
  approvedAt?: string;
  roomCount?: number;
  productCount?: number;
  clientProjectTotalAgorot?: number;
  unreadMessageCount?: number;
  pendingReviewCount?: number;
};

export type ClientProjectNoSnapshotDetailView = {
  kind: "no-snapshot";
  projectId: string;
  projectName: string;
  architectFullName: string;
  presentationState: ClientProjectPresentationState;
};

export type ClientProjectApprovedDetailView = {
  kind: "approved";
  projectId: string;
  presentationState: ClientProjectPresentationState;
  snapshot: ClientApprovedProjectView;
  roomCount: number;
  productCount: number;
  workflowByItemId: Record<string, ClientProjectItemWorkflowStatusView>;
  pendingReviewCount: number;
};

export type ClientProjectSnapshotUnavailableDetailView = {
  kind: "snapshot-unavailable";
  projectId: string;
  projectName: string;
  architectFullName: string;
  presentationState: ClientProjectPresentationState;
};

export type ClientProjectDetailView =
  | ClientProjectNoSnapshotDetailView
  | ClientProjectApprovedDetailView
  | ClientProjectSnapshotUnavailableDetailView;

export type ClientDashboardData = {
  displayName: string;
  recentProjects: ClientProjectListItemView[];
  totalProjectCount: number;
  approvedSnapshotCount: number;
};

export type ClientProjectsPageResult = {
  projects: ClientProjectListItemView[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ClientAssignedProjectMetadata = {
  projectId: string;
  projectName: string;
  ownerUserId: string;
  status: string;
  commercialDirty: boolean;
  submissionRevision: number;
  updatedAt: string;
};

export type ClientProjectItemWorkflowStatusView = {
  projectItemId: string;
  status: import("@/types/project-item-status").ProjectItemStatus;
  allowedTargetStatuses: import("@/types/project-item-status").ProjectItemStatus[];
  presentation: import("@/types/project-item-status").ProjectItemStatusPresentation;
};

export type ClientWorkspaceContext = {
  displayName: string;
  hasArchitectRequest: boolean;
};
