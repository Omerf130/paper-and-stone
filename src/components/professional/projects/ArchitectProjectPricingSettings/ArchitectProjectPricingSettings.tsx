"use client";

import type { ProjectPricingSettingsView } from "@/types/project-pricing";
import styles from "./ArchitectProjectPricingSettings.module.scss";

type ArchitectProjectPricingSettingsProps = {
  projectId: string;
  settings: ProjectPricingSettingsView;
};

export default function ArchitectProjectPricingSettings({
  settings,
}: ArchitectProjectPricingSettingsProps) {
  if (!settings.usesLayeredPricing) {
    return null;
  }

  return (
    <section
      className={styles.settings}
      aria-labelledby="architect-pricing-settings-title"
    >
      <h3 id="architect-pricing-settings-title" className={styles.title}>
        תמחור פרויקט
      </h3>
      <p className={styles.description}>
        התמחור המסחרי נקבע על ידי צוות Paper & Stone. לאחר אישור התמחור תוצג
        תצוגת מחירים ללקוח.
      </p>
      {settings.adminPricingUnavailableReason ? (
        <p className={styles.notice} role="status">
          {settings.adminPricingUnavailableReason}
        </p>
      ) : null}
    </section>
  );
}
