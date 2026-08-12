import type { ProjectItemView } from "@/types/project";

const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "טיוטה",
  submitted: "נשלח",
  changes_requested: "נדרשים שינויים",
  approved: "מאושר",
  rejected: "נדחה",
};

export function getProjectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
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
