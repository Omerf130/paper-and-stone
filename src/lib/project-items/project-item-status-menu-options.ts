import {
  getAllProjectItemStatusOptions,
  getProjectItemStatusPresentation,
  type ProjectItemStatusPresentationRole,
} from "@/lib/project-items/project-item-status-presentation";
import type { ProjectItemStatus } from "@/types/project-item-status";

export type ProjectItemStatusMenuOption = {
  value: ProjectItemStatus;
  presentation: ReturnType<typeof getProjectItemStatusPresentation>;
  isCurrent?: boolean;
};

export function getAdminStatusMenuOptions(
  currentStatus: ProjectItemStatus,
  role: ProjectItemStatusPresentationRole = "admin",
): ProjectItemStatusMenuOption[] {
  return getAllProjectItemStatusOptions(role).map((option) => ({
    ...option,
    isCurrent: option.value === currentStatus,
  }));
}

export function getArchitectStatusMenuOptions(
  allowedTargetStatuses: ProjectItemStatus[],
  role: ProjectItemStatusPresentationRole = "architect",
): ProjectItemStatusMenuOption[] {
  return allowedTargetStatuses.map((value) => ({
    value,
    presentation: getProjectItemStatusPresentation(value, role),
    isCurrent: false,
  }));
}
