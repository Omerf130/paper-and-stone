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
  "unpriced_items",
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
