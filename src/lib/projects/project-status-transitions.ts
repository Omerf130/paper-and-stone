import type { ProjectStatus } from "@/types/project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";

export type ProjectActorRole = "professional" | "admin";

const PROFESSIONAL_TRANSITIONS: Array<[ProjectStatus, ProjectStatus]> = [
  ["draft", "submitted"],
  ["changes_requested", "submitted"],
];

const ADMIN_TRANSITIONS: Array<[ProjectStatus, ProjectStatus]> = [
  ["submitted", "approved"],
  ["submitted", "changes_requested"],
  ["submitted", "rejected"],
];

export function assertAllowedTransition(
  fromStatus: ProjectStatus,
  toStatus: ProjectStatus,
  actorRole: ProjectActorRole,
): void {
  const allowed =
    actorRole === "professional"
      ? PROFESSIONAL_TRANSITIONS
      : ADMIN_TRANSITIONS;

  const isAllowed = allowed.some(
    ([from, to]) => from === fromStatus && to === toStatus,
  );

  if (!isAllowed) {
    throw new ProjectMutationError(PROJECT_ERRORS.INVALID_TRANSITION);
  }
}

export function getSubmitAction(
  fromStatus: ProjectStatus,
): "submitted" | "resubmitted" {
  if (fromStatus === "draft") {
    return "submitted";
  }

  if (fromStatus === "changes_requested") {
    return "resubmitted";
  }

  throw new ProjectMutationError(PROJECT_ERRORS.INVALID_TRANSITION);
}

export function isSubmittableStatus(status: ProjectStatus): boolean {
  return status === "draft" || status === "changes_requested";
}
