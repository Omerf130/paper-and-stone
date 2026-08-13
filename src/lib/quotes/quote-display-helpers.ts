import type { ProjectQuoteStatus } from "@/types/project-quote";

const PROJECT_QUOTE_STATUS_LABELS: Record<ProjectQuoteStatus, string> = {
  draft: "טיוטה",
  sent: "נשלחה",
  change_requested: "בקשת שינוי",
  accepted: "אושרה",
  superseded: "הוחלפה",
};

export function getProjectQuoteStatusLabel(status: ProjectQuoteStatus): string {
  return PROJECT_QUOTE_STATUS_LABELS[status] ?? status;
}

export function getProfessionalQuoteActionHint(
  status: ProjectQuoteStatus | undefined,
): string | null {
  switch (status) {
    case "sent":
      return "הצעת מחיר ממתינה לתגובתך";
    case "change_requested":
      return "בקשת שינוי תמחור נשלחה — ממתין להצעה מעודכנת";
    case "accepted":
      return "הצעת המחיר אושרה — ממתין לאישור סופי של הפרויקט";
    default:
      return null;
  }
}

export function getAdminQuoteApprovalBlockedReason(input: {
  quoteEverSent: boolean;
  currentQuoteStatus?: ProjectQuoteStatus;
  projectStatus: string;
}): string | undefined {
  if (input.projectStatus !== "submitted") {
    return undefined;
  }

  if (!input.quoteEverSent) {
    return undefined;
  }

  if (input.currentQuoteStatus !== "accepted") {
    return "לא ניתן לאשר את הפרויקט לפני שהצעת המחיר הנוכחית אושרה על ידי איש המקצוע.";
  }

  return undefined;
}
