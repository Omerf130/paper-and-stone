import type { IProject } from "@/models/Project";
import {
  EDITABLE_PROJECT_STATUSES,
  type ProjectStatus,
} from "@/types/project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { hasEverBeenSubmitted } from "@/lib/projects/project-review-history";

export function isEditableProjectStatus(status: ProjectStatus): boolean {
  return EDITABLE_PROJECT_STATUSES.includes(
    status as (typeof EDITABLE_PROJECT_STATUSES)[number],
  );
}

export function assertProjectEditable(project: IProject | null): IProject {
  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!isEditableProjectStatus(project.status)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  return project;
}

export function isProjectDeletable(
  project: Pick<IProject, "status" | "reviewHistory">,
): boolean {
  return project.status === "draft" && !hasEverBeenSubmitted(project);
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
  return !isEditableProjectStatus(status);
}

export const EDITABLE_STATUS_FILTER = {
  $in: [...EDITABLE_PROJECT_STATUSES],
} as const;
