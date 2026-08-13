import type { ProjectStatus } from "@/types/project";
import { getProjectStatusLabel } from "@/lib/projects/project-display-helpers";
import type { StatusBadgeTone } from "@/components/ui/StatusBadge/StatusBadge";

export function mapProjectStatusToBadge(status: ProjectStatus): {
  label: string;
  tone: StatusBadgeTone;
} {
  const label = getProjectStatusLabel(status);

  switch (status) {
    case "approved":
      return { label, tone: "positive" };
    case "rejected":
      return { label, tone: "negative" };
    case "changes_requested":
      return { label, tone: "warning" };
    case "submitted":
      return { label, tone: "info" };
    default:
      return { label, tone: "neutral" };
  }
}

export function mapEntityActiveToBadge(active: boolean): {
  label: string;
  tone: StatusBadgeTone;
} {
  return active
    ? { label: "פעיל", tone: "positive" }
    : { label: "לא פעיל", tone: "neutral" };
}

export function mapProductFeaturedToBadge(featured: boolean): {
  label: string;
  tone: StatusBadgeTone;
} {
  return featured
    ? { label: "מומלץ", tone: "positive" }
    : { label: "רגיל", tone: "neutral" };
}
