import type {
  ProjectItemView,
  ProjectReviewAction,
  ProjectStatus,
} from "@/types/project";
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

export type ProjectItemConfigurationRow = {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
  swatchHex?: string;
};

export function getProjectItemConfigurationRows(
  item: ProjectItemView,
): ProjectItemConfigurationRow[] {
  const rows: ProjectItemConfigurationRow[] = [];

  if (item.snapshot.materialName) {
    rows.push({ label: "חומר", value: item.snapshot.materialName });
  }

  if (item.snapshot.colorName) {
    rows.push({
      label: "צבע",
      value: item.snapshot.colorName,
      swatchHex: item.snapshot.colorHex,
    });
  }

  if (item.snapshot.sizeLabel) {
    rows.push({ label: "מידה", value: item.snapshot.sizeLabel });
  }

  rows.push({ label: "כמות", value: String(item.quantity) });

  if (item.snapshot.sku) {
    rows.push({ label: 'מק"ט', value: item.snapshot.sku, dir: "ltr" });
  } else if (item.snapshot.productSlug) {
    rows.push({
      label: "מזהה מוצר",
      value: item.snapshot.productSlug,
      dir: "ltr",
    });
  }

  return rows;
}

export function getReviewUnavailableCopy(status: ProjectStatus): string {
  switch (status) {
    case "approved":
      return "הפרויקט אושר. אין פעולות בדיקה זמינות.";
    case "rejected":
      return "הפרויקט נדחה. אין פעולות בדיקה זמינות.";
    case "changes_requested":
      return "נדרשים שינויים מהאיש מקצוע. הפרויקט יופיע לבדיקה מחדש לאחר שליחה.";
    case "draft":
      return "הפרויקט בטיוטה וטרם נשלח לבדיקה.";
    default:
      return "אין פעולות בדיקה זמינות.";
  }
}
