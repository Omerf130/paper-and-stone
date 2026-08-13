import type { RecolorStatus } from "@/types/product-recolor";
import type { StatusBadgeTone } from "@/components/ui/StatusBadge/StatusBadge";

export type RecolorStatusPresentation = {
  message: string;
  tone: StatusBadgeTone;
};

const RECOLOR_STATUS_PRESENTATION: Record<RecolorStatus, RecolorStatusPresentation> =
  {
    missing_primary: {
      message: "נדרשת תמונה ראשית לפני הגדרת צביעה אוטומטית.",
      tone: "info",
    },
    missing_mask: {
      message: "יש ליצור או להעלות מסכת צביעה.",
      tone: "warning",
    },
    invalid_source: {
      message:
        "התמונה הראשית השתנתה — יש ליצור מסכה חדשה התואמת לתמונה הנוכחית.",
      tone: "warning",
    },
    ready: {
      message: "הצביעה האוטומטית מוכנה להפעלה.",
      tone: "positive",
    },
  };

export function mapRecolorStatusPresentation(
  status: RecolorStatus | string,
): RecolorStatusPresentation {
  if (status in RECOLOR_STATUS_PRESENTATION) {
    return RECOLOR_STATUS_PRESENTATION[status as RecolorStatus];
  }

  return {
    message: "לא ניתן להציג את סטטוס הצביעה.",
    tone: "neutral",
  };
}

export function mapRecolorStatusToFeedbackTone(
  status: RecolorStatus,
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "missing_primary":
      return "info";
    case "missing_mask":
    case "invalid_source":
      return "warning";
    case "ready":
      return "success";
    default:
      return "info";
  }
}
