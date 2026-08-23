export const PROJECT_ITEM_STATUSES = [
  "draft",
  "hidden",
  "quoting",
  "selected",
  "internal_review",
  "client_review",
  "client_approved",
  "client_rejected",
  "resubmit",
] as const;

export type ProjectItemStatus = (typeof PROJECT_ITEM_STATUSES)[number];

export const PROJECT_ITEM_STATUS_CHANGE_ROLES = [
  "admin",
  "architect",
  "client",
] as const;

export type ProjectItemStatusChangeRole =
  (typeof PROJECT_ITEM_STATUS_CHANGE_ROLES)[number];

export type ProjectItemStatusHistoryEntry = {
  from: ProjectItemStatus;
  to: ProjectItemStatus;
  changedByUserId: string;
  changedByRole: ProjectItemStatusChangeRole;
  changedAt: string;
};

export type ProjectItemStatusPresentation = {
  label: string;
  tone: "neutral" | "positive" | "warning" | "negative" | "info";
  description?: string;
};

export type ProjectItemWorkflowTransitionRole = "architect" | "client";

export type ProjectItemWorkflowTransition = {
  from: ProjectItemStatus;
  to: ProjectItemStatus;
  allowedRoles: ProjectItemWorkflowTransitionRole[];
};

export type ProjectItemWorkflowSettingsView = {
  transitions: ProjectItemWorkflowTransition[];
};
