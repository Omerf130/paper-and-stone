import type { AdminProjectAttentionReason } from "@/lib/projects/admin-project-attention-labels";
import { ADMIN_PROJECT_ATTENTION_LABELS } from "@/lib/projects/admin-project-attention-labels";

export const COMMERCIAL_DIRTY_PRESENTATION = {
  listBadge: "השתנה מאז האישור",
  architectWorkspace: "יש שינויים שטרם נשלחו לבדיקה",
  adminWorkspace: "אושר בעבר · השתנה מאז",
} as const;

const ADMIN_ATTENTION_PRIORITY: AdminProjectAttentionReason[] = [
  "pending_onboarding",
  "commercial_review",
  "admin_pricing_incomplete",
  "pricing_ready_to_deliver",
  "stale_client_prices",
];

export function getAdminProjectPrimaryAttentionLabel(
  reasons: AdminProjectAttentionReason[],
): string | null {
  for (const reason of ADMIN_ATTENTION_PRIORITY) {
    if (reasons.includes(reason)) {
      return ADMIN_PROJECT_ATTENTION_LABELS[reason];
    }
  }

  return null;
}

export function getCommercialDirtyLabel(
  surface: keyof typeof COMMERCIAL_DIRTY_PRESENTATION,
): string {
  return COMMERCIAL_DIRTY_PRESENTATION[surface];
}

type ProjectListStatusPresentation = {
  primaryTone: "neutral" | "positive" | "warning" | "negative" | "info";
  primaryLabel: string;
  secondaryLabel?: string;
  secondaryTone?: "warning" | "neutral";
};

export function resolveProjectListStatusPresentation(input: {
  onboardingStatus?: "pending_approval" | "active" | "rejected" | null;
  status: string;
  commercialDirty?: boolean;
  attentionReasons?: string[];
}): ProjectListStatusPresentation {
  if (input.onboardingStatus === "pending_approval") {
    return {
      primaryTone: "warning",
      primaryLabel: "ממתין לאישור",
      secondaryLabel: input.attentionReasons?.[0],
      secondaryTone: input.attentionReasons?.[0] ? "warning" : undefined,
    };
  }

  if (input.onboardingStatus === "rejected") {
    return {
      primaryTone: "negative",
      primaryLabel: "נדחה",
    };
  }

  const commercialLabels: Record<
    string,
    { tone: ProjectListStatusPresentation["primaryTone"]; label: string }
  > = {
    submitted: { tone: "info", label: "ממתין לבדיקה" },
    changes_requested: { tone: "warning", label: "נדרשים שינויים" },
    approved: { tone: "positive", label: "מאושר" },
    rejected: { tone: "negative", label: "נדחה" },
    draft: { tone: "neutral", label: "טיוטה" },
  };

  const commercial = commercialLabels[input.status];

  if (commercial && input.status !== "draft") {
    return {
      primaryTone: commercial.tone,
      primaryLabel: commercial.label,
      secondaryLabel: input.commercialDirty
        ? getCommercialDirtyLabel("listBadge")
        : input.onboardingStatus === "active"
          ? "פעיל"
          : input.attentionReasons?.[0],
      secondaryTone:
        input.commercialDirty || input.attentionReasons?.[0]
          ? "warning"
          : input.onboardingStatus === "active"
            ? "neutral"
            : undefined,
    };
  }

  if (input.onboardingStatus === "active") {
    return {
      primaryTone: "positive",
      primaryLabel: "פעיל",
      secondaryLabel: input.attentionReasons?.[0],
      secondaryTone: input.attentionReasons?.[0] ? "warning" : undefined,
    };
  }

  return {
    primaryTone: commercial?.tone ?? "neutral",
    primaryLabel: commercial?.label ?? "—",
    secondaryLabel: input.attentionReasons?.[0],
    secondaryTone: input.attentionReasons?.[0] ? "warning" : undefined,
  };
}
