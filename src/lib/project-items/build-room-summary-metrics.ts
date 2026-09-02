import { countProjectItemsByStatus } from "@/lib/project-items/project-item-workflow-attention";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import type { ProjectItemView } from "@/types/project";
import type { ProjectItemStatus } from "@/types/project-item-status";

const ROOM_SUMMARY_STATUSES: ProjectItemStatus[] = [
  "client_review",
  "client_approved",
  "internal_review",
];

export type RoomSummaryStatusSegment = {
  status: ProjectItemStatus;
  count: number;
  label: string;
  tone: "neutral" | "positive" | "warning" | "negative" | "info";
};

export function buildRoomSummaryStatusSegments(
  items: ProjectItemView[],
): RoomSummaryStatusSegment[] {
  const counts = countProjectItemsByStatus(items, ROOM_SUMMARY_STATUSES);
  const segments: RoomSummaryStatusSegment[] = [];

  for (const status of ROOM_SUMMARY_STATUSES) {
    const count = counts[status] ?? 0;

    if (count <= 0) {
      continue;
    }

    const presentation = getProjectItemStatusPresentation(status, "admin");

    segments.push({
      status,
      count,
      label: presentation.label,
      tone: presentation.tone,
    });
  }

  return segments;
}
