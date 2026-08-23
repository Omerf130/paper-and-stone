import type { StatusBadgeTone } from "@/components/ui/StatusBadge/StatusBadge";
import {
  PROJECT_ITEM_STATUSES,
  type ProjectItemStatus,
  type ProjectItemStatusPresentation,
} from "@/types/project-item-status";

export type ProjectItemStatusPresentationRole =
  | "admin"
  | "architect"
  | "client";

type StatusPresentationConfig = {
  adminLabel: string;
  architectLabel: string;
  clientLabel: string | null;
  tone: StatusBadgeTone;
  description?: string;
};

const STATUS_PRESENTATION: Record<ProjectItemStatus, StatusPresentationConfig> =
  {
    draft: {
      adminLabel: "טיוטה",
      architectLabel: "טיוטה",
      clientLabel: null,
      tone: "neutral",
    },
    hidden: {
      adminLabel: "מוסתר",
      architectLabel: "מוסתר",
      clientLabel: null,
      tone: "neutral",
      description:
        "סטטוס תפעולי פנימי — אינו מחליף את נראות הלקוח המבוססת על גרסה מאושרת.",
    },
    quoting: {
      adminLabel: "בתמחור",
      architectLabel: "בתמחור",
      clientLabel: null,
      tone: "warning",
    },
    selected: {
      adminLabel: "נבחר",
      architectLabel: "נבחר",
      clientLabel: null,
      tone: "info",
    },
    internal_review: {
      adminLabel: "בדיקה פנימית",
      architectLabel: "בדיקה פנימית",
      clientLabel: "בתהליך",
      tone: "info",
    },
    client_review: {
      adminLabel: "ממתין לאישור לקוח",
      architectLabel: "ממתין לאישור לקוח",
      clientLabel: "ממתין לאישור שלך",
      tone: "warning",
    },
    client_approved: {
      adminLabel: "אושר על ידי הלקוח",
      architectLabel: "אושר על ידי הלקוח",
      clientLabel: "אושר",
      tone: "positive",
    },
    client_rejected: {
      adminLabel: "נדחה על ידי הלקוח",
      architectLabel: "נדחה על ידי הלקוח",
      clientLabel: "נדחה",
      tone: "negative",
    },
    resubmit: {
      adminLabel: "נדרש להגשה מחדש",
      architectLabel: "נדרש להגשה מחדש",
      clientLabel: null,
      tone: "warning",
    },
  };

export function isKnownProjectItemStatus(
  value: string,
): value is ProjectItemStatus {
  return PROJECT_ITEM_STATUSES.includes(value as ProjectItemStatus);
}

export function getProjectItemStatusPresentation(
  status: ProjectItemStatus,
  role: ProjectItemStatusPresentationRole = "admin",
): ProjectItemStatusPresentation {
  const config = STATUS_PRESENTATION[status];

  if (role === "client") {
    if (config.clientLabel == null) {
      return {
        label: "בתהליך",
        tone: "neutral",
      };
    }

    return {
      label: config.clientLabel,
      tone: config.tone,
      description: config.description,
    };
  }

  const label =
    role === "architect" ? config.architectLabel : config.adminLabel;

  return {
    label,
    tone: config.tone,
    description: config.description,
  };
}

export function getAllProjectItemStatusOptions(
  role: ProjectItemStatusPresentationRole = "admin",
): Array<{ value: ProjectItemStatus; presentation: ProjectItemStatusPresentation }> {
  return PROJECT_ITEM_STATUSES.map((status) => ({
    value: status,
    presentation: getProjectItemStatusPresentation(status, role),
  }));
}
