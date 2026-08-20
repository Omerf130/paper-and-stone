export type AdminProjectAttentionReason =
  | "pending_onboarding"
  | "commercial_review"
  | "unpriced_items"
  | "stale_client_prices";

export const ADMIN_PROJECT_ATTENTION_LABELS: Record<
  AdminProjectAttentionReason,
  string
> = {
  pending_onboarding: "ממתין לאישור פתיחה",
  commercial_review: "ממתין לבדיקה מסחרית",
  unpriced_items: "מוצרים שטרם תומחרו",
  stale_client_prices: "מחירי לקוח דורשים בדיקה",
};
