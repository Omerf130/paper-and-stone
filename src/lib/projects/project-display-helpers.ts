import type { ProjectItemView } from "@/types/project";

import type { ProjectStatus, ProjectReviewAction } from "@/types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_REVIEW_ACTION_LABELS,
} from "@/types/admin-project";

export function getProjectStatusLabel(status: ProjectStatus | string): string {
  return PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status;
}

export function getProjectReviewActionLabel(action: ProjectReviewAction): string {
  return PROJECT_REVIEW_ACTION_LABELS[action] ?? action;
}

export function formatProjectItemSummary(
  item: Pick<ProjectItemView, "snapshot" | "quantity">,
): string {
  const parts: string[] = [];

  if (item.snapshot.materialName) {
    parts.push(item.snapshot.materialName);
  }
  if (item.snapshot.colorName) {
    parts.push(item.snapshot.colorName);
  }
  if (item.snapshot.sizeLabel) {
    parts.push(item.snapshot.sizeLabel);
  }

  parts.push(`כמות: ${item.quantity}`);

  return parts.join(" · ");
}
