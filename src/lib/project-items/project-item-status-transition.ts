import type {
  ProjectItemStatus,
  ProjectItemStatusChangeRole,
  ProjectItemWorkflowSettingsView,
  ProjectItemWorkflowTransitionRole,
} from "@/types/project-item-status";
import { PROJECT_ITEM_STATUSES } from "@/types/project-item-status";
import { PROJECT_ITEM_STATUS_ERRORS } from "@/lib/project-items/project-item-workflow-validation";

export type ProjectItemStatusTransitionInput = {
  role: ProjectItemStatusChangeRole;
  from: ProjectItemStatus;
  to: ProjectItemStatus;
  settings: ProjectItemWorkflowSettingsView;
};

function getConfiguredTransition(
  settings: ProjectItemWorkflowSettingsView,
  from: ProjectItemStatus,
  to: ProjectItemStatus,
) {
  return settings.transitions.find(
    (transition) => transition.from === from && transition.to === to,
  );
}

export function canTransitionProjectItemStatus(
  input: ProjectItemStatusTransitionInput,
): boolean {
  if (input.from === input.to) {
    return false;
  }

  if (input.role === "admin") {
    return true;
  }

  const transition = getConfiguredTransition(input.settings, input.from, input.to);

  if (!transition) {
    return false;
  }

  const roleKey: ProjectItemWorkflowTransitionRole =
    input.role === "architect" ? "architect" : "client";

  return transition.allowedRoles.includes(roleKey);
}

export function getAllowedTargetStatusesForRole(
  role: ProjectItemStatusChangeRole,
  from: ProjectItemStatus,
  settings: ProjectItemWorkflowSettingsView,
): ProjectItemStatus[] {
  if (role === "admin") {
    return PROJECT_ITEM_STATUSES.filter((status) => status !== from);
  }

  const roleKey: ProjectItemWorkflowTransitionRole =
    role === "architect" ? "architect" : "client";

  return settings.transitions
    .filter(
      (transition) =>
        transition.from === from && transition.allowedRoles.includes(roleKey),
    )
    .map((transition) => transition.to);
}

export function assertProjectItemStatusTransition(
  input: ProjectItemStatusTransitionInput,
): void {
  if (input.from === input.to) {
    throw new Error(PROJECT_ITEM_STATUS_ERRORS.SAME_STATUS);
  }

  if (!canTransitionProjectItemStatus(input)) {
    throw new Error(PROJECT_ITEM_STATUS_ERRORS.TRANSITION_NOT_ALLOWED);
  }
}

export class ProjectItemStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectItemStatusError";
  }
}

export function assertProjectItemStatusTransitionOrThrow(
  input: ProjectItemStatusTransitionInput,
): void {
  try {
    assertProjectItemStatusTransition(input);
  } catch (error) {
    throw new ProjectItemStatusError(
      error instanceof Error
        ? error.message
        : PROJECT_ITEM_STATUS_ERRORS.TRANSITION_NOT_ALLOWED,
    );
  }
}
