export type AdminProjectAttentionReason =
  | "pending_onboarding"
  | "commercial_review"
  | "admin_pricing_incomplete"
  | "pricing_ready_to_deliver"
  | "stale_client_prices"
  | "product_workflow_attention"
  /** @deprecated retained for migration reads only */
  | "unpriced_items";

export const ADMIN_PROJECT_ATTENTION_LABELS: Record<
  AdminProjectAttentionReason,
  string
> = {
  pending_onboarding: "ממתין לאישור פתיחה",
  commercial_review: "ממתין לבדיקה מסחרית",
  admin_pricing_incomplete: "מוצרים ממתינים לתמחור",
  pricing_ready_to_deliver: "תמחור מוכן לשליחה",
  stale_client_prices: "מחירי לקוח דורשים בדיקה",
  product_workflow_attention: "מוצרים דורשים טיפול תפעולי",
  unpriced_items: "מוצרים שטרם תומחרו",
};
