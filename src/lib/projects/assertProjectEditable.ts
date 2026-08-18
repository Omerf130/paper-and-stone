import type { IProject } from "@/models/Project";
import {
  isEditableCommercialStatus,
  isProjectMetadataEditable,
  isProjectOnboardingDeletable,
  isProjectItemEditable,
  isProjectReadOnlyForCommercialStatus,
} from "@/lib/projects/project-workspace-gates";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { hasEverBeenSubmitted } from "@/lib/projects/project-review-history";
import type { ProjectStatus } from "@/types/project";

export function isEditableProjectStatus(status: ProjectStatus): boolean {
  return isEditableCommercialStatus(status);
}

export function assertProjectItemEditable(project: IProject | null): IProject {
  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!isProjectItemEditable(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  return project;
}

export function assertProjectMetadataEditable(
  project: IProject | null,
): IProject {
  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!isProjectMetadataEditable(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  return project;
}

/** @deprecated Use assertProjectItemEditable or assertProjectMetadataEditable */
export function assertProjectEditable(project: IProject | null): IProject {
  return assertProjectItemEditable(project);
}

export function isProjectDeletable(
  project: Pick<IProject, "status" | "reviewHistory" | "onboardingStatus" | "onboardingApprovedAt">,
): boolean {
  return isProjectOnboardingDeletable(project);
}

export function assertProjectDeletable(project: IProject | null): IProject {
  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!isProjectDeletable(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_DELETABLE);
  }

  return project;
}

export function isProjectReadOnly(status: ProjectStatus): boolean {
  return isProjectReadOnlyForCommercialStatus(status);
}

export const EDITABLE_STATUS_FILTER = {
  $in: ["draft", "changes_requested"],
} as const;

export { hasEverBeenSubmitted };
