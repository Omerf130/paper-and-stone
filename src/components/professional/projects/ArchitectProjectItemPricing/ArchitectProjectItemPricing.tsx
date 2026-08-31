"use client";

import type { ArchitectProjectItemPricingView } from "@/types/project-pricing";
import styles from "./ArchitectProjectItemPricing.module.scss";

type ArchitectProjectItemPricingProps = {
  projectId: string;
  itemId: string;
  pricing: ArchitectProjectItemPricingView;
  isEditable: boolean;
};

function getPricingStatusMessage(
  pricingStatus: ArchitectProjectItemPricingView["pricingStatus"],
): string {
  switch (pricingStatus) {
    case "unpriced":
      return "ממתין לתמחור מנהל";
    case "needs_review":
      return "התמחור דורש בדיקת מנהל";
    case "priced":
      return "";
  }
}

export default function ArchitectProjectItemPricing({
  pricing,
}: ArchitectProjectItemPricingProps) {
  const pricingStatusMessage = getPricingStatusMessage(pricing.pricingStatus);

  if (pricing.pricingStatus !== "priced") {
    return (
      <p className={styles.unavailable} role="status">
        {pricingStatusMessage}
      </p>
    );
  }

  return (
    <div className={styles.pricingReadOnly}>
      <dl className={styles.summary}>
        <div className={styles.summaryItem}>
          <dt>מחיר ללקוח</dt>
          <dd dir="ltr">{pricing.clientPriceFormatted}</dd>
        </div>
        <div className={styles.summaryItem}>
          <dt>רווח אדריכל</dt>
          <dd dir="ltr">{pricing.architectProfitFormatted}</dd>
        </div>
      </dl>
    </div>
  );
}
