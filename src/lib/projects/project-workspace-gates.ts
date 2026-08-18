import type { IProject, IProjectReviewHistoryEntry } from "@/models/Project";
import {
  EDITABLE_PROJECT_STATUSES,
  type ProjectOnboardingStatus,
  type ProjectStatus,
} from "@/types/project";
import { hasEverBeenSubmitted } from "@/lib/projects/project-review-history";

export type ProjectGateInput = Pick<
  IProject,
  "status" | "onboardingStatus" | "onboardingApprovedAt"
> & {
  reviewHistory?: Array<Pick<IProjectReviewHistoryEntry, "action">>;
};

export function isLegacyProject(
  project: Pick<IProject, "onboardingStatus">,
): boolean {
  return project.onboardingStatus == null;
}

export function isProjectOnboardingActive(
  project: Pick<IProject, "onboardingStatus">,
): boolean {
  return project.onboardingStatus === "active";
}

export function isEditableCommercialStatus(status: ProjectStatus): boolean {
  return EDITABLE_PROJECT_STATUSES.includes(
    status as (typeof EDITABLE_PROJECT_STATUSES)[number],
  );
}

export const NEW_WORKFLOW_WORKSPACE_EDITABLE_STATUSES = [
  "draft",
  "changes_requested",
  "approved",
] as const satisfies readonly ProjectStatus[];

export function isNewWorkflowWorkspaceEditableStatus(
  status: ProjectStatus,
): boolean {
  return NEW_WORKFLOW_WORKSPACE_EDITABLE_STATUSES.includes(
    status as (typeof NEW_WORKFLOW_WORKSPACE_EDITABLE_STATUSES)[number],
  );
}

export function isArchitectWorkspaceEditable(
  project: ProjectGateInput,
): boolean {
  if (isLegacyProject(project)) {
    return isEditableCommercialStatus(project.status);
  }

  return (
    project.onboardingStatus === "active" &&
    isNewWorkflowWorkspaceEditableStatus(project.status)
  );
}

export function isProjectWorkspaceActive(project: ProjectGateInput): boolean {
  return isArchitectWorkspaceEditable(project);
}

export function isProjectItemEditable(project: ProjectGateInput): boolean {
  return isProjectWorkspaceActive(project);
}

export function isProjectMetadataEditable(project: ProjectGateInput): boolean {
  if (isLegacyProject(project)) {
    return isEditableCommercialStatus(project.status);
  }

  return (
    project.onboardingStatus === "pending_approval" ||
    project.onboardingStatus === "active" ||
    project.onboardingStatus === "rejected"
  );
}

export function isProjectOnboardingDeletable(project: ProjectGateInput): boolean {
  if (isLegacyProject(project)) {
    return project.status === "draft" && !hasEverBeenSubmitted({
      reviewHistory: project.reviewHistory ?? [],
    });
  }

  return (
    (project.onboardingStatus === "pending_approval" ||
      project.onboardingStatus === "rejected") &&
    project.onboardingApprovedAt == null
  );
}

export function isProjectReadOnlyForCommercialStatus(
  status: ProjectStatus,
): boolean {
  return !isEditableCommercialStatus(status);
}

export function isMessagingAvailable(project: ProjectGateInput): boolean {
  if (isLegacyProject(project)) {
    return hasEverBeenSubmitted({
      reviewHistory: project.reviewHistory ?? [],
    });
  }

  return project.onboardingStatus != null;
}

export function usesRoomBasedWorkspace(
  project: Pick<IProject, "onboardingStatus">,
): boolean {
  return !isLegacyProject(project);
}

export function usesLayeredPricing(
  project: Pick<IProject, "onboardingStatus">,
): boolean {
  return usesRoomBasedWorkspace(project);
}

export function isProjectRoomEditable(project: ProjectGateInput): boolean {
  return usesRoomBasedWorkspace(project) && isProjectItemEditable(project);
}

export function isProjectItemWorkspaceVisible(
  project: ProjectGateInput,
): boolean {
  if (isLegacyProject(project)) {
    return true;
  }

  return project.onboardingStatus === "active";
}

export function canResubmitOnboarding(
  project: Pick<IProject, "onboardingStatus">,
): boolean {
  return project.onboardingStatus === "rejected";
}

export function isOnboardingPending(
  project: Pick<IProject, "onboardingStatus">,
): boolean {
  return project.onboardingStatus === "pending_approval";
}

export function getOnboardingStatusOrNull(
  status?: ProjectOnboardingStatus | null,
): ProjectOnboardingStatus | null {
  return status ?? null;
}

export const ITEM_EDITABLE_STATUS_FILTER = {
  $in: [...EDITABLE_PROJECT_STATUSES],
} as const;

export const ADMIN_PRICING_STATUS_FILTER = {
  $nin: ["rejected"],
} as const;

export const ARCHITECT_WORKSPACE_EDITABLE_STATUS_FILTER = {
  $in: [...NEW_WORKFLOW_WORKSPACE_EDITABLE_STATUSES],
} as const;
