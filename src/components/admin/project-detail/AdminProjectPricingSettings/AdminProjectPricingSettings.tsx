"use client";

import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./AdminProjectPricingSettings.module.scss";

type AdminProjectPricingSettingsProps = {
  projectId: string;
  settings: ProjectPricingSettingsView;
};

export default function AdminProjectPricingSettings({
  settings,
}: AdminProjectPricingSettingsProps) {
  if (!settings.usesLayeredPricing) {
    return null;
  }

  return (
    <section className={styles.settings} aria-labelledby="admin-pricing-settings-title">
      <h3 id="admin-pricing-settings-title" className={styles.title}>
        תמחור מסחרי
      </h3>
      <p className={styles.description}>
        הגדר מחיר מוצר, מחיר סופי ללקוח ומרקאפ אדריכל לכל מוצר.
      </p>
      {!settings.isAdminPricingEditable && settings.adminPricingUnavailableReason ? (
        <p className={styles.notice} role="status">
          {settings.adminPricingUnavailableReason}
        </p>
      ) : null}
    </section>
  );
}
