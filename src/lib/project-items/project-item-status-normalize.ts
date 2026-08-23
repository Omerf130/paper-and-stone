import type { IProjectItem } from "@/models/Project";
import {
  PROJECT_ITEM_STATUSES,
  type ProjectItemStatus,
} from "@/types/project-item-status";

export function normalizeProjectItemStatus(
  status: ProjectItemStatus | undefined | null,
): ProjectItemStatus {
  if (status && PROJECT_ITEM_STATUSES.includes(status)) {
    return status;
  }

  return "draft";
}

export function getNormalizedProjectItemStatus(
  item: Pick<IProjectItem, "status">,
): ProjectItemStatus {
  return normalizeProjectItemStatus(item.status);
}
