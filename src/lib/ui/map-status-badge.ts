import type { ProjectOnboardingStatus, ProjectStatus } from "@/types/project";
import { ONBOARDING_STATUS_LABELS } from "@/types/project";
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

export function mapOnboardingStatusToBadge(
  status: ProjectOnboardingStatus,
): {
  label: string;
  tone: StatusBadgeTone;
} {
  const label = ONBOARDING_STATUS_LABELS[status];

  switch (status) {
    case "active":
      return { label, tone: "positive" };
    case "rejected":
      return { label, tone: "negative" };
    case "pending_approval":
    default:
      return { label, tone: "warning" };
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
